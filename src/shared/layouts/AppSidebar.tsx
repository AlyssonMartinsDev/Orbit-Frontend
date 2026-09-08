import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { sidebarMenu } from "../constants/sidebar-menu";
import { useAuthStore } from "../store/auth.store";

interface AppSidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export function AppSidebar({ expanded, onToggle }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const logout = useAuthStore((state) => state.logout);

  /**
   * Navega para uma rota e fecha o menu mobile.
   */
  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  /**
   * Finaliza a sessão e retorna para o login.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * Verifica se determinado item da sidebar corresponde
   * à rota atual.
   *
   * startsWith permite, por exemplo:
   *
   * /settings
   * /settings/organization
   * /settings/users
   *
   * continuarem marcando "Configurações" como ativo.
   */
  const isRouteActive = (path: string) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* =========================================================
          MOBILE TOPBAR
      ========================================================= */}
      <header
        className="
          sticky top-0 z-50
          flex items-center justify-between
          border-b border-[#16345c]/40
          bg-[#010b1b]/95
          px-4 py-4
          backdrop-blur-xl
          lg:hidden
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg
              bg-[#2583ff]/10
              shadow-[0_0_18px_rgba(37,131,255,0.12)]
            "
          >
            <span className="text-sm font-bold text-[#2583ff]">
              O
            </span>
          </div>

          <h1 className="text-xl font-semibold text-[#f8fafc]">
            Orbit
          </h1>
        </div>

        {/* Abrir / fechar menu */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="
            rounded-xl
            border border-transparent
            p-2
            text-[#8290a8]
            transition-all duration-200
            hover:border-[#16345c]/40
            hover:bg-[#07182d]
            hover:text-[#f8fafc]
          "
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}
      {mobileOpen && (
        <div
          className="
            fixed left-0 right-0 top-[65px] z-40
            border-b border-[#16345c]/40
            bg-[#010b1b]/98
            px-4 py-4
            shadow-[0_20px_50px_rgba(0,0,0,0.45)]
            backdrop-blur-xl
            lg:hidden
          "
        >
          <nav className="flex flex-col gap-1">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);

              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={[
                    "relative flex w-full items-center gap-3",
                    "rounded-xl px-4 py-3",
                    "text-left text-sm font-medium",
                    "transition-all duration-200",

                    active
                      ? [
                        "bg-[#0a2242]/70",
                        "text-[#f8fafc]",
                        "shadow-[inset_0_0_0_1px_rgba(37,131,255,0.12),0_0_20px_rgba(37,131,255,0.04)]",
                      ].join(" ")
                      : [
                        "text-[#8290a8]",
                        "hover:bg-[#07182d]",
                        "hover:text-[#f8fafc]",
                      ].join(" "),
                  ].join(" ")}
                >
                  {/* Indicador da rota ativa */}
                  {active && (
                    <span
                      className="
                        absolute left-0 top-1/2
                        h-6 w-[2px]
                        -translate-y-1/2
                        rounded-full
                        bg-[#2583ff]
                        shadow-[0_0_10px_rgba(37,131,255,0.9)]
                      "
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className={
                      active
                        ? "text-[#3692ff]"
                        : "text-[#56657d]"
                    }
                  />

                  <span>{item.title}</span>
                </button>
              );
            })}

            {/* Logout mobile */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                mt-3 flex w-full items-center gap-3
                rounded-xl
                border-t border-[#16345c]/30
                px-4 py-3
                text-left text-sm font-medium
                text-red-400
                transition-all duration-200
                hover:bg-red-500/[0.08]
                hover:text-red-300
              "
            >
              <LogOut size={19} strokeWidth={1.8} />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}
      <aside
        className={`
          hidden
          h-screen
          shrink-0
          flex-col
          border-r
          border-[#16345c]/35
          bg-[radial-gradient(circle_at_top,_rgba(37,131,255,0.07),_transparent_25%),linear-gradient(180deg,_#051020_0%,_#010b1b_100%)]
          shadow-[8px_0_40px_rgba(0,0,0,0.15)]
          transition-[width]
          duration-300
          lg:flex
          ${expanded ? "w-72" : "w-20"}
        `}
      >
        {/* =====================================================
            HEADER / LOGO
        ===================================================== */}
        <div
          className={[
            "flex h-[76px] items-center",
            expanded
              ? "justify-between px-5"
              : "justify-center px-3",
          ].join(" ")}
        >
          {expanded && (
            <div className="flex items-center gap-3">
              {/* Símbolo Orbit */}
              <div
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-xl
                  border border-[#2583ff]/15
                  bg-[#2583ff]/10
                  shadow-[0_0_20px_rgba(37,131,255,0.12)]
                "
              >
                <span className="text-base font-bold text-[#2583ff]">
                  O
                </span>
              </div>

              <div>
                <h1
                  className="
                    text-xl font-semibold
                    tracking-tight
                    text-[#f8fafc]
                  "
                >
                  Orbit
                </h1>

                <p className="text-[10px] text-[#56657d]">
                  Management System
                </p>
              </div>
            </div>
          )}

          {/* Toggle */}
          <button
            type="button"
            onClick={onToggle}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              border border-transparent
              text-[#56657d]
              transition-all duration-200
              hover:border-[#16345c]/50
              hover:bg-[#07182d]
              hover:text-[#f8fafc]
            "
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Separador */}
        <div className="mx-4 h-px bg-[#16345c]/25" />

        {/* =====================================================
            NAVIGATION
        ===================================================== */}
        <nav className="mt-5 flex flex-1 flex-col gap-1.5 px-3">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.path);

            return (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!expanded ? item.title : undefined}
                className={[
                  "group relative flex w-full items-center",
                  "rounded-xl py-3",
                  "transition-all duration-200",

                  expanded
                    ? "gap-4 px-4"
                    : "justify-center px-0",

                  active
                    ? [
                      "bg-[#0a2242]/70",
                      "text-[#f8fafc]",
                      "shadow-[inset_0_0_0_1px_rgba(37,131,255,0.10),0_0_24px_rgba(37,131,255,0.04)]",
                    ].join(" ")
                    : [
                      "text-[#8290a8]",
                      "hover:bg-[#07182d]/80",
                      "hover:text-[#f8fafc]",
                    ].join(" "),
                ].join(" ")}
              >
                {/* Barra azul da rota ativa */}
                {active && (
                  <span
                    className="
                      absolute left-0 top-1/2
                      h-7 w-[2px]
                      -translate-y-1/2
                      rounded-full
                      bg-[#2583ff]
                      shadow-[0_0_12px_rgba(37,131,255,0.9)]
                    "
                  />
                )}

                {/* Ícone */}
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center",
                    "rounded-lg",
                    "transition-all duration-200",

                    active
                      ? [
                        "bg-[#2583ff]/10",
                        "text-[#3692ff]",
                        "shadow-[0_0_15px_rgba(37,131,255,0.06)]",
                      ].join(" ")
                      : [
                        "text-[#56657d]",
                        "group-hover:text-[#a7b4c8]",
                      ].join(" "),
                  ].join(" ")}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </div>

                {/* Nome */}
                {expanded && (
                  <span
                    className={[
                      "truncate text-sm font-medium",
                      active
                        ? "text-[#f8fafc]"
                        : "text-[#8290a8] group-hover:text-[#f8fafc]",
                    ].join(" ")}
                  >
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* =====================================================
            FOOTER / LOGOUT
        ===================================================== */}
        <div
          className="
            border-t border-[#16345c]/25
            p-3
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            title={!expanded ? "Sair" : undefined}
            className={[
              "group flex w-full items-center",
              "rounded-xl py-3",
              "text-red-400/80",
              "transition-all duration-200",
              "hover:bg-red-500/[0.07]",
              "hover:text-red-300",

              expanded
                ? "gap-4 px-4"
                : "justify-center px-0",
            ].join(" ")}
          >
            <div
              className="
                flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-lg
                transition
                group-hover:bg-red-500/[0.08]
              "
            >
              <LogOut size={19} strokeWidth={1.8} />
            </div>

            {expanded && (
              <span className="text-sm font-medium">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}