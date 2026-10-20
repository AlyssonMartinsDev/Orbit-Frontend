export interface State { id: number; code: string; name: string }
export interface City { id: number; name: string; state: State }
export interface AddressInput {
    city_id: number;
    zip_code: string | null;
    street: string;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
}
export interface Address extends AddressInput { id: number; city: City }
export interface PostalCodeResult { zip_code: string; street: string; neighborhood: string; city: City; provider: string }
export interface AddressDraft {
    enabled: boolean;
    zip_code: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    state_id: number | null;
    city: City | null;
}
export function addressDraft(address?: Address | null): AddressDraft {
    return { enabled: !!address, zip_code: address?.zip_code ?? "", street: address?.street ?? "", number: address?.number ?? "", complement: address?.complement ?? "", neighborhood: address?.neighborhood ?? "", state_id: address?.city.state.id ?? null, city: address?.city ?? null };
}
export function addressPayload(draft: AddressDraft): AddressInput | null {
    if (!draft.enabled) return null;
    if (!draft.city || draft.city.state.id !== draft.state_id || !draft.street.trim()) throw new Error("Informe o logradouro, a UF e a cidade do endereço.");
    if (draft.zip_code && !/^[0-9]{8}$/.test(draft.zip_code)) throw new Error("Informe um CEP com 8 dígitos ou deixe-o em branco.");
    return { city_id: draft.city.id, zip_code: draft.zip_code || null, street: draft.street.trim(), number: draft.number.trim() || null, complement: draft.complement.trim() || null, neighborhood: draft.neighborhood.trim() || null };
}
export function formatPostalCode(value: string): string { return value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value; }
export function addressLines(address: Address): string[] {
    return [
        [address.street, address.number, address.complement].filter(Boolean).join(", "),
        [address.neighborhood, `${address.city.name} / ${address.city.state.code}`].filter(Boolean).join(" · "),
        address.zip_code ? `CEP ${formatPostalCode(address.zip_code)}` : "",
    ].filter(Boolean);
}
