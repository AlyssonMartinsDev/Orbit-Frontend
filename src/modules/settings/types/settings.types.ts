export type UserRole = "admin" | "manager" | "user";
export interface AccountUser {
  id: number;
  name: string;
  email: string;
  role: UserRole | "superuser";
  organization_id: number | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface OrganizationData {
  name: string;
  trade_name: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}
export interface Organization extends OrganizationData {
  id: number;
  logo_url: string | null;
  max_users: number | null;
  created_at: string;
  updated_at: string;
}
export interface NewUser {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}
export interface ProvisionOrganization {
  organization: Pick<
    OrganizationData,
    "name" | "trade_name" | "document" | "email" | "phone"
  > & { max_users: number | null };
  administrator: { name: string; email: string; password: string };
}
export interface ProvisionedOrganization {
  organization: Organization;
  administrator: AccountUser;
}
export interface EditUser {
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password?: string;
}
export const roleLabels: Record<AccountUser["role"], string> = {
  admin: "Administrador",
  manager: "Gestor",
  user: "Operacional",
  superuser: "Administrador da plataforma",
};
