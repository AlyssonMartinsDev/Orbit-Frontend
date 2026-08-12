import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { useDashboardStore } from "../../../shared/store/dashboard.store";

import { Loading } from "../../../shared/components/loading";


// Modal de ações para ordens de serviço 
import { WorkOrderActionsModal } from "../../work-orders/components/WorkOrderActionsModal";
import type { DashboardRecentWorkOrder } from "../types/dashboard.types";
import { WorkOrderDetailsModal } from "../../work-orders/components/WorkOrderDetailsModal";

// Componentes da dashboard
import { WorkOrderTabs } from "../components/WorkOrderTabs";


export function DashboardPage() {
    const summary = useDashboardStore((state) => state.summary);
    const isLoading = useDashboardStore((state) => state.isLoading);
    const loadSummary = useDashboardStore((state) => state.loadSummary);

    // Estados para controlar a abertura do modal e a ordem de serviço selecionada
    const [selectedWorkOrder, setSelectedWorkOrder] =
        useState<DashboardRecentWorkOrder | null>(null);

    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] =
        useState(false);

    const [isWorkOrderDetailsOpen, setIsWorkOrderDetailsOpen] =
        useState(false);
    // ====================================================
    // Função para abrir e fechar o modal de ações da ordem de serviço
    const handleOpenWorkOrderModal = (
        workOrder: DashboardRecentWorkOrder
    ) => {
        setSelectedWorkOrder(workOrder);
        setIsWorkOrderModalOpen(true);
    };

    const handleCloseWorkOrderModal = () => {
        setIsWorkOrderModalOpen(false);
        setSelectedWorkOrder(null);
    };

    const handleViewWorkOrder = () => {
        setIsWorkOrderModalOpen(false);
        setIsWorkOrderDetailsOpen(true);
    };

    const handleCloseWorkOrderDetails = () => {
        setIsWorkOrderDetailsOpen(false);
        setSelectedWorkOrder(null);
    };

    // ===================================================

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };
    const navigate = useNavigate();

    if (isLoading && !summary) {
        return <Loading message="Carregando resumo do dashboard..." />;
    }


    // Carregnado os dados das ordens de serviço 

    const openWorkOrders =
        summary?.recent_work_orders.filter(
            (workOrder) =>
                workOrder.status_service !== "FINALIZADO"
        ) ?? [];

    const finishedWorkOrders =
        summary?.recent_work_orders.filter(
            (workOrder) =>
                workOrder.status_service === "FINALIZADO"
        ) ?? [];

    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
                        Painel Orbit
                    </p>

                    <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Dashboard
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                        Visão geral da operação, clientes e ordens de serviço.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/work-orders/create")}
                    className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500 sm:w-auto">
                    Nova OS
                </button>
            </header>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    [
                        "Clientes",
                        String(summary?.cards.total_clients ?? 0),
                        "Total cadastrado",
                    ],
                    [
                        "OS abertas",
                        String(summary?.cards.open_work_orders ?? 0),
                        "Pendentes ou em andamento",
                    ],
                    [
                        "OS finalizadas",
                        String(summary?.cards.finished_work_orders ?? 0),
                        "Total finalizado",
                    ],
                    [
                        "Receita",
                        formatCurrency(
                            summary?.financial.current_month_revenue ?? 0
                        ),
                        "Mês atual",
                    ],
                ].map(([title, value, subtitle]) => (
                    <div
                        key={title}
                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl sm:p-6"
                    >
                        <p className="text-sm text-zinc-400">{title}</p>

                        <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                            {value}
                        </h3>

                        <p className="mt-2 text-sm text-violet-300">
                            {subtitle}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <WorkOrderTabs
                        openWorkOrders={openWorkOrders}
                        finishedWorkOrders={finishedWorkOrders}
                        onSelectWorkOrder={handleOpenWorkOrderModal}
                    />
                </div>

                <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_35%),rgba(255,255,255,0.04)] p-5 sm:p-6">
                    <h3 className="text-lg font-semibold sm:text-xl">
                        Resumo rápido
                    </h3>

                    <div className="mt-5 space-y-5">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Pagamentos pendentes
                            </p>

                            <p className="mt-1 text-xl font-bold sm:text-2xl">
                                {formatCurrency(
                                    summary?.financial.pending_payments ?? 0
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-zinc-400">
                                Ticket médio
                            </p>

                            <p className="mt-1 text-xl font-bold sm:text-2xl">
                                {formatCurrency(
                                    summary?.financial.average_ticket ?? 0
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-zinc-400">
                                Taxa de finalização
                            </p>

                            <div className="mt-3 h-3 rounded-full bg-white/10">
                                <div
                                    className="h-3 rounded-full bg-violet-500"
                                    style={{
                                        width: `${Math.min(
                                            summary?.financial.completion_rate ??
                                            0,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>

                            <p className="mt-2 text-sm text-violet-300">
                                {summary?.financial.completion_rate ?? 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <WorkOrderActionsModal
                open={isWorkOrderModalOpen}
                workOrder={selectedWorkOrder}
                onClose={handleCloseWorkOrderModal}
                onView={handleViewWorkOrder}
            />

            <WorkOrderDetailsModal
                open={isWorkOrderDetailsOpen}
                workOrder={selectedWorkOrder}
                onClose={handleCloseWorkOrderDetails}
            />
        </section>
    );
}