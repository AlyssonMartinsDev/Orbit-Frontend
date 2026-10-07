import { useEffect, useState } from "react";
import {
    Plus,
    Settings2,
    UserRound,
    ClipboardList,
    Sparkles,
} from "lucide-react";

import type {
    CustomFieldDefinitionResponse,
    CustomFieldModule,
    CustomFieldPresetType,
} from "../types/custom-field.types";

import { Modal } from "../../../shared/components/modal";
import { CustomFieldForm } from "../components/CustomFieldForm";

import { useCustomFieldStore } from "../../../shared/store/custom-field.store";


const moduleLabels: Record<CustomFieldModule, string> = {
    CLIENT: "Cliente",
    WORK_ORDER: "Ordem de Serviço",
};


const presetLabels: Record<CustomFieldPresetType, string> = {
    WHATSAPP: "WhatsApp",
    EMAIL: "E-mail",
    PHONE: "Telefone",
    URL: "Link",
};


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

    // Lista de campos personalizados armazenada globalmente.
    const customFields = useCustomFieldStore(
        (state) => state.customFields
    );

    // Estado de carregamento da requisição.
    const isLoading = useCustomFieldStore(
        (state) => state.isLoading
    );

    // Busca os campos personalizados no backend.
    const loadCustomFields = useCustomFieldStore(
        (state) => state.loadCustomFields
    );

    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        void loadCustomFields();
    }, [loadCustomFields]);


    // Abre o modal para criação de um novo campo.
    const handleCreateCustomField = () => {
        clearSelectedCustomField();
        setIsModalOpen(true);
    };


    // Seleciona o campo e abre o modal em modo de edição.
    const handleEditCustomField = (
        customField: CustomFieldDefinitionResponse
    ) => {
        setSelectedCustomField(customField);
        setIsModalOpen(true);
    };


    // Fecha o modal e limpa o campo selecionado.
    const handleCloseModal = () => {
        setIsModalOpen(false);
        clearSelectedCustomField();
    };


    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-[#8290A8]">
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
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#3692FF]">
                        Configurações
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#F8FAFC]">
                        Campos personalizados
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-[#8290A8]">
                        Configure informações adicionais para clientes
                        e ordens de serviço.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreateCustomField}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2583FF] px-5 py-3 font-semibold text-white transition hover:bg-[#3692FF]"
                >
                    <Plus size={18} />
                    Novo campo
                </button>

            </header>


            {/* LISTAGEM */}
            <div className="overflow-hidden rounded-3xl border border-[#16345C]/60 bg-[#07182D]/60">

                <div className="border-b border-[#16345C]/60 px-6 py-5">

                    <h2 className="text-lg font-semibold text-[#F8FAFC]">
                        Campos cadastrados
                    </h2>

                    <p className="mt-1 text-sm text-[#8290A8]">
                        {customFields.length} campo(s) configurado(s)
                    </p>

                </div>


                {customFields.length === 0 ? (

                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2583FF]/10 text-[#3692FF]">
                            <Settings2 size={26} />
                        </div>

                        <h3 className="mt-5 font-semibold text-[#F8FAFC]">
                            Nenhum campo personalizado
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-[#8290A8]">
                            Crie campos personalizados para armazenar
                            informações adicionais em clientes e ordens
                            de serviço.
                        </p>

                    </div>

                ) : (

                    /* FIELDS */
                    <div className="divide-y divide-[#16345C]/60">

                        {customFields.map((field) => (

                            <div
                                key={field.id}
                                className="flex flex-col gap-5 px-6 py-5 transition hover:bg-[#0A2242]/40 md:flex-row md:items-center md:justify-between"
                            >

                                <div className="min-w-0">

                                    {/* NOME + BADGES */}
                                    <div className="flex flex-wrap items-center gap-2">

                                        <h3 className="mr-1 font-semibold text-[#F8FAFC]">
                                            {field.name}
                                        </h3>


                                        {/* MÓDULO */}
                                        <span className="flex items-center gap-1.5 rounded-lg border border-[#16345C] bg-[#0A2242] px-2.5 py-1 text-xs font-medium text-[#A7B4C8]">

                                            {field.module === "CLIENT" ? (
                                                <UserRound size={13} />
                                            ) : (
                                                <ClipboardList size={13} />
                                            )}

                                            {moduleLabels[field.module]}

                                        </span>


                                        {/* TIPO */}
                                        <span className="rounded-lg bg-[#2583FF]/10 px-2.5 py-1 text-xs font-medium text-[#3692FF]">
                                            {field.field_type}
                                        </span>


                                        {/* PRESET */}
                                        {field.preset_type && (
                                            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                <Sparkles size={12} />

                                                {presetLabels[field.preset_type]}
                                            </span>
                                        )}


                                        {/* INATIVO */}
                                        {!field.active && (
                                            <span className="rounded-lg bg-[#56657D]/10 px-2.5 py-1 text-xs font-medium text-[#8290A8]">
                                                Inativo
                                            </span>
                                        )}

                                    </div>


                                    {/* PLACEHOLDER */}
                                    {field.placeholder && (
                                        <p className="mt-2 text-sm text-[#8290A8]">
                                            {field.placeholder}
                                        </p>
                                    )}


                                    {/* INFORMAÇÕES */}
                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#56657D]">

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


                                {/* EDITAR */}
                                <button
                                    type="button"
                                    onClick={() => handleEditCustomField(field)}
                                    className="self-start rounded-xl border border-[#16345C] px-4 py-2 text-sm font-medium text-[#A7B4C8] transition hover:bg-[#0A2242] hover:text-[#F8FAFC] md:self-auto"
                                >
                                    Editar
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* MODAL */}
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
                        : "Configure um novo campo para clientes ou ordens de serviço."
                }
                onClose={handleCloseModal}
            >

                <CustomFieldForm
                    mode={
                        selectedCustomField
                            ? "edit"
                            : "create"
                    }
                    customField={
                        selectedCustomField ?? undefined
                    }
                    onCancel={handleCloseModal}
                    onSuccess={handleCloseModal}
                />

            </Modal>

        </section>
    );
}