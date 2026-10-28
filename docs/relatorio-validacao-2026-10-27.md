# Gestão Orbit — relatório de validação

Data: 27/10/2026. Escopo: frontend e backend locais, incluindo as alterações ainda não commitadas.

## Parecer

O Orbit já tem um núcleo operacional funcional e uma cobertura automatizada relevante. Clientes, orçamentos, OS, pagamentos, estoque, anexos, PDFs e configurações estão integrados. Os fluxos principais passaram nos testes de navegador, inclusive em telas pequenas.

Não classificaria o projeto como **100% concluído**. A análise encontrou falhas reproduzíveis de validação, indicadores e datas, uma incompatibilidade de configuração do Alembic e um teste PostgreSQL desatualizado. Há também funcionalidades explicitamente pendentes e etapas comerciais do SaaS que ainda não existem.

Não foi confirmado um vazamento entre organizações nos cenários examinados. Os testes de autorização, isolamento e concorrência existentes foram executados; isso não equivale a uma auditoria de segurança exaustiva nem a uma validação da hospedagem em produção.

**Nenhum código de aplicação foi corrigido nesta análise.** O único arquivo adicionado ao projeto é este relatório. As reproduções utilizaram bancos temporários e schemas PostgreSQL descartáveis, removidos ao final. As tabelas da aplicação e as configurações de produção não foram alteradas.

## Verificações realizadas

| Verificação | Resultado |
| --- | --- |
| Build e TypeScript do frontend | Aprovados |
| ESLint | Aprovado |
| Testes unitários do frontend | 32 aprovados |
| Navegador com API e banco temporários | 75 aprovados |
| Navegador com respostas simuladas | 15 aprovados |
| Backend sem habilitar PostgreSQL | 141 aprovados; 119 ignorados pelas condições da suíte |
| Backend com PostgreSQL local habilitado | 260 executados: 259 aprovados e 1 erro de preparação de teste |
| Cadeia completa do Alembic em schema vazio descartável | Aprovada até `da0f3e8156c4` |
| Reproduções adicionais fora da suíte | Confirmaram os problemas descritos abaixo |
| Consistência de whitespace dos diffs | Sem erros |

O PostgreSQL foi confirmado como `OrbitDbDev`, com host configurado como `localhost` e endereço de servidor em loopback. Os testes PostgreSQL utilizaram schemas próprios, sem aplicar migrations ao schema da aplicação.

As verificações cobriram criação, edição, persistência, permissões, troca de sessão, pagamentos parciais/totais, estoque, conversão de orçamento, PDFs, fotos, endereços, campos personalizados e responsividade. Não foram realizados teste de carga, pentest, restauração de backup, auditoria de dependências ou inspeção da infraestrutura de produção. Os PDFs foram validados pelos testes existentes; não houve uma nova revisão visual de todas as combinações possíveis de conteúdo e modelo.

## Bugs e problemas confirmados

### 1. Campos maiores que o limite do banco causam erro 500

**Prioridade: alta para a próxima entrega.** Afeta preenchimentos legítimos nos formulários.

- Uma observação de cliente com 256 caracteres retorna HTTP 500 no PostgreSQL.
- Um título de OS com 256 caracteres também retorna HTTP 500.
- Os formulários permitem esses valores; os schemas correspondentes não impõem o mesmo limite das colunas `String(255)`.

O usuário perde a possibilidade de salvar e recebe um erro genérico, em vez de uma orientação sobre o campo. O problema também pode ocorrer no cadastro rápido de cliente dentro da OS.

**Correção sugerida:** definir limites coerentes em frontend e backend. Para observações, avaliar se a intenção é aceitar textos longos e usar uma coluna de texto; para títulos e nomes, validar o limite antes de chegar ao banco.

Evidências: [schema de clientes](../../backend/app/modules/clients/schema.py), [model de clientes](../../backend/app/modules/clients/model.py), [formulário de clientes](../src/modules/clients/components/ClientForm.tsx), [schema de OS](../../backend/app/modules/work_orders/schema.py) e [formulário de OS](../src/modules/work-orders/components/WorkOrderForm.tsx).

### 2. Validação básica de clientes é incompleta no backend

**Prioridade: média.** Integridade do cadastro e tratamento de erros.

Reproduções confirmadas:

- Criar cliente com nome contendo somente espaços e telefone vazio retorna HTTP 200.
- Atualizar o nome com `null` passa pela validação do endpoint, mas viola a coluna obrigatória e retorna HTTP 500.

O formulário normal protege parte desses casos, mas essa proteção não substitui a validação da API. Outros clientes da API e futuros fluxos internos podem gravar dados inadequados.

**Correção sugerida:** normalizar espaços, rejeitar nomes e telefones vazios, distinguir campo omitido de `null` e impedir `null` nos atributos obrigatórios. Manter `null` permitido para CPF/CNPJ e demais atributos opcionais.

