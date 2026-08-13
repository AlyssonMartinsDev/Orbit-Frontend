import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClientForm } from "../components/ClientForm";
import { useParams } from "react-router-dom";

// Icones
import { ArrowLeft } from "lucide-react";

// service
import { ClientService } from "../services/client.service";
import { useClientStore } from "../../../shared/store/client.store";
import { Loading } from "../../../shared/components/loading";


export function EditClientPage() {
    const { id } = useParams();

    const navigate = useNavigate();

    const selectedClient: any = useClientStore(
        (state) => state.selectedClient
    );

    const setSelectedClient = useClientStore(
        (state) => state.setSelectedClient
    );

    const clearSelectedClient = useClientStore(
        (state) => state.clearSelectedClient
    );
    // Load client details when the component mounts
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

    // componente de carregamento de detalhes do cliente

    if (!selectedClient) {
        return <Loading message="Carregando informações do cliente..." />;
    }



    return (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white mb-2"
            >
                <ArrowLeft size={18} />
                Voltar
            </button>
            <header>

                <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
                    Clientes
                </p>

                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                    Editar cliente
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                    Atualize as informações do cliente no sistema Orbit.
                </p>
            </header>

            <div className="mt-8">
                <ClientForm mode="edit" client={selectedClient} />
            </div>
        </section>
    );
}