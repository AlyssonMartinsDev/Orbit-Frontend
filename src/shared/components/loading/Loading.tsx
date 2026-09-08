import { OrbitLogo } from "../OrbitLogo";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}


export function Loading({
    message = "Carregando...",
    fullScreen = true,
}: LoadingProps) {
    return (
        <div
            className={`
                relative
                flex
                items-center
                justify-center
                overflow-hidden

                ${fullScreen
                    ? "min-h-screen bg-[#010b1b]"
                    : "min-h-[260px] w-full"
                }
            `}
        >
            {/* =====================================================
                BACKGROUND - SOMENTE FULLSCREEN
            ===================================================== */}

            {fullScreen && (
                <>
                    {/* Grid */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            opacity-[0.03]

                            [background-image:linear-gradient(#2583ff_1px,transparent_1px),linear-gradient(90deg,#2583ff_1px,transparent_1px)]
                            [background-size:48px_48px]
                        "
                    />

                    {/* Glow superior */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            left-1/2
                            top-[-220px]

                            h-[500px]
                            w-[500px]

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

                            h-[400px]
                            w-[400px]

                            -translate-x-1/2
                            -translate-y-1/2

                            rounded-full
                            bg-[#2583ff]/5
                            blur-[120px]
                        "
                    />
                </>
            )}


            {/* =====================================================
                CONTEÚDO
            ===================================================== */}

            <div
                className="
                    relative
                    z-10

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center
                "
            >

                {/* =================================================
                    SISTEMA ORBITAL
                ================================================= */}

                <div
                    className="
                        relative

                        flex
                        h-32
                        w-32

                        items-center
                        justify-center
                    "
                >
                    {/* Glow pulsante */}
                    <div
                        className="
                            absolute
                            inset-5

                            animate-pulse

                            rounded-full
                            bg-[#2583ff]/20
                            blur-2xl
                        "
                    />


                    {/* Órbita externa */}
                    <div
                        className="
                            absolute

                            h-[76px]
                            w-[120px]

                            rotate-[-25deg]

                            animate-[spin_5s_linear_infinite]

                            rounded-[50%]

                            border
                            border-[#2583ff]/25

                            shadow-[0_0_18px_rgba(37,131,255,0.08)]
                        "
                    >
                        {/* Satélite */}
                        <span
                            className="
                                absolute

                                right-[-4px]
                                top-1/2

                                h-2.5
                                w-2.5

                                -translate-y-1/2

                                rounded-full

                                bg-[#3692ff]

                                shadow-[0_0_14px_rgba(54,146,255,0.95)]
                            "
                        />
                    </div>


                    {/* Órbita intermediária */}
                    <div
                        className="
                            absolute

                            h-[58px]
                            w-[94px]

                            rotate-[25deg]

                            animate-[spin_3.5s_linear_infinite_reverse]

                            rounded-[50%]

                            border
                            border-[#3692ff]/20
                        "
                    >
                        <span
                            className="
                                absolute

                                left-[-3px]
                                top-1/2

                                h-1.5
                                w-1.5

                                -translate-y-1/2

                                rounded-full

                                bg-[#2583ff]

                                shadow-[0_0_10px_rgba(37,131,255,0.8)]
                            "
                        />
                    </div>


                    {/* Logo oficial */}
                    <div
                        className="
                            relative
                            z-10

                            flex
                            items-center
                            justify-center

                            animate-[orbitLoadingFloat_3s_ease-in-out_infinite]
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
                    TEXTO
                ================================================= */}

                <div className="mt-5">
                    <span
                        className="
                            text-sm
                            font-medium
                            tracking-wide
                            text-[#a7b4c8]
                        "
                    >
                        {message}
                    </span>


                    {/* Pontos animados */}
                    <div
                        className="
                            mt-3
                            flex
                            items-center
                            justify-center
                            gap-1.5
                        "
                    >
                        <span
                            className="
                                h-1
                                w-1

                                animate-[orbitLoadingDot_1.4s_ease-in-out_infinite]

                                rounded-full
                                bg-[#2583ff]
                            "
                        />

                        <span
                            className="
                                h-1
                                w-1

                                animate-[orbitLoadingDot_1.4s_ease-in-out_0.2s_infinite]

                                rounded-full
                                bg-[#2583ff]
                            "
                        />

                        <span
                            className="
                                h-1
                                w-1

                                animate-[orbitLoadingDot_1.4s_ease-in-out_0.4s_infinite]

                                rounded-full
                                bg-[#2583ff]
                            "
                        />
                    </div>
                </div>

            </div>


            {/* =====================================================
                ANIMAÇÕES
            ===================================================== */}

            <style>
                {`
                    @keyframes orbitLoadingFloat {
                        0%, 100% {
                            transform: translateY(0);
                        }

                        50% {
                            transform: translateY(-5px);
                        }
                    }

                    @keyframes orbitLoadingDot {
                        0%, 80%, 100% {
                            opacity: 0.25;
                            transform: scale(0.75);
                        }

                        40% {
                            opacity: 1;
                            transform: scale(1.15);
                        }
                    }
                `}
            </style>
        </div>
    );
}