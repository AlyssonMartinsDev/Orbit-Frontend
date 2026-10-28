import { test, expect } from '@playwright/test';

async function login(page) {
    await page.goto('/login');
    await page.getByLabel('E-mail', { exact: true }).fill('admin@homolog.example.com');
    await page.getByLabel('Senha', { exact: true }).fill(process.env.ORBIT_HOMOLOG_PASSWORD);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
}

for (const width of [320, 1440]) {
    test(`build compilado: login, paginação e pesquisa em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await login(page);
        await page.goto('/clients/list');
        await page.getByRole('searchbox', { name: 'Buscar clientes' }).fill('Paginação homologação');
        await expect(page.getByText('20 clientes encontrados')).toBeVisible();
        await page.getByRole('searchbox', { name: 'Buscar clientes' }).fill('Cliente persistência');
        await expect(page.getByText('1 cliente encontrado', { exact: true })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('searchbox', { name: 'Buscar clientes' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
        await expect(page.getByText('Página 2 de 2')).toBeVisible();
    });
}

test('orçamento: criar, recarregar e editar sem mocks na build compilada', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await login(page);
    await page.goto('/quotes/create');
    await page.getByRole('searchbox', { name: 'Buscar cliente cadastrado' }).fill('Cliente persistência');
    const client = page.getByRole('combobox', { name: 'Cliente *', exact: true });
    await expect(client.locator('option').filter({ hasText: 'Cliente persistência' })).toHaveCount(1);
    const selected = await client.locator('option').filter({ hasText: 'Cliente persistência' }).getAttribute('value');
    await client.selectOption(selected);
    await page.getByLabel('Título do orçamento', { exact: false }).fill('Homologação pelo navegador');
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço homologação navegador');
    await page.getByLabel('Valor unitário do item 1 (R$)', { exact: false }).fill('100');
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    await page.reload();
    await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
    await expect(client).toHaveValue(selected);
    await expect(page.getByLabel('Descrição do item 1', { exact: true })).toHaveValue('Serviço homologação navegador');
    await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço homologação editado');
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    await page.reload();
    await expect(page.getByText('Serviço homologação editado', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('login informa bloqueio temporário após cinco falhas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail', { exact: true }).fill('user@homolog.example.com');
    await page.getByLabel('Senha', { exact: true }).fill('wrong-password');
    for (let attempt = 1; attempt <= 5; attempt++) {
        const response = page.waitForResponse(res => new URL(res.url()).pathname === '/auth/login' && res.request().method() === 'POST');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        expect((await response).status()).toBe(attempt < 5 ? 401 : 429);
    }
    await expect(page.getByText('Muitas tentativas de login. Aguarde 15 minuto(s) e tente novamente.', { exact: true })).toBeVisible();
    await page.getByLabel('Senha', { exact: true }).fill(process.env.ORBIT_HOMOLOG_PASSWORD);
    const blocked = page.waitForResponse(res => new URL(res.url()).pathname === '/auth/login' && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    expect((await blocked).status()).toBe(429);
    await expect(page).toHaveURL(/\/login$/);
});
