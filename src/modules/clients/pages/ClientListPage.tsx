import { Users } from "lucide-react";

import { ClientTable } from "../components/ClientTable";

export function ClientListPage() {
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
      {/* =========================================================
          HEADER
      ========================================================= */}
      <header>
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10 w-10
              items-center
              justify-center
              rounded-xl
              border border-[#2583ff]/15
              bg-[#2583ff]/10
              text-[#3692ff]
              shadow-[0_0_20px_rgba(37,131,255,0.08)]
            "
          >
            <Users
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
              Clientes
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
              Listagem de clientes
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
          Consulte, pesquise e gerencie todos os clientes cadastrados no Orbit.
        </p>
      </header>

      {/* =========================================================
          TABELA
      ========================================================= */}
      <div className="mt-8">
        <ClientTable />
      </div>
    </section>
  );
}