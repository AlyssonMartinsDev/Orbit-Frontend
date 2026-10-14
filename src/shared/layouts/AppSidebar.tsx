import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sidebarMenu } from "../constants/sidebar-menu";
import { useAuthStore } from "../store/auth.store";
import { OrbitLogo } from "../components/OrbitLogo";
import { Modal } from "../components/modal";

interface AppSidebarProps {
    expanded: boolean;
    onToggle: () => void;
}

export function AppSidebar({ expanded, onToggle }: AppSidebarProps) {
    const [mobileMenuKey, setMobileMenuKey] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const mobileOpen = mobileMenuKey === location.key;
    const logout = useAuthStore((state) => state.logout);
    const activePath = sidebarMenu
        .filter(
            (item) =>
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`),
        )
        .sort((a, b) => b.path.length - a.path.length)[0]?.path;

    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 1024px)");
        const closeOnDesktop = () => {
            if (desktop.matches) setMobileMenuKey(null);
        };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);

    const handleLogout = () => {
        setMobileMenuKey(null);
        logout();
        navigate("/login", { replace: true });
    };
    const menu = (showLabels: boolean) =>
        sidebarMenu.map(({ title, path, icon: Icon }) => (
            <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuKey(null)}
                title={showLabels ? undefined : title}
                aria-label={title}
                aria-current={activePath === path ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${showLabels ? "" : "justify-center"} ${activePath === path ? "bg-[#0a2242] text-blue-300" : "text-[#a7b4c8] hover:bg-[#07182d] hover:text-white"}`}
            >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                {showLabels && <span>{title}</span>}
            </Link>
        ));

    return (
        <>
            <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-[#16345c]/50 bg-[#010b1b]/95 px-4 backdrop-blur-xl lg:hidden">
                <Link to="/dashboard" aria-label="Orbit — Dashboard">
                    <OrbitLogo variant="brand" size="sm" />
                </Link>
                <button
                    type="button"
                    aria-label="Abrir navegação"
                    aria-haspopup="dialog"
                    aria-expanded={mobileOpen}
                    onClick={() => {
                        setMobileMenuKey(location.key);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-[#a7b4c8] hover:bg-[#07182d]"
                >
                    <Menu size={22} />
                </button>
            </header>
            <Modal
                open={mobileOpen}
                title="Navegação"
                onClose={() => setMobileMenuKey(null)}
            >
                <nav aria-label="Menu principal" className="space-y-1">
                    {menu(true)}
                </nav>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-xl border-t border-[#16345c] px-3 text-red-300 hover:bg-red-400/10"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </Modal>
            <aside
                className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-[#16345c]/40 bg-[#051020] p-3 lg:flex ${expanded ? "w-64" : "w-20"}`}
            >
                <div
                    className={`mb-4 flex min-h-12 items-center ${expanded ? "justify-between" : "justify-center"}`}
                >
                    {expanded && (
                        <Link to="/dashboard">
                            <OrbitLogo variant="brand" size="sm" />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={
                            expanded
                                ? "Recolher navegação"
                                : "Expandir navegação"
                        }
                        aria-expanded={expanded}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#a7b4c8] hover:bg-[#0a2242]"
                    >
                        {expanded ? (
                            <PanelLeftClose size={21} />
                        ) : (
                            <PanelLeftOpen size={21} />
                        )}
                    </button>
                </div>
                <nav
                    aria-label="Menu principal"
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto"
                >
                    {menu(expanded)}
                </nav>
                <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sair"
                    title="Sair"
                    className={`mt-4 flex min-h-12 items-center gap-3 rounded-xl px-3 text-red-300 hover:bg-red-400/10 ${expanded ? "" : "justify-center"}`}
                >
                    <LogOut size={20} />
                    {expanded && "Sair"}
                </button>
            </aside>
        </>
    );
}
