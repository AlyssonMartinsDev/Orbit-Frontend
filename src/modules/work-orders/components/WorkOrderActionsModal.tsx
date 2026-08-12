// hooks
import { WorkOrderService } from "../services/work-order.service";

import {
    CheckCircle,
    CreditCard,
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Modal } from "../../../shared/components/modal";

import type { DashboardRecentWorkOrder } from "../../dashboard/types/dashboard.types";
import type { UpdateWorkOrderRequest } from "../types/work-order.types";



import { useMessageStore } from "../../../shared/store/message.store";

import { useDashboardStore } from "../../../shared/store/dashboard.store";

interface WorkOrderActionsModalProps {
    open: boolean;
    workOrder: DashboardRecentWorkOrder | null;
    onClose: () => void;
    onView: () => void;
}
export function WorkOrderActionsModal({
    open,
    workOrder,
    onClose,
    onView,
}: WorkOrderActionsModalProps) {

    const showMessage = useMessageStore((state) => state.showMessage);

    const navigate = useNavigate();

    const loadSummary = useDashboardStore((state) => state.loadSummary);

    if (!workOrder) {
        return null;
    }

    const isServiceFinished =
        workOrder.status_service === "FINALIZADO";

    const isPaymentPaid =
        workOrder.status_payment === "PAGO";


    const handleUpdate = async (status_update: "service" | "payment") => {
        // Implementacao da logica de atualizacao do status da ordem de servico e pagamento
        let data: UpdateWorkOrderRequest = {};
        if (status_update === "service") {
            // Atualizar status da ordem de serviço para "Finalizada"
            data = { status_service: "FINALIZADO" }
        } else if (status_update === "payment") {
            // Atualizar status do pagamento para "Pago"
            data = { status_payment: "PAGO" }
        }

        const res = await WorkOrderService.update(workOrder.id, data);

        if (!res.success) {
            // Handle error
            showMessage(res.message, "error");
            return;

        }

        await loadSummary(true); // Recarregar o resumo do dashboard para refletir as alterações
        showMessage(`Ordem de serviço #${workOrder.id} atualizada com sucesso!`, "success");
    }

    const handleDelete = async () => {
        const res = await WorkOrderService.delete(workOrder.id);

        if (!res.success) {
            // Handle error
            showMessage(res.message, "error");
            return;
        }

        await loadSummary(true); // Recarregar o resumo do dashboard para refletir as alterações
        showMessage(`Ordem de serviço #${workOrder.id} excluída com sucesso!`, "success");
        onClose(); // Fechar o modal após a exclusão
    }


    return (
        <Modal
            open={open}
            title={`Ordem de Serviço #${workOrder.id}`}
            subtitle={`${workOrder.title} • ${workOrder.client_name}`}
            onClose={onClose}
        >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        navigate(`/work-orders/${workOrder.id}/edit`);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5"
                >
                    <Pencil size={19} className="text-violet-300" />
                    Editar
                </button>

                <button
                    type="button"
                    onClick={onView}
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5"
                >
                    <Eye size={19} className="text-blue-300" />
                    Visualizar
                </button>

                <button
                    type="button"
                    onClick={() => handleUpdate("service")}
                    className={`flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5 ${isServiceFinished
                            ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                            : "bg-violet-600 text-white hover:bg-violet-700"
                        }`}
                >
                    <CheckCircle size={19} className="text-emerald-300" />
                    {isServiceFinished
                        ? "OS finalizada"
                        : "Finalizar OS"}
                </button>

                <button
                    type="button"
                    onClick={() => handleUpdate("payment")}
                    className={`flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5 ${isPaymentPaid
                        ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                >
                    <CreditCard size={19} className="text-amber-300" />
                    {isPaymentPaid
                        ? "Pagamento realizado"
                        : "Marcar como pago"}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-3 rounded-xl border border-red-500/20 px-4 py-3 text-left text-red-300 transition hover:bg-red-500/10 sm:col-span-2"
                >
                    <Trash2 size={19} />
                    Excluir ordem de serviço
                </button>
            </div>
        </Modal>
    );
}