export const client = {
    id: 1, name: 'Cliente de teste', phone: '55999998888', email: null, notes: 'Observação',
    custom_values: [], created_at: '2026-10-14T12:00:00Z', updated_at: '2026-10-14T12:00:00Z',
};
export const field = {
    id: 1, name: 'Garantia', module: 'WORK_ORDER', field_type: 'BOOLEAN', preset_type: null,
    required: true, active: true, display_order: 0, placeholder: null,
    created_at: client.created_at, updated_at: client.updated_at,
};
export const order = {
    id: 1, client, title: 'Manutenção de equipamento', description: 'Revisão completa', price: '150.00',
    status_service: 'EM_ANDAMENTO', status_payment: 'PENDENTE', user_id: 1,
    custom_values: [{ id: 1, work_order_id: 1, field_definition: field, value: 'false' }],
    created_at: client.created_at, updated_at: client.updated_at, finished_at: null,
};
export const summary = {
    cards: { total_clients: 1, open_work_orders: 1, finished_work_orders: 0 },
    financial: { current_month_revenue: 0, pending_payments: 150, average_ticket: 150, completion_rate: 0 },
    recent_work_orders: [{ ...order, client_name: client.name }],
};
export const tracking = {
    items: [order], pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 }, summary: { all: 1, pending: 1 },
};
export async function mockApi(page, handler) {
    await page.addInitScript(() => localStorage.setItem('orbit_token', 'ui-test-only'));
    await page.route('http://127.0.0.1:8000/**', async route => {
        const req = route.request();
        const path = new URL(req.url()).pathname;
        if (handler && await handler(route, path)) return;
        let data;
        if (path === '/dashboard/summary') data = summary;
        else if (path === '/work_orders/tracking') data = tracking;
        else if (path === '/custom-fields') data = [field];
        else if (path.endsWith('/custom-fields')) data = [];
        else if (/\/clients\/1/.test(path)) data = { ...client, summary: { total_work_orders: 1, open_work_orders: 1, finished_work_orders: 0, total_services_value: 150 }, work_orders: [order] };
        else if (path === '/clients/') data = req.method() === 'POST' ? { ...client, ...req.postDataJSON() } : [client];
        else if (path.startsWith('/work_orders/')) data = order;
        else return route.fulfill({ status: 404, json: { success: false, message: `Endpoint inesperado: ${path}` } });
        return route.fulfill({ json: { success: true, message: 'OK', data } });
    });
}
