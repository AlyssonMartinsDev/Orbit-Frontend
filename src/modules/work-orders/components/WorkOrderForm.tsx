import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CalendarDays,
    CheckSquare,
    CircleDollarSign,
    ClipboardList,
    FileText,
    Hash,
    Link,
    Mail,
    Phone,
    Plus,
    Save,
    Settings2,
    UserRound,
    Users,
} from "lucide-react";

import { PhoneInput } from "../../../shared/components/inputs";

import { useClientStore } from "../../../shared/store/client.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";
import { useMessageStore } from "../../../shared/store/message.store";
import { useDashboardStore } from "../../../shared/store/dashboard.store";

import { WorkOrderService } from "../services/work-order.service";

import type {
    CreateWorkOrderRequest,
    WorkOrderResponse,
    WorkOrderStatus,
    PaymentStatus,
} from "../types/work-order.types";

import type {
    CustomFieldDefinitionResponse,
} from "../../custom-fields/types/custom-field.types";


// ============================================================
// PROPS
// ============================================================

interface WorkOrderFormProps {
    mode?: "create" | "edit";
    workOrder?: WorkOrderResponse;
}


// ============================================================
// ESTADO INTERNO
// ============================================================

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
        status_service: WorkOrderStatus;
        status_payment: PaymentStatus;
        price: number;
    };
}


type ClientMode =
    | "existing"
    | "new";


// ============================================================
// COMPONENTE
// ============================================================

