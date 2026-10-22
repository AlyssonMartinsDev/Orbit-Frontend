import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
async function setup(page, request, role = 'admin') {
    const login = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await request.post(`${API}/clients/`, { headers, data: { name: 'Cliente orçamento', phone: '11988887777' } });
    expect(response.ok()).toBe(true);
    const clientId = (await response.json()).data.id;
    const session = role === 'admin' ? token : (await (await request.post(`${API}/auth/login`, { data: { email: `${role}@example.com`, password: 'Orbit-test-123' } })).json()).data.access_token;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), session);
    return { headers, clientId };
}
async function create(page, clientId, paymentMethod, paymentDetails) {
    await page.goto('/quotes');
    await page.getByRole('link', { name: 'Novo orçamento', exact: true }).click();
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título do orçamento', { exact: false }).fill('Revisão completa');
    await page.getByLabel('Descrição do serviço', { exact: false }).fill('Revisar motor e substituir filtros.');
    await page.getByLabel('Valor do orçamento (R$)', { exact: false }).fill('1234.56');
    await page.getByLabel('Válido até', { exact: true }).fill('2099-12-31');
    await page.getByLabel('Condições e observações').fill('Prazo de execução: 5 dias.');
    if (paymentMethod !== undefined) await page.getByLabel('Método de pagamento', { exact: true }).selectOption(paymentMethod);
    if (paymentDetails) await fillPaymentDetails(page, paymentDetails);
    await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
    await expect(page).toHaveURL(/\/quotes\/\d+$/);
    return Number(page.url().split('/').pop());
}
async function status(page, button) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
    await expect(page.getByRole('form', { name: 'Confirmar ação do orçamento' })).toHaveCount(0);
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

