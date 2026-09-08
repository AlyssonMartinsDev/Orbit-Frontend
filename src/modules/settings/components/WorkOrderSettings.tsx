import {
  ClipboardList,
  Hash,
  FileText,
  SlidersHorizontal,
  Settings2,
  ChevronRight,
} from "lucide-react";

const settingsSections = [
  {
    title: "Campos personalizados",
    description:
      "Configure campos adicionais que serão exibidos nas ordens de serviço.",
    icon: SlidersHorizontal,
  },
  {
    title: "Numeração das ordens",
    description:
      "Defina o padrão utilizado para identificação das ordens de serviço.",
    icon: Hash,
  },
  {
    title: "Configurações de PDF",
    description:
      "Personalize informações e preferências exibidas nos documentos gerados.",
    icon: FileText,
  },
];

export function WorkOrderSettings() {
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
          <ClipboardList size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#f8fafc]">
            Ordens de serviço
          </h2>

          <p className="mt-0.5 text-sm text-[#8290a8]">
            Configure o comportamento e as preferências das ordens de serviço.
          </p>
        </div>
      </div>

      {/* =========================================================
          MAIN CARD
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
        {/* Card Header */}
        <div
          className="
            flex items-center gap-3
            border-b border-[#16345c]/25
            px-6 py-5
          "
        >
          <Settings2
            size={18}
            strokeWidth={1.8}
            className="text-[#3692ff]"
          />

          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc]">
              Configurações gerais
            </h3>

            <p className="mt-1 text-xs text-[#56657d]">
              Selecione uma área para gerenciar as configurações.
            </p>
          </div>
        </div>

        {/* =====================================================
            SETTINGS SECTIONS
        ===================================================== */}
        <div className="divide-y divide-[#16345c]/20">
          {settingsSections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                type="button"
                key={section.title}
                className="
                  group
                  flex w-full items-center justify-between
                  gap-4
                  px-6 py-5
                  text-left
                  transition-all duration-200
                  hover:bg-[#07182d]/55
                "
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="
                      flex h-11 w-11 shrink-0 items-center justify-center
                      rounded-xl
                      border border-[#16345c]/40
                      bg-[#07182d]
                      text-[#8290a8]
                      transition-all duration-200
                      group-hover:border-[#2583ff]/25
                      group-hover:bg-[#0a2242]/70
                      group-hover:text-[#3692ff]
                    "
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  {/* Text */}
                  <div>
                    <p
                      className="
                        text-sm font-medium
                        text-[#f8fafc]
                      "
                    >
                      {section.title}
                    </p>

                    <p
                      className="
                        mt-1
                        max-w-xl
                        text-xs
                        leading-relaxed
                        text-[#56657d]
                      "
                    >
                      {section.description}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  strokeWidth={1.8}
                  className="
                    shrink-0
                    text-[#56657d]
                    transition-all duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#3692ff]
                  "
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          FUTURE AREA
      ========================================================= */}
      <div
        className="
          rounded-2xl
          border border-dashed border-[#16345c]/35
          bg-[#010b1b]/25
          px-6 py-5
        "
      >
        <p className="text-sm font-medium text-[#8290a8]">
          Mais configurações poderão ser adicionadas aqui futuramente.
        </p>

        <p className="mt-1 text-xs text-[#56657d]">
          Essa área foi pensada para permitir a evolução das ordens de serviço
          sem alterar a estrutura principal da página.
        </p>
      </div>
    </section>
  );
}