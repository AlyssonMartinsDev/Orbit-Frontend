import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    AlertTriangle,
    ClipboardList,
    LoaderCircle,
} from "lucide-react";

import { WorkOrderForm } from "../components/WorkOrderForm";
import { WorkOrderService } from "../services/work-order.service";


export function EditWorkOrderPage() {
    const { id } = useParams();

    const [workOrder, setWorkOrder] =
        useState<any | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);


    // ====================================================
    // CARREGAMENTO DA ORDEM
    // ====================================================

    useEffect(() => {
        const loadWorkOrder = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            try {
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
                            border border-[#2583ff]/20
                            bg-[#2583ff]/10
                            text-[#3692ff]
                            shadow-[0_0_25px_rgba(37,131,255,0.10)]
                        "
                    >
                        <LoaderCircle
                            size={22}
                            strokeWidth={1.8}
                            className="animate-spin"
                        />
                    </div>

                    <p
                        className="
                            mt-4
                            text-sm
                            font-medium
                            text-[#a7b4c8]
                        "
                    >
                        Carregando ordem de serviço...
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-[#56657d]
                        "
                    >
                        Aguarde enquanto buscamos as informações.
                    </p>
                </div>
            </section>
        );
    }


    // ====================================================
    // ORDEM NÃO ENCONTRADA
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
                <div
                    className="
                        w-full
                        max-w-md
                        text-center
                    "
                >
                    <div
                        className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            border border-red-500/15
                            bg-red-500/[0.07]
                            text-red-400
                        "
                    >
                        <AlertTriangle
                            size={22}
                            strokeWidth={1.8}
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
                            leading-6
                            text-[#8290a8]
                        "
                    >
                        Não foi possível localizar a ordem de serviço solicitada.
                        Ela pode ter sido removida ou não estar mais disponível.
                    </p>
                </div>
            </section>
        );
    }


    // ====================================================
    // PÁGINA
    // ====================================================

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
                HEADER
            ===================================================== */}
            <header>
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
                            Ordens de serviço
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
                            Editar ordem de serviço
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
                    Atualize os dados da ordem de serviço{" "}
                    <span
                        className="
                            font-medium
                            text-[#a7b4c8]
                        "
                    >
                        #{workOrder.id}
                    </span>
                    .
                </p>
            </header>


            {/* =====================================================
                FORMULÁRIO
            ===================================================== */}
            <div className="mt-8">
                <WorkOrderForm
                    mode="edit"
                    workOrder={workOrder}
                />
            </div>
        </section>
    );
}