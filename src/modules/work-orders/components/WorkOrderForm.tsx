import { PricingEditor } from "../../../shared/components/pricing/PricingEditor";
import { itemsTotal, type LineItem, type PricingMode } from "../../../shared/components/pricing/pricing";
import { useEffect, useId, useRef, useState } from "react";
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
    const [order, setOrder] = useState(() => ({
        title: workOrder?.title ?? "",
        description: workOrder?.description ?? "",
        price: workOrder?.price ?? "0",
        pricing_mode: workOrder?.pricing_mode ?? ("SIMPLE" as PricingMode),
        items: workOrder?.items ?? ([] as LineItem[]),
        status_service:
            workOrder?.status_service ?? ("EM_ANDAMENTO" as WorkOrderStatus),
    }));
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
        clients,
        isLoaded: clientsLoaded,
        error: clientsError,
        loadClients,
    } = useClientStore();
    const {
        customFields,
        isLoaded: fieldsLoaded,
        isLoading: fieldsLoading,
        error: fieldsError,
        loadCustomFields,
    } = useCustomFieldStore();
    const showMessage = useMessageStore((state) => state.showMessage);
    useEffect(() => {
        if (mode === "create") void loadClients();
        void loadCustomFields(true);
    }, [mode, loadClients, loadCustomFields]);
    const fields = customFields.filter(
        (field) => appliesTo(field.module, "WORK_ORDER") && field.active,
    );
    const ready =
        fieldsLoaded && !fieldsLoading && !fieldsError &&
        (mode === "edit" || clientMode === "new" || clientsLoaded);
    const changeClient = (key: keyof typeof client, value: string) =>
        setClient((current) => ({ ...current, [key]: value }));

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || !ready || !isCurrentSession(sessionId))
            return;
        const computed = order.pricing_mode === "ITEMIZED" ? itemsTotal(order.items) : order.price;
        const price = computed ?? "";
        if (
            !order.title.trim() ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0 ||
            price.trim() === "" ||
            (order.pricing_mode === "ITEMIZED" && order.items.some(item => !item.description.trim()))
        ) {
            showMessage(
                "Preencha o título e um valor válido para o serviço.",
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
            description: order.description.trim(),
            price,
            items: order.pricing_mode === "ITEMIZED" ? order.items : [],
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
                      },
            work_order: workOrderPayload,
            custom_values: { values },
        };
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
                                    {clientsError && (
                                        <RequestError
                                            message={clientsError}
                                            onRetry={() =>
                                                void loadClients(true)
                                            }
                                        />
                                    )}
                                    <label
                                        htmlFor={`${formId}-client`}
                                        className="mb-2 block text-sm text-[#a7b4c8]"
                                    >
                                        Cliente *
                                    </label>
                                    <select
                                        id={`${formId}-client`}
                                        required
                                        disabled={!clientsLoaded}
                                        value={clientId}
                                        onChange={(event) =>
                                            setClientId(event.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {clientsLoaded
                                                ? "Selecione um cliente"
                                                : "Carregando clientes…"}
                                        </option>
                                        {clients.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    {clientsLoaded && clients.length === 0 && (
                                        <p className="mt-2 text-sm text-[#a7b4c8]">
                                            Nenhum cliente cadastrado. Use a
                                            opção “Cadastrar novo cliente”.
                                        </p>
                                    )}
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
                    <p className="text-sm leading-6 text-[#a7b4c8]">
                        O status do pagamento será calculado automaticamente pelos recebimentos registrados nos detalhes da ordem.
                    </p>
                    <div className="sm:col-span-2"><PricingEditor mode={order.pricing_mode} items={order.items} price={order.price} priceLabel="Valor (R$)" onChange={value => setOrder(current => ({ ...current, ...value }))} /></div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor={`${formId}-description`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Descrição do serviço
                        </label>
                        <textarea
                            id={`${formId}-description`}
                            rows={5}
                            value={order.description}
                            onChange={(event) =>
                                setOrder((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
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
