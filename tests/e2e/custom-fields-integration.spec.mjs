import { expect, test } from '@playwright/test';
const API = 'http://127.0.0.1:8002';
async function setup(page, request) {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
    const login = await request.post(`${API}/auth/login`, { data: { email: 'admin@example.com', password: 'Orbit-test-123' } });
    const token = (await login.json()).data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const result = await request.post(`${API}/clients/`, { headers, data: { name: 'Cliente campos', phone: '11988887777' } });
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { headers, clientId: (await result.json()).data.id };
}
async function createField(request, headers, module, name, extra = {}) {
    const response = await request.post(`${API}/custom-fields`, { headers, data: { module, name, field_type: 'TEXT', ...extra } });
    expect(response.ok()).toBe(true);
    return (await response.json()).data;
}
for (const width of [320, 1440]) {
    test(`campos por documento e conversão preservam orçamento em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const { headers, clientId } = await setup(page, request);
        await page.goto('/settings/custom-fields');
        await page.getByRole('button', { name: /Novo campo/i }).click();
        await page.getByLabel('Usar este campo em').selectOption('BOTH');
        await page.getByLabel('Nome do campo', { exact: false }).fill('Número de série');
        await page.getByLabel('Obrigatório no orçamento', { exact: true }).check();
        await expect(page.getByLabel('Obrigatório na ordem de serviço', { exact: true })).not.toBeChecked();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('configuracao-campos.png'), fullPage: true });
        await page.getByRole('button', { name: 'Criar campo', exact: true }).click();
        await expect(page.getByText('Orçamento: obrigatório · OS: opcional', { exact: true })).toBeVisible();
        const quoteOnly = await createField(request, headers, 'QUOTE', 'Condição comercial', { required_quote: true });
        const osOnly = await createField(request, headers, 'WORK_ORDER', 'Diagnóstico técnico', { required: true });
        await createField(request, headers, 'CLIENT', 'Contato do cliente');
        await page.goto('/quotes/create');
        await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
        await page.getByLabel('Título do orçamento', { exact: false }).fill('Manutenção com campos');
        await expect(page.getByLabel('Descrição do serviço', { exact: false })).toHaveCount(0);
        await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 1', { exact: true }).fill('Serviço realizado');
        await page.getByLabel('Valor unitário do item 1 (R$)', { exact: false }).fill('150');
        await expect(page.getByLabel('Diagnóstico técnico', { exact: false })).toHaveCount(0);
        await expect(page.getByLabel('Contato do cliente', { exact: false })).toHaveCount(0);
        await expect(page.getByLabel('Número de série', { exact: false })).toHaveAttribute('required', '');
        await page.getByLabel('Número de série', { exact: false }).fill('ABC-original');
        await page.getByLabel('Condição comercial', { exact: false }).fill('À vista');
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await expect(page).toHaveURL(/\/quotes\/\d+$/);
        const quoteId = Number(page.url().split('/').pop());
        await expect(page.getByRole('region', { name: 'Campos personalizados do orçamento' })).toContainText('ABC-original');
        await page.getByRole('button', { name: 'Editar orçamento', exact: true }).click();
        await expect(page.getByLabel('Número de série', { exact: false })).toHaveValue('ABC-original');
        await page.getByRole('button', { name: 'Salvar orçamento', exact: true }).click();
        await page.getByRole('button', { name: 'Registrar aprovação', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
        await page.getByRole('button', { name: 'Gerar ordem de serviço', exact: true }).click();
        await expect(page.getByLabel('Número de série', { exact: false })).toHaveValue('ABC-original');
        await expect(page.getByLabel('Número de série', { exact: false })).not.toHaveAttribute('required', '');
        await expect(page.getByLabel('Condição comercial', { exact: false })).toHaveCount(0);
        await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/quotes/${quoteId}$`));
        expect(await page.getByLabel('Diagnóstico técnico', { exact: false }).evaluate(input => input.validity.valueMissing)).toBe(true);
        await page.getByLabel('Diagnóstico técnico', { exact: false }).fill('Fonte com defeito');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('conversao-campos.png'), fullPage: true });
        await page.getByRole('button', { name: 'Confirmar e gerar OS', exact: true }).click();
        await expect(page).toHaveURL(/\/work-orders\/\d+\/details$/);
        const orderId = Number(page.url().split('/').at(-2));
        await expect(page.getByText('ABC-original', { exact: true })).toBeVisible();
        const order = (await (await request.get(`${API}/work_orders/${orderId}`, { headers })).json()).data;
        expect(order.custom_values.some(item => item.field_definition.id === quoteOnly.id)).toBe(false);
        expect(order.custom_values.some(item => item.field_definition.id === osOnly.id)).toBe(true);
        await page.goto(`/work-orders/${orderId}/edit`);
        await expect(page.getByLabel('Condição comercial', { exact: false })).toHaveCount(0);
        await page.getByLabel('Número de série', { exact: false }).fill('ABC-alterado-na-OS');
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        await page.goto(`/quotes/${quoteId}`);
        await expect(page.getByRole('region', { name: 'Campos personalizados do orçamento' })).toContainText('ABC-original');
        await expect(page.getByRole('region', { name: 'Campos personalizados do orçamento' })).not.toContainText('ABC-alterado');
        const download = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Exportar PDF', exact: true }).click();
        expect((await download).suggestedFilename()).toBe(`orcamento-${quoteId}.pdf`);
    });
}

