import { useEffect, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import type { CustomFieldDefinitionResponse } from "../types/custom-field.types";


import { Modal } from "../../../shared/components/modal";
import { CustomFieldForm } from "../components/CustomFieldForm";

import { useCustomFieldStore } from "../../../shared/store/custom-field.store";


export function CustomFieldsPage() {

    const selectedCustomField = useCustomFieldStore(
        (state) => state.selectedCustomField
    );

    const setSelectedCustomField = useCustomFieldStore(
        (state) => state.setSelectedCustomField
    );

    const clearSelectedCustomField = useCustomFieldStore(
        (state) => state.clearSelectedCustomField
    );

    // Lista de campos personalizados armazenada globalmente
    const customFields = useCustomFieldStore(
        (state) => state.customFields
    );

    // Estado de carregamento da requisição
    const isLoading = useCustomFieldStore(
        (state) => state.isLoading
    );

    // Função responsável por buscar os campos no backend
    const loadCustomFields = useCustomFieldStore(
        (state) => state.loadCustomFields
    );

    // Seleciona o campo e abre o modal
    const handleEditCustomField = (
        customField: CustomFieldDefinitionResponse
    ) => {
        setSelectedCustomField(customField);
        setIsModalOpen(true);
    };



    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        void loadCustomFields();
    }, [loadCustomFields]);


    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-zinc-400">
                    Carregando campos personalizados...
                </p>
            </div>
        );
    }


    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">

            {/* HEADER */}
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
                        Configurações
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Campos personalizados
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                        Configure informações adicionais que poderão ser
                        utilizadas nas ordens de serviço.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
                >
                    <Plus size={18} />
                    Novo campo
                </button>

            </header>


            {/* LISTAGEM */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04]">

                <div className="border-b border-white/10 px-6 py-5">
                    <h2 className="text-lg font-semibold text-white">
                        Campos cadastrados
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        {customFields.length} campo(s) configurado(s)
                    </p>
                </div>


                {customFields.length === 0 ? (

                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                            <Settings2 size={26} />
                        </div>

                        <h3 className="mt-5 font-semibold text-white">
                            Nenhum campo personalizado
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-zinc-400">
                            Crie campos personalizados para armazenar informações
                            adicionais nas ordens de serviço.
                        </p>

                    </div>

                ) : (

                    /* FIELDS */
                    <div className="divide-y divide-white/10">

                        {customFields.map((field) => (
                            <div
                                key={field.id}
                                className="flex flex-col gap-5 px-6 py-5 transition hover:bg-white/[0.02] md:flex-row md:items-center md:justify-between"
                            >

                                <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-3">

                                        <h3 className="font-semibold text-white">
                                            {field.name}
                                        </h3>

                                        <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                                            {field.field_type}
                                        </span>

                                        {!field.active && (
                                            <span className="rounded-lg bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
                                                Inativo
                                            </span>
                                        )}

                                    </div>


                                    {field.placeholder && (
                                        <p className="mt-2 text-sm text-zinc-400">
                                            {field.placeholder}
                                        </p>
                                    )}


                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">

                                        <span>
                                            {field.required
                                                ? "Obrigatório"
                                                : "Opcional"}
                                        </span>

                                        <span>
                                            Ordem: {field.display_order}
                                        </span>

                                    </div>

                                </div>


                                <button
                                    onClick={() => handleEditCustomField(field)}
                                    type="button"
                                    className="self-start rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white md:self-auto"
                                >
                                    Editar
                                </button>

                            </div>
                        ))}

                    </div>
                )}

            </div>
            <Modal
                open={isModalOpen}
                title={
                    selectedCustomField
                        ? "Editar campo personalizado"
                        : "Novo campo personalizado"
                }
                subtitle={
                    selectedCustomField
                        ? "Altere as configurações do campo."
                        : "Configure um novo campo para as ordens de serviço."
                }
                onClose={() => {
                    setIsModalOpen(false);
                    clearSelectedCustomField();
                }}
            >
                <CustomFieldForm
                    mode={
                        selectedCustomField
                            ? "edit"
                            : "create"
                    }
                    customField={selectedCustomField ?? undefined}
                    onCancel={() => {
                        setIsModalOpen(false);
                        clearSelectedCustomField();
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        clearSelectedCustomField();
                    }}
                />
            </Modal>

        </section>

    );
}