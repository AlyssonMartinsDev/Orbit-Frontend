import type { PaymentMethod } from "../../modules/work-orders/services/payment.service";

export interface PaymentDetails {
  pix_key?: string | null;
  card_operator?: string | null;
  payment_url?: string | null;
  bank?: string | null;
  agency?: string | null;
  account?: string | null;
  account_type?: "CORRENTE" | "POUPANCA" | "PAGAMENTO" | "OUTRO" | null;
  holder?: string | null;
  holder_document?: string | null;
  description?: string | null;
}

export const accountTypes = { CORRENTE: "Corrente", POUPANCA: "Poupança", PAGAMENTO: "Conta de pagamento", OUTRO: "Outro" } as const;
interface DetailField { key: keyof PaymentDetails; label: string; maxLength?: number; type?: "url" }
export const paymentDetailFields: Record<PaymentMethod, readonly DetailField[]> = {
  PIX: [{ key: "pix_key", label: "Chave PIX", maxLength: 140 }],
  CARTAO_CREDITO: [{ key: "card_operator", label: "Maquininha ou operadora", maxLength: 100 }],
  CARTAO_DEBITO: [{ key: "card_operator", label: "Maquininha ou operadora", maxLength: 100 }],
  LINK_PAGAMENTO: [{ key: "payment_url", label: "URL do pagamento", maxLength: 2048, type: "url" }],
  TRANSFERENCIA: [
    { key: "bank", label: "Banco", maxLength: 100 },
    { key: "agency", label: "Agência", maxLength: 30 },
    { key: "account", label: "Conta", maxLength: 40 },
    { key: "account_type", label: "Tipo de conta" },
    { key: "holder", label: "Titular", maxLength: 150 },
    { key: "holder_document", label: "CPF/CNPJ do titular (opcional)", maxLength: 18 },
  ],
  DINHEIRO: [],
  OUTRO: [{ key: "description", label: "Descrição do pagamento", maxLength: 500 }],
};
