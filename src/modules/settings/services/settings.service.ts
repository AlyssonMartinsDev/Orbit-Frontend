import type { PdfPreferences } from "../types/pdf-settings.types";
import { api } from "../../../shared/services/api";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  AccountUser,
  AccountProfile,
  Organization,
  OrganizationData,
  NewUser,
  EditUser,
  ProvisionOrganization,
  ProvisionedOrganization,
  PlatformOrganizationPage,
  PlatformAccessEvent,
  BillingPlan, BillingPlanInput, BillingSummary, BillingInvoice,
} from "../types/settings.types";

function checked<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (!response.success) {
    const details = Array.isArray(response.errors)
      ? response.errors
          .filter(
            (item: unknown): item is { message: string } =>
              !!item &&
              typeof item === "object" &&
              "message" in item &&
              typeof item.message === "string",
          )
          .map((item) => item.message)
          .join(" ")
      : "";
    throw new Error(
      details || response.message || "Não foi possível salvar as alterações.",
    );
  }
  return response;
}
function data<T>(response: ApiResponse<T>): T {
  const value = checked(response).data;
  if (value == null) throw new Error("Resposta inválida do servidor.");
  return value;
}
export const SettingsService = {
  async billingPlans() {
    return data((await api.get<ApiResponse<BillingPlan[]>>("/platform/plans")).data);
  },
  async createBillingPlan(payload: BillingPlanInput) {
    return data((await api.post<ApiResponse<BillingPlan>>("/platform/plans", payload)).data);
  },
  async updateBillingPlan(id: number, payload: BillingPlanInput) {
    return data((await api.put<ApiResponse<BillingPlan>>(`/platform/plans/${id}`, payload)).data);
  },
  async assignBillingPlan(id: number, payload: { plan_id: number; starts_on: string; renews_on: string }) {
    return data((await api.put<ApiResponse<BillingSummary>>(`/platform/organizations/${id}/plan`, payload)).data);
  },
  async platformBilling(id: number) {
    return data((await api.get<ApiResponse<BillingSummary>>(`/platform/organizations/${id}/billing`)).data);
  },
  async myBilling() {
    return data((await api.get<ApiResponse<BillingSummary>>("/billing/me")).data);
  },
  async createBillingInvoice(id: number, payload: { number: string; description: string; amount: string; due_on: string }) {
    return data((await api.post<ApiResponse<BillingInvoice>>(`/platform/organizations/${id}/invoices`, payload)).data);
  },
  async changeBillingInvoice(id: number, invoiceId: number, status: "PAID" | "VOID") {
    return data((await api.patch<ApiResponse<BillingInvoice>>(`/platform/organizations/${id}/invoices/${invoiceId}`, { status })).data);
  },
  async platformOrganizations(page: number, search: string) {
    return data((await api.get<ApiResponse<PlatformOrganizationPage>>("/platform/organizations", { params: { page, search } })).data);
  },
  async updatePlatformAccess(id: number, payload: { access_status: "ACTIVE" | "SUSPENDED"; access_expires_on: string | null; max_users: number | null; reason: string }) {
    return data((await api.patch<ApiResponse<unknown>>(`/platform/organizations/${id}/access`, payload)).data);
  },
  async updatePlatformAdministrator(organizationId: number, userId: number, is_active: boolean, reason: string) {
    return data((await api.patch<ApiResponse<unknown>>(`/platform/organizations/${organizationId}/administrators/${userId}`, { is_active, reason })).data);
  },
  async platformAccessEvents(id: number) {
    return data((await api.get<ApiResponse<PlatformAccessEvent[]>>(`/platform/organizations/${id}/events`)).data);
  },
  async pdfPreferences(signal?: AbortSignal) {
    return data((await api.get<ApiResponse<PdfPreferences>>("/organizations/me/pdf-settings", { signal })).data);
  },
  async updatePdfPreferences(payload: PdfPreferences) {
    return data((await api.put<ApiResponse<PdfPreferences>>("/organizations/me/pdf-settings", payload)).data);
  },
  async provisionOrganization(payload: ProvisionOrganization) {
    return data(
      (
        await api.post<ApiResponse<ProvisionedOrganization>>(
          "/platform/organizations",
          payload,
        )
      ).data,
    );
  },
  async profile(signal?: AbortSignal) {
    return data(
      (await api.get<ApiResponse<AccountProfile>>("/users/me", { signal })).data,
    );
  },
  async updateProfile(payload: Pick<AccountUser, "name" | "email">) {
    return data(
      (await api.patch<ApiResponse<AccountProfile>>("/users/me", payload)).data,
    );
  },
  async uploadAvatar(data_url: string) {
    return data((await api.put<ApiResponse<AccountProfile>>("/users/me/avatar", { data_url })).data);
  },
  async removeAvatar() {
    return data((await api.delete<ApiResponse<AccountProfile>>("/users/me/avatar")).data);
  },
  async changePassword(payload: {
    current_password: string;
    new_password: string;
  }) {
    checked(
      (await api.put<ApiResponse<null>>("/users/me/password", payload)).data,
    );
  },
  async organization(signal?: AbortSignal) {
    return data(
      (
        await api.get<ApiResponse<Organization>>("/organizations/me", {
          signal,
        })
      ).data,
    );
  },
  async updateOrganization(payload: OrganizationData) {
    return data(
      (await api.patch<ApiResponse<Organization>>("/organizations/me", payload))
        .data,
    );
  },
  async uploadLogo(data_url: string) {
    return data(
      (
        await api.put<ApiResponse<Organization>>("/organizations/me/logo", {
          data_url,
        })
      ).data,
    );
  },
  async removeLogo() {
    return data(
      (await api.delete<ApiResponse<Organization>>("/organizations/me/logo"))
        .data,
    );
  },
  async users(signal?: AbortSignal) {
    return data(
      (await api.get<ApiResponse<AccountUser[]>>("/users/", { signal })).data,
    );
  },
  async createUser(payload: NewUser) {
    return data(
      (await api.post<ApiResponse<AccountUser>>("/users/", payload)).data,
    );
  },
  async updateUser(id: number, payload: EditUser) {
    return data(
      (await api.put<ApiResponse<AccountUser>>(`/users/${id}`, payload)).data,
    );
  },
};
