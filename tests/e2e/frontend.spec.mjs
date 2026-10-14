import { test, expect } from '@playwright/test';
import { mockApi, tracking, order } from './fixtures.mjs';

const routes = ['/dashboard', '/clients', '/clients/list', '/clients/create', '/clients/1/details', '/clients/1/edit', '/work-orders', '/work-orders/create', '/work-orders/tracking', '/work-orders/1/details', '/work-orders/1/edit', '/settings/organization', '/settings/users', '/settings/work-orders', '/settings/custom-fields', '/settings/account'];
for (const width of [320, 375, 768, 1440]) {
    test(`rotas sem overflow e com uma montagem em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await mockApi(page);
        for (const route of routes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toHaveCount(1);
            await expect(page.getByText('Não foi possível abrir esta página')).toHaveCount(0);
            const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
            expect(dimensions.content, `${route} transborda em ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
            const duplicatedIds = await page.evaluate(() => {
                const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
                return ids.filter((id, index) => ids.indexOf(id) !== index);
            });
            expect(duplicatedIds, route).toEqual([]);
            if (width === 375 && route === '/work-orders/1/edit') await page.screenshot({ path: 'test-results/mobile-work-order.png', fullPage: true });
        }
        expect(errors).toEqual([]);
    });
}

test('menu mobile prende foco, fecha com Escape e devolve foco', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await mockApi(page);
    await page.goto('/dashboard');
    const trigger = page.getByRole('button', { name: 'Abrir navegação' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Navegação' });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole('link', { name: 'Clientes', exact: true }).click();
    await expect(page).toHaveURL(/\/clients$/);
    await expect(dialog).toHaveCount(0);
});

test('cliente aceita e-mail vazio, normaliza telefone e envia uma vez', async ({ page }) => {
    let count = 0;
    let payload;
    await mockApi(page, async (route, path) => {
        if (path !== '/clients/' || route.request().method() !== 'POST') return false;
        count++;
        payload = route.request().postDataJSON();
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.fulfill({ json: { success: true, data: { id: 2, ...payload } } });
        return true;
    });
    await page.goto('/clients/create');
    await page.getByLabel('Nome *', { exact: true }).fill(' Novo cliente ');
    await page.getByLabel('Telefone *', { exact: true }).fill('+55 55 99999-8888');
    await expect(page.getByRole('button', { name: 'Salvar cliente' })).toBeEnabled();
    await page.locator('form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
    await expect(page).toHaveURL(/\/clients\/list$/);
    expect(count).toBe(1);
    expect(payload).toMatchObject({ name: 'Novo cliente', phone: '55999998888', email: null });
});

test('edição de OS salva campos personalizados e aceita booleano obrigatório falso', async ({ page }) => {
    const calls = [];
    await mockApi(page, async (route, path) => {
        if (route.request().method() !== 'PUT') return false;
        calls.push({ path, data: route.request().postDataJSON() });
        await route.fulfill({ json: { success: true, data: order } });
        return true;
    });
    await page.goto('/work-orders/1/edit');
    await expect(page.getByRole('combobox', { name: 'Garantia' })).toHaveValue('false');
    await page.getByLabel('Título *').fill('Título atualizado');
    await page.getByRole('button', { name: 'Atualizar ordem' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({ path: '/work_orders/1', data: { title: 'Título atualizado' } });
    expect(calls[1]).toEqual({ path: '/custom-fields/1/custom-fields', data: { values: [{ field_definition_id: 1, value: 'false' }] } });
});

test('busca mais recente prevalece sobre resposta atrasada', async ({ page }) => {
    let olderStarted = false;
    await mockApi(page, async (route, path) => {
        if (path !== '/work_orders/tracking') return false;
        const query = new URL(route.request().url()).searchParams.get('search');
        if (query === 'antiga') { olderStarted = true; await new Promise(resolve => setTimeout(resolve, 1000)); }
        await route.fulfill({ json: { success: true, data: { ...tracking, items: [{ ...order, title: query || order.title }] } } });
        return true;
    });
    await page.goto('/work-orders/tracking');
    const search = page.locator('input[type="text"]').first();
    await search.fill('antiga');
    await expect.poll(() => olderStarted).toBe(true);
    await search.fill('recente');
    await expect(page.getByText('recente', { exact: true }).first()).toBeVisible();
    await page.waitForTimeout(1100);
    await expect(page.getByText('recente', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('antiga', { exact: true })).toHaveCount(0);
});

test('listagem permite recuperar falha de rede', async ({ page }) => {
    let first = true;
    await mockApi(page, async (route, path) => {
        if (path !== '/clients/' || !first) return false;
        first = false;
        await route.abort('failed');
        return true;
    });
    await page.goto('/clients/list');
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('cell', { name: 'Cliente de teste', exact: true })).toBeVisible();
});

test('falha nos campos personalizados informa salvamento parcial sem sair do formulário', async ({ page }) => {
    await mockApi(page, async (route, path) => {
        if (path !== '/custom-fields/1/custom-fields') return false;
        await route.fulfill({ status: 422, json: { success: false, message: 'Campo inválido' } });
        return true;
    });
    await page.goto('/work-orders/1/edit');
    await page.getByRole('button', { name: 'Atualizar ordem' }).click();
    await expect(page.getByText(/Dados principais salvos, mas os campos personalizados/)).toBeVisible();
    await expect(page).toHaveURL(/\/work-orders\/1\/edit$/);
    await expect(page.getByRole('button', { name: 'Atualizar ordem' })).toBeEnabled();
});

test('exclusão de OS exige confirmação e bloqueia repetição', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    let deleted = 0;
    await mockApi(page, async (route, path) => {
        if (path !== '/work_orders/1' || route.request().method() !== 'DELETE') return false;
        deleted++;
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.fulfill({ json: { success: true, message: 'Excluída' } });
        return true;
    });
    await page.goto('/work-orders/tracking');
    await page.getByRole('button', { name: 'Abrir ações da ordem 1' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Excluir ordem' }).click();
    expect(deleted).toBe(0);
    await dialog.getByRole('button', { name: 'Confirmar exclusão' }).evaluate(button => { button.click(); button.click(); });
    await expect(dialog).toHaveCount(0);
    expect(deleted).toBe(1);
});

test('logout em outra aba descarta o formulário aberto', async ({ page, context }) => {
    await mockApi(page);
    await page.goto('/clients/create');
    await page.getByLabel('Nome *', { exact: true }).fill('Dado privado não salvo');
    const otherTab = await context.newPage();
    await otherTab.goto('/');
    await otherTab.evaluate(() => localStorage.removeItem('orbit_token'));
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[value="Dado privado não salvo"]')).toHaveCount(0);
    await otherTab.close();
});

test('filtros, paginação extensa e rotas públicas cabem em 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 });
    await mockApi(page, async (route, path) => {
        if (path !== '/work_orders/tracking') return false;
        await route.fulfill({ json: { success: true, data: { ...tracking, pagination: { ...tracking.pagination, total: 400, total_pages: 20 } } } });
        return true;
    });
    await page.goto('/work-orders/tracking');
    await page.getByRole('button', { name: 'Período', exact: true }).click();
    await expect(page.getByLabel('Data inicial')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => localStorage.removeItem('orbit_token'));
    // The authentication init script is removed by using a new unauthenticated context.
    const publicContext = await page.context().browser().newContext({ viewport: { width: 320, height: 667 } });
    const publicPage = await publicContext.newPage();
    const origin = new URL(page.url()).origin;
    for (const path of ['/', '/login', '/pagina-inexistente']) {
        await publicPage.goto(origin + path);
        await publicPage.waitForLoadState('networkidle');
        await expect(publicPage.locator('main')).toHaveCount(1);
        expect(await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
    await publicContext.close();
});
