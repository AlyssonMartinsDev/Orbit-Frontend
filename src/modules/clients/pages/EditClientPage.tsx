import { useClient } from "../hooks/useClient";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useNavigate, useParams } from "react-router-dom";

// Componentes
import { ClientForm } from "../components/ClientForm";
import { Loading } from "../../../shared/components/loading";

// Ícones
import {
    ArrowLeft,
    UserRoundPen,
} from "lucide-react";

// Service

// Store


export function EditClientPage() {
    const { id } = useParams();

    const navigate = useNavigate();


    // ====================================================
    // CLIENTE SELECIONADO
    // ====================================================

    const { data: selectedClient, error, isLoading, refresh } = useClient(id);



    // ====================================================
    // CARREGAMENTO DO CLIENTE
    // ====================================================




    // ====================================================
    // LOADING
    // ====================================================

    if (error) return <RequestError message={error} onRetry={refresh} />;

    if (isLoading || !selectedClient) {
        return (
            <Loading message="Carregando informações do cliente..." />
        );
    }


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
            <header>
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
                        <UserRoundPen
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
                            Clientes
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
                            Editar cliente
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
                    Atualize as informações do cliente no sistema Orbit.
                </p>
            </header>


            {/* =====================================================
                FORMULÁRIO
            ===================================================== */}
            <div className="mt-8">
                <ClientForm
                    key={selectedClient.id}
                mode="edit"
                    client={selectedClient}
                />
            </div>
        </section>
    );
}