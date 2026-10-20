import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import { inputClass, secondaryButtonClass } from "../form/FormSection";
import { formatCurrency } from "../../utils/format";
import { itemsTotal, lineAmount, type LineItem, type PricingMode } from "./pricing";

interface Props {
  mode: PricingMode;
  items: LineItem[];
  price: string;
  priceLabel: string;
  onChange: (value: { pricing_mode: PricingMode; items: LineItem[]; price: string }) => void;
}
export function PricingEditor({ mode, items, price, priceLabel, onChange }: Props) {
  const id = useId();
  const total = itemsTotal(items);
  const changeItems = (next: LineItem[]) => onChange({ pricing_mode: mode, items: next, price });
  const change = (index: number, key: keyof LineItem, value: string) => changeItems(items.map((item, current) => current === index ? { ...item, [key]: value } : item));
  return <section aria-label="Valores e itens" className="min-w-0 space-y-4 rounded-xl border border-[#24436b] p-4 sm:p-5">
    <h3 className="font-semibold text-white">Como deseja informar o valor?</h3>
    <div className="grid gap-3 sm:grid-cols-2">
      {([['SIMPLE', 'Valor único'], ['ITEMIZED', 'Detalhar itens']] as const).map(([value, label]) => <label key={value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${mode === value ? 'border-blue-400 bg-blue-500/10 text-blue-200' : 'border-[#24436b] text-slate-300'}`}><input type="radio" name={`${id}-mode`} value={value} checked={mode === value} onChange={() => onChange({ pricing_mode: value, items: value === 'ITEMIZED' && !items.length ? [{ description: '', quantity: '1', unit_price: price || '0' }] : items, price: value === 'SIMPLE' && mode === 'ITEMIZED' ? total ?? price : price })} />{label}</label>)}
    </div>
    {mode === "SIMPLE" ? <>
      <p className="text-sm text-slate-400">Descreva o serviço livremente e informe seu valor total. O detalhamento em itens é opcional.</p>
      <label htmlFor={`${id}-price`} className="block text-sm text-slate-300">{priceLabel} *</label>
      <input id={`${id}-price`} type="number" inputMode="decimal" min="0" max="99999999.99" step="0.01" required value={price} onChange={event => onChange({ pricing_mode: mode, items, price: event.target.value })} className={inputClass} />
      {items.length > 0 && <p className="text-xs text-amber-200">Ao salvar com valor único, o documento ficará sem a lista de itens. O valor acima será utilizado.</p>}
    </> : <>
      <p className="text-sm text-slate-400">Adicione serviços, mão de obra, peças ou materiais. A descrição geral continua disponível.</p>
      <div className="space-y-4">
        {items.map((item, index) => <fieldset key={index} className="min-w-0 rounded-xl border border-[#24436b] p-3 sm:p-4">
          <legend className="px-1 text-sm font-medium text-blue-200">Item {index + 1}</legend>
          <label className="block text-sm text-slate-300">Descrição do item {index + 1}<textarea required maxLength={500} rows={2} className={`${inputClass} mt-2`} value={item.description} onChange={event => change(index, "description", event.target.value)} /></label>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="min-w-0 text-sm text-slate-300">Quantidade do item {index + 1}<input type="number" inputMode="decimal" min="0.001" max="999999.999" step="0.001" required value={item.quantity} onChange={event => change(index, "quantity", event.target.value)} className={`${inputClass} mt-2`} /></label>
            <label className="min-w-0 text-sm text-slate-300">Valor unitário do item {index + 1} (R$)<input type="number" inputMode="decimal" min="0" max="99999999.99" step="0.01" required value={item.unit_price} onChange={event => change(index, "unit_price", event.target.value)} className={`${inputClass} mt-2`} /></label>
            <div className="min-w-0 text-sm"><p className="text-slate-400">Subtotal</p><p className="mt-3 break-words font-semibold text-white">{lineAmount(item) === null ? "—" : formatCurrency(lineAmount(item)!)}</p></div>
          </div>
          <button type="button" className="mt-2 flex min-h-11 items-center gap-2 px-2 text-sm text-red-300" aria-label={`Remover item ${index + 1}`} onClick={() => changeItems(items.filter((_, current) => current !== index))}><Trash2 size={16} />Remover item</button>
        </fieldset>)}
      </div>
      <button type="button" disabled={items.length >= 100} className={secondaryButtonClass} onClick={() => changeItems([...items, { description: "", quantity: "1", unit_price: "0" }])}><Plus size={18} />Adicionar item</button>
      <div className="rounded-xl bg-blue-500/10 p-4"><p className="text-sm text-blue-200">Total calculado pelos itens</p><p aria-live="polite" className="mt-1 break-words text-xl font-semibold text-white">{total === null ? "—" : formatCurrency(total)}</p><p className="mt-2 text-xs text-slate-400">Cada subtotal é arredondado para centavos antes da soma.</p></div>
      {total === null && <p role="alert" className="text-sm text-amber-200">Adicione ao menos um item e confira quantidades e valores. O total máximo é R$ 99.999.999,99.</p>}
    </>}
  </section>;
}
