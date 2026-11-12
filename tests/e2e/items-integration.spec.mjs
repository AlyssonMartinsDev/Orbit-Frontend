import { expect, test } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
async function setup(page, request) {
    const login = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const client = await request.post(`${API}/clients/`, { headers, data: { name: 'Cliente itens', phone: '11988887777' } });
    const clientId = (await client.json()).data.id;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { headers, clientId };
}
async function fillItems(page) {
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1', { exact: true }).fill('Mão de obra');
    await page.getByLabel('Quantidade do item 1', { exact: true }).fill('1.5');
    await page.getByLabel('Valor unitário do item 1 (R$)', { exact: true }).fill('100.01');
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 2', { exact: true }).fill('Peça de reposição');
    await page.getByLabel('Quantidade do item 2', { exact: true }).fill('2');
    await page.getByLabel('Valor unitário do item 2 (R$)', { exact: true }).fill('9.99');
    await expect(page.getByText(/R\$\s*170,00/, { exact: true })).toBeVisible();
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

test('desconto em orçamento e OS sem valor podem ser editados no mobile', async ({ page, request, context }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const { headers, clientId } = await setup(page, request);
    await page.goto('/quotes/create');
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título do orçamento').fill('Proposta com desconto');
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1').fill('Serviço');
    await page.getByLabel('Valor unitário do item 1 (R$)').fill('100');
    await page.getByLabel('Tipo de desconto').selectOption('PERCENT');
    await page.getByLabel('Percentual (%)').fill('10');
    await expect(page.getByRole('region', { name: 'Desconto' })).toContainText('R$ 90,00');
    await page.getByRole('button', { name: 'Salvar orçamento' }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    const quoteId = Number(page.url().split('/').pop());
    expect((await (await request.get(`${API}/quotes/${quoteId}`, { headers })).json()).data.price).toBe('90.00');
    await page.getByRole('button', { name: 'Editar orçamento' }).click();
    await page.getByLabel('Tipo de desconto').selectOption('AMOUNT');
    await page.getByLabel('Valor do desconto (R$)').fill('15');
    await page.getByRole('button', { name: 'Salvar orçamento' }).click();
    await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('R$ 85,00');
    await page.goto('/work-orders/create');
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título *').fill('Inspeção sem valor');
    await page.getByRole('checkbox', { name: /Incluir valor na OS/ }).uncheck();
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1').fill('Inspeção inicial');
    await expect(page.getByLabel('Valor unitário do item 1 (R$)')).toHaveCount(0);
    await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    const orders = (await (await request.get(`${API}/work_orders/`, { headers })).json()).data;
    const order = orders.find(row => row.title === 'Inspeção sem valor');
    expect(order.include_price).toBe(false);
    await page.goto(`/work-orders/${order.id}/details`);
    await expect(page.getByText('Valor não informado')).toBeVisible();
    await expect(page.getByText('(11) 98888-7777')).toBeVisible();
    const whatsapp = page.getByRole('button', { name: 'Abrir conversa no WhatsApp' });
    await expect(whatsapp).toBeEnabled();
    await context.route('https://wa.me/**', route => route.fulfill({ status: 200, body: 'WhatsApp' }));
    const popupPromise = page.waitForEvent('popup');
    await whatsapp.click();
    const popup = await popupPromise;
    await popup.waitForURL('https://wa.me/5511988887777');
    await popup.close();
    await page.getByRole('link', { name: 'Cliente itens' }).click();
    await expect(page).toHaveURL(new RegExp(`/clients/${clientId}/details$`));
    await page.goto(`/work-orders/${order.id}/edit`);
    await page.getByRole('checkbox', { name: /Incluir valor na OS/ }).check();
    await page.getByLabel('Valor unitário do item 1 (R$)').fill('80');
    await page.getByLabel('Tipo de desconto').selectOption('AMOUNT');
    await page.getByLabel('Valor do desconto (R$)').fill('5');
    await page.getByRole('button', { name: 'Atualizar ordem' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    const saved = (await (await request.get(`${API}/work_orders/${order.id}`, { headers })).json()).data;
    expect(saved.price).toBe('75.00');
    expect(saved.include_price).toBe(true);
    await page.goto(`/work-orders/${order.id}/edit`);
    await expect(page.getByRole('checkbox', { name: /Incluir valor na OS/ })).toBeDisabled();
    await expect(page.getByText(/preservar os preços registrados/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
for (const width of [320, 1440]) {
    test(`OS sempre detalhada, edição e serviço com preço fechado em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const { headers, clientId } = await setup(page, request);
        await page.goto('/work-orders/create');
        await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
        await page.getByLabel('Título *', { exact: true }).fill('Revisão de motor');
        await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
        await expect(page.getByRole('radio', { name: /Valor único|Detalhar itens/ })).toHaveCount(0);
        await fillItems(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: info.outputPath('itens-formulario.png'), fullPage: true });
        await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        const orders = (await (await request.get(`${API}/work_orders/`, { headers })).json()).data;
        expect(orders).toHaveLength(1);
        const id = orders[0].id;
        expect(orders[0].price).toBe('170.00');
        expect(orders[0].items).toHaveLength(2);
        await page.goto(`/work-orders/${id}/details`);
        await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('Mão de obra');
        const download = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Exportar PDF', exact: true }).click();
        expect((await download).suggestedFilename()).toBe(`ordem-de-servico-${id}.pdf`);
        await page.goto(`/work-orders/${id}/edit`);
        await expect(page.getByLabel('Descrição do item 1', { exact: true })).toHaveValue('Mão de obra');
        await page.getByRole('button', { name: 'Remover item 2', exact: true }).click();
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        await page.goto(`/work-orders/${id}/edit`);
        await expect(page.getByLabel('Quantidade do item 1', { exact: true })).toHaveValue('1.5');
        await page.getByLabel('Quantidade do item 1', { exact: true }).fill('1');
        await page.getByLabel('Valor unitário do item 1 (R$)', { exact: true }).fill('180');
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        const saved = (await (await request.get(`${API}/work_orders/${id}`, { headers })).json()).data;
        expect(saved.items).toEqual([{ description: 'Mão de obra', quantity: '1', unit_price: '180' }]);
        expect(saved.pricing_mode).toBe('ITEMIZED');
        expect(saved.price).toBe('180.00');
        expect(saved.description).toBeNull();
    });
}
test('orçamento com itens preserva detalhamento na conversão', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request);
    await page.goto('/quotes/create');
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título do orçamento', { exact: false }).fill('Revisão completa');
    await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
    await fillItems(page);
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    const id = Number(page.url().split('/').pop());
    await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('Peça de reposição');
    await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
    await expect(page.getByLabel('Descrição do item 1', { exact: true })).toHaveValue('Mão de obra');
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await page.getByRole('button', { name: 'Registrar aprovação', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
    await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
    await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
    await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('Mão de obra');
    const quote = (await (await request.get(`${API}/quotes/${id}`, { headers })).json()).data;
    const order = (await (await request.get(`${API}/work_orders/${quote.work_order_id}`, { headers })).json()).data;
    expect(order.items).toEqual(quote.items);
    expect(order.price).toBe('170.00');
});
test('OS com pagamento impede redução do total pelos itens', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request);
    const response = await request.post(`${API}/work_orders/`, { headers, data: { client: { id: clientId }, work_order: { title: 'Proteção financeira', description: 'Serviço', pricing_mode: 'ITEMIZED', items: [{ description: 'Revisão', quantity: '1', unit_price: '100' }] } } });
    expect(response.ok()).toBe(true);
    const id = (await response.json()).data.id;
    expect((await request.post(`${API}/work_orders/${id}/payments`, { headers, data: { amount: '80', received_on: '2025-01-01', method: 'PIX', request_id: crypto.randomUUID() } })).ok()).toBe(true);
    await page.goto(`/work-orders/${id}/edit`);
    await page.getByLabel('Valor unitário do item 1 (R$)', { exact: true }).fill('50');
    await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
    await expect(page.getByText(/O valor da ordem não pode ser menor que o total recebido/)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/work-orders/${id}/edit$`));
    const saved = (await (await request.get(`${API}/work_orders/${id}`, { headers })).json()).data;
    expect(saved.price).toBe('100.00');
});

for (const kind of ['quote', 'order']) {
    test(`descrição histórica de ${kind} permanece ao editar sem o campo antigo`, async ({ page, request }) => {
        const { headers, clientId } = await setup(page, request);
        const description = 'Descrição histórica preservada sem novo preenchimento.';
        const fields = { title: 'Documento histórico', description, price: '100.00' };
        const created = await request.post(`${API}/${kind === 'quote' ? 'quotes/' : 'work_orders/'}`, {
            headers,
            data: kind === 'quote' ? { ...fields, client_id: clientId, request_id: crypto.randomUUID() } : { client: { id: clientId }, work_order: fields },
        });
        expect(created.ok()).toBe(true);
        const document = (await created.json()).data;
        if (kind === 'quote') {
            await page.goto(`/quotes/${document.id}`);
            await expect(page.getByText(description, { exact: true })).toBeVisible();
            await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
            await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
            await page.getByLabel('Título do orçamento', { exact: false }).fill('Título alterado');
            await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
            await expect(page.getByRole('form', { name: 'Editar orçamento' })).toHaveCount(0);
        } else {
            await page.goto(`/work-orders/${document.id}/edit`);
            await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
            await page.getByLabel('Título *', { exact: true }).fill('Título alterado');
            await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
            await expect(page).toHaveURL(/\/dashboard$/);
            await page.goto(`/work-orders/${document.id}/details`);
        }
        await expect(page.getByText(description, { exact: true })).toBeVisible();
        const saved = await request.get(`${API}/${kind === 'quote' ? 'quotes' : 'work_orders'}/${document.id}`, { headers });
        const result = (await saved.json()).data;
        expect(result.description).toBe(description);
        expect(result.price).toBe('100.00');
        expect(result.pricing_mode).toBe('ITEMIZED');
        expect(result.items).toEqual([{ description: 'Documento histórico', quantity: '1', unit_price: '100.00' }]);
    });
}
