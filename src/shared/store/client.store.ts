import { create } from "zustand";

import { ClientService } from "../../modules/clients/services/client.service";
import type { ClientResponse, ClientDetailsResponse } from "../../modules/clients/types/client.types";

interface ClientState {
    clients: ClientResponse[];

    selectedClient: ClientDetailsResponse | null;

    isLoading: boolean;
    isLoaded: boolean;

    loadClients: (forceRefresh?: boolean) => Promise<void>;

    addClient: (client: ClientResponse) => void;

    updateClient: (client: ClientResponse) => void;

    removeClient: (clientId: number) => void;

    setSelectedClient: (client: ClientDetailsResponse) => void;

    clearSelectedClient: () => void;

    clearClients: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    isLoading: false,
    isLoaded: false,
    selectedClient: null,

    loadClients: async (forceRefresh = false) => {
        const { isLoading, isLoaded } = get();

        if (isLoading) return;
        if (isLoaded && !forceRefresh) return;

        set({ isLoading: true });

        try {
            const response = await ClientService.getAll();

            if (!response.success) return;

            set({
                clients: response.data ?? [],
                isLoaded: true,
            });
        } finally {
            set({
                isLoading: false,
            });
        }
    },

    clearClients: () => {
        set({
            clients: [],
            isLoading: false,
            isLoaded: false,
        });
    },

    removeClient: (clientId: number) => {
        set((state) => ({
            clients: state.clients.filter(
                (client) => client.id !== clientId
            ),
        }));
    },

    addClient: (client) =>
        set((state) => ({
            clients: [client, ...state.clients],
        })),

    updateClient: (updatedClient) =>
        set((state) => ({
            clients: state.clients.map((client) =>
                client.id === updatedClient.id
                    ? updatedClient
                    : client
            ),
        })),

    setSelectedClient: (client) => {
        set({
            selectedClient: client,
        });
    },

    clearSelectedClient: () => {
        set({
            selectedClient: null,
        });
    },
    
}));