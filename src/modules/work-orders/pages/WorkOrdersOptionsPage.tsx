import { ClipboardList, Plus } from "lucide-react";

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
                    title: "Acompanhar",
                    description: "Visualizar o andamento dos serviços.",
                    path: "/work-orders/tracking",
                    icon: ClipboardList,
                },
            ]}
        />
    );
}