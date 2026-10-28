import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import axios from "axios";
import { createServer } from "vite";

// Executa os módulos reais com o carregador TS do Vite e uma API em memória.
// Nenhuma requisição é enviada ao backend.
const storage = new Map();
const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
};
const browser = new EventTarget();
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
let server;
let api;
let auth;
let clients;
let dashboard;
let fields;
let messages;

function response(config, data) {
    return { config, data, status: 200, statusText: "OK", headers: {} };
}

function httpError(config, status, data = { success: false, message: "Falha simulada" }) {
    return new axios.AxiosError("Falha simulada", "ERR_BAD_REQUEST", config, {}, {
        ...response(config, data), status,
    });
}

function queueRequests() {
    const pending = [];
    api.defaults.adapter = (config) => new Promise((resolve, reject) => {
        pending.push({
            config,
            resolve: (data) => resolve(response(config, data)),
            reject: (status) => reject(httpError(config, status)),
        });
    });
    return pending;
}

async function loginAs(token) {
    api.defaults.adapter = async (config) => {
        assert.equal(config.url, "/auth/login");
        assert.equal(config.headers.get("Authorization"), undefined);
        return response(config, { success: true, data: { access_token: token } });
    };
    await auth.getState().login({ email: "test@example.test", password: "test" });
}

function seedPrivateData() {
    clients.setState({ clients: [{ id: 1, name: "Conta A" }], selectedClient: { id: 1 }, isLoaded: true });
    fields.setState({ customFields: [{ id: 1, name: "Campo A" }], selectedCustomField: { id: 1 }, isLoaded: true });
    dashboard.setState({ summary: { account: "A" }, isLoaded: true });
    messages.getState().showMessage("Mensagem da conta A");
}

function assertEmptyCaches() {
    assert.deepEqual(clients.getState().clients, []);
    assert.equal(clients.getState().selectedClient, null);
    assert.equal(clients.getState().isLoaded, false);
    assert.deepEqual(fields.getState().customFields, []);
    assert.equal(fields.getState().selectedCustomField, null);
    assert.equal(fields.getState().isLoaded, false);
    assert.equal(dashboard.getState().summary, null);
    assert.equal(dashboard.getState().isLoaded, false);
    assert.equal(messages.getState().message, null);
    assert.equal(messages.getState().isVisible, false);
}

function emitStorage(key) {
    const event = new Event("storage");
    Object.defineProperties(event, { key: { value: key }, storageArea: { value: localStorage } });
    browser.dispatchEvent(event);
}

before(async () => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: localStorage });
    Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
    server = await createServer({
        configFile: false,
        cacheDir: "node_modules/.vite-unit-tests",
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, watch: null, hmr: false },
        appType: "custom",
    });
    ({ api } = await server.ssrLoadModule("/src/shared/services/api.ts"));
    ({ useAuthStore: auth } = await server.ssrLoadModule("/src/shared/store/auth.store.ts"));
    ({ useClientStore: clients } = await server.ssrLoadModule("/src/shared/store/client.store.ts"));
    ({ useCustomFieldStore: fields } = await server.ssrLoadModule("/src/shared/store/custom-field.store.ts"));
    ({ useDashboardStore: dashboard } = await server.ssrLoadModule("/src/shared/store/dashboard.store.ts"));
    ({ useMessageStore: messages } = await server.ssrLoadModule("/src/shared/store/message.store.ts"));
});

beforeEach(() => {
    auth.getState().logout();
    api.defaults.adapter = async () => { throw new Error("Requisição não simulada"); };
});

after(async () => {
    messages?.getState().hideMessage();
    await server?.close();
    for (const [key, descriptor] of [["window", previousWindow], ["localStorage", previousStorage]]) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    }
});

test("logout limpa dados, seleções, mensagens e autenticação", async () => {
    await loginAs("account-a");
    seedPrivateData();
    auth.getState().logout();
    assertEmptyCaches();
    assert.equal(localStorage.getItem("orbit_token"), null);
    assert.equal(auth.getState().token, null);
    assert.equal(auth.getState().isAuthenticated, false);
    assert.equal(auth.getState().isLoading, false);
});

test("troca de conta limpa o cache e consulta os clientes com o novo token", async () => {
    await loginAs("account-a");
    seedPrivateData();
    const oldId = auth.getState().sessionId;
    await loginAs("account-b");
    assertEmptyCaches();
    assert.notEqual(auth.getState().sessionId, oldId);
    let requests = 0;
    api.defaults.adapter = async (config) => {
        requests++;
        assert.equal(config.headers.get("Authorization"), "Bearer account-b");
        return response(config, { success: true, data: clientPage([{ id: 2, name: "Conta B" }]) });
    };
    await clients.getState().loadClients();
    await clients.getState().loadClients();
    assert.equal(requests, 1);
    assert.equal(clients.getState().clients[0].name, "Conta B");
});

