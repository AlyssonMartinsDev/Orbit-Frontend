import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { GuestRoute } from "../../modules/auth/components/GuestRoute";
import { RouteErrorPage } from "../../shared/pages/RouteErrorPage";
import { Root, InitialLoading, ProtectedLayout } from "./RouteLayouts";

export const router = createBrowserRouter([
    {
        Component: Root,
        ErrorBoundary: RouteErrorPage,
        HydrateFallback: InitialLoading,
        children: [
            {
                path: "/",
                lazy: async () => ({
                    Component: (await import("../../pages/HomePage")).default,
                }),
            },
            {
                element: (
                    <GuestRoute>
                        <Outlet />
                    </GuestRoute>
                ),
                children: [
                    {
                        path: "/login",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/auth/pages/LoginPage")
                            ).LoginPage,
                        }),
                    },
                ],
            },
            {
                Component: ProtectedLayout,
                children: [
                    {
                        path: "/dashboard",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/dashboard/pages/DashboardPage")
                            ).DashboardPage,
                        }),
                    },
                    {
                        path: "/clients",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/clients/pages/ClientsOptionsPage")
                            ).ClientsOptionsPage,
                        }),
                    },
                    {
                        path: "/clients/create",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/clients/pages/CreateClientPage")
                            ).CreateClientPage,
                        }),
                    },
                    {
                        path: "/clients/list",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/clients/pages/ClientListPage")
                            ).ClientListPage,
                        }),
                    },
                    {
                        path: "/clients/:id/details",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/clients/pages/ClientsDetailPage")
                            ).ClientDetailsPage,
                        }),
                    },
                    {
                        path: "/clients/:id/edit",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/clients/pages/EditClientPage")
                            ).EditClientPage,
                        }),
                    },
                    {
                        path: "/work-orders",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/work-orders/pages/WorkOrdersOptionsPage")
                            ).WorkOrdersOptionsPage,
                        }),
                    },
                    {
                        path: "/quotes",
                        lazy: async () => ({ Component: (await import("../../modules/quotes/pages/QuotesPage")).QuotesPage }),
                    },
                    {
                        path: "/quotes/create",
                        lazy: async () => ({ Component: (await import("../../modules/quotes/pages/QuotesPage")).CreateQuotePage }),
                    },
                    {
                        path: "/quotes/:id",
                        lazy: async () => ({ Component: (await import("../../modules/quotes/pages/QuotesPage")).QuoteDetailsPage }),
                    },
                    {
                        path: "/work-orders/create",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/work-orders/pages/CreateWorkOrderPage")
                            ).CreateWorkOrderPage,
                        }),
                    },
                    {
                        path: "/work-orders/tracking",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/work-orders/pages/WorkOrderTrackingPage")
                            ).WorkOrderTrackingPage,
                        }),
                    },
                    {
                        path: "/work-orders/:id/edit",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/work-orders/pages/EditWorkOrderPage")
                            ).EditWorkOrderPage,
                        }),
                    },
                    {
                        path: "/work-orders/:id/details",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/work-orders/pages/WorkOrderDetailsPage")
                            ).WorkOrderDetailsPage,
                        }),
                    },
                    {
                        path: "/users",
                        element: <Navigate to="/settings/users" replace />,
                    },
                    {
                        path: "/settings",
                        lazy: async () => ({
                            Component: (
                                await import("../../modules/settings/pages/SettingsPage")
                            ).SettingsPage,
                        }),
                        children: [
                            {
                                path: "platform",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/settings/components/PlatformSettings")
                                    ).PlatformSettings,
                                }),
                            },
                            {
                                index: true,
                                element: <Navigate to="organization" replace />,
                            },
                            {
                                path: "organization",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/settings/components/OrganizationSettings")
                                    ).OrganizationSettings,
                                }),
                            },
                            {
                                path: "users",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/settings/components/UsersSettings")
                                    ).UsersSettings,
                                }),
                            },
                            {
                                path: "work-orders",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/settings/components/WorkOrderSettings")
                                    ).WorkOrderSettings,
                                }),
                            },
                            {
                                path: "custom-fields",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/custom-fields/pages/CustomFieldsPage")
                                    ).CustomFieldsPage,
                                }),
                            },
                            {
                                path: "account",
                                lazy: async () => ({
                                    Component: (
                                        await import("../../modules/settings/components/AccountSettings")
                                    ).AccountSettings,
                                }),
                            },
                        ],
                    },
                ],
            },
            {
                path: "*",
                lazy: async () => ({
                    Component: (await import("../../shared/pages/NotFoundPage"))
                        .NotFoundPage,
                }),
            },
        ],
    },
]);
