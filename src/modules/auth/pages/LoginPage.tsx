import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "../../../shared/store/auth.store";
import { useMessageStore } from "../../../shared/store/message.store";


export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const showMessage = useMessageStore(
    (state) => state.showMessage
  );

  const navigate = useNavigate();

  const login = useAuthStore(
    (state) => state.login
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );


  // ====================================================
  // LOGIN
  // ====================================================

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const res = await login({
        email,
        password,
      });

      console.log("res da login", res);

      if (!res.success) {
        showMessage(
          res.message,
          "error"
        );

        return;
      }

      showMessage(
        res.message,
        "success"
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Erro inesperado na aplicação:",
        error
      );

      showMessage(
        "Erro inesperado na aplicação.",
        "error"
      );
    }
  };


  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#010b1b]
        text-[#f8fafc]
      "
    >
      {/* =====================================================
          BACKGROUND GLOBAL
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-[-120px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#2583ff]/10
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-200px]
          right-[-100px]
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#2583ff]/8
          blur-[160px]
        "
      />


      {/* Grid */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
          [background-image:linear-gradient(#2583ff_1px,transparent_1px),linear-gradient(90deg,#2583ff_1px,transparent_1px)]
          [background-size:52px_52px]
        "
      />


      <div
        className="
          relative
          z-10
          grid
          min-h-screen
          grid-cols-1
          lg:grid-cols-[1.05fr_0.95fr]
        "
      >
        {/* =====================================================
            LADO ESQUERDO
        ===================================================== */}
        <section
          className="
            relative
            hidden
            overflow-hidden
            border-r
            border-[#16345c]/25
            lg:flex
            lg:flex-col
            lg:justify-between
            lg:p-12
            xl:p-16
          "
        >
          {/* Glow interno */}
          <div
            className="
              pointer-events-none
              absolute
              left-[-100px]
              top-[25%]
              h-[450px]
              w-[450px]
              rounded-full
              bg-[#2583ff]/10
              blur-[130px]
            "
          />


          {/* =================================================
              BRAND
          ================================================= */}
          <div className="relative z-10">
            <div
              className="
                inline-flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border border-[#2583ff]/20
                  bg-[#2583ff]/10
                  text-[#3692ff]
                  shadow-[0_0_28px_rgba(37,131,255,0.12)]
                "
              >
                <Orbit
                  size={24}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p
                  className="
                    text-lg
                    font-semibold
                    tracking-tight
                    text-[#f8fafc]
                  "
                >
                  Orbit
                </p>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.20em]
                    text-[#56657d]
                  "
                >
                  Gestão inteligente
                </p>
              </div>
            </div>


            {/* =================================================
                HERO
            ================================================= */}
            <div className="mt-24 max-w-2xl">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border border-[#2583ff]/20
                  bg-[#2583ff]/[0.07]
                  px-3
                  py-1.5
                "
              >
                <Sparkles
                  size={13}
                  className="text-[#3692ff]"
                />

                <span
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#3692ff]
                  "
                >
                  Orbit System
                </span>
              </div>


              <h1
                className="
                  mt-6
                  text-5xl
                  font-semibold
                  leading-[1.08]
                  tracking-tight
                  text-[#f8fafc]
                  xl:text-6xl
                "
              >
                Sua operação
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-[#3692ff]
                    to-[#2583ff]
                    bg-clip-text
                    text-transparent
                  "
                >
                  em uma única órbita.
                </span>
              </h1>


              <p
                className="
                  mt-6
                  max-w-xl
                  text-base
                  leading-7
                  text-[#8290a8]
                  xl:text-lg
                "
              >
                Gerencie clientes, ordens de serviço,
                processos e informações importantes
                do seu negócio em um ambiente centralizado.
              </p>
            </div>
          </div>


          {/* =================================================
              ELEMENTO ORBITAL
          ================================================= */}
          <div
            className="
              pointer-events-none
              absolute
              bottom-[115px]
              right-[40px]
              h-56
              w-56
              opacity-60
              xl:h-72
              xl:w-72
            "
          >
            <div
              className="
                absolute
                inset-0
                animate-[spin_22s_linear_infinite]
                rounded-full
                border border-[#2583ff]/15
              "
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-[-4px]
                  h-2
                  w-2
                  -translate-x-1/2
                  rounded-full
                  bg-[#3692ff]
                  shadow-[0_0_15px_rgba(54,146,255,0.9)]
                "
              />
            </div>

            <div
              className="
                absolute
                inset-8
                animate-[spin_14s_linear_infinite_reverse]
                rounded-full
                border
                border-dashed
                border-[#2583ff]/15
              "
            />

            <div
              className="
                absolute
                inset-[42%]
                rounded-full
                bg-[#2583ff]/50
                shadow-[0_0_40px_rgba(37,131,255,0.35)]
              "
            />
          </div>


          {/* =================================================
              FOOTER
          ================================================= */}
          <div className="relative z-10">
            <div
              className="
                flex
                items-center
                gap-2
                text-sm
                text-[#8290a8]
              "
            >
              <ShieldCheck
                size={17}
                className="text-[#3692ff]"
              />

              <span>
                Ambiente seguro e protegido
              </span>
            </div>

            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-[#56657d]
              "
            >
              Organize. Automatize. Evolua.
            </p>
          </div>
        </section>


        {/* =====================================================
            LADO DIREITO
        ===================================================== */}
        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center
            px-5
            py-10
            sm:px-8
            lg:px-10
            xl:px-16
          "
        >
          <div className="w-full max-w-md">
            {/* =================================================
                BRAND MOBILE
            ================================================= */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border border-[#2583ff]/20
                  bg-[#2583ff]/10
                  text-[#3692ff]
                "
              >
                <Orbit
                  size={22}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p className="font-semibold text-[#f8fafc]">
                  Orbit
                </p>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.18em]
                    text-[#56657d]
                  "
                >
                  Gestão inteligente
                </p>
              </div>
            </div>


            {/* =================================================
                LOGIN CARD
            ================================================= */}
            <div
              className="
                rounded-2xl
                border border-[#16345c]/35
                bg-[#051020]/75
                p-6
                shadow-[0_25px_80px_rgba(0,0,0,0.35)]
                backdrop-blur-xl
                sm:p-8
                lg:p-9
              "
            >
              <header>
                <div
                  className="
                    mb-5
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border border-[#2583ff]/15
                    bg-[#2583ff]/10
                    text-[#3692ff]
                  "
                >
                  <ShieldCheck
                    size={21}
                    strokeWidth={1.7}
                  />
                </div>

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.20em]
                    text-[#3692ff]
                  "
                >
                  Acesso seguro
                </p>

                <h2
                  className="
                    mt-2
                    text-3xl
                    font-semibold
                    tracking-tight
                    text-[#f8fafc]
                  "
                >
                  Acesse sua conta
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-[#8290a8]
                  "
                >
                  Entre com seu e-mail e senha
                  para acessar o Orbit.
                </p>
              </header>


              {/* =================================================
                  FORM
              ================================================= */}
              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit}
              >
                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-[#a7b4c8]
                    "
                  >
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      strokeWidth={1.8}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#56657d]
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="seuemail@email.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#16345c]/40
                        bg-[#010b1b]/55
                        py-3.5
                        pl-11
                        pr-4
                        text-sm
                        text-[#f8fafc]
                        outline-none
                        transition-all
                        duration-200

                        placeholder:text-[#56657d]

                        focus:border-[#2583ff]/55
                        focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                      "
                    />
                  </div>
                </div>


                {/* SENHA */}
                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-[#a7b4c8]
                    "
                  >
                    Senha
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      strokeWidth={1.8}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#56657d]
                      "
                    />

                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#16345c]/40
                        bg-[#010b1b]/55
                        py-3.5
                        pl-11
                        pr-4
                        text-sm
                        text-[#f8fafc]
                        outline-none
                        transition-all
                        duration-200

                        placeholder:text-[#56657d]

                        focus:border-[#2583ff]/55
                        focus:shadow-[0_0_0_3px_rgba(37,131,255,0.08)]
                      "
                    />
                  </div>
                </div>


                {/* =================================================
                    BOTÃO
                ================================================= */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    group
                    relative
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    overflow-hidden
                    rounded-xl
                    border border-[#2583ff]/25
                    bg-[#2583ff]
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_0_28px_rgba(37,131,255,0.18)]
                    transition-all
                    duration-200

                    hover:bg-[#3692ff]
                    hover:shadow-[0_0_38px_rgba(37,131,255,0.28)]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Validando...
                    </>
                  ) : (
                    <>
                      Entrar

                      <ArrowRight
                        size={17}
                        strokeWidth={1.8}
                        className="
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                        "
                      />
                    </>
                  )}
                </button>
              </form>
            </div>


            {/* =================================================
                RODAPÉ
            ================================================= */}
            <p
              className="
                mt-6
                text-center
                text-xs
                text-[#56657d]
              "
            >
              Orbit • Sistema de Gestão
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}