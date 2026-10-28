import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const API = 'http://127.0.0.1:8002';
async function session(page, request, email = 'admin@example.com') {
  const response = await request.post(`${API}/auth/login`, { data: { email, password: 'Orbit-test-123' } });
  const token = (await response.json()).data.access_token;
  await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
  return { Authorization: `Bearer ${token}` };
}
async function download(page, button, filename) {
  const ready = page.waitForEvent('download');
  await button.click();
  const result = await ready;
  expect(result.suggestedFilename()).toBe(filename);
  expect((await readFile(await result.path())).subarray(0, 5).toString()).toBe('%PDF-');
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });
for (const width of [320, 1440]) {
  test(`preferências, prévias e exportação real persistem em ${width}px`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const headers = await session(page, request);
    await page.goto('/settings/work-orders');
    await page.getByRole('button', { name: /Configurações de PDF/ }).click();
    await expect(page).toHaveURL(/\/settings\/pdf$/);
    await expect(page.getByRole('radio', { name: 'Clássico', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Moderno', exact: true }).check();
    await page.getByLabel('Padrão do nome do arquivo').fill('OS-{numero}-{cliente}');
    await download(page, page.getByRole('button', { name: 'Baixar prévia' }), 'OS-123-Cliente-Exemplo.pdf');
    const unsaved = await request.get(`${API}/organizations/me/pdf-settings`, { headers });
    expect((await unsaved.json()).data.work_order.template).toBe('CLASSIC');
    await page.getByRole('button', { name: 'Orçamentos', exact: true }).click();
    await page.getByRole('radio', { name: 'Compacto', exact: true }).check();
    await page.getByLabel('Padrão do nome do arquivo').fill('Proposta-{numero}');
    await download(page, page.getByRole('button', { name: 'Baixar prévia' }), 'Proposta-123.pdf');
    await page.getByLabel('Padrão do nome do arquivo').fill('{invalido}');
    await expect(page.getByRole('button', { name: 'Salvar preferências' })).toBeDisabled();
    await page.getByLabel('Padrão do nome do arquivo').fill('Proposta-{numero}');
    await page.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.getByText('Preferências de PDF salvas.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('pdf-settings.png'), fullPage: true });
    await page.reload();
    await expect(page.getByRole('radio', { name: 'Moderno', exact: true })).toBeChecked();
    await expect(page.getByLabel('Padrão do nome do arquivo')).toHaveValue('OS-{numero}-{cliente}');
    await page.getByRole('button', { name: 'Orçamentos', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Compacto', exact: true })).toBeChecked();
    await expect(page.getByLabel('Padrão do nome do arquivo')).toHaveValue('Proposta-{numero}');
    const created = await request.post(`${API}/work_orders/`, { headers, data: { client: { name: 'João Cliente', phone: '11988887777' }, work_order: { title: 'Documento configurado', description: 'Serviço', price: '150.00' } } });
    expect(created.ok()).toBe(true);
    const order = (await created.json()).data;
    await page.goto(`/work-orders/${order.id}/details`);
    await download(page, page.getByRole('button', { name: 'Exportar PDF', exact: true }), `OS-${order.id}-Joao-Cliente.pdf`);
    const quote = await request.post(`${API}/quotes/`, { headers, data: { client_id: order.client.id, request_id: randomUUID(), title: 'Proposta configurada', description: 'Serviço', price: '100.00' } });
    expect(quote.ok()).toBe(true);
    const qid = (await quote.json()).data.id;
    await page.goto(`/quotes/${qid}`);
    await download(page, page.getByRole('button', { name: 'Exportar PDF', exact: true }), `Proposta-${qid}.pdf`);
  });
}
test('operacional consulta e baixa prévia sem poder alterar', async ({ page, request }) => {
  const headers = await session(page, request, 'operator@example.com');
  await page.goto('/settings/pdf');
  await expect(page.getByRole('radio', { name: 'Moderno', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Padrão do nome do arquivo')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Salvar preferências' })).toHaveCount(0);
  await download(page, page.getByRole('button', { name: 'Baixar prévia' }), 'ordem-de-servico-123.pdf');
  expect((await request.put(`${API}/organizations/me/pdf-settings`, { headers, data: {} })).status()).toBe(403);
});
