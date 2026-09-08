import {
    Building2,
    Users,
    ClipboardList,
    ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";


const settingsItems = [
    {
        label: "Organização",
        mobileLabel: "Organização",
        description: "Dados da empresa",
        to: "/settings/organization",
        icon: Building2,
    },
    {
        label: "Usuários",
        mobileLabel: "Usuários",
        description: "Acessos e permissões",
        to: "/settings/users",
        icon: Users,
    },
    {
        label: "Ordens de serviço",
        mobileLabel: "Ordens",
        description: "Preferências e campos",
        to: "/settings/work-orders",
        icon: ClipboardList,
    },
    {
        label: "Conta e segurança",
        mobileLabel: "Conta",
        description: "Perfil e segurança",
        to: "/settings/account",
        icon: ShieldCheck,
    },
];


export function SettingsSidebar() {
    return (
        <>
            {/* =====================================================
                MOBILE
            ===================================================== */}
            <nav
                className="
                    -mx-1
                    flex
                    gap-2
                    overflow-x-auto
                    px-1
                    pb-2

                    lg:hidden

                    [&::-webkit-scrollbar]:hidden
                    [scrollbar-width:none]
                "
            >
                {settingsItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                [
                                    "flex shrink-0 items-center gap-2",
                                    "rounded-xl border",
                                    "px-3.5 py-2.5",
                                    "text-sm font-medium",
                                    "transition-all duration-200",

                                    isActive
                                        ? [
                                            "border-[#2583ff]/25",
                                            "bg-[#0a2242]/80",
                                            "text-[#f8fafc]",
                                            "shadow-[0_0_20px_rgba(37,131,255,0.08)]",
                                        ].join(" ")
                                        : [
                                            "border-[#16345c]/25",
                                            "bg-[#010b1b]/30",
                                            "text-[#8290a8]",
                                            "hover:border-[#16345c]/50",
                                            "hover:bg-[#07182d]/60",
                                            "hover:text-[#a7b4c8]",
                                        ].join(" "),
                                ].join(" ")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={16}
                                        strokeWidth={1.8}
                                        className={
                                            isActive
                                                ? "text-[#3692ff]"
                                                : "text-[#56657d]"
                                        }
                                    />

                                    <span>
                                        {item.mobileLabel}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>


            {/* =====================================================
                DESKTOP
            ===================================================== */}
            <aside
                className="
                    hidden
                    w-[260px]
                    shrink-0
                    border-r
                    border-[#16345c]/40
                    pr-5

                    lg:block
                "
            >
                {/* TÍTULO */}
                <div className="mb-5 px-3">
                    <span
                        className="
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-[#56657d]
                        "
                    >
                        Configurações
                    </span>
                </div>


                {/* NAVEGAÇÃO */}
                <nav className="flex flex-col gap-1">
                    {settingsItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    [
                                        "group relative flex items-center gap-3",
                                        "rounded-xl px-3 py-3",
                                        "transition-all duration-200",

                                        isActive
                                            ? [
                                                "bg-[#0a2242]/70",
                                                "shadow-[inset_0_0_0_1px_rgba(37,131,255,0.12),0_0_24px_rgba(0,102,255,0.05)]",
                                            ].join(" ")
                                            : [
                                                "hover:bg-[#07182d]/70",
                                            ].join(" "),
                                    ].join(" ")
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* LINHA ATIVA */}
                                        {isActive && (
                                            <span
                                                className="
                                                    absolute
                                                    left-0
                                                    top-1/2
                                                    h-7
                                                    w-[2px]
                                                    -translate-y-1/2
                                                    rounded-full
                                                    bg-[#2583ff]
                                                    shadow-[0_0_12px_rgba(37,131,255,0.9)]
                                                "
                                            />
                                        )}


                                        {/* ÍCONE */}
                                        <div
                                            className={[
                                                "flex h-9 w-9 shrink-0 items-center justify-center",
                                                "rounded-lg",
                                                "transition-all duration-200",

                                                isActive
                                                    ? "bg-[#0d2b52] text-[#3692ff]"
                                                    : "text-[#63728a] group-hover:text-[#a7b4c8]",
                                            ].join(" ")}
                                        >
                                            <Icon
                                                size={18}
                                                strokeWidth={1.8}
                                            />
                                        </div>


                                        {/* TEXTO */}
                                        <div className="min-w-0">
                                            <p
                                                className={[
                                                    "text-sm font-medium",

                                                    isActive
                                                        ? "text-[#f4f8ff]"
                                                        : "text-[#a7b4c8]",
                                                ].join(" ")}
                                            >
                                                {item.label}
                                            </p>

                                            <p
                                                className="
                                                    mt-0.5
                                                    truncate
                                                    text-xs
                                                    text-[#56657d]
                                                "
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}