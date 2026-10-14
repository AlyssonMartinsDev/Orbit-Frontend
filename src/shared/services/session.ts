const TOKEN_KEY = "orbit_token";

interface Session {
    id: number;
    token: string | null;
}

let session: Session = {
    id: 0,
    token: localStorage.getItem(TOKEN_KEY),
};

const listeners = new Set<(session: Session) => void>();

function notifySessionChange(token: string | null) {
    session = { id: session.id + 1, token };
    listeners.forEach((listener) => listener(session));
    return session;
}

export function getSession(): Session {
    // O storage pode mudar em outra aba antes de seu evento ser processado.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token !== session.token) {
        notifySessionChange(token);
    }
    return session;
}

export function isCurrentSession(id: number | undefined): boolean {
    return getSession().id === id;
}

export function changeSession(token: string | null): Session {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }

    // Mesmo um novo login com o mesmo token invalida as operações anteriores.
    return notifySessionChange(token);
}

export function subscribeToSession(listener: (session: Session) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

window.addEventListener("storage", (event) => {
    if (
        event.storageArea === localStorage &&
        (event.key === TOKEN_KEY || event.key === null)
    ) {
        getSession();
    }
});
