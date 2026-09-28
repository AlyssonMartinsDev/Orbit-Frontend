import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    Filter,
    MoreHorizontal,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import { WorkOrderDetailsModal } from "../components/WorkOrderDetailsModal";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    ElementType,
    ReactNode,
} from "react";

import { WorkOrderService } from "../services/work-order.service";

import type {
    PaymentStatus as PaymentStatusType,
    WorkOrderListItem,
    WorkOrderStatus,
} from "../types/work-order.types";

import { WorkOrderActionsModal } from "../components/WorkOrderActionsModal";


// =============================================================
// TIPOS
// =============================================================

type MainTab = "all" | "pending";


// =============================================================
// OPÇÕES DOS FILTROS
// =============================================================

const serviceOptions: {
    value: WorkOrderStatus;
    label: string;
}[] = [
        {
            value: "PENDENTE",
            label: "Pendente",
        },
        {
            value: "EM_ANDAMENTO",
            label: "Em andamento",
        },
        {
            value: "FINALIZADO",
            label: "Finalizado",
        },
        {
            value: "CANCELADO",
            label: "Cancelado",
        },
    ];


const paymentOptions: {
    value: PaymentStatusType;
    label: string;
}[] = [
        {
            value: "PENDENTE",
            label: "Pendente",
        },
        {
            value: "PARCIAL",
            label: "Parcial",
        },
        {
            value: "PAGO",
            label: "Pago",
        },
        {
            value: "CANCELADO",
            label: "Cancelado",
        },
    ];


// =============================================================
// PAGE
// =============================================================

