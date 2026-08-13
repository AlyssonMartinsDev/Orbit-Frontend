// icones 
import {
    Pencil,
    Trash2,
    ClipboardList,
} from "lucide-react";

// navigation
import { useNavigate } from "react-router-dom";

// Services
import { ClientService } from "../services/client.service";

// Hooks
import { useEffect, useState } from "react";
import { useClientStore } from "../../../shared/store/client.store";
import { useMessageStore } from "../../../shared/store/message.store";



export function ClientTable() {
    // State
    const clients = useClientStore(
        (state) => state.clients
    );

    const loading = useClientStore(
        (state) => state.isLoading
    );

    const loadClients = useClientStore(
        (state) => state.loadClients
    );

    const removeClient = useClientStore(
        (state) => state.removeClient
    );

    const navigate = useNavigate();


    const showMessage = useMessageStore((state) => state.showMessage);



    const [search, setSearch] = useState("");

    const filteredClients = clients.filter((client) => {
        const searchLower = search.toLowerCase();

        return (
            client.name.toLowerCase().includes(searchLower) ||
            client.phone.toLowerCase().includes(searchLower) ||
            client.email?.toLowerCase().includes(searchLower)
        );
    });



    useEffect(() => {
        loadClients();
    }, []);


    const handleDelete = async (clientId: number) => {
        const confirmed = window.confirm(
            "Tem certeza que deseja excluir este cliente?"
        );

        if (!confirmed) {
            return;
        }


        try {
            const response = await ClientService.delete(clientId);

            if (!response.success) {
                showMessage(response.message, "error");
                return;
            }

            removeClient(clientId);

            showMessage("Cliente excluído com sucesso.", "success");
        } catch (error) {
            console.error("Error deleting client:", error);
            showMessage("Erro ao excluir cliente.", "error");
        }
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <input
                type="text"
                placeholder="Buscar por nome, telefone ou email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
            />
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                    Clientes cadastrados
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Lista de todos os clientes cadastrados no sistema.
                </p>
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
                <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/[0.03]">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                                Nome
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                                Telefone
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                                Email
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredClients.map((client) => (
                            <tr
                                key={client.id}
                                className="border-b border-white/10"
                            >
                                <td className="px-6 py-4">
                                    {client.name}
                                </td>

                                <td className="px-6 py-4">
                                    {client.phone}
                                </td>

                                <td className="px-6 py-4">
                                    {client.email}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">

                                        <button
                                            title="Detalhes"
                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-violet-400"
                                            onClick={() => navigate(`/clients/${client.id}/details`)}
                                        >
                                            <ClipboardList size={18} />
                                        </button>

                                        <button
                                            title="Editar"
                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-yellow-400"
                                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            title="Excluir"
                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="space-y-4 p-4 lg:hidden">
                {loading && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                        Carregando clientes...
                    </div>
                )}

                {!loading && clients.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                        Nenhum cliente encontrado.
                    </div>
                )}

                {!loading &&
                    filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="rounded-2xl border border-white/10 bg-[#0B1120] p-5"
                        >
                            <p className="text-lg font-semibold text-white">{client.name}</p>

                            <div className="mt-4 space-y-2 text-sm text-zinc-400">
                                <p>Telefone: {client.phone}</p>
                                <p>Email: {client.email || "Não informado"}</p>
                                <p>CPF: {client.cpf || "Não informado"}</p>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    title="Detalhes"
                                    className="rounded-lg flex flex-row gap-2 items-center p-2 text-zinc-400 transition hover:bg-white/10 hover:text-violet-400"
                                    onClick={() => navigate(`/clients/${client.id}/details`)}
                                >
                                    <ClipboardList size={18} />
                                    DETALHES
                                </button>

                                <button
                                    title="Editar"
                                    className="rounded-lg flex flex-row gap-2 items-center p-2 text-zinc-400 transition hover:bg-white/10 hover:text-yellow-400"
                                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                                >
                                    <Pencil size={18} />
                                    EDITAR
                                </button>

                                <button
                                    title="Excluir"
                                    className="rounded-lg flex flex-row gap-2 items-center p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                                    onClick={() => handleDelete(client.id)}
                                >
                                    <Trash2 size={18} />
                                    EXCLUIR
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}