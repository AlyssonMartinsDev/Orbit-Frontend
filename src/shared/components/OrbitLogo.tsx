type OrbitLogoProps = {
    variant?: "icon" | "brand";
    size?: "sm" | "md" | "lg";
    animated?: boolean;
    className?: string;
};


const sizes = {
    sm: {
        container: "h-9 w-9",
        brandContainer: "h-9 w-9",
        title: "text-xl",
        subtitle: "text-[9px]",
    },

    md: {
        container: "h-12 w-12",
        brandContainer: "h-12 w-12",
        title: "text-2xl",
        subtitle: "text-[10px]",
    },

    lg: {
        container: "h-16 w-16",
        brandContainer: "h-16 w-16",
        title: "text-3xl",
        subtitle: "text-[11px]",
    },
};


export function OrbitLogo({
    variant = "icon",
    size = "md",
    animated = false,
    className = "",
}: OrbitLogoProps) {

    const currentSize = sizes[size];


    const icon = (
        <div
            className={`
                relative
                shrink-0
                ${currentSize.container}
                ${className}
            `}
        >
            {/* Glow */}
            <div
                className={`
                    absolute
                    inset-[20%]
                    rounded-full
                    bg-[#2583ff]/25
                    blur-xl

                    ${animated ? "animate-pulse" : ""}
                `}
            />


            {/* =====================================================
                ÓRBITA EXTERNA
            ===================================================== */}

            <div
                className={`
                    absolute
                    left-1/2
                    top-1/2

                    h-[48%]
                    w-[92%]

                    -translate-x-1/2
                    -translate-y-1/2

                    rotate-[-28deg]

                    rounded-[50%]

                    border-[2px]
                    border-[#2583ff]

                    shadow-[0_0_10px_rgba(37,131,255,0.45)]

                    ${animated
                        ? "animate-[spin_14s_linear_infinite]"
                        : ""
                    }
                `}
            >
                {/* Satélite */}
                <span
                    className="
                        absolute
                        right-[-5%]
                        top-1/2

                        h-[18%]
                        w-[18%]

                        -translate-y-1/2

                        rounded-full

                        bg-[#3692ff]

                        shadow-[0_0_10px_rgba(54,146,255,0.95)]
                    "
                />
            </div>


            {/* =====================================================
                ÓRBITA INTERNA
            ===================================================== */}

            <div
                className={`
                    absolute
                    left-1/2
                    top-1/2

                    h-[36%]
                    w-[68%]

                    -translate-x-1/2
                    -translate-y-1/2

                    rotate-[24deg]

                    rounded-[50%]

                    border
                    border-[#3692ff]/45

                    ${animated
                        ? "animate-[spin_10s_linear_infinite_reverse]"
                        : ""
                    }
                `}
            />


            {/* =====================================================
                PLANETA CENTRAL
            ===================================================== */}

            <div
                className="
                    absolute
                    left-1/2
                    top-1/2

                    h-[32%]
                    w-[32%]

                    -translate-x-1/2
                    -translate-y-1/2

                    rounded-full

                    border
                    border-[#3692ff]/30

                    bg-[radial-gradient(circle_at_30%_25%,_#bdf7ff_0%,_#3692ff_20%,_#2583ff_48%,_#0a2242_78%,_#010b1b_100%)]

                    shadow-[0_0_16px_rgba(37,131,255,0.65)]
                "
            >
                {/* Reflexo */}
                <div
                    className="
                        absolute
                        left-[20%]
                        top-[17%]

                        h-[16%]
                        w-[35%]

                        rotate-[-25deg]

                        rounded-full

                        bg-white/70

                        blur-[1px]
                    "
                />
            </div>
        </div>
    );


    /* =============================================================
        SOMENTE ÍCONE
    ============================================================= */

    if (variant === "icon") {
        return icon;
    }


    /* =============================================================
        LOGO COMPLETA
    ============================================================= */

    return (
        <div className="flex items-center gap-3">

            <div className={currentSize.brandContainer}>
                {icon}
            </div>


            <div className="leading-none">

                <div
                    className={`
                        font-semibold
                        tracking-[-0.03em]
                        text-[#f8fafc]
                        ${currentSize.title}
                    `}
                >
                    Orbit
                </div>


                <div
                    className={`
                        mt-1
                        font-medium
                        uppercase
                        tracking-[0.20em]
                        text-[#56657d]
                        ${currentSize.subtitle}
                    `}
                >
                    Sistema de Gestão
                </div>

            </div>

        </div>
    );
}