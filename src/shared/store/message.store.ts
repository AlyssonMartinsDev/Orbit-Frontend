import { create } from "zustand";


type MessageType = "success" | "error" | "info" | "warning";
let messageTimeout: ReturnType<typeof setTimeout> | undefined;

interface MessageState {
    message: string | null,
    type: MessageType,
    isVisible: boolean,

    showMessage: (message: string, type?: MessageType) => void;
    hideMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    message: null,
    type: "info",
    isVisible: false,

    showMessage: (message, type = "info") => {
        clearTimeout(messageTimeout);
        set({
            message,
            type,
            isVisible: true,
        });

        messageTimeout = setTimeout(() => {
            set({
                isVisible: false,
                message: null,
            });
        }, 3000);
    },

    hideMessage: () => {
        clearTimeout(messageTimeout);
        set({
            isVisible: false,
            message: null,
            type: "info",
        });
    },
}));
