import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
async function setup(page, request, role = 'admin') {
    const login = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await request.post(`${API}/clients/`, { headers, data: { name: 'Cliente orçamento', phone: '11988887777' } });
    expect(response.ok()).toBe(true);
    const clientId = (await response.json()).data.id;
    const session = role === 'admin' ? token : (await (await request.post(`${API}/auth/login`, { data: { email: `${role}@example.com`, password: 'Orbit-test-123' } })).json()).data.access_token;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), session);
    return { headers, clientId };
}
async function create(page, clientId) {
    await page.goto('/quotes');
    await page.getByRole('link', { name: 'Novo orçamento', exact: true }).click();
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título do orçamento', { exact: false }).fill('Revisão completa');
    await page.getByLabel('Descrição do serviço', { exact: false }).fill('Revisar motor e substituir filtros.');
    await page.getByLabel('Valor do orçamento (R$)', { exact: false }).fill('1234.56');
    await page.getByLabel('Válido até', { exact: true }).fill('2099-12-31');
    await page.getByLabel('Condições e observações').fill('Prazo de execução: 5 dias.');
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    return Number(page.url().split('/').pop());
}
async function status(page, button) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
    await expect(page.getByRole('form', { name: 'Confirmar ação do orçamento' })).toHaveCount(0);
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

for (const width of [320, 1440]) {
    test(`orçamento editado, PDF, aprovação e conversão em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const { headers, clientId } = await setup(page, request);
        const id = await create(page, clientId);
        await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await page.getByLabel('Valor do orçamento (R$)', { exact: false }).fill('1450.75');
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(page.getByText(/R\$\s*1.450,75/)).toBeVisible();
        const download = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Exportar PDF', exact: true }).click();
        expect((await download).suggestedFilename()).toBe(`orcamento-${id}.pdf`);
        await status(page, 'Marcar como enviado');
        await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toHaveCount(0);
        await status(page, 'Registrar aprovação');
        await expect(page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('orcamento.png'), fullPage: true });
        await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
        await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
        await page.getByRole('link', { name: `Ver orçamento de origem #${id}`, exact: true }).click();
        await expect(page.getByRole('link', { name: /Abrir ordem de serviço #/ })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true })).toHaveCount(0);
        const quote = (await (await request.get(`${API}/quotes/${id}`, { headers })).json()).data;
        const order = (await (await request.get(`${API}/work_orders/${quote.work_order_id}`, { headers })).json()).data;
        expect(order.price).toBe('1450.75');
        expect(order.description).toContain('Prazo de execução: 5 dias.');
        expect(order.status_payment).toBe('PENDENTE');
        await page.goto('/quotes');
        await page.getByLabel('Buscar orçamento ou cliente').fill('Revisão');
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await page.getByLabel('Situação', { exact: true }).selectOption('CONVERTIDO');
        await expect(page.getByRole('link', { name: `Abrir orçamento #${id}`, exact: true })).toBeVisible();
    });
}

test('reenvio da conversão após resposta perdida não duplica a OS', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request);
    const id = await create(page, clientId);
    await status(page, 'Registrar aprovação');
    let first = true;
    await page.route(`${API}/quotes/${id}/convert`, async route => {
        if (!first) return route.continue();
        first = false;
        expect((await route.fetch()).ok()).toBe(true);
        await route.abort('failed');
    });
    await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Falha de conexão');
    await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
    await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
    const orders = (await (await request.get(`${API}/work_orders/`, { headers })).json()).data;
    expect(orders).toHaveLength(1);
});

test('operacional consulta orçamento e PDF sem ações de alteração', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request, 'operator');
    const response = await request.post(`${API}/quotes`, { headers, data: { client_id: clientId, title: 'Consulta operacional', description: 'Descrição', price: '100', request_id: crypto.randomUUID() } });
    const id = (await response.json()).data.id;
    await page.goto('/quotes');
    await expect(page.getByRole('link', { name: 'Novo orçamento', exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: `Abrir orçamento #${id}`, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Consulta operacional' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Registrar aprovação', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Exportar PDF', exact: true })).toBeVisible();
    await page.goto('/quotes/create');
    await expect(page.getByText('Somente administradores e gestores podem cadastrar orçamentos.')).toBeVisible();
});
