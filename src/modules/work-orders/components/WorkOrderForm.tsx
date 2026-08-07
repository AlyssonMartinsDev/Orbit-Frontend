import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useClientStore } from "../../../shared/store/client.store";
import type { CreateWorkOrderRequest } from "../types/work-order.types";

import { WorkOrderService } from "../services/work-order.service";

import { useMessageStore } from "../../../shared/store/message.store";

import { useDashboardStore } from "../../../shared/store/dashboard.store";

import type { WorkOrderResponse } from "../types/work-order.types";

interface WorkOrderFormProps {
    mode?: "create" | "edit";
    workOrder?: WorkOrderResponse;
}

interface WorkOrderFormState {
    client: {
        id: number | "";
        name: string;
        phone: string;
        email: string;
        notes: string;
    };

    workOrder: {
        title: string;
        description: string;
        status_service: string;
        status_payment: string;
        price: number;
    };
}



type ClientMode = "existing" | "new";

export function WorkOrderForm({ mode = "create", workOrder }: WorkOrderFormProps) {

    const navigate = useNavigate();

    const loadSummary = useDashboardStore(
        (state) => state.loadSummary
    );
    const showMessage = useMessageStore(
        (state) => state.showMessage
    )
    const [clientMode, setClientMode] =
        useState<ClientMode>("existing");

    const clients = useClientStore((state) => state.clients);
    const isLoadingClients = useClientStore((state) => state.isLoading);
    const loadClients = useClientStore((state) => state.loadClients);

    const [formData, setFormData] = useState<WorkOrderFormState>({
        client: {
            id: "",
            name: "",
            phone: "",
            email: "",
            notes: "",
        },

        workOrder: {
            title: "",
            description: "",
            status_service: "EM_ANDAMENTO",
            status_payment: "PENDENTE",
            price: 0,
        },
    });

    const handleClientChange = (
        field: keyof WorkOrderFormState["client"],
        value: WorkOrderFormState["client"][keyof WorkOrderFormState["client"]]
    ) => {
        setFormData((prev) => ({
            ...prev,
            client: {
                ...prev.client,
                [field]: value,
            },
        }));
    };

    const handleWorkOrderChange = (
        field: keyof CreateWorkOrderRequest["work_order"],
        value: CreateWorkOrderRequest["work_order"][keyof CreateWorkOrderRequest["work_order"]]
    ) => {
        setFormData((prev) => ({
            ...prev,

            workOrder: {
                ...prev.workOrder,
                [field]: value,
            }
        }))
    }

    useEffect(() => {
        void loadClients();
    }, [loadClients]);

    useEffect(() => {
        if (mode !== "edit" || !workOrder) {
            return;
        }

        setClientMode("existing");

        setFormData({
            client: {
                id: workOrder.client.id,
                name: workOrder.client.name ?? "",
                phone: workOrder.client.phone ?? "",
                email: workOrder.client.email ?? "",
                notes: "",
            },

            workOrder: {
                title: workOrder.title,
                description: workOrder.description ?? "",
                status_service: workOrder.status_service,
                status_payment: workOrder.status_payment,
                price: Number(workOrder.price),
            },
        });
    }, [mode, workOrder]);

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const clientPayload = clientMode === "existing" ? {
            id: Number(formData.client.id)
        } : {
            name: formData.client.name.trim(),

            phone: formData.client.phone.trim(),

            email: formData.client.email.trim() || undefined,

            notes: formData.client.notes.trim() || undefined,
        }

        const workOrderPayload = {
            title: formData.workOrder.title.trim(),

            description: formData.workOrder.description.trim() || undefined,

            status_service: formData.workOrder.status_service,

            status_payment: formData.workOrder.status_payment,

            price: formData.workOrder.price,
        }

        const payload: CreateWorkOrderRequest = {
            client: clientPayload,
            work_order: workOrderPayload,
        }

        const response =
            mode === "edit" && workOrder
                ? await WorkOrderService.update(workOrder.id, payload)
                : await WorkOrderService.create(payload);
        console.log("response da criação da OS", response)

        if (!response.success) {
            showMessage(response.message, "error");
            console.error("Erro ao criar ordem de serviço:", response.message);
            return
        }

        showMessage(
            mode === "edit"
                ? "Ordem de serviço atualizada com sucesso!"
                : "Ordem de serviço criada com sucesso!",
            "success"
        );


        await loadSummary(true); // Atualiza o resumo do dashboard após criar a ordem de serviço
        navigate("/dashboard");
    }
    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Cliente */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Cliente
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Selecione um cliente cadastrado ou cadastre um novo durante a criação
                        da ordem de serviço.
                    </p>
                </div>

                {/* Escolha do modo */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setClientMode("existing")}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${clientMode === "existing"
                            ? "border-violet-500 bg-violet-500/15 text-violet-200"
                            : "border-white/10 text-zinc-300 hover:bg-white/5"
                            }`}
                    >
                        Cliente cadastrado
                    </button>

                    <button
                        type="button"
                        onClick={() => setClientMode("new")}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${clientMode === "new"
                            ? "border-violet-500 bg-violet-500/15 text-violet-200"
                            : "border-white/10 text-zinc-300 hover:bg-white/5"
                            }`}
                    >
                        Cadastrar novo cliente
                    </button>
                </div>

                {/* Cliente existente */}
                {clientMode === "existing" && (
                    <div className="mt-6">
                        <label
                            htmlFor="client_id"
                            className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                            Cliente cadastrado
                        </label>

                        <select
                            id="client_id"
                            value={formData.client.id ?? ""}
                            onChange={(e) => handleClientChange("id", Number(e.target.value))}
                            defaultValue=""
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                        >
                            <option value="" disabled>
                                Selecione um cliente
                            </option>

                            {clients.map((client) => (

                                <option

                                    key={client.id}

                                    value={client.id}

                                >

                                    {client.name}

                                </option>

                            ))}
                        </select>

                        <p className="mt-2 text-xs text-zinc-500">
                            A lista será preenchida posteriormente com os clientes cadastrados.
                        </p>
                    </div>
                )}

                {/* Novo cliente */}
                {clientMode === "new" && (
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="client_name"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                Nome
                            </label>

                            <input
                                id="client_name"
                                type="text"
                                value={formData.client.name}
                                onChange={(e) => handleClientChange("name", e.target.value)}
                                placeholder="Nome completo ou razão social"
                                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="client_phone"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                Telefone
                            </label>

                            <input
                                id="client_phone"
                                type="text"
                                value={formData.client.phone}
                                onChange={(e) => handleClientChange("phone", e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="client_email"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                E-mail
                            </label>

                            <input
                                id="client_email"
                                type="email"
                                value={formData.client.email}
                                onChange={(e) => handleClientChange("email", e.target.value)}
                                placeholder="cliente@email.com"
                                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="client_notes"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                Observações do cliente
                            </label>

                            <input
                                id="client_notes"
                                type="text"
                                value={formData.client.notes}
                                onChange={(e) => handleClientChange("notes", e.target.value)}
                                placeholder="Informações adicionais"
                                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* Dados da OS */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Informações da ordem
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Preencha os dados principais da ordem de serviço.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                            Título
                        </label>

                        <input
                            id="title"
                            required
                            type="text"
                            placeholder="Ex.: Instalação Volvo TechTool"
                            value={formData.workOrder.title}
                            onChange={(e) => handleWorkOrderChange("title", e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="status_service"
                            className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                            Status do serviço
                        </label>

                        <select
                            id="status_service"
                            value={formData.workOrder.status_service}
                            required
                            onChange={(e) => handleWorkOrderChange("status_service", e.target.value)}
                            defaultValue="EM_ANDAMENTO"
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                        >
                            <option value="EM_ANDAMENTO">
                                Em andamento
                            </option>

                            <option value="PENDENTE">
                                Pendente
                            </option>

                            <option value="FINALIZADO">
                                Finalizado
                            </option>

                            <option value="CANCELADO">
                                Cancelado
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="status_payment"
                            className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                            Status do pagamento
                        </label>

                        <select
                            id="status_payment"
                            required
                            value={formData.workOrder.status_payment}
                            onChange={(e) => handleWorkOrderChange("status_payment", e.target.value)}
                            defaultValue="PENDENTE"
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                        >
                            <option value="PENDENTE">
                                Pendente
                            </option>

                            <option value="PAGO">
                                Pago
                            </option>

                            <option value="PARCIAL">
                                Parcial
                            </option>

                            <option value="CANCELADO">
                                Cancelado
                            </option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="price"
                            className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                            Valor
                        </label>

                        <input
                            id="price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.workOrder.price}
                            onChange={(e) => handleWorkOrderChange("price", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                        />
                    </div>
                </div>
            </section>

            {/* Descrição */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-white">
                    Descrição do serviço
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Informe os detalhes do serviço que será realizado.
                </p>

                <div className="mt-6">
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="description"
                        rows={6}
                        placeholder="Descreva os detalhes da ordem de serviço..."
                        value={formData.workOrder.description}
                        onChange={(e) => handleWorkOrderChange("description", e.target.value)}
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                    />
                </div>
            </section>

            {/* Ações */}
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    className="w-full rounded-xl border border-white/10 px-6 py-3 font-medium text-zinc-300 transition hover:bg-white/5 sm:w-auto"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 sm:w-auto"
                >
                    {mode === "edit"
                        ? "Atualizar Ordem de Serviço"
                        : "Salvar Ordem de Serviço"}
                </button>
            </div>
        </form>
    );
}