import { Link, useRouteError } from "react-router-dom";

export function RouteErrorPage() {
    const error = useRouteError();
    console.error("Erro ao exibir a página:", error);
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#010b1b] p-5 text-white">
            <div className="max-w-md space-y-4 text-center">
                <h1 className="text-2xl font-semibold">
                    Não foi possível abrir esta página
                </h1>
                <p className="text-[#a7b4c8]">
                    Tente novamente. Se o problema continuar, retorne ao início.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="min-h-11 rounded-xl bg-blue-600 px-5"
                >
                    Recarregar
                </button>
                <Link to="/" className="block py-3 text-blue-300">
                    Voltar ao início
                </Link>
            </div>
        </main>
    );
}
