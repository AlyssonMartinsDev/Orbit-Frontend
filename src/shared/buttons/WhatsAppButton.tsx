import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "../utils/phone";

export function WhatsAppButton({ phone, size = 18 }: { phone?: string | null; size?: number }) {
    const url = getWhatsAppUrl(phone);
    return <button type="button" onClick={() => { if (url) window.open(url, "_blank", "noopener,noreferrer"); }} disabled={!url}
        title="Abrir conversa no WhatsApp" aria-label="Abrir conversa no WhatsApp"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-emerald-400 transition-colors hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-30">
        <FaWhatsapp size={size} />
    </button>;
}
