import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

for (const width of [320, 1440]) {
    test(`recupera senha, persiste e invalida sessões em ${width}px`, async ({ page, request }) => {
        await page.setViewportSize({ width, height: 900 });
        const oldLogin = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
        const headers = { Authorization: `Bearer ${(await oldLogin.json()).data.access_token}` };
        await page.goto('/login');
        await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
        await expect(page).toHaveURL(/\/forgot-password$/);
        await expect(page.getByRole('heading', { name: 'Recuperar senha' })).toBeVisible();
        await page.getByLabel('E-mail', { exact: true }).fill('ADMIN@example.com');
        const delivery = page.waitForResponse(response => new URL(response.url()).pathname === '/auth/forgot-password' && response.request().method() === 'POST');
        await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
        expect((await delivery).status()).toBe(200);
        await expect(page.getByRole('status')).toContainText('Se houver uma conta ativa');
        await expect.poll(async () => (await (await request.get(`${API}/__test__/reset-mails`)).json()).length).toBe(1);
        const [{ token }] = await (await request.get(`${API}/__test__/reset-mails`)).json();
        await page.goto(`/reset-password#token=${token}`);
        await page.reload();
        await page.getByLabel('Nova senha', { exact: true }).fill('Nova-senha-123');
        await page.getByLabel('Confirmar nova senha').fill('Diferente-123');
        await page.getByRole('button', { name: 'Salvar nova senha' }).click();
        await expect(page.getByRole('alert')).toContainText('confirmação não corresponde');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByLabel('Confirmar nova senha').fill('Nova-senha-123');
        await page.getByRole('button', { name: 'Salvar nova senha' }).click();
        await expect(page).toHaveURL(/\/login$/);
        expect((await request.get(`${API}/users/me`, { headers })).status()).toBe(401);
        await page.getByLabel('E-mail', { exact: true }).fill('admin@example.com');
        await page.getByLabel('Senha', { exact: true }).fill('Nova-senha-123');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        // Recovery link is accessible even with a stale/current local session.
        await page.goto(`/reset-password#token=${token}`);
        await page.getByLabel('Nova senha', { exact: true }).fill('Outra-senha-123');
        await page.getByLabel('Confirmar nova senha').fill('Outra-senha-123');
        await page.getByRole('button', { name: 'Salvar nova senha' }).click();
        await expect(page.getByRole('alert')).toContainText('Link inválido ou expirado');
    });
}

test('link ausente e e-mail desconhecido são tratados sem expor contas', async ({ page, request }) => {
    await page.goto('/reset-password');
    await expect(page.getByRole('alert')).toContainText('Link inválido ou incompleto');
    await expect(page.getByRole('button', { name: 'Salvar nova senha' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Solicitar novo link' }).click();
    await page.getByLabel('E-mail').fill('unknown@example.com');
    const delivery = page.waitForResponse(response => new URL(response.url()).pathname === '/auth/forgot-password' && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
    expect((await delivery).status()).toBe(200);
    await expect(page.getByRole('status')).toContainText('Se houver uma conta ativa');
    expect(await (await request.get(`${API}/__test__/reset-mails`)).json()).toEqual([]);
});
