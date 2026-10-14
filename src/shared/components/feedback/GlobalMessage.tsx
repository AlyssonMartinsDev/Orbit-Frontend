import { X } from "lucide-react";
import { useMessageStore } from "../../store/message.store";

const messageStyles = {
    success: "border-green-400/40 bg-[#09291c] text-green-100",
    error: "border-red-400/40 bg-[#35151b] text-red-100",
    warning: "border-amber-400/40 bg-[#33260d] text-amber-100",
    info: "border-blue-400/40 bg-[#0a2242] text-blue-100",
};
const titles = {
    success: "Sucesso",
    error: "Erro",
    warning: "Atenção",
    info: "Informação",
};

export function GlobalMessage() {
    const { message, type, isVisible, hideMessage } = useMessageStore();
    if (!isVisible || !message) return null;
    return (
        <div
            role={type === "error" ? "alert" : "status"}
            aria-live={type === "error" ? "assertive" : "polite"}
            className={`fixed left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[1100] mx-auto flex max-w-md items-start gap-2 rounded-2xl border p-4 text-sm shadow-2xl ${messageStyles[type]}`}
        >
            <div className="min-w-0 flex-1 break-words">
                <p className="font-semibold">{titles[type]}</p>
                <p className="mt-1">{message}</p>
            </div>
            <button
                type="button"
                onClick={hideMessage}
                aria-label="Fechar mensagem"
                className="-m-2 ml-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
            >
                <X size={18} />
            </button>
        </div>
    );
}
