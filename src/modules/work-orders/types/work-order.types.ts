import type { CustomFieldType } from "../../custom-fields/types/custom-field.types";


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

export interface WorkOrderCustomValueRequest {
    field_definition_id: number;
    value: string | null;
}

export interface WorkOrderCustomValuesRequest {
    values: WorkOrderCustomValueRequest[];
}


export interface CreateWorkOrderRequest {
    client: WorkOrderClientRequest;
    work_order: WorkOrderDataRequest;
    // Opcional porque uma OS pode ser criada
    // sem dados complementares.
    custom_values?: WorkOrderCustomValuesRequest;
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

export type WorkOrderStatus =
    | "PENDENTE"
    | "EM_ANDAMENTO"
    | "FINALIZADO"
    | "CANCELADO";

export type PaymentStatus =
    | "PENDENTE"
    | "PAGO"
    | "PARCIAL"
    | "CANCELADO";

export interface UpdateWorkOrderRequest {
    title?: string;
    description?: string;
    status_service?: WorkOrderStatus;
    status_payment?: PaymentStatus;
    price?: number;
}

export interface WorkOrderFieldDefinition {
    id: number;
    name: string;
    field_type: CustomFieldType;
    required: boolean;
    display_order: number;
    placeholder: string | null;
}

export interface WorkOrderCustomValue {
    id: number;
    work_order_id: number;
    value: string | null;
    field_definition: WorkOrderFieldDefinition;
}

export interface WorkOrderDetailsResponse {
    id: number;
    client: WorkOrderClientResponse;
    user_id: number;
    title: string;
    description: string;
    status_service: string;
    status_payment: string;
    custom_values: WorkOrderCustomValue[];
    price: string;
    finished_at: string | null;
    created_at: string;
    updated_at: string;
}