import { ArrowLeft, Home, Orbit } from "lucide-react";
import { useNavigate } from "react-router-dom";


export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main
            className="
                relative
                flex
                min-h-screen
                items-center
                justify-center
                overflow-hidden
                bg-[#010b1b]
                px-5
                text-[#f8fafc]
            "
        >
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            {/* Glow superior */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-[-250px]
                    h-[600px]
                    w-[600px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#2583ff]/10
                    blur-[140px]
                "
            />

            {/* Glow central */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-[420px]
                    w-[420px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#2583ff]/5
                    blur-[120px]
                "
            />

            {/* Grid decorativo */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.035]
                    [background-image:linear-gradient(#2583ff_1px,transparent_1px),linear-gradient(90deg,#2583ff_1px,transparent_1px)]
                    [background-size:48px_48px]
                "
            />


            {/* =====================================================
                404 GIGANTE AO FUNDO
            ===================================================== */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    -translate-x-1/2
                    -translate-y-[62%]
                    select-none

                    text-[150px]
                    font-bold
                    leading-none
                    tracking-[-0.08em]
                    text-[#2583ff]/[0.035]

                    sm:text-[230px]
                    lg:text-[320px]
                "
            >
                404
            </div>


            {/* =====================================================
                CONTEÚDO
            ===================================================== */}
            <section
                className="
                    relative
                    z-10
                    w-full
                    max-w-2xl
                    text-center
                "
            >
                {/* =================================================
                    ORBIT ANIMADO
                ================================================= */}
                <div
                    className="
                        relative
                        mx-auto
                        mb-8
                        flex
                        h-28
                        w-28
                        items-center
                        justify-center
                    "
                >
                    {/* Glow */}
                    <div
                        className="
                            absolute
                            inset-4
                            rounded-full
                            bg-[#2583ff]/20
                            blur-2xl
                            animate-pulse
                        "
                    />


                    {/* Órbita externa */}
                    <div
                        className="
                            absolute
                            inset-0
                            animate-[spin_12s_linear_infinite]
                            rounded-full
                            border border-[#2583ff]/15
                        "
                    >
                        {/* Ponto orbitando */}
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
                                shadow-[0_0_14px_rgba(54,146,255,0.9)]
                            "
                        />
                    </div>


                    {/* Órbita intermediária */}
                    <div
                        className="
                            absolute
                            inset-3
                            animate-[spin_8s_linear_infinite_reverse]
                            rounded-full
                            border border-dashed border-[#2583ff]/20
                        "
                    />


                    {/* Centro */}
                    <div
                        className="
                            relative
                            flex
                            h-16
                            w-16
                            animate-[bounce_4s_ease-in-out_infinite]
                            items-center
                            justify-center
                            rounded-2xl
                            border border-[#2583ff]/25
                            bg-[#07182d]/90
                            text-[#3692ff]
                            shadow-[0_0_35px_rgba(37,131,255,0.16)]
                            backdrop-blur
                        "
                    >
                        <Orbit
                            size={30}
                            strokeWidth={1.5}
                        />
                    </div>
                </div>


                {/* =================================================
                    BADGE
                ================================================= */}
                <div
                    className="
                        mx-auto
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border border-[#2583ff]/20
                        bg-[#2583ff]/[0.07]
                        px-3 py-1.5
                    "
                >
                    <span
                        className="
                            h-1.5
                            w-1.5
                            animate-pulse
                            rounded-full
                            bg-[#3692ff]
                            shadow-[0_0_8px_rgba(54,146,255,0.8)]
                        "
                    />

                    <span
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.18em]
                            text-[#3692ff]
                        "
                    >
                        Erro 404
                    </span>
                </div>


                {/* =================================================
                    TEXTO
                ================================================= */}
                <h1
                    className="
                        mt-6
                        text-4xl
                        font-semibold
                        tracking-tight
                        text-[#f8fafc]
                        sm:text-5xl
                        lg:text-6xl
                    "
                >
                    Página não encontrada
                </h1>

                <p
                    className="
                        mx-auto
                        mt-5
                        max-w-lg
                        text-sm
                        leading-7
                        text-[#8290a8]
                        sm:text-base
                    "
                >
                    Parece que esta página saiu da órbita.
                    O endereço pode estar incorreto, ter sido
                    removido ou não estar mais disponível.
                </p>


                {/* =================================================
                    AÇÕES
                ================================================= */}
                <div
                    className="
                        mt-8
                        flex
                        flex-col-reverse
                        items-center
                        justify-center
                        gap-3
                        sm:flex-row
                    "
                >
                    {/* VOLTAR */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border border-[#16345c]/40
                            bg-[#07182d]/45
                            px-5 py-3
                            text-sm
                            font-medium
                            text-[#a7b4c8]
                            transition-all
                            duration-200

                            hover:border-[#2583ff]/20
                            hover:bg-[#0a2242]/60
                            hover:text-[#f8fafc]

                            sm:w-auto
                        "
                    >
                        <ArrowLeft
                            size={17}
                            strokeWidth={1.8}
                        />

                        Voltar
                    </button>


                    {/* DASHBOARD */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border border-[#2583ff]/25
                            bg-[#2583ff]
                            px-5 py-3
                            text-sm
                            font-medium
                            text-white
                            shadow-[0_0_25px_rgba(37,131,255,0.20)]
                            transition-all
                            duration-200

                            hover:bg-[#3692ff]
                            hover:shadow-[0_0_35px_rgba(37,131,255,0.30)]

                            sm:w-auto
                        "
                    >
                        <Home
                            size={17}
                            strokeWidth={1.8}
                        />

                        Ir para o Dashboard
                    </button>
                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}
                <div
                    className="
                        mt-12
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        text-[#56657d]
                    "
                >
                    <Orbit
                        size={14}
                        strokeWidth={1.5}
                    />

                    <span>
                        Orbit
                    </span>

                    <span className="text-[#16345c]">
                        •
                    </span>

                    <span>
                        Sistema de Gestão
                    </span>
                </div>
            </section>


            {/* =====================================================
                DETALHES DECORATIVOS
            ===================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-[12%]
                    left-[10%]
                    hidden
                    h-1.5
                    w-1.5
                    animate-pulse
                    rounded-full
                    bg-[#2583ff]/50
                    shadow-[0_0_12px_rgba(37,131,255,0.5)]
                    md:block
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[13%]
                    top-[18%]
                    hidden
                    h-1
                    w-1
                    animate-pulse
                    rounded-full
                    bg-[#3692ff]/60
                    shadow-[0_0_10px_rgba(54,146,255,0.6)]
                    md:block
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[20%]
                    bottom-[18%]
                    hidden
                    h-1
                    w-1
                    animate-pulse
                    rounded-full
                    bg-[#2583ff]/40
                    md:block
                "
            />
        </main>
    );
}