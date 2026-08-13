import { useState } from "react";

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
                return "text-zinc-400";
        }
    };


    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div>
                <h3 className="text-lg font-semibold sm:text-xl">
                    Ordens de serviço
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                    Acompanhe as ordens em andamento e finalizadas.
                </p>
            </div>

            {/* TABS */}
            <div className="mt-6 flex gap-2 rounded-2xl bg-[#0B1120] p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab("open")}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === "open"
                        ? "bg-violet-600 text-white"
                        : "text-zinc-400 hover:text-white"
                        }`}
                >
                    Em andamento ({openWorkOrders.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("finished")}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === "finished"
                        ? "bg-violet-600 text-white"
                        : "text-zinc-400 hover:text-white"
                        }`}
                >
                    Finalizadas ({finishedWorkOrders.length})
                </button>
            </div>

            {/* LISTA */}
            <div className="mt-5 space-y-4">
                {workOrders.length ? (
                    workOrders.map((workOrder) => (
                        <button
                            key={workOrder.id}
                            type="button"
                            onClick={() =>
                                onSelectWorkOrder?.(workOrder)
                            }
                            className="flex w-full flex-col gap-4 rounded-2xl bg-[#0B1120] p-4 text-left transition hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="font-medium text-white">
                                    {workOrder.title}
                                </p>

                                <p className="mt-1 text-sm text-zinc-400">
                                    {workOrder.client_name}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                                <p className="text-xs text-violet-300 sm:text-sm">
                                    Ordem de Serviço: {workOrder.status_service}
                                </p>
                                <p
                                    className={`mt-1 text-xs ${getPaymentStyle(
                                        workOrder.status_payment
                                    )}`}
                                >
                                    Status Pagamento: {workOrder.status_payment}
                                </p>

                                <p
                                    className={`font-semibold sm:mt-1 ${getPaymentStyle(
                                        workOrder.status_payment
                                    )}`}
                                >
                                    Valor: {formatCurrency(workOrder.price)}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="rounded-2xl bg-[#0B1120] p-6 text-center">
                        <p className="text-sm text-zinc-400">
                            Nenhuma ordem de serviço nesta categoria.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}