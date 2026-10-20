import { useCallback, useId, useState } from "react";
import { CalendarClock, ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { formatDate } from "../../../shared/utils/format";
import { FollowupService, buckets, type Bucket } from "../services/followup.service";
import { buttonClass, fieldClass } from "../components/FollowupPanel";

const statuses = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", FINALIZADO: "Finalizada", CANCELADO: "Cancelada" };
export function FollowupsPage() {
  const assignedId = useId();
  const [bucket, setBucket] = useState<Bucket>("open");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [assigned, setAssigned] = useState("");
  const load = useCallback((signal: AbortSignal) => FollowupService.list({ page, bucket, search: term, assigned_to_id: assigned ? Number(assigned) : undefined }, signal), [page, bucket, term, assigned]);
  const { data, error, isLoading, refresh } = useAsyncResource(`followups:${page}:${bucket}:${term}:${assigned}`, load);
  const team = useAsyncResource("followup-team", FollowupService.team);
  return <section aria-label="Agenda de serviços" className="mx-auto max-w-7xl p-4 text-slate-200 sm:p-6 lg:p-8">
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2 text-sm text-blue-300"><CalendarClock size={20} />Agenda de serviços</div><h1 className="text-2xl font-semibold text-white sm:text-3xl">Prazos e acompanhamentos</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Organize entregas, acompanhe retornos e mantenha a equipe informada sobre cada ordem de serviço.</p></div>
      <button className={buttonClass} disabled={isLoading} onClick={refresh}><RefreshCw size={16} className="mr-2" />Atualizar agenda</button>
    </header>
    <form aria-label="Filtrar acompanhamentos" className="mb-5 grid items-end gap-3 rounded-2xl border border-[#16345c] bg-[#07182d] p-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={event => { event.preventDefault(); setTerm(search.trim()); setPage(1); }}>
      <label className="min-w-0 text-sm">Buscar OS ou cliente<input className={fieldClass} value={search} maxLength={100} onChange={event => setSearch(event.target.value)} placeholder="Número, título ou cliente" /></label>
      <div className="min-w-0"><label htmlFor={assignedId} className="text-sm">Filtrar por responsável</label><select id={assignedId} className={fieldClass} value={assigned} onChange={event => { setAssigned(event.target.value); setPage(1); }}><option value="">Toda a equipe</option>{team.data?.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
      <button className={buttonClass}>Buscar</button>
    </form>
    {team.error && <RequestError message={team.error} onRetry={team.refresh} />}
    <div aria-label="Situação dos prazos" className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {(Object.entries(buckets) as [Bucket, string][]).map(([key, label]) => <button key={key} type="button" aria-pressed={bucket === key} onClick={() => { setBucket(key); setPage(1); }} className={`min-h-20 rounded-xl border p-3 text-left text-xs ${key === bucket ? "border-blue-400 bg-blue-500/15 text-blue-200" : "border-[#16345c] bg-[#07182d] text-slate-400"}`}><span className="block">{label}</span><strong className="mt-2 block text-xl">{isLoading ? "…" : data?.summary[key] ?? "—"}</strong></button>)}
    </div>
    <p className="mb-4 text-xs text-slate-400">Retornos pendentes incluem hoje e dias anteriores. Próximos 7 dias começam amanhã. Referência: {data ? formatDate(data.today) : "hoje"}, São Paulo.</p>
    {error && <RequestError message={error} onRetry={refresh} />}
    {isLoading && <p role="status" className="py-8 text-slate-400">Carregando agenda…</p>}
    {data && !isLoading && <>
      <p className="mb-3 text-sm text-slate-400">{data.total} {data.total === 1 ? "ordem encontrada" : "ordens encontradas"}</p>
      {!data.items.length && <div className="rounded-2xl border border-dashed border-[#24436b] p-8 text-center"><h2 className="font-semibold text-white">Nenhuma ordem neste filtro</h2><p className="mt-2 text-sm text-slate-400">As ordens sem data aparecem em “Sem prazo”. Abra uma OS para definir o planejamento.</p><Link to="/work-orders/create" className={`${buttonClass} mt-5`}>Criar ordem de serviço</Link></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map(order => <article key={order.id} className="min-w-0 rounded-2xl border border-[#16345c] bg-[#07182d] p-5">
          <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span>OS #{order.id}</span><span>{statuses[order.status_service]}</span></div>
          <h2 className="mt-3 break-words text-lg font-semibold text-white">{order.title}</h2><p className="mt-1 break-words text-sm text-slate-400">{order.client_name}</p>
          <div className="my-4 flex flex-wrap gap-2 text-xs">{order.overdue && <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">Entrega atrasada</span>}{order.followup_pending && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-300">Retorno pendente</span>}</div>
          <dl className="space-y-2 text-sm"><div><dt className="text-slate-400">Entrega</dt><dd>{formatDate(order.due_on)}</dd></div><div><dt className="text-slate-400">Próximo retorno</dt><dd>{formatDate(order.next_followup_on)}</dd></div><div><dt className="text-slate-400">Responsável</dt><dd className="break-words">{order.assigned_to_name || "Não definido"}</dd></div></dl>
          <Link aria-label={`Acompanhar OS #${order.id}`} to={`/work-orders/${order.id}/details#acompanhamento`} className={`${buttonClass} mt-5 w-full gap-2`}>Acompanhar OS<ArrowUpRight size={16} /></Link>
        </article>)}
      </div>
      {data.total_pages > 1 && <nav aria-label="Paginação dos acompanhamentos" className="mt-6 flex flex-wrap items-center justify-between gap-3"><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span className="text-sm">Página {page} de {data.total_pages}</span><button className={buttonClass} disabled={page >= data.total_pages} onClick={() => setPage(value => value + 1)}>Próxima</button></nav>}
    </>}
  </section>;
}
