import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { WorkOrderForm } from "../components/WorkOrderForm";
import { WorkOrderService } from "../services/work-order.service";

import type { WorkOrderResponse } from "../types/work-order.types";

export function EditWorkOrderPage() {
    const { id } = useParams();

    const [workOrder, setWorkOrder] =
        useState<WorkOrderResponse | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        const loadWorkOrder = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await WorkOrderService.getById(
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
            <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
                <p className="text-sm text-zinc-400">
                    Carregando ordem de serviço...
                </p>
            </section>
        );
    }

    if (!workOrder) {
        return (
            <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
                <p className="text-sm text-red-300">
                    Ordem de serviço não encontrada.
                </p>
            </section>
        );
    }

    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
            <header>
                <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
                    Ordens de Serviço
                </p>

                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                    Editar Ordem de Serviço
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                    Atualize os dados da ordem de serviço #{workOrder.id}.
                </p>
            </header>

            <div className="mt-8">
                <WorkOrderForm
                    mode="edit"
                    workOrder={workOrder}
                />
            </div>
        </section>
    );
}