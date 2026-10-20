import { QuoteConversionForm } from "../components/QuoteConversionForm";
import { ItemsSummary } from "../../../shared/components/pricing/ItemsSummary";
import { useCallback, useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { PdfDownloadButton } from "../../../shared/components/PdfDownloadButton";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { formatCurrency, formatDate, formatDateTime } from "../../../shared/utils/format";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { SettingsService } from "../../settings/services/settings.service";
import { SaveError, SettingsField } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { QuoteForm } from "../components/QuoteForm";
import { QuoteService, quoteStatuses, type Quote, type QuoteStatus } from "../services/quote.service";

const panelClass = "min-w-0 space-y-6 rounded-2xl border border-[#16345c]/40 bg-[#051020]/80 p-4 text-[#f8fafc] sm:p-6";

export function QuotesPage() {
  const statusFieldId = useId();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ page: number; search: string; status?: QuoteStatus }>({ page: 1, search: "" });
  const load = useCallback((signal: AbortSignal) => QuoteService.list(filters, signal), [filters]);
  const { data, error, isLoading, refresh } = useAsyncResource(JSON.stringify(filters), load);
  return <section className={panelClass}>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Orçamentos</h1><p className="mt-2 text-sm text-[#a7b4c8]">Prepare a proposta, registre a aprovação e gere a ordem de serviço.</p></div>
      {data?.can_manage && <Link to="/quotes/create" className={primaryButtonClass}>Novo orçamento</Link>}
    </header>
    <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={e => { e.preventDefault(); setFilters(current => ({ ...current, search, page: 1 })); }}>
      <SettingsField label="Buscar orçamento ou cliente" value={search} maxLength={100} onChange={e => setSearch(e.target.value)} />
      <div><label htmlFor={statusFieldId} className="text-sm text-[#a7b4c8]">Situação</label><select id={statusFieldId} className={`${inputClass} mt-2`} value={filters.status ?? ""} onChange={e => setFilters(current => ({ ...current, status: e.target.value as QuoteStatus || undefined, page: 1 }))}><option value="">Todas</option>{Object.entries(quoteStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <button type="submit" className={`${secondaryButtonClass} self-end`}>Buscar</button>
    </form>
    {error && <RequestError message={error} onRetry={refresh} />}
    {isLoading && <p role="status">Carregando orçamentos…</p>}
    {data && !isLoading && <>
      <p className="text-sm text-[#a7b4c8]">{data.total} orçamento(s)</p>
      {data.items.length === 0 && <p>Nenhum orçamento encontrado.</p>}
      <ul className="grid gap-4 lg:grid-cols-2">{data.items.map(quote => <li key={quote.id} className="min-w-0 rounded-xl border border-[#16345c] p-4">
        <div className="flex flex-wrap justify-between gap-2 text-sm text-blue-200"><span>#{quote.id} · {quoteStatuses[quote.status]}</span>{quote.expired && <span className="text-amber-200">Validade vencida</span>}</div>
        <h2 className="mt-3 break-words text-lg font-semibold"><Link className="hover:underline" to={`/quotes/${quote.id}`}>{quote.title}</Link></h2>
        <p className="mt-2 break-words text-sm text-[#a7b4c8]">{quote.client_name}</p>
        <p className="my-3 text-xl font-semibold">{formatCurrency(quote.price)}</p>
        <p className="mb-4 text-sm text-[#a7b4c8]">Validade: {quote.valid_until ? formatDate(quote.valid_until) : "Não definida"}</p>
        <Link className={secondaryButtonClass} to={`/quotes/${quote.id}`}>Abrir orçamento #{quote.id}</Link>
      </li>)}</ul>
      {data.total_pages > 1 && <nav aria-label="Paginação dos orçamentos" className="flex flex-wrap items-center gap-3">
        <button disabled={filters.page <= 1} className={secondaryButtonClass} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}>Anterior</button>
        <span className="text-sm">Página {data.page} de {data.total_pages}</span>
        <button disabled={filters.page >= data.total_pages} className={secondaryButtonClass} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}>Próxima</button>
      </nav>}
    </>}
  </section>;
}

