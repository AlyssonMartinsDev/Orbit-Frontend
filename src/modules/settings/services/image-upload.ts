/** Resize before sending: camera images must not become multi-megabyte JSON bodies. */
export async function prepareSettingsImage(file: File): Promise<string> {
  const supported = ["image/png", "image/jpeg", "image/webp"];
  if (file.type ? !supported.includes(file.type) : !/\.(png|jpe?g|webp)$/i.test(file.name)) {
    throw new Error("Formato não suportado. Selecione uma imagem PNG, JPEG ou WebP.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const source = new Image();
    source.src = url;
    try { await source.decode(); }
    catch { throw new Error("Não foi possível abrir a imagem. Selecione outro arquivo PNG, JPEG ou WebP."); }
    if (!source.naturalWidth || !source.naturalHeight || source.naturalWidth * source.naturalHeight > 40_000_000) {
      throw new Error("A resolução da imagem é muito alta. Exporte uma versão menor e tente novamente.");
    }
    const ratio = Math.min(1, 512 / source.naturalWidth, 512 / source.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(source.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(source.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a imagem neste navegador.");
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    // PNG keeps the logo's transparency; the server validates and re-encodes again.
    return canvas.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}
