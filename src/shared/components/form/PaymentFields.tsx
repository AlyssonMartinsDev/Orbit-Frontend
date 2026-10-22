import { useId } from "react";
import type { PaymentMethod } from "../../../modules/work-orders/services/payment.service";
import { accountTypes, paymentDetailFields, type PaymentDetails } from "../../types/payment-details";
import { inputClass } from "./FormSection";
import { PaymentMethodSelect } from "./PaymentMethodSelect";

export function PaymentFields({ method, details, onChange }: {
  method: PaymentMethod | null;
  details: PaymentDetails | null;
  onChange: (method: PaymentMethod | null, details: PaymentDetails | null) => void;
}) {
  const id = useId();
  const fields = method ? paymentDetailFields[method] : [];
  return <div className="min-w-0 space-y-4 sm:col-span-2">
    <PaymentMethodSelect value={method} onChange={value => onChange(value, value === method ? details : null)} />
    {!!fields.length && <div className="grid gap-4 rounded-xl border border-[#16345c] bg-[#07182d]/60 p-4 sm:grid-cols-2">
      {fields.map(field => <div key={field.key} className="min-w-0">
        <label htmlFor={`${id}-${field.key}`} className="mb-2 block text-sm text-[#a7b4c8]">{field.label}</label>
        {field.key === "account_type" ? <select id={`${id}-${field.key}`} className={inputClass} value={details?.account_type ?? ""} onChange={event => {
          const value = Object.keys(accountTypes).find(key => key === event.target.value) as keyof typeof accountTypes | undefined;
          onChange(method, { ...details, account_type: value ?? null });
        }}>
          <option value="">Não informado</option>
          {Object.entries(accountTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select> : <input id={`${id}-${field.key}`} className={inputClass} type={field.type ?? "text"} maxLength={field.maxLength} value={details?.[field.key] ?? ""} onChange={event => onChange(method, { ...details, [field.key]: event.target.value || null })} />}
      </div>)}
      {(method === "CARTAO_CREDITO" || method === "CARTAO_DEBITO") && <p className="text-xs leading-5 text-[#8290a8] sm:col-span-2">Uso interno; não aparece no PDF. Informe apenas a maquininha ou operadora, nunca número do cartão, CVV ou senha.</p>}
    </div>}
  </div>;
}
