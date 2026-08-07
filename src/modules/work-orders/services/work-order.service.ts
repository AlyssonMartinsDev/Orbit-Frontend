import { api } from "../../../shared/services/api"


// Tipos
import type { ApiResponse } from "../../../shared/types/api.types"
import type {
    CreateWorkOrderRequest,
    WorkOrderResponse,
} from "../types/work-order.types"


export class WorkOrderService {
    static async create(
        workOrderData: CreateWorkOrderRequest
    ): Promise<ApiResponse<WorkOrderResponse>> {

        const response = await api.post<ApiResponse<WorkOrderResponse>>(
            "/work_orders",
            workOrderData
        );

        return response.data;



    }

    static async getById(
        id: number
    ): Promise<ApiResponse<WorkOrderResponse>> {
        const response = await api.get<ApiResponse<WorkOrderResponse>>(
            `/work_orders/${id}`
        );

        return response.data;
    }

    static async update(
        id: number,
        workOrderData: CreateWorkOrderRequest
    ): Promise<ApiResponse<WorkOrderResponse>> {
        const response = await api.put<ApiResponse<WorkOrderResponse>>(
            `/work_orders/${id}`,
            workOrderData
        );

        return response.data;
    }
}