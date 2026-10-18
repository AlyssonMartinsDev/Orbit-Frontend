import { useCallback, useEffect, useRef, useState } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../../shared/utils/format";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { useMessageStore } from "../../../shared/store/message.store";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import {
  SaveError,
  SettingsField,
} from "../../settings/components/SettingsField";
import {
  PaymentService,
  paymentMethods,
  type PaymentMethod,
} from "../services/payment.service";

function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((key) => parts.find((part) => part.type === key)?.value)
    .join("-");
}

export function WorkOrderPayments({
  orderId,
  canceled,
  onChanged,
}: {
  orderId: number;
  canceled: boolean;
  onChanged: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => PaymentService.list(orderId, signal),
    [orderId],
  );
  const {
    data,
    error: loadError,
    isLoading,
    refresh,
  } = useAsyncResource(`payments:${orderId}`, load);
  const { busy, error, run } = useSettingsMutation();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"total" | "partial">("total");
  const [date, setDate] = useState(today);
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [notes, setNotes] = useState("");
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [review, setReview] = useState(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const loaded = data !== null;
  useEffect(() => {
    if (loaded && window.location.hash === "#recebimentos")
      sectionRef.current?.scrollIntoView({ block: "start" });
  }, [loaded]);
  const changed = (message: string) => {
    request.current = null;
    setAmount("");
    setNotes("");
    setCancelId(null);
    setReason("");
    setReview(false);
    useDashboardStore.getState().clearSummary();
    useMessageStore.getState().showMessage(message, "success");
    refresh();
    onChanged();
  };
  if (loadError) return <RequestError message={loadError} onRetry={refresh} />;
  if (!data)
    return (
      <p role="status" className="mt-6 text-sm text-[#a7b4c8]">
        Carregando pagamentos…
      </p>
    );
  const disabled = busy || isLoading;
  const fullPayment = paymentMode === "total" && data.balance !== null;
  const fullPaymentLabel =
    Number(data.received) > 0
      ? "Quitar saldo restante"
      : "Vincular pagamento total";
  return (
    <section
      id="recebimentos"
      ref={sectionRef}
      aria-label="Pagamentos da OS"
      className="mt-6 min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-[#16345c]/40 bg-[#051020]/70 p-4 sm:p-6"
    >
      <header>
        <h2 className="text-xl font-semibold">Pagamentos da OS</h2>
        <p className="mt-2 text-sm leading-6 text-[#a7b4c8]">
          Vincule um pagamento total ou parcial já recebido. O saldo e a situação
          da ordem são atualizados automaticamente.
        </p>
      </header>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          ["Valor da ordem", formatCurrency(data.total)],
          ["Recebido", formatCurrency(data.received)],
          [
            "Saldo restante",
            data.balance === null ? "Em revisão" : formatCurrency(data.balance),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#010b1b]/60 p-4">
            <dt className="text-sm text-[#8290a8]">{label}</dt>
            <dd className="mt-2 break-words text-xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {data.review_required && (
        <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          <p>
            Esta ordem possui um status de pagamento anterior ao histórico de
            recebimentos. Registre os valores e as datas que puder confirmar
            antes de concluir a revisão. O saldo desta ordem ainda não entra nas
            pendências do dashboard.
          </p>
          {data.can_cancel &&
            (review ? (
              <>
                <p>
                  Confirma que todos os recebimentos anteriores foram
                  registrados? Se não houver lançamentos, o total recebido será
                  considerado zero.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    disabled={disabled}
                    className={primaryButtonClass}
                    type="button"
                    onClick={() =>
                      void run(
                        () => PaymentService.review(orderId),
                        () => changed("Revisão concluída."),
                      )
                    }
                  >
                    Confirmar revisão
                  </button>
                  <button
                    disabled={disabled}
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => setReview(false)}
                  >
                    Voltar
                  </button>
                </div>
              </>
            ) : (
              <button
                disabled={disabled}
                className={secondaryButtonClass}
                type="button"
                onClick={() => setReview(true)}
              >
                Concluir revisão do histórico
              </button>
            ))}
        </div>
      )}
      <SaveError message={error} />
      {data.can_register &&
        !canceled &&
        Number(data.total) > Number(data.received) && (
          <form
            aria-label="Vincular pagamento"
            onSubmit={(event) => {
              event.preventDefault();
              const payload = {
                amount: fullPayment ? String(data.balance) : amount,
                received_on: date,
                method,
                notes: notes.trim() || null,
              };
              const fingerprint = JSON.stringify(payload);
              if (request.current?.fingerprint !== fingerprint)
                request.current = { fingerprint, id: crypto.randomUUID() };
              const requestId = request.current.id;
              void run(
                () =>
                  PaymentService.create(orderId, {
                    ...payload,
                    request_id: requestId,
                  }),
                () => changed("Pagamento vinculado."),
              );
            }}
          >
            <fieldset disabled={disabled} className="min-w-0 space-y-4">
              <legend className="mb-4 font-semibold">Vincular pagamento</legend>
              {data.balance !== null && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    ["total", Number(data.received) > 0 ? "Quitar saldo restante" : "Pagamento total"],
                    ["partial", "Pagamento parcial"],
                  ] as const).map(([value, label]) => (
                    <label key={value} className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[#16345c] p-3 text-sm">
                      <input type="radio" name={`payment-mode-${orderId}`} value={value} checked={paymentMode === value} onChange={() => setPaymentMode(value)} className="accent-blue-500" />
                      {label}
                    </label>
                  ))}
                </div>
              )}
              {fullPayment && (
                <p className="text-sm leading-6 text-[#a7b4c8]">
                  Será vinculado um pagamento de <strong className="text-white">{formatCurrency(data.balance ?? "0")}</strong> para quitar esta ordem.
                  Confira a data e a forma de pagamento antes de registrar.
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {!fullPayment && <SettingsField
                  label="Valor do pagamento (R$)"
                  type="number"
                  inputMode="decimal"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />}
                <SettingsField
                  label="Data do pagamento"
                  type="date"
                  required
                  max={today()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <label className="min-w-0 text-sm text-[#a7b4c8]">
                  Forma de pagamento
                  <select
                    className={`${inputClass} mt-2`}
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  >
                    {Object.entries(paymentMethods).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <SettingsField
                  label="Observação do pagamento"
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`}>
                {busy ? "Vinculando…" : fullPayment ? fullPaymentLabel : "Vincular pagamento parcial"}
              </button>
            </fieldset>
          </form>
        )}
      {canceled && (
        <p className="text-sm text-[#a7b4c8]">
          Reabra a ordem para registrar novos recebimentos.
        </p>
      )}
      <h3 className="font-semibold">Histórico de pagamentos</h3>
      {data.payments.length === 0 ? (
        <p className="text-sm text-[#8290a8]">Nenhum pagamento vinculado.</p>
      ) : (
        <ul className="space-y-3">
          {data.payments.map((payment) => (
            <li
              key={payment.id}
              className="min-w-0 space-y-3 rounded-xl border border-[#16345c]/40 bg-[#010b1b]/50 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{formatCurrency(payment.amount)}</strong>
                <span
                  className={
                    payment.canceled_at ? "text-red-300" : "text-green-300"
                  }
                >
                  {payment.canceled_at ? "Cancelado" : "Confirmado"}
                </span>
              </div>
              <p className="text-sm text-[#a7b4c8]">
                {formatDate(payment.received_on)} ·{" "}
                {paymentMethods[payment.method] ?? payment.method}
              </p>
              <p className="break-words text-xs text-[#8290a8]">
                Registrado por {payment.created_by_name} em{" "}
                {formatDateTime(payment.created_at)}
              </p>
              {payment.notes && (
                <p className="whitespace-pre-wrap break-words text-sm">
                  {payment.notes}
                </p>
              )}
              {payment.canceled_at ? (
                <p className="break-words text-sm text-red-200">
                  Cancelado por {payment.canceled_by_name} em{" "}
                  {formatDateTime(payment.canceled_at)}. Motivo:{" "}
                  {payment.cancel_reason}
                </p>
              ) : (
                data.can_cancel &&
                (cancelId === payment.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(
                        () =>
                          PaymentService.cancel(
                            orderId,
                            payment.id,
                            reason.trim(),
                          ),
                        () => changed("Lançamento cancelado."),
                      );
                    }}
                  >
                    <p className="text-sm text-[#a7b4c8]">
                      O lançamento será desconsiderado nos totais e permanecerá
                      no histórico. Esta ação não realiza estorno bancário.
                    </p>
                    <SettingsField
                      label="Motivo do cancelamento"
                      required
                      minLength={3}
                      maxLength={500}
                      disabled={disabled}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="submit"
                        disabled={disabled || reason.trim().length < 3}
                        className={secondaryButtonClass}
                      >
                        Confirmar cancelamento
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        className={secondaryButtonClass}
                        onClick={() => setCancelId(null)}
                      >
                        Voltar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    className={secondaryButtonClass}
                    onClick={() => {
                      setCancelId(payment.id);
                      setReason("");
                    }}
                  >
                    Cancelar lançamento #{payment.id}
                  </button>
                ))
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
