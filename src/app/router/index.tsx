import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../../modules/auth/pages/LoginPage";
import { DashboardPage } from "../../modules/dashboard/pages/DashboardPage";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { GuestRoute } from "../../modules/auth/components/GuestRoute";
import { AppLayout } from "../../shared/layouts/AppLayout";

// Rotas
import { NotFoundPage } from "../../shared/pages/NotFoundPage";
import HomePage from "../../pages/HomePage";
import { ClientsOptionsPage } from "../../modules/clients/pages/ClientsOptionsPage";
import { WorkOrdersOptionsPage } from "../../modules/work-orders/pages/WorkOrdersOptionsPage";

// Clients Routes
import { CreateClientPage } from "../../modules/clients/pages/CreateClientPage";
import { ClientListPage } from "../../modules/clients/pages/ClientListPage";
import { ClientDetailsPage } from "../../modules/clients/pages/ClientsDetailPage";
import { EditClientPage } from "../../modules/clients/pages/EditClientPage";

// Work Orders Routes
import { CreateWorkOrderPage } from "../../modules/work-orders/pages/CreateWorkOrderPage";
import { EditWorkOrderPage } from "../../modules/work-orders/pages/EditWorkOrderPage";
import { WorkOrderDetailsPage } from "../../modules/work-orders/pages/WorkOrderDetailsPage";
import { CustomFieldsPage } from "../../modules/custom-fields/pages/CustomFieldsPage";


// Settings Routes
// Settings Routes
import { SettingsPage } from "../../modules/settings/pages/SettingsPage";
import { OrganizationSettings } from "../../modules/settings/components/OrganizationSettings";
import { UsersSettings } from "../../modules/settings/components/UsersSettings";
import { WorkOrderSettings } from "../../modules/settings/components/WorkOrderSettings";
import { AccountSettings } from "../../modules/settings/components/AccountSettings";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: (
            <GuestRoute>
                <LoginPage />
            </GuestRoute>
        ),
    },

    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <DashboardPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/clients",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientsOptionsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/work-orders",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <WorkOrdersOptionsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/create",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CreateClientPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/:id/details",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientDetailsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/:id/edit",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <EditClientPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/list",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientListPage />
                </AppLayout>
            </ProtectedRoute>
        ),

    },
    {
        path: "/work-orders/create",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CreateWorkOrderPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/work-orders/:id/edit",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <EditWorkOrderPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/work-orders/:id/details",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <WorkOrderDetailsPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/settings/custom-fields",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CustomFieldsPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/settings",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <SettingsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
        children: [
            {
                path: "organization",
                element: <OrganizationSettings />,
            },
            {
                path: "users",
                element: <UsersSettings />,
            },
            {
                path: "work-orders",
                element: <WorkOrderSettings />,
            },
            {
                path: "account",
                element: <AccountSettings />,
            },
        ],
    },











    {
        path: "*",
        element: <NotFoundPage />,
    }
]);


