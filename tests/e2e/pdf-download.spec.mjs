import { expect, test } from '@playwright/test';
import { mockApi } from './fixtures.mjs';

test('falha de PDF permite tentar novamente e não baixa JSON como arquivo', async ({ page }) => {
    let calls = 0;
    await mockApi(page, async (route, path) => {
        if (path !== '/work_orders/1/pdf') return false;
        calls++;
        if (calls === 1) await route.fulfill({ status: 500, json: { success: false, message: 'Falha' } });
        else await route.fulfill({ status: 200, json: { success: false, message: 'Não é um PDF' } });
        return true;
    });
    const downloads = [];
    page.on('download', file => downloads.push(file));
    await page.goto('/work-orders/1/details');
    const button = page.getByRole('button', { name: 'Exportar PDF' });
    await button.click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível gerar o PDF');
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível gerar o PDF');
    expect(calls).toBe(2);
    expect(downloads).toHaveLength(0);
});

test('troca de sessão durante a geração descarta o download', async ({ page }) => {
    let release;
    let started;
    const waiting = new Promise(resolve => { release = resolve; });
    const requested = new Promise(resolve => { started = resolve; });
    await mockApi(page, async (route, path) => {
        if (path !== '/work_orders/1/pdf') return false;
        started();
        await waiting;
        await route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\nold account' });
        return true;
    });
    const downloads = [];
    page.on('download', file => downloads.push(file));
    await page.goto('/work-orders/1/details');
    await page.getByRole('button', { name: 'Exportar PDF' }).click();
    await requested;
    await expect(page.getByRole('button', { name: 'Gerando PDF…' })).toBeDisabled();
    await page.evaluate(() => localStorage.setItem('orbit_token', 'another-session'));
    const response = page.waitForResponse(res => res.url().endsWith('/work_orders/1/pdf'));
    release();
    await response;
    // Synchronize with the actual response interceptor and component unmount.
    await expect(page.getByRole('button', { name: 'Gerando PDF…' })).toHaveCount(0);
    expect(downloads).toHaveLength(0);
});
