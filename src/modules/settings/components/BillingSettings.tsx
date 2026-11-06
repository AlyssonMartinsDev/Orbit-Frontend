import { useEffect, useState } from "react";
import { FormSection, primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { SettingsService } from "../services/settings.service";
import type { BillingPlan, BillingSummary, PlatformOrganization } from "../types/settings.types";

const inputClass = "min-w-0 w-full rounded-xl border border-[#1a3656] bg-[#06152a] px-3 py-2 text-white";
const money = (value: string) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateText = (value: string | null) => value ? value.split("-").reverse().join("/") : "—";
const noticeText = (state: string | null) => state === "OVERDUE" ? "Vencido" : state === "DUE_SOON" ? "Vence nos próximos 7 dias" : null;

export function BillingOverview({ summary }: { summary: BillingSummary }) {
  return <div className="space-y-4">
    <FormSection title="Plano atual" description="A fatura e a data de renovação são controladas manualmente pela plataforma.">
      <p className="text-sm text-[#dce8f8]">{summary.plan ? `${summary.plan.name} · ${money(summary.plan.price)} a cada ${summary.plan.cycle_months} mês(es)` : "Nenhum plano atribuído"}</p>
      {summary.renews_on && <p className="text-sm text-[#a7b4c8]">Próxima renovação: {dateText(summary.renews_on)}</p>}
      {summary.renewal_state && <p role="status" className="text-sm text-amber-300">Renovação: {noticeText(summary.renewal_state)}</p>}
    </FormSection>
    <FormSection title="Faturas" description="Cobranças registradas pela administração da plataforma. O pagamento não é processado aqui.">
      {summary.invoices.length === 0 ? <p className="text-sm text-[#a7b4c8]">Nenhuma fatura registrada.</p> : <div className="space-y-2">{summary.invoices.map((invoice) => <div key={invoice.id} className="flex flex-col gap-2 rounded-xl border border-[#1a3656] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-words font-medium">{invoice.number} · {invoice.description}</p><p className="text-[#a7b4c8]">Vencimento {dateText(invoice.due_on)} · {invoice.status === "PAID" ? `Paga em ${dateText(invoice.paid_on)}` : invoice.status === "VOID" ? "Cancelada" : "Aberta"}</p>{invoice.due_state && <p className="text-amber-300">{noticeText(invoice.due_state)}</p>}</div><strong>{money(invoice.amount)}</strong></div>)}</div>}
    </FormSection>
    <p className="text-xs text-[#8290a8]">Gateway de pagamento: não configurado. Nenhuma cobrança automática é gerada.</p>
  </div>;
}

export function MyBillingSettings() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void SettingsService.myBilling().then(setSummary).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar as faturas.")); }, []);
  return <div className="space-y-5"><h2 className="text-xl font-semibold">Plano e faturas</h2>{error && <p role="alert" className="text-red-300">{error}</p>}{summary ? <BillingOverview summary={summary} /> : !error && <p className="text-sm text-[#a7b4c8]">Carregando…</p>}</div>;
}

