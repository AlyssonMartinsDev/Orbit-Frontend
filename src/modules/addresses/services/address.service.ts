import { api } from "../../../shared/services/api";
import { requireResponseData, type ApiResponse } from "../../../shared/types/api.types";
import type { City, PostalCodeResult, State } from "../types/address.types";

export const AddressService = {
    async states(signal?: AbortSignal) {
        return requireResponseData((await api.get<ApiResponse<State[]>>("/addresses/states", { signal })).data);
    },
    async cities(stateId: number, signal?: AbortSignal) {
        return requireResponseData((await api.get<ApiResponse<City[]>>("/addresses/cities", { params: { state_id: stateId }, signal })).data);
    },
    async lookup(zipCode: string, signal?: AbortSignal) {
        return requireResponseData((await api.get<ApiResponse<PostalCodeResult>>(`/addresses/postal-codes/${zipCode}`, { signal, timeout: 6500 })).data);
    },
};
