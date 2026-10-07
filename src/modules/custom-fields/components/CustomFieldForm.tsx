import { useState } from "react";

import { CustomFieldService } from "../services/custom-field.service";

import { useMessageStore } from "../../../shared/store/message.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";

import type {
    CreateCustomFieldRequest,
    CustomFieldType,
    CustomFieldModule,
    CustomFieldPresetType,
    CustomFieldDefinitionResponse,
} from "../types/custom-field.types";


interface CustomFieldFormProps {
    mode?: "create" | "edit";

    customField?: CustomFieldDefinitionResponse;

    onSuccess?: () => void;

    onCancel?: () => void;
}


export function CustomFieldForm({
    mode = "create",
    customField,
    onSuccess,
    onCancel,
}: CustomFieldFormProps) {

    const updateCustomField = useCustomFieldStore(
        (state) => state.updateCustomField
    );

    const addCustomField = useCustomFieldStore(
        (state) => state.addCustomField
    );

    const showMessage = useMessageStore(
        (state) => state.showMessage
    );

    const [isSubmitting, setIsSubmitting] = useState(false);


    const [formData, setFormData] =
        useState<CreateCustomFieldRequest>(() => ({
            name: customField?.name ?? "",

            module:
                customField?.module
                ?? "WORK_ORDER",

            field_type:
                customField?.field_type
                ?? "TEXT",

            preset_type:
                customField?.preset_type
                ?? null,

            required:
                customField?.required
                ?? false,

            active:
                customField?.active
                ?? true,

            display_order:
                customField?.display_order
                ?? 0,

            placeholder:
                customField?.placeholder
                ?? "",
        }));


    const handleChange = (
        field: keyof CreateCustomFieldRequest,
        value:
            | string
            | number
            | boolean
            | null
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };


    const handleModuleChange = (
        module: CustomFieldModule
    ) => {
        setFormData((current) => ({
            ...current,
            module,
        }));
    };


    const handlePresetChange = (
        presetType: CustomFieldPresetType | null
    ) => {
        setFormData((current) => ({
            ...current,

            preset_type: presetType,

            // Todos os presets atuais armazenam texto.
            field_type:
                presetType !== null
                    ? "TEXT"
                    : current.field_type,
        }));
    };


    const handleSubmit = async (
        event: React.SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);

            const response =
                mode === "edit" && customField
                    ? await CustomFieldService.update(
                        customField.id,
                        formData
                    )
                    : await CustomFieldService.create(
                        formData
                    );

            if (!response.success || !response.data) {
                showMessage(
                    mode === "edit"
                        ? "Erro ao atualizar campo personalizado."
                        : "Erro ao criar campo personalizado.",
                    "error"
                );

                return;
            }


            // Atualiza a store sem precisar buscar
            // novamente todos os campos.
            if (mode === "edit") {
                updateCustomField(response.data);

                showMessage(
                    "Campo personalizado atualizado com sucesso.",
                    "success"
                );
            } else {
                addCustomField(response.data);

                showMessage(
                    "Campo personalizado criado com sucesso.",
                    "success"
                );
            }


            onSuccess?.();

        } catch (error) {
            console.error(
                mode === "edit"
                    ? "Erro ao atualizar campo personalizado:"
                    : "Erro ao criar campo personalizado:",
                error
            );

            showMessage(
                mode === "edit"
                    ? "Erro ao atualizar campo personalizado."
                    : "Erro ao criar campo personalizado.",
                "error"
            );

        } finally {
            setIsSubmitting(false);
        }
    };


    const hasPreset = formData.preset_type !== null;


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {/* MÓDULO */}
            <div>
                <label
                    htmlFor="custom_field_module"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Usar este campo em
                </label>

                <select
                    id="custom_field_module"
                    value={formData.module}
                    onChange={(event) =>
                        handleModuleChange(
                            event.target.value as CustomFieldModule
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition focus:border-[#2583FF]"
                >
                    <option value="CLIENT">
                        Cliente
                    </option>

                    <option value="WORK_ORDER">
                        Ordem de Serviço
                    </option>
                </select>

                <p className="mt-2 text-xs text-[#56657D]">
                    Define onde este campo personalizado será utilizado.
                </p>
            </div>


            {/* COMPORTAMENTO */}
            <div>
                <label
                    htmlFor="custom_field_preset"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Comportamento do campo
                </label>

                <select
                    id="custom_field_preset"
                    value={formData.preset_type ?? ""}
                    onChange={(event) =>
                        handlePresetChange(
                            event.target.value
                                ? event.target.value as CustomFieldPresetType
                                : null
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition focus:border-[#2583FF]"
                >
                    <option value="">
                        Campo comum
                    </option>

                    <option value="WHATSAPP">
                        WhatsApp
                    </option>

                    <option value="PHONE">
                        Telefone
                    </option>

                    <option value="EMAIL">
                        E-mail
                    </option>

                    <option value="URL">
                        Link / URL
                    </option>
                </select>

                <p className="mt-2 text-xs text-[#56657D]">
                    Campos predefinidos podem receber ações especiais
                    na interface do Orbit.
                </p>
            </div>


            {/* NOME */}
            <div>
                <label
                    htmlFor="custom_field_name"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Nome do campo
                </label>

                <input
                    id="custom_field_name"
                    type="text"
                    required
                    placeholder={
                        formData.preset_type === "WHATSAPP"
                            ? "Ex: WhatsApp financeiro"
                            : formData.preset_type === "PHONE"
                                ? "Ex: Telefone secundário"
                                : formData.preset_type === "EMAIL"
                                    ? "Ex: E-mail financeiro"
                                    : formData.preset_type === "URL"
                                        ? "Ex: Site do cliente"
                                        : "Ex: AnyDesk ID"
                    }
                    value={formData.name}
                    onChange={(event) =>
                        handleChange(
                            "name",
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-[#56657D] focus:border-[#2583FF]"
                />
            </div>


            {/* TIPO */}
            <div>
                <label
                    htmlFor="custom_field_type"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Tipo do campo
                </label>

                <select
                    id="custom_field_type"
                    value={formData.field_type}
                    disabled={hasPreset}
                    onChange={(event) =>
                        handleChange(
                            "field_type",
                            event.target.value as CustomFieldType
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition focus:border-[#2583FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="TEXT">
                        Texto
                    </option>

                    <option value="NUMBER">
                        Número
                    </option>

                    <option value="DATE">
                        Data
                    </option>

                    <option value="BOOLEAN">
                        Sim / Não
                    </option>
                </select>

                {hasPreset && (
                    <p className="mt-2 text-xs text-[#56657D]">
                        O tipo é definido automaticamente para
                        campos predefinidos.
                    </p>
                )}
            </div>


            {/* PLACEHOLDER */}
            <div>
                <label
                    htmlFor="custom_field_placeholder"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Placeholder
                </label>

                <input
                    id="custom_field_placeholder"
                    type="text"
                    placeholder={
                        formData.preset_type === "WHATSAPP"
                            ? "Ex: Digite o WhatsApp"
                            : formData.preset_type === "PHONE"
                                ? "Ex: Digite o telefone"
                                : formData.preset_type === "EMAIL"
                                    ? "Ex: Digite o e-mail"
                                    : formData.preset_type === "URL"
                                        ? "Ex: Digite o endereço do site"
                                        : "Ex: Digite o ID do AnyDesk"
                    }
                    value={formData.placeholder ?? ""}
                    onChange={(event) =>
                        handleChange(
                            "placeholder",
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-[#56657D] focus:border-[#2583FF]"
                />

                <p className="mt-2 text-xs text-[#56657D]">
                    Texto de ajuda exibido dentro do campo.
                </p>
            </div>


            {/* ORDEM */}
            <div>
                <label
                    htmlFor="custom_field_order"
                    className="mb-2 block text-sm font-medium text-[#A7B4C8]"
                >
                    Ordem de exibição
                </label>

                <input
                    id="custom_field_order"
                    type="number"
                    min={0}
                    value={formData.display_order ?? 0}
                    onChange={(event) =>
                        handleChange(
                            "display_order",
                            Number(event.target.value)
                        )
                    }
                    className="w-full rounded-xl border border-[#16345C] bg-[#07182D] px-4 py-3 text-[#F8FAFC] outline-none transition focus:border-[#2583FF]"
                />

                <p className="mt-2 text-xs text-[#56657D]">
                    Define a posição deste campo na interface.
                </p>
            </div>


            {/* OPÇÕES */}
            <div className="space-y-3 rounded-2xl border border-[#16345C]/60 bg-[#07182D]/60 p-4">

                <label className="flex cursor-pointer items-center justify-between gap-4">

                    <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">
                            Campo obrigatório
                        </p>

                        <p className="mt-1 text-xs text-[#56657D]">
                            Exige preenchimento antes de salvar.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={formData.required ?? false}
                        onChange={(event) =>
                            handleChange(
                                "required",
                                event.target.checked
                            )
                        }
                        className="h-4 w-4 accent-[#2583FF]"
                    />

                </label>


                <div className="border-t border-[#16345C]/60" />


                <label className="flex cursor-pointer items-center justify-between gap-4">

                    <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">
                            Campo ativo
                        </p>

                        <p className="mt-1 text-xs text-[#56657D]">
                            Campos inativos não aparecem em novos
                            clientes ou ordens de serviço.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={formData.active ?? true}
                        onChange={(event) =>
                            handleChange(
                                "active",
                                event.target.checked
                            )
                        }
                        className="h-4 w-4 accent-[#2583FF]"
                    />

                </label>

            </div>


            {/* AÇÕES */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-xl border border-[#16345C] px-5 py-3 font-medium text-[#A7B4C8] transition hover:bg-[#0A2242] hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-[#2583FF] px-5 py-3 font-semibold text-white transition hover:bg-[#3692FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Salvando..."
                        : mode === "edit"
                            ? "Salvar alterações"
                            : "Criar campo"}
                </button>

            </div>

        </form>
    );
}