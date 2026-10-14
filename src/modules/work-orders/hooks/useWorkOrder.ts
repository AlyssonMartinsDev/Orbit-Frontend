import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { requireResponseData } from "../../../shared/types/api.types";
import { WorkOrderService } from "../services/work-order.service";

export function useWorkOrder(id: string | undefined) {
    const load = useCallback(
        async (signal: AbortSignal) => {
            const workOrderId = Number(id);
            if (!Number.isSafeInteger(workOrderId) || workOrderId <= 0)
                throw new Error("Ordem de serviço inválida.");
            return requireResponseData(
                await WorkOrderService.getById(workOrderId, signal),
            );
        },
        [id],
    );
    return useAsyncResource(`work-order:${id}`, load);
}
