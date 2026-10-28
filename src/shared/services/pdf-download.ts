import { pdfFilename } from "./pdf-filename";
import { api } from "./api";

export async function fetchPdf(
  path: string,
  signal: AbortSignal,
  previewData?: unknown,
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await api.request<unknown>({
    url: path,
    method: previewData === undefined ? "GET" : "POST",
    data: previewData,
    responseType: "blob",
    headers: { Accept: "application/pdf" },
    timeout: 60_000,
    signal,
  });
  if (response.status === 404) {
    throw new Error(
      "O documento ou uma foto selecionada não está disponível. Atualize a página e selecione novamente.",
    );
  }
  if (response.status === 403) {
    throw new Error("Você não tem permissão para exportar este documento.");
  }
  if (response.status === 409) {
    throw new Error("Uma foto selecionada está indisponível ou inválida. Atualize os anexos e tente novamente.");
  }
  if (
    response.status !== 200 ||
    !(response.data instanceof Blob) ||
    !response.data.type.toLowerCase().startsWith("application/pdf") ||
    (await response.data.slice(0, 5).text()) !== "%PDF-"
  ) {
    throw new Error("Não foi possível gerar o PDF. Tente novamente.");
  }
  return { blob: response.data, filename: pdfFilename(response.headers["content-disposition"]) };
}

export function savePdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Let browsers finish consuming the download before releasing the URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