const detailLabels = { pix_key: 'Chave PIX', card_operator: 'Maquininha ou operadora', payment_url: 'URL do pagamento', bank: 'Banco', agency: 'Agência', account: 'Conta', account_type: 'Tipo de conta', holder: 'Titular', holder_document: 'CPF/CNPJ do titular (opcional)', description: 'Descrição do pagamento' };
async function fillPaymentDetails(page, details) {
    for (const [key, value] of Object.entries(details)) {
        const input = page.getByLabel(detailLabels[key], { exact: true });
        if (key === 'account_type') await input.selectOption(value);
        else await input.fill(value);
    }
}
for (const module of ['quote', 'order']) {
    test(`detalhes dinâmicos de pagamento persistem e são limpos em ${module}`, async ({ page, request }) => {
        await page.setViewportSize({ width: 320, height: 900 });
        const { headers, clientId } = await setup(page, request);
        const initial = { pix_key: 'financeiro@example.com' };
        let id;
        if (module === 'quote') id = await create(page, clientId, 'PIX', initial);
        else {
            await page.goto('/work-orders/create');
            await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
            await page.getByLabel('Título *').fill('Pagamento detalhado');
            await page.getByLabel('Descrição do serviço', { exact: true }).fill('Serviço');
            await page.getByLabel('Valor (R$)', { exact: false }).fill('100');
            await page.getByLabel('Método de pagamento', { exact: true }).selectOption('PIX');
            await fillPaymentDetails(page, initial);
            const created = page.waitForResponse(r => r.url() === `${API}/work_orders/` && r.request().method() === 'POST');
            await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
            id = (await (await created).json()).data.id;
        }
        const endpoint = `${API}/${module === 'quote' ? 'quotes' : 'work_orders'}/${id}`;
        const url = module === 'quote' ? `/quotes/${id}` : `/work-orders/${id}/details`;
        expect((await (await request.get(endpoint, { headers })).json()).data.payment_details).toEqual(initial);
        for (const [method, details] of [
            ['PIX', { pix_key: 'outro@example.com' }],
            ['CARTAO_CREDITO', { card_operator: 'Operadora A' }],
            ['CARTAO_DEBITO', { card_operator: 'Operadora B' }],
            ['LINK_PAGAMENTO', { payment_url: 'https://example.com/pagar' }],
            ['TRANSFERENCIA', { bank: 'Banco Exemplo', agency: '0012', account: '00345-6', account_type: 'CORRENTE', holder: 'Empresa Exemplo', holder_document: '52998224725' }],
            ['OUTRO', { description: 'Pagamento na retirada' }],
            ['DINHEIRO', null], ['', null],
        ]) {
            await page.goto(module === 'quote' ? url : `/work-orders/${id}/edit`);
            if (module === 'quote') await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
            await page.getByLabel('Método de pagamento', { exact: true }).selectOption(method);
            if (details) await fillPaymentDetails(page, details);
            for (const [key, label] of Object.entries(detailLabels)) {
                if (!details || !(key in details)) await expect(page.getByLabel(label, { exact: true })).toHaveCount(0);
            }
            await page.getByRole('button', { name: module === 'quote' ? 'Salvar orçamento' : 'Atualizar ordem', exact: true }).click();
            if (module === 'quote') await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toBeVisible();
            else await expect(page).toHaveURL(/\/dashboard$/);
            await page.goto(url);
            const saved = (await (await request.get(endpoint, { headers })).json()).data;
            expect(saved.payment_method).toBe(method || null);
            expect(saved.payment_details).toEqual(details);
            if (details) for (const [key, value] of Object.entries(details)) {
                await expect(page.getByText(key === 'account_type' ? 'Corrente' : value, { exact: true })).toBeVisible();
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
    });
}

test('método de pagamento do orçamento permite selecionar, alterar e limpar', async ({ page, request }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const { headers, clientId } = await setup(page, request);
    const id = await create(page, clientId, 'LINK_PAGAMENTO');
    const detail = page.locator('dl').first();
    await expect(detail).toContainText('Link de pagamento');
    for (const [method, label] of [['PIX', 'Pix'], ['', 'Não informado']]) {
        await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await page.getByLabel('Método de pagamento', { exact: true }).selectOption(method);
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(detail).toContainText(label);
        const data = (await (await request.get(`${API}/quotes/${id}`, { headers })).json()).data;
        expect(data.payment_method).toBe(method || null);
    }
});

test('método de pagamento da OS permite selecionar, alterar e limpar sem quitar', async ({ page, request }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const { headers, clientId } = await setup(page, request);
    await page.goto('/work-orders/create');
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await page.getByLabel('Título *').fill('OS com método');
    await page.getByLabel('Descrição do serviço', { exact: true }).fill('Serviço livre');
    await page.getByLabel('Valor (R$)', { exact: false }).fill('100');
    const select = page.getByLabel('Método de pagamento', { exact: true });
    await expect(select).toHaveValue('');
    await expect(select.locator('option')).toHaveCount(8);
    await select.selectOption('CARTAO_DEBITO');
    const created = page.waitForResponse(response => response.url() === `${API}/work_orders/` && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
    const id = (await (await created).json()).data.id;
    await page.goto(`/work-orders/${id}/details`);
    await expect(page.locator('dl').filter({ hasText: 'Método de pagamento' })).toContainText('Cartão de débito');
    for (const [method, label] of [['TRANSFERENCIA', 'Transferência bancária'], ['', 'Não informado']]) {
        await page.goto(`/work-orders/${id}/edit`);
        await select.selectOption(method);
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        await page.goto(`/work-orders/${id}/details`);
        await expect(page.locator('dl').filter({ hasText: 'Método de pagamento' })).toContainText(label);
        const data = (await (await request.get(`${API}/work_orders/${id}`, { headers })).json()).data;
        expect(data.payment_method).toBe(method || null);
        expect(data.status_payment).toBe('PENDENTE');
    }
});

for (const width of [320, 1440]) {
    test(`orçamento editado, PDF, aprovação e conversão em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const { headers, clientId } = await setup(page, request);
        const id = await create(page, clientId);
        await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await page.getByLabel('Valor do orçamento (R$)', { exact: false }).fill('1450.75');
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(page.getByRole('region', { name: 'Produtos e Serviços', exact: true }).locator('strong')).toHaveText(/R\$\s*1.450,75/);
        const download = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Exportar PDF', exact: true }).click();
        expect((await download).suggestedFilename()).toBe(`orcamento-${id}.pdf`);
        await status(page, 'Marcar como enviado');
        await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toHaveCount(0);
        await status(page, 'Registrar aprovação');
        await expect(page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('orcamento.png'), fullPage: true });
        await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
        await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
        await page.getByRole('link', { name: `Ver orçamento de origem #${id}`, exact: true }).click();
        await expect(page.getByRole('link', { name: /Abrir ordem de serviço #/ })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true })).toHaveCount(0);
        const quote = (await (await request.get(`${API}/quotes/${id}`, { headers })).json()).data;
        const order = (await (await request.get(`${API}/work_orders/${quote.work_order_id}`, { headers })).json()).data;
        expect(order.price).toBe('1450.75');
        expect(order.description).toContain('Prazo de execução: 5 dias.');
        expect(order.status_payment).toBe('PENDENTE');
        await page.goto('/quotes');
        await page.getByLabel('Buscar orçamento ou cliente').fill('Revisão');
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await page.getByLabel('Situação', { exact: true }).selectOption('CONVERTIDO');
        await expect(page.getByRole('link', { name: `Abrir orçamento #${id}`, exact: true })).toBeVisible();
    });
}

test('reenvio da conversão após resposta perdida não duplica a OS', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request);
    const id = await create(page, clientId);
    await status(page, 'Registrar aprovação');
    let first = true;
    await page.route(`${API}/quotes/${id}/convert`, async route => {
        if (!first) return route.continue();
        first = false;
        expect((await route.fetch()).ok()).toBe(true);
        await route.abort('failed');
    });
    await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Falha de conexão');
    await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
    await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
    const orders = (await (await request.get(`${API}/work_orders/`, { headers })).json()).data;
    expect(orders).toHaveLength(1);
});

test('operacional consulta orçamento e PDF sem ações de alteração', async ({ page, request }) => {
    const { headers, clientId } = await setup(page, request, 'operator');
    const response = await request.post(`${API}/quotes`, { headers, data: { client_id: clientId, title: 'Consulta operacional', description: 'Descrição', price: '100', request_id: crypto.randomUUID() } });
    const id = (await response.json()).data.id;
    await page.goto('/quotes');
    await expect(page.getByRole('link', { name: 'Novo orçamento', exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: `Abrir orçamento #${id}`, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Consulta operacional' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Registrar aprovação', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Exportar PDF', exact: true })).toBeVisible();
    await page.goto('/quotes/create');
    await expect(page.getByText('Somente administradores e gestores podem cadastrar orçamentos.')).toBeVisible();
});
