import { Link } from "react-router-dom";

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    LayoutDashboard,
    Package,
    ShieldCheck,
    Smartphone,
    Users,
    WalletCards,
} from "lucide-react";


const features = [
    {
        title: "Clientes",
        description:
            "Centralize dados, contatos e todo o histórico de atendimento dos seus clientes.",
        icon: Users,
    },
    {
        title: "Ordens de Serviço",
        description:
            "Controle serviços, valores, status e informações personalizadas em um único lugar.",
        icon: ClipboardList,
    },
    {
        title: "Dashboard",
        description:
            "Acompanhe os principais indicadores da operação de forma rápida e objetiva.",
        icon: LayoutDashboard,
    },
];


const roadmapItems = [
    {
        title: "Financeiro",
        description: "Fluxo financeiro integrado à operação.",
        icon: WalletCards,
    },
    {
        title: "Agenda",
        description: "Organização de serviços e compromissos.",
        icon: CalendarDays,
    },
    {
        title: "Estoque",
        description: "Controle de produtos e movimentações.",
        icon: Package,
    },
    {
        title: "Aplicativo",
        description: "Orbit ainda mais próximo da operação.",
        icon: Smartphone,
    },
];


export default function HomePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#010b1b] text-[#f8fafc]">

            {/* =====================================================
                ANIMAÇÕES
            ===================================================== */}

            <style>
                {`
                    @keyframes orbitFloat {
                        0%, 100% {
                            transform: translateY(0px);
                        }

                        50% {
                            transform: translateY(-14px);
                        }
                    }

                    @keyframes orbitRotate {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes orbitRotateReverse {
                        from {
                            transform: rotate(360deg);
                        }

                        to {
                            transform: rotate(0deg);
                        }
                    }

                    @keyframes glowPulse {
                        0%, 100% {
                            opacity: 0.45;
                            transform: scale(1);
                        }

                        50% {
                            opacity: 0.8;
                            transform: scale(1.08);
                        }
                    }

                    @keyframes fadeUp {
                        from {
                            opacity: 0;
                            transform: translateY(24px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes lightSweep {
                        0% {
                            transform: translateX(-160%);
                        }

                        60%,
                        100% {
                            transform: translateX(260%);
                        }
                    }
                `}
            </style>


            {/* =====================================================
                BACKGROUND GLOBAL
            ===================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-10">

                {/* Grid tecnológico */}
                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.12]
                    "
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(37,131,255,0.13) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,131,255,0.13) 1px, transparent 1px)
                        `,
                        backgroundSize: "56px 56px",
                    }}
                />


                {/* Glow superior */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-[-260px]
                        h-[700px]
                        w-[900px]
                        -translate-x-1/2
                        rounded-full
                        bg-[#2583ff]/10
                        blur-[180px]
                    "
                />


                {/* Glow lateral */}
                <div
                    className="
                        absolute
                        right-[-250px]
                        top-[360px]
                        h-[600px]
                        w-[600px]
                        rounded-full
                        bg-[#2583ff]/10
                        blur-[180px]
                    "
                />


                {/* Luz inferior */}
                <div
                    className="
                        absolute
                        bottom-[-350px]
                        left-[-200px]
                        h-[650px]
                        w-[650px]
                        rounded-full
                        bg-[#0a2242]/70
                        blur-[180px]
                    "
                />
            </div>


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className="
                    relative
                    z-50
                    border-b
                    border-[#16345c]/30
                    bg-[#010b1b]/70
                    backdrop-blur-xl
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        max-w-7xl
                        items-center
                        justify-between
                        px-4
                        py-4

                        sm:px-6
                        lg:px-8
                    "
                >

                    {/* Logo */}
                    <div className="flex items-center gap-3">

                        <OrbitLogoSmall />

                        <div>
                            <h1
                                className="
                                    text-xl
                                    font-semibold
                                    tracking-tight
                                    text-[#f8fafc]
                                "
                            >
                                Orbit
                            </h1>

                            <p
                                className="
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-[0.22em]
                                    text-[#56657d]
                                "
                            >
                                Sistema de Gestão
                            </p>
                        </div>

                    </div>


                    {/* Ações */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        <button
                            disabled
                            className="
                                hidden
                                cursor-not-allowed
                                rounded-xl
                                border
                                border-[#16345c]/35
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                text-[#56657d]

                                sm:block
                            "
                        >
                            Criar conta
                        </button>


                        <Link
                            to="/login"
                            className="
                                group
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-[#2583ff]
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-[0_0_30px_rgba(37,131,255,0.22)]
                                transition-all
                                duration-300

                                hover:bg-[#3692ff]
                                hover:shadow-[0_0_40px_rgba(37,131,255,0.35)]
                            "
                        >
                            Entrar

                            <ArrowRight
                                size={16}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                "
                            />
                        </Link>

                    </div>

                </div>
            </header>


            {/* =====================================================
                HERO
            ===================================================== */}

            <main
                className="
                    relative
                    mx-auto
                    grid
                    min-h-[calc(100vh-76px)]
                    max-w-7xl
                    items-center
                    gap-14
                    px-4
                    py-20

                    sm:px-6
                    lg:grid-cols-[1.05fr_0.95fr]
                    lg:gap-6
                    lg:px-8
                    lg:py-24
                "
            >

                {/* =================================================
                    HERO - TEXTO
                ================================================= */}

                <div
                    className="
                        relative
                        z-10
                        max-w-3xl

                        [animation:fadeUp_0.8s_ease-out_both]
                    "
                >

                    {/* Badge */}
                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#2583ff]/20
                            bg-[#0a2242]/50
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-[#a7b4c8]
                            shadow-[0_0_30px_rgba(37,131,255,0.06)]
                            backdrop-blur-xl
                        "
                    >
                        <span className="relative flex h-2 w-2">
                            <span
                                className="
                                    absolute
                                    inline-flex
                                    h-full
                                    w-full
                                    animate-ping
                                    rounded-full
                                    bg-[#2583ff]
                                    opacity-60
                                "
                            />

                            <span
                                className="
                                    relative
                                    inline-flex
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-[#3692ff]
                                "
                            />
                        </span>

                        Gestão inteligente para sua operação
                    </div>


                    {/* Título */}
                    <h2
                        className="
                            mt-7
                            text-5xl
                            font-semibold
                            leading-[0.98]
                            tracking-[-0.045em]
                            text-[#f8fafc]

                            sm:text-6xl
                            lg:text-7xl
                            xl:text-[82px]
                        "
                    >
                        Sua operação,

                        <br />

                        <span
                            className="
                                bg-gradient-to-r
                                from-[#3692ff]
                                via-[#2583ff]
                                to-[#36c2ff]
                                bg-clip-text
                                text-transparent
                            "
                        >
                            em uma nova órbita.
                        </span>
                    </h2>


                    {/* Descrição */}
                    <p
                        className="
                            mt-7
                            max-w-2xl
                            text-base
                            leading-8
                            text-[#8290a8]

                            sm:text-lg
                        "
                    >
                        Clientes, ordens de serviço e indicadores
                        trabalhando juntos em uma plataforma construída
                        para organizar sua operação e facilitar suas decisões.
                    </p>


                    {/* Botões */}
                    <div
                        className="
                            mt-9
                            flex
                            flex-col
                            gap-3

                            sm:flex-row
                        "
                    >
                        <Link
                            to="/login"
                            className="
                                group
                                relative
                                flex
                                items-center
                                justify-center
                                gap-3
                                overflow-hidden
                                rounded-xl
                                bg-[#2583ff]
                                px-6
                                py-3.5
                                font-semibold
                                text-white
                                shadow-[0_0_40px_rgba(37,131,255,0.24)]
                                transition-all
                                duration-300

                                hover:-translate-y-0.5
                                hover:bg-[#3692ff]
                                hover:shadow-[0_0_55px_rgba(37,131,255,0.35)]
                            "
                        >
                            {/* Reflexo animado */}
                            <span
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-y-0
                                    left-0
                                    w-20
                                    -skew-x-12
                                    bg-gradient-to-r
                                    from-transparent
                                    via-white/20
                                    to-transparent

                                    [animation:lightSweep_4s_ease-in-out_infinite]
                                "
                            />

                            Acessar Orbit

                            <ArrowRight
                                size={18}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                "
                            />
                        </Link>


                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-[#16345c]/35
                                bg-[#051020]/50
                                px-6
                                py-3.5
                                text-sm
                                text-[#8290a8]
                                backdrop-blur-xl
                            "
                        >
                            <ShieldCheck
                                size={17}
                                className="text-[#3692ff]"
                            />

                            Ambiente seguro e privado
                        </div>

                    </div>


                    {/* Mini benefícios */}
                    <div
                        className="
                            mt-9
                            flex
                            flex-wrap
                            gap-x-6
                            gap-y-3
                        "
                    >
                        {[
                            "Gestão centralizada",
                            "Acesso de qualquer lugar",
                            "Dados em tempo real",
                        ].map((item) => (
                            <div
                                key={item}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-[#8290a8]
                                "
                            >
                                <CheckCircle2
                                    size={15}
                                    className="text-[#3692ff]"
                                />

                                {item}
                            </div>
                        ))}
                    </div>

                </div>


                {/* =================================================
                    HERO - ORBITAL
                ================================================= */}

                <div
                    className="
                        relative
                        flex
                        min-h-[420px]
                        items-center
                        justify-center

                        sm:min-h-[520px]
                        lg:min-h-[620px]
                    "
                >

                    {/* Glow */}
                    <div
                        className="
                            absolute
                            h-[330px]
                            w-[330px]
                            rounded-full
                            bg-[#2583ff]/20
                            blur-[120px]

                            sm:h-[420px]
                            sm:w-[420px]

                            [animation:glowPulse_5s_ease-in-out_infinite]
                        "
                    />


                    {/* Container flutuante */}
                    <div
                        className="
                            relative
                            flex
                            h-[390px]
                            w-[390px]
                            items-center
                            justify-center

                            sm:h-[500px]
                            sm:w-[500px]

                            [animation:orbitFloat_6s_ease-in-out_infinite]
                        "
                    >

                        {/* Órbita externa */}
                        <div
                            className="
                                absolute
                                h-[245px]
                                w-[390px]
                                rotate-[-28deg]
                                rounded-[50%]
                                border
                                border-[#2583ff]/35
                                shadow-[0_0_30px_rgba(37,131,255,0.18)]

                                sm:h-[310px]
                                sm:w-[490px]

                                [animation:orbitRotate_24s_linear_infinite]
                            "
                        >
                            <span
                                className="
                                    absolute
                                    -right-3
                                    top-1/2
                                    h-6
                                    w-6
                                    -translate-y-1/2
                                    rounded-full
                                    bg-[#3692ff]
                                    shadow-[0_0_24px_rgba(54,146,255,1)]
                                "
                            />
                        </div>


                        {/* Órbita intermediária */}
                        <div
                            className="
                                absolute
                                h-[180px]
                                w-[290px]
                                rotate-[24deg]
                                rounded-[50%]
                                border
                                border-[#2583ff]/25

                                sm:h-[225px]
                                sm:w-[370px]

                                [animation:orbitRotateReverse_18s_linear_infinite]
                            "
                        >
                            <span
                                className="
                                    absolute
                                    left-4
                                    top-[25%]
                                    h-3
                                    w-3
                                    rounded-full
                                    bg-[#2583ff]
                                    shadow-[0_0_18px_rgba(37,131,255,1)]
                                "
                            />
                        </div>


                        {/* Órbita interna */}
                        <div
                            className="
                                absolute
                                h-[125px]
                                w-[210px]
                                rotate-[-18deg]
                                rounded-[50%]
                                border
                                border-[#3692ff]/30

                                sm:h-[160px]
                                sm:w-[265px]

                                [animation:orbitRotate_14s_linear_infinite]
                            "
                        />


                        {/* Planeta */}
                        <div
                            className="
                                relative
                                h-32
                                w-32
                                rounded-full
                                border
                                border-[#3692ff]/30
                                bg-[radial-gradient(circle_at_30%_25%,_#8ddcff_0%,_#2583ff_30%,_#0a2242_68%,_#010b1b_100%)]
                                shadow-[0_0_60px_rgba(37,131,255,0.45),inset_-20px_-20px_45px_rgba(1,11,27,0.65)]

                                sm:h-40
                                sm:w-40
                            "
                        >
                            <div
                                className="
                                    absolute
                                    left-[22%]
                                    top-[15%]
                                    h-5
                                    w-10
                                    rotate-[-30deg]
                                    rounded-full
                                    bg-white/45
                                    blur-sm
                                "
                            />
                        </div>


                        {/* Card flutuante 1 */}
                        <div
                            className="
                                absolute
                                left-0
                                top-[22%]
                                hidden
                                rounded-xl
                                border
                                border-[#16345c]/45
                                bg-[#051020]/80
                                px-4
                                py-3
                                shadow-[0_15px_40px_rgba(0,0,0,0.28)]
                                backdrop-blur-xl

                                sm:block
                            "
                        >
                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-[0.16em]
                                    text-[#56657d]
                                "
                            >
                                Operação
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-[#f8fafc]
                                "
                            >
                                Tudo conectado
                            </p>
                        </div>


                        {/* Card flutuante 2 */}
                        <div
                            className="
                                absolute
                                bottom-[16%]
                                right-0
                                hidden
                                rounded-xl
                                border
                                border-[#16345c]/45
                                bg-[#051020]/80
                                px-4
                                py-3
                                shadow-[0_15px_40px_rgba(0,0,0,0.28)]
                                backdrop-blur-xl

                                sm:block
                            "
                        >
                            <div className="flex items-center gap-2">

                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-[#3692ff]
                                        shadow-[0_0_12px_rgba(54,146,255,0.9)]
                                    "
                                />

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-[#a7b4c8]
                                    "
                                >
                                    Sistema online
                                </p>

                            </div>
                        </div>

                    </div>

                </div>

            </main>


            {/* =====================================================
                RECURSOS
            ===================================================== */}

            <section
                className="
                    relative
                    border-y
                    border-[#16345c]/25
                    bg-[#051020]/25
                    py-24
                    backdrop-blur-sm
                "
            >
                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-4

                        sm:px-6
                        lg:px-8
                    "
                >

                    {/* Header */}
                    <div className="max-w-2xl">

                        <span
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-[#3692ff]
                            "
                        >
                            Ecossistema Orbit
                        </span>

                        <h2
                            className="
                                mt-4
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-[#f8fafc]

                                sm:text-4xl
                            "
                        >
                            Sua operação em um único lugar.
                        </h2>

                        <p
                            className="
                                mt-4
                                leading-7
                                text-[#8290a8]
                            "
                        >
                            Informações conectadas para que você tenha
                            mais controle e menos trabalho manual.
                        </p>

                    </div>


                    {/* Cards */}
                    <div
                        className="
                            mt-12
                            grid
                            gap-5

                            md:grid-cols-3
                        "
                    >
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <article
                                    key={feature.title}
                                    className="
                                        group
                                        relative
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-[#16345c]/35
                                        bg-[#051020]/60
                                        p-7
                                        transition-all
                                        duration-500

                                        hover:-translate-y-1
                                        hover:border-[#2583ff]/30
                                        hover:bg-[#07182d]/75
                                        hover:shadow-[0_20px_60px_rgba(0,0,0,0.25),0_0_30px_rgba(37,131,255,0.05)]
                                    "
                                >

                                    {/* Glow hover */}
                                    <div
                                        className="
                                            absolute
                                            -right-20
                                            -top-20
                                            h-40
                                            w-40
                                            rounded-full
                                            bg-[#2583ff]/0
                                            blur-[60px]
                                            transition-all
                                            duration-500

                                            group-hover:bg-[#2583ff]/10
                                        "
                                    />


                                    <div
                                        className="
                                            relative
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-[#2583ff]/15
                                            bg-[#0a2242]/65
                                            text-[#3692ff]
                                            transition-all
                                            duration-300

                                            group-hover:border-[#2583ff]/30
                                            group-hover:shadow-[0_0_25px_rgba(37,131,255,0.15)]
                                        "
                                    >
                                        <Icon
                                            size={22}
                                            strokeWidth={1.8}
                                        />
                                    </div>


                                    <h3
                                        className="
                                            mt-6
                                            text-xl
                                            font-semibold
                                            text-[#f8fafc]
                                        "
                                    >
                                        {feature.title}
                                    </h3>


                                    <p
                                        className="
                                            mt-3
                                            leading-7
                                            text-[#8290a8]
                                        "
                                    >
                                        {feature.description}
                                    </p>

                                </article>
                            );
                        })}
                    </div>

                </div>
            </section>


            {/* =====================================================
                ROADMAP
            ===================================================== */}

            <section className="relative py-24">

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-4

                        sm:px-6
                        lg:px-8
                    "
                >
                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            border
                            border-[#16345c]/40
                            bg-[radial-gradient(circle_at_top_right,_rgba(37,131,255,0.12),_transparent_35%),linear-gradient(135deg,_#051020_0%,_#010b1b_100%)]
                            p-6
                            shadow-[0_30px_80px_rgba(0,0,0,0.28)]

                            sm:p-10
                            lg:p-12
                        "
                    >

                        {/* Grid */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                opacity-[0.06]
                            "
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(37,131,255,0.35) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(37,131,255,0.35) 1px, transparent 1px)
                                `,
                                backgroundSize: "40px 40px",
                            }}
                        />


                        <div className="relative">

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#3692ff]
                                "
                            >
                                Próximas órbitas
                            </span>


                            <h2
                                className="
                                    mt-4
                                    text-3xl
                                    font-semibold
                                    tracking-tight
                                    text-[#f8fafc]

                                    sm:text-4xl
                                "
                            >
                                O Orbit continua evoluindo.
                            </h2>


                            <p
                                className="
                                    mt-4
                                    max-w-2xl
                                    leading-7
                                    text-[#8290a8]
                                "
                            >
                                Novos módulos serão incorporados gradualmente,
                                conectando cada vez mais áreas da operação.
                            </p>


                            <div
                                className="
                                    mt-10
                                    grid
                                    gap-3

                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                "
                            >
                                {roadmapItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="
                                                group
                                                rounded-xl
                                                border
                                                border-[#16345c]/30
                                                bg-[#010b1b]/40
                                                p-5
                                                backdrop-blur-xl
                                                transition-all
                                                duration-300

                                                hover:border-[#2583ff]/25
                                                hover:bg-[#07182d]/70
                                            "
                                        >

                                            <Icon
                                                size={20}
                                                strokeWidth={1.8}
                                                className="
                                                    text-[#56657d]
                                                    transition-colors
                                                    group-hover:text-[#3692ff]
                                                "
                                            />


                                            <h3
                                                className="
                                                    mt-4
                                                    font-medium
                                                    text-[#f8fafc]
                                                "
                                            >
                                                {item.title}
                                            </h3>


                                            <p
                                                className="
                                                    mt-1.5
                                                    text-sm
                                                    leading-6
                                                    text-[#56657d]
                                                "
                                            >
                                                {item.description}
                                            </p>

                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                    </div>
                </div>

            </section>


            {/* =====================================================
                CTA FINAL
            ===================================================== */}

            <section
                className="
                    relative
                    overflow-hidden
                    border-t
                    border-[#16345c]/25
                    py-24
                    text-center
                "
            >

                <div
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-[400px]
                        w-[600px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#2583ff]/10
                        blur-[140px]
                    "
                />


                <div
                    className="
                        relative
                        mx-auto
                        max-w-3xl
                        px-4

                        sm:px-6
                    "
                >

                    <OrbitLogoSmall centered />


                    <h2
                        className="
                            mt-7
                            text-3xl
                            font-semibold
                            tracking-tight
                            text-[#f8fafc]

                            sm:text-5xl
                        "
                    >
                        Organize hoje.
                        <br />

                        <span className="text-[#3692ff]">
                            Evolua sempre.
                        </span>
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-5
                            max-w-xl
                            leading-7
                            text-[#8290a8]
                        "
                    >
                        Uma plataforma criada para colocar sua operação
                        em movimento.
                    </p>


                    <Link
                        to="/login"
                        className="
                            group
                            mt-8
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#2583ff]
                            px-6
                            py-3.5
                            font-semibold
                            text-white
                            shadow-[0_0_40px_rgba(37,131,255,0.2)]
                            transition-all

                            hover:bg-[#3692ff]
                            hover:shadow-[0_0_50px_rgba(37,131,255,0.35)]
                        "
                    >
                        Entrar no Orbit

                        <ArrowRight
                            size={18}
                            className="
                                transition-transform
                                group-hover:translate-x-1
                            "
                        />
                    </Link>

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer
                className="
                    border-t
                    border-[#16345c]/25
                    bg-[#010b1b]/70
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        max-w-7xl
                        flex-col
                        items-center
                        justify-between
                        gap-4
                        px-4
                        py-7
                        text-center
                        text-xs
                        text-[#56657d]

                        sm:px-6
                        md:flex-row
                        md:text-left
                        lg:px-8
                    "
                >

                    <div className="flex items-center gap-2">

                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[#2583ff]
                                shadow-[0_0_8px_rgba(37,131,255,0.8)]
                            "
                        />

                        © 2026 Orbit. Todos os direitos reservados.

                    </div>


                    <p>
                        Desenvolvido por Alysson Martins
                    </p>

                </div>
            </footer>

        </div>
    );
}


/* =============================================================
    LOGO ORBIT - CSS
============================================================= */

function OrbitLogoSmall({
    centered = false,
}: {
    centered?: boolean;
}) {
    return (
        <div
            className={[
                "relative",
                "h-10 w-10",
                centered ? "mx-auto" : "",
            ].join(" ")}
        >
            {/* Órbita */}
            <div
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-5
                    w-9
                    -translate-x-1/2
                    -translate-y-1/2
                    rotate-[-28deg]
                    rounded-[50%]
                    border-2
                    border-[#2583ff]
                    shadow-[0_0_10px_rgba(37,131,255,0.55)]
                "
            />

            {/* Planeta */}
            <div
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-3
                    w-3
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#3692ff]
                    shadow-[0_0_10px_rgba(54,146,255,0.7)]
                "
            />

            {/* Satélite */}
            <div
                className="
                    absolute
                    right-[2px]
                    top-[7px]
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#3692ff]
                    shadow-[0_0_8px_rgba(54,146,255,0.9)]
                "
            />
        </div>
    );
}