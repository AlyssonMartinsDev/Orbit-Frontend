import { api } from "../../../shared/services/api";

import type { DashboardSummaryResponse } from "../types/dashboard.types";

export class DashboardService {
  static async getSummary(): Promise<DashboardSummaryResponse> {
    const response = await api.get<DashboardSummaryResponse>(
      "/dashboard/summary"
    );

    return response.data;
  }
}