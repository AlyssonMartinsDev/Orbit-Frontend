import { PricingEditor } from "../../../shared/components/pricing/PricingEditor";
import { itemsTotal } from "../../../shared/components/pricing/pricing";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useClientStore } from "../../../shared/store/client.store";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { SettingsField, SaveError } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { QuoteService, type Quote, type QuoteData } from "../services/quote.service";

export function QuoteForm({ quote, onSaved, onCancel }: { quote?: Quote; onSaved: (quote: Quote) => void; onCancel?: () => void }) {
  const clientFieldId = useId();
  const [data, setData] = useState<QuoteData>(() => ({ pricing_mode: quote?.pricing_mode ?? "SIMPLE", items: quote?.items ?? [], client_id: quote?.client_id ?? 0, title: quote?.title ?? "", description: quote?.description ?? "", price: quote?.price ?? "", valid_until: quote?.valid_until ?? null, terms: quote?.terms ?? null }));
  const { clients, isLoaded, isLoading, error: clientError, loadClients } = useClientStore();
  const { busy, error, run } = useSettingsMutation();
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  useEffect(() => { void loadClients(); }, [loadClients]);
  const field = <K extends keyof QuoteData>(key: K, value: QuoteData[K]) => setData(current => ({ ...current, [key]: value }));
  return <form aria-label={quote ? "Editar orçamento" : "Novo orçamento"} className="space-y-5" onSubmit={event => {
    event.preventDefault();
    if (!isLoaded || !data.client_id) return;
    const price = data.pricing_mode === "ITEMIZED" ? itemsTotal(data.items ?? []) : data.price;
    if (price === null) return;
    const payload = { ...data, price, items: data.pricing_mode === "ITEMIZED" ? data.items : [] };
    const fingerprint = JSON.stringify(payload);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    const requestId = request.current.id;
    void run(() => quote ? QuoteService.update(quote.id, { ...payload, version: quote.version }) : QuoteService.create({ ...payload, request_id: requestId }), onSaved);
  }}>
    <SaveError message={error} />
    {clientError && <RequestError message={clientError} onRetry={() => void loadClients(true)} />}
    <fieldset disabled={busy} className="min-w-0 space-y-5">
      <div><label htmlFor={clientFieldId} className="block text-sm text-[#a7b4c8]">Cliente *</label>
        <select id={clientFieldId} required disabled={!isLoaded || isLoading} className={`${inputClass} mt-2`} value={data.client_id || ""} onChange={e => field("client_id", Number(e.target.value))}>
          <option value="">{isLoading ? "Carregando clientes…" : "Selecione um cliente"}</option>
          {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/clients/create" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Cadastrar cliente em outra aba</Link>
        <button type="button" disabled={isLoading} className="text-blue-300 underline" onClick={() => void loadClients(true)}>Atualizar clientes</button>
      </div>
      <SettingsField label="Título do orçamento" required maxLength={255} value={data.title} onChange={e => field("title", e.target.value)} />
      <label className="block text-sm text-[#a7b4c8]">Descrição do serviço *
        <textarea required maxLength={20000} rows={5} className={`${inputClass} mt-2 resize-y`} value={data.description} onChange={e => field("description", e.target.value)} />
      </label>
      <PricingEditor mode={data.pricing_mode ?? "SIMPLE"} items={data.items ?? []} price={data.price} priceLabel="Valor do orçamento (R$)" onChange={value => setData(current => ({ ...current, ...value }))} />
      <div className="grid gap-5 sm:grid-cols-2">

        <SettingsField label="Válido até" type="date" value={data.valid_until ?? ""} onChange={e => field("valid_until", e.target.value || null)} />
      </div>
      <label className="block text-sm text-[#a7b4c8]">Condições e observações
        <textarea maxLength={5000} rows={3} className={`${inputClass} mt-2 resize-y`} value={data.terms ?? ""} onChange={e => field("terms", e.target.value || null)} placeholder="Prazo de execução, condições de pagamento e observações da proposta." />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={!isLoaded || isLoading} className={primaryButtonClass}>{busy ? "Salvando…" : "Salvar orçamento"}</button>
        {onCancel && <button type="button" className={secondaryButtonClass} onClick={onCancel}>Voltar sem salvar</button>}
      </div>
    </fieldset>
  </form>;
}
