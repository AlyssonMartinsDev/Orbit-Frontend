# Itens opcionais em orçamentos e ordens de serviço

## Implementado

- Os formulários de orçamento e OS oferecem **Valor único** (padrão) e **Detalhar itens**.
- A descrição geral permanece nos dois modos. Cada item tem descrição livre, quantidade e valor unitário; pode representar serviço, mão de obra, peça ou material.
- Até 100 itens; quantidade com até 3 casas decimais, valor unitário com 2. Subtotal arredondado por linha para centavos, seguido da soma. O backend calcula o total autoritativo com Decimal; o frontend usa inteiros para evitar divergências por ponto flutuante.
- Trocar para valor único preenche o valor com o total dos itens e permite editá-lo. Ao salvar nesse modo, a lista é removida do documento; há aviso no formulário.
- A conversão de orçamento em OS copia os itens, sem compartilhar a lista mutável. Editar a OS não altera seu orçamento de origem.
- Itens aparecem nos detalhes e nos PDFs de ambos os documentos; tabelas longas paginam e repetem cabeçalho.
- Valores de OS abaixo do total recebido são rejeitados em qualquer modo, inclusive troca para valor único.
- Edições concorrentes do preço/itens da OS usam versão de valores e a mesma trava de linha dos pagamentos. Orçamentos mantêm sua versão e regras de aprovação existentes.

## Compatibilidade e banco

Migração `e94b2f70a5d3_optional_items.py`, após prazos. Aplicada somente ao PostgreSQL local; as 11 OS e o orçamento existente foram comparados integralmente antes/depois, preservando seus dados anteriores. Cadastros existentes passam a `SIMPLE` com lista vazia, sem recalcular preços.

Antes de atualizar outro ambiente: `venv/bin/alembic upgrade head`. Downgrade recusa remover documentos ainda detalhados em itens. Nada foi aplicado em produção.

As linhas são cópias dos dados de cada documento armazenadas em JSON, sem vínculo com catálogo ou estoque. As APIs mantêm os endpoints atuais. Detalhes do contrato: [documentação do backend](../backend/docs/itens-opcionais.md).

## Validação

- Build TypeScript/Vite e lint aprovados; 22 testes de sessão/cálculo passaram.
- 58 testes backend passaram na suíte comum; 42 cenários PostgreSQL passaram em schemas descartáveis, incluindo concorrência e migrações. O teste antigo da migração de orçamentos foi adaptado para atualizar seu schema de teste antes de chamar a API atual.
- 33 testes de integração passaram no Chrome, incluindo 4 novos para criação/edição em 320 e 1440 px, conversão com itens e bloqueio de redução abaixo do valor pago.
- PDFs de OS e orçamento com itens renderizados para inspeção; casos longos e descrição de 499 caracteres com quebras de linha também validados.

Comandos: `npm test`, `npm run lint`, `npm run build`, `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:items`. Testes PostgreSQL exigem `ORBIT_TEST_POSTGRES_URL` local e usam apenas schemas descartáveis.

## Evoluções possíveis

Descontos, unidades de medida, catálogo reutilizável e relatórios por serviço/material. Esta entrega cobre itens livres opcionais, sem movimentação de estoque e sem descontos adicionais.
