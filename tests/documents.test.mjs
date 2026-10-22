import assert from 'node:assert/strict';
import { test } from 'node:test';
import { documentError, documentType, formatCpfCnpj, isValidCpf, isValidCnpj, normalizeDocument } from '../src/shared/utils/documents.ts';

test('CPF e CNPJ numérico/alfanumérico: tipo, validação e normalização', () => {
    for (const [raw, normalized, kind] of [
        ['529.982.247-25', '52998224725', 'CPF'],
        ['04.252.011/0001-10', '04252011000110', 'CNPJ'],
        ['12.abc.345/01de-35', '12ABC34501DE35', 'CNPJ'],
        ['00.000.000/E08G-12', '00000000E08G12', 'CNPJ'],
    ]) {
        assert.equal(normalizeDocument(raw), normalized);
        assert.equal(documentType(normalized), kind);
        assert.equal(documentError(raw), null);
        assert.equal(kind === 'CPF' ? isValidCpf(normalized) : isValidCnpj(normalized), true);
    }
});

test('documentos inválidos, dígitos verificadores e repetições são rejeitados', () => {
    for (const raw of ['52998224724', '04252011000111', '12ABC34501DE36', '12ABC34501DEAB', '11111111111180', '123', '529982247250', '529@98224725', '---', '１２３４５６７８９０１', '12ABC34501ßE35',
        ...Array.from({ length: 10 }, (_, n) => [String(n).repeat(11), String(n).repeat(14)]).flat()]) {
        assert.ok(documentError(raw), raw);
    }
});

test('documento opcional e máscara dinâmica preservam entrada sem truncar', () => {
    for (const value of [null, undefined, '', ' ']) assert.equal(documentError(value), null);
    for (const [raw, formatted] of [
        ['529', '529'], ['5299', '529.9'], ['52998224725', '529.982.247-25'],
        ['04252011000', '042.520.110-00'], ['042520110001', '04.252.011/0001'],
        ['04252011000110', '04.252.011/0001-10'],
        ['12a', '12.A'], ['12abc34501de35', '12.ABC.345/01DE-35'],
        ['529982247250000', '529982247250000'], ['529@98224725', '529@98224725'],
    ]) assert.equal(formatCpfCnpj(raw), formatted);
    for (const full of ['52998224725', '04252011000110', '12ABC34501DE35']) {
        for (let i = 0; i <= full.length; i++)
            assert.equal(normalizeDocument(formatCpfCnpj(full.slice(0, i))), full.slice(0, i));
    }
});