Evidências: [schemas de clientes](../../backend/app/modules/clients/schema.py) e [atualização do cliente](../../backend/app/modules/clients/service.py).

### 3. Campos personalizados obrigatórios de clientes podem ser ignorados

**Prioridade: média.** Regra configurada não é garantida no servidor.

Após criar um campo ativo do módulo CLIENT com `required=true`:

- A criação do cliente sem enviar esse campo retorna HTTP 200.
- A edição enviando `value: null` também retorna HTTP 200.

O serviço verifica se os campos enviados pertencem à organização e ao módulo correto, mas não exige os campos obrigatórios ausentes. O cadastro rápido de cliente na OS também não apresenta os campos personalizados de cliente.

**Correção sugerida:** centralizar a validação dos campos obrigatórios de cliente no backend e definir como o cadastro rápido deve solicitá-los ou encaminhar para o cadastro completo. Preservar a distinção entre atualizações parciais e limpeza explícita.

Evidências: [persistência dos valores de cliente](../../backend/app/modules/clients/service.py) e [cadastro rápido na criação de OS](../../backend/app/modules/work_orders/service.py).

### 4. A regra de telefone único não é aplicada na edição

**Prioridade: média.** Comportamento inconsistente entre criação e edição.

A criação rejeita telefone já cadastrado na organização. Entretanto, editar outro cliente para usar esse mesmo telefone retorna HTTP 200. O model também não possui uma constraint de unicidade por organização e telefone, deixando a criação exposta a duplicação em operações simultâneas.

**Correção sugerida:** primeiro confirmar a regra de negócio. Se clientes podem compartilhar telefone, retirar a restrição inconsistente da criação. Se o telefone deve ser único, validar também na edição e garantir a regra no banco, com tratamento amigável de conflito e preparação para eventuais duplicados existentes.

Evidências: [serviço de clientes](../../backend/app/modules/clients/service.py) e [constraints do cliente](../../backend/app/modules/clients/model.py).

### 5. OS canceladas aparecem como abertas no resumo do cliente

**Prioridade: média.** Indicador incorreto exibido ao usuário.

Com uma única OS cancelada, o endpoint de detalhes do cliente retornou `open_work_orders: 1`. A contagem atual considera aberta qualquer OS cujo status seja diferente de FINALIZADO, incluindo CANCELADO. O dashboard, por sua vez, considera apenas PENDENTE e EM_ANDAMENTO.

**Correção sugerida:** usar a mesma definição de OS aberta nos dois módulos. O total financeiro do cliente também inclui OS canceladas; definir explicitamente se esse indicador representa o valor histórico de todos os documentos ou apenas serviços válidos.

Evidências: [resumo do cliente](../../backend/app/modules/clients/service.py) e [indicadores do dashboard](../../backend/app/modules/dashboard/service.py).

### 6. Finalizar a OS não registra a data de conclusão

**Prioridade: média.** Histórico e PDF incompletos.

Alterar o status para FINALIZADO retorna sucesso, mas `finished_at` permanece `null`. A ação do frontend envia somente o status, e o serviço não preenche a data automaticamente. O PDF utiliza esse campo na informação de conclusão.

**Correção sugerida:** registrar a conclusão no backend durante a transição de status, na mesma transação. Definir o comportamento ao reabrir a OS e se é necessário preservar conclusões anteriores em histórico.

Evidências: [ações da OS](../src/modules/work-orders/components/WorkOrderActionsModal.tsx), [serviço da OS](../../backend/app/modules/work_orders/service.py) e [data de conclusão no PDF](../../backend/app/modules/work_orders/pdf.py).

### 7. Filtro de período pode divergir da data exibida no Brasil

**Prioridade: média.** Problema confirmado com conexão PostgreSQL em UTC.

Uma OS criada em `25/10/2026 01:30 UTC` corresponde a `24/10/2026 22:30` em São Paulo. Na reprodução, a busca de 24/10 não retornou a OS; a busca de 25/10 retornou.

Os limites do filtro são construídos com datetimes sem fuso e passam a depender do timezone da conexão. Outros módulos já usam explicitamente o calendário de São Paulo.

**Correção sugerida:** estabelecer o fuso de negócio para filtros, montar início e fim exclusivos com timezone explícito e comparar instantes equivalentes. Adicionar testes para registros próximos da meia-noite.

Evidências: [filtros da listagem de OS](../../backend/app/modules/work_orders/service.py) e [formatação de datas](../src/shared/utils/format.ts).

### 8. Health check retorna sucesso HTTP quando o banco falha

**Prioridade: média.** Monitoramento e exposição desnecessária de detalhes internos.

Simulando indisponibilidade do banco, `/health/database` retornou HTTP 200 com `success: false`. O corpo também incluiu o texto integral da exceção. Um monitor que olha apenas o status HTTP interpreta a API como saudável.

