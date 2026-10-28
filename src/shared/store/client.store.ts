import axios from "axios";
import { create } from "zustand";
import { getSession, isCurrentSession } from "../services/session";
import { ClientService } from "../../modules/clients/services/client.service";
import { requireResponseData } from "../types/api.types";
import type {
    ClientResponse, ClientSummary, ClientQuery,
    ClientDetailsResponse,
} from "../../modules/clients/types/client.types";

interface ClientState {
    clients: ClientSummary[];
    total: number;
    page: number;
    totalPages: number;
    queryKey: string;
    selectedClient: ClientDetailsResponse | null;
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    loadClients: (query?: ClientQuery, forceRefresh?: boolean) => Promise<void>;
    addClient: (client: ClientResponse) => void;
    updateClient: (client: ClientResponse) => void;
    removeClient: (id: number) => void;
    setSelectedClient: (client: ClientDetailsResponse) => void;
    clearSelectedClient: () => void;
    clearClients: () => void;
}
let version = 0;
const emptyState = {
    clients: [],
    total: 0, page: 1, totalPages: 1, queryKey: "",
    selectedClient: null,
    isLoading: false,
    isLoaded: false,
    error: null,
};

export const useClientStore = create<ClientState>((set, get) => ({
    ...emptyState,
    loadClients: async (query = {}, forceRefresh = false) => {
        const sessionId = getSession().id;
        const queryKey = JSON.stringify(query);
        if (!forceRefresh && queryKey === get().queryKey && (get().isLoading || get().isLoaded)) return;
        const requestVersion = ++version;
        const current = () =>
            isCurrentSession(sessionId) && requestVersion === version;
        set({ isLoading: true, error: null, queryKey });
        try {
            const result = requireResponseData(await ClientService.list(query));
            if (current()) set({ clients: result.items, total: result.total, page: result.page, totalPages: result.total_pages, isLoaded: true });
        } catch (error) {
            if (current() && !axios.isCancel(error))
                set({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os clientes.",
                });
        } finally {
            if (current()) set({ isLoading: false });
        }
    },
    clearClients: () => {
        version++;
        set(emptyState);
    },
    addClient: () => {
        version++;
        set({ isLoaded: false, isLoading: false });
    },
    updateClient: () => {
        version++;
        set({ isLoaded: false, isLoading: false });
    },
    removeClient: (id) => {
        version++;
        set((state) => ({
            clients: state.clients.filter((item) => item.id !== id),
            selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
            isLoaded: false, isLoading: false,
        }));
    },
    setSelectedClient: (selectedClient) => set({ selectedClient }),
    clearSelectedClient: () => set({ selectedClient: null }),
}));
