import type { PaymentMethod } from "../../../modules/work-orders/services/payment.service";
import { accountTypes, paymentDetailFields, type PaymentDetails } from "../../types/payment-details";

export function PaymentDetailsSummary({ method, details }: { method: PaymentMethod | null; details: PaymentDetails | null }) {
  const fields = method ? paymentDetailFields[method].filter(field => details?.[field.key]) : [];
  if (!fields.length) return null;
  return <dl className="mt-3 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
    {fields.map(field => <div key={field.key} className="min-w-0">
      <dt className="text-[#8290a8]">{field.label}{field.key === "card_operator" ? " (interno)" : ""}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-[#f8fafc]">{field.key === "account_type" && details?.account_type ? accountTypes[details.account_type] : details?.[field.key]}</dd>
    </div>)}
  </dl>;
}