O health check do Compose consulta `/`, que não testa o banco. Pode ser adequado como verificação de processo, mas não confirma prontidão para atender operações.

**Correção sugerida:** diferenciar verificação de processo e de prontidão; retornar 503 na indisponibilidade do banco, registrar detalhes no servidor e enviar uma mensagem pública genérica.

Evidências: [health check da API](../../backend/app/main.py) e [health check do Compose](../../backend/compose.yaml).

### 9. Alembic falha com URLs que contêm caracteres percent-encoded

**Prioridade: alta quando o ambiente utiliza esse formato de URL.** Risco de implantação.

A configuração passa `DATABASE_URL` diretamente para `Config.set_main_option`. O ConfigParser interpreta `%` como interpolação. Foi reproduzido `ValueError` com uma URL sintética contendo `%40`; o mesmo comportamento apareceu ao parametrizar um schema de teste por query string codificada.

A URL local atual, sem esse encoding, funciona. Portanto, isso não significa que a cadeia de migrations esteja quebrada: ela foi aplicada integralmente com sucesso no schema descartável.

**Correção sugerida:** escapar `%` ao inserir a URL na configuração do Alembic ou fornecer a conexão por um mecanismo que não passe por essa interpolação. Evitar incluir URLs com credenciais em mensagens de erro e logs.

Evidência: [configuração do Alembic](../../backend/alembic/env.py).

### 10. Um teste PostgreSQL de migração ficou desatualizado

**Prioridade: corrigir antes de exigir a suíte completa como critério de release.** É uma falha do teste, não uma falha comprovada da migration.

`PostgreSQLQuotes.test_migration_preserves_existing_orders` tenta remover a tabela de orçamentos para testar sua criação original. O model atual já cria `document_products`, cuja FK referencia os orçamentos; o PostgreSQL impede o `DROP TABLE quotes`.

O teste falha antes de executar a migration em avaliação. Isso explica a diferença entre a suíte padrão, que ignora testes PostgreSQL, e a execução completa.

**Correção sugerida:** montar o estado histórico anterior à migration ou tratar explicitamente as dependências criadas pelas evoluções posteriores na fixture. Não usar essa falha para concluir que a migration real destrói dados.

Evidência: [teste PostgreSQL de orçamentos](../../backend/tests/test_quotes_postgres.py).

## Melhorias técnicas verificadas

### Consultas adicionais por registro e crescimento das listagens

Foi medido crescimento linear de consultas em banco temporário, com clientes distintos:

| Endpoint | 1 registro da organização | 11 registros da organização |
| --- | --- | --- |
| Listagem paginada de OS | 8 consultas | 18 consultas |
| Listagem de clientes | 4 consultas | 14 consultas |
| Listagem completa de OS, em SQLite | 6 consultas | 26 consultas |

Os números incluem autenticação e serialização. Eles comprovam consultas adicionais por registro; não são um benchmark de latência ou capacidade de produção.

**Recomendação:** carregar antecipadamente as relações usadas nas respostas, paginar clientes no servidor e limitar o conjunto de OS recentes do dashboard. A listagem de clientes ainda carrega todos os registros, e o dashboard carrega todas as OS do mês antes de montar a resposta.

Evidências: [clientes](../../backend/app/modules/clients/service.py), [OS](../../backend/app/modules/work_orders/service.py), [dashboard](../../backend/app/modules/dashboard/service.py) e [store de clientes](../src/shared/store/client.store.ts).

### Consistência monetária e indicadores

Pagamentos, estoque e itens utilizam Decimal/Numeric. O resumo financeiro do cliente ainda converte preços para `float` e soma em memória. Convém padronizar esse trecho com agregação decimal no banco e revisar a inclusão de documentos cancelados nos indicadores. Não foi identificada, nesta análise, uma cobrança incorreta causada por esse trecho.

Evidência: [resumo financeiro do cliente](../../backend/app/modules/clients/service.py).

### Segurança operacional

Não foi encontrada limitação de tentativas de login no código examinado. Verificar se existe proteção equivalente na infraestrutura e, caso não exista, implementá-la antes de ampliar o acesso público. Não foi inspecionado o proxy ou a hospedagem para afirmar que essa proteção está ausente em produção.

Os anexos usam armazenamento local privado. O Compose já declara volume persistente; confirmar que a hospedagem efetiva oferece persistência e backup desse volume junto com o banco. Não basta copiar somente o PostgreSQL para restaurar os anexos.

Evidências: [autenticação](../../backend/app/modules/auth/routes.py), [storage de anexos](../../backend/app/modules/attachments/storage.py) e [Compose](../../backend/compose.yaml).

### Documentação

