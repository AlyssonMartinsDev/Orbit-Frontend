import { PhoneInput } from "../../../shared/components/inputs";
import { inputClass } from "../../../shared/components/form/FormSection";
import type { CustomFieldDefinitionResponse } from "../types/custom-field.types";

export function CustomFieldInput({
    field,
    value,
    onChange,
    id,
}: {
    field: CustomFieldDefinitionResponse;
    value: string;
    onChange: (value: string) => void;
    id: string;
}) {
    const common = {
        id,
        required: field.required,
        value,
        className: inputClass,
    };
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="mb-2 block break-words text-sm font-medium text-[#a7b4c8]"
            >
                {field.name}
                {field.required && (
                    <span aria-hidden="true" className="ml-1 text-blue-300">
                        *
                    </span>
                )}
            </label>
            {field.preset_type === "PHONE" ||
            field.preset_type === "WHATSAPP" ? (
                <PhoneInput
                    {...common}
                    placeholder={field.placeholder ?? "(00) 00000-0000"}
                    onChange={onChange}
                />
            ) : field.field_type === "BOOLEAN" ? (
                <select
                    {...common}
                    onChange={(event) => onChange(event.target.value)}
                >
                    <option value="">Selecione</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                </select>
            ) : (
                <input
                    {...common}
                    type={
                        field.preset_type === "EMAIL"
                            ? "email"
                            : field.preset_type === "URL"
                              ? "url"
                              : field.field_type === "NUMBER"
                                ? "number"
                                : field.field_type === "DATE"
                                  ? "date"
                                  : "text"
                    }
                    maxLength={500}
                    step={field.field_type === "NUMBER" ? "any" : undefined}
                    placeholder={field.placeholder ?? undefined}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </div>
    );
}