export function WorkOrderTrackingPage() {

    // =========================================================
    // FILTROS
    // =========================================================

    const [startDate, setStartDate] =
        useState<string>("");

    const [
        isDetailsModalOpen,
        setIsDetailsModalOpen,
    ] = useState(false);

    const [endDate, setEndDate] =
        useState<string>("");

    const [serviceStatus, setServiceStatus] =
        useState<WorkOrderStatus | "">("");

    const [paymentStatus, setPaymentStatus] =
        useState<PaymentStatusType | "">("");

    const [activeTab, setActiveTab] =
        useState<MainTab>("all");

    const [search, setSearch] =
        useState("");

    const [debouncedSearch, setDebouncedSearch] =
        useState("");


    // =========================================================
    // ORDENS DE SERVIÇO
    // =========================================================

    const [workOrders, setWorkOrders] =
        useState<WorkOrderListItem[]>([]);

    const [page, setPage] =
        useState(1);

    const [pageSize] =
        useState(20);

    const [total, setTotal] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [summary, setSummary] =
        useState({
            all: 0,
            pending: 0,
        });


    // =========================================================
    // ESTADO DA REQUISIÇÃO
    // =========================================================

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    // =========================================================
    // MODAL DE AÇÕES
    // =========================================================

    const [
        selectedWorkOrder,
        setSelectedWorkOrder,
    ] = useState<WorkOrderListItem | null>(
        null
    );

    const [
        isActionsModalOpen,
        setIsActionsModalOpen,
    ] = useState(false);


    // =========================================================
    // FILTROS ATIVOS
    // =========================================================

    const hasActiveFilters = Boolean(
        search ||
        debouncedSearch ||
        startDate ||
        endDate ||
        serviceStatus ||
        paymentStatus
    );


    // =========================================================
    // DEBOUNCE DA BUSCA
    // =========================================================

    useEffect(() => {

        const timeout =
            window.setTimeout(() => {

                setDebouncedSearch(
                    search.trim()
                );

                // Toda nova busca começa
                // novamente na primeira página.
                setPage(1);

            }, 400);


        return () => {
            window.clearTimeout(timeout);
        };

    }, [search]);


    // =========================================================
    // CARREGAMENTO DAS ORDENS DE SERVIÇO
    // =========================================================

    /*
     * Agora loadWorkOrders fica fora do useEffect.
     *
     * Isso permite utilizar a mesma função:
     *
     * - no carregamento normal da página;
     * - ao trocar filtros;
     * - ao trocar página;
     * - depois de atualizar uma OS;
     * - depois de excluir uma OS.
     */
    const loadWorkOrders =
        useCallback(async () => {

            try {

                setIsLoading(true);
                setError(null);

                const response =
                    await WorkOrderService.getTracking({
                        page,
                        page_size: pageSize,
                        tab: activeTab,
                        search:
                            debouncedSearch ||
                            undefined,
                        start_date:
                            startDate ||
                            undefined,
                        end_date:
                            endDate ||
                            undefined,
                        status_service:
                            serviceStatus ||
                            undefined,
                        status_payment:
                            paymentStatus ||
                            undefined,
                    });


                if (!response.data) {
                    throw new Error(
                        response.message ||
                        "Resposta inválida ao carregar ordens de serviço."
                    );
                }


                const data =
                    response.data;


                setWorkOrders(
                    data.items
                );

                setTotal(
                    data.pagination.total
                );

                setTotalPages(
                    data.pagination.total_pages
                );

                setSummary(
                    data.summary
                );

            } catch (error) {

                console.error(
                    "Erro ao carregar ordens de serviço:",
                    error
                );

                setError(
                    "Não foi possível carregar as ordens de serviço."
                );

            } finally {

                setIsLoading(false);

            }

        }, [
            activeTab,
            debouncedSearch,
            startDate,
            endDate,
            serviceStatus,
            paymentStatus,
            page,
            pageSize,
        ]);


    // =========================================================
    // CARREGAMENTO AUTOMÁTICO
    // =========================================================

    useEffect(() => {
        void loadWorkOrders();
    }, [loadWorkOrders]);


    // =========================================================
    // MODAL
    // =========================================================

    function handleOpenActions(
        workOrder: WorkOrderListItem
    ) {

        setSelectedWorkOrder(
            workOrder
        );

        setIsActionsModalOpen(
            true
        );
    }

    function handleViewWorkOrder() {
        setIsActionsModalOpen(false);
        setIsDetailsModalOpen(true);
    }

    function handleCloseDetails() {
        setIsDetailsModalOpen(false);
        setSelectedWorkOrder(null);
    }


    function handleCloseActions() {

        setIsActionsModalOpen(
            false
        );

        setSelectedWorkOrder(
            null
        );
    }


    /*
     * O WorkOrderListItem da Tracking possui:
     *
     * client.name
     *
     * enquanto o WorkOrderActionsModal trabalha com:
     *
     * client_name
     *
     * Fazemos somente a adaptação necessária.
     */
    const selectedWorkOrderForModal =
        selectedWorkOrder
            ? {
                id:
                    selectedWorkOrder.id,

                title:
                    selectedWorkOrder.title,

                client_name:
                    selectedWorkOrder.client.name,

                status_service:
                    selectedWorkOrder.status_service,

                status_payment:
                    selectedWorkOrder.status_payment,
            }
            : null;


    const selectedWorkOrderForDetails =
        selectedWorkOrder
            ? {
                id: selectedWorkOrder.id,
                title: selectedWorkOrder.title,
                client_name: selectedWorkOrder.client.name,
                status_service:
                    selectedWorkOrder.status_service,
                status_payment:
                    selectedWorkOrder.status_payment,
                price:
                    selectedWorkOrder.price,
                created_at:
                    selectedWorkOrder.created_at,
            }
            : null;


    // =========================================================
    // ALTERAÇÃO DE ABA
    // =========================================================

    function handleTabChange(
        tab: MainTab
    ) {

        setActiveTab(tab);

        // Ao trocar de aba voltamos
        // para a primeira página.
        setPage(1);
    }


    // =========================================================
    // LIMPAR FILTROS
    // =========================================================

    function handleClearFilters() {

        setStartDate("");
        setEndDate("");

        setServiceStatus("");
        setPaymentStatus("");

        setSearch("");
        setDebouncedSearch("");

        setPage(1);
    }


    // =========================================================
    // FORMATAÇÕES
    // =========================================================

    function formatCurrency(
        value: string
    ) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            }
        ).format(
            Number(value)
        );
    }


    function formatDate(
        value: string
    ) {

        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        ).format(
            new Date(value)
        );
    }


    // =========================================================
    // PAGINAÇÃO
    // =========================================================

    function handlePageChange(
        newPage: number
    ) {

        if (
            newPage < 1 ||
            newPage > totalPages ||
            newPage === page
        ) {
            return;
        }

        setPage(newPage);
    }


    const firstItem =
        total === 0
            ? 0
            : ((page - 1) * pageSize) + 1;


    const lastItem =
        Math.min(
            page * pageSize,
            total
        );


    const visiblePages =
        getVisiblePages(
            page,
            totalPages
        );


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-full bg-[#051020]">

            <div className="mx-auto w-full max-w-[1600px]">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className="
                        relative
                        overflow-hidden
                        border-b border-[#16345c]/35
                        px-4 py-6
                        sm:px-6
                        lg:px-8
                    "
                >

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -left-20
                            -top-24
                            h-64
                            w-64
                            rounded-full
                            bg-[#2583ff]/10
                            blur-[90px]
                        "
                    />


                    <div className="relative flex items-start gap-4">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border border-[#2583ff]/20
                                bg-[#2583ff]/10
                                text-[#3692ff]
                                shadow-[0_0_25px_rgba(37,131,255,0.08)]
                            "
                        >
                            <ClipboardList
                                size={21}
                                strokeWidth={1.8}
                            />
                        </div>


                        <div>

                            <span
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#3692ff]
                                "
                            >
                                Ordens de serviço
                            </span>


                            <h1
                                className="
                                    mt-1
                                    text-2xl
                                    font-semibold
                                    tracking-tight
                                    text-[#f8fafc]
                                    sm:text-3xl
                                "
                            >
                                Acompanhar Ordens de Serviço
                            </h1>


                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-[#8290a8]
                                "
                            >
                                Consulte, filtre e acompanhe todas as
                                ordens de serviço da organização.
                            </p>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTEÚDO
                ================================================= */}

                <div className="px-4 py-6 sm:px-6 lg:px-8">


                    {/* =================================================
                        ABAS
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-1
                            border-b border-[#16345c]/35
                        "
                    >

                        <TabButton
                            active={
                                activeTab === "all"
                            }
                            onClick={() =>
                                handleTabChange("all")
                            }
                            label="Geral"
                            count={summary.all}
                        />


                        <TabButton
                            active={
                                activeTab === "pending"
                            }
                            onClick={() =>
                                handleTabChange("pending")
                            }
                            label="Pendentes"
                            count={summary.pending}
                        />

                    </div>


                    {/* =================================================
                        FILTROS
                    ================================================= */}

                    <div
                        className="
                            relative
                            z-20
                            mt-6
                            rounded-2xl
                            border border-[#16345c]/35
                            bg-[#07182d]/55
                            p-4
                            shadow-[0_18px_50px_rgba(0,0,0,0.12)]
                            backdrop-blur-xl
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                xl:flex-row
                                xl:flex-wrap
                                xl:items-center
                            "
                        >

                            {/* BUSCA */}

                            <div
                                className="
                                    relative
                                    min-w-0
                                    flex-1
                                    xl:min-w-[220px]
                                "
                            >

                                <Search
                                    size={17}
                                    strokeWidth={1.8}
                                    className="
                                        absolute
                                        left-3.5
                                        top-1/2
                                        -translate-y-1/2
                                        text-[#56657d]
                                    "
                                />


                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Buscar por OS ou cliente..."
                                    className="
                                        h-11
                                        w-full
                                        rounded-xl
                                        border border-[#16345c]/40
                                        bg-[#010b1b]/55
                                        pl-10
                                        pr-4
                                        text-sm
                                        text-[#f8fafc]
                                        outline-none
                                        transition-all
                                        placeholder:text-[#56657d]
                                        focus:border-[#2583ff]/50
                                        focus:ring-2
                                        focus:ring-[#2583ff]/10
                                    "
                                />

                            </div>


                            {/* PERÍODO */}

                            <PeriodFilter
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(start, end) => {

                                    setStartDate(start);
                                    setEndDate(end);

                                    setPage(1);
                                }}
                            />


                            {/* STATUS DO SERVIÇO */}

                            <StatusFilter
                                icon={SlidersHorizontal}
                                label="Status"
                                accessibleLabel="Status do serviço"
                                value={serviceStatus}
                                options={serviceOptions}
                                onChange={(value) => {

                                    setServiceStatus(
                                        value
                                    );

                                    setPage(1);
                                }}
                            />


                            {/* STATUS DO PAGAMENTO */}

                            <StatusFilter
                                icon={CircleDollarSign}
                                label="Pagamento"
                                accessibleLabel="Status do pagamento"
                                value={paymentStatus}
                                options={paymentOptions}
                                onChange={(value) => {

                                    setPaymentStatus(
                                        value
                                    );

                                    setPage(1);
                                }}
                            />


                            {/* MAIS FILTROS */}

                            <FilterButton
                                icon={Filter}
                                label="Mais filtros"
                            />

                        </div>


                        {/* RESULTADOS / RESET */}

                        <div
                            className="
                                mt-4
                                flex
                                items-center
                                justify-between
                                border-t border-[#16345c]/25
                                pt-4
                            "
                        >

                            <span className="text-xs text-[#56657d]">

                                {isLoading
                                    ? "Carregando ordens..."
                                    : `${total} ${total === 1
                                        ? "ordem encontrada"
                                        : "ordens encontradas"
                                    }`
                                }

                            </span>


                            <button
                                type="button"
                                onClick={handleClearFilters}
                                disabled={!hasActiveFilters}
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    text-xs
                                    font-medium
                                    text-[#8290a8]
                                    transition-colors
                                    hover:text-[#3692ff]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >

                                <RotateCcw
                                    size={13}
                                    strokeWidth={1.8}
                                />

                                Limpar filtros

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                mt-5
                                rounded-2xl
                                border border-red-500/20
                                bg-red-500/5
                                px-5 py-4
                                text-sm
                                text-red-400
                            "
                        >
                            {error}
                        </div>
                    )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {isLoading && (
                        <div
                            className="
                                mt-5
                                flex
                                min-h-[280px]
                                items-center
                                justify-center
                                rounded-2xl
                                border border-[#16345c]/35
                                bg-[#07182d]/40
                            "
                        >

                            <div className="flex flex-col items-center gap-4">

                                <div
                                    className="
                                        h-8
                                        w-8
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-[#16345c]
                                        border-t-[#2583ff]
                                    "
                                />

                                <span className="text-sm text-[#8290a8]">
                                    Carregando ordens de serviço...
                                </span>

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        ESTADO VAZIO
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        workOrders.length === 0 && (

                            <div
                                className="
                                    mt-5
                                    flex
                                    min-h-[280px]
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border border-[#16345c]/35
                                    bg-[#07182d]/40
                                    px-6
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border border-[#2583ff]/20
                                        bg-[#2583ff]/10
                                        text-[#3692ff]
                                    "
                                >

                                    <ClipboardList
                                        size={22}
                                        strokeWidth={1.8}
                                    />

                                </div>


                                <h3
                                    className="
                                        mt-4
                                        text-sm
                                        font-semibold
                                        text-[#f8fafc]
                                    "
                                >
                                    Nenhuma ordem encontrada
                                </h3>


                                <p
                                    className="
                                        mt-1
                                        max-w-md
                                        text-sm
                                        text-[#8290a8]
                                    "
                                >

                                    {search
                                        ? "Nenhuma ordem corresponde à busca informada."
                                        : activeTab === "pending"
                                            ? "Não existem pagamentos pendentes no momento."
                                            : "Nenhuma ordem de serviço foi encontrada."
                                    }

                                </p>

                            </div>

                        )}


                    {/* =================================================
                        TABELA DESKTOP
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        workOrders.length > 0 && (

                            <div
                                className="
                                    mt-5
                                    hidden
                                    overflow-hidden
                                    rounded-2xl
                                    border border-[#16345c]/35
                                    bg-[#07182d]/40
                                    lg:block
                                "
                            >

                                <div className="overflow-x-auto">

                                    <table className="w-full">

                                        <thead
                                            className="
                                                border-b border-[#16345c]/35
                                                bg-[#07182d]/70
                                            "
                                        >

                                            <tr
                                                className="
                                                    text-left
                                                    text-[11px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-[#56657d]
                                                "
                                            >

                                                <th className="px-5 py-4">
                                                    OS
                                                </th>

                                                <th className="px-5 py-4">
                                                    Cliente
                                                </th>

                                                <th className="px-5 py-4">
                                                    Data
                                                </th>

                                                <th className="px-5 py-4">
                                                    Serviço
                                                </th>

                                                <th className="px-5 py-4">
                                                    Pagamento
                                                </th>

                                                <th className="px-5 py-4 text-right">
                                                    Valor
                                                </th>

                                                <th className="w-16 px-5 py-4" />

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {workOrders.map(
                                                (workOrder) => (

                                                    <tr
                                                        key={workOrder.id}
                                                        className="
                                                            group
                                                            border-b border-[#16345c]/20
                                                            transition-colors
                                                            last:border-b-0
                                                            hover:bg-[#0a2242]/35
                                                        "
                                                    >

                                                        {/* OS */}

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className="
                                                                    font-medium
                                                                    text-[#3692ff]
                                                                "
                                                            >
                                                                #{workOrder.id}
                                                            </span>

                                                        </td>


                                                        {/* CLIENTE */}

                                                        <td className="px-5 py-4">

                                                            <div>

                                                                <span
                                                                    className="
                                                                        block
                                                                        text-sm
                                                                        font-medium
                                                                        text-[#f8fafc]
                                                                    "
                                                                >
                                                                    {workOrder.client.name}
                                                                </span>


                                                                <span
                                                                    className="
                                                                        mt-0.5
                                                                        block
                                                                        max-w-[260px]
                                                                        truncate
                                                                        text-xs
                                                                        text-[#56657d]
                                                                    "
                                                                >
                                                                    {workOrder.title}
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* DATA */}

                                                        <td
                                                            className="
                                                                px-5 py-4
                                                                text-sm
                                                                text-[#8290a8]
                                                            "
                                                        >
                                                            {formatDate(
                                                                workOrder.created_at
                                                            )}
                                                        </td>


                                                        {/* SERVIÇO */}

                                                        <td className="px-5 py-4">

                                                            <ServiceStatus
                                                                status={
                                                                    workOrder.status_service
                                                                }
                                                            />

                                                        </td>


                                                        {/* PAGAMENTO */}

                                                        <td className="px-5 py-4">

                                                            <PaymentStatusBadge
                                                                status={
                                                                    workOrder.status_payment
                                                                }
                                                            />

                                                        </td>


                                                        {/* VALOR */}

                                                        <td
                                                            className="
                                                                px-5 py-4
                                                                text-right
                                                                text-sm
                                                                font-medium
                                                                text-[#f8fafc]
                                                            "
                                                        >
                                                            {formatCurrency(
                                                                workOrder.price
                                                            )}
                                                        </td>


                                                        {/* AÇÕES */}

                                                        <td className="px-5 py-4">

                                                            <button
                                                                type="button"
                                                                aria-label={`Abrir ações da ordem ${workOrder.id}`}
                                                                onClick={() =>
                                                                    handleOpenActions(
                                                                        workOrder
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    text-[#56657d]
                                                                    transition-all
                                                                    hover:bg-[#2583ff]/10
                                                                    hover:text-[#3692ff]
                                                                "
                                                            >

                                                                <MoreHorizontal
                                                                    size={18}
                                                                />

                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        )}


                    {/* =================================================
                        MOBILE
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        workOrders.length > 0 && (

                            <div className="mt-5 space-y-3 lg:hidden">

                                {workOrders.map(
                                    (workOrder) => (

                                        <div
                                            key={workOrder.id}
                                            className="
                                                rounded-2xl
                                                border border-[#16345c]/35
                                                bg-[#07182d]/45
                                                p-4
                                            "
                                        >

                                            {/* TOPO */}

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <div className="min-w-0">

                                                    <span
                                                        className="
                                                            text-xs
                                                            font-medium
                                                            text-[#3692ff]
                                                        "
                                                    >
                                                        #{workOrder.id}
                                                    </span>


                                                    <h3
                                                        className="
                                                            mt-1
                                                            truncate
                                                            font-medium
                                                            text-[#f8fafc]
                                                        "
                                                    >
                                                        {workOrder.client.name}
                                                    </h3>


                                                    <span
                                                        className="
                                                            mt-1
                                                            block
                                                            text-xs
                                                            text-[#56657d]
                                                        "
                                                    >
                                                        {formatDate(
                                                            workOrder.created_at
                                                        )}
                                                    </span>

                                                </div>


                                                <button
                                                    type="button"
                                                    aria-label={`Abrir ações da ordem ${workOrder.id}`}
                                                    onClick={() =>
                                                        handleOpenActions(
                                                            workOrder
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-[#56657d]
                                                        transition-all
                                                        hover:bg-[#2583ff]/10
                                                        hover:text-[#3692ff]
                                                    "
                                                >

                                                    <MoreHorizontal
                                                        size={18}
                                                    />

                                                </button>

                                            </div>


                                            {/* TÍTULO */}

                                            <p
                                                className="
                                                    mt-3
                                                    text-sm
                                                    leading-5
                                                    text-[#a7b4c8]
                                                "
                                            >
                                                {workOrder.title}
                                            </p>


                                            {/* STATUS */}

                                            <div className="mt-4 flex flex-wrap gap-2">

                                                <ServiceStatus
                                                    status={
                                                        workOrder.status_service
                                                    }
                                                />

                                                <PaymentStatusBadge
                                                    status={
                                                        workOrder.status_payment
                                                    }
                                                />

                                            </div>


                                            {/* VALOR */}

                                            <div
                                                className="
                                                    mt-4
                                                    flex
                                                    items-center
                                                    justify-between
                                                    border-t border-[#16345c]/25
                                                    pt-4
                                                "
                                            >

                                                <span className="text-xs text-[#56657d]">
                                                    Valor
                                                </span>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-[#f8fafc]
                                                    "
                                                >
                                                    {formatCurrency(
                                                        workOrder.price
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                    {/* =================================================
                        PAGINAÇÃO
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        total > 0 && (

                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-col
                                    gap-4
                                    rounded-2xl
                                    border border-[#16345c]/30
                                    bg-[#07182d]/30
                                    px-4 py-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <span
                                    className="
                                        text-center
                                        text-xs
                                        text-[#8290a8]
                                        sm:text-left
                                    "
                                >

                                    Mostrando{" "}

                                    <strong className="text-[#f8fafc]">
                                        {firstItem}–{lastItem}
                                    </strong>

                                    {" "}de{" "}

                                    <strong className="text-[#f8fafc]">
                                        {total}
                                    </strong>

                                    {" "}ordens

                                </span>


                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        justify-center
                                        gap-1
                                    "
                                >

                                    <PaginationButton
                                        disabled={
                                            page <= 1
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                page - 1
                                            )
                                        }
                                    >
                                        <ChevronLeft
                                            size={16}
                                        />
                                    </PaginationButton>


                                    {visiblePages.map(
                                        (
                                            pageItem,
                                            index
                                        ) => {

                                            if (
                                                pageItem ===
                                                "ellipsis"
                                            ) {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="
                                                            px-2
                                                            text-xs
                                                            text-[#56657d]
                                                        "
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }


                                            return (
                                                <PaginationButton
                                                    key={
                                                        pageItem
                                                    }
                                                    active={
                                                        pageItem ===
                                                        page
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageItem
                                                        )
                                                    }
                                                >
                                                    {pageItem}
                                                </PaginationButton>
                                            );
                                        }
                                    )}


                                    <PaginationButton
                                        disabled={
                                            page >=
                                            totalPages
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                page + 1
                                            )
                                        }
                                    >
                                        <ChevronRight
                                            size={16}
                                        />
                                    </PaginationButton>

                                </div>

                            </div>

                        )}

                </div>

            </div>


            {/* =====================================================
                MODAL DE AÇÕES
            ===================================================== */}

            <WorkOrderActionsModal
                open={isActionsModalOpen}
                workOrder={selectedWorkOrderForModal}
                onClose={handleCloseActions}
                onView={handleViewWorkOrder}
                onUpdated={loadWorkOrders}
            />

            <WorkOrderDetailsModal
                open={isDetailsModalOpen}
                workOrder={selectedWorkOrderForDetails}
                onClose={handleCloseDetails}
            />

        </div>
    );
}


// =============================================================
// PAGINAÇÃO
// =============================================================

type PaginationItem =
    number | "ellipsis";


function getVisiblePages(
    currentPage: number,
    totalPages: number
): PaginationItem[] {

    if (totalPages <= 7) {

        return Array.from(
            {
                length: totalPages,
            },
            (_, index) =>
                index + 1
        );
    }


    if (currentPage <= 4) {

        return [
            1,
            2,
            3,
            4,
            5,
            "ellipsis",
            totalPages,
        ];
    }


    if (
        currentPage >=
        totalPages - 3
    ) {

        return [
            1,
            "ellipsis",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }


    return [
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages,
    ];
}


// =============================================================
// TAB
// =============================================================

interface TabButtonProps {
    active?: boolean;
    label: string;
    count: number;
    onClick: () => void;
}


function TabButton({
    active = false,
    label,
    count,
    onClick,
}: TabButtonProps) {

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                relative
                flex
                items-center
                gap-2
                px-4
                pb-4
                pt-2
                text-sm
                font-medium
                transition-colors

                ${active
                    ? "text-[#f8fafc]"
                    : "text-[#8290a8] hover:text-[#a7b4c8]"
                }
            `}
        >

            {label}


            <span
                className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[10px]
                    font-semibold

                    ${active
                        ? "bg-[#2583ff]/15 text-[#3692ff]"
                        : "bg-[#07182d] text-[#56657d]"
                    }
                `}
            >
                {count}
            </span>


            {active && (
                <span
                    className="
                        absolute
                        bottom-[-1px]
                        left-2
                        right-2
                        h-[2px]
                        rounded-full
                        bg-[#2583ff]
                        shadow-[0_0_10px_rgba(37,131,255,0.6)]
                    "
                />
            )}

        </button>
    );
}


// =============================================================
// FILTROS
// =============================================================

const filterBaseClass =
    "flex h-11 w-full shrink-0 items-center justify-between gap-3 rounded-xl border px-3.5 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2583ff]/50";

const filterIdleClass =
    "border-[#16345c]/40 bg-[#010b1b]/40 text-[#a7b4c8] hover:border-[#2583ff]/25 hover:bg-[#0a2242]/45 hover:text-[#f8fafc]";

const filterActiveClass =
    "border-[#2583ff]/50 bg-[#2583ff]/10 text-[#3692ff]";

const filterPanelClass =
    "absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-[#16345c]/40 bg-[#07182d] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] xl:w-72";


interface FilterButtonProps {
    icon: ElementType;
    label: string;
    active?: boolean;
    expanded?: boolean;
    onClick?: () => void;
}


function FilterButton({
    icon: Icon,
    label,
    active = false,
    expanded,
    onClick,
}: FilterButtonProps) {

    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={expanded}
            className={`
                ${filterBaseClass}
                xl:w-auto

                ${active
                    ? filterActiveClass
                    : filterIdleClass
                }
            `}
        >

            <span className="flex items-center gap-2">

                <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={
                        active
                            ? "text-[#3692ff]"
                            : "text-[#56657d]"
                    }
                />

                {label}

            </span>


            <ChevronDown
                size={14}
                className="text-[#56657d]"
            />

        </button>
    );
}


// =============================================================
// STATUS FILTER
// =============================================================

function StatusFilter<
    T extends string
>({
    icon: Icon,
    label,
    accessibleLabel,
    value,
    options,
    onChange,
}: {
    icon: ElementType;
    label: string;
    accessibleLabel: string;
    value: T | "";
    options: {
        value: T;
        label: string;
    }[];
    onChange: (
        value: T | ""
    ) => void;
}) {

    const selected =
        options.find(
            (option) =>
                option.value === value
        );


    return (
        <div
            className={`
                relative
                xl:shrink-0
                ${filterBaseClass}

                ${value
                    ? filterActiveClass
                    : filterIdleClass
                }

                xl:w-auto
                focus-within:ring-2
                focus-within:ring-[#2583ff]/50
            `}
        >

            <span
                className="flex items-center gap-2"
                aria-hidden="true"
            >

                <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={
                        value
                            ? "text-[#3692ff]"
                            : "text-[#56657d]"
                    }
                />

                {selected
                    ? `${label}: ${selected.label}`
                    : label
                }

            </span>


            <ChevronDown
                size={14}
                className="text-[#56657d]"
                aria-hidden="true"
            />


            <select
                aria-label={
                    accessibleLabel
                }
                value={value}
                className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    cursor-pointer
                    opacity-0
                "
                onChange={(event) => {

                    const option =
                        options.find(
                            (item) =>
                                item.value ===
                                event.target.value
                        );

                    onChange(
                        option?.value ?? ""
                    );
                }}
            >

                <option value="">
                    Todos
                </option>


                {options.map(
                    (option) => (

                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {option.label}
                        </option>

                    )
                )}

            </select>

        </div>
    );
}


// =============================================================
// PERÍODO
// =============================================================

function PeriodFilter({
    startDate,
    endDate,
    onChange,
}: {
    startDate: string;
    endDate: string;
    onChange: (
        start: string,
        end: string
    ) => void;
}) {

    const [open, setOpen] =
        useState(false);

    const containerRef =
        useRef<HTMLDivElement>(
            null
        );


    const invalidRange =
        Boolean(
            startDate &&
            endDate &&
            startDate > endDate
        );


    useEffect(() => {

        if (!open) {
            return;
        }


        function handleOutside(
            event: PointerEvent
        ) {

            if (
                event.target instanceof Node &&
                !containerRef.current?.contains(
                    event.target
                )
            ) {
                setOpen(false);
            }
        }


        document.addEventListener(
            "pointerdown",
            handleOutside
        );


        return () =>
            document.removeEventListener(
                "pointerdown",
                handleOutside
            );

    }, [open]);


    function dateLabel(
        value: string
    ) {

        return value
            .split("-")
            .reverse()
            .join("/");
    }


    const label =
        startDate && endDate
            ? `${dateLabel(startDate)} – ${dateLabel(endDate)}`
            : startDate
                ? `Desde ${dateLabel(startDate)}`
                : endDate
                    ? `Até ${dateLabel(endDate)}`
                    : "Período";


    const inputClass =
        "mt-1 h-10 w-full min-w-0 rounded-lg border border-[#16345c]/40 bg-[#010b1b]/55 px-3 text-sm text-[#f8fafc] outline-none focus:border-[#2583ff]/50 focus:ring-2 focus:ring-[#2583ff]/10 [color-scheme:dark]";


    return (
        <div
            ref={containerRef}
            className="
                relative
                min-w-0
                xl:shrink-0
            "
            onBlur={(event) => {

                if (
                    !event.currentTarget.contains(
                        event.relatedTarget
                    )
                ) {
                    setOpen(false);
                }
            }}
            onKeyDown={(event) => {

                if (
                    event.key === "Escape"
                ) {

                    event.stopPropagation();

                    setOpen(false);

                    containerRef.current
                        ?.querySelector("button")
                        ?.focus();
                }
            }}
        >

            <FilterButton
                icon={CalendarDays}
                label={label}
                active={
                    Boolean(
                        startDate ||
                        endDate
                    )
                }
                expanded={open}
                onClick={() =>
                    setOpen(!open)
                }
            />


            {open && (

                <div
                    className={
                        filterPanelClass
                    }
                    role="group"
                    aria-label="Período de criação"
                >

                    <p className="mb-3 text-xs text-[#8290a8]">
                        Período de criação
                    </p>


                    <label className="block text-xs text-[#a7b4c8]">

                        Data inicial

                        <input
                            type="date"
                            value={startDate}
                            max={
                                endDate ||
                                "9999-12-31"
                            }
                            className={
                                inputClass
                            }
                            onChange={(event) => {

                                const next =
                                    event.target.value;


                                if (
                                    next &&
                                    endDate &&
                                    next > endDate
                                ) {

                                    event.target.setCustomValidity(
                                        "A data inicial deve ser anterior ou igual à final."
                                    );

                                    event.target.reportValidity();

                                    return;
                                }


                                event.target.setCustomValidity(
                                    ""
                                );

                                onChange(
                                    next,
                                    endDate
                                );
                            }}
                        />

                    </label>


                    <label className="mt-3 block text-xs text-[#a7b4c8]">

                        Data final

                        <input
                            type="date"
                            value={endDate}
                            min={
                                startDate ||
                                undefined
                            }
                            max="9999-12-31"
                            className={
                                inputClass
                            }
                            onChange={(event) => {

                                const next =
                                    event.target.value;


                                if (
                                    next &&
                                    startDate &&
                                    next < startDate
                                ) {

                                    event.target.setCustomValidity(
                                        "A data final deve ser posterior ou igual à inicial."
                                    );

                                    event.target.reportValidity();

                                    return;
                                }


                                event.target.setCustomValidity(
                                    ""
                                );

                                onChange(
                                    startDate,
                                    next
                                );
                            }}
                        />

                    </label>


                    {invalidRange && (

                        <p
                            role="alert"
                            className="
                                mt-2
                                text-xs
                                text-red-400
                            "
                        >
                            Confira o intervalo informado.
                        </p>

                    )}


                    <button
                        type="button"
                        className="
                            mt-3
                            text-xs
                            text-[#3692ff]
                            hover:text-[#f8fafc]
                        "
                        onClick={() =>
                            onChange(
                                "",
                                ""
                            )
                        }
                    >
                        Limpar período
                    </button>

                </div>

            )}

        </div>
    );
}


// =============================================================
// STATUS DO SERVIÇO
// =============================================================

function ServiceStatus({
    status,
}: {
    status: WorkOrderStatus;
}) {

    if (
        status === "FINALIZADO"
    ) {
        return (
            <StatusBadge
                label="Finalizado"
                className="
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-400
                "
            />
        );
    }


    if (
        status === "EM_ANDAMENTO"
    ) {
        return (
            <StatusBadge
                label="Em andamento"
                className="
                    border-[#2583ff]/20
                    bg-[#2583ff]/10
                    text-[#3692ff]
                "
            />
        );
    }


    if (
        status === "CANCELADO"
    ) {
        return (
            <StatusBadge
                label="Cancelado"
                className="
                    border-red-500/20
                    bg-red-500/10
                    text-red-400
                "
            />
        );
    }


    return (
        <StatusBadge
            label="Pendente"
            className="
                border-amber-500/20
                bg-amber-500/10
                text-amber-400
            "
        />
    );
}


// =============================================================
// STATUS DO PAGAMENTO
// =============================================================

function PaymentStatusBadge({
    status,
}: {
    status: PaymentStatusType;
}) {

    if (
        status === "PAGO"
    ) {
        return (
            <StatusBadge
                label="Pago"
                className="
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-400
                "
            />
        );
    }


    if (
        status === "PARCIAL"
    ) {
        return (
            <StatusBadge
                label="Parcial"
                className="
                    border-[#2583ff]/20
                    bg-[#2583ff]/10
                    text-[#3692ff]
                "
            />
        );
    }


    if (
        status === "CANCELADO"
    ) {
        return (
            <StatusBadge
                label="Cancelado"
                className="
                    border-red-500/20
                    bg-red-500/10
                    text-red-400
                "
            />
        );
    }


    return (
        <StatusBadge
            label="Pendente"
            className="
                border-amber-500/20
                bg-amber-500/10
                text-amber-400
            "
        />
    );
}


// =============================================================
// BADGE
// =============================================================

function StatusBadge({
    label,
    className,
}: {
    label: string;
    className: string;
}) {

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                border
                px-2.5
                py-1
                text-[11px]
                font-medium

                ${className}
            `}
        >
            {label}
        </span>
    );
}


// =============================================================
// BOTÃO DE PAGINAÇÃO
// =============================================================

function PaginationButton({
    children,
    active = false,
    disabled = false,
    onClick,
}: {
    children: ReactNode;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}) {

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`
                flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                px-2
                text-xs
                font-medium
                transition-all

                ${active
                    ? `
                            bg-[#2583ff]
                            text-white
                            shadow-[0_0_18px_rgba(37,131,255,0.20)]
                        `
                    : `
                            border
                            border-[#16345c]/30
                            bg-[#010b1b]/30
                            text-[#8290a8]

                            hover:border-[#2583ff]/25
                            hover:bg-[#0a2242]/50
                            hover:text-[#f8fafc]
                        `
                }

                disabled:cursor-not-allowed
                disabled:opacity-35
                disabled:hover:border-[#16345c]/30
                disabled:hover:bg-[#010b1b]/30
                disabled:hover:text-[#8290a8]
            `}
        >
            {children}
        </button>
    );
}