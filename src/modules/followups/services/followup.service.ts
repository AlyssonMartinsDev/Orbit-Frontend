import { api } from "../../../shared/services/api";
import { requireResponseData, type ApiResponse } from "../../../shared/types/api.types";
import type { WorkOrderStatus } from "../../work-orders/types/work-order.types";

export const buckets = {
  open: "Em aberto", overdue: "Atrasadas", today: "Entrega hoje", week: "Próximos 7 dias",
  followup: "Retornos pendentes", unscheduled: "Sem prazo", closed: "Encerradas",
} as const;
export type Bucket = keyof typeof buckets;
export interface Plan {
  due_on: string | null;
  next_followup_on: string | null;
  assigned_to_id: number | null;
}
export interface FollowupItem extends Plan {
  id: number;
  title: string;
  client_name: string;
  assigned_to_name: string | null;
  status_service: WorkOrderStatus;
  version: number;
  overdue: boolean;
  followup_pending: boolean;
}
export interface FollowupDetail extends FollowupItem {
  can_manage: boolean;
  events: { id: number; kind: "PLAN" | "NOTE"; note: string; user_name: string; created_at: string; version: number; snapshot: Plan & { assigned_to_name: string | null } }[];
  page: number;
  total_pages: number;
}
export interface FollowupList {
  items: FollowupItem[];
  summary: Record<Bucket, number>;
  total: number;
  page: number;
  total_pages: number;
  today: string;
}
export interface TeamMember { id: number; name: string }
export const FollowupService = {
  async list(params: { page: number; bucket: Bucket; search: string; assigned_to_id?: number }, signal?: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<FollowupList>>("/followups", { params, signal })).data);
  },
  async team(signal?: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<TeamMember[]>>("/followups/team", { signal })).data);
  },
  async get(id: number, page: number, signal?: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<FollowupDetail>>(`/followups/${id}`, { params: { page }, signal })).data);
  },
  async update(id: number, data: Plan & { version: number; note: string; request_id: string }) {
    return requireResponseData((await api.put<ApiResponse<FollowupDetail>>(`/followups/${id}`, data)).data);
  },
  async note(id: number, note: string, request_id: string) {
    return requireResponseData((await api.post<ApiResponse<FollowupDetail>>(`/followups/${id}/notes`, { note, request_id })).data);
  },
};
