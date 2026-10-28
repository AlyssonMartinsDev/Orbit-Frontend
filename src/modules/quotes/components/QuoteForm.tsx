import { DocumentItemsEditor } from "../../../shared/components/pricing/DocumentItemsEditor";
import { productPayload, productsTotal } from "../../inventory/types/document-product.types";
import { CustomFieldInput } from "../../custom-fields/components/CustomFieldInput";
import { useDocumentFields } from "../../custom-fields/hooks/useDocumentFields";
import { PaymentFields } from "../../../shared/components/form/PaymentFields";
import { itemizedDraft, itemsTotal, sumAmounts } from "../../../shared/components/pricing/pricing";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClientSelect } from "../../clients/components/ClientSelect";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { SettingsField, SaveError } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { QuoteService, type Quote, type QuoteData } from "../services/quote.service";

export function QuoteForm({ quote, onSaved, onCancel }: { quote?: Quote; onSaved: (quote: Quote) => void; onCancel?: () => void }) {
  const clientFieldId = useId();
  const { data: fields, isLoading: fieldsLoading, error: fieldsError, refresh: refreshFields } = useDocumentFields("QUOTE");
  const [customValues, setCustomValues] = useState<Record<number, string>>(() => Object.fromEntries(
    quote?.custom_values.map(item => [item.field_definition_id, item.value ?? ""]) ?? [],
  ));
  const [data, setData] = useState<QuoteData>(() => ({ payment_method: quote?.payment_method ?? null, payment_details: quote?.payment_details ?? null, ...itemizedDraft(quote), client_id: quote?.client_id ?? 0, title: quote?.title ?? "", products: quote?.products ?? [], valid_until: quote?.valid_until ?? null, terms: quote?.terms ?? null }));
  const [itemsError, setItemsError] = useState<string | null>(null);
  const { busy, error, run } = useSettingsMutation();
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const field = <K extends keyof QuoteData>(key: K, value: QuoteData[K]) => setData(current => ({ ...current, [key]: value }));
  return <form aria-label={quote ? "Editar orçamento" : "Novo orçamento"} className="space-y-5" onSubmit={event => {
    event.preventDefault();
    if (!data.client_id || !fields || fieldsLoading || fieldsError) return;
    setItemsError(null);
    if (!data.items?.length && !data.products?.length) { setItemsError("Adicione pelo menos um produto ou serviço."); return; }
    if (data.items?.some(item => !item.description.trim())) { setItemsError("Preencha a descrição de todos os itens."); return; }
    const price = itemsTotal(data.items ?? [], true);
    if (price === null || productsTotal(data.products ?? []) === null || sumAmounts([price, productsTotal(data.products ?? [])!]) === null) { setItemsError("Confira quantidades e valores. O total máximo é R$ 99.999.999,99."); return; }
    const payload = { ...data, products: productPayload(data.products ?? []), service_price: price, custom_values: fields.map(field => ({ field_definition_id: field.id, value: customValues[field.id]?.trim() || null })), price, items: data.items ?? [] };
    const fingerprint = JSON.stringify(payload);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    const requestId = request.current.id;
    void run(() => quote ? QuoteService.update(quote.id, { ...payload, version: quote.version }) : QuoteService.create({ ...payload, request_id: requestId }), onSaved);
  }}>
    <SaveError message={error} />
    {fieldsError && <RequestError message={fieldsError} onRetry={refreshFields} />}
    {fieldsLoading && <p role="status" className="text-sm">Carregando campos do orçamento…</p>}
    <fieldset disabled={busy} className="min-w-0 space-y-5">
      <ClientSelect value={data.client_id} onChange={value => field("client_id", value)} />
      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/clients/create" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Cadastrar cliente em outra aba</Link>
      </div>
      <SettingsField label="Título do orçamento" required maxLength={255} value={data.title} onChange={e => field("title", e.target.value)} />
      <DocumentItemsEditor quote items={data.items ?? []} products={data.products ?? []} onChange={value => { setItemsError(null); setData(current => ({ ...current, ...value })); }} />
      <SaveError message={itemsError} />
      <PaymentFields method={data.payment_method ?? null} details={data.payment_details ?? null} onChange={(payment_method, payment_details) => setData(current => ({ ...current, payment_method, payment_details }))} />
      <div className="grid gap-5 sm:grid-cols-2">

        <SettingsField label="Válido até" type="date" value={data.valid_until ?? ""} onChange={e => field("valid_until", e.target.value || null)} />
      </div>
      <label className="block text-sm text-[#a7b4c8]">Condições e observações
        <textarea maxLength={5000} rows={3} className={`${inputClass} mt-2 resize-y`} value={data.terms ?? ""} onChange={e => field("terms", e.target.value || null)} placeholder="Prazo de execução, condições de pagamento e observações da proposta." />
      </label>
      {!!fields?.length && <section aria-label="Campos personalizados do orçamento" className="space-y-4">
        <h2 className="font-semibold">Informações adicionais</h2>
        <div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <CustomFieldInput key={field.id} field={{ ...field, required: field.required_quote }} id={`${clientFieldId}-custom-${field.id}`} value={customValues[field.id] ?? ""} onChange={value => setCustomValues(current => ({ ...current, [field.id]: value }))} />)}</div>
      </section>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={!data.client_id || !fields || fieldsLoading || !!fieldsError} className={primaryButtonClass}>{busy ? "Salvando…" : "Salvar orçamento"}</button>
        {onCancel && <button type="button" className={secondaryButtonClass} onClick={onCancel}>Voltar sem salvar</button>}
      </div>
    </fieldset>
  </form>;
}
