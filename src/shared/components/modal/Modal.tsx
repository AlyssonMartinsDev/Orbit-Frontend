import { useEffect } from "react";
import { X } from "lucide-react";

import type { ModalProps } from "./modal.types";

export function Modal({
    open,
    title,
    subtitle,
    children,
    onClose,
}: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const handleOverlayClick = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#080C18] shadow-2xl"
            >
                <header className="flex items-start justify-between border-b border-white/10 p-6">
                    <div>
                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-white"
                        >
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-1 text-sm text-zinc-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}