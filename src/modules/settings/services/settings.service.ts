import { api } from "../../../shared/services/api";
import type { ApiResponse } from "../../../shared/types/api.types";
import type {
  AccountUser,
  Organization,
  OrganizationData,
  NewUser,
  EditUser,
  ProvisionOrganization,
  ProvisionedOrganization,
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
      (await api.get<ApiResponse<AccountUser>>("/users/me", { signal })).data,
    );
  },
  async updateProfile(payload: Pick<AccountUser, "name" | "email">) {
    return data(
      (await api.patch<ApiResponse<AccountUser>>("/users/me", payload)).data,
    );
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
