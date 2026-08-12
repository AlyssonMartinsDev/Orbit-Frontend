import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/auth.store";

// Message
import { useMessageStore } from "../../../shared/store/message.store";



export function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const showMessage = useMessageStore(
    (state) => state.showMessage
  )

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Funções 

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();


    try {
      const res = await login({
        email,
        password
      })

      console.log("res da login", res)

      if (!res.success) {
        showMessage(
          res.message,
          "error"
        )

        return
      }

      showMessage(
        res.message,
        "success"
      )

      navigate("/dashboard");

    } catch (error) {
      console.error("Erro inesperado na aplicação:", error);
      showMessage(
        "Erro inesperado na aplicação.",
        "error"
      )
      return 
    }



  }


  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Lado esquerdo */}
        <section className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_bottom_left,_rgba(98,0,255,0.35),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_30%),#050816] p-12">
          <div>
            <span className="text-sm font-medium tracking-[0.3em] text-violet-400 uppercase">
              Orbit
            </span>

            <div className="mt-16 max-w-xl">
              <h1 className="text-5xl font-bold leading-tight">
                Bem-vindo ao{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Orbit
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-zinc-300">
                Sua plataforma completa para gestão, automação e crescimento do
                seu negócio.
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-violet-300 text-lg">
              “Organize. Automatize. Escale.”
            </p>
            <p className="mt-2 text-zinc-400">Tudo em um só lugar.</p>
          </div>
        </section>

        {/* Lado direito */}
        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm lg:p-10">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Acesse sua conta
              </h2>
              <p className="mt-3 text-zinc-400">
                Entre com seu e-mail e senha para continuar.
              </p>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-200"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@email.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-200"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-3 text-base font-semibold text-white transition hover:opacity-90"

              >
                Entrar
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}