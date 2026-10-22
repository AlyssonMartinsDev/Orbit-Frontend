import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { Modal } from "../../../shared/components/modal";
import { SaveError, SettingsField } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { Pagination } from "../components/InventoryShared";
import { pageClass, panelClass, useInventoryAccess } from "../inventory.helpers";
import { InventoryService } from "../services/inventory.service";
import type { Category } from "../types/inventory.types";

export function CategoriesPage() {
    const access = useInventoryAccess();
    const mutation = useSettingsMutation();
    const deletion = useSettingsMutation();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [name, setName] = useState("");
    const [editing, setEditing] = useState<Category | null>(null);
    const [removing, setRemoving] = useState<Category | null>(null);
    const load = useCallback((signal: AbortSignal) => InventoryService.categories(page, search, signal), [page, search]);
    const resource = useAsyncResource(`inventory-categories:${page}:${search}`, load);
    return <section className={pageClass}>
        <Link className="text-sm text-blue-300" to="/inventory">← Estoque</Link>
        <h1 className="text-2xl font-semibold">Categorias de produtos</h1>
        {access.error && <RequestError message={access.error} onRetry={access.refresh} />}
        {access.canWrite && <form className={`${panelClass} space-y-4`} onSubmit={event => {
            event.preventDefault();
            void mutation.run(() => InventoryService.saveCategory(name.trim(), editing?.id), () => { setName(""); setEditing(null); setPage(1); resource.refresh(); });
        }}>
            <h2 className="font-semibold">{editing ? "Editar categoria" : "Nova categoria"}</h2>
            <fieldset disabled={mutation.busy} className="space-y-4">
                <SettingsField label="Nome da categoria" required maxLength={100} value={name} onChange={event => setName(event.target.value)} />
                <SaveError message={mutation.error} />
                <div className="flex flex-wrap gap-2"><button className={primaryButtonClass}>Salvar categoria</button>{editing && <button type="button" className={secondaryButtonClass} onClick={() => { setEditing(null); setName(""); }}>Cancelar edição</button>}</div>
            </fieldset>
        </form>}
        <label className="block text-sm">Pesquisar categorias<input className={inputClass} maxLength={100} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
        {resource.error && <RequestError message={resource.error} onRetry={resource.refresh} />}
        {resource.isLoading && <p role="status">Carregando categorias…</p>}
        {resource.data && !resource.isLoading && <>
            {!resource.data.items.length && <p className={panelClass}>Nenhuma categoria encontrada.</p>}
            <div className="space-y-3">{resource.data.items.map(item => <article key={item.id} className={`${panelClass} flex flex-wrap items-center justify-between gap-3`}>
                <h2 className="min-w-0 break-words font-semibold">{item.name}</h2>
                {access.canWrite && <div className="flex w-full flex-wrap gap-2 sm:w-auto"><button className={secondaryButtonClass} disabled={mutation.busy} onClick={() => { setEditing(item); setName(item.name); }}>Editar categoria</button><button className={secondaryButtonClass} onClick={() => setRemoving(item)}>Excluir categoria</button></div>}
            </article>)}</div>
            <Pagination page={page} totalPages={resource.data.total_pages} onChange={setPage} />
        </>}
        <Modal open={Boolean(removing)} title="Excluir categoria" onClose={() => { if (!deletion.isPending()) setRemoving(null); }}>
            <p className="mb-4 text-sm">Excluir {removing?.name}? Categorias vinculadas a produtos não podem ser excluídas.</p>
            <SaveError message={deletion.error} />
            <div className="mt-4 flex flex-wrap gap-2"><button className={primaryButtonClass} disabled={deletion.busy} onClick={() => {
                if (removing) void deletion.run(() => InventoryService.removeCategory(removing.id), () => { setRemoving(null); setPage(1); resource.refresh(); });
            }}>Confirmar exclusão</button><button className={secondaryButtonClass} disabled={deletion.busy} onClick={() => setRemoving(null)}>Cancelar</button></div>
        </Modal>
    </section>;
}
