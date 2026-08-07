import { useState } from "react";
import type { ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <main className="min-h-screen bg-[#050816] text-white">
            {/* Mobile */}
            <div className="lg:hidden">
                <AppSidebar
                    expanded={true}
                    onToggle={() => { }}
                />
            </div>

            {/* Desktop */}
            <div className="hidden min-h-screen lg:flex">
                <AppSidebar
                    expanded={expanded}
                    onToggle={() => setExpanded(!expanded)}
                />

                <section className="flex-1 overflow-auto p-8">
                    {children}
                </section>
            </div>

            {/* Conteúdo mobile */}
            <section className="lg:hidden">
                {children}
            </section>
        </main>
    );
}