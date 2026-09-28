import { api } from "../../../shared/services/api"


// Tipos
import type { ApiResponse } from "../../../shared/types/api.types"
import type {
    CreateWorkOrderRequest,
    WorkOrderResponse,
    UpdateWorkOrderRequest,
    WorkOrderDetailsResponse,
    WorkOrderPaginatedResponse,
    WorkOrderStatus,
    PaymentStatus
} from "../types/work-order.types"


interface WorkOrderTrackingParams {
    // Paginação
    page?: number;
    page_size?: number;

    // Aba selecionada
    tab?: "all" | "pending";

    // Busca por título/cliente
    search?: string;

    // Filtro por período
    start_date?: string;
    end_date?: string;

    // Filtro por status
    status_service?: WorkOrderStatus;
    status_payment?: PaymentStatus;
}
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
    ): Promise<ApiResponse<WorkOrderDetailsResponse>> {
        const response = await api.get<ApiResponse<WorkOrderDetailsResponse>>(
            `/work_orders/${id}`
        );

        return response.data;
    }

    static async update(
        id: number,
        workOrderData: UpdateWorkOrderRequest
    ): Promise<ApiResponse<WorkOrderResponse>> {
        const response = await api.put<ApiResponse<WorkOrderResponse>>(
            `/work_orders/${id}`,
            workOrderData
        );

        return response.data;
    }

    static async delete(
        id: number
    ): Promise<ApiResponse<WorkOrderResponse>> {
        const response = await api.delete<ApiResponse<WorkOrderResponse>>(
            `/work_orders/${id}`
        );

        return response.data;
    }

    static async getTracking(
        params: WorkOrderTrackingParams = {}
    ): Promise<ApiResponse<WorkOrderPaginatedResponse>> {

        const response = await api.get<
            ApiResponse<WorkOrderPaginatedResponse>
        >(
            "/work_orders/tracking",
            {
                params
            }
        );

        return response.data;
    }
}
