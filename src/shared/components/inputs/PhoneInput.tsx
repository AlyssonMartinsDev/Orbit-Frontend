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
            pattern="\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}"
            title="Informe o DDD e um telefone com 10 ou 11 dígitos."
            {...props}
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            value={formatPhone(value)}
            onChange={handleChange}
        />
    );
}