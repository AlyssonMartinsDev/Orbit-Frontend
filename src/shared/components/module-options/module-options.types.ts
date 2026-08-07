import type { LucideIcon } from "lucide-react";

export interface ModuleOption {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export interface ModuleOptionsPageProps {
  title: string;
  subtitle: string;
  options: ModuleOption[];
}