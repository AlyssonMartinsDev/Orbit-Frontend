import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientService } from "../services/client.service";
import { useMessageStore } from "../../../shared/store/message.store"

import axios from "axios";
// Types
import type { CreateClientRequest } from "../types/client.types"






export function ClientForm() {
  const navigate = useNavigate();
  const showMessage = useMessageStore((state) => state.showMessage);

  const [formData, setFormData] = useState<CreateClientRequest>({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {


      const response = await ClientService.create(formData);
      console.log("Response from ClientService.create:", response); // Log the response for debugging

      if (!response.success) {
        showMessage(response.message, "error");
        return;
      }

      showMessage("Cliente criado com sucesso!", "success");
      navigate("/clients");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data;

        if (!response.success && response.message){
          showMessage(response.message, "error");
          return;
        }
      }
      showMessage("Erro desconhecido ao criar cliente.", "error");
    }
  }

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }





  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold text-white">
          Informações do Cliente
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Preencha os dados para cadastrar um novo cliente.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nome */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Nome
            </label>

            <input
              type="text"
              required
              placeholder="Digite o nome completo"
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Telefone
            </label>

            <input
              type="text"
              placeholder="(00) 00000-0000"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Email
            </label>

            <input
              type="email"
              placeholder="cliente@email.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* CPF */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              CPF
            </label>

            <input
              type="text"
              placeholder="000.000.000-00"
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
              value={formData.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Observações
          </label>

          <textarea
            rows={5}
            placeholder="Observações sobre o cliente..."
            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 outline-none transition focus:border-violet-500"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>
      </div>

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
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}