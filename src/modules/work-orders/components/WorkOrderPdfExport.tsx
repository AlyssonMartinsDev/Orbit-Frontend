import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Images } from "lucide-react";
import { PdfDownloadButton } from "../../../shared/components/PdfDownloadButton";
import { Modal } from "../../../shared/components/modal";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { fetchPdf, savePdf } from "../../../shared/services/pdf-download";
import { getSession, isCurrentSession, subscribeToSession } from "../../../shared/services/session";
import { AttachmentService } from "../services/attachment.service";
import { AttachmentImage } from "./WorkOrderAttachments";

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#24436b] px-4 py-2 text-sm text-blue-200 hover:bg-blue-500/10 disabled:opacity-50";

export function WorkOrderPdfExport({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="flex flex-wrap items-start gap-3">
      <PdfDownloadButton path={`/work_orders/${orderId}/pdf`} filename={`ordem-de-servico-${orderId}.pdf`} />
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}><Images size={18} />Incluir fotos no PDF</button>
    </div>
    {open && <Modal open title="Fotos no PDF da ordem" subtitle="Escolha as imagens que deseja incluir ao final do documento." onClose={() => setOpen(false)}>
      <PhotoSelection key={orderId} orderId={orderId} />
    </Modal>}
  </>;
}

function PhotoSelection({ orderId }: { orderId: number }) {
  const load = useCallback((signal: AbortSignal) => AttachmentService.list(orderId, signal), [orderId]);
  const resource = useAsyncResource(`pdf-photos:${orderId}`, load);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionId] = useState(() => getSession().id);
  const request = useRef<AbortController | null>(null);
  const photos = resource.data?.items.filter(item => item.is_image) ?? [];
  const ids = photos.filter(item => selected.includes(item.id)).map(item => item.id);

  useEffect(() => {
    const unsubscribe = subscribeToSession(() => request.current?.abort());
    return () => { request.current?.abort(); unsubscribe(); };
  }, []);

  async function download() {
    if (!ids.length || request.current || !isCurrentSession(sessionId)) return;
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError(null); setSuccess(false);
    try {
      const params = new URLSearchParams();
      ids.forEach(id => params.append("photo_ids", String(id)));
      const blob = await fetchPdf(`/work_orders/${orderId}/pdf?${params}`, controller.signal);
      if (!controller.signal.aborted && isCurrentSession(sessionId)) {
        savePdf(blob, `ordem-de-servico-${orderId}-com-fotos.pdf`);
        setSuccess(true);
      }
    } catch (cause) {
      if (!controller.signal.aborted && isCurrentSession(sessionId) && !axios.isCancel(cause)) {
        setError(cause instanceof Error && !axios.isAxiosError(cause) ? cause.message : "Não foi possível gerar o PDF com fotos. Tente novamente.");
      }
    } finally {
      request.current = null;
      if (!controller.signal.aborted && isCurrentSession(sessionId)) setBusy(false);
    }
  }

  return <div className="min-w-0">
    <p className="mb-4 text-sm text-slate-300">As fotos serão reduzidas e compactadas, com até quatro imagens por página. Os anexos salvos na OS permanecem disponíveis na qualidade atual.</p>
    {resource.isLoading && <p role="status" className="text-sm text-slate-400">Carregando fotos…</p>}
    {resource.error && <RequestError message={resource.error} onRetry={resource.refresh} />}
    {!resource.isLoading && resource.data && !photos.length && <p className="text-sm text-slate-300">Esta OS ainda não possui fotos. Adicione imagens em Fotos e anexos. Documentos PDF anexados não entram nesta seleção.</p>}
    {!!photos.length && <fieldset disabled={busy || resource.isLoading} className="min-w-0">
      <legend className="mb-3 text-sm text-slate-300">{ids.length} de {photos.length} foto(s) selecionada(s)</legend>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => { setSelected(photos.map(item => item.id)); setSuccess(false); }}>Selecionar todas</button>
        <button type="button" className={buttonClass} onClick={() => { setSelected([]); setSuccess(false); }}>Limpar seleção</button>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {photos.map(item => <label key={item.id} className={`block min-w-0 cursor-pointer overflow-hidden rounded-xl border ${selected.includes(item.id) ? "border-blue-400 bg-blue-500/10" : "border-[#24436b]"}`}>
          <AttachmentImage orderId={orderId} item={item} thumbnail />
          <span className="flex min-h-11 items-start gap-2 p-3">
            <input type="checkbox" aria-label={`Incluir ${item.filename}`} className="mt-0.5 size-5 shrink-0 accent-blue-500" checked={selected.includes(item.id)} onChange={event => { setSuccess(false); setSelected(values => event.target.checked ? [...values, item.id] : values.filter(id => id !== item.id)); }} />
            <span className="min-w-0 break-all text-sm text-slate-200">{item.filename}</span>
          </span>
        </label>)}
      </div>
      <button type="button" className={`${buttonClass} mt-5 w-full bg-blue-500/20`} disabled={!ids.length} onClick={() => void download()}>{busy ? "Gerando PDF…" : "Gerar PDF com fotos"}</button>
    </fieldset>}
    {error && <div className="mt-4"><RequestError message={error} onRetry={() => { setError(null); resource.refresh(); }} /></div>}
    {success && <p role="status" className="mt-4 text-sm text-emerald-300">PDF com fotos gerado.</p>}
  </div>;
}
