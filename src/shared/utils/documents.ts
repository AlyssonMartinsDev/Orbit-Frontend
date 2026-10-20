/** CPF/CNPJ without punctuation; alphanumeric CNPJ follows Receita Federal. */
export function normalizeDocument(value: string): string {
    return value.replace(/[./\-\s]/g, "").replace(/[a-z]/g, char => char.toUpperCase());
}

export function documentType(value: string): "CPF" | "CNPJ" | null {
    if (/^[0-9]{11}$/.test(value)) return "CPF";
    if (/^[A-Z0-9]{12}[0-9]{2}$/.test(value)) return "CNPJ";
    return null;
}

function digit(base: string, weights: number[]): string {
    const remainder = [...base].reduce((sum, char, index) =>
        sum + (char.charCodeAt(0) - 48) * weights[index], 0) % 11;
    return String(remainder < 2 ? 0 : 11 - remainder);
}

export function isValidCpf(value: string): boolean {
    if (documentType(value) !== "CPF" || new Set(value).size === 1) return false;
    let base = value.slice(0, 9);
    base += digit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    base += digit(base, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    return base === value;
}

export function isValidCnpj(value: string): boolean {
    if (documentType(value) !== "CNPJ" || new Set(value.slice(0, 12)).size === 1) return false;
    let base = value.slice(0, 12);
    base += digit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    base += digit(base, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return base === value;
}

export function documentError(value: string | null | undefined): string | null {
    if (!value?.trim()) return null;
    const normalized = normalizeDocument(value);
    const kind = documentType(normalized);
    if (!kind) return "Informe um CPF com 11 dígitos ou CNPJ com 14 caracteres (os dois últimos devem ser dígitos).";
    if (!isValidCpf(normalized) && !isValidCnpj(normalized))
        return `${kind} inválido. Confira os dígitos verificadores.`;
    return null;
}

export function formatCpfCnpj(value: string | null | undefined): string {
    const normalized = normalizeDocument(value ?? "");
    // Preserve invalid/overflow input so validation can explain it, without truncation.
    if (!/^[A-Z0-9]{0,14}$/.test(normalized)) return normalized;
    const mask = /[A-Z]/.test(normalized) || normalized.length > 11
        ? "##.###.###/####-##" : "###.###.###-##";
    let result = "";
    let index = 0;
    for (const character of mask) {
        if (index >= normalized.length) break;
        result += character === "#" ? normalized[index++] : character;
    }
    return result;
}
