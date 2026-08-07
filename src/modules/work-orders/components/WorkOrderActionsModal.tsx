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
    if (!workOrder) {
        return null;
    }

    const navigate = useNavigate();

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
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5"
                >
                    <CheckCircle size={19} className="text-emerald-300" />
                    Finalizar OS
                </button>

                <button
                    type="button"
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-zinc-200 transition hover:bg-white/5"
                >
                    <CreditCard size={19} className="text-amber-300" />
                    Marcar como paga
                </button>

                <button
                    type="button"
                    className="flex items-center gap-3 rounded-xl border border-red-500/20 px-4 py-3 text-left text-red-300 transition hover:bg-red-500/10 sm:col-span-2"
                >
                    <Trash2 size={19} />
                    Excluir ordem de serviço
                </button>
            </div>
        </Modal>
    );
}