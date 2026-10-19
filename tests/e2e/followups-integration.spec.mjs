import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
async function setup(page, request, role = 'admin') {
    const login = await request.post(`${API}/auth/login`, { data: { email: `${role}@example.com`, password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await request.post(`${API}/work_orders/`, { headers, data: { client: { name: 'Cliente acompanhamento', phone: '11988887777' }, work_order: { title: 'Revisão de equipamento', description: 'Substituir peça', price: '120.00' } } });
    expect(response.ok()).toBe(true);
    const id = (await response.json()).data.id;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { id, headers, path: `/work-orders/${id}/details#acompanhamento` };
}
const panel = page => page.getByRole('region', { name: 'Prazos e acompanhamentos', exact: true });
async function edit(page) {
    await panel(page).getByRole('button', { name: 'Editar planejamento', exact: true }).click();
    await panel(page).getByLabel('Prazo de entrega', { exact: true }).fill('2025-01-10');
    await panel(page).getByLabel('Próximo retorno', { exact: true }).fill('2025-01-09');
    await panel(page).getByLabel('Responsável', { exact: true }).selectOption('3');
    await panel(page).getByLabel('Motivo ou resultado').fill('Aguardando chegada da peça');
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });
for (const width of [320, 1440]) {
    test(`planejamento, observação, retorno e agenda em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const order = await setup(page, request);
        await page.goto('/followups');
        await page.getByRole('button', { name: /^Sem prazo/ }).click();
        await page.getByRole('link', { name: `Acompanhar OS #${order.id}`, exact: true }).click();
        await edit(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await panel(page).getByRole('button', { name: 'Salvar planejamento', exact: true }).click();
        await expect(panel(page).getByText('Planejamento atualizado', { exact: true })).toBeVisible();
        await expect(panel(page).getByText('Entrega atrasada', { exact: true })).toBeVisible();
        await panel(page).getByLabel('Observação do acompanhamento').fill('Cliente confirmou a entrega da peça');
        await panel(page).getByRole('button', { name: 'Registrar observação', exact: true }).click();
        await expect(panel(page).getByText('Cliente confirmou a entrega da peça', { exact: true })).toBeVisible();
        await panel(page).screenshot({ path: info.outputPath('acompanhamento.png') });
        await panel(page).getByRole('link', { name: 'Ver agenda de serviços' }).click();
        await page.getByRole('button', { name: /^Atrasadas/ }).click();
        await expect(page.getByRole('link', { name: `Acompanhar OS #${order.id}` })).toBeVisible();
        await page.getByLabel('Filtrar por responsável').selectOption('3');
        await expect(page.getByRole('link', { name: `Acompanhar OS #${order.id}` })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('agenda.png'), fullPage: true });
        await page.getByRole('link', { name: `Acompanhar OS #${order.id}` }).click();
        await panel(page).getByRole('button', { name: 'Editar planejamento', exact: true }).click();
        await panel(page).getByLabel('Próximo retorno', { exact: true }).fill('');
        await panel(page).getByLabel('Motivo ou resultado').fill('Retorno concluído com o cliente');
        await panel(page).getByRole('button', { name: 'Salvar planejamento', exact: true }).click();
        await expect(panel(page).getByText('Retorno concluído com o cliente', { exact: true })).toBeVisible();
        await expect(panel(page).getByText('Retorno pendente', { exact: true })).toHaveCount(0);
        await page.reload();
        await expect(panel(page).getByText('Retorno concluído com o cliente', { exact: true })).toBeVisible();
    });
}
test('operacional registra observações, sem editar o planejamento', async ({ page, request }) => {
    const order = await setup(page, request, 'operator');
    await page.goto(order.path);
    await expect(panel(page).getByRole('button', { name: 'Editar planejamento', exact: true })).toHaveCount(0);
    await panel(page).getByLabel('Observação do acompanhamento').fill('Serviço em execução');
    await panel(page).getByRole('button', { name: 'Registrar observação', exact: true }).click();
    await expect(panel(page).getByText('Serviço em execução', { exact: true })).toBeVisible();
});
test('reenvio após resposta perdida não duplica histórico', async ({ page, request }) => {
    const order = await setup(page, request);
    let first = true;
    await page.route(`${API}/followups/${order.id}`, async route => {
        if (route.request().method() !== 'PUT' || !first) return route.continue();
        first = false;
        expect((await route.fetch()).ok()).toBe(true);
        await route.abort('failed');
    });
    await page.goto(order.path);
    await edit(page);
    await panel(page).getByRole('button', { name: 'Salvar planejamento', exact: true }).click();
    await expect(panel(page).getByRole('alert')).toContainText('Falha de conexão');
    await panel(page).getByRole('button', { name: 'Salvar planejamento', exact: true }).click();
    await expect(panel(page).getByText('Planejamento atualizado', { exact: true })).toBeVisible();
    const data = (await (await request.get(`${API}/followups/${order.id}`, { headers: order.headers })).json()).data;
    expect(data.events).toHaveLength(1);
    expect(data.version).toBe(1);
});
test('edição desatualizada informa conflito e permite recarregar', async ({ page, request }) => {
    const order = await setup(page, request);
    await page.goto(order.path);
    await edit(page);
    const response = await request.put(`${API}/followups/${order.id}`, { headers: order.headers, data: { version: 0, due_on: '2099-01-01', next_followup_on: null, assigned_to_id: 2, note: 'Outro gestor atualizou', request_id: crypto.randomUUID() } });
    expect(response.ok()).toBe(true);
    await panel(page).getByRole('button', { name: 'Salvar planejamento', exact: true }).click();
    await expect(panel(page).getByRole('alert')).toContainText('O planejamento foi alterado');
    await panel(page).getByRole('button', { name: 'Atualizar acompanhamento', exact: true }).click();
    await expect(panel(page).getByText('Outro gestor atualizou', { exact: true })).toBeVisible();
    await expect(panel(page).getByText('Gestor teste', { exact: true })).toBeVisible();
});
