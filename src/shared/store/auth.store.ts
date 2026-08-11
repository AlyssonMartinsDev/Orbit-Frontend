import { create } from "zustand";

import { AuthService } from "../../modules/auth/services/auth.service";
import type { LoginRequest, LoginResponseData } from "../../modules/auth/types/auth.types";
import type { ApiResponse } from "../types/api.types";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;

    login: (data: LoginRequest) => Promise<ApiResponse<LoginResponseData>>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("orbit_token"),
    isAuthenticated: !!localStorage.getItem("orbit_token"),

    login: async (data) => {
        const response = await AuthService.login(data);



        if (response.success && response.data) {

            localStorage.setItem(
                "orbit_token",
                response.data.access_token
            );

            set({
                token: response.data.access_token,
                isAuthenticated: true,
            });
        }

        return response;
    },

    logout: () => {
        localStorage.removeItem("orbit_token");

        set({
            token: null,
            isAuthenticated: false,
        });
    },
}));