import axios, { CanceledError } from "axios";
import { changeSession, getSession, isCurrentSession } from "./session";

declare module "axios" {
    interface AxiosRequestConfig {
        orbitSessionId?: number;
    }
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const session = getSession();
        config.orbitSessionId = session.id;

        if (session.token && config.url !== "/auth/login") {
            config.headers.set("Authorization", `Bearer ${session.token}`);
        } else {
            config.headers.delete("Authorization");
        }

        return config;
    },
    undefined,
    // Captura a sessão no momento da chamada, antes de qualquer troca de conta.
    { synchronous: true },
);

api.interceptors.response.use(
    (response) => {
        if (!isCurrentSession(response.config.orbitSessionId)) {
            throw new CanceledError("Resposta de uma sessão anterior descartada.");
        }
        return response;
    },
    (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        const sessionId = error.config?.orbitSessionId;

        // Um 401 atrasado também não pode encerrar uma sessão mais recente.
        if (sessionId !== undefined && !isCurrentSession(sessionId)) {
            return Promise.reject(new CanceledError("A sessão desta requisição foi encerrada."));
        }

        if (
            error.response?.status === 401 &&
            error.config?.url !== "/auth/login" &&
            getSession().token
        ) {
            changeSession(null);
            return Promise.reject(new CanceledError("A sessão expirou."));
        }

        // Preserva o contrato de erros de negócio já utilizado pelas telas.
        if (error.response) {
            const body: unknown = error.response.data;
            if (body && typeof body === "object" && "success" in body && body.success === false && "message" in body && typeof body.message === "string") {
                return { ...error.response, data: body };
            }
            return { ...error.response, data: { success: false, message: "Não foi possível concluir a solicitação. Tente novamente.", status_code: error.response.status } };
        }

        return Promise.reject(error);
    },
);
