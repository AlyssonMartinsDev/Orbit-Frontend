import assert from 'node:assert/strict';
import { test } from 'node:test';
import { itemizedDraft, itemsTotal, lineAmount, sumAmounts } from '../src/shared/components/pricing/pricing.ts';

test('itens usam centavos exatos e arredondamento por linha', () => {
    assert.equal(itemsTotal([{ description: 'A', quantity: '1.5', unit_price: '100.01' }, { description: 'B', quantity: '2', unit_price: '9.99' }]), '170.00');
    assert.equal(lineAmount({ description: 'A', quantity: '0.5', unit_price: '0.01' }), '0.01');
    assert.equal(itemsTotal([{ description: 'A', quantity: '3', unit_price: '0.10' }]), '0.30');
});
test('itens incompletos, excedentes e valores inválidos não geram total', () => {
    assert.equal(itemsTotal([]), null);
    for (const [quantity, unit_price] of [['0','1'], ['-1','1'], ['NaN','1'], ['1.0001','1'], ['1','1.001'], ['2','99999999.99'], ['1e3','2'], ['', '0']]) assert.equal(itemsTotal([{ description: 'A', quantity, unit_price }]), null);
    assert.equal(itemsTotal([{ description: 'Cortesia', quantity: '1', unit_price: '0' }]), '0.00');
});

test('total de serviços e produtos mantém centavos e limite', () => {
    assert.equal(sumAmounts(['0.10', '0.20']), '0.30');
    assert.equal(sumAmounts(['100.00', '25.00']), '125.00');
    assert.equal(sumAmounts(['99999999.99', '0.01']), null);
    assert.equal(sumAmounts(['-1', '2']), null);
});

test('detalhamento admite subtotal manual zero, sem aceitar lista vazia por padrão', () => {
    assert.equal(itemsTotal([], true), '0.00');
    assert.equal(itemsTotal([]), null);
    assert.deepEqual(itemizedDraft(), { pricing_mode: 'ITEMIZED', items: [], price: '0.00' });
});
test('valor legado vira um serviço sem duplicar produtos nem alterar o documento original', () => {
    const legacy = { pricing_mode: 'SIMPLE', title: 'Manutenção', price: '125.03', items: [], products: [{ quantity: '2', unit_price: '12.50' }] };
    const draft = itemizedDraft(legacy);
    assert.equal(draft.price, '100.03');
    assert.deepEqual(draft.items, [{ kind: 'SERVICE', description: 'Manutenção', quantity: '1', unit_price: '100.03' }]);
    assert.deepEqual(legacy.items, []);
    assert.equal(legacy.pricing_mode, 'SIMPLE');
    assert.equal(itemizedDraft({ ...legacy, service_price: '100.03' }).price, '100.03');
    assert.equal(itemizedDraft({ ...legacy, price: '25.00' }).items.length, 0);
    assert.equal(itemizedDraft({ ...legacy, price: '0', products: [] }).items[0].unit_price, '0.00');
});
test('itens salvos e produtos sem serviço preservam valores no rascunho', () => {
    const items = [{ description: 'Mão de obra', quantity: '1.5', unit_price: '100.01' }];
    const draft = itemizedDraft({ pricing_mode: 'ITEMIZED', items, price: '175.02' });
    assert.equal(draft.price, '150.02');
    assert.deepEqual(draft.items, items);
    draft.items[0].description = 'Alterado';
    assert.equal(items[0].description, 'Mão de obra');
    assert.deepEqual(itemizedDraft({ pricing_mode: 'ITEMIZED', items: [], price: '25' }).items, []);
});
