import { useCallback, useEffect, useState } from "react";
import { FormSection, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { SettingsService } from "../services/settings.service";
import type { PlatformAccessEvent, PlatformOrganization, PlatformOrganizationPage } from "../types/settings.types";
import { SaveError, SettingsField } from "./SettingsField";

export function PlatformOrganizations() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PlatformOrganizationPage | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [events, setEvents] = useState<PlatformAccessEvent[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [expiresOn, setExpiresOn] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = result?.items.find((item) => item.id === selectedId);

  const refresh = useCallback(async () => {
    try {
      const data = await SettingsService.platformOrganizations(page, query);
      setResult(data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar as organizações.");
    }
  }, [page, query]);

  useEffect(() => {
    let active = true;
    void SettingsService.platformOrganizations(page, query).then((data) => {
      if (active) { setResult(data); setError(null); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as organizações.");
    });
    return () => { active = false; };
  }, [page, query]);
  useEffect(() => {
    if (selectedId === null) return;
    void SettingsService.platformAccessEvents(selectedId).then(setEvents).catch(() => setEvents([]));
  }, [selectedId, result]);

  function select(item: PlatformOrganization) {
    setSelectedId(item.id);
    setStatus(item.access_status);
    setExpiresOn(item.access_expires_on || "");
    setMaxUsers(item.max_users?.toString() || "");
    setReason("");
    setNotice(null);
    setError(null);
  }

  async function saveAccess(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    const limit = maxUsers.trim() === "" ? null : Number(maxUsers);
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      setError("Informe um limite inteiro maior que zero ou deixe vazio.");
      return;
    }
    if (reason.trim().length < 3) { setError("Informe o motivo da alteração (mínimo de 3 caracteres)."); return; }
    if (status === "SUSPENDED" && selected.access_status !== "SUSPENDED" && !window.confirm(`Suspender o acesso de ${selected.name} para todos os usuários?`)) return;
    setBusy(true);
    setError(null);
    try {
      await SettingsService.updatePlatformAccess(selected.id, { access_status: status, access_expires_on: expiresOn || null, max_users: limit, reason: reason.trim() });
      setNotice("Acesso da organização atualizado.");
      setReason("");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }

  async function toggleAdmin(userId: number, active: boolean) {
    if (!selected || busy) return;
    if (reason.trim().length < 3) { setError("Informe o motivo da alteração antes de alterar um administrador."); return; }
    if (!active && !window.confirm("Desativar este administrador e encerrar suas sessões?")) return;
    setBusy(true);
    setError(null);
    try {
      await SettingsService.updatePlatformAdministrator(selected.id, userId, active, reason.trim());
      setNotice(active ? "Administrador reativado." : "Administrador desativado.");
      setReason("");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível alterar o administrador."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <header><h2 className="text-xl font-semibold">Gerenciamento de organizações</h2><p className="mt-2 text-sm text-[#a7b4c8]">Controle manual de acesso, prazo, usuários e administradores.</p></header>
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
      <input aria-label="Pesquisar organização" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome da organização" className="min-w-0 flex-1 rounded-xl border border-[#1a3656] bg-[#06152a] px-4 py-2 text-white" />
      <button className={secondaryButtonClass} type="submit">Pesquisar</button>
    </form>
    <SaveError message={error} />
    {notice && <p role="status" className="rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-200">{notice}</p>}
    <div className="space-y-2">{result?.items.map((item) => <button key={item.id} type="button" onClick={() => select(item)} className={`w-full rounded-xl border p-4 text-left ${selectedId === item.id ? "border-blue-400 bg-blue-400/10" : "border-[#1a3656] bg-[#06152a]"}`}>
      <span className="flex flex-wrap items-center justify-between gap-2"><strong className="break-words">{item.name}</strong><span className={`text-xs ${item.access_status === "SUSPENDED" ? "text-amber-300" : "text-green-300"}`}>{item.access_status === "SUSPENDED" ? "Suspensa" : item.access_expires_on && item.access_expires_on < new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }) ? "Prazo encerrado" : "Ativa"}</span></span>
      <span className="mt-1 block text-sm text-[#a7b4c8]">#{item.id} · {item.active_users} usuário(s) ativo(s) · limite {item.max_users ?? "livre"} · validade {item.access_expires_on ? new Date(`${item.access_expires_on}T12:00:00`).toLocaleDateString("pt-BR") : "sem prazo"}</span>
    </button>)}</div>
    {result?.items.length === 0 && <p className="text-sm text-[#a7b4c8]">Nenhuma organização encontrada.</p>}
    {result && result.total > result.size && <div className="flex items-center justify-between gap-3"><button type="button" className={secondaryButtonClass} disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span className="text-sm">Página {page} de {Math.ceil(result.total / result.size)}</span><button type="button" className={secondaryButtonClass} disabled={page * result.size >= result.total} onClick={() => setPage(page + 1)}>Próxima</button></div>}
    {selected && <div className="space-y-5">
      <form onSubmit={(event) => { void saveAccess(event); }}><fieldset disabled={busy} className="space-y-4"><FormSection title={`Acesso · ${selected.name}`} description="A suspensão e o vencimento bloqueiam imediatamente toda a organização, inclusive sessões abertas.">
        <div><label className="mb-2 block text-sm text-[#a7b4c8]" htmlFor="platform-status">Status</label><select id="platform-status" value={status} onChange={(event) => setStatus(event.target.value as "ACTIVE" | "SUSPENDED")} className="w-full rounded-xl border border-[#1a3656] bg-[#06152a] px-4 py-2 text-white"><option value="ACTIVE">Ativa</option><option value="SUSPENDED">Suspensa</option></select></div>
        <SettingsField label="Acesso válido até (inclusive)" type="date" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} />
        <SettingsField label="Limite de usuários ativos (vazio = livre)" type="number" min={1} step={1} value={maxUsers} onChange={(event) => setMaxUsers(event.target.value)} />
        <SettingsField label="Motivo da alteração" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
      </FormSection><button type="submit" className={primaryButtonClass}>{busy ? "Salvando…" : "Salvar acesso"}</button></fieldset></form>
      <FormSection title="Administradores" description="Desativar um administrador encerra suas sessões. O acesso pode ser reativado aqui.">
        <div className="space-y-3">{selected.administrators.map((admin) => <div key={admin.id} className="flex flex-col gap-3 rounded-xl border border-[#1a3656] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-medium">{admin.name}</p><p className="break-all text-xs text-[#a7b4c8]">{admin.email} · {admin.is_active ? "Ativo" : "Desativado"}</p></div><button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => { void toggleAdmin(admin.id, !admin.is_active); }}>{admin.is_active ? "Desativar" : "Reativar"}</button></div>)}</div>
      </FormSection>
      <FormSection title="Histórico recente" description="Últimas 30 alterações de acesso e faturamento registradas."><div className="space-y-3">{events.length === 0 && <p className="text-sm text-[#a7b4c8]">Sem alterações registradas.</p>}{events.map((entry) => <div key={entry.id} className="rounded-xl border border-[#1a3656] p-3 text-sm"><p>{entry.action === "ADMINISTRATOR_ACCESS_UPDATED" ? "Administrador" : entry.action === "PLAN_ASSIGNED" ? "Plano atribuído" : entry.action === "INVOICE_CREATED" ? "Fatura criada" : entry.action === "INVOICE_STATUS_UPDATED" ? "Fatura atualizada" : "Organização"} · {new Date(entry.created_at).toLocaleString("pt-BR")} · usuário #{entry.actor_user_id}</p><p className="mt-1 break-words text-[#a7b4c8]">{entry.details.reason ? `Motivo: ${entry.details.reason}` : entry.details.plan_id ? `Plano #${entry.details.plan_id}` : entry.details.invoice_id ? `Fatura #${entry.details.invoice_id}${entry.details.status ? ` · ${entry.details.status}` : ""}` : "Alteração registrada"}</p></div>)}</div></FormSection>
    </div>}
  </div>;
}
