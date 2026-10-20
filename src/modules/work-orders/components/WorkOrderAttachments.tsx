import { useCallback, useEffect, useRef, useState, type ClipboardEvent } from "react";
import axios from "axios";
import { Camera, Download, FileText, ImageIcon, Paperclip, Trash2, Upload } from "lucide-react";
import { Modal } from "../../../shared/components/modal";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { getSession, isCurrentSession, subscribeToSession } from "../../../shared/services/session";
import { formatDateTime } from "../../../shared/utils/format";
import { AttachmentService, type Attachment, type AttachmentList } from "../services/attachment.service";

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#24436b] px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/10 disabled:opacity-50";
const accept = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
const sizeLabel = (bytes: number) => bytes === 0 ? "0 KB" : bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
const message = (error: unknown) => error instanceof Error && !axios.isAxiosError(error) ? error.message : "Falha de conexão. Tente novamente.";

export function WorkOrderAttachments({ orderId }: { orderId: number }) {
  const load = useCallback((signal: AbortSignal) => AttachmentService.list(orderId, signal), [orderId]);
  const resource = useAsyncResource(`attachments:${orderId}`, load);
  return <section aria-label="Fotos e anexos" id="anexos" className="my-6 scroll-mt-24 min-w-0 rounded-2xl border border-[#16345c] bg-[#07182d] p-4 sm:p-6">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><Paperclip size={22} className="shrink-0 text-blue-400" />Fotos e anexos</h2>
      <button className={buttonClass} disabled={resource.isLoading} onClick={resource.refresh}>Atualizar anexos</button>
    </div>
    <p className="mb-5 text-sm text-slate-400">Registre fotos do serviço e guarde documentos desta ordem. Acesso exclusivo da sua organização.</p>
    {resource.error && <RequestError message={resource.error} onRetry={resource.refresh} />}
    {resource.isLoading && <p role="status" className="mb-4 text-sm text-slate-400">Carregando anexos…</p>}
    {resource.data && <AttachmentContent orderId={orderId} data={resource.data} onChanged={resource.refresh} />}
  </section>;
}

type QueuedFile = { id: string; file: File; state: "pending" | "sending" | "sent" | "error"; progress: number; error?: string };

