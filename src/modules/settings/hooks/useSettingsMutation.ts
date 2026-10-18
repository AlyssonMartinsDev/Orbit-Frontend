import { useRef, useState } from "react";
import axios from "axios";
import { getSession, isCurrentSession } from "../../../shared/services/session";

export function useSettingsMutation() {
    const [sessionId] = useState(() => getSession().id);
    const pending = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const run = async <T>(
        action: () => Promise<T>,
        onSuccess: (result: T) => void,
    ) => {
        if (pending.current || !isCurrentSession(sessionId)) return;
        pending.current = true;
        setBusy(true);
        setError(null);
        try {
            const result = await action();
            if (isCurrentSession(sessionId)) onSuccess(result);
        } catch (cause) {
            if (isCurrentSession(sessionId) && !axios.isCancel(cause))
                setError(
                    axios.isAxiosError(cause)
                        ? "Falha de conexão. Tente novamente."
                        : cause instanceof Error
                          ? cause.message
                          : "Não foi possível concluir a operação.",
                );
        } finally {
            pending.current = false;
            setBusy(false);
        }
    };
    return { busy, error, run, isPending: () => pending.current };
}
