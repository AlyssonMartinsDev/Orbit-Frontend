# Prazos e acompanhamentos — estado de continuidade

Implementado em 18/10/2026, integrado ao frontend e backend.

## Entrega

- Nova agenda `/followups`, acessível no menu e nas opções de ordens de serviço.
- Filtros: em aberto, atrasadas, entrega hoje, próximos 7 dias, retornos pendentes, sem prazo e encerradas; busca por OS/cliente e responsável, paginação.
- Painel em cada OS com prazo, responsável, próximo retorno e histórico paginado.
- Admin/gestor gerenciam o planejamento; operacional também registra observações.
- Cada alteração exige justificativa e preserva os valores da época; observações não podem ser editadas/excluídas.
- Proteção contra conflitos entre gestores, reenvios duplicados e acesso entre organizações.
- OS finalizadas/canceladas deixam de gerar alertas, mantendo o histórico.
- Layout responsivo e formulários com áreas de toque de pelo menos 44 px.

## Banco e execução

Migração do backend: `d83a1e6f94c2_followups.py`, aplicada no PostgreSQL local. As 11 ordens existentes foram comparadas antes/depois e seus dados anteriores permaneceram intactos. Nenhuma data foi inventada. Nenhum ambiente de produção foi alterado.

Para outros ambientes, executar `venv/bin/alembic upgrade head` antes de servir a nova aplicação. Consulte [documentação do backend](../backend/docs/prazos-acompanhamentos.md).

## Verificações

- Build TypeScript/Vite e lint aprovados; 20 testes de sessão/unitários passaram.
- Suíte backend: 51 testes passaram; 32 verificações opcionais de PostgreSQL foram executadas separadamente, todas aprovadas. Cobertura de permissões, isolamento, validação, histórico, datas, paginação, fechamento da OS, conflitos e rollback.
- Testes reais de PostgreSQL em schemas descartáveis para concorrência, idempotência e preservação de dados na migração.
- 29 testes de integração em Chrome passaram (5 novos): mobile de 320 px, desktop de 1440 px, operacional, resposta perdida e atualização concorrente, além de regressão de pagamentos, PDFs, orçamentos e configurações. Capturas de agenda e acompanhamento revisadas visualmente.

Comando específico de integração: `npm run test:followups`. Se o Chromium do Playwright não estiver instalado, usar `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:followups` com o Chrome disponível.

## Próximas evoluções possíveis

Lembretes automáticos, múltiplas tarefas por OS, atribuição em lote e histórico automático das mudanças de status. Esta versão possui alertas na agenda e acompanhamento interno, sem envio automático de mensagens.
