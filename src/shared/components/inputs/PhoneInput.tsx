import type {
    ChangeEvent,
    InputHTMLAttributes,
} from "react";

import {
    formatPhone,
    sanitizePhone,
} from "../../utils/phone";


interface PhoneInputProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "value" | "onChange" | "type"
    > {
    value: string;
    onChange: (value: string) => void;
}


export function PhoneInput({
    value,
    onChange,
    ...props
}: PhoneInputProps) {

    /*
     * Sempre que o usuário digitar ou colar algo,
     * removemos tudo que não for número.
     *
     * O componente pai recebe somente os números.
     */
    const handleChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const sanitizedValue = sanitizePhone(
            event.target.value
        );

        onChange(sanitizedValue);
    };


    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            value={formatPhone(value)}
            onChange={handleChange}
        />
    );
}