import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardList,
    Mail,
    Phone,
    UserRound,
} from "lucide-react";

import { ClientService } from "../services/client.service";
import { useClientStore } from "../../../shared/store/client.store";
import { Loading } from "../../../shared/components/loading";


export function ClientDetailsPage() {
    const { id } = useParams();

    const navigate = useNavigate();


    // ====================================================
    // CLIENTE SELECIONADO
    // ====================================================

    const selectedClient = useClientStore(
        (state) => state.selectedClient
    );

    const setSelectedClient = useClientStore(
        (state) => state.setSelectedClient
    );

    const clearSelectedClient = useClientStore(
        (state) => state.clearSelectedClient
    );


    // ====================================================
    // CARREGAMENTO
    // ====================================================

    useEffect(() => {
        const loadClientDetails = async () => {
            if (!id) {
                return;
            }

            const response =
                await ClientService.getDetails(
                    Number(id)
                );

            if (
                !response.success ||
                !response.data
            ) {
                return;
            }

            setSelectedClient(
                response.data
            );
        };

        void loadClientDetails();

        return () => {
            clearSelectedClient();
        };
    }, [
        id,
        setSelectedClient,
        clearSelectedClient,
    ]);


    // ====================================================
    // LOADING
    // ====================================================

    if (!selectedClient) {
        return (
            <Loading message="Carregando dados do cliente..." />
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
        date: string
    ) => {
        return new Intl.DateTimeFormat(
            "pt-BR"
        ).format(
            new Date(date)
        );
    };


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
                VOLTAR
            ===================================================== */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                    mb-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border border-transparent
                    px-2 py-1.5
                    text-sm
                    font-medium
                    text-[#8290a8]
                    transition-all
                    duration-200

                    hover:border-[#16345c]/30
                    hover:bg-[#07182d]/55
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
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-10 w-10
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
                        <UserRound
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
                            Cliente
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
                            {selectedClient.name}
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
                        sm:text-base
                    "
                >
                    Informações, histórico e ordens de serviço vinculadas.
                </p>
            </header>


            {/* =====================================================
                DADOS DO CLIENTE
            ===================================================== */}
            <section
                className="
                    overflow-hidden
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                "
            >
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
                            flex
                            h-10 w-10
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
                            Dados do cliente
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Informações principais do cadastro.
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
                        {/* TELEFONE */}
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
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <Phone
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    Telefone
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
                                    {selectedClient.phone}
                                </p>
                            </div>
                        </div>


                        {/* EMAIL */}
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
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <Mail
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    E-mail
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
                                    {selectedClient.email ||
                                        "Não informado"}
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* OBSERVAÇÕES */}
                    {selectedClient.notes && (
                        <div
                            className="
                                mt-4
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
                                    tracking-wide
                                    text-[#56657d]
                                "
                            >
                                Observações
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-[#a7b4c8]
                                "
                            >
                                {selectedClient.notes}
                            </p>
                        </div>
                    )}
                </div>
            </section>


            {/* =====================================================
                RESUMO
            ===================================================== */}
            <div
                className="
                    mt-6
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {/* TOTAL */}
                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Total de OS
                        </p>

                        <ClipboardList
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#56657d]"
                        />
                    </div>

                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {
                            selectedClient.summary
                                .total_work_orders
                        }
                    </p>
                </div>


                {/* EM ABERTO */}
                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Em aberto
                        </p>

                        <ClipboardList
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />
                    </div>

                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#3692ff]
                        "
                    >
                        {
                            selectedClient.summary
                                .open_work_orders
                        }
                    </p>
                </div>


                {/* FINALIZADAS */}
                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Finalizadas
                        </p>

                        <ClipboardCheck
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />
                    </div>

                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {
                            selectedClient.summary
                                .finished_work_orders
                        }
                    </p>
                </div>


                {/* VALOR TOTAL */}
                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >
                    <div className="flex items-center justify-between">
                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Valor em serviços
                        </p>

                        <CircleDollarSign
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />
                    </div>

                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {formatCurrency(
                            selectedClient.summary
                                .total_services_value
                        )}
                    </p>
                </div>
            </div>


            {/* =====================================================
                ORDENS DE SERVIÇO
            ===================================================== */}
            <section
                className="
                    mt-6
                    overflow-hidden
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                "
            >
                {/* HEADER */}
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
                            flex
                            h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <ClipboardList
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
                            Ordens de serviço
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Histórico de serviços vinculados a este cliente.
                        </p>
                    </div>
                </div>


                {/* =================================================
                    LISTA COM ALTURA MÁXIMA
                ================================================= */}
                <div
                    className="
                        max-h-[520px]
                        overflow-y-auto
                        p-5
                        sm:p-6
                    "
                >
                    <div className="space-y-3">
                        {selectedClient.work_orders.length ? (
                            selectedClient.work_orders.map(
                                (workOrder) => (
                                    <div
                                        key={workOrder.id}
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-xl
                                            border border-[#16345c]/25
                                            bg-[#010b1b]/35
                                            p-4
                                            transition-all
                                            duration-200

                                            hover:border-[#2583ff]/20
                                            hover:bg-[#07182d]/45

                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >
                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {workOrder.title}
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-[#56657d]
                                                "
                                            >
                                                Criada em{" "}
                                                {formatDate(
                                                    workOrder.created_at
                                                )}
                                            </p>
                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-6
                                                sm:shrink-0
                                                sm:text-right
                                            "
                                        >
                                            <div>
                                                <p
                                                    className="
                                                        text-xs
                                                        font-medium
                                                        text-[#3692ff]
                                                    "
                                                >
                                                    {
                                                        workOrder.status_service
                                                    }
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-xs
                                                        text-[#8290a8]
                                                    "
                                                >
                                                    {
                                                        workOrder.status_payment
                                                    }
                                                </p>
                                            </div>

                                            <p
                                                className="
                                                    font-semibold
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {formatCurrency(
                                                    workOrder.price
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div
                                className="
                                    flex
                                    min-h-36
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border border-dashed border-[#16345c]/40
                                    bg-[#010b1b]/25
                                    p-6
                                    text-center
                                "
                            >
                                <div>
                                    <ClipboardList
                                        size={24}
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
                                        Nenhuma ordem de serviço vinculada a este cliente.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </section>
    );
}