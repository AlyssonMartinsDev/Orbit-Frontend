import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
const PASSWORD = 'Orbit-test-123';

async function signIn(page, request, email, password = PASSWORD) {
    const login = await request.post(`${API}/auth/login`, { data: { email, password } });
    expect(login.ok()).toBe(true);
    const token = (await login.json()).data.access_token;
    await page.goto('/login');
    await page.evaluate(value => localStorage.setItem('orbit_token', value), token);
    await page.goto('/settings/account');
    return { Authorization: `Bearer ${token}` };
}

async function fillForm(page, email = 'novo.admin@example.com') {
    await page.getByLabel('Nome da organização', { exact: false }).fill('Oficina nova');
    await page.getByLabel('Nome fantasia').fill('Oficina órbita');
    await page.getByLabel('E-mail da organização').fill('contato@example.com');
    await page.getByLabel('Limite de usuários ativos').fill('3');
    await page.getByLabel('Nome do administrador', { exact: false }).fill('Novo administrador');
    await page.getByLabel('E-mail do administrador', { exact: false }).fill(email);
    await page.getByLabel('Senha inicial', { exact: false }).first().fill('Inicial-test-123');
    await page.getByLabel('Confirmar senha inicial', { exact: false }).fill('Inicial-test-123');
}

test.beforeEach(async ({ request }) => {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
});

for (const width of [320, 1440]) {
    test(`superadmin cria organização e administrador em ${width}px`, async ({ page, request }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const original = await signIn(page, request, 'superadmin@example.com');
        await page.getByRole('link', { name: /Administração da plataforma|^Plataforma$/ }).click();
        await expect(page).toHaveURL(/\/settings\/platform$/);
        await fillForm(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('platform-form.png'), fullPage: true });
        const saved = page.waitForResponse(res => res.url().endsWith('/platform/organizations') && res.request().method() === 'POST');
        await page.getByRole('button', { name: 'Criar organização e administrador', exact: true }).click();
        const response = await saved;
        expect(response.status()).toBe(201);
        const created = (await response.json()).data;
        await expect(page.getByRole('heading', { name: 'Organização e administrador criados', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Criar outra organização' }).click();
        await expect(page.getByLabel('Nome da organização', { exact: false })).toHaveValue('');
        await expect(page.getByLabel('Senha inicial', { exact: false }).first()).toHaveValue('');
        const superuser = await request.get(`${API}/users/me`, { headers: original });
        expect((await superuser.json()).data.organization_id).toBeNull();

        const headers = await signIn(page, request, 'novo.admin@example.com', 'Inicial-test-123');
        await expect(page.locator('a[href="/settings/platform"]')).toHaveCount(0);
        await page.goto('/settings/organization');
        await expect(page.getByLabel('Razão social / nome')).toHaveValue('Oficina nova');
        const me = (await (await request.get(`${API}/users/me`, { headers })).json()).data;
        expect(me.role).toBe('admin');
        expect(me.is_superuser).toBe(false);
        expect(me.organization_id).toBe(created.organization.id);
        expect((await request.get(`${API}/organizations/1`, { headers })).status()).toBe(404);
    });
}

for (const role of ['admin', 'manager', 'operator']) {
    test(`${role} não vê o painel nem consegue criar organizações pela API`, async ({ page, request }) => {
        const headers = await signIn(page, request, `${role}@example.com`);
        await expect(page.getByRole('heading', { name: 'Conta e segurança', exact: true })).toBeVisible();
        await expect(page.locator('a[href="/settings/platform"]')).toHaveCount(0);
        await page.goto('/settings/platform');
        await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Criar organização e administrador' })).toHaveCount(0);
        const response = await request.post(`${API}/platform/organizations`, { headers, data: { organization: { name: 'Forbidden' }, administrator: { name: 'Forbidden', email: 'forbidden@example.com', password: 'Initial-test-123' } } });
        expect(response.status()).toBe(403);
    });
}

test('e-mail duplicado preserva o formulário para correção', async ({ page, request }) => {
    await signIn(page, request, 'superadmin@example.com');
    await page.goto('/settings/platform');
    await fillForm(page, 'admin@example.com');
    await page.getByRole('button', { name: 'Criar organização e administrador' }).click();
    await expect(page.getByRole('alert')).toContainText('E-mail do administrador já cadastrado');
    await expect(page.getByLabel('Nome da organização', { exact: false })).toHaveValue('Oficina nova');
    await page.getByLabel('E-mail do administrador', { exact: false }).fill('corrigido@example.com');
    await page.getByRole('button', { name: 'Criar organização e administrador' }).click();
    await expect(page.getByRole('heading', { name: 'Organização e administrador criados' })).toBeVisible();
});
