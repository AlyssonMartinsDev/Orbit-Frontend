import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
const PASSWORD = 'Orbit-test-123';
async function login(page, email='admin@example.com', password=PASSWORD) {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: /Entrar/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
}
async function apiAs(request, email) {
    const login = await request.post(`${API}/auth/login`, { data: { email, password: PASSWORD } });
    return { Authorization: `Bearer ${(await login.json()).data.access_token}` };
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

test('empresa, contatos, endereço e logo persistem após recarregar', async ({ page, request }) => {
    await login(page);
    await page.goto('/settings/organization');
    await page.getByLabel('Razão social / nome').fill('Empresa atualizada');
    await page.getByLabel('Nome fantasia').fill('Orbit oficina');
    await page.getByLabel('Telefone', { exact: true }).fill('11999998888');
    await page.getByLabel('E-mail da empresa').fill('contato@example.com');
    await page.getByLabel('Cadastrar endereço', { exact: true }).check();
    await page.getByLabel('UF *', { exact: true }).selectOption('35');
    await page.getByLabel('Cidade *', { exact: true }).selectOption('3550308');
    await page.getByLabel('Logradouro *', { exact: true }).fill('Rua de teste');
    await page.getByLabel('Número', { exact: true }).fill('123');
    // A valid 1x1 PNG; upload before saving to ensure it preserves unsaved text.
    await page.getByLabel('Selecionar logo').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64') });
    await expect(page.getByRole('img', { name: 'Logo da organização' })).toBeVisible();
    await expect(page.getByLabel('Razão social / nome')).toHaveValue('Empresa atualizada');
    await page.getByRole('button', { name: 'Salvar organização' }).click();
    await expect(page.getByText('Dados da organização atualizados.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Razão social / nome')).toHaveValue('Empresa atualizada');
    await expect(page.getByLabel('Logradouro *', { exact: true })).toHaveValue('Rua de teste');
    await expect(page.getByLabel('Número', { exact: true })).toHaveValue('123');
    await expect(page.getByRole('img', { name: 'Logo da organização' })).toHaveAttribute('src', /^data:image\/png;base64,/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const other = await request.get(`${API}/organizations/me`, { headers: await apiAs(request, 'other@example.com') });
    expect((await other.json()).data.name).toBe('Outra empresa');
    await page.getByRole('button', { name: 'Remover logo' }).click();
    await expect(page.getByRole('img', { name: 'Logo da organização' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Enviar logo' })).toBeVisible();
});

test('perfil e senha funcionam e sessões anteriores deixam de valer', async ({ page, request }) => {
    const oldHeaders = await apiAs(request, 'operator@example.com');
    await login(page, 'operator@example.com');
    await page.goto('/settings/account');
    await page.getByLabel('Nome', { exact: false }).first().fill('Nome atualizado');
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Nome', { exact: false }).first()).toHaveValue('Nome atualizado');
    await page.getByLabel('Senha atual').fill('senha-incorreta');
    await page.getByLabel('Nova senha', { exact: false }).first().fill('Nova-senha-123');
    await page.getByLabel('Confirmar nova senha').fill('Nova-senha-123');
    await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Senha atual incorreta');
    await page.getByLabel('Senha atual').fill(PASSWORD);
    await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await request.get(`${API}/users/me`, { headers: oldHeaders })).status()).toBe(401);
    await login(page, 'operator@example.com', 'Nova-senha-123');
});

test('administrador cria, altera perfil e desativa usuário com confirmação', async ({ page, request }) => {
    await login(page);
    await page.goto('/settings/users');
    await page.getByRole('button', { name: 'Novo usuário' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nome', { exact: false }).fill('Pessoa nova');
    await dialog.getByLabel('E-mail').fill('pessoa@example.com');
    await dialog.getByLabel('Perfil de acesso').selectOption('manager');
    await dialog.getByLabel('Senha inicial').fill('Inicial-123');
    await dialog.getByRole('button', { name: 'Criar usuário' }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    const row = page.getByRole('listitem').filter({ hasText: 'Pessoa nova' });
    await expect(row).toContainText('Gestor');
    await row.getByRole('button', { name: 'Editar Pessoa nova' }).click();
    await dialog.getByLabel('Perfil de acesso').selectOption('user');
    await dialog.getByLabel('Usuário ativo').uncheck();
    await dialog.getByRole('button', { name: 'Salvar usuário' }).click();
    await expect(dialog.getByText(/Confirmar a alteração de acesso/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirmar alteração' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(row).toContainText('Operacional');
    await expect(row).toContainText('Inativo');
    expect((await request.post(`${API}/auth/login`, { data: { email: 'pessoa@example.com', password: 'Inicial-123' } })).status()).toBe(401);
});

for (const role of ['manager', 'operator']) {
    test(`${role} tem somente os controles autorizados`, async ({ page, request }) => {
        await login(page, `${role}@example.com`);
        await page.goto('/settings/organization');
        await expect(page.getByLabel('Razão social / nome')).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Salvar organização' })).toHaveCount(0);
        await page.goto('/settings/users');
        await expect(page.getByRole('button', { name: 'Novo usuário' })).toHaveCount(0);
        if (role === 'manager') await expect(page.getByText('Admin teste', { exact: true })).toBeVisible();
        else await expect(page.getByText(/A gestão da equipe está disponível/)).toBeVisible();
        const headers = await apiAs(request, `${role}@example.com`);
        expect((await request.patch(`${API}/organizations/me`, { headers, data: { name: 'Proibido' } })).status()).toBe(403);
        expect((await request.post(`${API}/users/`, { headers, data: { name: 'Proibido', email: 'bad@example.com', role: 'admin', password: 'Initial-123' } })).status()).toBe(403);
    });
}
