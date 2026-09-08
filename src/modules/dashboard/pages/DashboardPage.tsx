import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowRight,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardList,
    Plus,
    Users,
} from "lucide-react";

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

    const navigate = useNavigate();

    // ====================================================
    // Estados dos modais
    // ====================================================

    const [selectedWorkOrder, setSelectedWorkOrder] =
        useState<DashboardRecentWorkOrder | null>(null);

    const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] =
        useState(false);

    const [isWorkOrderDetailsOpen, setIsWorkOrderDetailsOpen] =
        useState(false);


    // ====================================================
    // Ações dos modais
    // ====================================================

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


    // ====================================================
    // Dashboard
    // ====================================================

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);


    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };


    if (isLoading && !summary) {
        return <Loading message="Carregando resumo do dashboard..." fullScreen />;
    }




    // ====================================================
    // Ordens de serviço
    // ====================================================

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


    const dashboardCards = [
        {
            title: "Clientes",
            value: String(summary?.cards.total_clients ?? 0),
            subtitle: "Total cadastrado",
            icon: Users,
        },
        {
            title: "OS abertas",
            value: String(summary?.cards.open_work_orders ?? 0),
            subtitle: "Pendentes ou em andamento",
            icon: ClipboardList,
        },
        {
            title: "OS finalizadas",
            value: String(summary?.cards.finished_work_orders ?? 0),
            subtitle: "Total finalizado",
            icon: ClipboardCheck,
        },
        {
            title: "Receita",
            value: formatCurrency(
                summary?.financial.current_month_revenue ?? 0
            ),
            subtitle: "Mês atual",
            icon: CircleDollarSign,
        },
    ];


    return (
        <section
            className="
                w-full
                rounded-2xl
                border border-[#16345c]/30
                bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.10),_transparent_30%),linear-gradient(135deg,_#051020_0%,_#010b1b_55%,_#031126_100%)]
                px-5 py-6
                shadow-[0_20px_60px_rgba(0,0,0,0.22)]
                sm:px-6
                lg:px-8
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <header
                className="
                    flex flex-col
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >
                <div>
                    <div className="flex items-center gap-2">
                        <span
                            className="
                                h-2 w-2
                                rounded-full
                                bg-[#2583ff]
                                shadow-[0_0_12px_rgba(37,131,255,0.8)]
                            "
                        />

                        <p
                            className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-[0.22em]
                                text-[#3692ff]
                            "
                        >
                            Painel Orbit
                        </p>
                    </div>

                    <h1
                        className="
                            mt-3
                            text-3xl
                            font-semibold
                            tracking-tight
                            text-[#f8fafc]
                            sm:text-4xl
                        "
                    >
                        Dashboard
                    </h1>

                    <p
                        className="
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6
                            text-[#8290a8]
                            sm:text-base
                        "
                    >
                        Visão geral da operação, clientes e ordens de serviço.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/work-orders/create")}
                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border border-[#2583ff]/25
                        bg-[#2583ff]
                        px-5 py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-[0_0_22px_rgba(37,131,255,0.18)]
                        transition-all
                        duration-200
                        hover:bg-[#3692ff]
                        hover:shadow-[0_0_30px_rgba(37,131,255,0.26)]
                        sm:w-auto
                    "
                >
                    <Plus size={17} strokeWidth={1.8} />

                    Nova OS
                </button>
            </header>


            {/* =====================================================
                CARDS
            ===================================================== */}
            <div
                className="
                    mt-8
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {dashboardCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border border-[#16345c]/35
                                bg-[#051020]/75
                                p-5
                                shadow-[0_14px_40px_rgba(0,0,0,0.16)]
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:border-[#2583ff]/25
                                hover:bg-[#07182d]/80
                                hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]
                            "
                        >
                            {/* Glow */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    -right-10
                                    -top-10
                                    h-28 w-28
                                    rounded-full
                                    bg-[#2583ff]/5
                                    blur-2xl
                                    transition-all
                                    duration-200
                                    group-hover:bg-[#2583ff]/10
                                "
                            />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#56657d]
                                        "
                                    >
                                        {card.title}
                                    </p>

                                    <h3
                                        className="
                                            mt-3
                                            text-2xl
                                            font-semibold
                                            text-[#f8fafc]
                                            sm:text-3xl
                                        "
                                    >
                                        {card.value}
                                    </h3>

                                    <p
                                        className="
                                            mt-2
                                            text-xs
                                            text-[#8290a8]
                                        "
                                    >
                                        {card.subtitle}
                                    </p>
                                </div>

                                <div
                                    className="
                                        flex
                                        h-11 w-11
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
                                    <Icon size={20} strokeWidth={1.8} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* =====================================================
                CONTENT
            ===================================================== */}
            <div
                className="
                    mt-6
                    grid
                    grid-cols-1
                    gap-6
                    xl:grid-cols-3
                "
            >
                {/* ORDENS */}
                <div className="xl:col-span-2">
                    <WorkOrderTabs
                        openWorkOrders={openWorkOrders}
                        finishedWorkOrders={finishedWorkOrders}
                        onSelectWorkOrder={handleOpenWorkOrderModal}
                    />
                </div>


                {/* =================================================
                    RESUMO FINANCEIRO
                ================================================= */}
                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border border-[#16345c]/35
                        bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.13),_transparent_45%),#051020]
                        p-5
                        shadow-[0_18px_45px_rgba(0,0,0,0.16)]
                        sm:p-6
                    "
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-[#56657d]
                                "
                            >
                                Financeiro
                            </p>

                            <h3
                                className="
                                    mt-1
                                    text-lg
                                    font-semibold
                                    text-[#f8fafc]
                                    sm:text-xl
                                "
                            >
                                Resumo rápido
                            </h3>
                        </div>

                        <div
                            className="
                                flex
                                h-10 w-10
                                items-center
                                justify-center
                                rounded-xl
                                border border-[#2583ff]/15
                                bg-[#2583ff]/10
                                text-[#3692ff]
                            "
                        >
                            <CircleDollarSign
                                size={19}
                                strokeWidth={1.8}
                            />
                        </div>
                    </div>


                    <div className="mt-6 space-y-5">
                        {/* Pendentes */}
                        <div
                            className="
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >
                            <p className="text-xs text-[#8290a8]">
                                Pagamentos pendentes
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-xl
                                    font-semibold
                                    text-[#f8fafc]
                                    sm:text-2xl
                                "
                            >
                                {formatCurrency(
                                    summary?.financial.pending_payments ?? 0
                                )}
                            </p>
                        </div>


                        {/* Ticket */}
                        <div
                            className="
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >
                            <p className="text-xs text-[#8290a8]">
                                Ticket médio
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-xl
                                    font-semibold
                                    text-[#f8fafc]
                                    sm:text-2xl
                                "
                            >
                                {formatCurrency(
                                    summary?.financial.average_ticket ?? 0
                                )}
                            </p>
                        </div>


                        {/* Completion Rate */}
                        <div
                            className="
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-[#8290a8]">
                                    Taxa de finalização
                                </p>

                                <span
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[#3692ff]
                                    "
                                >
                                    {summary?.financial.completion_rate ?? 0}%
                                </span>
                            </div>

                            <div
                                className="
                                    mt-3
                                    h-2.5
                                    overflow-hidden
                                    rounded-full
                                    bg-[#07182d]
                                "
                            >
                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        bg-[#2583ff]
                                        shadow-[0_0_12px_rgba(37,131,255,0.45)]
                                        transition-all
                                        duration-300
                                    "
                                    style={{
                                        width: `${Math.min(
                                            summary?.financial.completion_rate ?? 0,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>


                    <button
                        type="button"
                        className="
                            mt-5
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border border-[#16345c]/35
                            bg-[#07182d]/60
                            px-4 py-2.5
                            text-xs
                            font-medium
                            text-[#a7b4c8]
                            transition-all
                            duration-200
                            hover:border-[#2583ff]/25
                            hover:bg-[#0a2242]/70
                            hover:text-[#f8fafc]
                        "
                    >
                        Ver detalhes financeiros

                        <ArrowRight
                            size={15}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>
            </div>


            {/* =====================================================
                MODALS
            ===================================================== */}
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