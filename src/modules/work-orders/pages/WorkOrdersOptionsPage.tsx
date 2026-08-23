import { ClipboardList, List, Plus, Settings2 } from "lucide-react";

import { ModuleOptionsPage } from "../../../shared/components/module-options";

export function WorkOrdersOptionsPage() {
    return (
        <ModuleOptionsPage
            title="Ordens de Serviço"
            subtitle="Gerencie as ordens de serviço, status, pagamentos e atendimentos."
            options={[
                {
                    title: "Criar",
                    description: "Cadastrar uma nova ordem de serviço.",
                    path: "/work-orders/create",
                    icon: Plus,
                },
                {
                    title: "Criar Campo Personalizado",
                    description: "Criar um novo campo personalizado.",
                    path: "/settings/custom-fields",
                    icon: Settings2,
                },
                {
                    title: "Listar",
                    description: "Consultar todas as ordens de serviço.",
                    path: "/work-orders/list",
                    icon: List,
                },
                {
                    title: "Acompanhar",
                    description: "Visualizar o andamento dos serviços.",
                    path: "/work-orders/tracking",
                    icon: ClipboardList,
                },
            ]}
        />
    );
}