import type { ApiResponse } from "../../../shared/types/api.types";

/* ===========================
 * Dashboard Cards
 * =========================== */

export interface DashboardCards {
  total_clients: number;
  open_work_orders: number;
  finished_work_orders: number;
}

/* ===========================
 * Dashboard Financial
 * =========================== */

export interface DashboardFinancial {
  current_month_revenue: number;
  pending_payments: number;
  average_ticket: number;
  completion_rate: number;
}

/* ===========================
 * Recent Work Orders
 * =========================== */

export interface DashboardRecentWorkOrder {
  id: number;
  client_name: string;
  title: string;
  status_service: string;
  status_payment: string;
  price: number;
  created_at: string;
}

/* ===========================
 * Dashboard Summary
 * =========================== */

export interface DashboardSummary {
  cards: DashboardCards;
  financial: DashboardFinancial;
  recent_work_orders: DashboardRecentWorkOrder[];
}

/* ===========================
 * API Response
 * =========================== */

export type DashboardSummaryResponse =
  ApiResponse<DashboardSummary>;