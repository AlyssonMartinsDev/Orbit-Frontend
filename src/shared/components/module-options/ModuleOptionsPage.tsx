import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import type { ModuleOptionsPageProps } from "./module-options.types";

export function ModuleOptionsPage({
  title,
  subtitle,
  options,
}: ModuleOptionsPageProps) {
  const navigate = useNavigate();

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
        <div className="flex items-center gap-2">
          <span
            className="
              h-2 w-2
              rounded-full
              bg-[#2583ff]
              shadow-[0_0_12px_rgba(37,131,255,0.8)]
            "
          />

          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.22em]
              text-[#3692ff]
            "
          >
            Módulo
          </p>
        </div>

        <h1
          className="
            mt-3
            text-3xl
            font-semibold
            tracking-tight
            text-[#f8fafc]
            sm:text-4xl
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-[#8290a8]
            sm:text-base
          "
        >
          {subtitle}
        </p>
      </header>

      {/* =========================================================
          OPTIONS
      ========================================================= */}
      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.path}
              type="button"
              onClick={() => navigate(option.path)}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border border-[#16345c]/35
                bg-[#051020]/75
                p-6
                text-left
                shadow-[0_14px_40px_rgba(0,0,0,0.16)]
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:border-[#2583ff]/30
                hover:bg-[#07182d]/80
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]
              "
            >
              {/* Glow decorativo */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-12
                  -top-12
                  h-32 w-32
                  rounded-full
                  bg-[#2583ff]/5
                  blur-3xl
                  transition-all
                  duration-300
                  group-hover:bg-[#2583ff]/12
                "
              />

              <div className="relative">
                {/* Topo */}
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex
                      h-12 w-12
                      items-center
                      justify-center
                      rounded-xl
                      border border-[#2583ff]/15
                      bg-[#2583ff]/10
                      text-[#3692ff]
                      shadow-[0_0_20px_rgba(37,131,255,0.08)]
                      transition-all
                      duration-200

                      group-hover:border-[#2583ff]/25
                      group-hover:bg-[#0a2242]
                      group-hover:shadow-[0_0_24px_rgba(37,131,255,0.14)]
                    "
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <div
                    className="
                      flex
                      h-9 w-9
                      items-center
                      justify-center
                      rounded-lg
                      border border-transparent
                      text-[#56657d]
                      transition-all
                      duration-200

                      group-hover:border-[#16345c]/40
                      group-hover:bg-[#07182d]
                      group-hover:text-[#3692ff]
                    "
                  >
                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.8}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </div>
                </div>

                {/* Conteúdo */}
                <h2
                  className="
                    mt-6
                    text-lg
                    font-semibold
                    text-[#f8fafc]
                    transition-colors
                    duration-200
                    group-hover:text-white
                  "
                >
                  {option.title}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#8290a8]
                  "
                >
                  {option.description}
                </p>

                {/* Rodapé visual */}
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-[#56657d]
                    transition-colors
                    duration-200
                    group-hover:text-[#3692ff]
                  "
                >
                  Acessar módulo
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}