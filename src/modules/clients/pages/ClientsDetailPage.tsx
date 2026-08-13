import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react";

import { ClientService } from "../services/client.service";
import { useClientStore } from "../../../shared/store/client.store";
import { Loading } from "../../../shared/components/loading";

export function ClientDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const selectedClient = useClientStore(
        (state) => state.selectedClient
    );

    const setSelectedClient = useClientStore(
        (state) => state.setSelectedClient
    );

    const clearSelectedClient = useClientStore(
        (state) => state.clearSelectedClient
    );

    useEffect(() => {
        const loadClientDetails = async () => {


            if (!id) {
                return;
            }

            const response = await ClientService.getDetails(
                Number(id)
            );

            if (!response.success || !response.data) {
                return;
            }

            setSelectedClient(response.data);
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

    if (!selectedClient) {
        return (
            <Loading message="Carregando dados do cliente..." />
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat("pt-BR").format(
            new Date(date)
        );
    };

    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">

            {/* Header */}
            <header className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>

                <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
                        Cliente
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        {selectedClient.name}
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Informações, histórico e ordens de serviço vinculadas.
                    </p>
                </div>
            </header>

            {/* Dados do cliente */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                        <UserRound size={24} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Dados do cliente
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            Informações principais do cadastro.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-[#0B1120] p-4">
                        <Phone
                            size={18}
                            className="text-violet-300"
                        />

                        <div>
                            <p className="text-xs text-zinc-500">
                                Telefone
                            </p>

                            <p className="mt-1 text-sm text-white">
                                {selectedClient.phone}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-[#0B1120] p-4">
                        <Mail
                            size={18}
                            className="text-violet-300"
                        />

                        <div>
                            <p className="text-xs text-zinc-500">
                                E-mail
                            </p>

                            <p className="mt-1 text-sm text-white">
                                {selectedClient.email || "Não informado"}
                            </p>
                        </div>
                    </div>
                </div>

                {selectedClient.notes && (
                    <div className="mt-4 rounded-2xl bg-[#0B1120] p-4">
                        <p className="text-xs text-zinc-500">
                            Observações
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                            {selectedClient.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Resumo */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-zinc-400">
                        Total de OS
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                        {selectedClient.summary.total_work_orders}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-zinc-400">
                        Em aberto
                    </p>

                    <p className="mt-3 text-2xl font-bold text-violet-300">
                        {selectedClient.summary.open_work_orders}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-zinc-400">
                        Finalizadas
                    </p>

                    <p className="mt-3 text-2xl font-bold text-emerald-300">
                        {selectedClient.summary.finished_work_orders}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-zinc-400">
                        Valor em serviços
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                        {formatCurrency(
                            selectedClient.summary.total_services_value
                        )}
                    </p>
                </div>
            </div>

            {/* Ordens de serviço */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-white">
                    Ordens de Serviço
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Histórico de serviços vinculados a este cliente.
                </p>

                <div className="mt-5 space-y-4">
                    {selectedClient.work_orders.length ? (
                        selectedClient.work_orders.map(
                            (workOrder) => (
                                <div
                                    key={workOrder.id}
                                    className="flex flex-col gap-4 rounded-2xl bg-[#0B1120] p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            {workOrder.title}
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            Criada em{" "}
                                            {formatDate(
                                                workOrder.created_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 sm:text-right">
                                        <div>
                                            <p className="text-xs text-violet-300">
                                                {workOrder.status_service}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {workOrder.status_payment}
                                            </p>
                                        </div>

                                        <p className="font-semibold text-white">
                                            {formatCurrency(
                                                workOrder.price
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )
                        )
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                            <p className="text-sm text-zinc-400">
                                Nenhuma ordem de serviço vinculada a este cliente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}