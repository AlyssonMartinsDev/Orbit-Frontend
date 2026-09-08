// icones
import {
    ClipboardList,
    Pencil,
    Search,
    Trash2,
    Users,
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
    // ====================================================
    // STORE
    // ====================================================

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

    const showMessage = useMessageStore(
        (state) => state.showMessage
    );

    const navigate = useNavigate();


    // ====================================================
    // BUSCA
    // ====================================================

    const [search, setSearch] = useState("");

    const filteredClients = clients.filter((client) => {
        const searchLower = search.toLowerCase();

        return (
            client.name
                .toLowerCase()
                .includes(searchLower) ||
            client.phone
                .toLowerCase()
                .includes(searchLower) ||
            client.email
                ?.toLowerCase()
                .includes(searchLower)
        );
    });


    // ====================================================
    // CARREGAMENTO
    // ====================================================

    useEffect(() => {
        void loadClients();
    }, [loadClients]);


    // ====================================================
    // EXCLUSÃO
    // ====================================================

    const handleDelete = async (
        clientId: number
    ) => {
        const confirmed = window.confirm(
            "Tem certeza que deseja excluir este cliente?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await ClientService.delete(clientId);

            if (!response.success) {
                showMessage(
                    response.message,
                    "error"
                );

                return;
            }

            removeClient(clientId);

            showMessage(
                "Cliente excluído com sucesso.",
                "success"
            );
        } catch (error) {
            console.error(
                "Error deleting client:",
                error
            );

            showMessage(
                "Erro ao excluir cliente.",
                "error"
            );
        }
    };


    return (
        <section
            className="
                overflow-hidden
                rounded-2xl
                border border-[#16345c]/35
                bg-[#051020]/70
                shadow-[0_18px_50px_rgba(0,0,0,0.18)]
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <div
                className="
                    border-b border-[#16345c]/25
                    px-5 py-5
                    sm:px-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >
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
                                shadow-[0_0_18px_rgba(37,131,255,0.08)]
                            "
                        >
                            <Users
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
                                    sm:text-xl
                                "
                            >
                                Clientes cadastrados
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-[#8290a8]
                                "
                            >
                                Lista de todos os clientes
                                cadastrados no sistema.
                            </p>
                        </div>
                    </div>


                    {/* BUSCA */}
                    <div
                        className="
                            relative
                            w-full
                            lg:max-w-md
                        "
                    >
                        <Search
                            size={17}
                            strokeWidth={1.8}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-[#56657d]
                            "
                        />

                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou e-mail..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            className="
                                w-full
                                rounded-xl
                                border border-[#16345c]/40
                                bg-[#010b1b]/55
                                py-3
                                pl-11 pr-4
                                text-sm
                                text-[#f8fafc]
                                outline-none
                                transition-all
                                duration-200

                                placeholder:text-[#56657d]

                                focus:border-[#2583ff]/55
                                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                            "
                        />
                    </div>
                </div>
            </div>


            {/* =====================================================
                DESKTOP
            ===================================================== */}
            <div className="hidden lg:block">
                {loading ? (
                    <div
                        className="
                            p-10
                            text-center
                            text-sm
                            text-[#8290a8]
                        "
                    >
                        Carregando clientes...
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div
                        className="
                            m-6
                            rounded-xl
                            border border-dashed border-[#16345c]/40
                            bg-[#010b1b]/25
                            p-10
                            text-center
                        "
                    >
                        <Users
                            size={26}
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
                            {search
                                ? "Nenhum cliente corresponde à busca."
                                : "Nenhum cliente cadastrado."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead
                                className="
                                    border-b border-[#16345c]/25
                                    bg-[#010b1b]/30
                                "
                            >
                                <tr>
                                    <th
                                        className="
                                            px-6 py-4
                                            text-left
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#8290a8]
                                        "
                                    >
                                        Nome
                                    </th>

                                    <th
                                        className="
                                            px-6 py-4
                                            text-left
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#8290a8]
                                        "
                                    >
                                        Telefone
                                    </th>

                                    <th
                                        className="
                                            px-6 py-4
                                            text-left
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#8290a8]
                                        "
                                    >
                                        E-mail
                                    </th>

                                    <th
                                        className="
                                            px-6 py-4
                                            text-right
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#8290a8]
                                        "
                                    >
                                        Ações
                                    </th>
                                </tr>
                            </thead>


                            <tbody>
                                {filteredClients.map(
                                    (client) => (
                                        <tr
                                            key={client.id}
                                            className="
                                                border-b border-[#16345c]/20
                                                transition-colors
                                                duration-200
                                                last:border-b-0
                                                hover:bg-[#07182d]/45
                                            "
                                        >
                                            <td
                                                className="
                                                    px-6 py-4
                                                    text-sm
                                                    font-medium
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {client.name}
                                            </td>

                                            <td
                                                className="
                                                    px-6 py-4
                                                    text-sm
                                                    text-[#a7b4c8]
                                                "
                                            >
                                                {client.phone}
                                            </td>

                                            <td
                                                className="
                                                    px-6 py-4
                                                    text-sm
                                                    text-[#8290a8]
                                                "
                                            >
                                                {client.email ||
                                                    "Não informado"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div
                                                    className="
                                                        flex
                                                        justify-end
                                                        gap-1
                                                    "
                                                >
                                                    {/* DETALHES */}
                                                    <button
                                                        type="button"
                                                        title="Detalhes"
                                                        onClick={() =>
                                                            navigate(
                                                                `/clients/${client.id}/details`
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            h-9 w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border border-transparent
                                                            text-[#56657d]
                                                            transition-all
                                                            duration-200

                                                            hover:border-[#2583ff]/20
                                                            hover:bg-[#2583ff]/10
                                                            hover:text-[#3692ff]
                                                        "
                                                    >
                                                        <ClipboardList
                                                            size={17}
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                        />
                                                    </button>


                                                    {/* EDITAR */}
                                                    <button
                                                        type="button"
                                                        title="Editar"
                                                        onClick={() =>
                                                            navigate(
                                                                `/clients/${client.id}/edit`
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            h-9 w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border border-transparent
                                                            text-[#56657d]
                                                            transition-all
                                                            duration-200

                                                            hover:border-[#2583ff]/20
                                                            hover:bg-[#07182d]
                                                            hover:text-[#f8fafc]
                                                        "
                                                    >
                                                        <Pencil
                                                            size={17}
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                        />
                                                    </button>


                                                    {/* EXCLUIR */}
                                                    <button
                                                        type="button"
                                                        title="Excluir"
                                                        onClick={() =>
                                                            handleDelete(
                                                                client.id
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            h-9 w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border border-transparent
                                                            text-[#56657d]
                                                            transition-all
                                                            duration-200

                                                            hover:border-red-500/20
                                                            hover:bg-red-500/10
                                                            hover:text-red-400
                                                        "
                                                    >
                                                        <Trash2
                                                            size={17}
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* =====================================================
                MOBILE
            ===================================================== */}
            <div className="space-y-3 p-4 lg:hidden">
                {loading && (
                    <div
                        className="
                            rounded-xl
                            border border-dashed border-[#16345c]/40
                            bg-[#010b1b]/25
                            p-6
                            text-center
                            text-sm
                            text-[#8290a8]
                        "
                    >
                        Carregando clientes...
                    </div>
                )}


                {!loading &&
                    filteredClients.length === 0 && (
                        <div
                            className="
                                rounded-xl
                                border border-dashed border-[#16345c]/40
                                bg-[#010b1b]/25
                                p-6
                                text-center
                            "
                        >
                            <Users
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
                                {search
                                    ? "Nenhum cliente corresponde à busca."
                                    : "Nenhum cliente encontrado."}
                            </p>
                        </div>
                    )}


                {!loading &&
                    filteredClients.map((client) => (
                        <article
                            key={client.id}
                            className="
                                rounded-xl
                                border border-[#16345c]/30
                                bg-[#010b1b]/35
                                p-5
                                transition-all
                                duration-200

                                hover:border-[#2583ff]/20
                                hover:bg-[#07182d]/45
                            "
                        >
                            <div>
                                <p
                                    className="
                                        text-base
                                        font-semibold
                                        text-[#f8fafc]
                                    "
                                >
                                    {client.name}
                                </p>

                                <div
                                    className="
                                        mt-4
                                        space-y-2
                                        text-sm
                                        text-[#8290a8]
                                    "
                                >
                                    <p>
                                        <span className="text-[#56657d]">
                                            Telefone:
                                        </span>{" "}
                                        {client.phone}
                                    </p>

                                    <p>
                                        <span className="text-[#56657d]">
                                            E-mail:
                                        </span>{" "}
                                        {client.email ||
                                            "Não informado"}
                                    </p>

                                    <p>
                                        <span className="text-[#56657d]">
                                            CPF:
                                        </span>{" "}
                                        {client.cpf ||
                                            "Não informado"}
                                    </p>
                                </div>
                            </div>


                            {/* AÇÕES */}
                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-3
                                    gap-2
                                    border-t border-[#16345c]/20
                                    pt-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/clients/${client.id}/details`
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        border border-[#16345c]/30
                                        bg-[#07182d]/35
                                        px-3 py-2.5
                                        text-xs
                                        font-medium
                                        text-[#8290a8]
                                        transition-all

                                        hover:border-[#2583ff]/25
                                        hover:bg-[#2583ff]/10
                                        hover:text-[#3692ff]
                                    "
                                >
                                    <ClipboardList
                                        size={15}
                                        strokeWidth={1.8}
                                    />

                                    Detalhes
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/clients/${client.id}/edit`
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        border border-[#16345c]/30
                                        bg-[#07182d]/35
                                        px-3 py-2.5
                                        text-xs
                                        font-medium
                                        text-[#8290a8]
                                        transition-all

                                        hover:border-[#2583ff]/20
                                        hover:bg-[#0a2242]/55
                                        hover:text-[#f8fafc]
                                    "
                                >
                                    <Pencil
                                        size={15}
                                        strokeWidth={1.8}
                                    />

                                    Editar
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(client.id)
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        border border-[#16345c]/30
                                        bg-[#07182d]/35
                                        px-3 py-2.5
                                        text-xs
                                        font-medium
                                        text-[#8290a8]
                                        transition-all

                                        hover:border-red-500/20
                                        hover:bg-red-500/10
                                        hover:text-red-400
                                    "
                                >
                                    <Trash2
                                        size={15}
                                        strokeWidth={1.8}
                                    />

                                    Excluir
                                </button>
                            </div>
                        </article>
                    ))}
            </div>
        </section>
    );
}