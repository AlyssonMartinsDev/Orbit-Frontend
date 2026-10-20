import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:8002';
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAIAAABd+SbeAAAAy0lEQVR4nO3SQQ0AIAADMcASnvCEW1Rwr9bAksvmPnfw3wo2ELrj0RGhI0JHhI4IHRE6InRE6IjQEaEjQkeEjggdEToidEToiNARoSNCR4SOCB0ROiJ0ROiI0BGhI0JHhI4IHRE6InRE6IjQEaEjQkeEjggdEToidEToiNARoSNCR4SOCB0ROiJ0ROiI0BGhI0JHhI4IHRE6InRE6IjQEaEjQkeEjggdEToidEToiNARoSNCR4SOCB0ROiJ0ROiI0BGhI0JHhI4IPRoPkZwB0tURjL0AAAAASUVORK5CYII=', 'base64');
const photo = (name = 'foto-antes.png') => ({ name, mimeType: 'image/png', buffer: image });
async function login(request, email = 'admin@example.com') {
  const result = await request.post(`${API}/auth/login`, { data: { email, password: 'Orbit-test-123' } });
  expect(result.ok()).toBe(true);
  return (await result.json()).data.access_token;
}
async function setup(page, request, email) {
  const token = await login(request);
  const headers = { Authorization: `Bearer ${token}` };
  const client = await request.post(`${API}/clients/`, { headers, data: { name: 'Cliente anexos', phone: '11988887777' } });
  const order = await request.post(`${API}/work_orders/`, { headers, data: { client: { id: (await client.json()).data.id }, work_order: { title: 'Serviço com fotos', description: 'Registrar antes e depois', price: '100' } } });
  expect(order.ok()).toBe(true);
  const id = (await order.json()).data.id;
  const session = email ? await login(request, email) : token;
  await page.addInitScript(value => localStorage.setItem('orbit_token', value), session);
  await page.goto(`/work-orders/${id}/details`);
  await expect(page.getByRole('region', { name: 'Fotos e anexos' })).toContainText('Nenhum anexo');
  return { id, headers };
}
test.beforeEach(async ({ request }) => { expect((await request.post(`${API}/__test__/reset`)).ok()).toBe(true); });

test('print colado entra na fila e é enviado; texto e links não viram anexos', async ({ page, request }) => {
  const { id, headers } = await setup(page, request);
  const field = page.getByRole('textbox', { name: 'Colar print ou imagem', exact: true });
  await field.focus();
  // Dispatch a paste payload without reading or replacing the user's OS clipboard.
  await field.evaluate(element => {
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', 'https://example.com/foto.png');
    clipboard.setData('text/html', '<img src="https://example.com/foto.png">');
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }));
  });
  await expect(page.getByRole('alert').filter({ hasText: 'Copie um print' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Fila de envio' })).toHaveCount(0);
  await field.evaluate((element, bytes) => {
    const clipboard = new DataTransfer();
    clipboard.items.add(new File([new Uint8Array(bytes)], 'image', { type: 'image/png' }));
    clipboard.setData('text/html', '<img src="https://example.com/foto.png">');
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }));
  }, [...image]);
  await expect(page.getByRole('list', { name: 'Fila de envio' })).toContainText(/print-.*\.png/);
  const before = (await (await request.get(`${API}/work_orders/${id}/attachments`, { headers })).json()).data.items;
  expect(before).toHaveLength(0);
  await page.getByRole('button', { name: 'Enviar arquivos', exact: true }).click();
  const region = page.getByRole('region', { name: 'Fotos e anexos' });
  await expect(region.getByRole('article')).toHaveCount(1);
  await expect(region.getByRole('img', { name: /^print-/ })).toBeVisible();
  const saved = (await (await request.get(`${API}/work_orders/${id}/attachments`, { headers })).json()).data.items;
  expect(saved).toHaveLength(1);
  expect(saved[0].filename).toMatch(/^print-.*\.png$/);
  expect(saved[0].media_type).toBe('image/png');
});

