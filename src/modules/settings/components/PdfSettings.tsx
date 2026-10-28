import { useEffect, useRef, useState } from "react";
import { Download, FileText, Check } from "lucide-react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { Loading } from "../../../shared/components/loading";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { fetchPdf, savePdf } from "../../../shared/services/pdf-download";
import { useMessageStore } from "../../../shared/store/message.store";
import { SettingsService } from "../services/settings.service";
import { useSettings } from "../hooks/settings-context";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { SettingsField, SaveError } from "./SettingsField";
import { exampleFilename, filenamePatternError, filenameTokens, pdfTemplates } from "../types/pdf-settings.types";
import type { DocumentKind, PdfPreferences, PdfTemplate } from "../types/pdf-settings.types";

export function PdfSettings() {
  const resource = useAsyncResource("pdf-settings", SettingsService.pdfPreferences);
  if (resource.error) return <RequestError message={resource.error} onRetry={resource.refresh} />;
  if (!resource.data) return <Loading message="Carregando preferências de PDF…" />;
  return <PdfSettingsEditor initial={resource.data} />;
}

function TemplateThumbnail({ template }: { template: PdfTemplate }) {
  const modern = template === "MODERN";
  const compact = template === "COMPACT";
  return <div aria-hidden="true" className={`mx-auto mb-4 h-36 w-full max-w-48 overflow-hidden rounded-md bg-white p-3 shadow-lg ${modern ? "border-l-4 border-blue-500" : "border-t-4 border-slate-800"}`}>
    <div className={`mb-3 flex gap-2 ${modern ? "flex-col rounded bg-slate-800 p-2" : "justify-between"}`}>
      <div className={`h-2 w-14 rounded ${modern ? "bg-white" : "bg-slate-700"}`} />
      <div className={`h-1.5 w-9 rounded ${modern ? "bg-slate-400" : "bg-slate-300"}`} />
    </div>
    <div className={`mb-2 h-2 rounded ${modern ? "w-24 bg-blue-500" : "w-20 bg-slate-500"}`} />
    <div className={`mb-2 grid gap-1 ${compact ? "grid-cols-4" : "grid-cols-2"}`}>{Array.from({ length: 4 }, (_, i) => <div key={i} className={`${compact ? "h-2" : "h-3"} rounded-sm bg-slate-100`} />)}</div>
    <div className={`h-2 ${modern ? "bg-blue-500" : "bg-slate-700"}`} />
    {[0, 1, 2].map(i => <div key={i} className={`${compact ? "h-1.5" : "h-2"} border-b border-slate-200 bg-slate-50`} />)}
    <div className={`ml-auto mt-2 h-2 w-16 rounded ${modern ? "bg-blue-500" : "bg-slate-300"}`} />
  </div>;
}

