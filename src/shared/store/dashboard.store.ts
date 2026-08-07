import { create } from "zustand";

import { DashboardService } from "../../modules/dashboard/services/dashboard.service";
import type { DashboardSummary } from "../../modules/dashboard/types/dashboard.types";

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  isLoaded: boolean;

  loadSummary: (forceRefresh?: boolean) => Promise<void>;
  clearSummary: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  isLoading: false,
  isLoaded: false,

  loadSummary: async (forceRefresh = false) => {
    const { isLoading, isLoaded } = get();

    if (isLoading) {
      return;
    }

    if (isLoaded && !forceRefresh) {
      return;
    }

    set({
      isLoading: true,
    });

    try {
      const response = await DashboardService.getSummary();

      if (!response.success || !response.data) {
        return;
      }

      set({
        summary: response.data,
        isLoaded: true,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  clearSummary: () => {
    set({
      summary: null,
      isLoading: false,
      isLoaded: false,
    });
  },
}));