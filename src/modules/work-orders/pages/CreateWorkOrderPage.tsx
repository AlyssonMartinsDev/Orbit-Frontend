import { WorkOrderForm } from "../components/WorkOrderForm";

export function CreateWorkOrderPage() {
  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400 sm:text-sm">
          Ordens de Serviço
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Criar Ordem de Serviço
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Cadastre uma nova ordem de serviço e vincule-a a um cliente.
        </p>
      </header>

      <div className="mt-8">
        <WorkOrderForm />
      </div>
    </section>
  );
}