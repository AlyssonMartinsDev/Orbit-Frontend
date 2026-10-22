import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { Modal } from "../../../shared/components/modal";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { formatCurrency, formatDateTime } from "../../../shared/utils/format";
import { SaveError, SettingsField } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { Pagination } from "../components/InventoryShared";
import { pageClass, panelClass, quantity, useInventoryAccess } from "../inventory.helpers";
import { InventoryService } from "../services/inventory.service";
import { movementLabels, type MovementKind, type Product } from "../types/inventory.types";

function MovementForm({ product, done }: { product: Product; done: () => void }) {
    const mutation = useSettingsMutation();
    const [kind, setKind] = useState<MovementKind>("ENTRADA");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [requestId, setRequestId] = useState(() => crypto.randomUUID());
    const changed = () => setRequestId(crypto.randomUUID());
    return <form className={`${panelClass} space-y-4`} onSubmit={event => {
        event.preventDefault();
        void mutation.run(() => InventoryService.move(product.id, { kind, quantity: amount, reason: reason.trim(), request_id: requestId }), () => { setAmount(""); setReason(""); changed(); done(); });
    }}>
        <h2 className="font-semibold">Movimentar estoque</h2>
        <p className="text-sm text-slate-400">O histórico é permanente. Para corrigir um lançamento, registre uma nova movimentação.</p>
        <fieldset disabled={mutation.busy} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Tipo de movimentação<select className={inputClass} value={kind} onChange={event => { setKind(event.target.value as MovementKind); changed(); }}>{Object.entries(movementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <SettingsField label={`Quantidade (${product.unit})`} type="number" required min="0.001" max="999999999999999.999" step="0.001" value={amount} onChange={event => { setAmount(event.target.value); changed(); }} />
            <label className="text-sm sm:col-span-2">Motivo / observação *<textarea className={inputClass} required maxLength={500} value={reason} onChange={event => { setReason(event.target.value); changed(); }} /></label>
            <div className="sm:col-span-2"><SaveError message={mutation.error} /></div>
            <button className={primaryButtonClass}>{mutation.busy ? "Registrando…" : "Registrar movimentação"}</button>
        </fieldset>
    </form>;
}
export function ProductDetailsPage() {
    const id = Number(useParams().id);
    const navigate = useNavigate();
    const access = useInventoryAccess();
    const mutation = useSettingsMutation();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [page, setPage] = useState(1);
    const load = useCallback((signal: AbortSignal) => InventoryService.detail(id, signal), [id]);
    const loadHistory = useCallback((signal: AbortSignal) => InventoryService.movements(id, page, signal), [id, page]);
    const resource = useAsyncResource(`inventory-detail:${id}`, load);
    const history = useAsyncResource(`inventory-history:${id}:${page}`, loadHistory);
    const product = resource.data;
    return <section className={pageClass}>
        <Link className="text-sm text-blue-300" to="/inventory">← Estoque</Link>
        {resource.error && <RequestError message={resource.error} onRetry={resource.refresh} />}
        {access.error && <RequestError message={access.error} onRetry={access.refresh} />}
        {resource.isLoading && <p role="status">Carregando produto…</p>}
        {product && <>
            <header className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h1 className="break-words text-2xl font-semibold">{product.name}</h1><p className="mt-2 text-sm text-slate-400">{product.is_active ? "Ativo" : "Inativo"} · {product.category_name || "Sem categoria"}</p></div>
                {access.canWrite && <div className="flex flex-wrap gap-2"><Link className={primaryButtonClass} to={`/inventory/${id}/edit`}>Editar produto</Link><button className={secondaryButtonClass} onClick={() => setConfirmDelete(true)}>Excluir produto</button></div>}
            </header>
            <dl className={`${panelClass} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
                {[
                    ["Saldo atual", product.track_stock ? `${quantity(product.quantity)} ${product.unit}` : "Sem controle de estoque"],
                    ["Estoque mínimo", `${quantity(product.minimum_stock)} ${product.unit}`],
                    ["Unidade", product.unit], ["SKU", product.sku || "Não informado"],
                    ["Código de barras", product.barcode || "Não informado"],
                    ["Preço de custo", formatCurrency(product.cost_price)], ["Preço de venda", formatCurrency(product.sale_price)],
                    ["Criado em", formatDateTime(product.created_at)], ["Atualizado em", formatDateTime(product.updated_at)],
                ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-1 break-all">{value}</dd></div>)}
            </dl>
            {product.low_stock && <p className="text-sm text-amber-300">Este produto está no estoque mínimo ou abaixo.</p>}
            {product.description && <p className={`${panelClass} whitespace-pre-wrap break-words text-sm`}>{product.description}</p>}
            {access.canWrite && product.track_stock && product.is_active && <MovementForm key={id} product={product} done={() => { resource.refresh(); history.refresh(); setPage(1); }} />}
            {(!product.track_stock || !product.is_active) && <p className="text-sm text-slate-400">Movimentações disponíveis para produtos ativos com controle de estoque.</p>}
            <section className="space-y-4" aria-label="Histórico de movimentações">
                <h2 className="text-lg font-semibold">Histórico de movimentações</h2>
                {history.error && <RequestError message={history.error} onRetry={history.refresh} />}
                {history.isLoading && <p role="status">Carregando histórico…</p>}
                {history.data && !history.isLoading && <>
                    {!history.data.items.length && <p className={panelClass}>Nenhuma movimentação registrada.</p>}
                    {history.data.items.map(movement => <article key={movement.id} className={`${panelClass} space-y-2`}>
                        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{movement.is_initial ? "Estoque inicial" : movementLabels[movement.kind]} · {quantity(movement.quantity)} {product.unit}</h3><span className="text-sm text-slate-400">{formatDateTime(movement.created_at)}</span></div>
                        <p className="text-sm">Saldo: {quantity(movement.balance_before)} → {quantity(movement.balance_after)} {product.unit}</p>
                        <p className="whitespace-pre-wrap break-words text-sm">{movement.reason}</p>
                        <p className="text-xs text-slate-400">#{movement.id} · {movement.created_by_name}</p>
                        {movement.source_work_order_id && <p className="break-words text-xs text-blue-200">{movement.source_work_order_exists ? <Link to={`/work-orders/${movement.source_work_order_id}/details`}>OS #{movement.source_work_order_id}</Link> : `OS #${movement.source_work_order_id} (excluída)`} · {movement.source_work_order_title}</p>}
                    </article>)}
                    <Pagination page={page} totalPages={history.data.total_pages} onChange={setPage} />
                </>}
            </section>
            <Modal open={confirmDelete} title="Excluir produto" onClose={() => { if (!mutation.isPending()) setConfirmDelete(false); }}>
                <p className="mb-4 text-sm">Excluir {product.name}? Produtos com movimentações devem ser inativados para preservar o histórico.</p>
                <SaveError message={mutation.error} />
                <div className="mt-4 flex flex-wrap gap-2"><button className={primaryButtonClass} disabled={mutation.busy} onClick={() => void mutation.run(() => InventoryService.remove(id), () => { void navigate("/inventory"); })}>Confirmar exclusão</button><button className={secondaryButtonClass} disabled={mutation.busy} onClick={() => setConfirmDelete(false)}>Cancelar</button></div>
            </Modal>
        </>}
    </section>;
}
