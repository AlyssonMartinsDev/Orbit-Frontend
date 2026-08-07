export interface WorkOrderClientRequest {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
}

export interface WorkOrderClientResponse {
    id: number;
    name: string;
    phone: string;
    email: string;
}
export interface WorkOrderDataRequest {
    title: string;
    description?: string;
    status_service: string;
    status_payment: string;
    price: number
}

export interface CreateWorkOrderRequest {
    client: WorkOrderClientRequest;
    work_order: WorkOrderDataRequest;
}

export interface WorkOrderResponse {
    id: number;
    client: WorkOrderClientResponse;
    user_id: number;
    title: string;
    description: string;
    status_service: string;
    status_payment: string;
    price: number;
    finished_at: string | null;
    created_at: string;
    updated_at: string;
}