/**
 * Remove qualquer caractere que não seja número
 * e limita o telefone brasileiro a 11 dígitos.
 *
 * Exemplo:
 * "(43) 99999-8888" -> "43999998888"
 */
export function sanitizePhone(value: string): string {
    return value
        .replace(/\D/g, "")
        .slice(0, 11);
}


/**
 * Formata um telefone brasileiro para exibição.
 *
 * 10 dígitos:
 * 4399998888 -> (43) 9999-8888
 *
 * 11 dígitos:
 * 43999998888 -> (43) 99999-8888
 */
export function formatPhone(value: string): string {
    const numbers = sanitizePhone(value);

    if (numbers.length <= 2) {
        return numbers;
    }

    if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(
            2,
            6
        )}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
        2,
        7
    )}-${numbers.slice(7)}`;
}