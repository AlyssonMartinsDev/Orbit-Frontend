import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { sidebarMenu } from "../constants/sidebar-menu";
import { useAuthStore } from "../store/auth.store";

interface AppSidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export function AppSidebar({ expanded, onToggle }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Topbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#050816]/95 px-4 py-4 backdrop-blur lg:hidden">
        <h1 className="text-xl font-bold text-white">Orbit</h1>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl p-2 hover:bg-white/10"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="fixed left-0 right-0 top-[65px] z-40 border-b border-white/10 bg-[#050816]/98 px-4 py-4 shadow-2xl backdrop-blur lg:hidden">
          <nav className="space-y-2">
            {sidebarMenu.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="w-full rounded-xl px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5"
              >
                {item.title}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
            >
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden
          h-screen
          flex-col
          border-r
          border-white/10
          bg-white/[0.03]
          transition-all
          duration-300
          lg:flex
          ${expanded ? "w-72" : "w-20"}
        `}
      >
        <div className="flex items-center justify-between p-5">
          {expanded && <h1 className="text-2xl font-bold text-white">Orbit</h1>}

          <button
            onClick={onToggle}
            className="rounded-xl p-2 transition hover:bg-white/10"
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-2 px-3">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-white/5"
              >
                <Icon size={20} />

                {expanded && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={20} />

            {expanded && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}