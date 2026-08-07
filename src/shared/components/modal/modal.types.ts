import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}