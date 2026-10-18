import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { inputClass } from "../../../shared/components/form/FormSection";

export function SettingsField({
    label,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    const id = useId();
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="mb-2 block text-sm text-[#a7b4c8]">
                {label}
                {props.required && " *"}
            </label>
            <input {...props} id={id} className={inputClass} />
        </div>
    );
}
export function SaveError({ message }: { message: string | null }) {
    return message ? (
        <p
            role="alert"
            className="break-words rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200"
        >
            {message}
        </p>
    ) : null;
}
