import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { GlobalMessage } from "../feedback/GlobalMessage";
import { X } from "lucide-react";
import type { ModalProps } from "./modal.types";

export function Modal({
    open,
    title,
    subtitle,
    children,
    onClose,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!open || !dialog) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (
                previousFocus instanceof HTMLElement &&
                previousFocus.isConnected
            )
                previousFocus.focus();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={subtitle ? descriptionId : undefined}
            onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                const focusable = [
                    ...event.currentTarget.querySelectorAll<HTMLElement>(
                        "a[href], button, input, select, textarea, [tabindex]",
                    ),
                ].filter(
                    (element) =>
                        element.tabIndex >= 0 &&
                        !element.matches(":disabled") &&
                        element.getClientRects().length > 0,
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                )
                    onClose();
            }}
            className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-[#16345c] bg-[#051020] p-0 text-[#f8fafc] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm sm:max-h-[calc(100dvh-3rem)]"
        >
            <GlobalMessage />
            <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#16345c] p-4 sm:p-6">
                    <div className="min-w-0 break-words">
                        <h2
                            id={titleId}
                            className="text-lg font-semibold sm:text-xl"
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p
                                id={descriptionId}
                                className="mt-1 text-sm text-[#a7b4c8]"
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#a7b4c8] hover:bg-[#0a2242]"
                    >
                        <X size={20} />
                    </button>
                </header>
                <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </dialog>,
        document.body,
    );
}
