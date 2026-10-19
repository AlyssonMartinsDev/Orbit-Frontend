import assert from 'node:assert/strict';
import { test } from 'node:test';
import { itemsTotal, lineAmount } from '../src/shared/components/pricing/pricing.ts';

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
