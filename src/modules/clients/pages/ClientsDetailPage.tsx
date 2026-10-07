import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardList,
    ExternalLink,
    FileText,
    Hash,
    Link as LinkIcon,
    Mail,
    Phone,
    Settings2,
    UserRound,
} from "lucide-react";

import { ClientService } from "../services/client.service";

import { useClientStore } from "../../../shared/store/client.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";

import { Loading } from "../../../shared/components/loading";
import { WhatsAppButton } from "../../../shared/buttons";

import type {
    CustomFieldDefinitionResponse,
} from "../../custom-fields/types/custom-field.types";


// ============================================================
// COMPONENTE
// ============================================================

export function ClientDetailsPage() {

    const { id } = useParams();

    const navigate = useNavigate();


    // ========================================================
    // CLIENTE SELECIONADO
    // ========================================================

    const selectedClient = useClientStore(
        (state) => state.selectedClient
    );

    const setSelectedClient = useClientStore(
        (state) => state.setSelectedClient
    );

    const clearSelectedClient = useClientStore(
        (state) => state.clearSelectedClient
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
    // CARREGAMENTO
    // ========================================================

    useEffect(() => {

        const loadClientDetails = async () => {

            if (!id) {
                return;
            }


            const response =
                await ClientService.getDetails(
                    Number(id)
                );


            if (
                !response.success ||
                !response.data
            ) {
                return;
            }


            setSelectedClient(
                response.data
            );
        };


        void loadClientDetails();

        void loadCustomFields();


        return () => {
            clearSelectedClient();
        };

    }, [
        id,
        setSelectedClient,
        clearSelectedClient,
        loadCustomFields,
    ]);


    // ========================================================
    // LOADING
    // ========================================================

    if (!selectedClient) {

        return (
            <Loading
                message="Carregando dados do cliente..."
            />
        );
    }


    // ========================================================
    // FORMATADORES
    // ========================================================

    const formatCurrency = (
        value: number
    ) => {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            }
        ).format(value);
    };


    const formatDate = (
        date: string
    ) => {

        return new Intl.DateTimeFormat(
            "pt-BR"
        ).format(
            new Date(date)
        );
    };


    const formatCustomDate = (
        date: string
    ) => {

        /*
         * Adicionamos o horário manualmente para evitar
         * alteração da data causada por timezone.
         *
         * Exemplo:
         * 2026-10-06 -> 06/10/2026
         */

        const parsedDate =
            new Date(`${date}T00:00:00`);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }


        return new Intl.DateTimeFormat(
            "pt-BR"
        ).format(parsedDate);
    };


    const formatPhone = (
        phone: string
    ) => {

        const digits =
            phone.replace(/\D/g, "");


        if (digits.length === 11) {

            return digits.replace(
                /(\d{2})(\d{5})(\d{4})/,
                "($1) $2-$3"
            );
        }


        if (digits.length === 10) {

            return digits.replace(
                /(\d{2})(\d{4})(\d{4})/,
                "($1) $2-$3"
            );
        }


        return phone;
    };


    // ========================================================
    // DEFINIÇÕES DE CUSTOM FIELD DO CLIENTE
    // ========================================================

    const clientCustomFields =
        customFields
            .filter(
                (customField) =>
                    customField.module === "CLIENT"
            )
            .sort(
                (a, b) =>
                    a.display_order -
                    b.display_order
            );


    // ========================================================
    // VALORES PERSONALIZADOS DO CLIENTE
    // ========================================================

    /*
     * O backend devolve no cliente:
     *
     * {
     *     field_definition_id: 5,
     *     value: "43999999999"
     * }
     *
     * Aqui relacionamos esse ID com a definição do campo
     * para descobrir nome, tipo e preset.
     */

    const customFieldItems =
        selectedClient.custom_values
            .map((customValue) => {

                const definition =
                    clientCustomFields.find(
                        (customField) =>
                            customField.id ===
                            customValue.field_definition_id
                    );


                if (!definition) {
                    return null;
                }


                return {
                    definition,
                    value:
                        customValue.value ?? "",
                };
            })
            .filter(
                (
                    item
                ): item is {
                    definition:
                    CustomFieldDefinitionResponse;
                    value: string;
                } => item !== null
            )
            .sort(
                (a, b) =>
                    a.definition.display_order -
                    b.definition.display_order
            );


    // ========================================================
    // ÍCONE DO CUSTOM FIELD
    // ========================================================

    const renderCustomFieldIcon = (
        definition:
            CustomFieldDefinitionResponse
    ) => {

        switch (
        definition.preset_type
        ) {

            case "WHATSAPP":
            case "PHONE":

                return (
                    <Phone
                        size={17}
                        strokeWidth={1.8}
                    />
                );


            case "EMAIL":

                return (
                    <Mail
                        size={17}
                        strokeWidth={1.8}
                    />
                );


            case "URL":

                return (
                    <LinkIcon
                        size={17}
                        strokeWidth={1.8}
                    />
                );
        }


        switch (
        definition.field_type
        ) {

            case "NUMBER":

                return (
                    <Hash
                        size={17}
                        strokeWidth={1.8}
                    />
                );


            case "DATE":

                return (
                    <CalendarDays
                        size={17}
                        strokeWidth={1.8}
                    />
                );


            case "BOOLEAN":

                return (
                    <CheckCircle2
                        size={17}
                        strokeWidth={1.8}
                    />
                );


            default:

                return (
                    <FileText
                        size={17}
                        strokeWidth={1.8}
                    />
                );
        }
    };


    // ========================================================
    // CONTEÚDO DO CUSTOM FIELD
    // ========================================================

    const renderCustomFieldValue = (
        definition:
            CustomFieldDefinitionResponse,
        value: string
    ) => {

        if (!value) {

            return (
                <span
                    className="
                        text-sm
                        text-[#56657d]
                    "
                >
                    Não informado
                </span>
            );
        }


        // ====================================================
        // WHATSAPP
        // ====================================================

        if (
            definition.preset_type ===
            "WHATSAPP"
        ) {

            return (
                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            text-sm
                            font-medium
                            text-[#f8fafc]
                        "
                    >
                        {formatPhone(value)}
                    </span>


                    {/*
                     * O botão usa o valor DESTE custom field.
                     *
                     * Portanto:
                     *
                     * WhatsApp financeiro -> número financeiro
                     * WhatsApp suporte    -> número suporte
                     *
                     * Não existe vínculo automático com
                     * selectedClient.phone.
                     */}

                    <WhatsAppButton
                        phone={value}
                    />

                </div>
            );
        }


        // ====================================================
        // TELEFONE
        // ====================================================

        if (
            definition.preset_type ===
            "PHONE"
        ) {

            return (
                <span
                    className="
                        text-sm
                        font-medium
                        text-[#f8fafc]
                    "
                >
                    {formatPhone(value)}
                </span>
            );
        }


        // ====================================================
        // EMAIL
        // ====================================================

        if (
            definition.preset_type ===
            "EMAIL"
        ) {

            return (
                <a
                    href={`mailto:${value}`}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        break-all
                        text-sm
                        font-medium
                        text-[#f8fafc]
                        transition-colors
                        hover:text-[#3692ff]
                    "
                >
                    {value}

                    <ExternalLink
                        size={14}
                        strokeWidth={1.8}
                    />
                </a>
            );
        }


        // ====================================================
        // URL
        // ====================================================

        if (
            definition.preset_type ===
            "URL"
        ) {

            const href =
                /^https?:\/\//i.test(value)
                    ? value
                    : `https://${value}`;


            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        break-all
                        text-sm
                        font-medium
                        text-[#f8fafc]
                        transition-colors
                        hover:text-[#3692ff]
                    "
                >
                    {value}

                    <ExternalLink
                        size={14}
                        strokeWidth={1.8}
                    />
                </a>
            );
        }


        // ====================================================
        // DATE
        // ====================================================

        if (
            definition.field_type ===
            "DATE"
        ) {

            return (
                <span
                    className="
                        text-sm
                        font-medium
                        text-[#f8fafc]
                    "
                >
                    {formatCustomDate(value)}
                </span>
            );
        }


        // ====================================================
        // BOOLEAN
        // ====================================================

        if (
            definition.field_type ===
            "BOOLEAN"
        ) {

            const active =
                value === "true";


            return (
                <span
                    className={`
                        inline-flex
                        rounded-lg
                        border
                        px-2.5
                        py-1
                        text-xs
                        font-medium

                        ${active
                            ? `
                                    border-emerald-400/20
                                    bg-emerald-400/10
                                    text-emerald-300
                                `
                            : `
                                    border-[#16345c]/35
                                    bg-[#07182d]/55
                                    text-[#8290a8]
                                `
                        }
                    `}
                >
                    {active
                        ? "Sim"
                        : "Não"}
                </span>
            );
        }


        // ====================================================
        // TEXT / NUMBER
        // ====================================================

        return (
            <span
                className="
                    break-words
                    text-sm
                    font-medium
                    text-[#f8fafc]
                "
            >
                {value}
            </span>
        );
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <section
            className="
                w-full
                rounded-2xl
                border border-[#16345c]/30
                bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.10),_transparent_30%),linear-gradient(135deg,_#051020_0%,_#010b1b_55%,_#031126_100%)]
                px-5 py-6
                shadow-[0_20px_60px_rgba(0,0,0,0.22)]
                sm:px-6
                lg:px-8
            "
        >

            {/* =================================================
                VOLTAR
            ================================================= */}

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                    mb-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border border-transparent
                    px-2 py-1.5
                    text-sm
                    font-medium
                    text-[#8290a8]
                    transition-all
                    duration-200

                    hover:border-[#16345c]/30
                    hover:bg-[#07182d]/55
                    hover:text-[#f8fafc]
                "
            >

                <ArrowLeft
                    size={17}
                    strokeWidth={1.8}
                />

                Voltar

            </button>


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="mb-8">

                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                            shadow-[0_0_20px_rgba(37,131,255,0.08)]
                        "
                    >
                        <UserRound
                            size={20}
                            strokeWidth={1.8}
                        />
                    </div>


                    <div>

                        <p
                            className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-[0.22em]
                                text-[#3692ff]
                            "
                        >
                            Cliente
                        </p>


                        <h1
                            className="
                                mt-1
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-[#f8fafc]
                                sm:text-4xl
                            "
                        >
                            {selectedClient.name}
                        </h1>

                    </div>

                </div>


                <p
                    className="
                        mt-3
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[#8290a8]
                        sm:text-base
                    "
                >
                    Informações, histórico e ordens de serviço vinculadas.
                </p>

            </header>


            {/* =================================================
                DADOS DO CLIENTE
            ================================================= */}

            <section
                className="
                    overflow-hidden
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b border-[#16345c]/25
                        px-5 py-5
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#2583ff]/15
                            bg-[#2583ff]/10
                            text-[#3692ff]
                        "
                    >
                        <UserRound
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
                            Dados do cliente
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Informações principais do cadastro.
                        </p>

                    </div>

                </div>


                <div className="p-5 sm:p-6">

                    <div
                        className="
                            grid
                            gap-4
                            md:grid-cols-2
                        "
                    >

                        {/* TELEFONE */}

                        <div
                            className="
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <Phone
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>


                            <div className="min-w-0">

                                <p
                                    className="
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    Telefone
                                </p>


                                <div
                                    className="
                                        mt-1
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-[#f8fafc]
                                        "
                                    >
                                        {formatPhone(
                                            selectedClient.phone
                                        )}
                                    </p>


                                    {/*
                                     * Mantemos o comportamento que
                                     * já existia no telefone principal.
                                     */}

                                    <WhatsAppButton
                                        phone={
                                            selectedClient.phone
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div
                            className="
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-[#2583ff]/10
                                    text-[#3692ff]
                                "
                            >
                                <Mail
                                    size={17}
                                    strokeWidth={1.8}
                                />
                            </div>


                            <div className="min-w-0">

                                <p
                                    className="
                                        text-xs
                                        text-[#56657d]
                                    "
                                >
                                    E-mail
                                </p>


                                {selectedClient.email ? (

                                    <a
                                        href={`mailto:${selectedClient.email}`}
                                        className="
                                            mt-1
                                            block
                                            truncate
                                            text-sm
                                            font-medium
                                            text-[#f8fafc]
                                            transition-colors
                                            hover:text-[#3692ff]
                                        "
                                    >
                                        {selectedClient.email}
                                    </a>

                                ) : (

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-[#56657d]
                                        "
                                    >
                                        Não informado
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* OBSERVAÇÕES */}

                    {selectedClient.notes && (

                        <div
                            className="
                                mt-4
                                rounded-xl
                                border border-[#16345c]/25
                                bg-[#010b1b]/35
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-[#56657d]
                                "
                            >
                                Observações
                            </p>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-[#a7b4c8]
                                "
                            >
                                {selectedClient.notes}
                            </p>

                        </div>
                    )}

                </div>

            </section>


            {/* =================================================
                CAMPOS PERSONALIZADOS
            ================================================= */}

            {customFieldItems.length > 0 && (

                <section
                    className="
                        mt-6
                        overflow-hidden
                        rounded-2xl
                        border border-[#16345c]/35
                        bg-[#051020]/70
                        shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            border-b border-[#16345c]/25
                            px-5 py-5
                            sm:px-6
                        "
                    >

                        <div
                            className="
                                flex
                                h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border border-[#2583ff]/15
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
                                Campos personalizados
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-[#8290a8]
                                "
                            >
                                Informações adicionais deste cliente.
                            </p>

                        </div>

                    </div>


                    {/* CAMPOS */}

                    <div className="p-5 sm:p-6">

                        <div
                            className="
                                grid
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            {customFieldItems.map(
                                ({
                                    definition,
                                    value,
                                }) => (

                                    <div
                                        key={
                                            definition.id
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-4
                                            rounded-xl
                                            border border-[#16345c]/25
                                            bg-[#010b1b]/35
                                            p-4
                                        "
                                    >

                                        {/* ÍCONE */}

                                        <div
                                            className="
                                                flex
                                                h-9 w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-[#2583ff]/10
                                                text-[#3692ff]
                                            "
                                        >
                                            {renderCustomFieldIcon(
                                                definition
                                            )}
                                        </div>


                                        {/* CONTEÚDO */}

                                        <div className="min-w-0">

                                            <p
                                                className="
                                                    text-xs
                                                    text-[#56657d]
                                                "
                                            >
                                                {
                                                    definition.name
                                                }
                                            </p>


                                            <div className="mt-1">

                                                {renderCustomFieldValue(
                                                    definition,
                                                    value
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </section>
            )}


            {/* =================================================
                RESUMO
            ================================================= */}

            <div
                className="
                    mt-6
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >

                {/* TOTAL */}

                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >

                    <div className="flex items-center justify-between">

                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Total de OS
                        </p>


                        <ClipboardList
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#56657d]"
                        />

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {
                            selectedClient.summary
                                .total_work_orders
                        }
                    </p>

                </div>


                {/* EM ABERTO */}

                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >

                    <div className="flex items-center justify-between">

                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Em aberto
                        </p>


                        <ClipboardList
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#3692ff]
                        "
                    >
                        {
                            selectedClient.summary
                                .open_work_orders
                        }
                    </p>

                </div>


                {/* FINALIZADAS */}

                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >

                    <div className="flex items-center justify-between">

                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Finalizadas
                        </p>


                        <ClipboardCheck
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {
                            selectedClient.summary
                                .finished_work_orders
                        }
                    </p>

                </div>


                {/* VALOR TOTAL */}

                <div
                    className="
                        rounded-2xl
                        border border-[#16345c]/30
                        bg-[#051020]/70
                        p-5
                    "
                >

                    <div className="flex items-center justify-between">

                        <p
                            className="
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Valor em serviços
                        </p>


                        <CircleDollarSign
                            size={17}
                            strokeWidth={1.8}
                            className="text-[#3692ff]"
                        />

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-semibold
                            text-[#f8fafc]
                        "
                    >
                        {formatCurrency(
                            selectedClient.summary
                                .total_services_value
                        )}
                    </p>

                </div>

            </div>


            {/* =================================================
                ORDENS DE SERVIÇO
            ================================================= */}

            <section
                className="
                    mt-6
                    overflow-hidden
                    rounded-2xl
                    border border-[#16345c]/35
                    bg-[#051020]/70
                    shadow-[0_16px_45px_rgba(0,0,0,0.14)]
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        border-b border-[#16345c]/25
                        px-5 py-5
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border border-[#2583ff]/15
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
                            Ordens de serviço
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
                        >
                            Histórico de serviços vinculados a este cliente.
                        </p>

                    </div>

                </div>


                {/* LISTA */}

                <div
                    className="
                        max-h-[520px]
                        overflow-y-auto
                        p-5
                        sm:p-6
                    "
                >

                    <div className="space-y-3">

                        {selectedClient.work_orders.length ? (

                            selectedClient.work_orders.map(
                                (workOrder) => (

                                    <div
                                        key={workOrder.id}
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-xl
                                            border border-[#16345c]/25
                                            bg-[#010b1b]/35
                                            p-4
                                            transition-all
                                            duration-200

                                            hover:border-[#2583ff]/20
                                            hover:bg-[#07182d]/45

                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        <div className="min-w-0">

                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {workOrder.title}
                                            </p>


                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-[#56657d]
                                                "
                                            >
                                                Criada em{" "}

                                                {formatDate(
                                                    workOrder.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-6
                                                sm:shrink-0
                                                sm:text-right
                                            "
                                        >

                                            <div>

                                                <p
                                                    className="
                                                        text-xs
                                                        font-medium
                                                        text-[#3692ff]
                                                    "
                                                >
                                                    {
                                                        workOrder.status_service
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        mt-1
                                                        text-xs
                                                        text-[#8290a8]
                                                    "
                                                >
                                                    {
                                                        workOrder.status_payment
                                                    }
                                                </p>

                                            </div>


                                            <p
                                                className="
                                                    font-semibold
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {formatCurrency(
                                                    workOrder.price
                                                )}
                                            </p>

                                        </div>

                                    </div>
                                )
                            )

                        ) : (

                            <div
                                className="
                                    flex
                                    min-h-36
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-dashed
                                    border-[#16345c]/40
                                    bg-[#010b1b]/25
                                    p-6
                                    text-center
                                "
                            >

                                <div>

                                    <ClipboardList
                                        size={24}
                                        strokeWidth={1.5}
                                        className="
                                            mx-auto
                                            text-[#56657d]
                                        "
                                    />


                                    <p
                                        className="
                                            mt-3
                                            text-sm
                                            text-[#8290a8]
                                        "
                                    >
                                        Nenhuma ordem de serviço vinculada a este cliente.
                                    </p>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

            </section>

        </section>
    );
}