import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Pencil,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import { useClientStore } from "../../../shared/store/client.store";
import { useDashboardStore } from "../../../shared/store/dashboard.store";
import { useMessageStore } from "../../../shared/store/message.store";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { Modal } from "../../../shared/components/modal";
import {
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { formatPhone } from "../../../shared/utils/phone";
import { ClientService } from "../services/client.service";
import type { ClientResponse } from "../types/client.types";

const PAGE_SIZE = 20;
const actionClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#16345c] p-3 hover:bg-[#0a2242] disabled:opacity-50";

export function ClientTable() {
    const { clients, isLoading, error, loadClients, removeClient } =
        useClientStore();
    const showMessage = useMessageStore((state) => state.showMessage);
    const [sessionId] = useState(() => getSession().id);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState<ClientResponse | null>(null);
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    useEffect(() => {
        void loadClients();
    }, [loadClients]);
    const filtered = useMemo(() => {
        const query = deferredSearch.trim().toLocaleLowerCase("pt-BR");
        const digits = query.replace(/\D/g, "");
        return clients.filter(
            (client) =>
                client.name.toLocaleLowerCase("pt-BR").includes(query) ||
                client.email?.toLocaleLowerCase("pt-BR").includes(query) ||
                (digits.length > 0 &&
                    client.phone.replace(/\D/g, "").includes(digits)),
        );
    }, [clients, deferredSearch]);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pages);
    const visibleClients = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const handleDelete = async () => {
        if (!deleting || pending.current || !isCurrentSession(sessionId))
            return;
        pending.current = true;
        setBusy(true);
        try {
            const response = await ClientService.delete(deleting.id);
            if (!isCurrentSession(sessionId)) return;
            if (!response.success) {
                showMessage(
                    response.message || "Não foi possível excluir o cliente.",
                    "error",
                );
                return;
            }
            removeClient(deleting.id);
            useDashboardStore.getState().clearSummary();
            setDeleting(null);
            showMessage("Cliente excluído com sucesso.", "success");
        } catch (error) {
            if (isCurrentSession(sessionId) && !axios.isCancel(error))
                showMessage(
                    "Não foi possível excluir o cliente. Tente novamente.",
                    "error",
                );
        } finally {
            pending.current = false;
            setBusy(false);
        }
    };
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#16345c]/60 bg-[#051020]/70">
            <header className="flex flex-col gap-4 border-b border-[#16345c]/40 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <Users className="shrink-0 text-blue-400" />
                    <div>
                        <h2 className="font-semibold">Clientes cadastrados</h2>
                        <p className="mt-1 text-sm text-[#a7b4c8]">
                            {filtered.length}{" "}
                            {filtered.length === 1
                                ? "cliente encontrado"
                                : "clientes encontrados"}
                        </p>
                    </div>
                </div>
                <label className="relative block w-full lg:max-w-sm">
                    <span className="sr-only">Buscar clientes</span>
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3 top-4 text-[#8290a8]"
                    />
                    <input
                        type="search"
                        placeholder="Nome, telefone ou e-mail"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        className={`${inputClass} pl-10`}
                    />
                </label>
            </header>
            {error ? (
                <div className="p-4">
                    <RequestError
                        message={error}
                        onRetry={() => void loadClients(true)}
                    />
                </div>
            ) : isLoading ? (
                <p role="status" className="p-6 text-sm text-[#a7b4c8]">
                    Carregando clientes…
                </p>
            ) : filtered.length === 0 ? (
                <p role="status" className="p-6 text-sm text-[#a7b4c8]">
                    {search
                        ? "Nenhum cliente encontrado para esta busca."
                        : "Nenhum cliente cadastrado."}
                </p>
            ) : (
                <>
                    <ul className="divide-y divide-[#16345c]/40 md:hidden">
                        {visibleClients.map((client) => (
                            <li key={client.id} className="min-w-0 p-4">
                                <p className="break-words font-medium">
                                    {client.name}
                                </p>
                                <p className="mt-2 text-sm text-[#a7b4c8]">
                                    {formatPhone(client.phone)}
                                </p>
                                <p className="mt-1 break-all text-sm text-[#a7b4c8]">
                                    {client.email || "E-mail não informado"}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <ClientActions
                                        client={client}
                                        onDelete={() => setDeleting(client)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#07182d] text-[#a7b4c8]">
                                <tr>
                                    <th scope="col" className="p-4">
                                        Nome
                                    </th>
                                    <th scope="col" className="p-4">
                                        Contato
                                    </th>
                                    <th scope="col" className="p-4 text-right">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#16345c]/40">
                                {visibleClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="max-w-xs break-words p-4 font-medium">
                                            {client.name}
                                        </td>
                                        <td className="max-w-xs break-all p-4 text-[#a7b4c8]">
                                            {formatPhone(client.phone)}
                                            <br />
                                            {client.email ||
                                                "E-mail não informado"}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <ClientActions
                                                    client={client}
                                                    onDelete={() =>
                                                        setDeleting(client)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav
                        aria-label="Paginação de clientes"
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-[#16345c]/40 p-4"
                    >
                        <span className="text-sm text-[#a7b4c8]">
                            Página {currentPage} de {pages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                aria-label="Página anterior"
                                disabled={currentPage <= 1}
                                className={actionClass}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                aria-label="Próxima página"
                                disabled={currentPage >= pages}
                                className={actionClass}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </nav>
                </>
            )}
            <Modal
                open={!!deleting}
                title="Excluir cliente"
                subtitle={deleting?.name}
                onClose={() => {
                    if (!pending.current) setDeleting(null);
                }}
            >
                <p className="text-sm leading-6 text-[#a7b4c8]">
                    Deseja excluir este cliente? Esta ação não pode ser
                    desfeita.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeleting(null)}
                        className={secondaryButtonClass}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete()}
                        className={`${primaryButtonClass} bg-red-700 hover:bg-red-600`}
                    >
                        {busy ? "Excluindo…" : "Confirmar exclusão"}
                    </button>
                </div>
            </Modal>
        </section>
    );
}

function ClientActions({
    client,
    onDelete,
}: {
    client: ClientResponse;
    onDelete: () => void;
}) {
    return (
        <>
            <Link
                to={`/clients/${client.id}/details`}
                className={actionClass}
                aria-label={`Detalhes de ${client.name}`}
            >
                <ClipboardList size={18} />
            </Link>
            <Link
                to={`/clients/${client.id}/edit`}
                className={actionClass}
                aria-label={`Editar ${client.name}`}
            >
                <Pencil size={18} />
            </Link>
            <button
                type="button"
                onClick={onDelete}
                className={`${actionClass} text-red-300`}
                aria-label={`Excluir ${client.name}`}
            >
                <Trash2 size={18} />
            </button>
        </>
    );
}
