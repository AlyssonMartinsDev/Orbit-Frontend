import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Download, LoaderCircle } from "lucide-react";
import { fetchPdf, savePdf } from "../services/pdf-download";
import { getSession, isCurrentSession } from "../services/session";

interface Props {
  path: string;
  filename: string;
  className?: string;
}

export function PdfDownloadButton(props: Props) {
  return <DownloadButton key={props.path} {...props} />;
}

function DownloadButton({ path, filename, className }: Props) {
  const [sessionId] = useState(() => getSession().id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function download() {
    if (request.current || !isCurrentSession(sessionId)) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    try {
      const pdf = await fetchPdf(path, controller.signal);
      if (!controller.signal.aborted && isCurrentSession(sessionId)) {
        savePdf(pdf.blob, pdf.filename ?? filename);
      }
    } catch (cause: unknown) {
      if (
        !controller.signal.aborted &&
        isCurrentSession(sessionId) &&
        !axios.isCancel(cause)
      ) {
        setError(
          cause instanceof Error && !axios.isAxiosError(cause)
            ? cause.message
            : "Não foi possível baixar o PDF. Verifique sua conexão e tente novamente.",
        );
      }
    } finally {
      request.current = null;
      if (!controller.signal.aborted && isCurrentSession(sessionId))
        setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void download()}
        className={
          className ??
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2583ff]/40 bg-[#2583ff]/10 px-4 py-3 text-sm font-medium text-[#a8d0ff] hover:bg-[#2583ff]/20 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        }
      >
        {busy ? (
          <LoaderCircle
            size={18}
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
        ) : (
          <Download size={18} aria-hidden="true" className="shrink-0" />
        )}
        <span aria-live="polite">{busy ? "Gerando PDF…" : "Exportar PDF"}</span>
      </button>
      {error && (
        <p role="alert" className="mt-2 max-w-md text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
