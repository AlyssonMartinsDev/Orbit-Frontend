import { useLayoutEffect, useRef, type InputHTMLAttributes } from "react";
import { formatCpfCnpj, normalizeDocument } from "../../utils/documents";

interface CpfCnpjInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
    value: string;
    onChange: (value: string) => void;
}

export function CpfCnpjInput({ value, onChange, ...props }: CpfCnpjInputProps) {
    const input = useRef<HTMLInputElement>(null);
    const caret = useRef<number | null>(null);
    useLayoutEffect(() => {
        if (caret.current !== null) {
            input.current?.setSelectionRange(caret.current, caret.current);
            caret.current = null;
        }
    });
    const update = (raw: string, position: number) => {
        const normalized = normalizeDocument(raw);
        const beforeCaret = normalizeDocument(raw.slice(0, position)).length;
        const formatted = formatCpfCnpj(normalized);
        let count = 0;
        let next = 0;
        while (next < formatted.length && count < beforeCaret) {
            if (normalizeDocument(formatted[next])) count++;
            next++;
        }
        caret.current = next;
        onChange(normalized);
    };
    return (
        <input
            {...props}
            ref={input}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            spellCheck={false}
            value={formatCpfCnpj(value)}
            onKeyDown={(event) => {
                props.onKeyDown?.(event);
                if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
                const element = event.currentTarget;
                const position = element.selectionStart;
                if (position === null || position !== element.selectionEnd) return;
                const raw = element.value;
                const backwards = event.key === "Backspace";
                if (!backwards && event.key !== "Delete") return;
                let index = backwards ? position - 1 : position;
                if (!/[./-]/.test(raw[index] ?? "")) return;
                while (index >= 0 && index < raw.length && /[./-]/.test(raw[index]))
                    index += backwards ? -1 : 1;
                if (index < 0 || index >= raw.length) return;
                event.preventDefault();
                update(raw.slice(0, index) + raw.slice(index + 1), backwards ? index : position);
            }}
            onChange={(event) => {
                const raw = event.target.value;
                update(raw, event.target.selectionStart ?? raw.length);
            }}
        />
    );
}
