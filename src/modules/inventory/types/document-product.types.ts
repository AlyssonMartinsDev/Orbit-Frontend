import { itemsTotal } from "../../../shared/components/pricing/pricing";

export interface DocumentProductInput { product_id: number; quantity: string; unit_price: string }
export interface DocumentProduct extends DocumentProductInput {
    id?: number;
    name?: string;
    unit?: string;
    available_quantity?: string | null;
    stock_managed?: boolean;
    allocated_quantity?: string;
    subtotal?: string;
}
export function productPayload(products: DocumentProduct[]): DocumentProductInput[] {
    return products.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price }));
}
export function productsTotal(products: DocumentProductInput[]): string | null {
    return products.length ? itemsTotal(products.map(row => ({ ...row, description: "Produto" }))) : "0.00";
}
