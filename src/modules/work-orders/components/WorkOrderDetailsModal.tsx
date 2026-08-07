import { Modal } from "../../../shared/components/modal";

import type { DashboardRecentWorkOrder } from "../../dashboard/types/dashboard.types";

interface WorkOrderDetailsModalProps {
    open: boolean;
    workOrder: DashboardRecentWorkOrder | null;
    onClose: () => void;
}

export function WorkOrderDetailsModal({
    open,
    workOrder,
    onClose,
}: WorkOrderDetailsModalProps) {
    if (!workOrder) {
        return null;
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);

    const formatDate = (value: string) =>
        new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(value));

    return (
        <Modal
            open={open}
            title={`Ordem de Serviço #${workOrder.id}`}
            subtitle={workOrder.title}
            onClose={onClose}
        >
            <div className="space-y-5">
                <div>
                    <p className="text-sm text-zinc-400">Cliente</p>
                    <p className="mt-1 font-medium text-white">
                        {workOrder.client_name}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-zinc-400">Status do serviço</p>
                        <p className="mt-1 font-medium text-violet-300">
                            {workOrder.status_service}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-zinc-400">Status do pagamento</p>
                        <p className="mt-1 font-medium text-amber-300">
                            {workOrder.status_payment}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm text-zinc-400">Valor</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                        {formatCurrency(workOrder.price)}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-zinc-400">Criada em</p>
                    <p className="mt-1 text-sm text-white">
                        {formatDate(workOrder.created_at)}
                    </p>
                </div>
            </div>
        </Modal>
    );
}