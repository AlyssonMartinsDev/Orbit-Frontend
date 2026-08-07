import { ClientService } from "../services/client.service";
import { useMessageStore } from "../../../shared/store/message.store"
import { useEffect, useState } from "react";

import type { ClientResponse } from "../types/client.types";







export function ClientTable() {

    const [clients, setClients] = useState<ClientResponse[]>([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const filteredClients = clients.filter((client) => {
        const searchLower = search.toLowerCase();

        return (
            client.name.toLowerCase().includes(searchLower) ||
            client.phone.toLowerCase().includes(searchLower) ||
            client.email?.toLowerCase().includes(searchLower)
        );
    });

    const loadClients = async () => {
        try {
            setLoading(true);

            const response = await ClientService.getAll();

            if (!response.success) {
                return;
            }

            setClients(response.data);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

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

                                <td className="px-6 py-4 text-right">
                                    Ações
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
                                <button className="flex-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                                    Editar
                                </button>

                                <button className="flex-1 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}