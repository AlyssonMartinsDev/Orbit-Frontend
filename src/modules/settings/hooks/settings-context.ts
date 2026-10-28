import { createContext, useContext } from "react";
import type { AccountProfile } from "../types/settings.types";

export const SettingsContext = createContext<{
    profile: AccountProfile;
    refreshProfile: () => void;
    isAdmin: boolean;
    canReadTeam: boolean;
} | null>(null);
export function useSettings() {
    const value = useContext(SettingsContext);
    if (!value)
        throw new Error("Configurações indisponíveis fora de seu contexto.");
    return value;
}
