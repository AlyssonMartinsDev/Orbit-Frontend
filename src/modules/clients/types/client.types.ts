// ============================================================
// CUSTOM FIELDS DO CLIENTE
// ============================================================

export interface ClientCustomValueRequest {
  field_definition_id: number;
  value: string | null;
}


export interface ClientCustomValueResponse {
  id: number;
  field_definition_id: number;
  value: string | null;
}


// ============================================================
// CRIAÇÃO / EDIÇÃO
// ============================================================

export interface CreateClientRequest {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  notes: string;

  custom_values: ClientCustomValueRequest[];
}


export interface UpdateClientRequest {
  name?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  notes?: string;

  custom_values?: ClientCustomValueRequest[];
}


// ============================================================
// CLIENTE
// ============================================================

export interface ClientResponse {
  id: number;

  name: string;
  phone: string;
  email: string;
  cpf: string;
  notes: string;

  created_at: string;
  updated_at: string;

  custom_values: ClientCustomValueResponse[];
}


// ============================================================
// DETALHES DO CLIENTE
// ============================================================

export interface ClientDetailsSummary {
  total_work_orders: number;
  open_work_orders: number;
  finished_work_orders: number;
  total_services_value: number;
}


export interface ClientWorkOrder {
  id: number;

  title: string;

  status_service: string;
  status_payment: string;

  price: number;

  created_at: string;
}


export interface ClientDetailsResponse {
  id: number;

  name: string;
  phone: string;
  email: string | null;
  notes: string | null;

  custom_values: ClientCustomValueResponse[];

  summary: ClientDetailsSummary;

  work_orders: ClientWorkOrder[];
}