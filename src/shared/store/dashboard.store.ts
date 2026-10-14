import axios from "axios";
import { create } from "zustand";
import { getSession, isCurrentSession } from "../services/session";
import { DashboardService } from "../../modules/dashboard/services/dashboard.service";
import { requireResponseData } from "../types/api.types";
import type { DashboardSummary } from "../../modules/dashboard/types/dashboard.types";

interface DashboardState {
    summary: DashboardSummary | null;
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    loadSummary: (forceRefresh?: boolean) => Promise<void>;
    clearSummary: () => void;
}
let version = 0;
const emptyState = {
    summary: null,
    isLoading: false,
    isLoaded: false,
    error: null,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
    ...emptyState,
    loadSummary: async (forceRefresh = false) => {
        const sessionId = getSession().id;
        if (!forceRefresh && (get().isLoading || get().isLoaded)) return;
        const requestVersion = ++version;
        const current = () =>
            isCurrentSession(sessionId) && requestVersion === version;
        set({ isLoading: true, error: null });
        try {
            const summary = requireResponseData(
                await DashboardService.getSummary(),
            );
            if (current()) set({ summary, isLoaded: true });
        } catch (error) {
            if (current() && !axios.isCancel(error))
                set({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar o painel.",
                });
        } finally {
            if (current()) set({ isLoading: false });
        }
    },
    clearSummary: () => {
        version++;
        set(emptyState);
    },
}));