function PdfSettingsEditor({ initial }: { initial: PdfPreferences }) {
  const { isAdmin } = useSettings();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [kind, setKind] = useState<DocumentKind>("work_order");
  const { busy, error, run } = useSettingsMutation();
  const showMessage = useMessageStore(state => state.showMessage);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const value = form[kind];
  const patternError = filenamePatternError(value.filename_pattern);
  const invalid = Object.values(form).some(item => filenamePatternError(item.filename_pattern));
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const change = (patch: Partial<typeof value>) => setForm(current => ({ ...current, [kind]: { ...current[kind], ...patch } }));

  async function preview() {
    await run(async () => {
      const controller = new AbortController(); request.current = controller;
      try { return await fetchPdf(`/organizations/me/pdf-preview/${kind}`, controller.signal, value); }
      finally { request.current = null; }
    }, pdf => savePdf(pdf.blob, pdf.filename ?? "previa.pdf"));
  }

  return <form className="min-w-0 space-y-6" onSubmit={event => {
    event.preventDefault();
    if (!isAdmin || invalid || !dirty) return;
    void run(() => SettingsService.updatePdfPreferences(form), result => {
      setForm(result); setSaved(result); showMessage("Preferências de PDF salvas.", "success");
    });
  }}>
    <header className="flex items-start gap-3">
      <FileText aria-hidden="true" className="mt-1 shrink-0 text-blue-400" />
      <div><h2 className="text-xl font-semibold text-slate-50">Documentos PDF</h2><p className="mt-1 text-sm leading-6 text-slate-400">Escolha o modelo e o nome dos arquivos da sua organização. As preferências serão usadas nas próximas exportações.</p></div>
    </header>
    {!isAdmin && <p className="rounded-xl border border-amber-400/25 p-4 text-sm text-amber-100">Somente administradores podem alterar estas preferências. Você pode consultar e baixar uma prévia.</p>}
    <div role="group" aria-label="Tipo de documento" className="grid grid-cols-2 gap-2 rounded-xl bg-[#010b1b]/60 p-1">
      {([['work_order', 'Ordens de serviço'], ['quote', 'Orçamentos']] as const).map(([key, label]) => <button key={key} type="button" disabled={busy} aria-pressed={kind === key} onClick={() => setKind(key)} className={`min-h-12 rounded-lg px-3 py-2 text-sm font-medium ${kind === key ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-[#0a2242]"}`}>{label}</button>)}
    </div>
    <fieldset disabled={busy || !isAdmin} className="min-w-0">
      <legend className="mb-3 text-sm font-medium text-slate-200">Modelo do documento</legend>
      <div className="grid min-w-0 gap-3 xl:grid-cols-3">
        {pdfTemplates.map(template => <label key={template.value} className={`relative min-w-0 cursor-pointer rounded-2xl border p-4 transition-colors ${value.template === template.value ? "border-blue-400 bg-blue-500/10" : "border-[#16345c] bg-[#051020]/70 hover:border-blue-400/50"}`}>
          <div className="mb-3 flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm font-semibold text-white"><input type="radio" aria-label={template.name} name={`template-${kind}`} value={template.value} checked={value.template === template.value} onChange={() => change({ template: template.value })} className="size-4 accent-blue-500" />{template.name}</span>{value.template === template.value && <Check size={16} className="text-blue-400" aria-hidden="true" />}</div>
          <TemplateThumbnail template={template.value} />
          <p className="text-xs leading-5 text-slate-400">{template.description}</p>
        </label>)}
      </div>
    </fieldset>
    <section className="min-w-0 space-y-4 rounded-2xl border border-[#16345c] bg-[#051020]/70 p-4 sm:p-5">
      <SettingsField label="Padrão do nome do arquivo" value={value.filename_pattern} disabled={busy || !isAdmin} maxLength={120} required aria-invalid={!!patternError} aria-describedby="pdf-filename-help pdf-filename-example" onChange={event => change({ filename_pattern: event.target.value })} />
      <p id="pdf-filename-help" className="text-xs leading-5 text-slate-400">Use texto e as variáveis abaixo. A extensão .pdf é adicionada automaticamente. Acentos e espaços são normalizados. A data corresponde à emissão, no horário de Brasília.</p>
      <div className="flex flex-wrap gap-2">{filenameTokens.map(token => <button key={token} type="button" disabled={busy || !isAdmin} onClick={() => change({ filename_pattern: value.filename_pattern + `{${token}}` })} className="min-h-10 rounded-lg border border-[#24436b] bg-[#0a2242]/60 px-3 text-xs text-blue-200 disabled:opacity-50">{`{${token}}`}</button>)}</div>
      {patternError ? <p role="alert" className="text-sm text-red-300">{patternError}</p> : <p id="pdf-filename-example" className="break-all rounded-lg bg-[#010b1b]/70 p-3 text-sm text-slate-300"><span className="mb-1 block text-xs text-slate-500">Exemplo ilustrativo</span>{exampleFilename(value.filename_pattern, kind)}</p>}
      <p className="text-xs leading-5 text-slate-400">Inclua {'{numero}'} para distinguir documentos. PDFs de OS com fotos recebem o sufixo “-com-fotos”.</p>
    </section>
    <SaveError message={error} />
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <button type="button" disabled={busy || !!patternError} className={secondaryButtonClass} onClick={() => void preview()}><Download size={17} />Baixar prévia</button>
      {isAdmin && <button type="submit" disabled={busy || !!invalid || !dirty} className={primaryButtonClass}>{busy ? "Processando…" : "Salvar preferências"}</button>}
    </div>
    <p className="text-xs leading-5 text-slate-400">A prévia usa dados ilustrativos e a seleção atual, sem salvar. Salvar aplica as preferências dos dois tipos de documento para toda a organização. Arquivos já baixados permanecem iguais.{dirty && <span className="mt-2 block text-amber-300">Há alterações não salvas.</span>}</p>
  </form>;
}
