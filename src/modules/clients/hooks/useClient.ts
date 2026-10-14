import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { requireResponseData } from "../../../shared/types/api.types";
import { ClientService } from "../services/client.service";

export function useClient(id: string | undefined) {
    const load = useCallback(
        async (signal: AbortSignal) => {
            const clientId = Number(id);
            if (!Number.isSafeInteger(clientId) || clientId <= 0)
                throw new Error("Cliente inválido.");
            return requireResponseData(
                await ClientService.getDetails(clientId, signal),
            );
        },
        [id],
    );
    return useAsyncResource(`client:${id}`, load);
}
