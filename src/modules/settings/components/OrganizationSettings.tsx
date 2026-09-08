import { Building2, ImagePlus, Save } from "lucide-react";

export function OrganizationSettings() {
    return (
        <section className="space-y-6">
            {/* =========================================================
          HEADER
      ========================================================= */}
            <div>
                <div className="flex items-center gap-3">
                    <div
                        className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-[#2583ff]/15
              bg-[#2583ff]/10
              text-[#3692ff]
              shadow-[0_0_20px_rgba(37,131,255,0.08)]
            "
                    >
                        <Building2 size={20} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-[#f8fafc]">
                            Dados da organização
                        </h2>

                        <p className="mt-0.5 text-sm text-[#8290a8]">
                            Gerencie as informações da sua empresa.
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
          ORGANIZATION CARD
      ========================================================= */}
            <div
                className="
          rounded-2xl
          border border-[#16345c]/35
          bg-[#051020]/70
          p-6
          shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        "
            >
                {/* Logo */}
                <div className="mb-8 flex items-center gap-5">
                    <div
                        className="
              flex h-20 w-20 shrink-0 items-center justify-center
              rounded-2xl
              border border-dashed border-[#16345c]
              bg-[#010b1b]/60
              text-[#56657d]
            "
                    >
                        <ImagePlus size={24} strokeWidth={1.6} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-[#f8fafc]">
                            Logo da organização
                        </p>

                        <p className="mt-1 text-xs text-[#56657d]">
                            PNG ou JPG. Recomendado formato quadrado.
                        </p>

                        <button
                            type="button"
                            className="
                mt-3
                rounded-lg
                border border-[#16345c]/50
                bg-[#07182d]
                px-3 py-2
                text-xs font-medium
                text-[#8290a8]
                transition-all duration-200
                hover:border-[#2583ff]/30
                hover:text-[#f8fafc]
              "
                        >
                            Alterar logo
                        </button>
                    </div>
                </div>

                {/* =====================================================
            BASIC INFORMATION
        ===================================================== */}
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Nome da organização
                        </label>

                        <input
                            type="text"
                            placeholder="Nome da empresa"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Nome fantasia
                        </label>

                        <input
                            type="text"
                            placeholder="Nome fantasia"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Documento
                        </label>

                        <input
                            type="text"
                            placeholder="CNPJ / CPF"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Telefone
                        </label>

                        <input
                            type="text"
                            placeholder="(00) 00000-0000"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            E-mail
                        </label>

                        <input
                            type="email"
                            placeholder="empresa@email.com"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>
                </div>

                {/* =====================================================
            ADDRESS
        ===================================================== */}
                <div className="my-7 h-px bg-[#16345c]/25" />

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Endereço
                        </label>

                        <input
                            type="text"
                            placeholder="Rua, número, bairro"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                            Cidade
                        </label>

                        <input
                            type="text"
                            placeholder="Cidade"
                            className="
                w-full rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                px-4 py-3
                text-sm text-[#f8fafc]
                outline-none
                transition-all duration-200
                placeholder:text-[#56657d]
                focus:border-[#2583ff]/55
                focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
              "
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                                Estado
                            </label>

                            <input
                                type="text"
                                placeholder="PR"
                                maxLength={2}
                                className="
                  w-full rounded-xl
                  border border-[#16345c]/40
                  bg-[#010b1b]/55
                  px-4 py-3
                  text-sm text-[#f8fafc]
                  outline-none
                  transition-all duration-200
                  placeholder:text-[#56657d]
                  focus:border-[#2583ff]/55
                  focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                "
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                                CEP
                            </label>

                            <input
                                type="text"
                                placeholder="00000-000"
                                className="
                  w-full rounded-xl
                  border border-[#16345c]/40
                  bg-[#010b1b]/55
                  px-4 py-3
                  text-sm text-[#f8fafc]
                  outline-none
                  transition-all duration-200
                  placeholder:text-[#56657d]
                  focus:border-[#2583ff]/55
                  focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                "
                            />
                        </div>
                    </div>
                </div>

                {/* =====================================================
            USER LIMIT
        ===================================================== */}
                <div className="my-7 h-px bg-[#16345c]/25" />

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#a7b4c8]">
                        Limite de usuários
                    </label>

                    <input
                        type="number"
                        min={1}
                        placeholder="Sem limite"
                        className="
              max-w-xs
              rounded-xl
              border border-[#16345c]/40
              bg-[#010b1b]/55
              px-4 py-3
              text-sm text-[#f8fafc]
              outline-none
              transition-all duration-200
              placeholder:text-[#56657d]
              focus:border-[#2583ff]/55
              focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
            "
                    />

                    <p className="mt-2 text-xs text-[#56657d]">
                        Disponível apenas para administração global do Orbit.
                    </p>
                </div>

                {/* =====================================================
            ACTIONS
        ===================================================== */}
                <div className="mt-8 flex justify-end border-t border-[#16345c]/25 pt-6">
                    <button
                        type="button"
                        className="
              flex items-center gap-2
              rounded-xl
              border border-[#2583ff]/25
              bg-[#2583ff]
              px-5 py-3
              text-sm font-medium
              text-white
              shadow-[0_0_22px_rgba(37,131,255,0.18)]
              transition-all duration-200
              hover:bg-[#3692ff]
              hover:shadow-[0_0_28px_rgba(37,131,255,0.28)]
            "
                    >
                        <Save size={17} strokeWidth={1.8} />
                        Salvar alterações
                    </button>
                </div>
            </div>
        </section>
    );
}