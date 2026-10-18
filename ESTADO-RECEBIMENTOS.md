# Recebimentos por ordem de serviço — estado do trabalho

Solicitação: implementar recebimentos parciais com valor/data/forma, histórico, cancelamento preservando auditoria, saldo/status automáticos e dashboard. Salvar estado para continuidade se necessário.

Workspace: frontend neste repositório, backend em `../backend`. Há alterações anteriores de configurações, PDF e painel de plataforma ainda sem commit; preservá-las. Não fazer commit/push automaticamente.

## Decisões

- Valores decimais no backend, lançamentos positivos limitados ao saldo, UUID de idempotência e bloqueio da OS para serializar recebimentos, cancelamentos e alterações de preço.
- Administradores/gestores lançam recebimentos; somente administrador cancela/revisa legado. Operacional consulta.
- Histórico imutável: cancelar com motivo/autor/data; nunca apagar OS com lançamentos.
- Status manual deixa de existir para novas OS. Receita mensal passa a usar data e soma dos recebimentos ativos; pendências usam saldo.
- OS antigas PAGO/PARCIAL/CANCELADO não terão pagamentos/datas inventados. Migração marca revisão necessária, mantém status anterior e a UI permite registrar o histórico conhecido e confirmar revisão. Dashboard destaca registros aguardando revisão e não apresenta seus saldos desconhecidos como dívida confirmada.

## Estado final — 17/10/2026

Primeira versão concluída e validada. Nenhuma implementação pendente neste escopo. Alterações permanecem sem commit, junto das alterações anteriores.

- [Backend de recebimentos](../backend/app/modules/payments/): modelo, validação, rotas e regras separadas. Resumo consulta preço e lançamentos no mesmo snapshot. Concorrência serializada em PostgreSQL.
- [Migração b61e9c4d72a0](../backend/alembic/versions/b61e9c4d72a0_work_order_payments.py) **aplicada** ao banco PostgreSQL local de desenvolvimento. As 11 OS existentes e suas situações foram preservadas; 6 ficaram marcadas para revisão, zero recebimentos foram inventados. Não foram criados cadastros reais pelos testes.
- Status automático integrado à criação/edição da OS. Proteções de preço, cancelamento de serviço, exclusão de OS e exclusão de clientes com OS.
- [Interface](src/modules/work-orders/components/WorkOrderPayments.tsx) nos detalhes e ação “Recebimentos” na listagem, com navegação à seção, revisão do legado, permissões e recuperação de falhas. Formulário de OS não edita mais situação de pagamento.
- Dashboard: “Recebido no mês”, pendências por saldo e aviso de revisão. PDF v2: recebido/saldo, “Em revisão” quando necessário; consultas financeiras consistentes e layout curto em uma página.
- Documentação: [regras e API](../backend/docs/recebimentos.md), [PDF](../backend/docs/pdf-export.md), [frontend](README.md).

## Validações concluídas

- Frontend: `npm run lint`, `npm test` (20 testes) e `npm run build` passaram.
- Backend: `venv/bin/python -m unittest discover -s tests -p 'test_*.py'`: 38 testes passaram; 12 de PostgreSQL são ignorados nessa execução por exigirem configuração explícita.
- PostgreSQL local, schemas descartáveis: os 12 testes passaram separadamente, incluindo concorrência de valores/preço, reenvio idempotente e migração de legado. A variável `ORBIT_TEST_POSTGRES_URL` foi configurada somente no processo de teste com a URL local já existente, sem expor credenciais.
- Navegador: 15 testes gerais + 19 de integração real passaram, incluindo 6 de recebimentos, 2 de PDF, 6 de plataforma e 5 de configurações. Rodar suítes sequencialmente por compartilharem cache do Vite.
- Ruff passou nos módulos de recebimentos, PDF e testes relacionados. `git diff --check` sem problemas nos dois repositórios.
- PDFs renderizados e revisados visualmente: curto, com logo, legado e descrição longa; valores ativos/cancelados e saldo desconhecido também cobertos por teste de conteúdo.
- Interface de recebimentos revisada em 320 e 1440 px; suíte geral cobre também 375 e 768 px.
- Ao encerrar, frontend `http://127.0.0.1:5173` e backend `http://127.0.0.1:8000` respondem HTTP 200. Processos de desenvolvimento podem precisar ser reiniciados em outra sessão.

## Próxima utilização / continuidade

### Atualização: pagamento total e parcial

- A seção passou a se chamar **Pagamentos da OS**, com ação **Vincular pagamento** no acompanhamento.
- Pagamento total vem selecionado e usa o saldo informado pela API, sem digitação do valor. Havendo pagamento anterior, a ação é **Quitar saldo restante**. Data, forma e observação continuam disponíveis.
- **Pagamento parcial** permite informar o valor. Ordens legadas com saldo desconhecido não oferecem quitação automática antes da revisão.
- Mesma API, permissões e identificação de reenvio; nenhuma migração nova. Lint/build passaram e os 7 testes de integração de pagamentos passaram, incluindo quitação total, parcial, saldo restante, permissões, legado e falha de rede. Layout revisado em 320 px; testes também cobrem 1440 px.
- A proposta de saldo inicial para histórico incompleto foi discutida, mas ainda não implementada: permanece uma evolução separada.

1. Entrar como administrador, abrir as ordens antigas e registrar somente recebimentos cujo valor e data sejam conhecidos. Usar “Concluir revisão do histórico” e confirmar. Essa revisão de dados reais cabe ao usuário; não foi feita automaticamente.
2. Em outros ambientes, instalar dependências atualizadas e executar `venv/bin/alembic upgrade head` antes de iniciar esta versão.
3. Próximas evoluções possíveis, fora do escopo concluído: parcelas/vencimentos, relatório financeiro por período, recibo individual e conciliação bancária. O cancelamento atual corrige apenas o registro local, sem executar reembolso.
4. Preservar alterações anteriores ao continuar; não fazer commit/push automaticamente. Upload de foto do usuário não fez parte deste módulo e segue como assunto separado.
