import { api } from "../../../shared/services/api";
import type { LoginRequest, LoginResponseData } from "../types/auth.types";
import type { ApiResponse } from "../../../shared/types/api.types";

export class AuthService {
    static async forgotPassword(email: string): Promise<ApiResponse<null>> {
        return (await api.post("/auth/forgot-password", { email })).data;
    }

    static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
        return (await api.post("/auth/reset-password", { token, new_password: newPassword })).data;
    }

    static async login(data: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
        const response = await api.post("/auth/login", data)
        

        return response.data
    }
}