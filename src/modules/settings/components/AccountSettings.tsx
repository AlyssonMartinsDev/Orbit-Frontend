import {
    ShieldCheck,
    UserRound,
    Mail,
    LockKeyhole,
    KeyRound,
    Save,
} from "lucide-react";

export function AccountSettings() {
    return (
        <section className="space-y-6">
            {/* =========================================================
          HEADER
      ========================================================= */}
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
                    <ShieldCheck size={20} strokeWidth={1.8} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-[#f8fafc]">
                        Conta e segurança
                    </h2>

                    <p className="mt-0.5 text-sm text-[#8290a8]">
                        Gerencie seus dados pessoais e as configurações de segurança.
                    </p>
                </div>
            </div>

            {/* =========================================================
          PROFILE CARD
      ========================================================= */}
            <div
                className="
          overflow-hidden
          rounded-2xl
          border border-[#16345c]/35
          bg-[#051020]/70
          shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        "
            >
                <div
                    className="
            flex items-center gap-3
            border-b border-[#16345c]/25
            px-6 py-5
          "
                >
                    <UserRound
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#3692ff]"
                    />

                    <div>
                        <h3 className="text-sm font-semibold text-[#f8fafc]">
                            Dados da conta
                        </h3>

                        <p className="mt-1 text-xs text-[#56657d]">
                            Informações utilizadas para identificar sua conta no Orbit.
                        </p>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div
                            className="
                flex h-16 w-16 items-center justify-center
                rounded-2xl
                border border-[#2583ff]/20
                bg-[#07182d]
                text-xl font-semibold
                text-[#3692ff]
                shadow-[0_0_24px_rgba(37,131,255,0.08)]
              "
                        >
                            AM
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#f8fafc]">
                                Foto do perfil
                            </p>

                            <p className="mt-1 text-xs text-[#56657d]">
                                A personalização da imagem poderá ser adicionada futuramente.
                            </p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="account-name"
                                className="mb-2 block text-xs font-medium text-[#a7b4c8]"
                            >
                                Nome
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={16}
                                    strokeWidth={1.8}
                                    className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    text-[#56657d]
                  "
                                />

                                <input
                                    id="account-name"
                                    type="text"
                                    placeholder="Seu nome"
                                    className="
                    w-full
                    rounded-xl
                    border border-[#16345c]/40
                    bg-[#010b1b]/55
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    text-[#f8fafc]
                    outline-none
                    transition-all duration-200
                    placeholder:text-[#56657d]
                    focus:border-[#2583ff]/55
                    focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                  "
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="account-email"
                                className="mb-2 block text-xs font-medium text-[#a7b4c8]"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail
                                    size={16}
                                    strokeWidth={1.8}
                                    className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    text-[#56657d]
                  "
                                />

                                <input
                                    id="account-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="
                    w-full
                    rounded-xl
                    border border-[#16345c]/40
                    bg-[#010b1b]/55
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    text-[#f8fafc]
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="
                flex items-center gap-2
                rounded-xl
                border border-[#2583ff]/25
                bg-[#2583ff]
                px-4 py-2.5
                text-sm font-medium
                text-white
                shadow-[0_0_22px_rgba(37,131,255,0.16)]
                transition-all duration-200
                hover:bg-[#3692ff]
                hover:shadow-[0_0_28px_rgba(37,131,255,0.24)]
              "
                        >
                            <Save size={16} strokeWidth={1.8} />
                            Salvar alterações
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================================================
          SECURITY CARD
      ========================================================= */}
            <div
                className="
          overflow-hidden
          rounded-2xl
          border border-[#16345c]/35
          bg-[#051020]/70
          shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        "
            >
                <div
                    className="
            flex items-center gap-3
            border-b border-[#16345c]/25
            px-6 py-5
          "
                >
                    <LockKeyhole
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#3692ff]"
                    />

                    <div>
                        <h3 className="text-sm font-semibold text-[#f8fafc]">
                            Segurança
                        </h3>

                        <p className="mt-1 text-xs text-[#56657d]">
                            Atualize sua senha de acesso ao Orbit.
                        </p>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    <div>
                        <label
                            htmlFor="current-password"
                            className="mb-2 block text-xs font-medium text-[#a7b4c8]"
                        >
                            Senha atual
                        </label>

                        <div className="relative">
                            <KeyRound
                                size={16}
                                strokeWidth={1.8}
                                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-[#56657d]
                "
                            />

                            <input
                                id="current-password"
                                type="password"
                                placeholder="Digite sua senha atual"
                                className="
                  w-full
                  rounded-xl
                  border border-[#16345c]/40
                  bg-[#010b1b]/55
                  py-3
                  pl-10
                  pr-4
                  text-sm
                  text-[#f8fafc]
                  outline-none
                  transition-all duration-200
                  placeholder:text-[#56657d]
                  focus:border-[#2583ff]/55
                  focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                "
                            />
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="new-password"
                                className="mb-2 block text-xs font-medium text-[#a7b4c8]"
                            >
                                Nova senha
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={16}
                                    strokeWidth={1.8}
                                    className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    text-[#56657d]
                  "
                                />

                                <input
                                    id="new-password"
                                    type="password"
                                    placeholder="Digite a nova senha"
                                    className="
                    w-full
                    rounded-xl
                    border border-[#16345c]/40
                    bg-[#010b1b]/55
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    text-[#f8fafc]
                    outline-none
                    transition-all duration-200
                    placeholder:text-[#56657d]
                    focus:border-[#2583ff]/55
                    focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                  "
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="mb-2 block text-xs font-medium text-[#a7b4c8]"
                            >
                                Confirmar nova senha
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={16}
                                    strokeWidth={1.8}
                                    className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    text-[#56657d]
                  "
                                />

                                <input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirme a nova senha"
                                    className="
                    w-full
                    rounded-xl
                    border border-[#16345c]/40
                    bg-[#010b1b]/55
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    text-[#f8fafc]
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

                    {/* Password hint */}
                    <div
                        className="
              rounded-xl
              border border-[#16345c]/25
              bg-[#010b1b]/35
              px-4 py-3
            "
                    >
                        <p className="text-xs leading-relaxed text-[#56657d]">
                            Recomendamos utilizar uma senha forte, combinando letras,
                            números e caracteres especiais.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="
                flex items-center gap-2
                rounded-xl
                border border-[#2583ff]/25
                bg-[#0a2242]
                px-4 py-2.5
                text-sm font-medium
                text-[#3692ff]
                transition-all duration-200
                hover:bg-[#2583ff]
                hover:text-white
                hover:shadow-[0_0_24px_rgba(37,131,255,0.18)]
              "
                        >
                            <KeyRound size={16} strokeWidth={1.8} />
                            Alterar senha
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}