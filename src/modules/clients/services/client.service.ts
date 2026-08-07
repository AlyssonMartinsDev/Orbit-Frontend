import {api} from  "../../../shared/services/api";
import type { CreateClientRequest } from "../types/client.types";


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


}