import type { WorkOrderStatus, PaymentStatus } from "../types/work-order.types";

export const serviceOptions: { value: WorkOrderStatus; label: string }[] = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "EM_ANDAMENTO", label: "Em andamento" },
    { value: "FINALIZADO", label: "Finalizado" },
    { value: "CANCELADO", label: "Cancelado" },
];
export const paymentOptions: { value: PaymentStatus; label: string }[] = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "PARCIAL", label: "Parcial" },
    { value: "PAGO", label: "Pago" },
    { value: "CANCELADO", label: "Cancelado" },
];
export const serviceLabel = (status: WorkOrderStatus) =>
    serviceOptions.find((item) => item.value === status)?.label ?? status;
export const paymentLabel = (status: PaymentStatus) =>
    paymentOptions.find((item) => item.value === status)?.label ?? status;
