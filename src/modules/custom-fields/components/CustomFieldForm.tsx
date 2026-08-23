import { useState } from "react";


import { CustomFieldService } from "../services/custom-field.service";
import { useMessageStore } from "../../../shared/store/message.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";

import type {
    CreateCustomFieldRequest,
    CustomFieldType,
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


    const showMessage = useMessageStore(
        (state) => state.showMessage
    );
    // Ação da store responsável por adicionar
    // o novo campo ao array já carregado no frontend
    const addCustomField = useCustomFieldStore(
        (state) => state.addCustomField
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] =
        useState<CreateCustomFieldRequest>(() => ({
            name: customField?.name ?? "",
            field_type: customField?.field_type ?? "TEXT",
            required: customField?.required ?? false,
            active: customField?.active ?? true,
            display_order: customField?.display_order ?? 0,
            placeholder: customField?.placeholder ?? "",
        }));


    const handleChange = (
        field: keyof CreateCustomFieldRequest,
        value: string | number | boolean
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };


    const handleSubmit = async (
        event: React.SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);

            // Decide se vai criar um novo campo
            // ou atualizar um campo existente
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

            // Atualiza a store sem precisar buscar tudo novamente
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

            // Fecha o modal somente depois
            // da store já estar atualizada
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


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {/* Nome */}
            <div>
                <label
                    htmlFor="custom_field_name"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Nome do campo
                </label>

                <input
                    id="custom_field_name"
                    type="text"
                    required
                    placeholder="Ex: AnyDesk ID"
                    value={formData.name}
                    onChange={(event) =>
                        handleChange(
                            "name",
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
            </div>


            {/* Tipo */}
            <div>
                <label
                    htmlFor="custom_field_type"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Tipo do campo
                </label>

                <select
                    id="custom_field_type"
                    value={formData.field_type}
                    onChange={(event) =>
                        handleChange(
                            "field_type",
                            event.target.value as CustomFieldType
                        )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
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
            </div>


            {/* Placeholder */}
            <div>
                <label
                    htmlFor="custom_field_placeholder"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Placeholder
                </label>

                <input
                    id="custom_field_placeholder"
                    type="text"
                    placeholder="Ex: Digite o ID do AnyDesk"
                    value={formData.placeholder ?? ""}
                    onChange={(event) =>
                        handleChange(
                            "placeholder",
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />

                <p className="mt-2 text-xs text-zinc-500">
                    Texto de ajuda exibido dentro do campo.
                </p>
            </div>


            {/* Ordem */}
            <div>
                <label
                    htmlFor="custom_field_order"
                    className="mb-2 block text-sm font-medium text-zinc-300"
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
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />

                <p className="mt-2 text-xs text-zinc-500">
                    Define a posição deste campo na interface.
                </p>
            </div>


            {/* Opções */}
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-white">
                            Campo obrigatório
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
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
                        className="h-4 w-4 accent-violet-600"
                    />
                </label>


                <div className="border-t border-white/10" />


                <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-white">
                            Campo ativo
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Campos inativos não aparecem em novas ordens.
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
                        className="h-4 w-4 accent-violet-600"
                    />
                </label>

            </div>


            {/* Ações */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-xl border border-white/10 px-5 py-3 font-medium text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Salvando..."
                        : "Criar campo"}
                </button>

            </div>

        </form>
    );
}