

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    status_code: number;
    data?: T;
    errors?: unknown;
}