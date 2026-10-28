/** Accept only a safe PDF basename from the server; old APIs keep the caller fallback. */
export function pdfFilename(header: unknown): string | null {
  if (typeof header !== "string") return null;
  const match = /(?:^|;)\s*filename="([^"]+)"/i.exec(header);
  if (!match || !/^[a-zA-Z0-9_-]+\.pdf$/i.test(match[1]) || match[1].length > 200) return null;
  return match[1];
}
