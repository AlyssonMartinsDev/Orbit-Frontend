import type { DocumentProduct } from "../../inventory/types/document-product.types";
import type { PaymentDetails } from "../../../shared/types/payment-details";
import type { WorkOrderCustomValueRequest, CustomFieldDefinitionSimpleResponse } from "../../custom-fields/types/custom-field.types";
import type { LineItem, PricingMode } from "../../../shared/components/pricing/pricing";
import type { PaymentMethod } from "../../work-orders/services/payment.service";
import { api } from "../../../shared/services/api";
import { requireResponseData, type ApiResponse } from "../../../shared/types/api.types";

export const quoteStatuses = {
  RASCUNHO: "Rascunho", ENVIADO: "Enviado", APROVADO: "Aprovado",
  RECUSADO: "Recusado", CANCELADO: "Cancelado", CONVERTIDO: "Convertido em OS",
} as const;
export type QuoteStatus = keyof typeof quoteStatuses;
export interface QuoteData {
  products?: DocumentProduct[];
  service_price?: string | null;
  products_total?: string;
  payment_details?: PaymentDetails | null;
  payment_method?: PaymentMethod | null;
  custom_values?: WorkOrderCustomValueRequest[];
  pricing_mode?: PricingMode;
  items?: LineItem[];
  client_id: number;
  title: string;
  description: string;
  price: string;
  valid_until: string | null;
  terms: string | null;
}
export interface Quote extends QuoteData {
  payment_details: PaymentDetails | null;
  payment_method: PaymentMethod | null;
  custom_values: (WorkOrderCustomValueRequest & { field_definition: CustomFieldDefinitionSimpleResponse })[];
  id: number;
  client_name: string;
  status: QuoteStatus;
  version: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  work_order_id: number | null;
  can_manage: boolean;
  expired: boolean;
  events?: { id: number; action: string; note: string | null; version: number; user_name: string; created_at: string }[];
}
export interface QuoteList { items: Quote[]; total: number; page: number; total_pages: number; can_manage: boolean }
export const QuoteService = {
  async list(params: { page: number; search: string; status?: QuoteStatus }, signal?: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<QuoteList>>("/quotes", { params, signal })).data);
  },
  async get(id: number, signal?: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<Quote>>(`/quotes/${id}`, { signal })).data);
  },
  async create(data: QuoteData & { request_id: string }) {
    return requireResponseData((await api.post<ApiResponse<Quote>>("/quotes", data)).data);
  },
  async update(id: number, data: QuoteData & { version: number }) {
    return requireResponseData((await api.put<ApiResponse<Quote>>(`/quotes/${id}`, data)).data);
  },
  async status(id: number, version: number, status: Exclude<QuoteStatus, "CONVERTIDO">, note?: string) {
    return requireResponseData((await api.post<ApiResponse<Quote>>(`/quotes/${id}/status`, { version, status, note })).data);
  },
  async convert(id: number, version: number, custom_values: WorkOrderCustomValueRequest[] = []) {
    return requireResponseData((await api.post<ApiResponse<Quote>>(`/quotes/${id}/convert`, { version, custom_values })).data);
  },
};