for (const width of [320, 1440]) {
  test(`fotos e PDF: envio, visualização, download e exclusão em ${width}px`, async ({ page, request }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const { id, headers } = await setup(page, request);
    const pdf = await request.get(`${API}/work_orders/${id}/pdf`, { headers });
    await page.getByLabel('Selecionar fotos e documentos', { exact: true }).setInputFiles([photo(), { name: 'laudo.pdf', mimeType: 'application/pdf', buffer: await pdf.body() }]);
    await page.getByRole('button', { name: 'Enviar arquivos', exact: true }).click();
    const region = page.getByRole('region', { name: 'Fotos e anexos' });
    await expect(region.getByRole('article')).toHaveCount(2);
    await expect(region.getByRole('img', { name: 'foto-antes.png', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await region.scrollIntoViewIfNeeded();
    await region.screenshot({ path: info.outputPath('anexos.png') });
    await page.getByRole('button', { name: 'Visualizar foto-antes.png', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('img', { name: 'foto-antes.png', exact: true })).toBeVisible();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByRole('button', { name: 'Fechar modal', exact: true }).click();
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar laudo.pdf', exact: true }).click();
    expect((await pending).suggestedFilename()).toBe('laudo.pdf');
    await page.getByRole('button', { name: 'Incluir fotos no PDF', exact: true }).click();
    await expect(dialog.getByRole('checkbox')).toHaveCount(1);
    await expect(dialog.getByRole('button', { name: 'Gerar PDF com fotos', exact: true })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Selecionar todas', exact: true }).click();
    await expect(dialog.getByRole('checkbox', { name: 'Incluir foto-antes.png', exact: true })).toBeChecked();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.screenshot({ path: info.outputPath('selecao-fotos-pdf.png') });
    const photoDownload = page.waitForEvent('download');
    const photoResponse = page.waitForResponse(response => response.url().includes(`/work_orders/${id}/pdf?photo_ids=`));
    await dialog.getByRole('button', { name: 'Gerar PDF com fotos', exact: true }).click();
    expect((await photoDownload).suggestedFilename()).toBe(`ordem-de-servico-${id}-com-fotos.pdf`);
    expect((await photoResponse).ok()).toBe(true);
    const url = new URL((await photoResponse).url());
    expect(url.searchParams.getAll('photo_ids')).toHaveLength(1);
    await expect(dialog.getByRole('status')).toHaveText('PDF com fotos gerado.');
    await page.getByRole('button', { name: 'Fechar modal', exact: true }).click();
    await page.getByRole('button', { name: 'Excluir foto-antes.png', exact: true }).click();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(region.getByRole('article')).toHaveCount(2);
    await page.getByRole('button', { name: 'Excluir foto-antes.png', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
    await expect(region.getByRole('article')).toHaveCount(1);
    await page.reload();
    await expect(region.getByRole('article')).toHaveCount(1);
    await expect(region).toContainText('laudo.pdf');
  });
}

test('operacional envia e consulta; exclusão exige gestor ou administrador', async ({ page, request }) => {
  const { id } = await setup(page, request, 'operator@example.com');
  await page.getByLabel('Capturar foto', { exact: true }).setInputFiles(photo());
  await page.getByRole('button', { name: 'Enviar arquivos', exact: true }).click();
  const region = page.getByRole('region', { name: 'Fotos e anexos' });
  await expect(region.getByRole('article')).toHaveCount(1);
  await expect(region.getByRole('button', { name: /Excluir/ })).toHaveCount(0);
  const other = await login(request, 'other@example.com');
  expect((await request.get(`${API}/work_orders/${id}/attachments`, { headers: { Authorization: `Bearer ${other}` } })).status()).toBe(404);
});

test('seleção do PDF começa vazia e avisa quando uma foto foi excluída', async ({ page, request }) => {
  const { id, headers } = await setup(page, request);
  await page.getByRole('button', { name: 'Incluir fotos no PDF', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Esta OS ainda não possui fotos');
  await page.getByRole('button', { name: 'Fechar modal', exact: true }).click();
  const response = await request.post(`${API}/work_orders/${id}/attachments?filename=foto.png`, { headers: { ...headers, 'X-Request-ID': crypto.randomUUID(), 'Content-Type': 'application/octet-stream' }, data: image });
  expect(response.ok()).toBe(true);
  const attachmentId = (await response.json()).data.id;
  await page.getByRole('button', { name: 'Incluir fotos no PDF', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Incluir foto.png', exact: true }).check();
  expect((await request.delete(`${API}/work_orders/${id}/attachments/${attachmentId}`, { headers })).ok()).toBe(true);
  await page.getByRole('button', { name: 'Gerar PDF com fotos', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('O documento ou uma foto selecionada não está disponível');
  await page.getByRole('button', { name: 'Fechar modal', exact: true }).click();
  const plainDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar PDF', exact: true }).click();
  expect((await plainDownload).suggestedFilename()).toBe(`ordem-de-servico-${id}.pdf`);
});

test('resposta perdida permite repetir envio sem duplicar; valida tipos e tamanho', async ({ page, request }) => {
  const { id, headers } = await setup(page, request);
  await page.getByLabel('Selecionar fotos e documentos', { exact: true }).setInputFiles({ name: 'arquivo.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('invalid') });
  await expect(page.getByRole('alert').filter({ hasText: 'Selecione fotos' })).toBeVisible();
  await page.getByLabel('Selecionar fotos e documentos', { exact: true }).setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert').filter({ hasText: 'Selecione fotos' })).toBeVisible();
  let lost = false;
  await page.route(`**/work_orders/${id}/attachments?*`, async route => {
    if (route.request().method() === 'POST' && !lost) {
      lost = true;
      expect((await route.fetch()).ok()).toBe(true);
      await route.abort('failed');
    } else await route.continue();
  });
  await page.getByLabel('Selecionar fotos e documentos', { exact: true }).setInputFiles(photo());
  await page.getByRole('button', { name: 'Enviar arquivos', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tentar envios pendentes', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Tentar envios pendentes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '1 arquivo(s) enviado(s).' })).toBeVisible();
  const saved = (await (await request.get(`${API}/work_orders/${id}/attachments`, { headers })).json()).data.items;
  expect(saved).toHaveLength(1);
});

test('sair durante envio interrompe a fila e descarta a resposta anterior', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { id, headers } = await setup(page, request);
  let sent = 0;
  let markReceived;
  const received = new Promise(resolve => { markReceived = resolve; });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(`**/work_orders/${id}/attachments?*`, async route => {
    if (route.request().method() !== 'POST') return route.continue();
    sent++;
    const response = await route.fetch();
    markReceived();
    await gate;
    await route.fulfill({ response }).catch(() => {});
  });
  await page.getByLabel('Selecionar fotos e documentos', { exact: true }).setInputFiles([photo('primeira.png'), photo('segunda.png')]);
  await page.getByRole('button', { name: 'Enviar arquivos', exact: true }).click();
  await received;
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  release();
  await expect(page.getByRole('region', { name: 'Fotos e anexos' })).toHaveCount(0);
  const saved = (await (await request.get(`${API}/work_orders/${id}/attachments`, { headers })).json()).data.items;
  expect(sent).toBe(1);
  expect(saved.map(item => item.filename)).toEqual(['primeira.png']);
});
