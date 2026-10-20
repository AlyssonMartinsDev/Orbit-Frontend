export type CustomFieldType =
    | "TEXT"
    | "NUMBER"
    | "DATE"
    | "BOOLEAN";


export type CustomFieldModule =
    | "CLIENT"
    | "WORK_ORDER"
    | "QUOTE"
    | "BOTH";


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
    required_quote: boolean;

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
    required_quote?: boolean;

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
    required_quote?: boolean;

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
    required_quote: boolean;

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

export function appliesTo(module: CustomFieldModule, target: CustomFieldModule): boolean {
    return module === target || (module === "BOTH" && (target === "QUOTE" || target === "WORK_ORDER"));
}