Parte da documentação está atrasada: a documentação de orçamentos ainda descreve itens e campos próprios como evoluções futuras, embora já estejam implementados. O README do frontend cita a versão 1.0.0, enquanto o pacote está em 1.1.0. Atualizar esses documentos ajudará a evitar decisões baseadas em um estado antigo do sistema.

Evidências: [documentação de orçamentos](../../backend/docs/orcamentos.md), [README](../README.md) e [manifesto do frontend](../package.json).

## Estado funcional por módulo

| Módulo | O que está implementado e foi verificado | Limitação ou pendência |
| --- | --- | --- |
| Autenticação e sessão | Login, isolamento de sessão, perfis e invalidação após alteração de senha | Recuperação autônoma de senha não identificada; proteção de tentativas precisa ser verificada na infraestrutura |
| Organização e equipe | Dados, logo, endereço, perfis, ativação/desativação e permissões | Gestão comercial do ciclo de vida da organização ainda limitada |
| Clientes | Cadastro, edição, documento, endereço, detalhes e vínculo com OS | Problemas de validação, telefone, obrigatoriedade e indicadores descritos acima |
| Endereços | UF/cidade relacionadas, CEP, preenchimento e persistência | Consulta externa sujeita à disponibilidade do provedor; existe preenchimento manual |
| Campos personalizados | Escopos de cliente, OS, orçamento e compartilhados | Obrigatoriedade de CLIENT não garantida no backend |
| Orçamentos | Itens, produtos, pagamentos informativos, situações, conversão e PDF | Envio/aprovação são registros manuais; não constituem envio externo nem aceite autenticado do cliente |
| Ordens de serviço | Itens sempre detalhados, edição, produtos, histórico legado e PDF | Data de conclusão, filtro por período e limite de título precisam de correção |
| Pagamentos | Lançamento parcial/total, cancelamento, saldo, revisão de legados e detalhes por método | Não há gateway ou processamento financeiro real, conforme o escopo atual |
| Estoque | Produtos, categorias, saldos, histórico, compensações e integração com documentos | Compras, fornecedores, reservas, depósitos e lotes não fazem parte da etapa implementada |
| Prazos e acompanhamentos | Planejamento, responsáveis, prioridades, observações e agenda | Comunicação externa e lembretes automáticos não implementados |
| Fotos e anexos | Upload, colagem, miniaturas, consulta, permissões e seleção para PDF | Persistência operacional depende do armazenamento da hospedagem |
| PDFs | Três modelos, padrão de nome, logo, pagamento, tabela unificada e fotos de OS | A data de conclusão depende da correção do fluxo de OS |
| Dashboard | Indicadores e ordens recentes | Otimização de consultas e uniformização das regras dos indicadores |
| Superadministrador | Criação de organização com administrador inicial | Não foi encontrado painel completo para listar, suspender e gerenciar organizações existentes |

## Funcionalidades realmente pendentes versus evolução futura

**Pendência explícita da interface:** numeração personalizada das ordens. A opção existe em configurações, mas permanece desabilitada com “Em breve”. Ver [configurações de OS](../src/modules/settings/components/WorkOrderSettings.tsx).

**Entrada comercial ainda limitada:** a página pública apresenta “Criar conta” desabilitado; o provisionamento atual é feito pelo superadministrador. Isso é coerente com onboarding assistido, mas ainda não oferece autoatendimento. Ver [página pública](../src/pages/HomePage.tsx) e [rota de provisionamento](../../backend/app/modules/platform/routes.py).

**Evoluções, não bugs do escopo atual:** recuperação de senha por token, envio de orçamento, aceite do cliente, notificações automáticas, planos/assinaturas, cobrança do SaaS e gestão central de organizações. Compras, fornecedores, depósitos, lotes, emissão fiscal e reservas também são expansões futuras; não devem ser tratadas como defeitos de um módulo cuja primeira etapa as excluía expressamente.

## Ordem recomendada para continuar

1. **Estabilizar os cadastros:** limites, campos obrigatórios, mensagens de validação e regra de telefone. Incluir os casos reproduzidos na suíte, inclusive contra PostgreSQL.
2. **Corrigir os dados operacionais:** OS canceladas nos indicadores, data de conclusão e filtros por fuso horário.
3. **Fechar a validação de release:** corrigir a fixture de migração, a interpolação da URL no Alembic e executar a suíte completa com PostgreSQL.
4. **Preparar a operação:** health/readiness, verificação de proteção de login, backup/restauração de banco e anexos, redução das consultas adicionais e paginação de clientes.
5. **Avançar funcionalmente:** numeração por organização; depois recuperação de senha, gestão central de organizações e comunicação/aceite de orçamentos, conforme a prioridade comercial.

O melhor próximo passo é uma rodada de estabilização com esses casos concretos. O sistema já tem amplitude funcional suficiente para que a consistência dos cadastros, indicadores e operação traga mais benefício imediato do que abrir outro módulo grande.
