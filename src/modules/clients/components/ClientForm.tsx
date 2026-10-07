import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
  CalendarDays,
  CheckSquare,
  FileText,
  Hash,
  Link,
  Mail,
  Phone,
  Save,
  Settings2,
  UserRound,
} from "lucide-react";

import { ClientService } from "../services/client.service";

import { PhoneInput } from "../../../shared/components/inputs";

import { useMessageStore } from "../../../shared/store/message.store";
import { useClientStore } from "../../../shared/store/client.store";
import { useCustomFieldStore } from "../../../shared/store/custom-field.store";

import type {
  ClientResponse,
  CreateClientRequest,
} from "../types/client.types";

import type {
  CustomFieldDefinitionResponse,
} from "../../custom-fields/types/custom-field.types";


// ============================================================
// PROPS
// ============================================================

interface ClientFormProps {
  mode?: "create" | "edit";
  client?: ClientResponse;
}


// ============================================================
// CAMPOS PRINCIPAIS DO CLIENTE
// ============================================================

type ClientMainField =
  | "name"
  | "phone"
  | "email"
  | "cpf"
  | "notes";


// ============================================================
// COMPONENTE
// ============================================================

export function ClientForm({
  mode = "create",
  client,
}: ClientFormProps) {

  const navigate = useNavigate();


  // ========================================================
  // STORES
  // ========================================================

  const showMessage = useMessageStore(
    (state) => state.showMessage
  );

  const addClient = useClientStore(
    (state) => state.addClient
  );

  const updateClient = useClientStore(
    (state) => state.updateClient
  );


  const customFields = useCustomFieldStore(
    (state) => state.customFields
  );

  const customFieldsLoading = useCustomFieldStore(
    (state) => state.isLoading
  );

  const loadCustomFields = useCustomFieldStore(
    (state) => state.loadCustomFields
  );


  // ========================================================
  // ESTADO DO FORMULÁRIO
  // ========================================================

  const [formData, setFormData] =
    useState<CreateClientRequest>(() => ({
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      cpf: client?.cpf ?? "",
      notes: client?.notes ?? "",

      custom_values:
        client?.custom_values?.map(
          (customValue) => ({
            field_definition_id:
              customValue.field_definition_id,

            value:
              customValue.value,
          })
        ) ?? [],
    }));


  // ========================================================
  // CARREGAMENTO DOS CUSTOM FIELDS
  // ========================================================

  useEffect(() => {
    void loadCustomFields();
  }, [loadCustomFields]);


  // ========================================================
  // CUSTOM FIELDS DO MÓDULO CLIENT
  // ========================================================

  /*
   * O store mantém todas as definições carregadas.
   *
   * Aqui o formulário exibe somente:
   *
   * - campos pertencentes a CLIENT
   * - campos ativos
   *
   * Isso garante que campos de Ordem de Serviço nunca
   * apareçam no cadastro de cliente.
   */

  const clientCustomFields =
    customFields
      .filter(
        (customField) =>
          customField.module === "CLIENT" &&
          customField.active
      )
      .sort(
        (a, b) =>
          a.display_order -
          b.display_order
      );


  // ========================================================
  // ALTERAÇÃO DOS CAMPOS PRINCIPAIS
  // ========================================================

  const handleChange = (
    field: ClientMainField,
    value: string
  ) => {

    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  // ========================================================
  // VALOR DE UM CUSTOM FIELD
  // ========================================================

  const getCustomFieldValue = (
    fieldDefinitionId: number
  ): string => {

    const customValue =
      formData.custom_values.find(
        (item) =>
          item.field_definition_id ===
          fieldDefinitionId
      );

    return customValue?.value ?? "";
  };


  // ========================================================
  // ALTERAÇÃO DE CUSTOM FIELD
  // ========================================================

  const handleCustomFieldChange = (
    fieldDefinitionId: number,
    value: string
  ) => {

    setFormData((prevData) => {

      const existingValue =
        prevData.custom_values.find(
          (item) =>
            item.field_definition_id ===
            fieldDefinitionId
        );


      // ------------------------------------------------
      // Atualiza um valor existente
      // ------------------------------------------------

      if (existingValue) {

        return {
          ...prevData,

          custom_values:
            prevData.custom_values.map(
              (item) =>
                item.field_definition_id ===
                  fieldDefinitionId
                  ? {
                    ...item,
                    value,
                  }
                  : item
            ),
        };
      }


      // ------------------------------------------------
      // Adiciona um novo valor
      // ------------------------------------------------

      return {
        ...prevData,

        custom_values: [
          ...prevData.custom_values,
          {
            field_definition_id:
              fieldDefinitionId,

            value,
          },
        ],
      };
    });
  };


  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    try {

      const response =
        mode === "edit" && client

          ? await ClientService.update(
            client.id,
            formData
          )

          : await ClientService.create(
            formData
          );


      if (!response.success) {

        showMessage(
          response.message,
          "error"
        );

        return;
      }


      if (!response.data) {

        showMessage(
          "A API não retornou os dados do cliente.",
          "error"
        );

        return;
      }


      if (mode === "edit") {

        updateClient(response.data);

        showMessage(
          "Cliente atualizado com sucesso!",
          "success"
        );

      } else {

        addClient(response.data);

        showMessage(
          "Cliente criado com sucesso!",
          "success"
        );
      }


      navigate("/clients");


    } catch (error: unknown) {

      if (axios.isAxiosError(error)) {

        const response =
          error.response?.data;


        if (
          response &&
          typeof response === "object" &&
          "message" in response
        ) {

          const message =
            response.message;


          if (
            typeof message === "string"
          ) {

            showMessage(
              message,
              "error"
            );

            return;
          }
        }
      }


      showMessage(
        mode === "edit"
          ? "Erro desconhecido ao atualizar cliente."
          : "Erro desconhecido ao criar cliente.",
        "error"
      );
    }
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


  // ========================================================
  // RENDERIZAÇÃO DE CUSTOM FIELD
  // ========================================================

  const renderCustomFieldInput = (
    customField: CustomFieldDefinitionResponse
  ) => {

    const value =
      getCustomFieldValue(
        customField.id
      );


    const commonProps = {
      id: `custom_field_${customField.id}`,
      required: customField.required,
    };


    // ====================================================
    // PRESET: WHATSAPP / TELEFONE
    // ====================================================

    if (
      customField.preset_type === "WHATSAPP" ||
      customField.preset_type === "PHONE"
    ) {

      return (
        <div className="relative">

          <Phone
            size={17}
            strokeWidth={1.8}
            className="
                            absolute
                            left-4
                            top-1/2
                            z-10
                            -translate-y-1/2
                            text-[#56657d]
                            pointer-events-none
                        "
          />

          <PhoneInput
            {...commonProps}
            placeholder={
              customField.placeholder ??
              "(00) 00000-0000"
            }
            value={value}
            onChange={(newValue) =>
              handleCustomFieldChange(
                customField.id,
                newValue
              )
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
      customField.preset_type === "EMAIL"
    ) {

      return (
        <div className="relative">

          <Mail
            size={17}
            strokeWidth={1.8}
            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                            pointer-events-none
                        "
          />

          <input
            {...commonProps}
            type="email"
            placeholder={
              customField.placeholder ??
              "cliente@email.com"
            }
            value={value}
            onChange={(event) =>
              handleCustomFieldChange(
                customField.id,
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
      customField.preset_type === "URL"
    ) {

      return (
        <div className="relative">

          <Link
            size={17}
            strokeWidth={1.8}
            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                            pointer-events-none
                        "
          />

          <input
            {...commonProps}
            type="url"
            placeholder={
              customField.placeholder ??
              "https://..."
            }
            value={value}
            onChange={(event) =>
              handleCustomFieldChange(
                customField.id,
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
      customField.field_type === "NUMBER"
    ) {

      return (
        <div className="relative">

          <Hash
            size={17}
            strokeWidth={1.8}
            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                            pointer-events-none
                        "
          />

          <input
            {...commonProps}
            type="number"
            placeholder={
              customField.placeholder ??
              "Digite um valor"
            }
            value={value}
            onChange={(event) =>
              handleCustomFieldChange(
                customField.id,
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
      customField.field_type === "DATE"
    ) {

      return (
        <div className="relative">

          <CalendarDays
            size={17}
            strokeWidth={1.8}
            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-[#56657d]
                            pointer-events-none
                        "
          />

          <input
            {...commonProps}
            type="date"
            value={value}
            onChange={(event) =>
              handleCustomFieldChange(
                customField.id,
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
      customField.field_type === "BOOLEAN"
    ) {

      const checked =
        value === "true";


      return (
        <label
          htmlFor={`custom_field_${customField.id}`}
          className="
                        flex
                        min-h-[46px]
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-xl
                        border border-[#16345c]/40
                        bg-[#010b1b]/55
                        px-4 py-3
                        transition-all
                        hover:border-[#2583ff]/30
                        hover:bg-[#07182d]/60
                    "
        >

          <input
            {...commonProps}
            type="checkbox"
            checked={checked}
            onChange={(event) =>
              handleCustomFieldChange(
                customField.id,
                event.target.checked
                  ? "true"
                  : "false"
              )
            }
            className="
                            h-4
                            w-4
                            accent-[#2583ff]
                        "
          />

          <CheckSquare
            size={17}
            strokeWidth={1.8}
            className="text-[#3692ff]"
          />

          <span
            className="
                            text-sm
                            text-[#a7b4c8]
                        "
          >
            {checked
              ? "Ativado"
              : "Desativado"}
          </span>

        </label>
      );
    }


    // ====================================================
    // CAMPO COMUM: TEXT
    // ====================================================

    return (
      <input
        {...commonProps}
        type="text"
        placeholder={
          customField.placeholder ??
          "Digite o valor"
        }
        value={value}
        onChange={(event) =>
          handleCustomFieldChange(
            customField.id,
            event.target.value
          )
        }
        className={inputClass}
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
                            shadow-[0_0_18px_rgba(37,131,255,0.08)]
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
              {mode === "edit"
                ? "Editar cliente"
                : "Informações do cliente"}
            </h2>


            <p
              className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
            >
              {mode === "edit"
                ? "Altere as informações cadastradas do cliente."
                : "Preencha os dados para cadastrar um novo cliente."}
            </p>

          </div>

        </div>


        {/* CAMPOS PRINCIPAIS */}

        <div className="p-5 sm:p-6">

          <div
            className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        "
          >

            {/* Nome */}

            <div>

              <label
                htmlFor="client_name"
                className={labelClass}
              >
                Nome
              </label>


              <div className="relative">

                <UserRound
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
                  id="client_name"
                  type="text"
                  required
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>


            {/* Telefone */}

            <div>

              <label
                htmlFor="client_phone"
                className={labelClass}
              >
                Telefone
              </label>


              <div className="relative">

                <Phone
                  size={17}
                  strokeWidth={1.8}
                  className="
                                        absolute
                                        left-4
                                        top-1/2
                                        z-10
                                        -translate-y-1/2
                                        text-[#56657d]
                                        pointer-events-none
                                    "
                />

                <PhoneInput
                  id="client_phone"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(value) =>
                    handleChange(
                      "phone",
                      value
                    )
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>


            {/* E-mail */}

            <div>

              <label
                htmlFor="client_email"
                className={labelClass}
              >
                E-mail
              </label>


              <div className="relative">

                <Mail
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
                  id="client_email"
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={formData.email ?? ""}
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>


            {/* CPF */}

            <div>

              <label
                htmlFor="client_cpf"
                className={labelClass}
              >
                CPF
              </label>

              <input
                id="client_cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf ?? ""}
                onChange={(event) =>
                  handleChange(
                    "cpf",
                    event.target.value
                  )
                }
                className={inputClass}
              />

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
                CAMPOS PERSONALIZADOS
            ================================================= */}

      {(clientCustomFields.length > 0 ||
        customFieldsLoading) && (

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
                  Informações adicionais configuradas para clientes.
                </p>

              </div>

            </div>


            {/* CAMPOS */}

            <div className="p-5 sm:p-6">

              {customFieldsLoading &&
                clientCustomFields.length === 0 ? (

                <p
                  className="
                                    text-sm
                                    text-[#8290a8]
                                "
                >
                  Carregando campos personalizados...
                </p>

              ) : (

                <div
                  className="
                                    grid
                                    grid-cols-1
                                    gap-5
                                    md:grid-cols-2
                                "
                >

                  {clientCustomFields.map(
                    (customField) => (

                      <div
                        key={customField.id}
                      >

                        <label
                          htmlFor={`custom_field_${customField.id}`}
                          className={labelClass}
                        >
                          {customField.name}

                          {customField.required && (
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
                          customField
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </section>
        )}


      {/* =================================================
                OBSERVAÇÕES
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
              Observações
            </h2>


            <p
              className="
                                mt-1
                                text-sm
                                text-[#8290a8]
                            "
            >
              Adicione informações complementares sobre o cliente.
            </p>

          </div>

        </div>


        {/* TEXTAREA */}

        <div className="p-5 sm:p-6">

          <label
            htmlFor="client_notes"
            className={labelClass}
          >
            Observações do cliente
          </label>


          <textarea
            id="client_notes"
            rows={5}
            placeholder="Observações sobre o cliente..."
            value={formData.notes ?? ""}
            onChange={(event) =>
              handleChange(
                "notes",
                event.target.value
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
                AÇÕES
            ================================================= */}

      <div
        className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t border-[#16345c]/25
                    pt-6
                    sm:flex-row
                    sm:justify-end
                "
      >

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
                        w-full
                        rounded-xl
                        border border-[#16345c]/40
                        bg-[#07182d]/45
                        px-6 py-3
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


        <button
          type="submit"
          className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border border-[#2583ff]/25
                        bg-[#2583ff]
                        px-6 py-3
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
            ? "Salvar alterações"
            : "Salvar cliente"}

        </button>

      </div>

    </form>
  );
}