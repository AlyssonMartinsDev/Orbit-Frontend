# Estado do módulo de orçamentos

Solicitação: implementar orçamentos que se tornam ordens de serviço. Os repositórios frontend e backend são separados (`../backend`). Preservar todas as alterações anteriores de configurações, sessões, PDF, plataforma e pagamentos. Nenhum commit/push foi solicitado.

## Implementado

- Menu **Orçamentos** com listagem, busca por título/cliente, filtros e paginação.
- Cadastro e edição de rascunhos com cliente cadastrado, título, descrição, valor total decimal, validade e condições. Cadastro de cliente pode ser aberto em outra aba, com botão para atualizar a lista sem perder a proposta.
- Situações RASCUNHO, ENVIADO, APROVADO, RECUSADO, CANCELADO e CONVERTIDO. Aprovação e envio são registros manuais; não há envio externo nem assinatura digital.
- Administrador e gestor gerenciam; operacional consulta/exporta PDF. Backend aplica isolamento por organização em todas as rotas.
- Validade impede envio/aprovação vencidos. Retornar ao rascunho remove a aprovação atual e exige nova aprovação depois da edição.
- Conversão atômica e idempotente: bloqueio de linha PostgreSQL, uma OS por orçamento, versão esperada contra alterações concorrentes. Reenvio após perda da resposta retorna a mesma OS.
- OS recebe cliente, título, descrição, condições e valor. Aprovação/conversão não cria pagamento. Há links nos dois sentidos e proteção contra exclusão da OS de origem ou do cliente com orçamentos.
- Histórico de ações com responsável, data, versão e observação. Orçamento convertido é imutável; OS segue seu fluxo próprio. Não há snapshot completo de cada edição anterior.
- PDF A4 com organização/logo, cliente, proposta, valor, condições, validade e situação. Layout curto e longo revisado visualmente; textos escapados.
- Tipagem duplicada da resposta de detalhes de OS foi unificada com a resposta geral, incluindo source_quote_id.

## Banco de desenvolvimento

A migração `c72f0d5e83b1` foi aplicada ao PostgreSQL local. Criou quotes e quote_events, preservando as 11 OS existentes, sem criar orçamentos fictícios no banco real. Os testes usam bancos ou schemas descartáveis. Em produção, aplicar `venv/bin/alembic upgrade head` antes de disponibilizar o código novo; nenhuma conversão automática das OS antigas ocorre.

## Arquivos principais

- [Frontend](src/modules/quotes/) e [menu](src/shared/constants/sidebar-menu.ts).
- [Backend](../backend/app/modules/quotes/) e [migração](../backend/alembic/versions/c72f0d5e83b1_quotes.py).
- [Regras e implantação](../backend/docs/orcamentos.md).
- [Testes de API](../backend/tests/test_quotes_api.py), [PostgreSQL](../backend/tests/test_quotes_postgres.py) e [navegador](tests/e2e/quotes-integration.spec.mjs).

## Validação

Implementação e validação concluídas, sem pendências neste escopo.

- `npm run lint`, `npm run build` e `npm test` passaram (20 testes unitários).
- API: 45 testes passaram; 23 testes opcionais de PostgreSQL foram ignorados nessa execução e passaram separadamente no PostgreSQL local.
- Desses testes, 7 são cenários de orçamento na API e 11 na execução PostgreSQL, incluindo concorrência de criação/edição/conversão, migração e rollback após falha de auditoria.
- Navegador: 15 testes gerais + 24 testes integrados passaram. Os 4 testes de orçamento cobrem 320/1440 px, edição, PDF, aprovação, conversão, permissões e repetição após resposta perdida.
- Testes isolados de campos personalizados: 3 passaram. Corrigido o carregamento explícito do modelo Quote, necessário fora da inicialização completa da API.
- Ruff nos módulos/testes novos e `git diff --check` passaram.
- PDFs curto, com logo e longo renderizados e revisados; telas de detalhes em 320/1440 px revisadas visualmente.

## Continuidade

### Redesign dos PDFs

Os templates foram atualizados: orçamento v2 e OS v3, com a mesma identidade visual (azul-marinho/azul, logo e contatos em duas colunas, etiquetas de situação, seções com divisores, blocos claros e valores em destaque). Amostras curtas cabem em uma página; textos extensos têm continuação e rodapé numerado. Corrigidos espaçamentos extras ao dividir linhas explícitas de descrições. Sem alteração financeira ou migração nova.

Validação desta atualização: 45 testes de API passaram (23 opcionais de PostgreSQL ignorados por não envolver mudança de banco); 6 testes de navegador de PDFs/orçamentos passaram; Ruff passou. Exemplos com/sem logo, histórico legado e múltiplas páginas foram renderizados e revisados. Prévia com dados fictícios: [ordem de serviço](../backend/output/pdf/exemplo-ordem-de-servico.pdf) e [orçamento](../backend/output/pdf/exemplo-orcamento.pdf).

O escopo usa um único valor total. Itens/quantidades, descontos, campos personalizados de orçamento, versões integrais de propostas, aceite por link e envio externo são evoluções futuras. Campos personalizados da OS podem ser preenchidos na edição da ordem gerada. O saldo inicial de ordens legadas discutido anteriormente não foi implementado neste módulo.

Para retomar, ler este documento e a documentação de regras, conferir os dois git status e preservar alterações existentes. Não fazer commit/push automaticamente.
