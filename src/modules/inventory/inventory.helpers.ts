import { useAsyncResource } from "../../shared/hooks/useAsyncResource";
import { SettingsService } from "../settings/services/settings.service";

export const panelClass = "min-w-0 rounded-2xl border border-[#16345c] bg-[#051020]/80 p-4 sm:p-6";
export const pageClass = "mx-auto max-w-7xl space-y-6 p-4 text-slate-200 sm:p-6 lg:p-8";
export function quantity(value: string): string {
    if (!/^\d+(?:\.\d{1,3})?$/.test(value)) return "—";
    const [integer, fraction = ""] = value.split(".");
    const decimals = fraction.replace(/0+$/, "");
    return BigInt(integer).toLocaleString("pt-BR") + (decimals ? `,${decimals}` : "");
}

export function useInventoryAccess() {
    const profile = useAsyncResource("inventory-profile", SettingsService.profile);
    return { ...profile, canWrite: Boolean(profile.data && (profile.data.is_superuser || ["admin", "manager"].includes(profile.data.role))) };
}
