import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
async function setup(page, request, role = 'admin') {
    const login = await request.post(`${API}/auth/login`, { data: { email: `${role}@example.com`, password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const created = await request.post(`${API}/work_orders/`, { headers, data: { client: { name: 'Cliente pagamentos', phone: '11988887777' }, work_order: { title: 'Serviço com recebimentos', description: 'Revisão', price: '100.00' } } });
    expect(created.ok()).toBe(true);
    const id = (await created.json()).data.id;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { id, headers, path: `/work-orders/${id}/details#recebimentos`, api: `${API}/work_orders/${id}/payments` };
}
async function register(page, amount) {
    const panel = page.getByRole('region', { name: 'Pagamentos da OS', exact: true });
    await expect(panel).toBeVisible();
    if (await panel.getByRole('radio', { name: 'Pagamento parcial', exact: true }).count()) await panel.getByRole('radio', { name: 'Pagamento parcial', exact: true }).check();
    await panel.getByLabel('Valor do pagamento (R$)', { exact: false }).fill(amount);
    await panel.getByRole('button', { name: 'Vincular pagamento parcial', exact: true }).click();
    await expect(page.getByText('Pagamento vinculado.', { exact: true })).toBeVisible();
    return panel;
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

test('pagamento total dispensa digitação do valor e mantém data e forma escolhidas', async ({ page, request }) => {
    const order = await setup(page, request);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(order.path);
    const panel = page.getByRole('region', { name: 'Pagamentos da OS' });
    await expect(panel.getByRole('radio', { name: 'Pagamento total', exact: true })).toBeChecked();
    await expect(panel.getByLabel('Valor do pagamento (R$)', { exact: false })).toHaveCount(0);
    await panel.getByLabel('Forma de pagamento').selectOption('DINHEIRO');
    await panel.getByLabel('Data do pagamento', { exact: false }).fill('2025-01-15');
    await panel.getByRole('button', { name: 'Vincular pagamento total', exact: true }).click();
    await expect(panel.getByRole('form', { name: 'Vincular pagamento' })).toHaveCount(0);
    const data = (await (await request.get(order.api, { headers: order.headers })).json()).data;
    expect(data.status_payment).toBe('PAGO');
    expect(Number(data.balance)).toBe(0);
    expect(data.payments).toHaveLength(1);
    expect(Number(data.payments[0].amount)).toBe(100);
    expect(data.payments[0].method).toBe('DINHEIRO');
    expect(data.payments[0].received_on).toBe('2025-01-15');
});

for (const width of [320, 1440]) {
    test(`recebimento parcial, quitação, cancelamento e dashboard em ${width}px`, async ({ page, request }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const order = await setup(page, request);
        await page.goto(order.path);
        const panel = await register(page, '30.00');
        await expect(panel.locator('dl')).toContainText('70,00');
        expect((await (await request.get(order.api, { headers: order.headers })).json()).data.status_payment).toBe('PARCIAL');
        await page.reload();
        await expect(panel.locator('dl')).toContainText('30,00');
        await panel.getByRole('button', { name: 'Quitar saldo restante', exact: true }).click();
        await expect(page.getByText('Pagamento vinculado.', { exact: true })).toBeVisible();
        await expect(panel.getByRole('form', { name: 'Vincular pagamento' })).toHaveCount(0);
        const data = (await (await request.get(order.api, { headers: order.headers })).json()).data;
        expect(data.status_payment).toBe('PAGO');
        const partial = data.payments.find(payment => Number(payment.amount) === 30);
        await panel.getByRole('button', { name: `Cancelar lançamento #${partial.id}`, exact: true }).click();
        await panel.getByLabel('Motivo do cancelamento', { exact: false }).fill('Recebimento registrado por engano');
        await panel.getByRole('button', { name: 'Confirmar cancelamento' }).click();
        await expect(panel.getByText(/Motivo: Recebimento registrado por engano/)).toBeVisible();
        await expect(panel.locator('dl')).toContainText('30,00');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await panel.screenshot({ path: testInfo.outputPath('recebimentos.png') });
        const financial = (await (await request.get(`${API}/dashboard/summary`, { headers: order.headers })).json()).data.financial;
        expect(Number(financial.current_month_revenue)).toBe(70);
        expect(Number(financial.pending_payments)).toBe(30);
        await page.goto('/dashboard');
        await expect(page.getByText(/R\$\s*70,00/).first()).toBeVisible();
    });
}

test('reenvio após falha de rede não duplica recebimento confirmado no servidor', async ({ page, request }) => {
    const order = await setup(page, request);
    let first = true;
    await page.route(order.api, async route => {
        if (route.request().method() !== 'POST' || !first) return route.continue();
        first = false;
        const result = await route.fetch();
        expect(result.ok()).toBe(true);
        await route.abort('failed');
    });
    await page.goto(order.path);
    await page.getByRole('radio', { name: 'Pagamento parcial', exact: true }).check();
    await page.getByLabel('Valor do pagamento (R$)', { exact: false }).fill('30.00');
    await page.getByRole('button', { name: 'Vincular pagamento parcial', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Falha de conexão');
    await page.getByRole('button', { name: 'Vincular pagamento parcial', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Pagamentos da OS' }).locator('dl')).toContainText('30,00');
    const data = (await (await request.get(order.api, { headers: order.headers })).json()).data;
    expect(data.payments).toHaveLength(1);
    expect(Number(data.received)).toBe(30);
});

for (const role of ['operator', 'manager']) {
    test(`${role} recebe apenas as ações autorizadas`, async ({ page, request }) => {
        const order = await setup(page, request, role);
        await page.goto(order.path);
        const panel = page.getByRole('region', { name: 'Pagamentos da OS' });
        await expect(panel).toBeVisible();
        if (role === 'operator') {
            await expect(panel.getByRole('form', { name: 'Vincular pagamento' })).toHaveCount(0);
        } else {
            await register(page, '10.00');
            await expect(panel.locator('dl')).toContainText('90,00');
            await expect(panel.getByRole('button', { name: /Cancelar lançamento/ })).toHaveCount(0);
        }
    });
}

test('histórico legado só ganha saldo confirmado após revisão explícita', async ({ page, request }) => {
    const order = await setup(page, request);
    expect((await request.post(`${API}/__test__/legacy-payment/${order.id}`)).ok()).toBe(true);
    await page.goto(order.path);
    const panel = page.getByRole('region', { name: 'Pagamentos da OS' });
    await expect(panel.locator('dl')).toContainText('Em revisão');
    await expect(panel.getByRole('radio', { name: 'Pagamento total', exact: true })).toHaveCount(0);
    await register(page, '40.00');
    await expect(panel.locator('dl')).toContainText('Em revisão');
    await panel.getByRole('button', { name: 'Concluir revisão do histórico' }).click();
    await expect(panel.getByText(/Confirma que todos os recebimentos anteriores/)).toBeVisible();
    await panel.getByRole('button', { name: 'Confirmar revisão', exact: true }).click();
    await expect(panel.locator('dl')).toContainText('60,00');
    await expect(panel.getByRole('button', { name: 'Concluir revisão do histórico' })).toHaveCount(0);
});
