import { api } from "../../../shared/services/api";
import {
  requireResponseData,
  type ApiResponse,
} from "../../../shared/types/api.types";

export const paymentMethods = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
} as const;
export type PaymentMethod = keyof typeof paymentMethods;
export interface Payment {
  id: number;
  amount: string;
  received_on: string;
  method: PaymentMethod;
  notes: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  canceled_at: string | null;
  canceled_by: number | null;
  canceled_by_name: string | null;
  cancel_reason: string | null;
}
export interface PaymentSummary {
  total: string;
  received: string;
  balance: string | null;
  status_payment: string;
  review_required: boolean;
  can_register: boolean;
  can_cancel: boolean;
  payments: Payment[];
}
export interface NewPayment {
  amount: string;
  received_on: string;
  method: PaymentMethod;
  notes: string | null;
  request_id: string;
}
const path = (id: number) => `/work_orders/${id}/payments`;
export const PaymentService = {
  async list(id: number, signal?: AbortSignal) {
    return requireResponseData(
      (await api.get<ApiResponse<PaymentSummary>>(path(id), { signal })).data,
    );
  },
  async create(id: number, payload: NewPayment) {
    return requireResponseData(
      (await api.post<ApiResponse<PaymentSummary>>(path(id), payload)).data,
    );
  },
  async cancel(id: number, paymentId: number, reason: string) {
    return requireResponseData(
      (
        await api.post<ApiResponse<PaymentSummary>>(
          `${path(id)}/${paymentId}/cancel`,
          { reason },
        )
      ).data,
    );
  },
  async review(id: number) {
    return requireResponseData(
      (await api.post<ApiResponse<PaymentSummary>>(`${path(id)}/review`)).data,
    );
  },
};
