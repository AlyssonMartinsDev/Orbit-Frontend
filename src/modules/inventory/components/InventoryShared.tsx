import { useCallback, useId, useState } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { inputClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { InventoryService } from "../services/inventory.service";

export function Pagination({ page, totalPages, onChange, label = "Paginação" }: { page: number; totalPages: number; onChange: (page: number) => void; label?: string }) {
    return <nav aria-label={label} className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={secondaryButtonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button>
        <span className="text-sm">Página {page} de {totalPages}</span>
        <button type="button" className={secondaryButtonClass} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Próxima</button>
    </nav>;
}
export function CategorySelect({ value, selectedName, onChange, all = false }: { value: number | null; selectedName?: string | null; onChange: (id: number | null) => void; all?: boolean }) {
    const id = useId();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const load = useCallback((signal: AbortSignal) => InventoryService.categories(page, search, signal), [page, search]);
    const categories = useAsyncResource(`inventory-category-options:${page}:${search}`, load);
    return <div className="min-w-0 space-y-2">
        <label htmlFor={id} className="block text-sm text-slate-400">Categoria</label>
        <input aria-label="Buscar categoria" className={inputClass} placeholder="Buscar categoria…" maxLength={100} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        <select id={id} className={inputClass} value={value ?? ""} onChange={event => onChange(event.target.value ? Number(event.target.value) : null)}>
            <option value="">{all ? "Todas as categorias" : "Sem categoria"}</option>
            {value && !categories.data?.items.some(item => item.id === value) && <option value={value}>{selectedName || `Categoria #${value}`}</option>}
            {categories.data?.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {categories.isLoading && <p role="status" className="text-xs text-slate-400">Carregando categorias…</p>}
        {categories.error && <RequestError message={categories.error} onRetry={categories.refresh} />}
        {categories.data && categories.data.total_pages > 1 && <Pagination label="Paginação de categorias" page={page} totalPages={categories.data.total_pages} onChange={setPage} />}
    </div>;
}
