export type CustomFieldType =
    | "TEXT"
    | "NUMBER"
    | "DATE"
    | "BOOLEAN";


export type CustomFieldModule =
    | "CLIENT"
    | "WORK_ORDER";


export type CustomFieldPresetType =
    | "WHATSAPP"
    | "EMAIL"
    | "PHONE"
    | "URL";


export interface CustomFieldDefinitionResponse {
    id: number;

    name: string;

    module: CustomFieldModule;

    field_type: CustomFieldType;

    preset_type: CustomFieldPresetType | null;

    required: boolean;

    active: boolean;

    display_order: number;

    placeholder: string | null;
}


export interface CreateCustomFieldRequest {
    name: string;

    module: CustomFieldModule;

    field_type: CustomFieldType;

    preset_type?: CustomFieldPresetType | null;

    required?: boolean;

    active?: boolean;

    display_order?: number;

    placeholder?: string | null;
}


export interface UpdateCustomFieldRequest {
    name?: string;

    module?: CustomFieldModule;

    field_type?: CustomFieldType;

    preset_type?: CustomFieldPresetType | null;

    required?: boolean;

    active?: boolean;

    display_order?: number;

    placeholder?: string | null;
}


export interface CustomFieldDefinitionSimpleResponse {
    id: number;

    name: string;

    module: CustomFieldModule;

    field_type: CustomFieldType;

    preset_type: CustomFieldPresetType | null;

    required: boolean;

    display_order: number;

    placeholder: string | null;
}


export interface WorkOrderCustomValueResponse {
    id: number;

    work_order_id: number;

    value: string | null;

    field_definition: CustomFieldDefinitionSimpleResponse;
}


export interface WorkOrderCustomValueRequest {
    field_definition_id: number;

    value: string | null;
}


export interface SaveWorkOrderCustomValuesRequest {
    values: WorkOrderCustomValueRequest[];
}