export function CreateQuotePage() {
  const navigate = useNavigate();
  const { data: profile, error, refresh } = useAsyncResource("quote-profile", SettingsService.profile);
  return <section className={panelClass}>
    <Link to="/quotes" className="text-sm text-blue-300">← Orçamentos</Link>
    <h1 className="text-2xl font-semibold">Novo orçamento</h1>
    {error && <RequestError message={error} onRetry={refresh} />}
    {!profile && !error && <p role="status">Carregando…</p>}
    {profile && (profile.is_superuser || ["admin", "manager"].includes(profile.role) ? <QuoteForm onSaved={quote => void navigate(`/quotes/${quote.id}`)} /> : <p>Somente administradores e gestores podem cadastrar orçamentos.</p>)}
  </section>;
}

export function QuoteDetailsPage() {
  const { id } = useParams();
  const load = useCallback((signal: AbortSignal) => QuoteService.get(Number(id), signal), [id]);
  const { data, error, isLoading, refresh } = useAsyncResource(`quote:${id}`, load);
  if (error) return <RequestError message={error} onRetry={refresh} />;
  if (!data || isLoading) return <p role="status">Carregando orçamento…</p>;
  return <QuoteDetails key={`${data.id}:${data.version}`} quote={data} refresh={refresh} />;
}

