import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    FileText,
    UserRound,
    Wrench,
} from "lucide-react";

import { WorkOrderService } from "../services/work-order.service";
import { Loading } from "../../../shared/components/loading";

import type { WorkOrderDetailsResponse } from "../types/work-order.types";


export function WorkOrderDetailsPage() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [workOrder, setWorkOrder] =
        useState<WorkOrderDetailsResponse | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);


    // ====================================================
    // CARREGAMENTO
    // ====================================================

    useEffect(() => {
        const loadWorkOrder = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                const response =
                    await WorkOrderService.getById(
                        Number(id)
                    );

                if (
                    !response.success ||
                    !response.data
                ) {
                    return;
                }

                setWorkOrder(
                    response.data
                );

            } finally {
                setIsLoading(false);
            }
        };

        void loadWorkOrder();

    }, [id]);


    // ====================================================
    // LOADING
    // ====================================================

    if (isLoading) {
        return (
            <Loading message="Carregando ordem de serviço..." />
        );
    }


    // ====================================================
    // NÃO ENCONTRADA
    // ====================================================

    if (!workOrder) {
        return (
            <section
                className="
                    flex
                    min-h-[420px]
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    border border-[#16345c]/30
                    bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.08),_transparent_30%),linear-gradient(135deg,_#051020_0%,_#010b1b_55%,_#031126_100%)]
                    px-5
                    py-10
                    shadow-[0_20px_60px_rgba(0,0,0,0.22)]
                "
            >
                <div className="text-center">
                    <div
                        className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#16345c]/30
                            bg-[#07182d]
                            text-[#56657d]
                        "
                    >
                        <ClipboardList
                            size={22}
                            strokeWidth={1.7}
                        />
                    </div>

                    <h2
                        className="
                            mt-4
                            text-xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        Ordem de serviço não encontrada
                    </h2>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-[#8290a8]
                        "
                    >
                        Não foi possível localizar a ordem solicitada.
                    </p>
                </div>
            </section>
        );
    }


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
        <section
            className="
                w-full
                rounded-2xl
                border border-[#16345c]/30
                bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.10),_transparent_30%),linear-gradient(135deg,_#051020_0%,_#010b1b_55%,_#031126_100%)]
                px-5
                py-6
                shadow-[0_20px_60px_rgba(0,0,0,0.22)]
                sm:px-6
                lg:px-8
            "
        >
            {/* =====================================================
                VOLTAR
            ===================================================== */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    px-2
                    py-1.5
                    text-sm
                    font-medium
                    text-[#8290a8]
                    transition-all
                    duration-200

                    hover:bg-[#07182d]/60
                    hover:text-[#f8fafc]
                "
            >
                <ArrowLeft
                    size={17}
                    strokeWidth={1.8}
                />

                Voltar
            </button>


            {/* =====================================================
                HEADER
            ===================================================== */}
            <header className="mt-6">
                <div className="flex items-center gap-3">
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
                            shadow-[0_0_20px_rgba(37,131,255,0.08)]
                        "
                    >
                        <ClipboardList
                            size={20}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <p
                            className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-[0.22em]
                                text-[#3692ff]
                            "
                        >
                            Ordem de serviço #{workOrder.id}
                        </p>

                        <h1
                            className="
                                mt-1
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-[#f8fafc]
                                sm:text-4xl
                            "
                        >
                            {workOrder.title}
                        </h1>
                    </div>
                </div>

                <p
                    className="
                        mt-3
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[#8290a8]
                    "
                >
                    Visualize todas as informações vinculadas a esta ordem de serviço.
                </p>
            </header>


            {/* =====================================================
                DADOS PRINCIPAIS
            ===================================================== */}
            <section
                className="
                    mt-8
                    overflow-hidden
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-[#16345c]/25
                        px-5
                        py-5
                        sm:px-6
                    "
                >
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <Wrench
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Informações da ordem
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Dados principais do serviço.
                        </p>
                    </div>
                </div>


                <div className="p-5 sm:p-6">
                    <div
                        className="
                            grid
                            gap-4
                            md:grid-cols-2
                        "
                    >
                        {/* CLIENTE */}
                        <div
                            className="
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                border border-[#16345c]/25
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
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <UserRound
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-[#56657d]">
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
                                    {workOrder.client.name}
                                </p>
                            </div>
                        </div>


                        {/* VALOR */}
                        <div
                            className="
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                border border-[#16345c]/25
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
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <CircleDollarSign
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#56657d]">
                                    Valor
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-[#f8fafc]
                                    "
                                >
                                    {formatCurrency(Number(workOrder.price))}
                                </p>
                            </div>
                        </div>


                        {/* STATUS SERVIÇO */}
                        <div
                            className="
                                rounded-xl
                                border border-[#16345c]/25
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
                                    className="text-[#56657d]"
                                />

                                <p className="text-xs text-[#56657d]">
                                    Status do serviço
                                </p>
                            </div>

                            <span
                                className={`
                                    mt-3
                                    inline-flex
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


                        {/* STATUS PAGAMENTO */}
                        <div
                            className="
                                rounded-xl
                                border border-[#16345c]/25
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
                                    className="text-[#56657d]"
                                />

                                <p className="text-xs text-[#56657d]">
                                    Status do pagamento
                                </p>
                            </div>

                            <span
                                className={`
                                    mt-3
                                    inline-flex
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
                    </div>
                </div>
            </section>


            {/* =====================================================
                DESCRIÇÃO
            ===================================================== */}
            <section
                className="
                    mt-6
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    p-5
                    sm:p-6
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <FileText
                            size={17}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Descrição
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Detalhes informados sobre o serviço.
                        </p>
                    </div>
                </div>

                <div
                    className="
                        mt-5
                        rounded-xl
                        border border-[#16345c]/25
                        bg-[#010b1b]/35
                        p-4
                    "
                >
                    <p
                        className="
                            whitespace-pre-wrap
                            text-sm
                            leading-7
                            text-[#a7b4c8]
                        "
                    >
                        {workOrder.description ||
                            "Nenhuma descrição informada."}
                    </p>
                </div>
            </section>


            {/* =====================================================
                DADOS COMPLEMENTARES
            ===================================================== */}
            <section
                className="
                    mt-6
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    p-5
                    sm:p-6
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <ClipboardList
                            size={17}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Dados complementares
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Informações adicionais vinculadas à ordem de serviço.
                        </p>
                    </div>
                </div>


                <div
                    className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                    "
                >
                    {workOrder.custom_values?.length ? (
                        workOrder.custom_values.map(
                            (customField) => (
                                <div
                                    key={customField.id}
                                    className="
                                        rounded-xl
                                        border border-[#16345c]/25
                                        bg-[#010b1b]/35
                                        p-4
                                    "
                                >
                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-[0.12em]
                                            text-[#56657d]
                                        "
                                    >
                                        {
                                            customField
                                                .field_definition
                                                .name
                                        }
                                    </p>

                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            font-medium
                                            text-[#f8fafc]
                                        "
                                    >
                                        {customField.value ||
                                            "Não informado"}
                                    </p>
                                </div>
                            )
                        )
                    ) : (
                        <div
                            className="
                                flex
                                min-h-32
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-dashed
                                border-[#16345c]/40
                                bg-[#010b1b]/25
                                p-6
                                text-center
                                md:col-span-2
                            "
                        >
                            <div>
                                <ClipboardList
                                    size={23}
                                    strokeWidth={1.5}
                                    className="
                                        mx-auto
                                        text-[#56657d]
                                    "
                                />

                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        text-[#8290a8]
                                    "
                                >
                                    Nenhum dado complementar cadastrado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>


            {/* =====================================================
                DATA DE CRIAÇÃO
            ===================================================== */}
            <div
                className="
                    mt-6
                    flex
                    items-center
                    gap-3
                    border-t
                    border-[#16345c]/25
                    pt-5
                    text-xs
                    text-[#56657d]
                "
            >
                <CalendarDays
                    size={15}
                    strokeWidth={1.8}
                />

                <span>
                    Ordem criada em{" "}
                    {formatDate(
                        workOrder.created_at
                    )}
                </span>
            </div>
        </section>
    );
}