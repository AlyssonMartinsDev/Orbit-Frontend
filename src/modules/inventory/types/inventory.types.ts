export const units = ["UN", "KG", "G", "L", "ML", "M", "CM", "M2", "M3", "CX", "PC", "PAR", "PCT"] as const;
export type Unit = typeof units[number];
export const movementLabels = {
    ENTRADA: "Entrada", SAIDA: "Saída",
    AJUSTE_POSITIVO: "Ajuste positivo", AJUSTE_NEGATIVO: "Ajuste negativo",
} as const;
export type MovementKind = keyof typeof movementLabels;
export interface Page<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
export interface Category { id: number; name: string }
export interface ProductInput {
    name: string;
    sku: string | null;
    barcode: string | null;
    description: string | null;
    category_id: number | null;
    unit: Unit;
    cost_price: string;
    sale_price: string;
    minimum_stock: string;
    track_stock: boolean;
    is_active: boolean;
}
export interface Product extends ProductInput {
    id: number;
    category_name: string | null;
    quantity: string;
    low_stock: boolean;
    has_movements?: boolean;
    created_at: string;
    updated_at: string;
}
export interface Movement {
    source_work_order_id?: number | null;
    source_work_order_title?: string | null;
    source_work_order_exists?: boolean;
    id: number;
    product_id: number;
    kind: MovementKind;
    quantity: string;
    balance_before: string;
    balance_after: string;
    reason: string;
    is_initial: boolean;
    created_by_name: string;
    created_at: string;
}
export interface MovementInput { kind: MovementKind; quantity: string; reason: string; request_id: string }
export interface InventoryFilters {
    page: number;
    search: string;
    category_id?: number;
    active?: boolean;
    stock?: "low" | "empty";
}
export interface InventorySummary { products: number; tracked: number; low_stock: number; out_of_stock: number }
