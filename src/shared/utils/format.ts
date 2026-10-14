const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR");
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
});

export function formatCurrency(value: string | number): string {
    const number = Number(value);
    return Number.isFinite(number) ? currencyFormatter.format(number) : "—";
}

export function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    // Datas sem horário representam um dia local, não meia-noite em UTC.
    const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
    );
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}
