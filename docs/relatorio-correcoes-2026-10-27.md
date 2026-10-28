# Gestão Orbit — relatório de correções

Data: 27/10/2026.

Referência: [relatório de validação](relatorio-validacao-2026-10-27.md). O relatório anterior permanece como registro do estado encontrado; este documento descreve as correções posteriores.

## Resultado

Os dez problemas confirmados na análise foram tratados. Também foram reduzidas as consultas adicionais por registro, limitado o conjunto de ordens recentes do dashboard e atualizada a documentação que descrevia funcionalidades já implementadas como futuras.

As alterações foram feitas sobre o estado de desenvolvimento existente, preservando o trabalho anterior. Não foram criados commits nem realizado push ou deploy.

## Correções realizadas

| Problema do relatório anterior | Alteração realizada |
| --- | --- |
| 1. Textos maiores que o banco causavam erro 500 | Nome, e-mail, observações de cliente e título da OS possuem limites alinhados ao banco. Os formulários limitam a entrada e a API rejeita excessos com 422. O limite de observações continua sendo 255 caracteres. |
| 2. Clientes com dados básicos inválidos | Criação e edição validam nomes/telefones não vazios; campos obrigatórios não aceitam `null` explícito. Campos opcionais continuam permitindo limpeza. Os schemas de resposta continuam compatíveis com registros antigos. |
| 3. Campos personalizados obrigatórios ignorados | O backend reutiliza o validador compartilhado de campos, verifica obrigatoriedade, tipo, duplicidade e organização. O cadastro rápido na OS agora apresenta e salva os campos próprios de cliente. |
| 4. Telefone duplicado na edição | A edição verifica o telefone; uma constraint garante unicidade de organização + telefone também em requisições simultâneas. Conflitos recebem 409 com mensagem amigável. |
| 5. OS canceladas contadas como abertas | O resumo do cliente conta somente PENDENTE e EM_ANDAMENTO como abertas. |
| 6. OS finalizada sem data de conclusão | Criação já finalizada e transição para FINALIZADO registram a data no servidor. Repetir a finalização preserva a data. Reabrir ou cancelar uma OS finalizada limpa a conclusão corrente. |
| 7. Filtro por período dependente do fuso da conexão | O período usa o calendário de São Paulo e limites convertidos para UTC, com fim exclusivo no início do dia seguinte. |
| 8. Health check retornando HTTP 200 em falha | A indisponibilidade do banco retorna HTTP 503 sem o conteúdo interno da exceção. O Compose passa a consultar esse endpoint no health check da API. |
| 9. Alembic incompatível com `%` na URL | A URL é escapada ao entrar no ConfigParser. A cadeia completa foi validada usando uma URL com query string codificada. |
| 10. Fixture PostgreSQL de orçamento desatualizada | O teste remove e restaura explicitamente a FK posterior de produtos, permitindo verificar a migration original de orçamentos sem conflito com o model atual. |

## Decisões de compatibilidade

- **Telefone:** foi mantida a regra já adotada na criação, agora aplicada também na edição e no banco. A unicidade usa o valor de telefone armazenado, por organização; não foi introduzida uma migração de normalização ou mesclagem de cadastros antigos.
- **Campos personalizados:** criação exige os obrigatórios ativos. Na edição, valores omitidos são preservados; uma alteração parcial sem `custom_values` não obriga a preencher campos criados posteriormente. Quando os campos são enviados, a validação considera os valores existentes junto com as mudanças.
- **Cadastro rápido:** cliente, seus campos personalizados e a OS são persistidos na mesma transação. Falha de validação não deixa um cliente parcialmente criado. Reenvio da mesma criação continua protegido contra duplicação.
- **Conclusão:** não houve preenchimento retroativo de datas em OS antigas. A edição de um título de OS histórica já finalizada não inventa uma data de conclusão. O campo representa a conclusão corrente; não foi criado um novo histórico de transições de status.
- **Valores do cliente:** a soma usa Decimal. O contrato numérico da resposta foi preservado. O total continua histórico, incluindo ordens canceladas, e sua legenda foi alterada para “Valor histórico das ordens” para deixar esse significado claro.
- **Descrição geral antiga, PDFs, estoque e pagamentos:** os fluxos existentes foram preservados e passaram novamente nos testes.

## Consultas e desempenho

As relações necessárias às listagens de clientes e OS passaram a ser carregadas em conjunto. Também foi adicionada uma ordenação explícita de clientes, evitando que a criação do índice de telefone altere a ordem observada da lista.

Medição após as correções, em banco temporário SQLite, incluindo autenticação e serialização:

| Endpoint | 1 registro | 11 registros |
| --- | --- | --- |
| Clientes | 4 consultas | 4 consultas |
| OS completas | 5 consultas | 5 consultas |
| OS paginadas | 7 consultas | 7 consultas |

A suíte também verifica crescimento limitado de consultas no PostgreSQL. Esses resultados são contagens de SQL, não uma promessa de tempo de resposta ou capacidade sob carga.

O dashboard agora retorna no máximo 20 ordens recentes do mês, com carregamento antecipado de clientes. Os demais indicadores continuam calculados sobre o conjunto correspondente às suas regras.

## Migration

