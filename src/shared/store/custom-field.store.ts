import { create } from "zustand";

import { CustomFieldService } from "../../modules/custom-fields/services/custom-field.service";

import type {
    CustomFieldDefinitionResponse,
} from "../../modules/custom-fields/types/custom-field.types";


interface CustomFieldState {
    customFields: CustomFieldDefinitionResponse[];
    selectedCustomField: CustomFieldDefinitionResponse | null;

    isLoading: boolean;
    isLoaded: boolean;

    loadCustomFields: (
        forceRefresh?: boolean
    ) => Promise<void>;

    addCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;

    updateCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;

    removeCustomField: (
        customFieldId: number
    ) => void;

    // Guarda o campo selecionado para edição
    setSelectedCustomField: (
        customField: CustomFieldDefinitionResponse
    ) => void;

    // Limpa o campo selecionado
    clearSelectedCustomField: () => void;

    clearCustomFields: () => void;
}


export const useCustomFieldStore =
    create<CustomFieldState>((set, get) => ({
        customFields: [],

        isLoading: false,
        isLoaded: false,
        selectedCustomField: null,



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

                set({
                    customFields: response.data,
                    isLoaded: true,
                });

            } finally {
                set({
                    isLoading: false,
                });
            }
        },


        addCustomField: (customField) => {
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


        clearCustomFields: () => {
            set({
                customFields: [],
                selectedCustomField: null,
                isLoading: false,
                isLoaded: false,
            });
        },

        setSelectedCustomField: (customField) => {
            set({
                selectedCustomField: customField,
            });
        },

        clearSelectedCustomField: () => {
            set({
                selectedCustomField: null,
            });
        },
    }));