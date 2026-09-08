import { useState } from "react";

import {
    CheckCircle2,
    ClipboardList,
    Clock3,
} from "lucide-react";

import type { DashboardRecentWorkOrder } from "../types/dashboard.types";

interface WorkOrderTabsProps {
    openWorkOrders: DashboardRecentWorkOrder[];
    finishedWorkOrders: DashboardRecentWorkOrder[];

    onSelectWorkOrder?: (
        workOrder: DashboardRecentWorkOrder
    ) => void;
}

type WorkOrderTab = "open" | "finished";

export function WorkOrderTabs({
    openWorkOrders,
    finishedWorkOrders,
    onSelectWorkOrder,
}: WorkOrderTabsProps) {
    const [activeTab, setActiveTab] =
        useState<WorkOrderTab>("open");

    const workOrders =
        activeTab === "open"
            ? openWorkOrders
            : finishedWorkOrders;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const getPaymentStyle = (status: string) => {
        switch (status) {
            case "PAGO":
                return "text-emerald-400";

            case "PENDENTE":
                return "text-amber-400";

            case "PARCIAL":
                return "text-orange-400";

            case "CANCELADO":
                return "text-red-400";

            default:
                return "text-[#8290a8]";
        }
    };

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border border-[#16345c]/35
                bg-[#051020]/75
                shadow-[0_18px_45px_rgba(0,0,0,0.16)]
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <div
                className="
                    flex items-center gap-3
                    border-b border-[#16345c]/25
                    px-5 py-5
                    sm:px-6
                "
            >
                <div
                    className="
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border border-[#2583ff]/15
                        bg-[#2583ff]/10
                        text-[#3692ff]
                        shadow-[0_0_18px_rgba(37,131,255,0.08)]
                    "
                >
                    <ClipboardList
                        size={19}
                        strokeWidth={1.8}
                    />
                </div>

                <div>
                    <h3
                        className="
                            text-lg
                            font-semibold
                            text-[#f8fafc]
                            sm:text-xl
                        "
                    >
                        Ordens de serviço
                    </h3>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-[#8290a8]
                        "
                    >
                        Acompanhe as ordens em andamento e finalizadas.
                    </p>
                </div>
            </div>

            {/* =====================================================
                TABS
            ===================================================== */}
            <div className="px-5 pt-5 sm:px-6">
                <div
                    className="
                        flex gap-1.5
                        rounded-xl
                        border border-[#16345c]/25
                        bg-[#010b1b]/45
                        p-1
                    "
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab("open")}
                        className={`
                            flex flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            px-4 py-2.5
                            text-sm
                            font-medium
                            transition-all
                            duration-200
                            ${activeTab === "open"
                                ? `
                                        bg-[#0a2242]
                                        text-[#f8fafc]
                                        shadow-[0_0_18px_rgba(37,131,255,0.10)]
                                    `
                                : `
                                        text-[#8290a8]
                                        hover:bg-[#07182d]/60
                                        hover:text-[#f8fafc]
                                    `
                            }
                        `}
                    >
                        <Clock3
                            size={16}
                            strokeWidth={1.8}
                            className={
                                activeTab === "open"
                                    ? "text-[#3692ff]"
                                    : "text-[#56657d]"
                            }
                        />

                        Em andamento

                        <span
                            className={`
                                rounded-md
                                px-2 py-0.5
                                text-xs
                                ${activeTab === "open"
                                    ? "bg-[#2583ff]/15 text-[#3692ff]"
                                    : "bg-[#07182d] text-[#56657d]"
                                }
                            `}
                        >
                            {openWorkOrders.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("finished")}
                        className={`
                            flex flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            px-4 py-2.5
                            text-sm
                            font-medium
                            transition-all
                            duration-200
                            ${activeTab === "finished"
                                ? `
                                        bg-[#0a2242]
                                        text-[#f8fafc]
                                        shadow-[0_0_18px_rgba(37,131,255,0.10)]
                                    `
                                : `
                                        text-[#8290a8]
                                        hover:bg-[#07182d]/60
                                        hover:text-[#f8fafc]
                                    `
                            }
                        `}
                    >
                        <CheckCircle2
                            size={16}
                            strokeWidth={1.8}
                            className={
                                activeTab === "finished"
                                    ? "text-[#3692ff]"
                                    : "text-[#56657d]"
                            }
                        />

                        Finalizadas

                        <span
                            className={`
                                rounded-md
                                px-2 py-0.5
                                text-xs
                                ${activeTab === "finished"
                                    ? "bg-[#2583ff]/15 text-[#3692ff]"
                                    : "bg-[#07182d] text-[#56657d]"
                                }
                            `}
                        >
                            {finishedWorkOrders.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* =====================================================
                LISTA COM ALTURA MÁXIMA
            ===================================================== */}
            <div
                className="
                    max-h-[520px]
                    overflow-y-auto
                    px-5 pb-5 pt-4
                    sm:px-6
                "
            >
                <div className="space-y-3">
                    {workOrders.length ? (
                        workOrders.map((workOrder) => (
                            <button
                                key={workOrder.id}
                                type="button"
                                onClick={() =>
                                    onSelectWorkOrder?.(workOrder)
                                }
                                className="
                                    group
                                    flex w-full
                                    flex-col
                                    gap-4
                                    rounded-xl
                                    border border-[#16345c]/25
                                    bg-[#010b1b]/35
                                    p-4
                                    text-left
                                    transition-all
                                    duration-200

                                    hover:border-[#2583ff]/25
                                    hover:bg-[#07182d]/65
                                    hover:shadow-[0_10px_30px_rgba(0,0,0,0.14)]

                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >
                                {/* =========================================
                                    DADOS DA OS
                                ========================================= */}
                                <div className="min-w-0">
                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-medium
                                            text-[#f8fafc]
                                            transition-colors
                                            duration-200
                                            group-hover:text-white
                                        "
                                    >
                                        {workOrder.title}
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            truncate
                                            text-sm
                                            text-[#8290a8]
                                        "
                                    >
                                        {workOrder.client_name}
                                    </p>
                                </div>

                                {/* =========================================
                                    STATUS / VALOR
                                ========================================= */}
                                <div
                                    className="
                                        flex
                                        shrink-0
                                        items-end
                                        justify-between
                                        gap-4

                                        sm:block
                                        sm:text-right
                                    "
                                >
                                    <div>
                                        <p
                                            className="
                                                text-xs
                                                font-medium
                                                text-[#3692ff]
                                                sm:text-sm
                                            "
                                        >
                                            {workOrder.status_service}
                                        </p>

                                        <p
                                            className={`
                                                mt-1
                                                text-xs
                                                ${getPaymentStyle(
                                                workOrder.status_payment
                                            )}
                                            `}
                                        >
                                            {workOrder.status_payment}
                                        </p>
                                    </div>

                                    <p
                                        className={`
                                            font-semibold
                                            sm:mt-2
                                            ${getPaymentStyle(
                                            workOrder.status_payment
                                        )}
                                        `}
                                    >
                                        {formatCurrency(workOrder.price)}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div
                            className="
                                flex
                                min-h-36
                                items-center
                                justify-center
                                rounded-xl
                                border border-dashed border-[#16345c]/35
                                bg-[#010b1b]/25
                                p-6
                                text-center
                            "
                        >
                            <div>
                                <ClipboardList
                                    size={24}
                                    strokeWidth={1.5}
                                    className="mx-auto text-[#56657d]"
                                />

                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        text-[#8290a8]
                                    "
                                >
                                    Nenhuma ordem de serviço nesta categoria.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}