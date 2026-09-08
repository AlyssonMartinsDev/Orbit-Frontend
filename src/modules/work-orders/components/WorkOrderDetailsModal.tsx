import {
    CalendarDays,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    ExternalLink,
    UserRound,
    Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();


    // ====================================================
    // WORK ORDER
    // ====================================================

    if (!workOrder) {
        return null;
    }


    // ====================================================
    // NAVEGAÇÃO
    // ====================================================

    const handleOpenDetails = () => {
        onClose();

        navigate(
            `/work-orders/${workOrder.id}/details`
        );
    };


    // ====================================================
    // FORMATADORES
    // ====================================================

    const formatCurrency = (
        value: number
    ) => {
        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            }
        ).format(value);
    };


    const formatDate = (
        value: string
    ) => {
        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        ).format(
            new Date(value)
        );
    };


    // ====================================================
    // STATUS
    // ====================================================

    const isServiceFinished =
        workOrder.status_service === "FINALIZADO";

    const isPaymentPaid =
        workOrder.status_payment === "PAGO";


    return (
        <Modal
            open={open}
            title={`Ordem de Serviço #${workOrder.id}`}
            subtitle={workOrder.title}
            onClose={onClose}
        >
            <div className="space-y-5">

                {/* =================================================
                    CLIENTE
                ================================================= */}
                <section
                    className="
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        border border-[#16345c]/30
                        bg-[#010b1b]/35
                        p-4
                    "
                >
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <UserRound
                            size={18}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div className="min-w-0">
                        <p
                            className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-[0.15em]
                                text-[#56657d]
                            "
                        >
                            Cliente
                        </p>

                        <p
                            className="
                                mt-1
                                truncate
                                text-sm
                                font-medium
                                text-[#f8fafc]
                            "
                        >
                            {workOrder.client_name}
                        </p>
                    </div>
                </section>


                {/* =================================================
                    STATUS
                ================================================= */}
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                    "
                >
                    {/* STATUS SERVIÇO */}
                    <section
                        className="
                            rounded-xl
                            border border-[#16345c]/30
                            bg-[#010b1b]/35
                            p-4
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <Wrench
                                size={15}
                                strokeWidth={1.8}
                                className="text-[#56657d]"
                            />

                            <p
                                className="
                                    text-xs
                                    text-[#8290a8]
                                "
                            >
                                Status do serviço
                            </p>
                        </div>


                        <div className="mt-3">
                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    rounded-lg
                                    border
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-medium

                                    ${isServiceFinished
                                        ? `
                                                border-[#2583ff]/20
                                                bg-[#2583ff]/10
                                                text-[#3692ff]
                                            `
                                        : `
                                                border-[#16345c]/35
                                                bg-[#07182d]
                                                text-[#a7b4c8]
                                            `
                                    }
                                `}
                            >
                                {workOrder.status_service}
                            </span>
                        </div>
                    </section>


                    {/* STATUS PAGAMENTO */}
                    <section
                        className="
                            rounded-xl
                            border border-[#16345c]/30
                            bg-[#010b1b]/35
                            p-4
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <CreditCard
                                size={15}
                                strokeWidth={1.8}
                                className="text-[#56657d]"
                            />

                            <p
                                className="
                                    text-xs
                                    text-[#8290a8]
                                "
                            >
                                Status do pagamento
                            </p>
                        </div>


                        <div className="mt-3">
                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    rounded-lg
                                    border
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-medium

                                    ${isPaymentPaid
                                        ? `
                                                border-emerald-500/20
                                                bg-emerald-500/10
                                                text-emerald-400
                                            `
                                        : `
                                                border-amber-500/20
                                                bg-amber-500/[0.07]
                                                text-amber-300
                                            `
                                    }
                                `}
                            >
                                {workOrder.status_payment}
                            </span>
                        </div>
                    </section>
                </div>


                {/* =================================================
                    VALOR
                ================================================= */}
                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-xl
                        border border-[#2583ff]/20
                        bg-[#2583ff]/[0.06]
                        p-5
                    "
                >
                    {/* Glow */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            right-[-40px]
                            top-[-40px]
                            h-28
                            w-28
                            rounded-full
                            bg-[#2583ff]/10
                            blur-3xl
                        "
                    />


                    <div
                        className="
                            relative
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-[0.15em]
                                    text-[#8290a8]
                                "
                            >
                                Valor do serviço
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-2xl
                                    font-semibold
                                    tracking-tight
                                    text-[#f8fafc]
                                "
                            >
                                {formatCurrency(
                                    workOrder.price
                                )}
                            </p>
                        </div>


                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#2583ff]/10
                                text-[#3692ff]
                            "
                        >
                            <CircleDollarSign
                                size={21}
                                strokeWidth={1.7}
                            />
                        </div>
                    </div>
                </section>


                {/* =================================================
                    DATA
                ================================================= */}
                <section
                    className="
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        border border-[#16345c]/30
                        bg-[#010b1b]/35
                        p-4
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
                            bg-[#07182d]
                            text-[#56657d]
                        "
                    >
                        <CalendarDays
                            size={17}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <p
                            className="
                                text-xs
                                text-[#56657d]
                            "
                        >
                            Ordem criada em
                        </p>

                        <p
                            className="
                                mt-1
                                text-sm
                                font-medium
                                text-[#a7b4c8]
                            "
                        >
                            {formatDate(
                                workOrder.created_at
                            )}
                        </p>
                    </div>
                </section>


                {/* =================================================
                    AÇÃO
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
                        onClick={handleOpenDetails}
                        className="
                            group
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-xl
                            border border-[#2583ff]/25
                            bg-[#2583ff]
                            px-5
                            py-3.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-[0_0_25px_rgba(37,131,255,0.15)]
                            transition-all
                            duration-200

                            hover:bg-[#3692ff]
                            hover:shadow-[0_0_35px_rgba(37,131,255,0.25)]
                        "
                    >
                        <span
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <ClipboardList
                                size={17}
                                strokeWidth={1.8}
                            />

                            Ver detalhes completos
                        </span>

                        <ExternalLink
                            size={16}
                            strokeWidth={1.8}
                            className="
                                transition-transform
                                duration-200
                                group-hover:translate-x-0.5
                                group-hover:-translate-y-0.5
                            "
                        />
                    </button>
                </div>
            </div>
        </Modal>
    );
}