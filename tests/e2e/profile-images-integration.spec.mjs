import { expect, test } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64');
const largeImage = { name: 'foto-grande.png', mimeType: 'image/png', buffer: Buffer.concat([PNG, Buffer.alloc(3 * 1024 * 1024)]) };
async function login(page, request, email = 'admin@example.com') {
  const response = await request.post(`${API}/auth/login`, { data: { email, password: 'Orbit-test-123' } });
  const token = (await response.json()).data.access_token;
  await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
  return { Authorization: `Bearer ${token}` };
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });
for (const width of [320, 1440]) {
  test(`logo e foto salvam após reduzir imagem acima de 2 MB em ${width}px`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const headers = await login(page, request);
    await page.goto('/settings/organization');
    await page.getByLabel('Razão social / nome').fill('Rascunho preservado');
    await page.getByLabel('Selecionar logo', { exact: true }).setInputFiles(largeImage);
    await expect(page.getByText('Logo salva. Ela será incluída nas próximas exportações de PDF.')).toBeVisible();
    await expect(page.getByLabel('Razão social / nome')).toHaveValue('Rascunho preservado');
    await page.getByRole('button', { name: 'Salvar organização', exact: true }).click();
    await expect(page.getByText('Dados da organização atualizados.', { exact: true })).toBeVisible();
    await page.reload();
    const logo = page.getByRole('img', { name: 'Logo da organização', exact: true });
    await expect(logo).toHaveAttribute('src', /^data:image\/png;base64,/);
    expect(await logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const company = (await (await request.get(`${API}/organizations/me`, { headers })).json()).data;
    expect(company.logo_url.length).toBeLessThan(2_800_000);
    await page.goto('/settings/account');
    await page.getByLabel('Nome *', { exact: true }).fill('Nome em edição');
    await page.getByLabel('Selecionar foto de perfil', { exact: true }).setInputFiles(largeImage);
    await expect(page.getByText('Foto de perfil salva.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Nome *', { exact: true })).toHaveValue('Nome em edição');
    await page.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
    await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('img', { name: 'Foto de perfil', exact: true })).toHaveAttribute('src', /^data:image\/png;base64,/);
    expect((await (await request.get(`${API}/users/me`, { headers })).json()).data.avatar_url).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('profile-photo.png'), fullPage: true });
    await page.getByRole('button', { name: 'Remover foto de perfil' }).click();
    await expect(page.getByText('Foto de perfil removida.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('img', { name: 'Foto de perfil', exact: true })).toHaveCount(0);
    await page.goto('/settings/organization');
    await page.getByRole('button', { name: 'Remover logo' }).click();
    await expect(page.getByText('Logo removida.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('img', { name: 'Logo da organização' })).toHaveCount(0);
  });
}
test('operacional salva foto própria e não altera logo; imagem inválida mostra erro', async ({ page, request }) => {
  await login(page, request, 'operator@example.com');
  await page.goto('/settings/account');
  await page.getByLabel('Selecionar foto de perfil').setInputFiles({ name: 'quebrada.png', mimeType: 'image/png', buffer: Buffer.from('invalid') });
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível abrir a imagem' })).toBeVisible();
  await page.getByLabel('Selecionar foto de perfil').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByText('Foto de perfil salva.', { exact: true })).toBeVisible();
  await page.goto('/settings/organization');
  await expect(page.getByRole('button', { name: 'Enviar logo' })).toBeDisabled();
});
