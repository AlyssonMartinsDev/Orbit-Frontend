import { api } from "./api";

export async function fetchPdf(
  path: string,
  signal: AbortSignal,
): Promise<Blob> {
  const response = await api.get<unknown>(path, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
    timeout: 60_000,
    signal,
  });
  if (response.status === 404) {
    throw new Error(
      "A ordem de serviço não foi encontrada. Atualize a página e tente novamente.",
    );
  }
  if (response.status === 403) {
    throw new Error("Você não tem permissão para exportar este documento.");
  }
  if (
    response.status !== 200 ||
    !(response.data instanceof Blob) ||
    !response.data.type.toLowerCase().startsWith("application/pdf") ||
    (await response.data.slice(0, 5).text()) !== "%PDF-"
  ) {
    throw new Error("Não foi possível gerar o PDF. Tente novamente.");
  }
  return response.data;
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