Criada: [eb1a4f9267d5_unique_client_phone.py](../../backend/alembic/versions/eb1a4f9267d5_unique_client_phone.py).

- Revisão anterior: `da0f3e8156c4`.
- Adiciona a constraint `uq_client_org_phone` em organização + telefone.
- Não altera valores, não mescla clientes e não exclui registros.
- Antes de criar a constraint, verifica duplicidades; se existirem, interrompe com mensagem para revisão dos cadastros.
- Aplicada somente no PostgreSQL local `OrbitDbDev`, após conferir host local, endereço de servidor em loopback, revisão anterior e ausência de duplicados.
- Contagem e assinatura do conteúdo completo dos registros de clientes foram comparadas antes e depois: os dados permaneceram intactos.
- A cadeia completa, desde um schema vazio até essa revisão, também foi aplicada com sucesso em um schema descartável.

Na publicação futura, essa migration deve acompanhar o código. Nenhuma migration foi executada em produção nesta etapa.

## Verificações

| Verificação | Resultado |
| --- | --- |
| Build e TypeScript do frontend | Aprovados |
| ESLint | Aprovado |
| Testes unitários do frontend | 32 aprovados |
| Backend completo, com PostgreSQL habilitado | 279 aprovados, sem falhas e sem testes ignorados |
| Navegador com API e banco temporários | 77 aprovados |
| Navegador com respostas simuladas | 15 aprovados |
| Novos testes de regressão do backend | 19 aprovados, incluídos na suíte completa |
| Migration completa com URL codificada | Aprovada em schema descartável |
| Migration local e preservação dos clientes | Aprovadas |
| Whitespace dos diffs | Sem erros |

Os novos testes cobrem limites e valores nulos, campos obrigatórios e parciais, cadastro rápido com rollback/reenvio, telefones concorrentes, isolamento entre organizações, preservação de registros em migration recusada por duplicidade, finalização/reabertura, limites de datas, health check e número de consultas. No navegador, foram acrescentados cenários do cadastro rápido com campos de cliente e finalização em 320 e 1440 px.

## Arquivos desta etapa

### Frontend

- [ClientForm.tsx](../src/modules/clients/components/ClientForm.tsx): limites dos campos.
- [ClientsDetailPage.tsx](../src/modules/clients/pages/ClientsDetailPage.tsx): legenda do valor histórico.
- [WorkOrderForm.tsx](../src/modules/work-orders/components/WorkOrderForm.tsx): limites e campos personalizados do cadastro rápido.
- [work-order.types.ts](../src/modules/work-orders/types/work-order.types.ts): contrato dos valores personalizados do cliente.
- [custom-fields-integration.spec.mjs](../tests/e2e/custom-fields-integration.spec.mjs): novos fluxos de regressão no navegador.
- [README.md](../README.md): referência de versão corrigida para 1.1.0.
- Este relatório.

### Backend

- [Model de clientes](../../backend/app/modules/clients/model.py): constraint de telefone.
- [Schemas de clientes](../../backend/app/modules/clients/schema.py): limites e regras de entrada.
- [Serviço de clientes](../../backend/app/modules/clients/service.py): unicidade, campos obrigatórios, consultas e resumo.
- [Schemas de OS](../../backend/app/modules/work_orders/schema.py): título e contrato do cadastro rápido.
- [Serviço de OS](../../backend/app/modules/work_orders/service.py): campos do cliente, conclusão, período e consultas.
- [Serviço do dashboard](../../backend/app/modules/dashboard/service.py): ordens recentes limitadas e calendário do mês.
- [main.py](../../backend/app/main.py): resposta correta de prontidão do banco.
- [env.py](../../backend/alembic/env.py): compatibilidade da URL do Alembic.
- [Migration de telefone](../../backend/alembic/versions/eb1a4f9267d5_unique_client_phone.py): integridade no banco.
- [compose.yaml](../../backend/compose.yaml): health check conectado à prontidão do banco.
- [test_quotes_postgres.py](../../backend/tests/test_quotes_postgres.py): fixture histórica corrigida.
- [test_stabilization.py](../../backend/tests/test_stabilization.py): regressões da auditoria e concorrência.
- [Documentação de orçamentos](../../backend/docs/orcamentos.md): funcionalidades atuais e evoluções futuras.

A lista representa esta rodada de correções. Há alterações anteriores ainda não commitadas nos dois repositórios, que não foram removidas nem incluídas como novas correções deste relatório.

## Pendências e próximos passos

Não restaram falhas funcionais confirmadas entre os dez problemas tratados. Isso não significa que todas as evoluções do relatório original tenham sido implementadas.

Continuam pendentes como melhorias ou novas funcionalidades:

- Paginação de clientes no servidor com adaptação da listagem e dos seletores; o endpoint completo continua compatível e sem consultas adicionais por cliente.
- Numeração personalizada de OS por organização.
- Recuperação autônoma de senha, gestão central das organizações, planos/assinaturas e comunicações automáticas.
- Verificação da proteção contra excesso de tentativas de login na infraestrutura real.
- Testes de backup/restauração de banco e anexos na hospedagem efetiva, além de testes de carga.

Não foram alteradas configurações da hospedagem de produção nem instaladas novas dependências. Essas pendências não foram apresentadas como funcionalidades prontas.
