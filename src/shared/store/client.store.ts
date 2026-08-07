import { create } from "zustand";

import { ClientService } from "../../modules/clients/services/client.service";
import type { ClientResponse } from "../../modules/clients/types/client.types";

interface ClientState {
    // Estado
    clients: ClientResponse[];
    isLoading: boolean;
    isLoaded: boolean;

    // Ações
    loadClients: (forceRefresh?: boolean) => Promise<void>;
    clearClients: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
    // Estado inicial
    clients: [],
    isLoading: false,
    isLoaded: false,

    // Busca os clientes
    loadClients: async (forceRefresh = false) => {
        const { isLoading, isLoaded } = get();

        if (isLoading) {
            return;
        }

        if (isLoaded && !forceRefresh) {
            return;
        }

        set({
            isLoading: true,
        });

        try {
            const response = await ClientService.getAll();

            if (!response.success) {
                return;
            }

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

    // Limpa os clientes armazenados
    clearClients: () => {
        set({
            clients: [],
            isLoading: false,
            isLoaded: false,
        });
    },
}));