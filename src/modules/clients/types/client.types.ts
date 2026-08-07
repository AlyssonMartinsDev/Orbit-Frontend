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