import { List, Pencil, Plus } from "lucide-react";

import { ModuleOptionsPage } from "../../../shared/components/module-options";

export function ClientsOptionsPage() {
    return (
        <ModuleOptionsPage
            title="Clientes"
            subtitle="Gerencie os clientes cadastrados no sistema."
            options={[
                {
                    title: "Criar",
                    description: "Cadastrar um novo cliente no sistema.",
                    path: "/clients/create",
                    icon: Plus,
                },
                {
                    title: "Editar",
                    description: "Alterar informações de um cliente existente.",
                    path: "/clients/edit",
                    icon: Pencil,
                },
                {
                    title: "Listar",
                    description: "Consultar todos os clientes cadastrados.",
                    path: "/clients/list",
                    icon: List,
                },
            ]}
        />
    );
}