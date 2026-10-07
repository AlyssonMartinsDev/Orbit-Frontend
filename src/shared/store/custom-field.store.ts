import { create } from "zustand";

import { CustomFieldService } from "../../modules/custom-fields/services/custom-field.service";

import type {
    CustomFieldDefinitionResponse,
    CustomFieldModule,
} from "../../modules/custom-fields/types/custom-field.types";


interface CustomFieldState {
    customFields: CustomFieldDefinitionResponse[];

    selectedCustomField:
    CustomFieldDefinitionResponse | null;

    isLoading: boolean;
    isLoaded: boolean;


    // Carrega todas as definições de campos personalizados.
    loadCustomFields: (
        forceRefresh?: boolean
    ) => Promise<void>;


    // Retorna somente os campos pertencentes
    // ao módulo informado.
    getCustomFieldsByModule: (
        module: CustomFieldModule,
        activeOnly?: boolean
    ) => CustomFieldDefinitionResponse[];


    addCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;


    updateCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;


    removeCustomField: (
        customFieldId: number
    ) => void;


    // Guarda o campo selecionado para edição.
    setSelectedCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;


    // Limpa o campo selecionado.
    clearSelectedCustomField: () => void;


    clearCustomFields: () => void;
}


export const useCustomFieldStore =
    create<CustomFieldState>((set, get) => ({

        customFields: [],

        selectedCustomField: null,

        isLoading: false,

        isLoaded: false,


        // Carrega todos os campos personalizados.
        //
        // Mantemos todos na store para que diferentes
        // módulos possam reutilizar os mesmos dados
        // sem criar stores separadas.
        loadCustomFields: async (
            forceRefresh = false
        ) => {

            const {
                isLoading,
                isLoaded,
            } = get();


            if (isLoading) {
                return;
            }


            if (
                isLoaded &&
                !forceRefresh
            ) {
                return;
            }


            set({
                isLoading: true,
            });


            try {

                const response =
                    await CustomFieldService.getAll();


                if (
                    !response.success ||
                    !response.data
                ) {
                    return;
                }


                const sortedCustomFields =
                    [...response.data].sort(
                        (a, b) =>
                            a.display_order -
                            b.display_order
                    );


                set({
                    customFields: sortedCustomFields,
                    isLoaded: true,
                });

            } finally {

                set({
                    isLoading: false,
                });

            }
        },


        // Filtra os campos já carregados pelo módulo.
        //
        // activeOnly = true:
        // usado normalmente nos formulários.
        //
        // activeOnly = false:
        // pode ser usado em telas administrativas.
        getCustomFieldsByModule: (
            module,
            activeOnly = true
        ) => {

            return get()
                .customFields
                .filter((customField) => {

                    if (
                        customField.module !== module
                    ) {
                        return false;
                    }


                    if (
                        activeOnly &&
                        !customField.active
                    ) {
                        return false;
                    }


                    return true;
                })
                .sort(
                    (a, b) =>
                        a.display_order -
                        b.display_order
                );
        },


        // Adiciona um novo campo na store.
        addCustomField: (
            customField
        ) => {

            set((state) => ({
                customFields: [
                    ...state.customFields,
                    customField,
                ].sort(
                    (a, b) =>
                        a.display_order -
                        b.display_order
                ),
            }));
        },


        // Atualiza um campo existente na store.
        updateCustomField: (
            updatedCustomField
        ) => {

            set((state) => ({
                customFields:
                    state.customFields
                        .map((customField) =>
                            customField.id ===
                                updatedCustomField.id
                                ? updatedCustomField
                                : customField
                        )
                        .sort(
                            (a, b) =>
                                a.display_order -
                                b.display_order
                        ),
            }));
        },


        // Remove um campo da store.
        removeCustomField: (
            customFieldId
        ) => {

            set((state) => ({
                customFields:
                    state.customFields.filter(
                        (customField) =>
                            customField.id !==
                            customFieldId
                    ),
            }));
        },


        // Seleciona um campo para edição.
        setSelectedCustomField: (
            customField
        ) => {

            set({
                selectedCustomField:
                    customField,
            });
        },


        // Limpa o campo selecionado.
        clearSelectedCustomField: () => {

            set({
                selectedCustomField: null,
            });
        },


        // Limpa completamente o estado
        // dos campos personalizados.
        clearCustomFields: () => {

            set({
                customFields: [],
                selectedCustomField: null,
                isLoading: false,
                isLoaded: false,
            });
        },

    }));