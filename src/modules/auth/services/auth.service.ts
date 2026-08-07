import { api } from "../../../shared/services/api";
import type { LoginRequest, LoginResponseData } from "../types/auth.types";
import type { ApiResponse } from "../../../shared/types/api.types";

export class AuthService {
    static async login(data: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
        const response = await api.post("/auth/login", data)
        

        return response.data
    }
}