export interface ApiResponse<T> {
    success: boolean;
    message: string;
    status_code?: number;
    data?: T | null;
    errors?: unknown;
}

export function requireResponseData<T>(response: ApiResponse<T>): T {
    if (!response.success || response.data == null) {
        throw new Error(response.message || "A resposta não contém os dados solicitados.");
    }
    return response.data;
}
