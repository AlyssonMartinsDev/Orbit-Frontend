export type PdfTemplate = "CLASSIC" | "MODERN" | "COMPACT";
export type DocumentKind = "work_order" | "quote";
export interface DocumentPdfPreferences {
  template: PdfTemplate;
  filename_pattern: string;
}
export type PdfPreferences = Record<DocumentKind, DocumentPdfPreferences>;

export const pdfTemplates: { value: PdfTemplate; name: string; description: string }[] = [
  { value: "CLASSIC", name: "Clássico", description: "Identidade atual, cabeçalho em duas colunas e destaques em azul." },
  { value: "MODERN", name: "Moderno", description: "Cabeçalho em destaque, títulos amplos e tabela com acento azul." },
  { value: "COMPACT", name: "Compacto", description: "Resumo em linha e espaçamentos menores, com todos os dados preservados." },
];
export const filenameTokens = ["tipo", "numero", "cliente", "empresa", "data"] as const;

export function filenamePatternError(pattern: string): string | null {
  if (!pattern.trim() || pattern.trim().length > 120) return "Informe um padrão de nome com até 120 caracteres.";
  if ([...pattern].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) || /[/\\:*?"<>|]/.test(pattern)) return 'Não use barras ou os caracteres : * ? " < > |.';
  const tokens = [...pattern.matchAll(/\{([^{}]*)\}/g)];
  if (/[{}]/.test(pattern.replace(/\{[^{}]*\}/g, "")) || tokens.some(match => !filenameTokens.some(token => token === match[1]))) return "Use somente as variáveis indicadas abaixo.";
  if (!/[\p{L}\p{N}_]/u.test(pattern)) return "Informe um nome ou uma variável para o arquivo.";
  return null;
}

export function exampleFilename(pattern: string, kind: DocumentKind): string {
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const values: Record<string, string> = { tipo: kind === "work_order" ? "ordem-de-servico" : "orcamento", numero: "123", cliente: "Cliente Exemplo", empresa: "Empresa Exemplo", data: date };
  let name = pattern.trim().replace(/\{([^{}]+)\}/g, (_, token: string) => values[token] ?? token).replace(/\.pdf$/i, "");
  name = name.normalize("NFKD").split("").filter(char => char.charCodeAt(0) < 128).join("").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^[-_]+|[-_]+$/g, "").slice(0, 170).replace(/[-_]+$/g, "");
  name = name.replace(/-+/g, "-");
  name ||= `${values.tipo}-123`;
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name)) name = `documento-${name}`;
  return `${name}.pdf`;
}
