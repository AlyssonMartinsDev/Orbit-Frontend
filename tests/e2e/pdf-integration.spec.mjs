import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const API = 'http://127.0.0.1:8002';

test.beforeEach(async ({ request }) => {
    expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true);
});

for (const width of [320, 1440]) {
    test(`PDF real pelos detalhes e pelas ações da OS em ${width}px`, async ({ page, request }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const login = await request.post(`${API}/auth/login`, { data: { email: 'operator@example.com', password: 'Orbit-test-123' } });
        const token = (await login.json()).data.access_token;
        const created = await request.post(`${API}/work_orders/`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { client: { name: 'João da Silva', phone: '11988887777' }, work_order: { title: 'Revisão do equipamento', description: 'Limpeza e revisão completa.', price: '150.50' } },
        });
        expect(created.ok()).toBe(true);
        const order = (await created.json()).data;
        await page.addInitScript(value => localStorage.setItem('orbit_token', value), token);
        await page.goto(`/work-orders/${order.id}/details`);
        await expect(page.getByRole('button', { name: 'Exportar PDF' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('pdf-details.png'), fullPage: true });

        async function download(button) {
            const ready = page.waitForEvent('download');
            await button.click();
            const file = await ready;
            expect(file.suggestedFilename()).toBe(`ordem-de-servico-${order.id}.pdf`);
            expect(await file.failure()).toBeNull();
            const bytes = await readFile(await file.path());
            expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
            expect(bytes.length).toBeGreaterThan(1000);
            await expect(button).toBeEnabled();
        }

        await download(page.getByRole('button', { name: 'Exportar PDF' }));
        await page.goto('/work-orders/tracking');
        await page.getByRole('button', { name: `Abrir ações da ordem ${order.id}`, exact: true }).click();
        await download(page.getByRole('dialog').getByRole('button', { name: 'Exportar PDF' }));
    });
}