test('falha de carregamento bloqueia orçamento até tentar novamente', async ({ page, request }) => {
    const { clientId } = await setup(page, request);
    await page.route('**/custom-fields?**', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Falha temporária de campos' }) }));
    await page.goto('/quotes/create');
    await page.getByRole('combobox', { name: 'Cliente *', exact: true }).selectOption(String(clientId));
    await expect(page.getByRole('alert')).toContainText('Falha temporária de campos');
    await expect(page.getByRole('button', { name: 'Salvar orçamento', exact: true })).toBeDisabled();
    await page.unroute('**/custom-fields?**');
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Salvar orçamento', exact: true })).toBeEnabled();
});

for (const width of [320, 1440]) {
    test(`cadastro rápido de cliente exige campo próprio e preserva conclusão em ${width}px`, async ({ page, request }) => {
        await page.setViewportSize({ width, height: 900 });
        const { headers } = await setup(page, request);
        const field = await createField(request, headers, 'CLIENT', 'Contato obrigatório', { required: true });
        await page.goto('/work-orders/create');
        await page.getByRole('button', { name: 'Cadastrar novo cliente', exact: true }).click();
        await page.getByLabel('Nome *', { exact: true }).fill('Cliente cadastro rápido');
        await page.getByLabel('Telefone *', { exact: true }).fill('11912345678');
        await expect(page.getByLabel('Nome *', { exact: true })).toHaveAttribute('maxlength', '255');
        await expect(page.getByLabel('Observações do cliente', { exact: true })).toHaveAttribute('maxlength', '255');
        await page.getByLabel('Título *', { exact: true }).fill('OS finalizada');
        await expect(page.getByLabel('Título *', { exact: true })).toHaveAttribute('maxlength', '255');
        await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
        await page.getByLabel('Descrição do item 1', { exact: true }).fill('Manutenção');
        const required = page.getByLabel('Contato obrigatório', { exact: false });
        await expect(required).toHaveAttribute('required', '');
        await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/work-orders\/create$/);
        await required.fill('Financeiro');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByRole('button', { name: 'Salvar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        const orders = (await (await request.get(`${API}/work_orders/`, { headers })).json()).data;
        const order = orders[0];
        const client = (await (await request.get(`${API}/clients/${order.client.id}`, { headers })).json()).data;
        expect(client.custom_values).toContainEqual(expect.objectContaining({ field_definition_id: field.id, value: 'Financeiro' }));
        await page.goto(`/work-orders/${order.id}/edit`);
        await page.getByLabel('Status do serviço', { exact: false }).selectOption('FINALIZADO');
        await page.getByRole('button', { name: 'Atualizar ordem', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
        const finished = (await (await request.get(`${API}/work_orders/${order.id}`, { headers })).json()).data;
        expect(finished.finished_at).not.toBeNull();
    });
}
