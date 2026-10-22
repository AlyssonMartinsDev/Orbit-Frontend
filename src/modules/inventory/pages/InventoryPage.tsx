import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { formatCurrency } from "../../../shared/utils/format";
import { CategorySelect, Pagination } from "../components/InventoryShared";
import { pageClass, panelClass, quantity, useInventoryAccess } from "../inventory.helpers";
import { InventoryService } from "../services/inventory.service";
import { useInventoryStore } from "../store/inventory.store";
import type { InventoryFilters } from "../types/inventory.types";

export function InventoryPage() {
    const { filters, setFilters } = useInventoryStore();
    const [search, setSearch] = useState(filters.search);
    const access = useInventoryAccess();
    const load = useCallback((signal: AbortSignal) => InventoryService.list(filters, signal), [filters]);
    const products = useAsyncResource(`inventory:${JSON.stringify(filters)}`, load);
    const summary = useAsyncResource("inventory-summary", InventoryService.summary);
    return <section className={pageClass}>
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div><h1 className="text-2xl font-semibold text-white">Estoque</h1><p className="mt-2 text-sm text-slate-400">Produtos, disponibilidade e histórico de movimentações.</p></div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <Link className={secondaryButtonClass} to="/inventory/categories">Categorias</Link>
                {access.canWrite && <Link className={primaryButtonClass} to="/inventory/create">Cadastrar produto</Link>}
            </div>
        </header>
        {access.error && <RequestError message={access.error} onRetry={access.refresh} />}
        {summary.error && <RequestError message={summary.error} onRetry={summary.refresh} />}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores de estoque">
            {([["products", "Produtos cadastrados"], ["tracked", "Ativos com controle"], ["low_stock", "No mínimo ou abaixo"], ["out_of_stock", "Sem estoque"]] as const).map(([key, label]) =>
                <div key={key} className={panelClass}><p className="text-sm text-slate-400">{label}</p><strong className="mt-2 block text-2xl">{summary.isLoading ? "…" : summary.data?.[key] ?? "—"}</strong></div>)}
        </div>
        <p className="text-xs text-slate-400">Alertas consideram apenas produtos ativos com controle de estoque. Os indicadores abrangem toda a organização.</p>
        <form aria-label="Filtros do estoque" className={`${panelClass} grid items-end gap-4 md:grid-cols-2`} onSubmit={event => { event.preventDefault(); setFilters({ search: search.trim() }); }}>
            <label className="min-w-0 text-sm">Buscar produto<input className={inputClass} placeholder="Nome, SKU ou código de barras" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /></label>
            <CategorySelect all value={filters.category_id ?? null} onChange={id => setFilters({ category_id: id ?? undefined })} />
            <label className="text-sm">Status<select className={inputClass} value={filters.active === undefined ? "" : String(filters.active)} onChange={event => setFilters({ active: event.target.value === "" ? undefined : event.target.value === "true" })}><option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
            <label className="text-sm">Disponibilidade<select className={inputClass} value={filters.stock ?? ""} onChange={event => setFilters({ stock: (event.target.value || undefined) as InventoryFilters["stock"] })}><option value="">Todos os saldos</option><option value="low">No mínimo ou abaixo</option><option value="empty">Sem estoque</option></select></label>
            <button className={primaryButtonClass}>Buscar</button>
            <button type="button" className={secondaryButtonClass} disabled={products.isLoading} onClick={() => { products.refresh(); summary.refresh(); }}>Atualizar</button>
        </form>
        {products.error && <RequestError message={products.error} onRetry={products.refresh} />}
        {products.isLoading && <p role="status">Carregando produtos…</p>}
        {products.data && !products.isLoading && <>
            <p className="text-sm text-slate-400">{products.data.total} produto(s) encontrado(s)</p>
            {!products.data.items.length && <p className={panelClass}>Nenhum produto encontrado. Cadastre um produto ou ajuste os filtros.</p>}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.data.items.map(product => <article key={product.id} className={`${panelClass} space-y-3`}>
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span className="break-all">SKU: {product.sku || "Não informado"}</span><span>{product.is_active ? "Ativo" : "Inativo"}</span></div>
                    <h2 className="break-words text-lg font-semibold">{product.name}</h2>
                    <p className="break-words text-sm text-slate-400">{product.category_name || "Sem categoria"}</p>
                    <p>{product.track_stock ? `${quantity(product.quantity)} ${product.unit} disponíveis` : "Sem controle de estoque"}</p>
                    {product.low_stock && <p className="text-sm text-amber-300">No estoque mínimo ou abaixo</p>}
                    <p className="text-sm">Venda: {formatCurrency(product.sale_price)}</p>
                    <div className="flex flex-wrap gap-2"><Link className={secondaryButtonClass} to={`/inventory/${product.id}`}>Ver produto</Link>{access.canWrite && <Link className={secondaryButtonClass} to={`/inventory/${product.id}/edit`}>Editar</Link>}</div>
                </article>)}
            </div>
            <Pagination page={filters.page} totalPages={products.data.total_pages} onChange={page => setFilters({ page })} />
        </>}
    </section>;
}