const transitions: Record<QuoteStatus, Exclude<QuoteStatus, "CONVERTIDO">[]> = {
  RASCUNHO: ["ENVIADO", "APROVADO", "CANCELADO"], ENVIADO: ["APROVADO", "RECUSADO", "RASCUNHO", "CANCELADO"],
  APROVADO: ["RASCUNHO", "CANCELADO"], RECUSADO: ["RASCUNHO", "CANCELADO"], CANCELADO: [], CONVERTIDO: [],
};
const actions = { RASCUNHO: "Retornar ao rascunho", ENVIADO: "Marcar como enviado", APROVADO: "Registrar aprovação", RECUSADO: "Marcar como recusado", CANCELADO: "Cancelar orçamento", CONVERTIDO: "Gerar ordem de serviço" };
function QuoteDetails({ quote, refresh }: { quote: Quote; refresh: () => void }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<QuoteStatus | null>(null);
  const [note, setNote] = useState("");
  const { busy, error, run } = useSettingsMutation();
  return <section className={panelClass}>
    <Link to="/quotes" className="text-sm text-blue-300">← Orçamentos</Link>
    <header><p className="text-sm text-blue-200">Orçamento #{quote.id} · {quoteStatuses[quote.status]}</p><h1 className="mt-2 break-words text-2xl font-semibold">{quote.title}</h1><p className="mt-2 break-words text-[#a7b4c8]">{quote.client_name}</p></header>
    {editing ? <QuoteForm quote={quote} onSaved={() => refresh()} onCancel={() => setEditing(false)} /> : <>
      <dl className="grid gap-4 rounded-xl bg-[#010b1b] p-4 sm:grid-cols-3">
        <div><dt className="text-sm text-[#a7b4c8]">Valor do orçamento</dt><dd className="mt-2 text-xl font-semibold">{formatCurrency(quote.price)}</dd></div>
        <div><dt className="text-sm text-[#a7b4c8]">Válido até</dt><dd className="mt-2">{quote.valid_until ? formatDate(quote.valid_until) : "Não definido"}</dd></div>
        <div><dt className="text-sm text-[#a7b4c8]">Criado em</dt><dd className="mt-2">{formatDate(quote.created_at)}</dd></div>
      </dl>
      {quote.expired && <p className="text-sm text-amber-200">Validade vencida. Atualize a proposta antes de registrar a aprovação.</p>}
      <ItemsSummary items={quote.items ?? []} />
      <div><h2 className="font-semibold">Descrição do serviço</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#a7b4c8]">{quote.description}</p></div>
      {quote.custom_values.some(item => item.value !== null) && <section aria-label="Campos personalizados do orçamento">
        <h2 className="font-semibold">Informações adicionais</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">{quote.custom_values.filter(item => item.value !== null).map(item => <div key={item.field_definition_id} className="min-w-0 rounded-xl bg-[#010b1b] p-4">
          <dt className="break-words text-sm text-[#a7b4c8]">{item.field_definition.name}</dt>
          <dd className="mt-2 whitespace-pre-wrap break-words">{item.field_definition.field_type === "BOOLEAN" ? (item.value === "true" ? "Sim" : "Não") : item.field_definition.field_type === "DATE" && item.value ? formatDate(item.value) : item.value}</dd>
        </div>)}</dl>
      </section>}
      {quote.terms && <div><h2 className="font-semibold">Condições e observações</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#a7b4c8]">{quote.terms}</p></div>}
      {quote.work_order_id && <Link className={primaryButtonClass} to={`/work-orders/${quote.work_order_id}/details`}>Abrir ordem de serviço #{quote.work_order_id}</Link>}
      <PdfDownloadButton path={`/quotes/${quote.id}/pdf`} filename={`orcamento-${quote.id}.pdf`} />
      <SaveError message={error} />
      {error && <button className={secondaryButtonClass} onClick={refresh}>Atualizar orçamento</button>}
      {quote.can_manage && <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
        {quote.status === "RASCUNHO" && <button disabled={busy} className={secondaryButtonClass} onClick={() => { setAction(null); setEditing(true); }}>Editar orçamento</button>}
        {quote.status === "APROVADO" && <button disabled={busy || action === "CONVERTIDO"} className={primaryButtonClass} onClick={() => setAction("CONVERTIDO")}>Gerar ordem de serviço</button>}
        {transitions[quote.status].map(status => <button key={status} disabled={busy || action === "CONVERTIDO" || (quote.expired && ["APROVADO", "ENVIADO"].includes(status))} className={secondaryButtonClass} onClick={() => { setNote(""); setAction(status); }}>{actions[status]}</button>)}
      </div>}
      {action === "CONVERTIDO" && <QuoteConversionForm quote={quote} onCancel={() => setAction(null)} onSaved={result => {
        useDashboardStore.getState().clearSummary();
        void navigate(`/work-orders/${result.work_order_id}/details`);
      }} />}
      {action && action !== "CONVERTIDO" && <form aria-label="Confirmar ação do orçamento" className="space-y-4 rounded-xl border border-blue-400/30 p-4" onSubmit={e => {
        e.preventDefault();
        void run(() => QuoteService.status(quote.id, quote.version, action, note.trim() || undefined), result => {
          if (result.work_order_id) { useDashboardStore.getState().clearSummary(); void navigate(`/work-orders/${result.work_order_id}/details`); }
          else refresh();
        });
      }}>
        <p className="text-sm leading-6">{action === "APROVADO" ? "Confirme que o cliente aprovou esta proposta. Esta ação registra a aprovação informada por você; não representa assinatura digital." : action === "ENVIADO" ? "Confirme que a proposta já foi enviada ao cliente. Nenhuma mensagem será enviada por esta ação." : action === "RASCUNHO" ? "A proposta poderá ser editada e precisará de nova aprovação antes de gerar uma OS." : `Confirma: ${actions[action].toLowerCase()}?`}</p>
        <SettingsField label="Observação da alteração" value={note} maxLength={500} disabled={busy} onChange={e => setNote(e.target.value)} />
        <div className="flex flex-col gap-3 sm:flex-row"><button disabled={busy} type="submit" className={primaryButtonClass}>{busy ? "Salvando…" : "Confirmar alteração"}</button><button disabled={busy} type="button" className={secondaryButtonClass} onClick={() => setAction(null)}>Voltar</button></div>
      </form>}
      <div><h2 className="font-semibold">Histórico do orçamento</h2><ul className="mt-3 space-y-3">{quote.events?.map(event => <li key={event.id} className="rounded-xl border border-[#16345c] p-3 text-sm">
        <p>{event.action === "CRIADO" ? "Criado" : event.action === "EDITADO" ? "Editado" : quoteStatuses[event.action as QuoteStatus] ?? event.action} · revisão {event.version}</p><p className="mt-1 break-words text-[#a7b4c8]">{event.user_name} · {formatDateTime(event.created_at)}</p>{event.note && <p className="mt-2 break-words">{event.note}</p>}
      </li>)}</ul></div>
    </>}
  </section>;
}
