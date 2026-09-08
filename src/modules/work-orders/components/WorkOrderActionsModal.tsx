// Services
import { WorkOrderService } from "../services/work-order.service";

// Icons
import {
    CheckCircle2,
    CreditCard,
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

// Navigation
import { useNavigate } from "react-router-dom";

// Components
import { Modal } from "../../../shared/components/modal";

// Types
import type { DashboardRecentWorkOrder } from "../../dashboard/types/dashboard.types";
import type { UpdateWorkOrderRequest } from "../types/work-order.types";

// Stores
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
    const showMessage = useMessageStore(
        (state) => state.showMessage
    );

    const loadSummary = useDashboardStore(
        (state) => state.loadSummary
    );

    const navigate = useNavigate();


    if (!workOrder) {
        return null;
    }


    // ====================================================
    // STATUS
    // ====================================================

    const isServiceFinished =
        workOrder.status_service === "FINALIZADO";

    const isPaymentPaid =
        workOrder.status_payment === "PAGO";


    // ====================================================
    // ATUALIZAÇÃO
    // ====================================================

    const handleUpdate = async (
        statusUpdate: "service" | "payment"
    ) => {
        let data: UpdateWorkOrderRequest = {};

        if (statusUpdate === "service") {
            data = {
                status_service: "FINALIZADO",
            };
        }

        if (statusUpdate === "payment") {
            data = {
                status_payment: "PAGO",
            };
        }

        const res = await WorkOrderService.update(
            workOrder.id,
            data
        );

        if (!res.success) {
            showMessage(
                res.message,
                "error"
            );

            return;
        }

        await loadSummary(true);

        showMessage(
            `Ordem de serviço #${workOrder.id} atualizada com sucesso!`,
            "success"
        );
    };


    // ====================================================
    // EXCLUSÃO
    // ====================================================

    const handleDelete = async () => {
        const res = await WorkOrderService.delete(
            workOrder.id
        );

        if (!res.success) {
            showMessage(
                res.message,
                "error"
            );

            return;
        }

        await loadSummary(true);

        showMessage(
            `Ordem de serviço #${workOrder.id} excluída com sucesso!`,
            "success"
        );

        onClose();
    };


    return (
        <Modal
            open={open}
            title={`Ordem de Serviço #${workOrder.id}`}
            subtitle={`${workOrder.title} • ${workOrder.client_name}`}
            onClose={onClose}
        >
            <div className="space-y-5">

                {/* =================================================
                    AÇÕES PRINCIPAIS
                ================================================= */}
                <div>
                    <p
                        className="
                            mb-3
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.18em]
                            text-[#56657d]
                        "
                    >
                        Ações
                    </p>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >
                        {/* EDITAR */}
                        <button
                            type="button"
                            onClick={() => {
                                onClose();

                                navigate(
                                    `/work-orders/${workOrder.id}/edit`
                                );
                            }}
                            className="
                                group
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border border-[#16345c]/35
                                bg-[#010b1b]/35
                                px-4
                                py-3.5
                                text-left
                                transition-all
                                duration-200

                                hover:border-[#2583ff]/25
                                hover:bg-[#07182d]/65
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                    transition-all
                                    duration-200

                                    group-hover:bg-[#2583ff]/15
                                "
                            >
                                <Pencil
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-[#f8fafc]
                                    "
                                >
                                    Editar OS
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    Alterar informações
                                </p>
                            </div>
                        </button>


                        {/* VISUALIZAR */}
                        <button
                            type="button"
                            onClick={onView}
                            className="
                                group
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border border-[#16345c]/35
                                bg-[#010b1b]/35
                                px-4
                                py-3.5
                                text-left
                                transition-all
                                duration-200

                                hover:border-[#2583ff]/25
                                hover:bg-[#07182d]/65
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                    transition-all
                                    duration-200

                                    group-hover:bg-[#2583ff]/15
                                "
                            >
                                <Eye
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-[#f8fafc]
                                    "
                                >
                                    Visualizar
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    Ver detalhes completos
                                </p>
                            </div>
                        </button>
                    </div>
                </div>


                {/* =================================================
                    STATUS
                ================================================= */}
                <div>
                    <p
                        className="
                            mb-3
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.18em]
                            text-[#56657d]
                        "
                    >
                        Atualizar status
                    </p>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >
                        {/* FINALIZAR OS */}
                        <button
                            type="button"
                            disabled={isServiceFinished}
                            onClick={() =>
                                handleUpdate("service")
                            }
                            className={`
                                group
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border
                                px-4
                                py-3.5
                                text-left
                                transition-all
                                duration-200

                                ${isServiceFinished
                                    ? `
                                            cursor-not-allowed
                                            border-[#16345c]/25
                                            bg-[#010b1b]/25
                                            opacity-55
                                        `
                                    : `
                                            border-[#2583ff]/25
                                            bg-[#2583ff]/[0.07]
                                            hover:border-[#2583ff]/40
                                            hover:bg-[#2583ff]/10
                                        `
                                }
                            `}
                        >
                            <div
                                className={`
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg

                                    ${isServiceFinished
                                        ? `
                                                bg-[#07182d]
                                                text-[#56657d]
                                            `
                                        : `
                                                bg-[#2583ff]/12
                                                text-[#3692ff]
                                            `
                                    }
                                `}
                            >
                                <CheckCircle2
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p
                                    className={`
                                        text-sm
                                        font-medium

                                        ${isServiceFinished
                                            ? "text-[#8290a8]"
                                            : "text-[#f8fafc]"
                                        }
                                    `}
                                >
                                    {isServiceFinished
                                        ? "OS finalizada"
                                        : "Finalizar OS"}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    {isServiceFinished
                                        ? "Serviço concluído"
                                        : "Marcar serviço como concluído"}
                                </p>
                            </div>
                        </button>


                        {/* PAGAMENTO */}
                        <button
                            type="button"
                            disabled={isPaymentPaid}
                            onClick={() =>
                                handleUpdate("payment")
                            }
                            className={`
                                group
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border
                                px-4
                                py-3.5
                                text-left
                                transition-all
                                duration-200

                                ${isPaymentPaid
                                    ? `
                                            cursor-not-allowed
                                            border-[#16345c]/25
                                            bg-[#010b1b]/25
                                            opacity-55
                                        `
                                    : `
                                            border-emerald-500/20
                                            bg-emerald-500/[0.05]
                                            hover:border-emerald-500/30
                                            hover:bg-emerald-500/[0.08]
                                        `
                                }
                            `}
                        >
                            <div
                                className={`
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg

                                    ${isPaymentPaid
                                        ? `
                                                bg-[#07182d]
                                                text-[#56657d]
                                            `
                                        : `
                                                bg-emerald-500/10
                                                text-emerald-400
                                            `
                                    }
                                `}
                            >
                                <CreditCard
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p
                                    className={`
                                        text-sm
                                        font-medium

                                        ${isPaymentPaid
                                            ? "text-[#8290a8]"
                                            : "text-[#f8fafc]"
                                        }
                                    `}
                                >
                                    {isPaymentPaid
                                        ? "Pagamento realizado"
                                        : "Marcar como pago"}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    {isPaymentPaid
                                        ? "Pagamento confirmado"
                                        : "Confirmar recebimento"}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>


                {/* =================================================
                    EXCLUSÃO
                ================================================= */}
                <div
                    className="
                        border-t
                        border-[#16345c]/25
                        pt-5
                    "
                >
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="
                            group
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            border border-red-500/15
                            bg-red-500/[0.03]
                            px-4
                            py-3.5
                            text-left
                            transition-all
                            duration-200

                            hover:border-red-500/25
                            hover:bg-red-500/[0.07]
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-500/10
                                text-red-400
                            "
                        >
                            <Trash2
                                size={17}
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-red-300
                                "
                            >
                                Excluir ordem de serviço
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-red-300/45
                                "
                            >
                                Esta ação removerá a ordem do sistema.
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    );
}