import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

    useEffect(() => {
        const loadWorkOrder = async () => {
            if (!id) {
                return;
            }

            try {
                setIsLoading(true);

                const response =
                    await WorkOrderService.getById(
                        Number(id)
                    );

                if (!response.success || !response.data) {
                    return;
                }

                setWorkOrder(response.data);

            } finally {
                setIsLoading(false);
            }
        };

        void loadWorkOrder();

    }, [id]);

    if (isLoading) {
        return (
            <Loading message="Carregando ordem de serviço..." />
        );
    }

    if (!workOrder) {
        return (
            <div className="p-6 text-zinc-400">
                Ordem de serviço não encontrada.
            </div>
        );
    }

    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">

            {/* HEADER */}
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

                    <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
                        Ordem de Serviço
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        {workOrder.title}
                    </h1>

                </div>

            </header>


            {/* DADOS PRINCIPAIS */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <h2 className="text-xl font-semibold text-white">
                    Informações da ordem
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                    <div className="rounded-2xl bg-[#0B1120] p-4">
                        <p className="text-xs text-zinc-500">
                            Cliente
                        </p>

                        <p className="mt-1 text-sm text-white">
                            {workOrder.client.name}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-[#0B1120] p-4">
                        <p className="text-xs text-zinc-500">
                            Valor
                        </p>

                        <p className="mt-1 text-sm text-white">
                            {workOrder.price}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-[#0B1120] p-4">
                        <p className="text-xs text-zinc-500">
                            Status do serviço
                        </p>

                        <p className="mt-1 text-sm text-violet-300">
                            {workOrder.status_service}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-[#0B1120] p-4">
                        <p className="text-xs text-zinc-500">
                            Status do pagamento
                        </p>

                        <p className="mt-1 text-sm text-zinc-300">
                            {workOrder.status_payment}
                        </p>
                    </div>

                </div>

            </section>


            {/* DESCRIÇÃO */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <h2 className="text-xl font-semibold text-white">
                    Descrição
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    {workOrder.description}
                </p>

            </section>


            {/* DADOS COMPLEMENTARES */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <h2 className="text-xl font-semibold text-white">
                    Dados complementares
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Informações adicionais vinculadas à ordem de serviço.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                    {workOrder.custom_values?.length ? (
                        workOrder.custom_values.map(
                            (customField: any) => (
                                <div
                                    key={customField.id}
                                    className="rounded-2xl bg-[#0B1120] p-4"
                                >

                                    <p className="text-xs text-zinc-500">
                                        {
                                            customField
                                                .field_definition
                                                .name
                                        }
                                    </p>

                                    <p className="mt-2 text-sm text-white">
                                        {customField.value ||
                                            "Não informado"}
                                    </p>

                                </div>
                            )
                        )
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-400 md:col-span-2">
                            Nenhum dado complementar cadastrado.
                        </div>
                    )}

                </div>

            </section>

        </section>
    );
}