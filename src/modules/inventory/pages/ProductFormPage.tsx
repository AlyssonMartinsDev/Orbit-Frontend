import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormSection, inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { SaveError, SettingsField } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { CategorySelect } from "../components/InventoryShared";
import { pageClass, useInventoryAccess } from "../inventory.helpers";
import { InventoryService } from "../services/inventory.service";
import { useInventoryStore } from "../store/inventory.store";
import { units, type Product, type ProductInput, type Unit } from "../types/inventory.types";

function ProductForm({ product }: { product?: Product }) {
    const navigate = useNavigate();
    const mutation = useSettingsMutation();
    const [initial, setInitial] = useState("0");
    const [data, setData] = useState<ProductInput>(() => ({
        name: product?.name ?? "", sku: product?.sku ?? null, barcode: product?.barcode ?? null,
        description: product?.description ?? null, category_id: product?.category_id ?? null,
        unit: product?.unit ?? "UN", cost_price: product?.cost_price ?? "0", sale_price: product?.sale_price ?? "0",
        minimum_stock: product?.minimum_stock ?? "0", track_stock: product?.track_stock ?? true, is_active: product?.is_active ?? true,
    }));
    const change = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setData(current => ({ ...current, [key]: value }));
    return <form className="space-y-6" onSubmit={event => {
        event.preventDefault();
        const payload = { ...data, name: data.name.trim(), sku: data.sku?.trim() || null, barcode: data.barcode?.trim() || null, description: data.description?.trim() || null };
        void mutation.run(() => product ? InventoryService.update(product.id, payload) : InventoryService.create({ ...payload, initial_quantity: initial }), saved => {
            useInventoryStore.getState().reset();
            void navigate(`/inventory/${saved.id}`);
        });
    }}>
        <fieldset disabled={mutation.busy} className="min-w-0 space-y-6">
            <FormSection title="Cadastro do produto">
                <SettingsField label="Nome" required maxLength={200} value={data.name} onChange={event => change("name", event.target.value)} />
                <SettingsField label="SKU / código interno" maxLength={80} value={data.sku ?? ""} onChange={event => change("sku", event.target.value)} />
                <SettingsField label="Código de barras" maxLength={100} value={data.barcode ?? ""} onChange={event => change("barcode", event.target.value)} />
                <CategorySelect value={data.category_id} selectedName={product?.category_name} onChange={id => change("category_id", id)} />
                <label className="text-sm">Unidade de medida<select className={inputClass} value={data.unit} disabled={product?.has_movements} onChange={event => change("unit", event.target.value as Unit)}>{units.map(unit => <option key={unit}>{unit}</option>)}</select>{product?.has_movements && <span className="mt-2 block text-xs text-slate-400">Unidade preservada por existir histórico de movimentações.</span>}</label>
                <label className="text-sm">Descrição<textarea className={inputClass} rows={3} maxLength={5000} value={data.description ?? ""} onChange={event => change("description", event.target.value)} /></label>
            </FormSection>
            <FormSection title="Valores e estoque" description="O saldo só pode ser alterado por movimentações. Produtos sem controle continuam disponíveis no cadastro.">
                <SettingsField label="Preço de custo" type="number" required min="0" max="999999999999.99" step="0.01" value={data.cost_price} onChange={event => change("cost_price", event.target.value)} />
                <SettingsField label="Preço de venda" type="number" required min="0" max="999999999999.99" step="0.01" value={data.sale_price} onChange={event => change("sale_price", event.target.value)} />
                <SettingsField label="Estoque mínimo" type="number" required min="0" max="999999999999999.999" step="0.001" value={data.minimum_stock} onChange={event => change("minimum_stock", event.target.value)} />
                {!product && <SettingsField label="Estoque inicial" type="number" required min="0" max="999999999999999.999" step="0.001" disabled={!data.track_stock || !data.is_active} value={initial} onChange={event => setInitial(event.target.value)} />}
                <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={data.track_stock} onChange={event => { change("track_stock", event.target.checked); if (!event.target.checked) setInitial("0"); }} />Controlar estoque</label>
                <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={data.is_active} onChange={event => { change("is_active", event.target.checked); if (!event.target.checked) setInitial("0"); }} />Produto ativo</label>
            </FormSection>
            <SaveError message={mutation.error} />
            <div className="flex flex-wrap gap-3"><button className={primaryButtonClass}>{mutation.busy ? "Salvando…" : "Salvar produto"}</button><Link className={secondaryButtonClass} to={product ? `/inventory/${product.id}` : "/inventory"}>Cancelar</Link></div>
        </fieldset>
    </form>;
}
export function ProductFormPage() {
    const { id } = useParams();
    const access = useInventoryAccess();
    const load = useCallback((signal: AbortSignal) => id ? InventoryService.detail(Number(id), signal) : Promise.resolve(null), [id]);
    const resource = useAsyncResource(`inventory-edit:${id ?? "new"}`, load);
    return <section className={pageClass}>
        <Link className="text-sm text-blue-300" to="/inventory">← Estoque</Link>
        <h1 className="text-2xl font-semibold">{id ? "Editar produto" : "Cadastrar produto"}</h1>
        {access.error && <RequestError message={access.error} onRetry={access.refresh} />}
        {resource.error && <RequestError message={resource.error} onRetry={resource.refresh} />}
        {(access.isLoading || resource.isLoading) && <p role="status">Carregando…</p>}
        {access.data && !access.canWrite && <p>Somente administradores e gestores podem alterar produtos.</p>}
        {access.canWrite && !resource.isLoading && (!id || resource.data) && <ProductForm key={id ?? "new"} product={resource.data ?? undefined} />}
    </section>;
}
