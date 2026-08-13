import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ClientService } from "../services/client.service";

import { useMessageStore } from "../../../shared/store/message.store";
import { useClientStore } from "../../../shared/store/client.store";

import type {
  ClientResponse,
  CreateClientRequest,
} from "../types/client.types";


interface ClientFormProps {
  mode?: "create" | "edit";
  client?: ClientResponse;
}


export function ClientForm({
  mode = "create",
  client,
}: ClientFormProps) {
  const navigate = useNavigate();

  const showMessage = useMessageStore(
    (state) => state.showMessage
  );

  const addClient = useClientStore(
    (state) => state.addClient
  );

  const updateClient = useClientStore(
    (state) => state.updateClient
  );

  const [formData, setFormData] =
    useState<CreateClientRequest>(() => ({
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      cpf: client?.cpf ?? "",
      notes: client?.notes ?? "",
    }));


  const handleChange = (
    field: keyof CreateClientRequest,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
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
        const response = error.response?.data;

        if (
          response &&
          typeof response === "object" &&
          "message" in response
        ) {
          const message = response.message;

          if (typeof message === "string") {
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


  return (
    <form
      className="space-y-8"
      onSubmit={handleSubmit}
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold text-white">
          {mode === "edit"
            ? "Editar Cliente"
            : "Informações do Cliente"}
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          {mode === "edit"
            ? "Altere as informações cadastradas do cliente."
            : "Preencha os dados para cadastrar um novo cliente."}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Nome */}
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
              required
              placeholder="Digite o nome completo"
              value={formData.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
            />
          </div>


          {/* Telefone */}
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
              required
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(event) =>
                handleChange(
                  "phone",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
            />
          </div>


          {/* Email */}
          <div>
            <label
              htmlFor="client_email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email
            </label>

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
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
            />
          </div>


          {/* CPF */}
          <div>
            <label
              htmlFor="client_cpf"
              className="mb-2 block text-sm font-medium text-zinc-300"
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
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
            />
          </div>

        </div>


        {/* Observações */}
        <div className="mt-6">
          <label
            htmlFor="client_notes"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Observações
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
            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
          />
        </div>
      </div>


      {/* Ações */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full rounded-xl border border-white/10 px-6 py-3 font-medium text-zinc-300 transition hover:bg-white/5 sm:w-auto"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 sm:w-auto"
        >
          {mode === "edit"
            ? "Salvar Alterações"
            : "Salvar Cliente"}
        </button>

      </div>
    </form>
  );
}