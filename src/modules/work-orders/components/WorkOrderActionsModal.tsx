import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, CheckCircle2, CreditCard, Eye, FileDown, Pencil, Trash2 } from "lucide-react";
import { Modal } from "../../../shared/components/modal";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import { useMessageStore } from "../../../shared/store/message.store";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { WorkOrderService } from "../services/work-order.service";
import type { PaymentStatus, WorkOrderStatus } from "../types/work-order.types";
import { WorkOrderAttachments } from "./WorkOrderAttachments";
import { WorkOrderPayments } from "./WorkOrderPayments";
import { WorkOrderPdfExport } from "./WorkOrderPdfExport";

interface WorkOrderActionsItem {
    id: number;
    title: string;
    client_name: string;
    status_service: WorkOrderStatus;
    status_payment: PaymentStatus;
}
interface WorkOrderActionsModalProps {
    open: boolean;
    workOrder: WorkOrderActionsItem | null;
    onClose: () => void;
    onUpdated?: () => void | Promise<void>;
}

export function WorkOrderActionsModal(props: WorkOrderActionsModalProps) {
    if (!props.open || !props.workOrder) return null;
    return (
        <Actions
            key={props.workOrder.id}
            {...props}
            workOrder={props.workOrder}
        />
    );
}

function Actions({
    workOrder,
    onClose,
    onUpdated,
}: WorkOrderActionsModalProps & { workOrder: WorkOrderActionsItem }) {
    const navigate = useNavigate();
    const [sessionId] = useState(() => getSession().id);
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [panel, setPanel] = useState<"menu" | "photos" | "payment" | "pdf">("menu");
    const showMessage = useMessageStore((state) => state.showMessage);
    const runAction = async (action: "service" | "delete") => {
        if (pending.current || !isCurrentSession(sessionId)) return;
        pending.current = true;
        setBusy(true);
        try {
            const result =
                action === "delete"
                    ? await WorkOrderService.delete(workOrder.id)
                    : await WorkOrderService.update(
                          workOrder.id,
                          { status_service: "FINALIZADO" },
                      );
            if (!isCurrentSession(sessionId)) return;
            if (!result.success) {
                showMessage(
                    result.message || "Não foi possível concluir a operação.",
                    "error",
                );
                return;
            }
            useDashboardStore.getState().clearSummary();
            await onUpdated?.();
            if (!isCurrentSession(sessionId)) return;
            showMessage(
                action === "delete"
                    ? "Ordem de serviço excluída."
                    : "Ordem de serviço atualizada.",
                "success",
            );
            onClose();
        } catch (error) {
            if (isCurrentSession(sessionId) && !axios.isCancel(error))
                showMessage(
                    "Não foi possível concluir a operação. Tente novamente.",
                    "error",
                );
        } finally {
            pending.current = false;
            setBusy(false);
        }
    };
    const buttonClass =
        "flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#16345c] px-4 py-3 text-left text-sm text-[#c4cede] hover:bg-[#0a2242] disabled:cursor-not-allowed disabled:opacity-50";
    if (panel === "photos") {
        return <Modal open title={`Adicionar fotos · OS #${workOrder.id}`} subtitle={workOrder.title} onClose={onClose}>
            <WorkOrderAttachments orderId={workOrder.id} photoOnly />
            <button type="button" className={`${buttonClass} mt-4`} onClick={() => setPanel("menu")}>Voltar ao menu</button>
        </Modal>;
    }
    if (panel === "payment") {
        return <Modal open title={`Vincular pagamento · OS #${workOrder.id}`} subtitle={workOrder.title} onClose={onClose}>
            <WorkOrderPayments orderId={workOrder.id} canceled={workOrder.status_service === "CANCELADO"} onChanged={() => { void onUpdated?.(); }} quick />
            <button type="button" className={`${buttonClass} mt-4`} onClick={() => setPanel("menu")}>Voltar ao menu</button>
        </Modal>;
    }
    if (panel === "pdf") {
        return <Modal open title={`Exportar PDF · OS #${workOrder.id}`} subtitle="Escolha o documento simples ou selecione as fotos para esta exportação." onClose={onClose}>
            <WorkOrderPdfExport orderId={workOrder.id} quick />
            <button type="button" className={`${buttonClass} mt-4`} onClick={() => setPanel("menu")}>Voltar ao menu</button>
        </Modal>;
    }
    return (
        <Modal
            open
            title={`Ordem de Serviço #${workOrder.id}`}
            subtitle={`${workOrder.title} • ${workOrder.client_name}`}
            onClose={() => {
                if (!pending.current) onClose();
            }}
        >
            <fieldset
                disabled={busy}
                className="min-w-0 space-y-3"
                aria-busy={busy}
            >
                {confirmDelete ? (
                    <>
                        <p className="text-sm leading-6 text-[#c4cede]">
                            Excluir esta ordem de serviço? Esta ação não pode
                            ser desfeita.
                        </p>
                        <button
                            type="button"
                            className={`${buttonClass} border-red-400/40 text-red-300`}
                            onClick={() => void runAction("delete")}
                        >
                            <Trash2 size={18} />
                            Confirmar exclusão
                        </button>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => setConfirmDelete(false)}
                        >
                            Voltar
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className={buttonClass} onClick={() => setPanel("pdf")}><FileDown size={18} />Exportar PDF</button>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => {
                                void navigate(`/work-orders/${workOrder.id}/details`);
                                onClose();
                            }}
                        >
                            <Eye size={18} />
                            Ver detalhes completos da OS
                        </button>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => setPanel("photos")}
                        >
                            <Camera size={18} />
                            Adicionar fotos
                        </button>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => {
                                void navigate(
                                    `/work-orders/${workOrder.id}/edit`,
                                );
                                onClose();
                            }}
                        >
                            <Pencil size={18} />
                            Editar ordem
                        </button>
                        <button
                            type="button"
                            className={buttonClass}
                            disabled={
                                workOrder.status_service === "FINALIZADO" ||
                                workOrder.status_service === "CANCELADO"
                            }
                            onClick={() => void runAction("service")}
                        >
                            <CheckCircle2 size={18} />
                            Finalizar serviço
                        </button>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => setPanel("payment")}
                        >
                            <CreditCard size={18} />
                            Vincular pagamento
                        </button>
                        <button
                            type="button"
                            className={`${buttonClass} text-red-300`}
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 size={18} />
                            Excluir ordem
                        </button>
                    </>
                )}
                {busy && (
                    <p role="status" className="text-sm text-[#a7b4c8]">
                        Salvando alterações…
                    </p>
                )}
            </fieldset>
        </Modal>
    );
}
