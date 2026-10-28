import { api } from "../../../shared/services/api";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { ClientPage, ClientQuery, CreateClientRequest, UpdateClientRequest, ClientResponse, ClientDetailsResponse } from "../types/client.types";

export class ClientService {
    static async list(params: ClientQuery = {}, signal?: AbortSignal): Promise<ApiResponse<ClientPage>> {
        return (await api.get<ApiResponse<ClientPage>>("/clients/paginated", { params, signal })).data;
    }
    static async getById(id: number, signal?: AbortSignal): Promise<ApiResponse<ClientResponse>> {
        return (await api.get<ApiResponse<ClientResponse>>(`/clients/${id}`, { signal })).data;
    }
    static async create(client: CreateClientRequest): Promise<ApiResponse<ClientResponse>> {
        return (await api.post<ApiResponse<ClientResponse>>("/clients/", client)).data;
    }
    static async update(id: number, client: UpdateClientRequest): Promise<ApiResponse<ClientResponse>> {
        return (await api.put<ApiResponse<ClientResponse>>(`/clients/${id}`, client)).data;
    }
    static async delete(id: number): Promise<ApiResponse<null>> {
        return (await api.delete<ApiResponse<null>>(`/clients/${id}`)).data;
    }
    static async getDetails(id: number, signal?: AbortSignal): Promise<ApiResponse<ClientDetailsResponse>> {
        return (await api.get<ApiResponse<ClientDetailsResponse>>(`/clients/${id}/details`, { signal })).data;
    }
}
