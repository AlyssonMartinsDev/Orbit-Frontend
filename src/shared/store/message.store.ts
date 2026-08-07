import { create } from "zustand";


type MessageType = "success" | "error" | "info" | "warning";

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
        set({
            message,
            type,
            isVisible: true,
        });

        setTimeout(() => {
            set({
                isVisible: false,
                message: null,
            });
        }, 3000);
    },

    hideMessage: () => {
        set({
            isVisible: false,
            message: null,
        });
    },
}));