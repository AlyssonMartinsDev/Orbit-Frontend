import { formatCurrency } from "../../utils/format";
import { lineAmount, type LineItem } from "./pricing";

export function ItemsSummary({ items }: { items: LineItem[] }) {
  if (!items.length) return null;
  return <section aria-label="Itens do serviço" className="my-5 min-w-0 rounded-2xl border border-[#24436b] bg-[#07182d] p-4 sm:p-6">
    <h2 className="mb-4 font-semibold text-white">Itens do serviço</h2>
    <ol className="divide-y divide-[#24436b]">{items.map((item, index) => <li key={index} className="grid min-w-0 gap-2 py-4 text-sm sm:grid-cols-[1fr_auto]">
      <div className="min-w-0"><p className="whitespace-pre-wrap break-words text-slate-200">{index + 1}. {item.description}</p><p className="mt-2 text-slate-400">{Number(item.quantity).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} × {formatCurrency(item.unit_price)}</p></div>
      <p className="font-semibold text-white">{formatCurrency(lineAmount(item) ?? "0")}</p>
    </li>)}</ol>
  </section>;
}
