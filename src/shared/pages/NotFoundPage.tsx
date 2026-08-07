import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
            <div className="max-w-lg text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
                    Erro 404
                </p>

                <h1 className="mt-4 text-5xl font-bold sm:text-7xl">
                    Página não encontrada
                </h1>

                <p className="mt-6 text-sm leading-6 text-zinc-400 sm:text-base">
                    A rota que você tentou acessar não existe ou foi movida.
                </p>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold hover:bg-violet-500 sm:w-auto"
                >
                    Voltar para o Dashboard
                </button>
            </div>
        </main>
    );
}