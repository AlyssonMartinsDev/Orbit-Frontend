import {
    Search,
    UserPlus,
    Users,
    ShieldCheck,
    CircleCheck,
    CircleX,
    MoreVertical,
} from "lucide-react";

const mockUsers = [
    {
        id: 1,
        name: "Alysson Martins",
        email: "alysson@email.com",
        role: "ADMIN",
        active: true,
    },
    {
        id: 2,
        name: "Usuário Operacional",
        email: "usuario@email.com",
        role: "USER",
        active: true,
    },
    {
        id: 3,
        name: "Usuário Inativo",
        email: "inativo@email.com",
        role: "USER",
        active: false,
    },
];

export function UsersSettings() {
    return (
        <section className="space-y-6">
            {/* =========================================================
          HEADER
      ========================================================= */}
            <div className="flex items-start justify-between gap-4">
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
                        <Users size={20} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-[#f8fafc]">
                            Usuários
                        </h2>

                        <p className="mt-0.5 text-sm text-[#8290a8]">
                            Gerencie os usuários vinculados à sua organização.
                        </p>
                    </div>
                </div>

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
                    <UserPlus size={17} strokeWidth={1.8} />
                    Novo usuário
                </button>
            </div>

            {/* =========================================================
          SUMMARY
      ========================================================= */}
            <div className="grid gap-4 md:grid-cols-3">
                <div
                    className="
            rounded-2xl
            border border-[#16345c]/35
            bg-[#051020]/70
            p-5
          "
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#56657d]">
                        Usuários ativos
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">
                        2
                    </p>

                    <p className="mt-1 text-xs text-[#8290a8]">
                        de 5 disponíveis
                    </p>
                </div>

                <div
                    className="
            rounded-2xl
            border border-[#16345c]/35
            bg-[#051020]/70
            p-5
          "
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#56657d]">
                        Administradores
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">
                        1
                    </p>

                    <p className="mt-1 text-xs text-[#8290a8]">
                        com acesso administrativo
                    </p>
                </div>

                <div
                    className="
            rounded-2xl
            border border-[#16345c]/35
            bg-[#051020]/70
            p-5
          "
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#56657d]">
                        Limite da organização
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">
                        5
                    </p>

                    <p className="mt-1 text-xs text-[#8290a8]">
                        usuários ativos
                    </p>
                </div>
            </div>

            {/* =========================================================
          USERS CARD
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
                {/* Toolbar */}
                <div
                    className="
            flex flex-col gap-4
            border-b border-[#16345c]/25
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
                >
                    <div>
                        <h3 className="text-sm font-semibold text-[#f8fafc]">
                            Usuários da organização
                        </h3>

                        <p className="mt-1 text-xs text-[#56657d]">
                            Visualize e gerencie os acessos cadastrados.
                        </p>
                    </div>

                    {/* Busca apenas visual */}
                    <div className="relative w-full sm:w-72">
                        <Search
                            size={16}
                            strokeWidth={1.8}
                            className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-[#56657d]
              "
                        />

                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            className="
                w-full
                rounded-xl
                border border-[#16345c]/40
                bg-[#010b1b]/55
                py-2.5
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

                {/* =====================================================
            TABLE
        ===================================================== */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr
                                className="
                  border-b border-[#16345c]/25
                  bg-[#010b1b]/25
                "
                            >
                                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-[#56657d]">
                                    Usuário
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-[#56657d]">
                                    Perfil
                                </th>

                                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-[#56657d]">
                                    Status
                                </th>

                                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-[#56657d]">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {mockUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="
                    border-b border-[#16345c]/20
                    transition-colors duration-200
                    last:border-b-0
                    hover:bg-[#07182d]/45
                  "
                                >
                                    {/* Usuário */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-xl
                          border border-[#16345c]/40
                          bg-[#07182d]
                          text-sm font-semibold
                          text-[#3692ff]
                        "
                                            >
                                                {user.name.charAt(0)}
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-[#f8fafc]">
                                                    {user.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-[#56657d]">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-5 py-4">
                                        {user.role === "ADMIN" ? (
                                            <span
                                                className="
                          inline-flex items-center gap-1.5
                          rounded-lg
                          border border-[#2583ff]/20
                          bg-[#2583ff]/10
                          px-2.5 py-1.5
                          text-xs font-medium
                          text-[#3692ff]
                        "
                                            >
                                                <ShieldCheck size={14} strokeWidth={1.8} />
                                                Administrador
                                            </span>
                                        ) : (
                                            <span
                                                className="
                          inline-flex
                          rounded-lg
                          border border-[#16345c]/40
                          bg-[#07182d]
                          px-2.5 py-1.5
                          text-xs font-medium
                          text-[#8290a8]
                        "
                                            >
                                                Usuário
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        {user.active ? (
                                            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400">
                                                <CircleCheck size={15} strokeWidth={1.8} />
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#56657d]">
                                                <CircleX size={15} strokeWidth={1.8} />
                                                Inativo
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            className="
                        inline-flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        border border-transparent
                        text-[#56657d]
                        transition-all duration-200
                        hover:border-[#16345c]/40
                        hover:bg-[#07182d]
                        hover:text-[#f8fafc]
                      "
                                        >
                                            <MoreVertical size={18} strokeWidth={1.8} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}