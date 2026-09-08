import { Outlet } from "react-router-dom";

import { SettingsSidebar } from "../components/SettingsSidebar";

export function SettingsPage() {
    return (
        <div
            className="
                flex
                min-h-full
                flex-col

                rounded-2xl
                border border-[#16345c]/35

                bg-[radial-gradient(circle_at_top_right,_rgba(0,102,255,0.12),_transparent_30%),linear-gradient(135deg,_#051020_0%,_#010b1b_55%,_#031126_100%)]

                p-4
                shadow-[0_20px_60px_rgba(0,0,0,0.25)]

                sm:p-6
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <header className="mb-6 sm:mb-7">
                <h1
                    className="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-[#f8fafc]

                        sm:text-3xl
                    "
                >
                    Configurações
                </h1>

                <p
                    className="
                        mt-1
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[#8290a8]
                    "
                >
                    Gerencie sua organização e preferências do Orbit.
                </p>
            </header>


            {/* =====================================================
                LAYOUT INTERNO
            ===================================================== */}
            <div
                className="
                    flex
                    min-h-0
                    flex-1
                    flex-col

                    lg:flex-row
                "
            >
                {/* Navegação das configurações */}
                <SettingsSidebar />


                {/* =================================================
                    CONTEÚDO
                ================================================= */}
                <main
                    className="
                        min-w-0
                        w-full
                        flex-1

                        pt-6

                        lg:w-auto
                        lg:pl-8
                        lg:pt-0
                    "
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}