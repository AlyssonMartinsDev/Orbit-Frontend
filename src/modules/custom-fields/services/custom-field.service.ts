import { api } from "../../../shared/services/api";

import type { ApiResponse } from "../../../shared/types/api.types";

import type {
    CustomFieldDefinitionResponse,
    CreateCustomFieldRequest,
    WorkOrderCustomValueResponse,
    SaveWorkOrderCustomValuesRequest,
    UpdateCustomFieldRequest,
    CustomFieldModule,
} from "../types/custom-field.types";


export class CustomFieldService {

    // Busca os campos personalizados.
    // Quando module for informado, retorna somente os campos daquele módulo.
    static async getAll(
        module?: CustomFieldModule
    ): Promise<ApiResponse<CustomFieldDefinitionResponse[]>> {

        const response = await api.get(
            "/custom-fields",
            {
                params: module
                    ? { module }
                    : undefined,
            }
        );

        return response.data;
    }


    // Cria uma nova definição de campo personalizado.
    static async create(
        data: CreateCustomFieldRequest
    ): Promise<ApiResponse<CustomFieldDefinitionResponse>> {

        const response = await api.post(
            "/custom-fields",
            data
        );

        return response.data;
    }


    // Atualiza uma definição de campo personalizado existente.
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


    // Exclui definitivamente um campo personalizado.
    // O backend bloqueia a exclusão caso ele já tenha sido utilizado.
    static async delete(
        customFieldId: number
    ): Promise<ApiResponse<null>> {

        const response = await api.delete(
            `/custom-fields/${customFieldId}`
        );

        return response.data;
    }


    // Busca os valores dos campos personalizados de uma OS.
    static async getWorkOrderValues(
        workOrderId: number
    ): Promise<ApiResponse<WorkOrderCustomValueResponse[]>> {

        const response = await api.get(
            `/work-orders/${workOrderId}/custom-fields`
        );

        return response.data;
    }


    // Salva ou atualiza os valores dos campos personalizados de uma OS.
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