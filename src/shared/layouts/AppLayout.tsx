import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
    const [expanded, setExpanded] = useState(false);
    const navigation = useNavigation();

    return (
        <div className="min-h-dvh bg-[#010b1b] text-white lg:flex lg:items-start">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-lg focus:bg-blue-600 focus:p-3"
            >
                Ir para o conteúdo
            </a>
            <AppSidebar
                expanded={expanded}
                onToggle={() => setExpanded((value) => !value)}
            />
            <main
                id="main-content"
                tabIndex={-1}
                aria-busy={navigation.state !== "idle"}
                className="min-w-0 flex-1 px-3 py-4 outline-none sm:p-5 lg:p-6"
            >
                {navigation.state !== "idle" && (
                    <div role="status" className="mb-3 text-sm text-blue-300">
                        Carregando página…
                    </div>
                )}
                <div className="mx-auto w-full min-w-0 max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    );
}
