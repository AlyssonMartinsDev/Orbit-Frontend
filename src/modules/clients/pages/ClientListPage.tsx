import { ClientTable } from "../components/ClientTable";

export function ClientListPage() {
  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
            Clientes
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Listagem de Clientes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Consulte, pesquise e gerencie todos os clientes cadastrados no Orbit.
          </p>
        </div>
      </header>

      <div className="mt-8">
        <ClientTable />
      </div>
    </section>
  );
}