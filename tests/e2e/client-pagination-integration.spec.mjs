import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });
async function setup(page, request, count = 41) {
    const auth = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await auth.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    let oldest;
    for (let index = 0; index < count; index++) {
        const res = await request.post(`${API}/clients/`, { headers, data: { name: `Cliente página ${String(index).padStart(2, '0')}`, phone: String(11980000000 + index) } });
        expect(res.ok()).toBe(true);
        if (!index) oldest = (await res.json()).data;
    }
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { headers, oldest };
}
for (const width of [320, 1440]) {
    test(`lista e pesquisa no servidor, exclusão ajusta última página em ${width}px`, async ({ page, request }) => {
        await page.setViewportSize({ width, height: 900 });
        await setup(page, request);
        const urls = [];
        page.on('request', req => { if (req.method() === 'GET' && req.url().includes('/clients')) urls.push(new URL(req.url())); });
        await page.goto('/clients/list');
        await expect(page.getByText('41 clientes encontrados')).toBeVisible();
        await expect(page.getByText('Página 1 de 3')).toBeVisible();
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
        await expect(page.getByText('Página 2 de 3')).toBeVisible();
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
        await expect(page.getByText('Página 3 de 3')).toBeVisible();
        await page.getByRole('button', { name: 'Excluir Cliente página 00', exact: true }).filter({ visible: true }).click();
        await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
        await expect(page.getByText('40 clientes encontrados')).toBeVisible();
        await expect(page.getByText('Página 2 de 2')).toBeVisible();
        await page.getByRole('searchbox', { name: 'Buscar clientes' }).fill('Cliente página 21');
        await expect(page.getByText('1 cliente encontrado')).toBeVisible();
        await expect(page.getByText('Página 1 de 1')).toBeVisible();
        expect(urls.some(url => url.searchParams.get('search') === 'Cliente página 21')).toBe(true);
        expect(urls.some(url => url.pathname === '/clients/')).toBe(false);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

test('seletores de orçamento e OS encontram cliente fora da primeira página e preservam seleção', async ({ page, request }) => {
    const { oldest } = await setup(page, request);
    for (const path of ['/quotes/create', '/work-orders/create']) {
        await page.goto(path);
        await expect(page.getByText('41 clientes · Página 1 de 3')).toBeVisible();
        const search = page.getByRole('searchbox', { name: 'Buscar cliente cadastrado' });
        await search.fill('Cliente página 00');
        await expect(page.getByText('1 cliente · Página 1 de 1')).toBeVisible();
        const selector = page.getByRole('combobox', { name: 'Cliente *', exact: true });
        await selector.selectOption(String(oldest.id));
        await search.fill('Cliente página 40');
        await expect(selector.locator('option').filter({ hasText: 'Cliente página 40' })).toHaveCount(1);
        await expect(selector).toBeEnabled();
        await expect(selector).toHaveValue(String(oldest.id));
        await expect(selector.locator(`option[value="${oldest.id}"]`)).toContainText('Cliente página 00');
    }
});


test('orçamento preserva cliente de outra página ao salvar, recarregar e editar', async ({ page, request }) => {
    const { oldest } = await setup(page, request);
    await page.goto('/quotes/create');
    await page.getByRole('searchbox', { name: 'Buscar cliente cadastrado' }).fill('Cliente página 00');
    const selector = page.getByRole('combobox', { name: 'Cliente *', exact: true });
    await expect(selector.locator(`option[value="${oldest.id}"]`)).toHaveCount(1);
    await selector.selectOption(String(oldest.id));
    await page.getByLabel('Título do orçamento', { exact: false }).fill('Cliente fora da primeira página');
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço');
    await page.getByLabel('Valor unitário do item 1 (R$)', { exact: false }).fill('100');
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    await page.reload();
    await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
    await expect(selector).toHaveValue(String(oldest.id));
    await expect(selector.locator(`option[value="${oldest.id}"]`)).toContainText('Cliente página 00');
    await expect(page.getByText('41 clientes · Página 1 de 3')).toBeVisible();
});
