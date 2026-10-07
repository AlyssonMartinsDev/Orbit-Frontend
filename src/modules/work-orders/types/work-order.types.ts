import type {
    CustomFieldModule,
    CustomFieldPresetType,
    CustomFieldType,
} from "../../custom-fields/types/custom-field.types";


// ============================================================
// CLIENTE
// ============================================================

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


// ============================================================
// STATUS
// ============================================================

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


// ============================================================
// DADOS DA ORDEM
// ============================================================

export interface WorkOrderDataRequest {
    title: string;
    description?: string;
    status_service: WorkOrderStatus;
    status_payment: PaymentStatus;
    price: number;
}


// ============================================================
// CUSTOM FIELDS
// ============================================================

export interface WorkOrderCustomValueRequest {
    field_definition_id: number;
    value: string | null;
}


export interface WorkOrderCustomValuesRequest {
    values: WorkOrderCustomValueRequest[];
}


/*
 * Definição do Custom Field devolvida junto
 * com os valores da Ordem de Serviço.
 *
 * module:
 * identifica a qual módulo o campo pertence.
 *
 * field_type:
 * identifica o tipo de dado armazenado.
 *
 * preset_type:
 * identifica comportamentos especiais do Orbit.
 *
 * Quando preset_type === null, o campo é comum
 * e seu comportamento depende apenas de field_type.
 */
export interface WorkOrderFieldDefinition {
    id: number;
    name: string;

    module: CustomFieldModule;

    field_type: CustomFieldType;

    preset_type:
    CustomFieldPresetType | null;

    required: boolean;
    display_order: number;
    placeholder: string | null;
}


export interface WorkOrderCustomValue {
    id: number;
    work_order_id: number;
    value: string | null;

    field_definition:
    WorkOrderFieldDefinition;
}


// ============================================================
// CREATE
// ============================================================

export interface CreateWorkOrderRequest {
    client: WorkOrderClientRequest;

    work_order: WorkOrderDataRequest;

    /*
     * Opcional porque uma OS pode ser criada
     * sem dados complementares.
     */
    custom_values?:
    WorkOrderCustomValuesRequest;
}


// ============================================================
// UPDATE
// ============================================================

export interface UpdateWorkOrderRequest {
    title?: string;
    description?: string;
    status_service?: WorkOrderStatus;
    status_payment?: PaymentStatus;
    price?: number;
}


// ============================================================
// RESPONSE
// ============================================================

export interface WorkOrderResponse {
    id: number;

    client:
    WorkOrderClientResponse;

    user_id: number;

    title: string;
    description: string;

    status_service:
    WorkOrderStatus;

    status_payment:
    PaymentStatus;

    custom_values:
    WorkOrderCustomValue[];

    price: string;

    finished_at:
    string | null;

    created_at: string;
    updated_at: string;
}


// ============================================================
// DETAILS
// ============================================================

export interface WorkOrderDetailsResponse {
    id: number;

    client:
    WorkOrderClientResponse;

    user_id: number;

    title: string;
    description: string;

    status_service:
    WorkOrderStatus;

    status_payment:
    PaymentStatus;

    custom_values:
    WorkOrderCustomValue[];

    price: string;

    finished_at:
    string | null;

    created_at: string;
    updated_at: string;
}


// ============================================================
// LISTAGEM
// ============================================================

/*
 * Representa cada Ordem de Serviço
 * exibida na página de acompanhamento.
 */
export interface WorkOrderListItem {
    id: number;

    client:
    WorkOrderClientResponse;

    title: string;

    status_service:
    WorkOrderStatus;

    status_payment:
    PaymentStatus;

    price: string;

    created_at: string;

    finished_at:
    string | null;
}


// ============================================================
// PAGINAÇÃO
// ============================================================

/*
 * Informações de paginação retornadas
 * pelo backend.
 */
export interface WorkOrderPagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}


// ============================================================
// RESUMO DA LISTAGEM
// ============================================================

/*
 * Quantidades utilizadas nas abas
 * "Geral" e "Pendentes".
 */
export interface WorkOrderListSummary {
    all: number;
    pending: number;
}


// ============================================================
// RESPONSE PAGINADO
// ============================================================

/*
 * Estrutura completa retornada em "data"
 * pelo endpoint /work_orders/tracking.
 */
export interface WorkOrderPaginatedResponse {
    items:
    WorkOrderListItem[];

    pagination:
    WorkOrderPagination;

    summary:
    WorkOrderListSummary;
}