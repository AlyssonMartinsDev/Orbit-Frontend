import { useNavigate } from "react-router-dom";

import type { ModuleOptionsPageProps } from "./module-options.types";

export function ModuleOptionsPage({
  title,
  subtitle,
  options,
}: ModuleOptionsPageProps) {
  const navigate = useNavigate();

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
          Módulo
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          {subtitle}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.path}
              onClick={() => navigate(option.path)}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl transition hover:border-violet-500/40 hover:bg-violet-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500/25">
                <Icon size={22} />
              </div>

              <h2 className="mt-6 text-xl font-semibold text-white">
                {option.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}