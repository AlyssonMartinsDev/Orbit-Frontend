import axios from "axios";
import { create } from "zustand";
import { getSession, isCurrentSession } from "../services/session";
import { ClientService } from "../../modules/clients/services/client.service";
import { requireResponseData } from "../types/api.types";
import type {
    ClientResponse,
    ClientDetailsResponse,
} from "../../modules/clients/types/client.types";

interface ClientState {
    clients: ClientResponse[];
    selectedClient: ClientDetailsResponse | null;
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    loadClients: (forceRefresh?: boolean) => Promise<void>;
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
    selectedClient: null,
    isLoading: false,
    isLoaded: false,
    error: null,
};

export const useClientStore = create<ClientState>((set, get) => ({
    ...emptyState,
    loadClients: async (forceRefresh = false) => {
        const sessionId = getSession().id;
        if (!forceRefresh && (get().isLoading || get().isLoaded)) return;
        const requestVersion = ++version;
        const current = () =>
            isCurrentSession(sessionId) && requestVersion === version;
        set({ isLoading: true, error: null });
        try {
            const clients = requireResponseData(await ClientService.getAll());
            if (current()) set({ clients, isLoaded: true });
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
    addClient: (client) => {
        version++;
        set((state) => ({
            clients: [
                client,
                ...state.clients.filter((item) => item.id !== client.id),
            ],
            isLoading: false,
        }));
    },
    updateClient: (client) => {
        version++;
        set((state) => ({
            clients: state.clients.map((item) =>
                item.id === client.id ? client : item,
            ),
            isLoading: false,
        }));
    },
    removeClient: (id) => {
        version++;
        set((state) => ({
            clients: state.clients.filter((item) => item.id !== id),
            selectedClient:
                state.selectedClient?.id === id ? null : state.selectedClient,
            isLoading: false,
        }));
    },
    setSelectedClient: (selectedClient) => set({ selectedClient }),
    clearSelectedClient: () => set({ selectedClient: null }),
}));
