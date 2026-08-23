import { api } from "../../../shared/services/api";

import type { ApiResponse } from "../../../shared/types/api.types";

import type {
    CustomFieldDefinitionResponse,
    CreateCustomFieldRequest,
    WorkOrderCustomValueResponse,
    SaveWorkOrderCustomValuesRequest,
    UpdateCustomFieldRequest
} from "../types/custom-field.types";


export class CustomFieldService {

    static async getAll(): Promise<
        ApiResponse<CustomFieldDefinitionResponse[]>
    > {
        const response = await api.get(
            "/custom-fields"
        );

        return response.data;
    }


    static async create(
        data: CreateCustomFieldRequest
    ): Promise<ApiResponse<CustomFieldDefinitionResponse>> {

        const response = await api.post(
            "/custom-fields",
            data
        );

        return response.data;
    }

    // Atualiza um campo personalizado existente
    static async update(
        customFieldId: number,
        data: UpdateCustomFieldRequest
    ): Promise<ApiResponse<CustomFieldDefinitionResponse>> {

        const response = await api.put(
            `/custom-fields/${customFieldId}`,
            data
        );

        return response.data;
    }

    // Exclui definitivamente um campo personalizado
    // O backend bloqueia a exclusão caso ele já tenha sido usado em uma OS
    static async delete(
        customFieldId: number
    ): Promise<ApiResponse<null>> {

        const response = await api.delete(
            `/custom-fields/${customFieldId}`
        );

        return response.data;
    }

    static async getWorkOrderValues(
        workOrderId: number
    ): Promise<ApiResponse<WorkOrderCustomValueResponse[]>> {

        const response = await api.get(
            `/work-orders/${workOrderId}/custom-fields`
        );

        return response.data;
    }


    static async saveWorkOrderValues(
        workOrderId: number,
        data: SaveWorkOrderCustomValuesRequest
    ): Promise<ApiResponse<WorkOrderCustomValueResponse[]>> {

        const response = await api.put(
            `/work-orders/${workOrderId}/custom-fields`,
            data
        );

        return response.data;
    }
}