export function PlatformBillingSettings() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [organizationQuery, setOrganizationQuery] = useState("");
  const [organizationPage, setOrganizationPage] = useState(1);
  const [organizationTotal, setOrganizationTotal] = useState(0);
  const [organizationId, setOrganizationId] = useState(0);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cycleMonths, setCycleMonths] = useState<1 | 3 | 6 | 12>(1);
  const [maxUsers, setMaxUsers] = useState("");
  const [active, setActive] = useState(true);
  const [planId, setPlanId] = useState(0);
  const [startsOn, setStartsOn] = useState("");
  const [renewsOn, setRenewsOn] = useState("");
  const [number, setNumber] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function reload() {
    const [nextPlans, page] = await Promise.all([SettingsService.billingPlans(), SettingsService.platformOrganizations(organizationPage, organizationQuery)]);
    setPlans(nextPlans);
    setOrganizations(page.items);
    setOrganizationTotal(page.total);
    if (organizationId) setSummary(await SettingsService.platformBilling(organizationId));
  }
  useEffect(() => {
    let active = true;
    void Promise.all([SettingsService.billingPlans(), SettingsService.platformOrganizations(organizationPage, organizationQuery)]).then(([nextPlans, page]) => {
      if (active) { setPlans(nextPlans); setOrganizations(page.items); setOrganizationTotal(page.total); }
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados."); });
    return () => { active = false; };
  }, [organizationPage, organizationQuery]);
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    void SettingsService.platformBilling(organizationId).then((result) => { if (active) setSummary(result); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as faturas."); });
    return () => { active = false; };
  }, [organizationId]);
  async function perform(action: () => Promise<unknown>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); await reload(); setMessage(success); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); return false; }
    finally { setBusy(false); }
  }
  function edit(plan: BillingPlan) { setEditingId(plan.id); setName(plan.name); setDescription(plan.description || ""); setPrice(plan.price); setCycleMonths(plan.cycle_months); setMaxUsers(plan.max_users?.toString() || ""); setActive(plan.is_active); }
  function clearPlan() { setEditingId(null); setName(""); setDescription(""); setPrice(""); setCycleMonths(1); setMaxUsers(""); setActive(true); }
  return <div className="space-y-6">
    <header><h2 className="text-xl font-semibold">Planos e faturamento</h2><p className="mt-2 text-sm text-[#a7b4c8]">Cadastro e baixa manual. Vencimentos aparecem no painel e na conta da organização.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-400/30 p-3 text-sm text-red-300">{error}</p>}{message && <p role="status" className="text-sm text-green-300">{message}</p>}
    <FormSection title="Planos" description="Alterações no preço não modificam faturas já criadas.">
      <div className="space-y-2">{plans.map((plan) => <div key={plan.id} className="flex flex-col gap-2 rounded-xl border border-[#1a3656] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p>{plan.name} · {money(plan.price)} / {plan.cycle_months} mês(es) · {plan.is_active ? "Ativo" : "Arquivado"}</p><button type="button" className={secondaryButtonClass} onClick={() => edit(plan)}>Editar</button></div>)}</div>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const payload = { name, description: description || null, price, cycle_months: cycleMonths, max_users: maxUsers ? Number(maxUsers) : null, is_active: active }; void perform(() => editingId ? SettingsService.updateBillingPlan(editingId, payload) : SettingsService.createBillingPlan(payload), "Plano salvo.").then((saved) => { if (saved) clearPlan(); }); }}>
        <label className="text-sm">Nome<input required minLength={2} className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="text-sm">Preço (R$)<input required type="number" min="0" step="0.01" className={inputClass} value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label className="text-sm">Ciclo<select className={inputClass} value={cycleMonths} onChange={(event) => setCycleMonths(Number(event.target.value) as 1 | 3 | 6 | 12)}>{[1, 3, 6, 12].map((months) => <option key={months} value={months}>{months} mês(es)</option>)}</select></label>
        <label className="text-sm">Limite de usuários<input type="number" min={1} className={inputClass} value={maxUsers} onChange={(event) => setMaxUsers(event.target.value)} placeholder="Sem limite" /></label>
        <label className="text-sm sm:col-span-2">Descrição do plano<input className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Plano ativo</label>
        <div className="flex gap-2"><button type="submit" disabled={busy} className={primaryButtonClass}>Salvar plano</button>{editingId && <button type="button" className={secondaryButtonClass} onClick={clearPlan}>Cancelar edição</button>}</div>
      </form>
    </FormSection>
    <FormSection title="Organização" description="Selecione uma organização para atribuir plano e registrar faturas.">
      <form className="mb-3 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setOrganizationId(0); setSummary(null); setOrganizationPage(1); setOrganizationQuery(organizationSearch.trim()); }}><input aria-label="Pesquisar organização para faturamento" className={inputClass} value={organizationSearch} onChange={(event) => setOrganizationSearch(event.target.value)} placeholder="Pesquisar por nome" /><button type="submit" className={secondaryButtonClass}>Pesquisar</button></form>
      <select aria-label="Organização" className={inputClass} value={organizationId} onChange={(event) => { setOrganizationId(Number(event.target.value)); setSummary(null); }}><option value={0}>Selecione</option>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name} (#{org.id})</option>)}</select>
      <div className="mt-3 flex items-center gap-3 text-xs text-[#a7b4c8]"><button type="button" disabled={organizationPage <= 1} className={secondaryButtonClass} onClick={() => setOrganizationPage((value) => value - 1)}>Anterior</button><span>Página {organizationPage} · {organizationTotal} organizações</span><button type="button" disabled={organizationPage * 20 >= organizationTotal} className={secondaryButtonClass} onClick={() => setOrganizationPage((value) => value + 1)}>Próxima</button></div>
    </FormSection>
    {organizationId > 0 && <>
      {summary && <BillingOverview summary={summary} />}
      <FormSection title="Atribuir ou renovar plano" description="A renovação não suspende nem reativa o acesso automaticamente.">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void perform(() => SettingsService.assignBillingPlan(organizationId, { plan_id: planId, starts_on: startsOn, renews_on: renewsOn }), "Plano atribuído."); }}>
          <label className="text-sm sm:col-span-2">Plano<select required className={inputClass} value={planId} onChange={(event) => setPlanId(Number(event.target.value))}><option value={0}>Selecione</option>{plans.filter((plan) => plan.is_active).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
          <label className="text-sm">Início<input required type="date" className={inputClass} value={startsOn} onChange={(event) => setStartsOn(event.target.value)} /></label>
          <label className="text-sm">Renovação<input required type="date" className={inputClass} value={renewsOn} onChange={(event) => setRenewsOn(event.target.value)} /></label>
          <button type="submit" disabled={busy || !planId} className={primaryButtonClass}>Atribuir plano</button>
        </form>
      </FormSection>
      <FormSection title="Nova fatura manual" description="Nenhum pagamento é recebido ou processado pelo Orbit nesta etapa.">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void perform(() => SettingsService.createBillingInvoice(organizationId, { number, description: invoiceDescription, amount, due_on: dueOn }), "Fatura criada.").then((saved) => { if (saved) { setNumber(""); setInvoiceDescription(""); setAmount(""); setDueOn(""); } }); }}>
          <label className="text-sm">Número<input required className={inputClass} value={number} onChange={(event) => setNumber(event.target.value)} /></label>
          <label className="text-sm">Descrição da fatura<input required className={inputClass} value={invoiceDescription} onChange={(event) => setInvoiceDescription(event.target.value)} /></label>
          <label className="text-sm">Valor (R$)<input required type="number" min="0" step="0.01" className={inputClass} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <label className="text-sm">Vencimento<input required type="date" className={inputClass} value={dueOn} onChange={(event) => setDueOn(event.target.value)} /></label>
          <button type="submit" disabled={busy} className={primaryButtonClass}>Criar fatura</button>
        </form>
      </FormSection>
      {summary?.invoices.some((invoice) => invoice.status === "OPEN") && <FormSection title="Baixa de faturas" description="Apenas o superadministrador pode marcar pagamento ou cancelar uma fatura."><div className="space-y-2">{summary.invoices.filter((invoice) => invoice.status === "OPEN").map((invoice) => <div key={invoice.id} className="flex flex-col gap-2 rounded-xl border border-[#1a3656] p-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm">{invoice.number} · {money(invoice.amount)}</span><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => { if (window.confirm(`Marcar a fatura ${invoice.number} como paga?`)) void perform(() => SettingsService.changeBillingInvoice(organizationId, invoice.id, "PAID"), "Fatura marcada como paga."); }}>Marcar paga</button><button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => { if (window.confirm(`Cancelar a fatura ${invoice.number}?`)) void perform(() => SettingsService.changeBillingInvoice(organizationId, invoice.id, "VOID"), "Fatura cancelada."); }}>Cancelar</button></div></div>)}</div></FormSection>}
    </>}
  </div>;
}
