import { useCallback, useId, useState } from "react";
import { InventoryService } from "../../../modules/inventory/services/inventory.service";
import { productsTotal, type DocumentProduct } from "../../../modules/inventory/types/document-product.types";
import { Pagination } from "../../../modules/inventory/components/InventoryShared";
import { quantity } from "../../../modules/inventory/inventory.helpers";
import { useAsyncResource } from "../../hooks/useAsyncResource";
import { formatCurrency } from "../../utils/format";
import { inputClass, secondaryButtonClass } from "../form/FormSection";
import { RequestError } from "../feedback/RequestError";
import { itemsTotal, lineAmount, sumAmounts, type LineItem, type PricingMode } from "./pricing";

interface Values { pricing_mode: PricingMode; items: LineItem[]; price: string; products: DocumentProduct[] }
interface Props extends Values { priceLabel: string; quote?: boolean; onChange: (value: Values) => void }
const cell = "min-w-0 p-2 align-top lg:p-3";
const caption = "mb-1 block text-xs text-slate-400 lg:sr-only";

export function DocumentItemsEditor({ pricing_mode: mode, items, price, products, priceLabel, quote = false, onChange }: Props) {
    const id = useId();
    const [type, setType] = useState<"REGISTERED" | "PRODUCT" | "SERVICE">("SERVICE");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState("");
    const load = useCallback((signal: AbortSignal) => type === "REGISTERED" ? InventoryService.list({ page, search, active: true }, signal) : Promise.resolve(null), [type, page, search]);
    const catalog = useAsyncResource(`unified-products:${type}:${page}:${search}`, load);
    const change = (values: Partial<Values>) => onChange({ pricing_mode: mode, items, price, products, ...values });
    const changeItems = (next: LineItem[]) => change(next.length ? { items: next, pricing_mode: "ITEMIZED" } : { items: [], pricing_mode: "SIMPLE", price: "0" });
    const manual = mode === "ITEMIZED" ? items : [];
    const baseTotal = mode === "ITEMIZED" ? itemsTotal(items) : price;
    const productTotal = productsTotal(products);
    const total = baseTotal !== null && productTotal !== null ? sumAmounts([baseTotal, productTotal]) : null;
    const add = () => {
        if (type === "REGISTERED") {
            const product = catalog.data?.items.find(row => String(row.id) === selected);
            if (!product || products.some(row => row.product_id === product.id)) return;
            change({ products: [...products, { product_id: product.id, name: product.name, unit: product.unit, quantity: "1", unit_price: product.sale_price, stock_managed: product.track_stock, available_quantity: product.quantity, allocated_quantity: "0" }], price: mode === "SIMPLE" && !price ? "0" : price });
            setSelected("");
        } else {
            const previous = mode === "ITEMIZED" ? items : Number(price) > 0 ? [{ description: "Serviço (valor único)", quantity: "1", unit_price: price }] : [];
            changeItems([...previous, { kind: type, description: "", quantity: "1", unit_price: "0" }]);
        }
    };
    const canAdd = type === "REGISTERED" ? !!selected && products.length < 100 : manual.length < 100;
    const rows = [
        ...(mode === "SIMPLE" ? [{ key: "simple", source: "simple" as const, index: 0, description: "Serviço (valor único)", quantity: "1", unit_price: price, kind: "SERVICE" as const }] : manual.map((item, index) => ({ ...item, key: `manual-${index}`, source: "manual" as const, index }))),
        ...products.map((product, index) => ({ ...product, key: `product-${product.product_id}`, source: "catalog" as const, index, description: product.name || `Produto #${product.product_id}`, kind: "PRODUCT" as const })),
    ];
    return <section aria-label="Produtos e Serviços" className="min-w-0 space-y-4 rounded-xl border border-[#24436b] bg-[#07182d] p-3 sm:p-5">
        <div><h2 className="font-semibold text-white">Produtos e Serviços</h2><p className="mt-1 text-sm text-slate-400">Adicione itens e edite os valores diretamente na lista.</p></div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="min-w-0 text-sm text-slate-300">Tipo de item<select aria-label="Tipo de item" className={`${inputClass} mt-1`} value={type} onChange={e => { setType(e.target.value as typeof type); setSelected(""); }}><option value="SERVICE">Serviço</option><option value="PRODUCT">Produto não cadastrado</option><option value="REGISTERED">Produto cadastrado</option></select></label>
            <button type="button" className={secondaryButtonClass} disabled={!canAdd} onClick={add}>Adicionar item</button>
        </div>
        {type === "REGISTERED" && <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <label className="min-w-0 text-sm text-slate-300">Pesquisar produto<input className={`${inputClass} mt-1`} placeholder="Nome, SKU ou código de barras" maxLength={100} value={search} onChange={e => { setSearch(e.target.value); setPage(1); setSelected(""); }} /></label>
            <label className="min-w-0 text-sm text-slate-300">Produto cadastrado<select aria-label="Produto cadastrado" className={`${inputClass} mt-1`} value={selected} disabled={catalog.isLoading} onChange={e => setSelected(e.target.value)}><option value="">{catalog.isLoading ? "Carregando…" : "Selecione um produto"}</option>{catalog.data?.items.map(product => <option key={product.id} value={product.id} disabled={products.some(row => row.product_id === product.id)}>{product.name}{product.sku ? ` · ${product.sku}` : ""}</option>)}</select></label>
            {catalog.error && <RequestError message={catalog.error} onRetry={catalog.refresh} />}
            {catalog.data?.total === 0 && <p className="text-sm text-slate-400">Nenhum produto ativo encontrado.</p>}
            {catalog.data && catalog.data.total_pages > 1 && <Pagination label="Paginação de produtos cadastrados" page={page} totalPages={catalog.data.total_pages} onChange={value => { setPage(value); setSelected(""); }} />}
        </div>}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            {([['SIMPLE', 'Valor único'], ['ITEMIZED', 'Detalhar itens']] as const).map(([value, label]) => <label key={value} className="flex min-h-10 items-center gap-2"><input type="radio" name={`${id}-mode`} checked={mode === value} onChange={() => change({ pricing_mode: value, items: value === "ITEMIZED" ? items.length ? items : [{ description: "", quantity: "1", unit_price: price || "0" }] : [], price: value === "SIMPLE" && mode === "ITEMIZED" ? itemsTotal(items) ?? price : price })} />{label}</label>)}
        </div>
        <p className="text-xs text-slate-400">Valor único reúne os itens manuais em um valor de serviço. Produtos cadastrados permanecem separados na lista.</p>
        <table className="block w-full table-fixed text-sm lg:table">
            <thead className="hidden bg-[#102742] text-left text-xs text-slate-300 lg:table-header-group"><tr>{["Tipo", "Descrição", "Qtd.", "Valor unit.", "Total", "Ações"].map((label, i) => <th key={label} className={`${cell} ${i === 1 ? 'w-[30%]' : i === 5 ? 'w-[10%]' : 'w-[15%]'}`}>{label}</th>)}</tr></thead>
            <tbody className="block lg:table-row-group">{rows.map(row => {
                const product = row.source === "catalog" ? products[row.index] : null;
                const edit = (key: "description" | "quantity" | "unit_price", value: string) => {
                    if (row.source === "simple") { change({ price: value }); return; }
                    if (row.source === "catalog") change({ products: products.map((item, i) => i === row.index ? { ...item, [key]: value } : item) });
                    else changeItems(items.map((item, i) => i === row.index ? { ...item, [key]: value } : item));
                };
                const suffix = row.source === "catalog" ? `produto ${row.index + 1}` : `item ${row.index + 1}`;
                const amount = lineAmount(row);
                return <tr key={row.key} className="grid min-w-0 grid-cols-2 border-b border-[#24436b] py-3 lg:table-row lg:py-0">
                    <td className={`${cell} col-span-2`}><span className={caption}>Tipo</span>{row.source === "manual" ? <select aria-label={`Tipo do item ${row.index + 1}`} className={inputClass} value={row.kind || "SERVICE"} onChange={e => changeItems(items.map((item, i) => i === row.index ? { ...item, kind: e.target.value as LineItem['kind'] } : item))}><option value="SERVICE">Serviço</option><option value="PRODUCT">Produto avulso</option></select> : <span className="block pt-2 text-blue-200">{product ? "Produto" : "Serviço"}</span>}</td>
                    <td className={`${cell} col-span-2 row-start-2 lg:row-auto`}><span className={caption}>Descrição</span>{row.source === "manual" ? <textarea aria-label={`Descrição do item ${row.index + 1}`} required maxLength={500} rows={2} value={row.description} onChange={e => edit("description", e.target.value)} className={`${inputClass} resize-y`} /> : <p className="break-words pt-2 text-slate-200">{row.description}</p>}{product && <p className="mt-2 break-words text-xs text-slate-400">{product.stock_managed ? `Disponível: ${product.available_quantity != null ? quantity(product.available_quantity) : "—"} ${product.unit || ""}${!quote ? ` · Baixa registrada: ${quantity(product.allocated_quantity || "0")}` : ""}` : "Sem controle de estoque"}</p>}</td>
                    <td className={`${cell} row-start-3 lg:row-auto`}><span className={caption}>Quantidade</span>{row.source === "simple" ? <span className="block pt-2">1</span> : <input aria-label={`Quantidade do ${suffix}`} className={inputClass} type="number" inputMode="decimal" required min="0.001" max="999999.999" step="0.001" value={row.quantity} onChange={e => edit("quantity", e.target.value)} />}</td>
                    <td className={`${cell} row-start-3 lg:row-auto`}><span className={caption}>Valor unitário</span><input aria-label={row.source === "simple" ? priceLabel : `Valor unitário do ${suffix} (R$)`} className={inputClass} type="number" inputMode="decimal" required min="0" max="99999999.99" step="0.01" value={row.unit_price} onChange={e => edit("unit_price", e.target.value)} /></td>
                    <td className={`${cell} break-words font-semibold`}><span className={caption}>Total</span><span className="block pt-2">{amount === null ? "—" : formatCurrency(amount)}</span></td>
                    <td className={`${cell} col-start-2 row-start-4 text-right lg:col-auto lg:row-auto lg:text-left`}><button type="button" aria-label={`Remover ${suffix}`} className="min-h-11 text-sm text-red-300" onClick={() => row.source === "catalog" ? change({ products: products.filter((_, i) => i !== row.index) }) : row.source === "simple" ? change({ price: "0" }) : changeItems(items.filter((_, i) => i !== row.index))}>Remover</button></td>
                </tr>;
            })}</tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-500/10 p-4"><span className="text-sm text-blue-200">Total do documento</span><strong aria-live="polite" className="break-words text-xl">{total === null ? "—" : formatCurrency(total)}</strong></div>
        {total === null && (items.length > 0 || products.length > 0 || !!price) && <p role="alert" className="text-sm text-amber-200">Confira quantidades e valores. O total máximo é R$ 99.999.999,99.</p>}
        {products.length > 0 && <p className="text-xs text-blue-200">{quote ? "O orçamento não baixa nem reserva estoque. A baixa ocorre somente na conversão para OS." : "Ao salvar, somente produtos cadastrados com controle de estoque geram baixas ou estornos pela diferença de quantidade."}</p>}
    </section>;
}
