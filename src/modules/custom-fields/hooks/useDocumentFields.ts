import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { requireResponseData } from "../../../shared/types/api.types";
import { CustomFieldService } from "../services/custom-field.service";

export function useDocumentFields(module: "QUOTE" | "WORK_ORDER") {
    const load = useCallback(async (signal: AbortSignal) => {
        const fields = requireResponseData(await CustomFieldService.getAll(module, signal));
        return fields.filter(field => field.active);
    }, [module]);
    return useAsyncResource(`document-fields:${module}`, load);
}
