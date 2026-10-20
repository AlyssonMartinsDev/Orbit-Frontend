import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { formatDate } from "../../../shared/utils/format";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { FollowupService, type FollowupDetail, type Plan } from "../services/followup.service";

export const fieldClass = "mt-1 min-h-11 w-full min-w-0 rounded-xl border border-[#24436b] bg-[#051020] px-3 py-2 text-sm text-white [color-scheme:dark]";
export const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-400/30 px-4 py-2 text-sm text-blue-200 hover:bg-blue-400/10 disabled:opacity-50";
const eventDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function FollowupPanel({ orderId }: { orderId: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const load = useCallback((signal: AbortSignal) => FollowupService.get(orderId, page, signal), [orderId, page]);
  const { data, error, isLoading, refresh } = useAsyncResource(`followup:${orderId}:${page}`, load);
  const [revision, setRevision] = useState(0);
  const loaded = !!data;
  useEffect(() => {
    if (loaded && window.location.hash === "#acompanhamento") sectionRef.current?.scrollIntoView({ block: "start" });
  }, [loaded]);
  const changed = () => { setSuccess(true); setPage(1); setRevision(value => value + 1); refresh(); };
  return <section ref={sectionRef} aria-label="Prazos e acompanhamentos" id="acompanhamento" className="my-6 scroll-mt-20 min-w-0 rounded-2xl border border-[#16345c] bg-[#07182d] p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><CalendarClock size={22} className="shrink-0 text-blue-400" />Prazos e acompanhamentos</h2>
      <Link to="/followups" className="text-sm text-blue-300 underline">Ver agenda de serviços</Link>
    </div>
    <button type="button" className={`${buttonClass} mb-4`} disabled={isLoading} onClick={() => { setSuccess(false); refresh(); }}>Atualizar acompanhamento</button>
    {success && <p role="status" className="mb-4 text-sm text-emerald-300">Acompanhamento salvo.</p>}
    {error && <RequestError message={error} onRetry={refresh} />}
    {isLoading && <p role="status" className="text-sm text-slate-400">Carregando acompanhamento…</p>}
    {data && !isLoading && <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="Prazo de entrega" value={formatDate(data.due_on)} warning={data.overdue ? "Entrega atrasada" : undefined} />
        <Info label="Próximo retorno" value={formatDate(data.next_followup_on)} warning={data.followup_pending ? "Retorno pendente" : undefined} />
        <Info label="Responsável" value={data.assigned_to_name || "Não definido"} />
      </div>
      <p className="my-3 text-xs text-slate-400">Datas e alertas consideram o horário de São Paulo. Registros internos da equipe.</p>
      <Actions key={`${orderId}:${revision}`} data={data} onChanged={changed} />
      <div className="mt-7 border-t border-[#24436b] pt-5">
        <h3 className="mb-4 font-semibold text-white">Histórico de acompanhamento</h3>
        {!data.events.length && <p className="text-sm text-slate-400">Nenhum acompanhamento registrado. Defina o planejamento ou adicione uma observação.</p>}
        <ol className="space-y-4">
          {data.events.map(event => <li key={event.id} className="break-words rounded-xl border border-[#24436b] p-4">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400"><strong className="text-blue-200">{event.kind === "PLAN" ? "Planejamento atualizado" : "Observação registrada"}</strong><time dateTime={event.created_at}>{eventDate.format(new Date(/Z$|[+-]\d{2}:\d{2}$/.test(event.created_at) ? event.created_at : `${event.created_at}Z`))}</time></div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{event.note}</p>
            {event.kind === "PLAN" && <p className="mt-3 text-xs leading-6 text-slate-400">Entrega: {formatDate(event.snapshot.due_on)} · Retorno: {formatDate(event.snapshot.next_followup_on)} · Responsável: {event.snapshot.assigned_to_name || "Não definido"}</p>}
            <p className="mt-2 text-xs text-slate-400">Por {event.user_name}</p>
          </li>)}
        </ol>
        {data.total_pages > 1 && <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className={buttonClass} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Histórico anterior</button>
          <span className="text-sm text-slate-400">{page} / {data.total_pages}</span>
          <button className={buttonClass} disabled={page >= data.total_pages} onClick={() => setPage(value => value + 1)}>Histórico seguinte</button>
        </div>}
      </div>
    </>}
  </section>;
}
function Info({ label, value, warning }: { label: string; value: string; warning?: string }) {
  return <div className="min-w-0 rounded-xl bg-[#051020] p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-white">{value}</p>{warning && <p className="mt-2 text-xs text-amber-300">{warning}</p>}</div>;
}
function Actions({ data, onChanged }: { data: FollowupDetail; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const mutation = useSettingsMutation();
  const retry = useRef({ note: "", id: "" });
  const closed = data.status_service === "FINALIZADO" || data.status_service === "CANCELADO";
  return <>
    {data.can_manage && !closed && <button type="button" className={buttonClass} onClick={() => setEditing(value => !value)} aria-expanded={editing}>{editing ? "Fechar planejamento" : "Editar planejamento"}</button>}
    {closed && <p className="text-sm text-slate-400">OS encerrada: os alertas estão desativados. O histórico permanece disponível.</p>}
    {editing && <PlanForm data={data} onChanged={onChanged} />}
    <form aria-label="Registrar acompanhamento" className="mt-5" onSubmit={event => {
      event.preventDefault();
      if (retry.current.note !== note || !retry.current.id) retry.current = { note, id: crypto.randomUUID() };
      void mutation.run(() => FollowupService.note(data.id, note, retry.current.id), onChanged);
    }}>
      <label className="block text-sm text-slate-300">Observação do acompanhamento<textarea className={fieldClass} disabled={mutation.busy} value={note} onChange={event => setNote(event.target.value)} required maxLength={2000} rows={3} placeholder="Ex.: cliente informou que entregará a peça amanhã." /></label>
      {mutation.error && <RequestError message={mutation.error} />}
      <button className={`${buttonClass} mt-3`} disabled={mutation.busy || !note.trim()}>{mutation.busy ? "Registrando…" : "Registrar observação"}</button>
    </form>
  </>;
}
function PlanForm({ data, onChanged }: { data: FollowupDetail; onChanged: () => void }) {
  const assignedId = useId();
  const [plan, setPlan] = useState<Plan>({ due_on: data.due_on, next_followup_on: data.next_followup_on, assigned_to_id: data.assigned_to_id });
  const [note, setNote] = useState("");
  const team = useAsyncResource("followup-team", FollowupService.team);
  const mutation = useSettingsMutation();
  const retry = useRef({ payload: "", id: "" });
  return <form aria-label="Editar planejamento" className="mt-4 rounded-xl border border-[#24436b] p-4" onSubmit={event => {
    event.preventDefault();
    const payload = { ...plan, note, version: data.version };
    const serialized = JSON.stringify(payload);
    if (retry.current.payload !== serialized) retry.current = { payload: serialized, id: crypto.randomUUID() };
    void mutation.run(() => FollowupService.update(data.id, { ...payload, request_id: retry.current.id }), onChanged);
  }}>
    <fieldset disabled={mutation.busy} className="min-w-0">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="min-w-0 text-sm text-slate-300">Prazo de entrega<input className={fieldClass} type="date" max="9999-12-31" value={plan.due_on || ""} onChange={event => setPlan({ ...plan, due_on: event.target.value || null })} /></label>
        <label className="min-w-0 text-sm text-slate-300">Próximo retorno<input className={fieldClass} type="date" max="9999-12-31" value={plan.next_followup_on || ""} onChange={event => setPlan({ ...plan, next_followup_on: event.target.value || null })} /></label>
        <div className="min-w-0"><label htmlFor={assignedId} className="text-sm text-slate-300">Responsável</label><select id={assignedId} className={fieldClass} disabled={team.isLoading || !!team.error} value={plan.assigned_to_id ?? ""} onChange={event => setPlan({ ...plan, assigned_to_id: event.target.value ? Number(event.target.value) : null })}>
          <option value="">Não definido</option>
          {data.assigned_to_id && !team.data?.some(member => member.id === data.assigned_to_id) && <option value={data.assigned_to_id}>{data.assigned_to_name} (indisponível)</option>}
          {team.data?.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select></div>
      </div>
      <p className="mt-3 text-xs text-slate-400">Para concluir um retorno, limpe a data ou informe o próximo contato e registre o resultado abaixo.</p>
      <label className="mt-4 block text-sm text-slate-300">Motivo ou resultado<textarea className={fieldClass} rows={2} required maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label>
      {team.error && <RequestError message={team.error} onRetry={team.refresh} />}
      {mutation.error && <RequestError message={mutation.error} />}
      <button className={`${buttonClass} mt-3 bg-blue-500/20`} disabled={team.isLoading || !!team.error || !note.trim()}>{mutation.busy ? "Salvando…" : "Salvar planejamento"}</button>
    </fieldset>
  </form>;
}
