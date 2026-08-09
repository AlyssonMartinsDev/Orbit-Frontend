import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#09090B] text-white">

            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">

                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[180px]" />

                <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-700/20 blur-[180px]" />

            </div>

            {/* HEADER */}
            <header className="border-b border-white/10 backdrop-blur-sm">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>

                        <h1 className="text-3xl font-bold tracking-wide">
                            Orbit
                        </h1>

                        <p className="text-sm text-zinc-400">
                            Sistema de Gestão
                        </p>

                    </div>

                    <div className="flex items-center gap-4">

                        <Link
                            to="/login"
                            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                        >
                            Login
                        </Link>

                        <button
                            disabled
                            className="cursor-not-allowed rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-500"
                        >
                            Registrar
                        </button>

                    </div>

                </div>

            </header>

            {/* HERO */}

            <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                    ERP para Oficinas Mecânicas
                </span>

                <h2 className="mt-8 max-w-4xl text-5xl font-extrabold leading-tight lg:text-7xl">

                    Controle sua oficina
                    <br />

                    <span className="text-violet-400">
                        de qualquer lugar.
                    </span>

                </h2>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">

                    Gerencie clientes, ordens de serviço,
                    pagamentos e acompanhe os indicadores
                    da sua empresa em tempo real.

                </p>

                <div className="mt-12 flex flex-col gap-4 sm:flex-row">

                    <Link
                        to="/login"
                        className="rounded-2xl bg-violet-600 px-8 py-4 text-lg font-semibold transition hover:bg-violet-500"
                    >
                        Acessar Sistema
                    </Link>

                    <button
                        disabled
                        className="rounded-2xl border border-white/10 px-8 py-4 text-lg text-zinc-500"
                    >
                        Criar Conta
                    </button>

                </div>

            </main>

            {/* RECURSOS */}

            <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-3">

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl transition hover:border-violet-500/40">

                    <div className="text-4xl">
                        👥
                    </div>

                    <h3 className="mt-6 text-2xl font-bold">
                        Clientes
                    </h3>

                    <p className="mt-4 leading-7 text-zinc-400">
                        Cadastre clientes e mantenha todo
                        o histórico organizado.
                    </p>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl transition hover:border-violet-500/40">

                    <div className="text-4xl">
                        📋
                    </div>

                    <h3 className="mt-6 text-2xl font-bold">
                        Ordens de Serviço
                    </h3>

                    <p className="mt-4 leading-7 text-zinc-400">
                        Acompanhe todas as etapas dos
                        serviços executados.
                    </p>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl transition hover:border-violet-500/40">

                    <div className="text-4xl">
                        📊
                    </div>

                    <h3 className="mt-6 text-2xl font-bold">
                        Dashboard
                    </h3>

                    <p className="mt-4 leading-7 text-zinc-400">
                        Visualize indicadores e métricas
                        importantes da sua oficina.
                    </p>

                </div>

            </section>

            {/* ROADMAP */}

            <section className="mx-auto max-w-7xl px-6 pb-24">

                <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 to-transparent p-10">

                    <h2 className="text-3xl font-bold">
                        Em desenvolvimento
                    </h2>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl bg-white/5 p-5">
                            🚧 Financeiro
                        </div>

                        <div className="rounded-xl bg-white/5 p-5">
                            🚧 Agenda
                        </div>

                        <div className="rounded-xl bg-white/5 p-5">
                            🚧 Controle de Estoque
                        </div>

                        <div className="rounded-xl bg-white/5 p-5">
                            🚧 Aplicativo Mobile
                        </div>

                    </div>

                </div>

            </section>

            {/* FOOTER */}

            <footer className="border-t border-white/10">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row">

                    <p>
                        © 2026 Orbit. Todos os direitos reservados.
                    </p>

                    <p>
                        Desenvolvido por Alysson Martins
                    </p>

                </div>

            </footer>

        </div>
    );
}