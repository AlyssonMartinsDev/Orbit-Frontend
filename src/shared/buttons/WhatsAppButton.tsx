import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
    phone?: string | null;
    size?: number;
}

export function WhatsAppButton({
    phone,
    size = 18,
}: WhatsAppButtonProps) {
    const handleClick = () => {
        if (!phone) {
            return;
        }

        // Garante que somente números sejam utilizados no link.
        const sanitizedPhone = phone.replace(/\D/g, "");

        if (!sanitizedPhone) {
            return;
        }

        // Telefones cadastrados no Orbit não possuem código do país.
        // Para números brasileiros, adicionamos o 55.
        const whatsappPhone = sanitizedPhone.startsWith("55")
            ? sanitizedPhone
            : `55${sanitizedPhone}`;

        window.open(
            `https://wa.me/${whatsappPhone}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!phone}
            title="Abrir conversa no WhatsApp"
            aria-label="Abrir conversa no WhatsApp"
            className="
                inline-flex
                items-center
                justify-center
                rounded-lg
                p-2
                text-emerald-400
                transition-all
                duration-200

                hover:bg-emerald-400/10
                hover:text-emerald-300

                disabled:cursor-not-allowed
                disabled:opacity-30
            "
        >
            <FaWhatsapp size={size} />
        </button>
    );
}