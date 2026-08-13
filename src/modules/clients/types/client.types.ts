export interface CreateClientRequest {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  notes: string;
}

export interface ClientResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// tipos para o detalhes de um cliente
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

  summary: ClientDetailsSummary;

  work_orders: ClientWorkOrder[];
}