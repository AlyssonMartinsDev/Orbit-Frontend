import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Save } from "lucide-react";
import { ClientService } from "../services/client.service";
import { PhoneInput } from "../../../shared/components/inputs";
import {
    FormSection,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { CustomFieldInput } from "../../custom-fields/components/CustomFieldInput";
import { useMessageStore } from "../../../shared/store/message.store";
import { useClientStore } from "../../../shared/store/client.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import type { ClientData } from "../types/client.types";

interface ClientFormProps {
    mode?: "create" | "edit";
    client?: ClientData & { id: number };
}

export function ClientForm({ mode = "create", client }: ClientFormProps) {
    const navigate = useNavigate();
    const formId = useId();
    const submitting = useRef(false);
    const [sessionId] = useState(() => getSession().id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ClientData>(() => ({
        name: client?.name ?? "",
        phone: client?.phone ?? "",
        email: client?.email ?? "",
        notes: client?.notes ?? "",
        custom_values: client?.custom_values ?? [],
    }));
    const { customFields, isLoaded, error, loadCustomFields } =
        useCustomFieldStore();
    const showMessage = useMessageStore((state) => state.showMessage);
    useEffect(() => {
        void loadCustomFields();
    }, [loadCustomFields]);
    const fields = customFields.filter(
        (field) => field.module === "CLIENT" && field.active,
    );
    const change = (key: "name" | "phone" | "email" | "notes", value: string) =>
        setFormData((current) => ({ ...current, [key]: value }));
    const changeCustom = (id: number, value: string) =>
        setFormData((current) => ({
            ...current,
            custom_values: [
                ...current.custom_values.filter(
                    (item) => item.field_definition_id !== id,
                ),
                { field_definition_id: id, value },
            ],
        }));

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || !isLoaded || !isCurrentSession(sessionId))
            return;
        if (!formData.name.trim()) {
            showMessage("Informe o nome do cliente.", "error");
            return;
        }
        submitting.current = true;
        setIsSubmitting(true);
        const payload: ClientData = {
            ...formData,
            name: formData.name.trim(),
            email: formData.email?.trim() || null,
            notes: formData.notes?.trim() || null,
            custom_values: fields.map((field) => ({
                field_definition_id: field.id,
                value:
                    formData.custom_values.find(
                        (item) => item.field_definition_id === field.id,
                    )?.value ?? null,
            })),
        };
        try {
            const response =
                mode === "edit" && client
                    ? await ClientService.update(client.id, payload)
                    : await ClientService.create(payload);
            if (!isCurrentSession(sessionId)) return;
            if (!response.success || !response.data) {
                showMessage(
                    response.message || "Não foi possível salvar o cliente.",
                    "error",
                );
                return;
            }
            const store = useClientStore.getState();
            if (mode === "edit") store.updateClient(response.data);
            else store.addClient(response.data);
            useDashboardStore.getState().clearSummary();
            showMessage(
                mode === "edit"
                    ? "Cliente atualizado com sucesso."
                    : "Cliente criado com sucesso.",
                "success",
            );
            await navigate("/clients/list");
        } catch (error) {
            if (isCurrentSession(sessionId) && !axios.isCancel(error))
                showMessage(
                    "Não foi possível salvar o cliente. Verifique sua conexão.",
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
            className="space-y-5"
            aria-busy={isSubmitting}
        >
            <fieldset disabled={isSubmitting} className="min-w-0 space-y-5">
                <FormSection
                    title={
                        mode === "edit"
                            ? "Editar cliente"
                            : "Informações do cliente"
                    }
                    description="Nome e telefone são obrigatórios."
                >
                    <div>
                        <label
                            htmlFor={`${formId}-name`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Nome *
                        </label>
                        <input
                            id={`${formId}-name`}
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={(event) =>
                                change("name", event.target.value)
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
                            value={formData.phone}
                            onChange={(value) => change("phone", value)}
                            placeholder="(00) 00000-0000"
                            className={inputClass}
                        />
                    </div>
                    <div className="sm:col-span-2">
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
                            value={formData.email ?? ""}
                            onChange={(event) =>
                                change("email", event.target.value)
                            }
                            className={inputClass}
                        />
                    </div>
                </FormSection>
                {error && (
                    <RequestError
                        message={error}
                        onRetry={() => void loadCustomFields(true)}
                    />
                )}
                {!isLoaded && !error && (
                    <p role="status" className="text-sm text-[#a7b4c8]">
                        Carregando campos personalizados…
                    </p>
                )}
                {fields.length > 0 && (
                    <FormSection
                        title="Campos personalizados"
                        description="Informações adicionais do cliente."
                    >
                        {fields.map((field) => (
                            <CustomFieldInput
                                key={field.id}
                                id={`${formId}-field-${field.id}`}
                                field={field}
                                value={
                                    formData.custom_values.find(
                                        (item) =>
                                            item.field_definition_id ===
                                            field.id,
                                    )?.value ?? ""
                                }
                                onChange={(value) =>
                                    changeCustom(field.id, value)
                                }
                            />
                        ))}
                    </FormSection>
                )}
                <FormSection title="Observações">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor={`${formId}-notes`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Informações complementares
                        </label>
                        <textarea
                            id={`${formId}-notes`}
                            rows={4}
                            value={formData.notes ?? ""}
                            onChange={(event) =>
                                change("notes", event.target.value)
                            }
                            className={inputClass}
                        />
                    </div>
                </FormSection>
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
                        disabled={!isLoaded || isSubmitting}
                        className={primaryButtonClass}
                    >
                        <Save size={18} />
                        {isSubmitting ? "Salvando…" : "Salvar cliente"}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}