export function WorkOrderForm({
    mode = "create",
    workOrder,
}: WorkOrderFormProps) {

    const navigate = useNavigate();


    // ========================================================
    // STORES
    // ========================================================

    const loadSummary = useDashboardStore(
        (state) => state.loadSummary
    );

    const showMessage = useMessageStore(
        (state) => state.showMessage
    );


    // ========================================================
    // CLIENTES
    // ========================================================

    const clients = useClientStore(
        (state) => state.clients
    );

    const loadClients = useClientStore(
        (state) => state.loadClients
    );


    // ========================================================
    // CUSTOM FIELDS
    // ========================================================

    const customFields = useCustomFieldStore(
        (state) => state.customFields
    );

    const loadCustomFields = useCustomFieldStore(
        (state) => state.loadCustomFields
    );


    // ========================================================
    // MODO DO CLIENTE
    // ========================================================

    const [clientMode, setClientMode] =
        useState<ClientMode>("existing");


    // ========================================================
    // ESTADO INICIAL
    // ========================================================

    const getInitialFormData =
        (): WorkOrderFormState => {

            if (
                mode === "edit" &&
                workOrder
            ) {

                return {
                    client: {
                        id:
                            workOrder.client.id,

                        name:
                            workOrder.client.name ??
                            "",

                        phone:
                            workOrder.client.phone ??
                            "",

                        email:
                            workOrder.client.email ??
                            "",

                        notes: "",
                    },

                    workOrder: {
                        title:
                            workOrder.title,

                        description:
                            workOrder.description ??
                            "",

                        status_service:
                            workOrder.status_service,

                        status_payment:
                            workOrder.status_payment,

                        price:
                            Number(
                                workOrder.price
                            ),
                    },
                };
            }


            return {
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
                    status_service:
                        "EM_ANDAMENTO",

                    status_payment:
                        "PENDENTE",

                    price: 0,
                },
            };
        };


    const [formData, setFormData] =
        useState<WorkOrderFormState>(
            getInitialFormData
        );


    // ========================================================
    // VALORES DOS CUSTOM FIELDS
    // ========================================================

    const [
        customFieldValues,
        setCustomFieldValues,
    ] = useState<
        Record<number, string>
    >(() => {

        // Na criação ainda não existem valores.

        if (
            mode !== "edit" ||
            !workOrder
        ) {
            return {};
        }


        /*
         * Na edição transformamos:
         *
         * [
         *   {
         *      field_definition: { id: 1 },
         *      value: "ABC"
         *   }
         * ]
         *
         * em:
         *
         * {
         *   1: "ABC"
         * }
         */

        return Object.fromEntries(
            workOrder.custom_values.map(
                (customValue) => [
                    customValue
                        .field_definition.id,

                    customValue.value ?? "",
                ]
            )
        );
    });


    // ========================================================
    // CARREGAMENTOS
    // ========================================================

    useEffect(() => {
        void loadClients();
    }, [loadClients]);


    useEffect(() => {
        void loadCustomFields();
    }, [loadCustomFields]);


    // ========================================================
    // CUSTOM FIELDS DA ORDEM DE SERVIÇO
    // ========================================================

    /*
     * Esta é a regra central da nova arquitetura.
     *
     * O WorkOrderForm somente conhece campos:
     *
     * module === "WORK_ORDER"
     *
     * Campos CLIENT nunca entram aqui.
     */

    const workOrderCustomFields =
        customFields
            .filter(
                (field) =>
                    field.module ===
                    "WORK_ORDER" &&
                    field.active
            )
            .sort(
                (a, b) =>
                    a.display_order -
                    b.display_order
            );


    // ========================================================
    // ALTERAÇÕES DO CLIENTE
    // ========================================================

    const handleClientChange = (
        field:
            keyof WorkOrderFormState["client"],

        value:
            WorkOrderFormState["client"][
            keyof WorkOrderFormState["client"]
            ]
    ) => {

        setFormData((prev) => ({
            ...prev,

            client: {
                ...prev.client,
                [field]: value,
            },
        }));
    };


    // ========================================================
    // ALTERAÇÕES DA OS
    // ========================================================

    const handleWorkOrderChange = (
        field:
            keyof CreateWorkOrderRequest[
            "work_order"
            ],

        value:
            CreateWorkOrderRequest[
            "work_order"
            ][
            keyof CreateWorkOrderRequest[
            "work_order"
            ]
            ]
    ) => {

        setFormData((prev) => ({
            ...prev,

            workOrder: {
                ...prev.workOrder,
                [field]: value,
            },
        }));
    };


    // ========================================================
    // ALTERAÇÃO DE CUSTOM FIELD
    // ========================================================

    const handleCustomFieldChange = (
        fieldId: number,
        value: string
    ) => {

        setCustomFieldValues(
            (current) => ({
                ...current,
                [fieldId]: value,
            })
        );
    };


    // ========================================================
    // CUSTOM VALUES PARA O BACKEND
    // ========================================================

    /*
     * Importante:
     *
     * usamos SOMENTE workOrderCustomFields.
     *
     * Portanto um Custom Field CLIENT nunca será enviado
     * junto com uma Ordem de Serviço.
     */

    const customValues =
        workOrderCustomFields.map(
            (field) => ({
                field_definition_id:
                    field.id,

                value:
                    customFieldValues[
                    field.id
                    ] ?? "",
            })
        );


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (
        event:
            React.SubmitEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        // ====================================================
        // CLIENTE
        // ====================================================

        const clientPayload =
            clientMode === "existing"

                ? {
                    id: Number(
                        formData.client.id
                    ),
                }

                : {
                    name:
                        formData.client.name
                            .trim(),

                    phone:
                        formData.client.phone
                            .trim(),

                    email:
                        formData.client.email
                            .trim() ||
                        undefined,

                    notes:
                        formData.client.notes
                            .trim() ||
                        undefined,
                };


        // ====================================================
        // ORDEM DE SERVIÇO
        // ====================================================

        const workOrderPayload = {

            title:
                formData.workOrder.title
                    .trim(),

            description:
                formData.workOrder.description
                    .trim() ||
                undefined,

            status_service:
                formData.workOrder
                    .status_service,

            status_payment:
                formData.workOrder
                    .status_payment,

            price:
                formData.workOrder.price,
        };


        // ====================================================
        // PAYLOAD COMPLETO
        // ====================================================

        const payload: any = {

            client:
                clientPayload,

            work_order:
                workOrderPayload,

            ...(customValues.length > 0 && {
                custom_values: {
                    values:
                        customValues,
                },
            }),
        };


        // ====================================================
        // CREATE / UPDATE
        // ====================================================

        const response =
            mode === "edit" &&
                workOrder

                ? await WorkOrderService.update(
                    workOrder.id,
                    workOrderPayload
                )

                : await WorkOrderService.create(
                    payload
                );


        if (!response.success) {

            showMessage(
                response.message,
                "error"
            );

            return;
        }


        showMessage(
            mode === "edit"
                ? "Ordem de serviço atualizada com sucesso!"
                : "Ordem de serviço criada com sucesso!",
            "success"
        );


        await loadSummary(true);

        navigate("/dashboard");
    };


    // ========================================================
    // CLASSES VISUAIS
    // ========================================================

    const inputClass = `
        w-full
        rounded-xl
        border border-[#16345c]/40
        bg-[#010b1b]/55
        px-4 py-3
        text-sm
        text-[#f8fafc]
        outline-none
        transition-all
        duration-200
        placeholder:text-[#56657d]
        focus:border-[#2583ff]/55
        focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
    `;


    const labelClass = `
        mb-2
        block
        text-sm
        font-medium
        text-[#a7b4c8]
    `;


    const sectionClass = `
        overflow-hidden
        rounded-2xl
        border border-[#16345c]/35
        bg-[#051020]/70
        shadow-[0_16px_45px_rgba(0,0,0,0.14)]
    `;


    // ========================================================
    // RENDER DO INPUT PERSONALIZADO
    // ========================================================

    const renderCustomFieldInput = (
        field:
            CustomFieldDefinitionResponse
    ) => {

        const value =
            customFieldValues[
            field.id
            ] ?? "";


        // ====================================================
        // PRESET: WHATSAPP
        // ====================================================

        /*
         * O preset WHATSAPP determina o comportamento.
         *
         * No formulário:
         * -> entrada de telefone
         *
         * Na tela de detalhes:
         * -> número + botão WhatsApp clicável
         */

        if (
            field.preset_type ===
            "WHATSAPP"
        ) {

            return (
                <div className="relative">

                    <Phone
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            z-10
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <PhoneInput
                        id={`custom_field_${field.id}`}
                        required={
                            field.required
                        }
                        value={value}
                        onChange={(
                            newValue
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                newValue
                            )
                        }
                        placeholder={
                            field.placeholder ??
                            "(00) 00000-0000"
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // PRESET: PHONE
        // ====================================================

        if (
            field.preset_type ===
            "PHONE"
        ) {

            return (
                <div className="relative">

                    <Phone
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            z-10
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <PhoneInput
                        id={`custom_field_${field.id}`}
                        required={
                            field.required
                        }
                        value={value}
                        onChange={(
                            newValue
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                newValue
                            )
                        }
                        placeholder={
                            field.placeholder ??
                            "(00) 00000-0000"
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // PRESET: EMAIL
        // ====================================================

        if (
            field.preset_type ===
            "EMAIL"
        ) {

            return (
                <div className="relative">

                    <Mail
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <input
                        id={`custom_field_${field.id}`}
                        type="email"
                        required={
                            field.required
                        }
                        placeholder={
                            field.placeholder ??
                            "email@exemplo.com"
                        }
                        value={value}
                        onChange={(
                            event
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                event.target.value
                            )
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // PRESET: URL
        // ====================================================

        if (
            field.preset_type ===
            "URL"
        ) {

            return (
                <div className="relative">

                    <Link
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <input
                        id={`custom_field_${field.id}`}
                        type="url"
                        required={
                            field.required
                        }
                        placeholder={
                            field.placeholder ??
                            "https://..."
                        }
                        value={value}
                        onChange={(
                            event
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                event.target.value
                            )
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // CAMPO COMUM: NUMBER
        // ====================================================

        if (
            field.field_type ===
            "NUMBER"
        ) {

            return (
                <div className="relative">

                    <Hash
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <input
                        id={`custom_field_${field.id}`}
                        type="number"
                        required={
                            field.required
                        }
                        placeholder={
                            field.placeholder ??
                            ""
                        }
                        value={value}
                        onChange={(
                            event
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                event.target.value
                            )
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // CAMPO COMUM: DATE
        // ====================================================

        if (
            field.field_type ===
            "DATE"
        ) {

            return (
                <div className="relative">

                    <CalendarDays
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <input
                        id={`custom_field_${field.id}`}
                        type="date"
                        required={
                            field.required
                        }
                        value={value}
                        onChange={(
                            event
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                event.target.value
                            )
                        }
                        className={`${inputClass} pl-11`}
                    />

                </div>
            );
        }


        // ====================================================
        // CAMPO COMUM: BOOLEAN
        // ====================================================

        if (
            field.field_type ===
            "BOOLEAN"
        ) {

            return (
                <div className="relative">

                    <CheckSquare
                        size={17}
                        strokeWidth={1.8}
                        className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                        "
                    />

                    <select
                        id={`custom_field_${field.id}`}
                        required={
                            field.required
                        }
                        value={value}
                        onChange={(
                            event
                        ) =>
                            handleCustomFieldChange(
                                field.id,
                                event.target.value
                            )
                        }
                        className={`${inputClass} pl-11`}
                    >

                        <option value="">
                            Selecione
                        </option>

                        <option value="true">
                            Sim
                        </option>

                        <option value="false">
                            Não
                        </option>

                    </select>

                </div>
            );
        }


        // ====================================================
        // CAMPO COMUM: TEXT
        // ====================================================

        return (
            <input
                id={`custom_field_${field.id}`}
                type="text"
                required={
                    field.required
                }
                placeholder={
                    field.placeholder ??
                    ""
                }
                value={value}
                onChange={(
                    event
                ) =>
                    handleCustomFieldChange(
                        field.id,
                        event.target.value
                    )
                }
                className={
                    inputClass
                }
            />
        );
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <form
            className="space-y-6"
            onSubmit={handleSubmit}
        >

            {/* =================================================
                CLIENTE
            ================================================= */}

            <section
                className={
                    sectionClass
                }
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-[#16345c]/25
                        px-5
                        py-5
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <Users
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>


                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Cliente
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Selecione um cliente cadastrado ou cadastre um novo durante a criação da ordem de serviço.
                        </p>

                    </div>

                </div>


                {/* CONTEÚDO */}

                <div className="p-5 sm:p-6">

                    {/* SELETOR DE MODO */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-1.5
                            rounded-xl
                            border
                            border-[#16345c]/25
                            bg-[#010b1b]/45
                            p-1
                            sm:grid-cols-2
                        "
                    >

                        {/* EXISTENTE */}

                        <button
                            type="button"
                            onClick={() =>
                                setClientMode(
                                    "existing"
                                )
                            }
                            className={`
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                px-4
                                py-3
                                text-sm
                                font-medium
                                transition-all
                                duration-200

                                ${clientMode ===
                                    "existing"

                                    ? `
                                            bg-[#0a2242]
                                            text-[#f8fafc]
                                            shadow-[0_0_18px_rgba(37,131,255,0.10)]
                                        `

                                    : `
                                            text-[#8290a8]
                                            hover:bg-[#07182d]/60
                                            hover:text-[#f8fafc]
                                        `
                                }
                            `}
                        >

                            <UserRound
                                size={16}
                                strokeWidth={1.8}
                                className={
                                    clientMode ===
                                        "existing"

                                        ? "text-[#3692ff]"

                                        : "text-[#56657d]"
                                }
                            />

                            Cliente cadastrado

                        </button>


                        {/* NOVO */}

                        <button
                            type="button"
                            onClick={() =>
                                setClientMode(
                                    "new"
                                )
                            }
                            className={`
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                px-4
                                py-3
                                text-sm
                                font-medium
                                transition-all
                                duration-200

                                ${clientMode ===
                                    "new"

                                    ? `
                                            bg-[#0a2242]
                                            text-[#f8fafc]
                                            shadow-[0_0_18px_rgba(37,131,255,0.10)]
                                        `

                                    : `
                                            text-[#8290a8]
                                            hover:bg-[#07182d]/60
                                            hover:text-[#f8fafc]
                                        `
                                }
                            `}
                        >

                            <Plus
                                size={16}
                                strokeWidth={1.8}
                                className={
                                    clientMode ===
                                        "new"

                                        ? "text-[#3692ff]"

                                        : "text-[#56657d]"
                                }
                            />

                            Cadastrar novo cliente

                        </button>

                    </div>


                    {/* CLIENTE EXISTENTE */}

                    {clientMode ===
                        "existing" && (

                            <div className="mt-6">

                                <label
                                    htmlFor="client_id"
                                    className={
                                        labelClass
                                    }
                                >
                                    Cliente cadastrado
                                </label>


                                <select
                                    id="client_id"
                                    required
                                    value={
                                        formData.client
                                            .id ?? ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleClientChange(
                                            "id",
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                >

                                    <option
                                        value=""
                                        disabled
                                    >
                                        Selecione um cliente
                                    </option>


                                    {clients.map(
                                        (
                                            client
                                        ) => (

                                            <option
                                                key={
                                                    client.id
                                                }
                                                value={
                                                    client.id
                                                }
                                            >
                                                {
                                                    client.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>


                                <p
                                    className="
                                    mt-2
                                    text-xs
                                    text-[#56657d]
                                "
                                >
                                    Selecione o cliente responsável pela ordem de serviço.
                                </p>

                            </div>
                        )}


                    {/* NOVO CLIENTE */}

                    {clientMode ===
                        "new" && (

                            <div
                                className="
                                mt-6
                                grid
                                grid-cols-1
                                gap-5
                                md:grid-cols-2
                            "
                            >

                                {/* NOME */}

                                <div>

                                    <label
                                        htmlFor="client_name"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Nome
                                    </label>


                                    <input
                                        id="client_name"
                                        type="text"
                                        required
                                        value={
                                            formData.client
                                                .name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleClientChange(
                                                "name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Nome completo ou razão social"
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>


                                {/* TELEFONE */}

                                <div>

                                    <label
                                        htmlFor="client_phone"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Telefone
                                    </label>


                                    <PhoneInput
                                        id="client_phone"
                                        required
                                        value={
                                            formData.client
                                                .phone
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleClientChange(
                                                "phone",
                                                value
                                            )
                                        }
                                        placeholder="(00) 00000-0000"
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>


                                {/* EMAIL */}

                                <div>

                                    <label
                                        htmlFor="client_email"
                                        className={
                                            labelClass
                                        }
                                    >
                                        E-mail
                                    </label>


                                    <input
                                        id="client_email"
                                        type="email"
                                        value={
                                            formData.client
                                                .email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleClientChange(
                                                "email",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="cliente@email.com"
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>


                                {/* OBSERVAÇÕES */}

                                <div>

                                    <label
                                        htmlFor="client_notes"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Observações do cliente
                                    </label>


                                    <input
                                        id="client_notes"
                                        type="text"
                                        value={
                                            formData.client
                                                .notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleClientChange(
                                                "notes",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Informações adicionais"
                                        className={
                                            inputClass
                                        }
                                    />

                                </div>

                            </div>
                        )}

                </div>

            </section>


            {/* =================================================
                INFORMAÇÕES DA OS
            ================================================= */}

            <section
                className={
                    sectionClass
                }
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-[#16345c]/25
                        px-5
                        py-5
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <ClipboardList
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>


                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Informações da ordem
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Preencha os dados principais da ordem de serviço.
                        </p>

                    </div>

                </div>


                {/* CAMPOS */}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        p-5
                        sm:p-6
                        md:grid-cols-2
                    "
                >

                    {/* TÍTULO */}

                    <div className="md:col-span-2">

                        <label
                            htmlFor="title"
                            className={
                                labelClass
                            }
                        >
                            Título
                        </label>


                        <input
                            id="title"
                            required
                            type="text"
                            placeholder="Ex.: Instalação Volvo TechTool"
                            value={
                                formData.workOrder
                                    .title
                            }
                            onChange={(
                                event
                            ) =>
                                handleWorkOrderChange(
                                    "title",
                                    event.target
                                        .value
                                )
                            }
                            className={
                                inputClass
                            }
                        />

                    </div>


                    {/* STATUS SERVIÇO */}

                    <div>

                        <label
                            htmlFor="status_service"
                            className={
                                labelClass
                            }
                        >
                            Status do serviço
                        </label>


                        <select
                            id="status_service"
                            required
                            value={
                                formData.workOrder
                                    .status_service
                            }
                            onChange={(
                                event
                            ) =>
                                handleWorkOrderChange(
                                    "status_service",
                                    event.target
                                        .value
                                )
                            }
                            className={
                                inputClass
                            }
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


                    {/* STATUS PAGAMENTO */}

                    <div>

                        <label
                            htmlFor="status_payment"
                            className={
                                labelClass
                            }
                        >
                            Status do pagamento
                        </label>


                        <select
                            id="status_payment"
                            required
                            value={
                                formData.workOrder
                                    .status_payment
                            }
                            onChange={(
                                event
                            ) =>
                                handleWorkOrderChange(
                                    "status_payment",
                                    event.target
                                        .value
                                )
                            }
                            className={
                                inputClass
                            }
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


                    {/* VALOR */}

                    <div className="md:col-span-2">

                        <label
                            htmlFor="price"
                            className={
                                labelClass
                            }
                        >
                            Valor
                        </label>


                        <div className="relative">

                            <CircleDollarSign
                                size={17}
                                strokeWidth={1.8}
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-[#56657d]
                                "
                            />


                            <input
                                id="price"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                value={
                                    formData
                                        .workOrder
                                        .price
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleWorkOrderChange(
                                        "price",
                                        parseFloat(
                                            event
                                                .target
                                                .value
                                        ) || 0
                                    )
                                }
                                className={`${inputClass} pl-11`}
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                DESCRIÇÃO
            ================================================= */}

            <section
                className={
                    sectionClass
                }
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-[#16345c]/25
                        px-5
                        py-5
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <FileText
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>


                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-[#f8fafc]
                            "
                        >
                            Descrição do serviço
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Informe os detalhes do serviço que será realizado.
                        </p>

                    </div>

                </div>


                <div className="p-5 sm:p-6">

                    <label
                        htmlFor="description"
                        className={
                            labelClass
                        }
                    >
                        Descrição
                    </label>


                    <textarea
                        id="description"
                        rows={6}
                        placeholder="Descreva os detalhes da ordem de serviço..."
                        value={
                            formData.workOrder
                                .description
                        }
                        onChange={(
                            event
                        ) =>
                            handleWorkOrderChange(
                                "description",
                                event.target
                                    .value
                            )
                        }
                        className={`
                            ${inputClass}
                            resize-none
                        `}
                    />

                </div>

            </section>


            {/* =================================================
                CAMPOS PERSONALIZADOS DA OS
            ================================================= */}

            {workOrderCustomFields.length >
                0 && (

                    <section
                        className={
                            sectionClass
                        }
                    >

                        {/* HEADER */}

                        <div
                            className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-[#16345c]/25
                            px-5
                            py-5
                            sm:px-6
                        "
                        >

                            <div
                                className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-[#2583ff]/15
                                bg-[#2583ff]/10
                                text-[#3692ff]
                            "
                            >
                                <Settings2
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </div>


                            <div>

                                <h2
                                    className="
                                    text-lg
                                    font-semibold
                                    text-[#f8fafc]
                                "
                                >
                                    Dados complementares
                                </h2>


                                <p
                                    className="
                                    mt-1
                                    text-sm
                                    text-[#8290a8]
                                "
                                >
                                    Preencha as informações adicionais da ordem de serviço.
                                </p>

                            </div>

                        </div>


                        {/* CAMPOS */}

                        <div
                            className="
                            grid
                            grid-cols-1
                            gap-5
                            p-5
                            sm:p-6
                            md:grid-cols-2
                        "
                        >

                            {workOrderCustomFields.map(
                                (field) => (

                                    <div
                                        key={
                                            field.id
                                        }
                                    >

                                        <label
                                            htmlFor={`custom_field_${field.id}`}
                                            className={
                                                labelClass
                                            }
                                        >

                                            {field.name}


                                            {field.required && (

                                                <span
                                                    className="
                                                    ml-1
                                                    text-[#3692ff]
                                                "
                                                >
                                                    *
                                                </span>
                                            )}

                                        </label>


                                        {renderCustomFieldInput(
                                            field
                                        )}

                                    </div>
                                )
                            )}

                        </div>

                    </section>
                )}


            {/* =================================================
                AÇÕES
            ================================================= */}

            <div
                className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t
                    border-[#16345c]/25
                    pt-6
                    sm:flex-row
                    sm:justify-end
                "
            >

                {/* CANCELAR */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="
                        w-full
                        rounded-xl
                        border
                        border-[#16345c]/40
                        bg-[#07182d]/45
                        px-6
                        py-3
                        text-sm
                        font-medium
                        text-[#a7b4c8]
                        transition-all
                        duration-200

                        hover:border-[#2583ff]/20
                        hover:bg-[#0a2242]/60
                        hover:text-[#f8fafc]

                        sm:w-auto
                    "
                >
                    Cancelar
                </button>


                {/* SALVAR */}

                <button
                    type="submit"
                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[#2583ff]/25
                        bg-[#2583ff]
                        px-6
                        py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-[0_0_22px_rgba(37,131,255,0.18)]
                        transition-all
                        duration-200

                        hover:bg-[#3692ff]
                        hover:shadow-[0_0_30px_rgba(37,131,255,0.26)]

                        sm:w-auto
                    "
                >

                    <Save
                        size={17}
                        strokeWidth={1.8}
                    />


                    {mode === "edit"
                        ? "Atualizar Ordem de Serviço"
                        : "Salvar Ordem de Serviço"}

                </button>

            </div>

        </form>
    );
}