test("respostas antigas não repovoam caches nem encerram o carregamento da nova sessão", async () => {
    await loginAs("account-a");
    const pending = queueRequests();
    const oldLoads = [clients.getState().loadClients(), fields.getState().loadCustomFields(), dashboard.getState().loadSummary()];
    await loginAs("account-b");
    const newPending = queueRequests();
    const newLoads = [clients.getState().loadClients(), fields.getState().loadCustomFields(), dashboard.getState().loadSummary()];
    pending.forEach((request) => request.resolve({ success: true, data: [{ id: 1 }] }));
    await Promise.all(oldLoads);
    assertEmptyCaches();
    for (const store of [clients, fields, dashboard]) assert.equal(store.getState().isLoading, true);
    newPending[0].resolve({ success: true, data: clientPage([{ id: 2 }]) });
    newPending[1].resolve({ success: true, data: [{ id: 2, display_order: 0 }] });
    newPending[2].resolve({ success: true, data: { account: "B" } });
    await Promise.all(newLoads);
    assert.equal(clients.getState().clients[0].id, 2);
    assert.equal(fields.getState().customFields[0].id, 2);
    assert.equal(dashboard.getState().summary.account, "B");
});

test("detalhes e mutações pendentes descartam respostas da sessão anterior", async () => {
    await loginAs("account-a");
    const pending = queueRequests();
    const details = assert.rejects(api.get("/clients/1/details"), axios.isCancel);
    const mutation = assert.rejects(api.post("/clients", { name: "Conta A" }), axios.isCancel);
    await loginAs("account-b");
    pending.forEach((request) => request.resolve({ success: true, data: { id: 1 } }));
    await Promise.all([details, mutation]);
    assertEmptyCaches();
});

test("401 da sessão atual encerra a autenticação e limpa todos os dados", async () => {
    await loginAs("account-a");
    seedPrivateData();
    api.defaults.adapter = async (config) => { throw httpError(config, 401); };
    await assert.rejects(api.get("/clients"), axios.isCancel);
    assert.equal(auth.getState().isAuthenticated, false);
    assert.equal(localStorage.getItem("orbit_token"), null);
    assertEmptyCaches();
});

test("401 atrasado não encerra a sessão nova", async () => {
    await loginAs("account-a");
    const pending = queueRequests();
    const rejected = assert.rejects(api.get("/clients"), axios.isCancel);
    await loginAs("account-b");
    clients.setState({ clients: [{ id: 2 }], isLoaded: true });
    pending[0].reject(401);
    await rejected;
    assert.equal(auth.getState().token, "account-b");
    assert.equal(auth.getState().isAuthenticated, true);
    assert.equal(clients.getState().clients[0].id, 2);
});

test("logout durante login impede autenticação por uma resposta tardia", async () => {
    const pending = queueRequests();
    const rejected = assert.rejects(auth.getState().login({ email: "a", password: "a" }), axios.isCancel);
    auth.getState().logout();
    pending[0].resolve({ success: true, data: { access_token: "account-a" } });
    await rejected;
    assert.equal(auth.getState().isAuthenticated, false);
    assert.equal(localStorage.getItem("orbit_token"), null);
});

test("tentativas concorrentes de login preservam apenas a mais recente", async () => {
    const pending = queueRequests();
    const oldLogin = assert.rejects(auth.getState().login({ email: "a", password: "a" }), axios.isCancel);
    const newLogin = auth.getState().login({ email: "b", password: "b" });
    pending[0].resolve({ success: true, data: { access_token: "account-a" } });
    await oldLogin;
    assert.equal(auth.getState().isLoading, true);
    pending[1].resolve({ success: true, data: { access_token: "account-b" } });
    await newLogin;
    assert.equal(auth.getState().token, "account-b");
    assert.equal(auth.getState().isLoading, false);
});

test("401 do login preserva a mensagem de credenciais inválidas", async () => {
    const failure = { success: false, message: "Credenciais inválidas" };
    api.defaults.adapter = async (config) => { throw httpError(config, 401, failure); };
    const result = await auth.getState().login({ email: "a", password: "wrong" });
    assert.deepEqual(result, failure);
    assert.equal(auth.getState().isLoading, false);
    assert.equal(auth.getState().isAuthenticated, false);
});

test("troca de conta em outra aba limpa os dados e muda a identidade da árvore protegida", async () => {
    await loginAs("account-a");
    seedPrivateData();
    const oldId = auth.getState().sessionId;
    localStorage.setItem("orbit_token", "account-b");
    emitStorage("orbit_token");
    assertEmptyCaches();
    assert.equal(auth.getState().token, "account-b");
    assert.notEqual(auth.getState().sessionId, oldId);
});