function AttachmentContent({ orderId, data, onChanged }: { orderId: number; data: AttachmentList; onChanged: () => void }) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState<Attachment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => getSession().id);
  const active = useRef<AbortController | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const unsubscribe = subscribeToSession(() => active.current?.abort());
    return () => { active.current?.abort(); unsubscribe(); };
  }, []);

  function selectFiles(files: FileList | readonly File[] | null): boolean {
    if (!files?.length || active.current || !isCurrentSession(sessionId)) return false;
    const previous = queue.filter(item => item.state !== "sent");
    const selected = Array.from(files);
    if (selected.some(file => !/\.(jpe?g|png|webp|pdf)$/i.test(file.name) || !file.size || file.size > data.max_file_bytes)) {
      setError("Selecione fotos JPEG, PNG ou WebP, ou PDFs, não vazios e com até 10 MB por arquivo.");
      return false;
    }
    if (data.items.length + previous.length + selected.length > data.max_files) {
      setError(`Esta OS permite até ${data.max_files} anexos. Selecione menos arquivos.`);
      return false;
    }
    setError(null); setNotice("");
    setQueue([...previous, ...selected.map(file => ({ id: crypto.randomUUID(), file, state: "pending" as const, progress: 0 }))]);
    return true;
  }

  function pasteImages(event: ClipboardEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    if (active.current || !isCurrentSession(sessionId)) return;
    const clipboard = event.clipboardData;
    const files = clipboard.files.length ? Array.from(clipboard.files) : Array.from(clipboard.items)
      .map(item => item.kind === "file" ? item.getAsFile() : null)
      .filter((file): file is File => file !== null);
    const images = files.filter(file => file.type.startsWith("image/"));
    const extensions: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
    if (!images.length || images.some(file => !extensions[file.type])) {
      setNotice("");
      setError("Copie um print ou uma imagem JPEG, PNG ou WebP e cole aqui. Texto e links não são anexados.");
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const named = images.map(file => new File([file], `print-${stamp}-${crypto.randomUUID().slice(0, 8)}.${extensions[file.type]}`, { type: file.type }));
    if (selectFiles(named)) setNotice("Imagem colada na fila. Clique em Enviar arquivos para anexar à ordem.");
  }
  const update = (id: string, values: Partial<QueuedFile>) => setQueue(items => items.map(item => item.id === id ? { ...item, ...values } : item));
  const valid = (controller: AbortController) => !controller.signal.aborted && isCurrentSession(sessionId);

  async function send() {
    if (active.current || !isCurrentSession(sessionId)) return;
    const controller = new AbortController(); active.current = controller;
    setBusy(true); setError(null); setNotice("");
    let sent = 0;
    try {
      for (const entry of queue.filter(item => item.state !== "sent")) {
        if (!valid(controller)) break;
        update(entry.id, { state: "sending", progress: 0, error: undefined });
        try {
          await AttachmentService.upload(orderId, entry.file, entry.id, controller.signal, percent => {
            if (valid(controller)) update(entry.id, { progress: percent });
          });
          if (!valid(controller)) break;
          sent++;
          update(entry.id, { state: "sent", progress: 100 });
        } catch (cause) {
          if (!valid(controller) || axios.isCancel(cause)) break;
          update(entry.id, { state: "error", error: message(cause) });
        }
      }
    } finally {
      active.current = null;
      if (valid(controller)) {
        setBusy(false);
        setQueue(items => items.filter(item => item.state !== "sent"));
        setNotice(sent ? `${sent} arquivo(s) enviado(s).` : "Nenhum arquivo enviado. Confira os erros abaixo.");
        onChanged();
      }
    }
  }

  async function download(item: Attachment) {
    if (active.current || !isCurrentSession(sessionId)) return;
    const controller = new AbortController(); active.current = controller;
    setBusy(true); setError(null);
    try {
      const blob = await AttachmentService.content(orderId, item, false, controller.signal);
      if (!valid(controller)) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = item.filename;
      document.body.appendChild(link); link.click(); link.remove();
      const timer = window.setTimeout(release, 60_000);
      const unsubscribe = subscribeToSession(release);
      function release() { URL.revokeObjectURL(url); window.clearTimeout(timer); unsubscribe(); }
    } catch (cause) {
      if (valid(controller) && !axios.isCancel(cause)) setError(message(cause));
    } finally { active.current = null; if (valid(controller)) setBusy(false); }
  }

  async function remove() {
    if (!deleting || active.current || !isCurrentSession(sessionId)) return;
    const controller = new AbortController(); active.current = controller;
    setBusy(true); setError(null);
    try {
      await AttachmentService.remove(orderId, deleting.id, controller.signal);
      if (valid(controller)) { setDeleting(null); setNotice("Anexo excluído."); onChanged(); }
    } catch (cause) {
      if (valid(controller) && !axios.isCancel(cause)) setError(message(cause));
    } finally { active.current = null; if (valid(controller)) setBusy(false); }
  }

  return <>
    <div className="rounded-xl border border-dashed border-[#365780] bg-[#051020] p-4">
      <p className="text-sm font-medium text-slate-200">Adicionar fotos ou documentos</p>
      <p className="my-2 text-xs leading-5 text-slate-400">JPEG, PNG, WebP ou PDF · até 10 MB por arquivo · {data.items.length}/{data.max_files} anexos · {sizeLabel(data.total_bytes)} de {sizeLabel(data.max_total_bytes)} usados.</p>
      <p className="mb-3 text-xs text-slate-400">Fotos são otimizadas para até 2560 px e têm dados de localização removidos.</p>
      <input ref={picker} aria-label="Selecionar fotos e documentos" type="file" multiple accept={accept} className="hidden" onChange={event => { selectFiles(event.target.files); event.target.value = ""; }} />
      <input ref={camera} aria-label="Capturar foto" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={event => { selectFiles(event.target.files); event.target.value = ""; }} />
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} disabled={busy || data.items.length >= data.max_files} onClick={() => picker.current?.click()}><Upload size={17} />Selecionar arquivos</button>
        <button className={buttonClass} disabled={busy || data.items.length >= data.max_files} onClick={() => camera.current?.click()}><Camera size={17} />Tirar foto</button>
      </div>
      <label className="mt-4 block text-sm text-slate-200">
        Colar print ou imagem
        <textarea
          value=""
          onChange={() => { /* This field accepts images through onPaste only. */ }}
          rows={2}
          disabled={busy || data.items.length >= data.max_files}
          onPaste={pasteImages}
          placeholder="Clique aqui e pressione Ctrl+V (ou ⌘V no Mac)."
          className="mt-2 block min-h-20 w-full resize-none rounded-xl border border-dashed border-[#365780] bg-[#07182d] p-3 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 disabled:opacity-50"
        />
      </label>
      {!!queue.length && <ul aria-label="Fila de envio" className="mt-4 space-y-3">
        {queue.map(entry => <li key={entry.id} className="min-w-0 rounded-lg border border-[#24436b] p-3 text-sm">
          <div className="flex items-start justify-between gap-2"><span className="min-w-0 break-all text-slate-200">{entry.file.name} <span className="text-xs text-slate-400">({sizeLabel(entry.file.size)})</span></span>
            {!busy && entry.state !== "sent" && <button className={`${buttonClass} shrink-0`} aria-label={`Retirar ${entry.file.name} da fila`} onClick={() => setQueue(items => items.filter(item => item.id !== entry.id))}><Trash2 size={16} /></button>}
          </div>
          {entry.state === "sending" && <><progress aria-label={`Envio de ${entry.file.name}`} className="mt-2 w-full" max={100} value={entry.progress} /><p className="text-xs text-blue-300">{entry.progress === 100 ? "Processando arquivo…" : `Enviando: ${entry.progress}%`}</p></>}
          {entry.state === "sent" && <p className="mt-1 text-xs text-emerald-300">Enviado</p>}
          {entry.error && <p role="alert" className="mt-1 text-xs text-red-300">{entry.error}</p>}
        </li>)}
      </ul>}
      {queue.some(item => item.state !== "sent") && <button className={`${buttonClass} mt-4 bg-blue-500/20`} disabled={busy} onClick={() => void send()}>{busy ? "Aguarde…" : queue.some(item => item.state === "error") ? "Tentar envios pendentes" : "Enviar arquivos"}</button>}
    </div>
    {notice && <p role="status" className="mt-4 text-sm text-emerald-300">{notice}</p>}
    {error && !deleting && <div className="mt-4"><RequestError message={error} /></div>}
    {!data.items.length && <p className="mt-5 text-sm text-slate-400">Nenhum anexo nesta ordem. Adicione fotos do antes e depois, comprovantes ou outros documentos.</p>}
    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.items.map(item => <article key={item.id} aria-label={`Anexo ${item.filename}`} className="min-w-0 overflow-hidden rounded-xl border border-[#24436b] bg-[#051020]">
        {item.is_image ? <button className="block w-full" aria-label={`Visualizar ${item.filename}`} onClick={() => setPreview(item)}><AttachmentImage orderId={orderId} item={item} thumbnail /></button> : <div className="flex h-28 items-center justify-center gap-2 bg-[#0b203b] text-blue-300"><FileText size={32} /><span>Documento PDF</span></div>}
        <div className="p-4"><h3 className="break-all text-sm font-medium text-white">{item.filename}</h3>
          <p className="mt-1 text-xs text-slate-400">{sizeLabel(item.size)} · {formatDateTime(item.created_at)}</p>
          <p className="mt-1 break-words text-xs text-slate-400">Por {item.created_by_name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={buttonClass} disabled={busy} onClick={() => void download(item)} aria-label={`Baixar ${item.filename}`}><Download size={16} />Baixar</button>
            {data.can_delete && <button className={`${buttonClass} text-red-300`} disabled={busy} onClick={() => { setError(null); setDeleting(item); }} aria-label={`Excluir ${item.filename}`}><Trash2 size={16} />Excluir</button>}
          </div>
        </div>
      </article>)}
    </div>
    {preview && <Modal open title={preview.filename} subtitle="Foto do serviço" onClose={() => setPreview(null)}><AttachmentImage key={preview.id} orderId={orderId} item={preview} thumbnail={false} /></Modal>}
    {deleting && <Modal open title="Excluir anexo?" onClose={() => { if (!busy) { setDeleting(null); setError(null); } }}>
      <p className="break-words text-sm text-slate-300">O arquivo <strong>{deleting.filename}</strong> será removido permanentemente. O registro interno de quem enviou e excluiu será mantido.</p>
      {error && <RequestError message={error} />}
      <div className="mt-5 flex flex-wrap gap-3"><button className={buttonClass} disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button><button className={`${buttonClass} text-red-300`} disabled={busy} onClick={() => void remove()}>{busy ? "Excluindo…" : "Confirmar exclusão"}</button></div>
    </Modal>}
  </>;
}

