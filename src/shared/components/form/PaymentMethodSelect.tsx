import { useId } from "react";
import { paymentMethods, type PaymentMethod } from "../../../modules/work-orders/services/payment.service";
import { inputClass } from "./FormSection";

export function PaymentMethodSelect({ value, onChange }: {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod | null) => void;
}) {
  const id = useId();
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-2 block text-sm text-[#a7b4c8]">Método de pagamento</label>
    <select id={id} className={inputClass} value={value ?? ""} onChange={event => {
      const method = Object.keys(paymentMethods).find(key => key === event.target.value) as PaymentMethod | undefined;
      onChange(method ?? null);
    }}>
      <option value="">Não informado</option>
      {Object.entries(paymentMethods).map(([method, label]) => <option key={method} value={method}>{label}</option>)}
    </select>
  </div>;
}
