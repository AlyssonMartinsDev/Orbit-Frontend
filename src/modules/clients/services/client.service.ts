import { api } from "../../../shared/services/api";
import type { ApiResponse } from "../../../shared/types/api.types";
import type { CreateClientRequest, ClientDetailsResponse } from "../types/client.types";


export class ClientService {

    static async getAll() {
        const response = await api.get("/clients");
        return response.data;
    }
    static async create(client: CreateClientRequest) {


        const response = await api.post("/clients", client);
        console.log("Response from API:", response.data); // Log the response data for debugging

        return response.data;

    }

    // Função para atualizar um cliente existente
    static async update(clientId: number, client: CreateClientRequest) {
        const response = await api.put(`/clients/${clientId}`, client);
        return response.data;
    }

    // Função para deletar um cliente pelo ID
    static async delete(clientId: number) {
        try {
            const res = await api.delete(`/clients/${clientId}`);
            return res.data;
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    // Função para obter os detalhes de um cliente pelo ID
    static async getDetails(
        clientId: number
    ): Promise<ApiResponse<ClientDetailsResponse>> {

        const response = await api.get(
            `/clients/${clientId}/details`
        );

        return response.data;
    }

}