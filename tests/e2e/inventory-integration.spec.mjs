import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
async function setup(page, request, email = 'admin@example.com') {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
    const response = await request.post(`${API}/auth/login`, { data: { email, password: 'Orbit-test-123' } });
    const token = (await response.json()).data.access_token;
    await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
    return { Authorization: `Bearer ${token}` };
}
async function createProduct(page, name) {
    await page.goto('/inventory/create');
    await page.getByLabel('Nome *', { exact: true }).fill(name);
}
async function saveProduct(page) {
    await page.getByRole('button', { name: 'Salvar produto', exact: true }).click();
    await expect(page).toHaveURL(/\/inventory\/\d+$/);
}
async function movement(page, kind, quantity) {
    await page.getByLabel('Tipo de movimentação').selectOption(kind);
    await page.getByLabel('Quantidade (KG) *', { exact: true }).fill(quantity);
    await page.getByLabel('Motivo / observação *').fill(`Conferência ${kind}`);
    await page.getByRole('button', { name: 'Registrar movimentação', exact: true }).click();
}
for (const width of [320, 1440]) {
    test(`Estoque completo: categorias, cadastro, movimentações e edição em ${width}px`, async ({ page, request }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const headers = await setup(page, request);
        await page.goto('/inventory/categories');
        await page.getByLabel('Nome da categoria *', { exact: true }).fill('Insumos');
        await page.getByRole('button', { name: 'Salvar categoria', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Insumos', exact: true })).toBeVisible();
        const category = (await (await request.get(`${API}/inventory/categories`, { headers })).json()).data.items[0];
        await createProduct(page, 'Material genérico');
        await page.getByLabel('SKU / código interno').fill(' mat-01 ');
        await page.getByLabel('Código de barras').fill('7890000000001');
        await page.getByLabel('Categoria', { exact: true }).selectOption(String(category.id));
        await page.getByLabel('Unidade de medida').selectOption('KG');
        await page.getByLabel('Preço de custo *', { exact: true }).fill('1.25');
        await page.getByLabel('Preço de venda *', { exact: true }).fill('2.50');
        await page.getByLabel('Estoque inicial *', { exact: true }).fill('5.125');
        await page.getByLabel('Estoque mínimo *', { exact: true }).fill('2');
        await saveProduct(page);
        const id = Number(page.url().split('/').at(-1));
        const history = page.getByRole('region', { name: 'Histórico de movimentações' });
        await expect(history).toContainText('Estoque inicial');
        await expect(page.locator('dd').filter({ hasText: /^5,125 KG$/ })).toBeVisible();
        await movement(page, 'ENTRADA', '2.125');
        await expect(page.locator('dd').filter({ hasText: /^7,25 KG$/ })).toBeVisible();
        await movement(page, 'SAIDA', '8');
        await expect(page.getByRole('alert')).toContainText('Saldo insuficiente');
        await movement(page, 'SAIDA', '2.250');
        await expect(page.locator('dd').filter({ hasText: /^5 KG$/ })).toBeVisible();
        await movement(page, 'AJUSTE_POSITIVO', '0.5');
        await expect(page.locator('dd').filter({ hasText: /^5,5 KG$/ })).toBeVisible();
        await movement(page, 'AJUSTE_NEGATIVO', '0.5');
        await expect(page.locator('dd').filter({ hasText: /^5 KG$/ })).toBeVisible();
        await page.reload();
        await expect(history.locator('article')).toHaveCount(5);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('estoque-detalhes.png'), fullPage: true });
        await page.getByRole('link', { name: 'Editar produto', exact: true }).click();
        await expect(page.getByLabel('SKU / código interno')).toHaveValue('MAT-01');
        await expect(page.getByLabel('Unidade de medida')).toBeDisabled();
        await page.getByLabel('Controlar estoque', { exact: true }).uncheck();
        await page.getByRole('button', { name: 'Salvar produto', exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('Zere o saldo');
        await page.getByLabel('Controlar estoque', { exact: true }).check();
        await page.getByLabel('Estoque mínimo *', { exact: true }).fill('6');
        await saveProduct(page);
        await expect(page.getByText('Este produto está no estoque mínimo ou abaixo.', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Excluir produto', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('histórico');
        await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
        await page.goto('/inventory');
        await page.getByLabel('Buscar produto').fill('7890000000001');
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Material genérico', exact: true })).toBeVisible();
        await page.getByRole('combobox', { name: 'Disponibilidade', exact: true }).selectOption('empty');
        await expect(page.getByText('Nenhum produto encontrado. Cadastre um produto ou ajuste os filtros.')).toBeVisible();
        await page.goto('/inventory/categories');
        await page.getByRole('button', { name: 'Excluir categoria', exact: true }).click();
        await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('em uso');
        await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
        await page.getByRole('button', { name: 'Editar categoria', exact: true }).click();
        await page.getByLabel('Nome da categoria *', { exact: true }).fill('Materiais');
        await page.getByRole('button', { name: 'Salvar categoria', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Materiais', exact: true })).toBeVisible();
        await page.goto(`/inventory/${id}`);
        await expect(page.getByText('Ativo · Materiais', { exact: true })).toBeVisible();
        expect((await (await request.get(`${API}/inventory/products/${id}`, { headers })).json()).data.quantity).toBe('5.000');
    });
}

test('Produto sem controle permite CRUD; operacional consulta sem alterar', async ({ page, request }) => {
    const headers = await setup(page, request);
    await createProduct(page, 'Cadastro sem estoque');
    await page.getByLabel('Controlar estoque', { exact: true }).uncheck();
    await saveProduct(page);
    await expect(page.getByRole('heading', { name: 'Movimentar estoque' })).toHaveCount(0);
    await expect(page.getByText('Sem controle de estoque', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Editar produto', exact: true }).click();
    await page.getByLabel('Nome *', { exact: true }).fill('Cadastro inativo');
    await page.getByLabel('Produto ativo', { exact: true }).uncheck();
    await saveProduct(page);
    await expect(page.getByText('Inativo · Sem categoria', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Excluir produto', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
    await expect(page).toHaveURL(/\/inventory$/);
    await expect(page.getByText('Nenhum produto encontrado. Cadastre um produto ou ajuste os filtros.')).toBeVisible();
    const product = (await (await request.post(`${API}/inventory/products`, { headers, data: { name: 'Somente leitura' } })).json()).data;
    const login = await request.post(`${API}/auth/login`, { data: { email: 'operator@example.com', password: 'Orbit-test-123' } });
    await page.evaluate(token => localStorage.setItem('orbit_token', token), (await login.json()).data.access_token);
    // SPA navigation preserves the new session; the initial bootstrap script only runs on reload.
    await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
    await page.getByRole('link', { name: 'Ver produto', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/inventory/${product.id}$`));
    await expect(page.getByRole('link', { name: 'Editar produto', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Movimentar estoque' })).toHaveCount(0);
});

test('Listagem paginada, filtro de status e exclusão de categoria sem vínculo', async ({ page, request }) => {
    const headers = await setup(page, request);
    for (let index = 1; index <= 22; index++) {
        expect((await request.post(`${API}/inventory/products`, {
            headers, data: { name: `Produto ${String(index).padStart(2, '0')}`, is_active: index !== 1 },
        })).ok()).toBe(true);
    }
    await page.goto('/inventory');
    await expect(page.locator('article')).toHaveCount(20);
    await page.getByRole('navigation', { name: 'Paginação', exact: true }).getByRole('button', { name: 'Próxima', exact: true }).click();
    await expect(page.locator('article')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Produto 01', exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('false');
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByText('Página 1 de 1', { exact: true })).toBeVisible();
    await page.goto('/inventory/categories');
    await page.getByLabel('Nome da categoria *', { exact: true }).fill('Categoria temporária');
    await page.getByRole('button', { name: 'Salvar categoria', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Categoria temporária', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Excluir categoria', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
    await expect(page.getByText('Nenhuma categoria encontrada.', { exact: true })).toBeVisible();
});
