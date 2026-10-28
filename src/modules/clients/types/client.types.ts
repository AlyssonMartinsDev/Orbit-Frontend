import type { Address, AddressInput } from "../../addresses/types/address.types";
import type { PaymentStatus, WorkOrderStatus } from "../../work-orders/types/work-order.types";

export interface ClientCustomValueRequest { field_definition_id: number; value: string | null }
export interface ClientCustomValueResponse extends ClientCustomValueRequest { id: number }

export interface ClientData {
    cpf_cnpj?: string | null;
    address?: AddressInput | null;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    custom_values: ClientCustomValueRequest[];
}

export type CreateClientRequest = ClientData;
export type UpdateClientRequest = Partial<ClientData>;

export interface ClientResponse extends Omit<ClientData, "custom_values" | "address"> {
    address?: Address | null;
    id: number;
    created_at: string;
    updated_at: string;
    custom_values: ClientCustomValueResponse[];
}

export interface ClientDetailsSummary {
    total_work_orders: number;
    open_work_orders: number;
    finished_work_orders: number;
    total_services_value: number;
}

export interface ClientWorkOrder {
    id: number;
    title: string;
    status_service: WorkOrderStatus;
    status_payment: PaymentStatus;
    price: number;
    created_at: string;
}

export interface ClientDetailsResponse extends Omit<ClientResponse, "created_at" | "updated_at"> {
    cpf?: string | null;
    summary: ClientDetailsSummary;
    work_orders: ClientWorkOrder[];
}


export type ClientSummary = Pick<ClientResponse, "id" | "name" | "phone" | "email" | "cpf_cnpj">;
export interface ClientPage {
    items: ClientSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
export interface ClientQuery { page?: number; page_size?: number; search?: string }
