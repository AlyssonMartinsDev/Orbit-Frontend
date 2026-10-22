import { create } from "zustand";
import { subscribeToSession } from "../../../shared/services/session";
import type { InventoryFilters } from "../types/inventory.types";

interface InventoryState {
    filters: InventoryFilters;
    setFilters: (changes: Partial<InventoryFilters>) => void;
    reset: () => void;
}
export const useInventoryStore = create<InventoryState>((set) => ({
    filters: { page: 1, search: "" },
    setFilters: (changes) => set(state => ({ filters: { ...state.filters, page: 1, ...changes } })),
    reset: () => set({ filters: { page: 1, search: "" } }),
}));
subscribeToSession(() => useInventoryStore.getState().reset());
