import { DocumentItemsEditor } from "../../../shared/components/pricing/DocumentItemsEditor";
import { productPayload, productsTotal } from "../../inventory/types/document-product.types";
import { discountedTotal, itemizedDraft, itemsTotal, sumAmounts } from "../../../shared/components/pricing/pricing";
import { DiscountFields } from "../../../shared/components/pricing/DiscountFields";
import { useEffect, useId, useRef, useState } from "react";
import { PaymentFields } from "../../../shared/components/form/PaymentFields";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save } from "lucide-react";
import { PhoneInput } from "../../../shared/components/inputs";
import {
    FormSection,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { CustomFieldInput } from "../../custom-fields/components/CustomFieldInput";
import { appliesTo } from "../../custom-fields/types/custom-field.types";
import { ClientSelect } from "../../clients/components/ClientSelect";
import { useClientStore } from "../../../shared/store/client.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";
import { useMessageStore } from "../../../shared/store/message.store";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import { WorkOrderService } from "../services/work-order.service";
import type {
    CreateWorkOrderRequest,
    WorkOrderResponse,
    WorkOrderStatus,
} from "../types/work-order.types";
import { serviceOptions } from "../utils/status";

export function WorkOrderForm({
    mode = "create",
    workOrder,
}: {
    mode?: "create" | "edit";
    workOrder?: WorkOrderResponse;
}) {
    const navigate = useNavigate();
    const formId = useId();
    const [sessionId] = useState(() => getSession().id);
    const submitting = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientMode, setClientMode] = useState<"existing" | "new">(
        "existing",
    );
    const [clientId, setClientId] = useState("");
    const [client, setClient] = useState({
        name: "",
        phone: "",
        email: "",
        notes: "",
    });
    const [clientCustomValues, setClientCustomValues] = useState<Record<number, string>>({});
    const createRequest = useRef<{ fingerprint: string; id: string } | null>(null);
    const [order, setOrder] = useState(() => ({
        include_price: workOrder?.include_price ?? true,
        discount_type: workOrder?.discount_type ?? null,
        discount_value: workOrder?.discount_value ?? null,
        payment_method: workOrder?.payment_method ?? null,
        payment_details: workOrder?.payment_details ?? null,
        title: workOrder?.title ?? "",
        ...itemizedDraft(workOrder),
        products: workOrder?.products ?? [],
        status_service:
            workOrder?.status_service ?? ("EM_ANDAMENTO" as WorkOrderStatus),
    }));
    const cannotRemoveSavedPrices = !!workOrder?.include_price && Number(workOrder.subtotal) > 0;
    const [customValues, setCustomValues] = useState<Record<number, string>>(
        () =>
            Object.fromEntries(
                workOrder?.custom_values.map((item) => [
                    item.field_definition.id,
                    item.value ?? "",
                ]) ?? [],
            ),
    );
    const {
        customFields,
        isLoaded: fieldsLoaded,
        isLoading: fieldsLoading,
        error: fieldsError,
        loadCustomFields,
    } = useCustomFieldStore();
    const showMessage = useMessageStore((state) => state.showMessage);
    useEffect(() => {
        void loadCustomFields(true);
    }, [loadCustomFields]);
    const fields = customFields.filter(
        (field) => appliesTo(field.module, "WORK_ORDER") && field.active,
    );
    const clientFields = customFields.filter(field => field.module === "CLIENT" && field.active);
    const ready =
        fieldsLoaded && !fieldsLoading && !fieldsError &&
        (mode === "edit" || clientMode === "new" || !!clientId);
    const changeClient = (key: keyof typeof client, value: string) =>
        setClient((current) => ({ ...current, [key]: value }));

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || !ready || !isCurrentSession(sessionId))
            return;
        if (!order.items.length && !order.products.length) { showMessage("Adicione pelo menos um produto ou serviço.", "error"); return; }
        const computed = itemsTotal(order.items, true);
        const servicePrice = order.include_price ? computed ?? "" : "0.00";
        const productSum = productsTotal(order.products);
        const subtotal = order.include_price && productSum !== null ? sumAmounts([servicePrice, productSum]) : "0.00";
        const totals = subtotal !== null ? discountedTotal(subtotal, order.include_price ? order.discount_type : null, order.include_price ? order.discount_value : null) : null;
        if ((order.include_price && (computed === null || productSum === null)) || !totals) { showMessage("Confira os valores e o desconto. O desconto não pode superar o subtotal.", "error"); return; }
        if (
            !order.title.trim() ||
            (order.include_price && (servicePrice.trim() === "" || !Number.isFinite(Number(servicePrice)))) ||
            order.items.some(item => !item.description.trim())
        ) {
            showMessage(
                "Preencha o título, a descrição e os valores dos itens.",
                "error",
            );
            return;
        }
        if (
            mode === "create" &&
            (clientMode === "existing" ? !clientId : !client.name.trim())
        ) {
            showMessage("Informe o cliente responsável pela ordem.", "error");
            return;
        }
        submitting.current = true;
        setIsSubmitting(true);
        const values = fields.map((field) => ({
            field_definition_id: field.id,
            value: customValues[field.id]?.trim() || null,
        }));
        const workOrderPayload = {
            ...order,
            title: order.title.trim(),
            price: totals.total,
            service_price: servicePrice,
            products: productPayload(order.products).map(product => order.include_price ? product : { ...product, unit_price: "0" }),
            items: order.items.map(item => order.include_price ? item : { ...item, unit_price: "0" }),
            discount_type: order.include_price ? order.discount_type : null,
            discount_value: order.include_price ? order.discount_value : null,
            ...(mode === "edit" ? { pricing_version: workOrder?.pricing_version ?? 0 } : {}),
        };
        const payload: CreateWorkOrderRequest = {
            client:
                clientMode === "existing"
                    ? { id: Number(clientId) }
                    : {
                          ...client,
                          name: client.name.trim(),
                          email: client.email.trim() || undefined,
                          notes: client.notes.trim() || undefined,
                          custom_values: clientFields.map(field => ({ field_definition_id: field.id, value: clientCustomValues[field.id]?.trim() || null })),
                      },
            work_order: workOrderPayload,
            custom_values: { values },
        };
        if (mode === "create") {
            const fingerprint = JSON.stringify(payload);
            if (createRequest.current?.fingerprint !== fingerprint) createRequest.current = { fingerprint, id: crypto.randomUUID() };
            payload.request_id = createRequest.current.id;
        }
        try {
            const response =
                mode === "edit" && workOrder
                    ? await WorkOrderService.update(
                          workOrder.id,
                          { ...workOrderPayload, custom_values: { values } },
                      )
                    : await WorkOrderService.create(payload);
            if (!isCurrentSession(sessionId)) return;
            if (!response.success) {
                showMessage(response.message, "error");
                return;
            }
            useDashboardStore.getState().clearSummary();
            if (mode === "create" && clientMode === "new")
                useClientStore.getState().clearClients();
            showMessage(
                mode === "edit"
                    ? "Ordem de serviço atualizada."
                    : "Ordem de serviço criada.",
                "success",
            );
            await navigate("/dashboard");
        } catch (error) {
            if (!isCurrentSession(sessionId) || axios.isCancel(error)) return;
            showMessage(
                "Não foi possível salvar a ordem. Verifique sua conexão.",
                "error",
            );
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
            className="space-y-5"
        >
            <fieldset disabled={isSubmitting} className="min-w-0 space-y-5">
                <FormSection
                    title="Cliente"
                    description={
                        mode === "edit"
                            ? "O cliente vinculado a esta ordem é mantido."
                            : "Selecione um cliente ou cadastre um novo."
                    }
                >
                    {mode === "edit" && workOrder ? (
                        <div className="min-w-0 sm:col-span-2">
                            <p className="break-words font-medium">
                                {workOrder.client.name}
                            </p>
                            <Link
                                to={`/clients/${workOrder.client.id}/edit`}
                                className="mt-2 inline-block py-2 text-sm text-blue-300"
                            >
                                Editar cadastro do cliente
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div
                                role="group"
                                aria-label="Tipo de cliente"
                                className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2"
                            >
                                {(["existing", "new"] as const).map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={clientMode === value}
                                        onClick={() => setClientMode(value)}
                                        className={`min-h-12 rounded-xl border px-3 py-3 text-sm ${clientMode === value ? "border-blue-400/50 bg-[#0a2242] text-blue-200" : "border-[#16345c] text-[#a7b4c8]"}`}
                                    >
                                        {value === "existing"
                                            ? "Cliente cadastrado"
                                            : "Cadastrar novo cliente"}
                                    </button>
                                ))}
                            </div>
                            {clientMode === "existing" ? (
                                <div className="sm:col-span-2">
                                    <ClientSelect value={Number(clientId)} onChange={value => setClientId(value ? String(value) : "")} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label
                                            htmlFor={`${formId}-name`}
                                            className="mb-2 block text-sm text-[#a7b4c8]"
                                        >
                                            Nome *
                                        </label>
                                        <input
                                            id={`${formId}-name`}
                            maxLength={255}
                                            required
                                            autoComplete="name"
                                            value={client.name}
                                            onChange={(event) =>
                                                changeClient(
                                                    "name",
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`${formId}-phone`}
                                            className="mb-2 block text-sm text-[#a7b4c8]"
                                        >
                                            Telefone *
                                        </label>
                                        <PhoneInput
                                            id={`${formId}-phone`}
                                            required
                                            value={client.phone}
                                            onChange={(value) =>
                                                changeClient("phone", value)
                                            }
                                            placeholder="(00) 00000-0000"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`${formId}-email`}
                                            className="mb-2 block text-sm text-[#a7b4c8]"
                                        >
                                            E-mail
                                        </label>
                                        <input
                                            id={`${formId}-email`}
                            maxLength={255}
                                            type="email"
                                            autoComplete="email"
                                            value={client.email}
                                            onChange={(event) =>
                                                changeClient(
                                                    "email",
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`${formId}-notes`}
                                            className="mb-2 block text-sm text-[#a7b4c8]"
                                        >
                                            Observações do cliente
                                        </label>
                                        <input
                                            id={`${formId}-notes`}
                            maxLength={255}
                                            value={client.notes}
                                            onChange={(event) =>
                                                changeClient(
                                                    "notes",
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                    {clientFields.map(field => (
                                        <CustomFieldInput
                                            key={field.id}
                                            field={field}
                                            id={`${formId}-client-custom-${field.id}`}
                                            value={clientCustomValues[field.id] ?? ""}
                                            onChange={value => setClientCustomValues(current => ({ ...current, [field.id]: value }))}
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </FormSection>
                <FormSection title="Informações da ordem">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor={`${formId}-title`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Título *
                        </label>
                        <input
                            id={`${formId}-title`}
                            maxLength={255}
                            required
                            value={order.title}
                            onChange={(event) =>
                                setOrder((current) => ({
                                    ...current,
                                    title: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor={`${formId}-service`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Status do serviço
                        </label>
                        <select
                            id={`${formId}-service`}
                            value={order.status_service}
                            onChange={(event) => {
                                const value = serviceOptions.find(
                                    (item) => item.value === event.target.value,
                                )?.value;
                                if (value)
                                    setOrder((current) => ({
                                        ...current,
                                        status_service: value,
                                    }));
                            }}
                            className={inputClass}
                        >
                            {serviceOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <label className="flex items-start gap-3 text-sm text-[#c4cede] sm:col-span-2"><input type="checkbox" className="mt-1 size-5 accent-blue-500" checked={order.include_price} disabled={!!workOrder?.source_quote_id || cannotRemoveSavedPrices} onChange={event => setOrder(current => ({ ...current, include_price: event.target.checked, discount_type: event.target.checked ? current.discount_type : null, discount_value: event.target.checked ? current.discount_value : null }))} /><span>Incluir valor na OS<span className="mt-1 block text-xs text-[#8290a8]">{workOrder?.source_quote_id ? "Uma OS originada de orçamento mantém seus valores." : cannotRemoveSavedPrices ? "Esta OS já possui valores salvos. Para preservar os preços registrados, esta opção não pode ser desmarcada." : "Sem valor, os preços não aparecem na ordem nem no PDF. Ao salvar sem valor, os preços dos itens serão zerados."}</span></span></label>
                    <div className="sm:col-span-2"><DocumentItemsEditor items={order.items} products={order.products} showPrices={order.include_price} onChange={value => setOrder(current => ({ ...current, ...value }))} /></div>
                    {order.include_price && <div className="sm:col-span-2"><DiscountFields subtotal={(() => { const services = itemsTotal(order.items, true); const products = productsTotal(order.products); return services !== null && products !== null ? sumAmounts([services, products]) : null; })()} type={order.discount_type} value={order.discount_value} onChange={(discount_type, discount_value) => setOrder(current => ({ ...current, discount_type, discount_value }))} /></div>}
                    {order.include_price && <><p className="text-sm leading-6 text-[#a7b4c8] sm:col-span-2">O status do pagamento será calculado automaticamente pelos recebimentos registrados nos detalhes da ordem.</p><PaymentFields method={order.payment_method} details={order.payment_details} onChange={(payment_method, payment_details) => setOrder(current => ({ ...current, payment_method, payment_details }))} /></>}
                </FormSection>
                {fieldsError && (
                    <RequestError
                        message={fieldsError}
                        onRetry={() => void loadCustomFields(true)}
                    />
                )}
                {!fieldsLoaded && !fieldsError && (
                    <p role="status" className="text-sm text-[#a7b4c8]">
                        Carregando campos personalizados…
                    </p>
                )}
                {fields.length > 0 && (
                    <FormSection title="Dados complementares">
                        {fields.map((field) => (
                            <CustomFieldInput
                                key={field.id}
                                id={`${formId}-field-${field.id}`}
                                field={field}
                                value={customValues[field.id] ?? ""}
                                onChange={(value) =>
                                    setCustomValues((current) => ({
                                        ...current,
                                        [field.id]: value,
                                    }))
                                }
                            />
                        ))}
                    </FormSection>
                )}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={secondaryButtonClass}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!ready || isSubmitting}
                        className={primaryButtonClass}
                    >
                        <Save size={18} />
                        {isSubmitting
                            ? "Salvando…"
                            : mode === "edit"
                              ? "Atualizar ordem"
                              : "Salvar ordem"}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}
