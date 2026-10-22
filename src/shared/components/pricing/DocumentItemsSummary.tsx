import { formatCurrency } from "../../utils/format";
import { lineAmount, type LineItem } from "./pricing";
import type { DocumentProduct } from "../../../modules/inventory/types/document-product.types";
import { quantity } from "../../../modules/inventory/inventory.helpers";

export function DocumentItemsSummary({ items, products, servicePrice, total, order = false }: {
    items: LineItem[]; products: DocumentProduct[]; servicePrice: string | number; total: string | number; order?: boolean;
}) {
    const manual: LineItem[] = items.length ? items : Number(servicePrice) > 0 || !products.length ? [{ description: "Serviço (valor único)", quantity: "1", unit_price: String(servicePrice) }] : [];
    const rows = [
        ...manual.map((row, i) => ({ ...row, key: `manual-${i}`, type: row.kind === "PRODUCT" ? "Produto avulso" : "Serviço", note: "" })),
        ...products.map(row => ({ ...row, key: `product-${row.product_id}`, description: row.name || `Produto #${row.product_id}`, type: "Produto", note: order ? row.stock_managed ? `Baixa registrada: ${quantity(row.allocated_quantity || "0")} ${row.unit || ""}` : "Sem controle de estoque" : "" })),
    ];
    const cell = "min-w-0 p-2 align-top sm:p-3";
    return <section aria-label="Produtos e Serviços" className="my-5 min-w-0 space-y-4 rounded-xl border border-[#24436b] bg-[#07182d] p-3 sm:p-5">
        <h2 className="font-semibold text-white">Produtos e Serviços</h2>
        <table className="block w-full table-fixed text-sm lg:table"><thead className="hidden bg-[#102742] text-left text-xs text-slate-300 lg:table-header-group"><tr>{["Tipo", "Descrição", "Qtd.", "Valor unit.", "Total"].map((label, i) => <th className={`${cell} ${i === 1 ? 'w-[40%]' : 'w-[15%]'}`} key={label}>{label}</th>)}</tr></thead><tbody className="block lg:table-row-group">{rows.map(row => <tr key={row.key} className="grid min-w-0 grid-cols-2 border-b border-[#24436b] py-2 lg:table-row">
            <td className={`${cell} col-span-2 text-xs text-blue-200`}>{row.type}</td>
            <td className={`${cell} col-span-2`}><p className="whitespace-pre-wrap break-words text-slate-200">{row.description}</p>{row.note && <p className="mt-2 text-xs text-slate-400">{row.note}</p>}</td>
            <td className={cell}><span className="block text-xs text-slate-400 lg:hidden">Qtd.</span>{quantity(row.quantity)}</td>
            <td className={`${cell} break-words`}><span className="block text-xs text-slate-400 lg:hidden">Valor unit.</span>{formatCurrency(row.unit_price)}</td>
            <td className={`${cell} col-span-2 break-words font-semibold`}><span className="block text-xs font-normal text-slate-400 lg:hidden">Total</span>{formatCurrency(lineAmount(row) ?? "0")}</td>
        </tr>)}</tbody></table>
        <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-blue-500/10 p-4"><span>Total do documento</span><strong className="break-words">{formatCurrency(total)}</strong></div>
        {!order && products.length > 0 && <p className="text-xs text-slate-400">Sem reserva ou movimentação de estoque. A baixa ocorre na conversão para OS.</p>}
    </section>;
}
