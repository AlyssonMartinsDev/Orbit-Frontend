import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSession, isCurrentSession } from "../services/session";

interface ResourceState<T> {
    key: string;
    revision: number;
    data: T | null;
    error: string | null;
}

export function useAsyncResource<T>(
    key: string,
    load: (signal: AbortSignal) => Promise<T>,
) {
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState<ResourceState<T> | null>(null);
    const refresh = useCallback(() => setRevision((value) => value + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        const sessionId = getSession().id;
        void load(controller.signal).then(
            (data) => {
                if (!controller.signal.aborted && isCurrentSession(sessionId)) {
                    setState({ key, revision, data, error: null });
                }
            },
            (error: unknown) => {
                if (
                    !controller.signal.aborted &&
                    isCurrentSession(sessionId) &&
                    !axios.isCancel(error)
                ) {
                    setState({
                        key,
                        revision,
                        data: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Não foi possível carregar os dados.",
                    });
                }
            },
        );
        return () => controller.abort();
    }, [key, load, revision]);

    const isCurrent = state?.key === key && state.revision === revision;
    return {
        data: state?.key === key ? state.data : null,
        error: isCurrent ? state.error : null,
        isLoading: !isCurrent,
        refresh,
    };
}