export function AttachmentImage({ orderId, item, thumbnail }: { orderId: number; item: Attachment; thumbnail: boolean }) {
  const [state, setState] = useState<{ url?: string; error?: string }>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const sessionId = getSession().id;
    let url: string | undefined;
    const unsubscribe = subscribeToSession(() => { controller.abort(); if (url) URL.revokeObjectURL(url); });
    void AttachmentService.content(orderId, item, thumbnail, controller.signal).then(blob => {
      if (!controller.signal.aborted && isCurrentSession(sessionId)) {
        url = URL.createObjectURL(blob); setState({ url });
      }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted && isCurrentSession(sessionId) && !axios.isCancel(cause)) setState({ error: message(cause) });
    });
    return () => { controller.abort(); unsubscribe(); if (url) URL.revokeObjectURL(url); };
  }, [orderId, item, thumbnail, revision]);
  if (state.url) return <img src={state.url} alt={item.filename} loading="lazy" className={thumbnail ? "h-44 w-full bg-[#0b203b] object-cover" : "max-h-[65dvh] w-full object-contain"} />;
  return <div className="flex min-h-32 flex-col items-center justify-center gap-2 bg-[#0b203b] p-4 text-xs text-slate-400">
    <ImageIcon size={24} /><span>{state.error || "Carregando foto…"}</span>
    {state.error && !thumbnail && <button className={buttonClass} onClick={() => setRevision(value => value + 1)}>Tentar novamente</button>}
  </div>;
}