test("logout e limpeza do storage em outra aba encerram a sessão local", async () => {
    for (const key of ["orbit_token", null]) {
        await loginAs("account-a");
        seedPrivateData();
        localStorage.clear();
        emitStorage(key);
        assert.equal(auth.getState().isAuthenticated, false);
        assertEmptyCaches();
    }
});

test("resposta detecta a troca de aba mesmo antes do evento storage", async () => {
    await loginAs("account-a");
    const pending = queueRequests();
    const rejected = assert.rejects(api.get("/clients"), axios.isCancel);
    localStorage.setItem("orbit_token", "account-b");
    pending[0].resolve({ success: true, data: [{ id: 1 }] });
    await rejected;
    assert.equal(auth.getState().token, "account-b");
    assertEmptyCaches();
});

test("erros de negócio e rede da sessão atual mantêm seu comportamento", async () => {
    await loginAs("account-a");
    const failure = { success: false, message: "Dados inválidos" };
    api.defaults.adapter = async (config) => { throw httpError(config, 422, failure); };
    assert.deepEqual((await api.post("/clients", {})).data, failure);
    api.defaults.adapter = async (config) => { throw new axios.AxiosError("Offline", "ERR_NETWORK", config); };
    await assert.rejects(api.get("/clients"), { code: "ERR_NETWORK" });
    assert.equal(auth.getState().token, "account-a");
});


test("requisições concorrentes da mesma sessão preservam a mais recente", async () => {
    await loginAs("A");
    const requests = queueRequests();
    const older = clients.getState().loadClients({}, true);
    const newer = clients.getState().loadClients({}, true);
    requests[1].resolve({ success: true, data: clientPage([{ id: 2, name: "Novo" }]) });
    await newer;
    requests[0].resolve({ success: true, data: clientPage([{ id: 1, name: "Antigo" }]) });
    await older;
    assert.equal(clients.getState().clients[0].name, "Novo");
    assert.equal(clients.getState().isLoading, false);
});

test("mutação invalida listagem pendente sem ressuscitar cliente excluído", async () => {
    await loginAs("A");
    const requests = queueRequests();
    const loading = clients.getState().loadClients({}, true);
    clients.getState().removeClient(1);
    requests[0].resolve({ success: true, data: clientPage([{ id: 1, name: "Excluído" }]) });
    await loading;
    assert.deepEqual(clients.getState().clients, []);
    assert.equal(clients.getState().isLoading, false);
});

test("falha de cache expõe erro e permite tentar novamente", async () => {
    await loginAs("A");
    api.defaults.adapter = async () => { throw new Error("Sem conexão"); };
    await dashboard.getState().loadSummary();
    assert.equal(dashboard.getState().error, "Sem conexão");
    assert.equal(dashboard.getState().isLoaded, false);
    api.defaults.adapter = async config => response(config, { success: true, data: { cards: {} } });
    await dashboard.getState().loadSummary(true);
    assert.equal(dashboard.getState().error, null);
    assert.equal(dashboard.getState().isLoaded, true);
});

test("login sem token não produz falso sucesso", async () => {
    api.defaults.adapter = async config => response(config, { success: true, data: {} });
    await assert.rejects(auth.getState().login({ email: "test@example.test", password: "test" }), /sessão válida/);
    assert.equal(auth.getState().isAuthenticated, false);
    assert.equal(auth.getState().isLoading, false);
});

test("erro HTTP fora do contrato produz mensagem legível", async () => {
    await loginAs("A");
    api.defaults.adapter = async config => { throw httpError(config, 502, "<html>Bad gateway</html>"); };
    const result = await api.get("/clients/");
    assert.equal(result.status, 502);
    assert.equal(result.data.success, false);
    assert.equal(typeof result.data.message, "string");
});

test("WhatsApp preserva DDD 55 e aceita número internacional", async () => {
    const { getWhatsAppUrl, sanitizePhone, formatPhone } = await server.ssrLoadModule("/src/shared/utils/phone.ts");
    assert.equal(getWhatsAppUrl("(55) 99999-8888"), "https://wa.me/5555999998888");
    assert.equal(getWhatsAppUrl("+55 11 99999-8888"), "https://wa.me/5511999998888");
    assert.equal(getWhatsAppUrl("123"), null);
    assert.equal(sanitizePhone("+55 55 99999-8888"), "55999998888");
    assert.equal(formatPhone("55999998888"), "(55) 99999-8888");
});

test("formatadores toleram datas inválidas e preservam dias sem horário", async () => {
    const { formatDate, formatDateTime, formatCurrency } = await server.ssrLoadModule("/src/shared/utils/format.ts");
    assert.equal(formatDate("2026-10-06"), "06/10/2026");
    assert.equal(formatDate("invalid"), "—");
    assert.equal(formatDateTime(null), "—");
    assert.equal(formatCurrency("invalid"), "—");
});

function clientPage(items) { return { items, total: items.length, page: 1, page_size: 20, total_pages: 1 }; }
