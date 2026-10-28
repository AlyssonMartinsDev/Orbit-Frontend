import { test, expect } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
async function setup(page, request) {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
    const login = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    const headers = { Authorization: `Bearer ${token}` };
    async function data(path, payload) {
        const response = payload ? await request.post(`${API}${path}`, { headers, data: payload }) : await request.get(`${API}${path}`, { headers });
        expect(response.ok(), await response.text()).toBe(true);
        return (await response.json()).data;
    }
    const client = await data('/clients/', { name: 'Cliente estoque', phone: '11988887777' });
    const product = await data('/inventory/products', { name: 'Material para serviço', unit: 'KG', sale_price: '12.50', initial_quantity: '10' });
    return { client, product, data };
}
for (const width of [320, 1440]) {
    test(`Orçamento e conversão preservam preços e baixam estoque uma vez em ${width}px`, async ({ page, request }) => {
        await page.setViewportSize({ width, height: 900 });
        const { client, product, data } = await setup(page, request);
        await page.goto('/quotes/create');
        await page.getByLabel('Cliente *', { exact: true }).selectOption(String(client.id));
        await page.getByLabel('Título do orçamento', { exact: false }).fill('Proposta com material');
        await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
        await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço realizado');
        await page.getByLabel('Valor unitário do item 1 (R$)', { exact: false }).fill('100');
        await page.getByLabel('Tipo de item', { exact: true }).selectOption('REGISTERED');
        await page.getByLabel('Pesquisar produto', { exact: true }).fill('Material');
        await page.getByLabel('Tipo de item', { exact: true }).selectOption('REGISTERED');
    await page.getByLabel('Produto cadastrado', { exact: true }).selectOption(String(product.id));
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('2');
        await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('125,00');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(page).toHaveURL(/\/quotes\/\d+$/);
        const quoteId = Number(page.url().split('/').at(-1));
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('10.000');
        await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await expect(page.getByLabel('Valor unitário do item 1 (R$)', { exact: false })).toHaveValue('100');
        await expect(page.getByLabel('Quantidade do produto 1', { exact: true })).toHaveValue('2.000');
        await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('3');
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/quotes/${quoteId}$`));
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('10.000');
        await page.reload();
        await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('37,50');
        await page.getByRole('button', { name: 'Registrar aprovação', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
        await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
        await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
        await expect(page.getByRole('region', { name: 'Produtos e Serviços' })).toContainText('Baixa registrada: 3 KG');
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('7.000');
        const quote = await data(`/quotes/${quoteId}`);
        const order = await data(`/work_orders/${quote.work_order_id}`);
        expect(order.price).toBe('137.50');
        expect(order.products[0].unit_price).toBe('12.50');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}
test('OS direta ajusta diferenças, mostra saldo insuficiente e permite remover produtos', async ({ page, request }) => {
    const { client, product, data } = await setup(page, request);
    await page.goto('/work-orders/create');
    await page.getByLabel('Cliente *', { exact: true }).selectOption(String(client.id));
    await page.getByLabel('Título *', { exact: true }).fill('OS com material');
    await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço realizado');
    await page.getByLabel('Valor unitário do item 1 (R$)', { exact: false }).fill('100');
    await page.getByLabel('Tipo de item', { exact: true }).selectOption('REGISTERED');
    await page.getByLabel('Produto cadastrado', { exact: true }).selectOption(String(product.id));
    await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
    await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('2');
    await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    const order = (await data('/work_orders/'))[0];
    expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('8.000');
    for (const [qty, balance] of [['4', '6.000'], ['1', '9.000']]) {
        await page.goto(`/work-orders/${order.id}/edit`);
        await page.getByLabel('Quantidade do produto 1', { exact: true }).fill(qty);
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe(balance);
    }
    await page.goto(`/work-orders/${order.id}/edit`);
    await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('11');
    await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Saldo insuficiente');
    expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('9.000');
    await page.getByRole('button', { name: 'Remover produto 1', exact: true }).click();
    await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect((await data(`/inventory/products/${product.id}`)).quantity).toBe('10.000');
    await page.goto(`/inventory/${product.id}`);
    await expect(page.getByRole('region', { name: 'Histórico de movimentações' }).getByRole('link', { name: new RegExp(`OS #${order.id}`) })).toHaveCount(4);
});

for (const kind of ['quote', 'order']) for (const width of [320, 1440]) {
    test(`Lista unificada: três tipos, persistência, edição e remoção em ${kind} ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 1000 });
        const { client, product, data } = await setup(page, request);
        const quote = kind === 'quote';
        await page.goto(quote ? '/quotes/create' : '/work-orders/create');
        await page.getByLabel('Cliente *', { exact: true }).selectOption(String(client.id));
        await page.getByLabel(quote ? 'Título do orçamento' : 'Título *', { exact: !quote }).fill('Documento misto');
        await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
        const card = page.getByRole('region', { name: 'Produtos e Serviços', exact: true });
        await expect(card).toHaveCount(1);
        await card.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço realizado');
        await page.getByLabel('Valor unitário do item 1 (R$)', { exact: true }).fill('200');
        await page.getByLabel('Tipo de item', { exact: true }).selectOption('PRODUCT');
        await card.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 2', { exact: true }).fill('Produto avulso com descrição longa para testar o alinhamento e a quebra de texto no celular');
        await page.getByLabel('Valor unitário do item 2 (R$)', { exact: true }).fill('80');
        await page.getByLabel('Tipo de item', { exact: true }).selectOption('REGISTERED');
        await page.getByLabel('Produto cadastrado', { exact: true }).selectOption(String(product.id));
        await card.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('2');
        await page.getByLabel('Valor unitário do produto 1 (R$)', { exact: true }).fill('150');
        await expect(card.locator('tbody tr')).toHaveCount(3);
        await expect(card).toContainText('580,00');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await card.screenshot({ path: info.outputPath('unified-form.png') });
        const save = async () => {
            await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Atualizar ordem', exact: true }).click();
            if (quote) await expect(page.getByRole('button', { name: 'Editar orçamento', exact: true })).toBeVisible();
        };
        await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Salvar ordem', exact: true }).click();
        await expect(page).toHaveURL(quote ? /\/quotes\/\d+$/ : /\/dashboard$/);
        const id = quote ? Number(page.url().split('/').at(-1)) : (await data('/work_orders/'))[0].id;
        const path = quote ? `/quotes/${id}` : `/work_orders/${id}`;
        const saved = await data(path);
        expect(saved.items[1].kind).toBe('PRODUCT');
        expect(saved.price).toBe('580.00');
        expect(saved.products).toHaveLength(1);
        const editUrl = quote ? `/quotes/${id}/edit` : `/work-orders/${id}/edit`;
        if (quote) await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        else await page.goto(editUrl);
        await page.reload();
        if (quote) await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await expect(page.getByLabel('Tipo do item 2', { exact: true })).toHaveValue('PRODUCT');
        await expect(page.getByLabel('Valor unitário do produto 1 (R$)', { exact: true })).toHaveValue('150.00');
        await page.getByLabel('Quantidade do item 2', { exact: true }).fill('2');
        await save();
        await expect(page).toHaveURL(quote ? new RegExp(`/quotes/${id}$`) : /\/dashboard$/);
        expect((await data(path)).price).toBe('660.00');
        if (quote) await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        else await page.goto(editUrl);
        await page.getByRole('button', { name: 'Remover item 2', exact: true }).click();
        await save();
        await expect(page).toHaveURL(quote ? new RegExp(`/quotes/${id}$`) : /\/dashboard$/);
        expect((await data(path)).price).toBe('500.00');
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe(quote ? '10.000' : '8.000');
        expect((await data('/inventory/products')).total).toBe(1);
        await page.goto(quote ? `/quotes/${id}` : `/work-orders/${id}/details`);
        await expect(card).toHaveCount(1);
        await expect(card.locator('tbody tr')).toHaveCount(2);
        await expect(card).toContainText('Serviço realizado');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

for (const quote of [true, false]) {
    test(`Somente produtos, inclusão/remoção de serviço e bloqueio de lista vazia em ${quote ? 'orçamento' : 'OS'}`, async ({ page, request }) => {
        await page.setViewportSize({ width: 320, height: 900 });
        const { client, product, data } = await setup(page, request);
        await page.goto(quote ? '/quotes/create' : '/work-orders/create');
        await page.getByLabel('Cliente *', { exact: true }).selectOption(String(client.id));
        await page.getByLabel(quote ? 'Título do orçamento' : 'Título *', { exact: !quote }).fill('Somente material');
        await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Salvar ordem', exact: true }).click();
        await expect(page.getByText('Adicione pelo menos um produto ou serviço.', { exact: true })).toBeVisible();
        await page.getByLabel('Tipo de item', { exact: true }).selectOption('REGISTERED');
        await page.getByLabel('Produto cadastrado', { exact: true }).selectOption(String(product.id));
        await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Quantidade do produto 1', { exact: true }).fill('2');
        await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Salvar ordem', exact: true }).click();
        await expect(page).toHaveURL(quote ? /\/quotes\/\d+$/ : /\/dashboard$/);
        const id = quote ? Number(page.url().split('/').at(-1)) : (await data('/work_orders/'))[0].id;
        const path = quote ? `/quotes/${id}` : `/work_orders/${id}`;
        const saved = await data(path);
        expect(saved.pricing_mode).toBe('ITEMIZED');
        expect(saved.items).toEqual([]);
        expect(saved.price).toBe('25.00');
        const edit = async () => {
            if (quote) { await page.goto(`/quotes/${id}`); await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click(); }
            else await page.goto(`/work-orders/${id}/edit`);
        };
        const save = async () => {
            await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Atualizar ordem', exact: true }).click();
            if (quote) await expect(page.getByRole('form', { name: 'Editar orçamento' })).toHaveCount(0);
            else await expect(page).toHaveURL(/\/dashboard$/);
        };
        await edit();
        await expect(page.getByLabel('Quantidade do produto 1', { exact: true })).toHaveValue('2.000');
        await expect(page.getByLabel('Descrição do item 1', { exact: true })).toHaveCount(0);
        await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 1', { exact: true }).fill('Mão de obra');
        await page.getByLabel('Valor unitário do item 1 (R$)', { exact: true }).fill('100');
        await save();
        expect((await data(path)).price).toBe('125.00');
        await edit();
        await page.getByRole('button', { name: 'Remover item 1', exact: true }).click();
        await save();
        expect((await data(path)).price).toBe('25.00');
        await edit();
        await page.getByRole('button', { name: 'Remover produto 1', exact: true }).click();
        await page.getByRole('button', { name: quote ? 'Salvar orçamento' : 'Atualizar ordem', exact: true }).click();
        await expect(page.getByText('Adicione pelo menos um produto ou serviço.', { exact: true })).toBeVisible();
        expect((await data(path)).products).toHaveLength(1);
        expect((await data(`/inventory/products/${product.id}`)).quantity).toBe(quote ? '10.000' : '8.000');
    });
}
