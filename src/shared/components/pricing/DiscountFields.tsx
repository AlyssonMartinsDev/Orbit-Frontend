import { formatCurrency } from "../../utils/format";
import { inputClass } from "../form/FormSection";
import { discountedTotal, type DiscountType } from "./pricing";

export function DiscountFields({ subtotal, type, value, onChange }: {
  subtotal: string | null;
  type: DiscountType | null;
  value: string | null;
  onChange: (type: DiscountType | null, value: string | null) => void;
}) {
  const result = subtotal === null ? null : discountedTotal(subtotal, type, value);
  return <section aria-label="Desconto" className="space-y-3 rounded-xl border border-[#24436b] bg-[#07182d] p-3 sm:p-5">
    <h2 className="font-semibold text-white">Desconto</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-slate-300">Tipo de desconto<select className={`${inputClass} mt-1`} value={type ?? ""} onChange={event => onChange(event.target.value ? event.target.value as DiscountType : null, null)}><option value="">Sem desconto</option><option value="PERCENT">Porcentagem (%)</option><option value="AMOUNT">Valor fixo (R$)</option></select></label>
      {type && <label className="text-sm text-slate-300">{type === "PERCENT" ? "Percentual (%)" : "Valor do desconto (R$)"}<input className={`${inputClass} mt-1`} type="number" inputMode="decimal" min="0.01" max={type === "PERCENT" ? "100" : subtotal ?? undefined} step="0.01" required value={value ?? ""} onChange={event => onChange(type, event.target.value)} /></label>}
    </div>
    {type && <div className="grid gap-2 text-sm sm:grid-cols-3"><p>Subtotal: <strong>{subtotal === null ? "—" : formatCurrency(subtotal)}</strong></p><p>Desconto: <strong>{result ? formatCurrency(result.discount) : "—"}</strong></p><p>Total final: <strong aria-live="polite">{result ? formatCurrency(result.total) : "—"}</strong></p></div>}
    {type && value && !result && <p role="alert" className="text-sm text-amber-200">O desconto deve ser maior que zero e não pode superar o subtotal.</p>}
  </section>;
}
