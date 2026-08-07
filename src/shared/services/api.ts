import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})


// Interceptador de requisicoes da api para adicionar o token de autenticacao no header Authorization
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("orbit_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;

    },
    (error) => {
        return Promise.reject(error);
    }
)


// Interceptador de respostas da api para tratar erros de autenticacao
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem("orbit_user");
            // Redirecionar para a página de login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response) {
            return Promise.resolve({
                data: error.response?.data,
            });
        }
        return Promise.reject(error);
    }
)