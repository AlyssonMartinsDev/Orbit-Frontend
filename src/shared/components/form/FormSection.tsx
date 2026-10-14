import type { ReactNode } from "react";

export const inputClass =
    "min-h-11 w-full min-w-0 rounded-xl border border-[#16345c] bg-[#010b1b]/60 px-3 py-3 text-base text-[#f8fafc] placeholder:text-[#8290a8] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 sm:text-sm";
export const primaryButtonClass =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
export const secondaryButtonClass =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#16345c] px-5 py-3 text-sm text-[#a7b4c8] hover:bg-[#0a2242] disabled:opacity-50 sm:w-auto";

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#16345c]/60 bg-[#051020]/70">
            <header className="border-b border-[#16345c]/40 p-4 sm:px-6 sm:py-5">
                <h2 className="font-semibold text-[#f8fafc]">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm leading-6 text-[#a7b4c8]">
                        {description}
                    </p>
                )}
            </header>
            <div className="grid min-w-0 gap-5 p-4 sm:grid-cols-2 sm:p-6">
                {children}
            </div>
        </section>
    );
}
