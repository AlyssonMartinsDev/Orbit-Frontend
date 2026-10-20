import { appliesTo } from "../../modules/custom-fields/types/custom-field.types";
import axios from "axios";
import { create } from "zustand";
import { getSession, isCurrentSession } from "../services/session";
import { requireResponseData } from "../types/api.types";
import { CustomFieldService } from "../../modules/custom-fields/services/custom-field.service";
import type {
    CustomFieldDefinitionResponse,
    CustomFieldModule,
} from "../../modules/custom-fields/types/custom-field.types";

interface CustomFieldState {
    customFields: CustomFieldDefinitionResponse[];
    selectedCustomField: CustomFieldDefinitionResponse | null;
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    loadCustomFields: (forceRefresh?: boolean) => Promise<void>;
    getCustomFieldsByModule: (
        module: CustomFieldModule,
        activeOnly?: boolean,
    ) => CustomFieldDefinitionResponse[];
    addCustomField: (field: CustomFieldDefinitionResponse) => void;
    updateCustomField: (field: CustomFieldDefinitionResponse) => void;
    removeCustomField: (id: number) => void;
    setSelectedCustomField: (field: CustomFieldDefinitionResponse) => void;
    clearSelectedCustomField: () => void;
    clearCustomFields: () => void;
}
const sortFields = (fields: CustomFieldDefinitionResponse[]) =>
    [...fields].sort((a, b) => a.display_order - b.display_order);
const emptyState = {
    customFields: [],
    selectedCustomField: null,
    isLoading: false,
    isLoaded: false,
    error: null,
};
let version = 0;

export const useCustomFieldStore = create<CustomFieldState>((set, get) => ({
    ...emptyState,
    loadCustomFields: async (forceRefresh = false) => {
        const sessionId = getSession().id;
        if (!forceRefresh && (get().isLoading || get().isLoaded)) return;
        const requestVersion = ++version;
        const current = () =>
            isCurrentSession(sessionId) && requestVersion === version;
        set({ isLoading: true, error: null });
        try {
            const customFields = sortFields(
                requireResponseData(await CustomFieldService.getAll()),
            );
            if (current()) set({ customFields, isLoaded: true });
        } catch (error) {
            if (current() && !axios.isCancel(error))
                set({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os campos personalizados.",
                });
        } finally {
            if (current()) set({ isLoading: false });
        }
    },
    getCustomFieldsByModule: (module, activeOnly = true) =>
        get().customFields.filter(
            (field) => appliesTo(field.module, module) && (!activeOnly || field.active),
        ),
    addCustomField: (field) => {
        version++;
        set((state) => ({
            customFields: sortFields([
                ...state.customFields.filter((item) => item.id !== field.id),
                field,
            ]),
            isLoading: false,
        }));
    },
    updateCustomField: (field) => {
        version++;
        set((state) => ({
            customFields: sortFields(
                state.customFields.map((item) =>
                    item.id === field.id ? field : item,
                ),
            ),
            isLoading: false,
        }));
    },
    removeCustomField: (id) => {
        version++;
        set((state) => ({
            customFields: state.customFields.filter((item) => item.id !== id),
            isLoading: false,
        }));
    },
    setSelectedCustomField: (selectedCustomField) =>
        set({ selectedCustomField }),
    clearSelectedCustomField: () => set({ selectedCustomField: null }),
    clearCustomFields: () => {
        version++;
        set(emptyState);
    },
}));
