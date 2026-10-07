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

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                onClose();
            }
        };


        // Impede a página atrás do modal de rolar.
        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [open, onClose]);


    if (!open) {
        return null;
    }


    const handleOverlayClick = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (
            event.target ===
            event.currentTarget
        ) {
            onClose();
        }
    };


    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="
                    flex
                    max-h-[calc(100vh-2rem)]
                    w-full
                    max-w-lg
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#16345C]/60
                    bg-[#051020]
                    shadow-2xl
                "
            >

                {/* HEADER */}
                <header className="flex shrink-0 items-start justify-between border-b border-[#16345C]/60 p-6">

                    <div className="min-w-0 pr-4">

                        <h2
                            id="modal-title"
                            className="text-xl font-semibold text-[#F8FAFC]"
                        >
                            {title}
                        </h2>


                        {subtitle && (
                            <p className="mt-1 text-sm text-[#8290A8]">
                                {subtitle}
                            </p>
                        )}

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="
                            shrink-0
                            rounded-xl
                            p-2
                            text-[#8290A8]
                            transition
                            hover:bg-[#0A2242]
                            hover:text-[#F8FAFC]
                        "
                    >
                        <X size={20} />
                    </button>

                </header>


                {/* CONTEÚDO COM SCROLL */}
                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        p-6
                    "
                >
                    {children}
                </div>

            </div>

        </div>
    );
}