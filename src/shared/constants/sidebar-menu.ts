import {
  ClipboardList,
  FileText,
  LayoutDashboard,
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
    title: "Orçamentos",
    path: "/quotes",
    icon: FileText,
  },
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
