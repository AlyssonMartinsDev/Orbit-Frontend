import { api } from "../../../shared/services/api";
import { requireResponseData, type ApiResponse } from "../../../shared/types/api.types";
import type { Category, InventoryFilters, InventorySummary, Movement, MovementInput, Page, Product, ProductInput } from "../types/inventory.types";

function checked<T>(response: ApiResponse<T>): ApiResponse<T> {
    if (!response.success) {
        const details = Array.isArray(response.errors)
            ? response.errors.flatMap((entry: unknown) => entry && typeof entry === "object" && "message" in entry && typeof entry.message === "string" ? [entry.message] : []).join(" ")
            : "";
        throw new Error(details || response.message || "Não foi possível concluir a operação.");
    }
    return response;
}
async function get<T>(path: string, params?: object, signal?: AbortSignal): Promise<T> {
    return requireResponseData(checked((await api.get<ApiResponse<T>>(`/inventory${path}`, { params, signal })).data));
}
async function save<T>(path: string, body: object, edit = false): Promise<T> {
    const response = edit ? await api.put<ApiResponse<T>>(`/inventory${path}`, body) : await api.post<ApiResponse<T>>(`/inventory${path}`, body);
    return requireResponseData(checked(response.data));
}
async function remove(path: string): Promise<void> {
    checked((await api.delete<ApiResponse<null>>(`/inventory${path}`)).data);
}
export const InventoryService = {
    list: (filters: InventoryFilters, signal?: AbortSignal) => get<Page<Product>>("/products", filters, signal),
    summary: (signal?: AbortSignal) => get<InventorySummary>("/summary", undefined, signal),
    detail: (id: number, signal?: AbortSignal) => get<Product>(`/products/${id}`, undefined, signal),
    create: (data: ProductInput & { initial_quantity: string }) => save<Product>("/products", data),
    update: (id: number, data: Partial<ProductInput>) => save<Product>(`/products/${id}`, data, true),
    remove: (id: number) => remove(`/products/${id}`),
    categories: (page: number, search = "", signal?: AbortSignal) => get<Page<Category>>("/categories", { page, search }, signal),
    saveCategory: (name: string, id?: number) => save<Category>(`/categories${id ? `/${id}` : ""}`, { name }, Boolean(id)),
    removeCategory: (id: number) => remove(`/categories/${id}`),
    movements: (id: number, page: number, signal?: AbortSignal) => get<Page<Movement>>(`/products/${id}/movements`, { page }, signal),
    move: (id: number, data: MovementInput) => save<Movement>(`/products/${id}/movements`, data),
};
