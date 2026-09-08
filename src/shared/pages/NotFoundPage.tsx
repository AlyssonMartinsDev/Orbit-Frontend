import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { OrbitLogo } from "../components/OrbitLogo";


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
                    h-[500px]
                    w-[500px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#2583ff]/5
                    blur-[130px]
                "
            />


            {/* Glow inferior */}
            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-[-300px]
                    right-[-200px]
                    h-[550px]
                    w-[550px]
                    rounded-full
                    bg-[#0a2242]/50
                    blur-[160px]
                "
            />


            {/* Grid tecnológico */}
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
                404 GIGANTE
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2

                    -translate-x-1/2
                    -translate-y-[65%]

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
                    IDENTIDADE ORBIT
                ================================================= */}

                <div
                    className="
                        relative
                        mx-auto
                        mb-9
                        flex
                        h-36
                        w-36
                        items-center
                        justify-center
                    "
                >

                    {/* Glow pulsante */}
                    <div
                        className="
                            absolute
                            inset-3
                            animate-pulse
                            rounded-full
                            bg-[#2583ff]/15
                            blur-3xl
                        "
                    />


                    {/* Halo externo */}
                    <div
                        className="
                            absolute
                            inset-0
                            animate-[spin_24s_linear_infinite]
                            rounded-full
                            border
                            border-[#2583ff]/10
                        "
                    >
                        <span
                            className="
                                absolute
                                left-1/2
                                top-[-3px]
                                h-1.5
                                w-1.5
                                -translate-x-1/2
                                rounded-full
                                bg-[#3692ff]/80
                                shadow-[0_0_12px_rgba(54,146,255,0.9)]
                            "
                        />
                    </div>


                    {/* Halo intermediário */}
                    <div
                        className="
                            absolute
                            inset-3
                            animate-[spin_18s_linear_infinite_reverse]
                            rounded-full
                            border
                            border-dashed
                            border-[#2583ff]/10
                        "
                    />


                    {/* Logo oficial */}
                    <div
                        className="
                            relative
                            flex
                            h-24
                            w-24
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#2583ff]/10
                            bg-[#051020]/30
                            shadow-[0_0_50px_rgba(37,131,255,0.10)]
                            backdrop-blur-sm

                            animate-[orbit404Float_5s_ease-in-out_infinite]
                        "
                    >
                        <OrbitLogo
                            variant="icon"
                            size="lg"
                            animated
                        />
                    </div>

                </div>


                {/* =================================================
                    BADGE
                ================================================= */}

                <div
                    className="
                        inline-flex
                        items-center
                        gap-2

                        rounded-full
                        border
                        border-[#2583ff]/20

                        bg-[#2583ff]/[0.07]

                        px-3
                        py-1.5

                        shadow-[0_0_25px_rgba(37,131,255,0.05)]
                    "
                >
                    <span className="relative flex h-1.5 w-1.5">

                        <span
                            className="
                                absolute
                                inline-flex
                                h-full
                                w-full
                                animate-ping
                                rounded-full
                                bg-[#3692ff]
                                opacity-60
                            "
                        />

                        <span
                            className="
                                relative
                                inline-flex
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[#3692ff]
                            "
                        />

                    </span>


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
                        tracking-[-0.035em]
                        text-[#f8fafc]

                        sm:text-5xl
                        lg:text-6xl
                    "
                >
                    Página fora de órbita.
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
                    Não conseguimos localizar o destino que você procura.
                    O endereço pode estar incorreto, ter sido removido ou
                    não estar mais disponível.
                </p>


                {/* =================================================
                    AÇÕES
                ================================================= */}

                <div
                    className="
                        mt-9

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
                            group

                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2

                            rounded-xl

                            border
                            border-[#16345c]/40

                            bg-[#051020]/50

                            px-5
                            py-3

                            text-sm
                            font-medium
                            text-[#a7b4c8]

                            backdrop-blur-xl

                            transition-all
                            duration-300

                            hover:-translate-y-0.5
                            hover:border-[#2583ff]/20
                            hover:bg-[#07182d]
                            hover:text-[#f8fafc]

                            sm:w-auto
                        "
                    >
                        <ArrowLeft
                            size={17}
                            strokeWidth={1.8}
                            className="
                                transition-transform
                                duration-300

                                group-hover:-translate-x-1
                            "
                        />

                        Voltar
                    </button>


                    {/* DASHBOARD */}

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
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

                            border
                            border-[#2583ff]/25

                            bg-[#2583ff]

                            px-5
                            py-3

                            text-sm
                            font-semibold
                            text-white

                            shadow-[0_0_30px_rgba(37,131,255,0.20)]

                            transition-all
                            duration-300

                            hover:-translate-y-0.5
                            hover:bg-[#3692ff]
                            hover:shadow-[0_0_40px_rgba(37,131,255,0.32)]

                            sm:w-auto
                        "
                    >

                        {/* Reflexo */}
                        <span
                            className="
                                pointer-events-none

                                absolute
                                inset-y-0
                                left-0

                                w-16
                                -skew-x-12

                                bg-gradient-to-r
                                from-transparent
                                via-white/20
                                to-transparent

                                animate-[orbit404Sweep_4s_ease-in-out_infinite]
                            "
                        />


                        <Home
                            size={17}
                            strokeWidth={1.8}
                        />

                        Ir para o Dashboard

                    </button>

                </div>


                {/* =================================================
                    MARCA
                ================================================= */}

                <div
                    className="
                        mt-14
                        flex
                        justify-center
                    "
                >
                    <OrbitLogo
                        variant="brand"
                        size="sm"
                    />
                </div>

            </section>


            {/* =====================================================
                ESTRELAS / DETALHES
            ===================================================== */}

            <span
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


            <span
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


            <span
                className="
                    pointer-events-none
                    absolute
                    bottom-[18%]
                    right-[20%]

                    hidden

                    h-1
                    w-1

                    animate-pulse

                    rounded-full

                    bg-[#2583ff]/40

                    md:block
                "
            />


            {/* =====================================================
                ANIMAÇÕES EXCLUSIVAS
            ===================================================== */}

            <style>
                {`
                    @keyframes orbit404Float {
                        0%, 100% {
                            transform: translateY(0px);
                        }

                        50% {
                            transform: translateY(-8px);
                        }
                    }

                    @keyframes orbit404Sweep {
                        0% {
                            transform: translateX(-180%) skewX(-12deg);
                        }

                        55%, 100% {
                            transform: translateX(500%) skewX(-12deg);
                        }
                    }
                `}
            </style>

        </main>
    );
}