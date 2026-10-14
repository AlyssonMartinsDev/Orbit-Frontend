/** Telefones nacionais brasileiros; aceita colagem com +55. */
export function sanitizePhone(value: string): string {
    let digits = value.replace(/\D/g, "");
    if (
        (digits.length === 12 || digits.length === 13) &&
        digits.startsWith("55")
    )
        digits = digits.slice(2);
    return digits.slice(0, 11);
}

export function formatPhone(value: string | null | undefined): string {
    if (!value) return "";
    const numbers = sanitizePhone(value);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    const prefixLength = numbers.length <= 10 ? 6 : 7;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, prefixLength)}-${numbers.slice(prefixLength)}`;
}

export function getWhatsAppUrl(
    value: string | null | undefined,
): string | null {
    const digits = value?.replace(/\D/g, "") ?? "";
    if (/^\d{10,11}$/.test(digits)) return `https://wa.me/55${digits}`;
    if (/^55\d{10,11}$/.test(digits)) return `https://wa.me/${digits}`;
    return null;
}
