import type { Address, AddressInput } from "../../addresses/types/address.types";
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
export interface AccountProfile extends AccountUser {
  avatar_url: string | null;
}
export interface OrganizationData {
  address?: AddressInput | null;
  name: string;
  trade_name: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}
export interface Organization extends OrganizationData {
  address?: Address | null;
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
export interface PlatformOrganization {
  id: number;
  name: string;
  access_status: "ACTIVE" | "SUSPENDED";
  access_expires_on: string | null;
  max_users: number | null;
  active_users: number;
  administrators: { id: number; name: string; email: string; is_active: boolean }[];
}
export interface PlatformOrganizationPage {
  items: PlatformOrganization[];
  total: number;
  page: number;
  size: number;
}
export interface PlatformAccessEvent {
  id: number;
  action: string;
  actor_user_id: number;
  target_user_id: number | null;
  details: { reason?: string; before?: unknown; after?: unknown; plan_id?: number; invoice_id?: number; status?: string };
  created_at: string;
}
export interface BillingPlan {
  id: number;
  name: string;
  description: string | null;
  price: string;
  cycle_months: 1 | 3 | 6 | 12;
  max_users: number | null;
  is_active: boolean;
}
export type BillingPlanInput = Omit<BillingPlan, "id">;
export interface BillingInvoice {
  id: number;
  organization_id: number;
  number: string;
  description: string;
  amount: string;
  due_on: string;
  status: "OPEN" | "PAID" | "VOID";
  paid_on: string | null;
  due_state: "OVERDUE" | "DUE_SOON" | null;
  created_at: string;
}
export interface BillingSummary {
  plan: BillingPlan | null;
  starts_on: string | null;
  renews_on: string | null;
  renewal_state: "OVERDUE" | "DUE_SOON" | null;
  invoices: BillingInvoice[];
  gateway: { status: "NOT_CONFIGURED" };
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
