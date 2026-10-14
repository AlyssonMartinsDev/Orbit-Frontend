import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { requireResponseData } from "../../../shared/types/api.types";
import { WorkOrderService } from "../services/work-order.service";
import type { WorkOrderTrackingParams } from "../services/work-order.service";

export function useWorkOrders({
    page,
    page_size,
    tab,
    search,
    start_date,
    end_date,
    status_service,
    status_payment,
}: WorkOrderTrackingParams) {
    const key = JSON.stringify([
        page,
        page_size,
        tab,
        search,
        start_date,
        end_date,
        status_service,
        status_payment,
    ]);
    const load = useCallback(
        async (signal: AbortSignal) =>
            requireResponseData(
                await WorkOrderService.getTracking(
                    {
                        page,
                        page_size,
                        tab,
                        search,
                        start_date,
                        end_date,
                        status_service,
                        status_payment,
                    },
                    signal,
                ),
            ),
        [
            page,
            page_size,
            tab,
            search,
            start_date,
            end_date,
            status_service,
            status_payment,
        ],
    );
    return useAsyncResource(key, load);
}
