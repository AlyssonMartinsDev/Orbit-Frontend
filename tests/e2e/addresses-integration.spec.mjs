import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
const city = { id: 3550308, name: 'São Paulo', state: { id: 35, code: 'SP', name: 'São Paulo' } };
const found = { success: true, data: { zip_code: '01001000', street: 'Praça da Sé', neighborhood: 'Sé', city, provider: 'ViaCEP' } };
async function setup(page, request) {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
    const response = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await response.json()).data.access_token;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { Authorization: `Bearer ${token}` };
}
async function mockPostal(page) {
    await page.route('**/addresses/postal-codes/*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(found) }));
}
async function newClient(page) {
    await page.goto('/clients/create');
    await page.getByLabel('Nome *', { exact: true }).fill('Cliente com endereço');
    await page.getByLabel('Telefone *', { exact: true }).fill('11988887777');
    await page.getByLabel('Cadastrar endereço', { exact: true }).check();
}
for (const width of [320, 1440]) {
    test(`CEP e endereço persistem em cliente e organização em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const headers = await setup(page, request);
        await mockPostal(page);
        await newClient(page);
        await page.getByLabel('Número', { exact: true }).fill('120');
        await page.getByLabel('Complemento', { exact: true }).fill('Sala 7');
        await page.getByLabel('CEP', { exact: true }).fill('01001-000');
        await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Praça da Sé');
        await expect(page.getByLabel('UF *', { exact: true })).toHaveValue('35');
        await expect(page.getByLabel('Cidade *', { exact: true })).toHaveValue('3550308');
        await expect(page.getByLabel('Número', { exact: true })).toHaveValue('120');
        await expect(page.getByLabel('Complemento', { exact: true })).toHaveValue('Sala 7');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('endereco-cliente.png'), fullPage: true });
        await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
        await expect(page).toHaveURL(/\/clients\/list$/);
        const clients = (await (await request.get(`${API}/clients/`, { headers })).json()).data;
        expect(clients).toHaveLength(1);
        const client = clients[0];
        expect(client.address.city.id).toBe(3550308);
        expect(client.address.zip_code).toBe('01001000');
        await page.goto(`/clients/${client.id}/details`);
        await expect(page.getByRole('region', { name: 'Endereço cadastrado' })).toContainText('Praça da Sé, 120, Sala 7');
        await page.goto(`/clients/${client.id}/edit`);
        await expect(page.getByLabel('CEP', { exact: true })).toHaveValue('01001-000');
        await page.getByLabel('Número', { exact: true }).fill('122');
        await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
        await expect(page).toHaveURL(/\/clients\/list$/);
        await page.goto('/settings/organization');
        await page.getByLabel('Cadastrar endereço', { exact: true }).check();
        await page.getByLabel('CEP', { exact: true }).fill('01001000');
        await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Praça da Sé');
        await page.getByLabel('Número', { exact: true }).fill('300');
        await page.getByRole('button', { name: 'Salvar organização', exact: true }).click();
        await expect(page.getByText('Dados da organização atualizados.', { exact: true })).toBeVisible();
        await page.reload();
        await expect(page.getByLabel('Número', { exact: true })).toHaveValue('300');
        await expect(page.getByLabel('Cidade *', { exact: true })).toHaveValue('3550308');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('endereco-organizacao.png'), fullPage: true });
        const saved = (await (await request.get(`${API}/clients/${client.id}`, { headers })).json()).data;
        expect(saved.address.number).toBe('122');
        await page.goto(`/clients/${client.id}/edit`);
        await page.getByLabel('Cadastrar endereço', { exact: true }).uncheck();
        await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
        await expect(page).toHaveURL(/\/clients\/list$/);
        expect((await (await request.get(`${API}/clients/${client.id}`, { headers })).json()).data.address).toBeNull();
    });
}

test('CEP indisponível permite cadastro manual e mudar UF limpa a cidade', async ({ page, request }) => {
    await setup(page, request);
    await page.route('**/addresses/postal-codes/*', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Consulta indisponível. Preencha manualmente.' }) }));
    await newClient(page);
    await page.getByLabel('CEP', { exact: true }).fill('01001000');
    await expect(page.getByRole('alert')).toContainText('Preencha manualmente');
    await page.getByLabel('UF *', { exact: true }).selectOption('35');
    await page.getByLabel('Cidade *', { exact: true }).selectOption('3550308');
    await page.getByLabel('UF *', { exact: true }).selectOption('33');
    await expect(page.getByLabel('Cidade *', { exact: true })).toHaveValue('');
    await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
    await expect(page).toHaveURL(/\/clients\/create$/);
    await page.getByLabel('Cidade *', { exact: true }).selectOption('3304557');
    await page.getByLabel('Logradouro *', { exact: true }).fill('Estrada rural');
    await page.getByLabel('Número', { exact: true }).fill('S/N');
    await page.getByLabel('CEP', { exact: true }).fill('');
    await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
    await expect(page).toHaveURL(/\/clients\/list$/);
});

test('consulta atrasada não sobrescreve edição manual nem outro CEP', async ({ page, request }) => {
    await setup(page, request);
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    let started;
    const waiting = new Promise(resolve => { started = resolve; });
    await page.route('**/addresses/postal-codes/*', async route => {
        if (route.request().url().endsWith('01001000')) { started(); await gate; }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(found) });
    });
    await newClient(page);
    await page.getByLabel('CEP', { exact: true }).fill('01001000');
    await waiting;
    await expect(page.getByRole('button', { name: 'Salvar cliente', exact: true })).toBeDisabled();
    await page.getByLabel('Logradouro *', { exact: true }).fill('Nome corrigido manualmente');
    release();
    await expect(page.getByText(/Seus dados foram mantidos/)).toBeVisible();
    await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Nome corrigido manualmente');
    await page.getByRole('button', { name: 'Buscar CEP', exact: true }).click();
    await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Praça da Sé');
    // Deleting and typing the same CEP must query again, never leave saving disabled.
    await page.getByLabel('CEP', { exact: true }).fill('0100100');
    await page.getByLabel('CEP', { exact: true }).fill('01001000');
    await expect(page.getByText('Endereço encontrado. Confira os dados e informe o número e o complemento.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar cliente', exact: true })).toBeEnabled();
});

test('resposta de CEP anterior não altera CEP mais recente', async ({ page, request }) => {
    await setup(page, request);
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    let started;
    const waiting = new Promise(resolve => { started = resolve; });
    await page.route('**/addresses/postal-codes/*', async route => {
        if (route.request().url().endsWith('01001000')) {
            started(); await gate;
            try { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(found) }); } catch { /* Request was correctly canceled. */ }
        } else await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { zip_code: '20040020', street: 'Rua da Assembleia', neighborhood: 'Centro', city: { id: 3304557, name: 'Rio de Janeiro', state: { id: 33, code: 'RJ', name: 'Rio de Janeiro' } }, provider: 'ViaCEP' } }) });
    });
    await newClient(page);
    await page.getByLabel('CEP', { exact: true }).fill('01001000');
    await waiting;
    await page.getByLabel('CEP', { exact: true }).fill('20040020');
    await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Rua da Assembleia');
    release();
    await expect(page.getByLabel('Cidade *', { exact: true })).toHaveValue('3304557');
    await page.getByRole('button', { name: 'Salvar cliente', exact: true }).click();
    await expect(page).toHaveURL(/\/clients\/list$/);
});
