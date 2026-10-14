import { CanceledError } from "axios";
import { create } from "zustand";

import { AuthService } from "../../modules/auth/services/auth.service";
import type { LoginRequest, LoginResponseData } from "../../modules/auth/types/auth.types";
import type { ApiResponse } from "../types/api.types";
import { changeSession, getSession, isCurrentSession, subscribeToSession } from "../services/session";
import { useClientStore } from "./client.store";
import { useCustomFieldStore } from "./custom-field.store";
import { useDashboardStore } from "./dashboard.store";
import { useMessageStore } from "./message.store";

interface AuthState {
    token: string | null;
    sessionId: number;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (data: LoginRequest) => Promise<ApiResponse<LoginResponseData>>;
    logout: () => void;
}

const initialSession = getSession();

export const useAuthStore = create<AuthState>((set) => ({
    token: initialSession.token,
    sessionId: initialSession.id,
    isAuthenticated: !!initialSession.token,
    isLoading: false,

    login: async (data) => {
        const attempt = changeSession(null);
        set({ isLoading: true });

        try {
            const response = await AuthService.login(data);

            if (!isCurrentSession(attempt.id)) {
                throw new CanceledError("A sessão mudou durante o login.");
            }

            if (response.success && !response.data?.access_token) {
                throw new Error("O servidor não retornou uma sessão válida.");
            }
            if (response.success && response.data?.access_token) {
                changeSession(response.data.access_token);
            }

            return response;
        } finally {
            if (isCurrentSession(attempt.id)) {
                set({ isLoading: false });
            }
        }
    },

    logout: () => {
        changeSession(null);
    },
}));

// Logout, expiração e troca de conta seguem o mesmo caminho de limpeza.
subscribeToSession((session) => {
    useClientStore.getState().clearClients();
    useCustomFieldStore.getState().clearCustomFields();
    useDashboardStore.getState().clearSummary();
    useMessageStore.getState().hideMessage();

    useAuthStore.setState({
        token: session.token,
        sessionId: session.id,
        isAuthenticated: !!session.token,
        isLoading: false,
    });
});
