import {
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

import type { SidebarMenuItem } from "../types/sidebar.types";

export const sidebarMenu: SidebarMenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    path: "/clients",
    icon: Users,
  },
  {
    title: "Ordens de Serviço",
    path: "/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Prazos e acompanhamentos",
    path: "/followups",
    icon: CalendarClock,
  },
  {
    title: "Orçamentos",
    path: "/quotes",
    icon: FileText,
  },
  { title: "Estoque", path: "/inventory", icon: Package },
  {
    title: "Usuários",
    path: "/settings/users",
    icon: UserCog,
  },
  {
    title: "Configurações",
    path: "/settings",
    icon: Settings,
  },
];
