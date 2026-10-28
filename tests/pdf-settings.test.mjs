import assert from 'node:assert/strict';
import { test } from 'node:test';
import { exampleFilename, filenamePatternError } from '../src/modules/settings/types/pdf-settings.types.ts';
import { pdfFilename } from '../src/shared/services/pdf-filename.ts';

test('padrão de nomes valida variáveis e caracteres', () => {
  assert.equal(filenamePatternError('{tipo}-{numero}-{cliente}.pdf'), null);
  for (const value of ['', '../teste', '{senha}', '{numero:04d}', '{{cliente}}', '\nname', '...', 'x'.repeat(121)]) assert.ok(filenamePatternError(value), value);
});
test('exemplos normalizam nome e extensão', () => {
  assert.equal(exampleFilename('OS {numero} - {cliente}.pdf', 'work_order'), 'OS-123-Cliente-Exemplo.pdf');
  assert.equal(exampleFilename('{tipo}-{numero}', 'quote'), 'orcamento-123.pdf');
  assert.equal(exampleFilename('CON', 'quote'), 'documento-CON.pdf');
});
test('download usa somente um nome seguro vindo do cabeçalho', () => {
  assert.equal(pdfFilename('attachment; filename="OS-123.pdf"'), 'OS-123.pdf');
  for (const header of [null, '', 'attachment; filename="../../foo.pdf"', 'attachment; filename="evil.exe"', 'attachment; filename="x\n.pdf"']) assert.equal(pdfFilename(header), null);
});
