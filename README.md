# Orbit — frontend

Aplicação React, TypeScript e Vite para clientes, orçamentos, ordens de serviço e configurações.

Versão **1.0.0**, primeiro marco formal do produto. Veja o [fechamento da etapa](CHANGELOG.md) e a [política de versionamento](VERSIONAMENTO.md).

## Desenvolvimento

```sh
npm ci
npm run dev
```

Configure `VITE_API_BASE_URL` no arquivo `.env.local` com a URL do backend (por exemplo, `http://127.0.0.1:8000`).

## Validação

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Se o Chrome já estiver instalado, use `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:e2e`.

Os testes de navegador iniciam um servidor isolado na porta 4175 e interceptam as chamadas de API com dados fictícios. Cobrem as rotas em larguras de 320, 375, 768 e 1440 pixels, navegação por teclado, formulários, concorrência de buscas e recuperação de falhas. Nenhum cadastro real é alterado. Os testes unitários usam os serviços e stores reais com um adaptador HTTP em memória.

## Integração

- O token de autenticação fica em `orbit_token`. Login, logout, expiração e mudanças em outras abas invalidam caches e respostas antigas.
- A edição de OS salva o serviço e os campos personalizados em uma única transação por `PUT /work_orders/{id}`. A rota de edição exclusiva dos campos continua disponível por compatibilidade.
- Campos personalizados podem ser exclusivos de orçamento, exclusivos de OS ou compartilhados, com obrigatoriedade independente. A conversão copia os compartilhados e solicita os obrigatórios restantes.
- Organização, conta e usuários usam a API real. Administradores editam a empresa e gerenciam acessos; gestores consultam a equipe; todos editam a própria conta.
- Logos PNG/JPEG/WebP de até 2 MB são validados e reprocessados no backend, reduzidos a até 512 px e persistidos no banco.
- Trocas de senha, redefinições por administrador e alterações de perfil de acesso/ativação invalidam sessões anteriores. Usuários são desativados, preservando o histórico.

## Orçamentos → ordens de serviço

O menu **Orçamentos** permite criar propostas com cliente, descrição, valor, validade e condições; pesquisar, filtrar, editar rascunhos e exportar PDF. Administradores e gestores gerenciam o fluxo; operacionais consultam.

Use **Registrar aprovação** após confirmar a aceitação do cliente e depois **Gerar ordem de serviço**. A conversão preserva o orçamento, copia cliente/descrição/condições/valor e disponibiliza links nos dois sentidos. Repetir a conversão após uma falha de rede não gera outra OS. Aprovar não registra pagamento. “Marcar como enviado” apenas atualiza a situação, sem enviar mensagens.

Antes de executar esta versão em outro ambiente, aplique `venv/bin/alembic upgrade head` no backend. A migração `c72f0d5e83b1` cria o módulo sem modificar as OS existentes. Veja [regras e implantação](../backend/docs/orcamentos.md).

```sh
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:quotes
```

## Exportação de PDF — primeira versão

Use **Exportar PDF** nos detalhes da ordem de serviço ou no menu de ações do acompanhamento. O download funciona em desktop e mobile, mostra o estado de geração e permite tentar novamente em caso de falha.

O documento A4 inclui empresa e logo, cliente, descrição, valor, recebido, saldo, situações de serviço/pagamento e campos personalizados ativos da OS. Valores usam reais e datas usam o horário de Brasília. Descrições extensas continuam em páginas numeradas. Notas internas do cliente e campos personalizados do cadastro de clientes não são exportados.

Os dois PDFs incluem os endereços cadastrados de cliente e organização. O orçamento usa a cópia salva dos seus campos personalizados; campos exclusivos do orçamento não são transferidos para a OS. Na OS, a opção **Incluir fotos no PDF** permite escolher imagens já enviadas, comprimidas e distribuídas em até quatro por página.

Clientes e organizações possuem endereço principal estruturado, seleção de UF/cidade e preenchimento por CEP, com edição manual. Veja [endereços](../backend/docs/enderecos.md) e [anexos](../backend/docs/anexos-os.md).

A geração ocorre no backend, autenticada e limitada à organização da sessão. É necessário instalar as dependências atualizadas de `requirements.txt` (ReportLab) e aplicar as migrações: o template atual consulta os recebimentos. O PDF reflete os dados atuais no momento da emissão e não é um documento fiscal nem um histórico imutável.

A estrutura separa carregamento dos dados, modelo tipado do documento e layout. Veja [a documentação de evolução do PDF](../backend/docs/pdf-export.md) para acrescentar outros modelos, políticas de visibilidade e versões persistidas.

```sh
# Downloads reais em 320 e 1440 px, com banco temporário:
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pdf
```

Os testes de recuperação de falhas e descarte de downloads de sessões anteriores também fazem parte de `npm run test:e2e`. Não execute as suítes de navegador simultaneamente, pois compartilham o cache do Vite.

## Recebimentos por ordem de serviço

Abra **Ordens de serviço → Acompanhamento → Vincular pagamento**, ou a seção **Pagamentos da OS** nos detalhes. Administradores e gestores podem vincular o pagamento total sem digitar o valor, quitar somente o saldo restante ou selecionar **Pagamento parcial** e informar o valor. Confira a data e a forma antes de registrar. A quitação automática só aparece quando o saldo é conhecido; ordens antigas em revisão exigem conferência. O perfil operacional consulta. Somente administradores cancelam lançamentos, sempre informando o motivo e mantendo autor/data no histórico.

O saldo e a situação do pagamento são automáticos. O dashboard mostra **Recebido no mês** pela data do recebimento e calcula pendências pelo saldo conhecido. O PDF inclui recebido e saldo. Reenvios após falha de rede reaproveitam a identificação do lançamento para evitar duplicidade.

Antes de executar esta versão, aplique `venv/bin/alembic upgrade head` no backend. A migração preserva as ordens antigas; aquelas com situação PAGO/PARCIAL/CANCELADO exigem revisão por administrador. Registre os valores e datas históricos conhecidos e use **Concluir revisão**; nenhum recebimento é criado automaticamente. Até a revisão, o saldo aparece como desconhecido e não integra o total de pendências confirmadas.

```sh
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:payments
```

Detalhes de regras, endpoints e testes de concorrência: [recebimentos](../backend/docs/recebimentos.md). Estado de implementação: [continuidade](ESTADO-RECEBIMENTOS.md).

## Configurações: preparação do backend

### Painel do superadministrador

**Configurações → Administração da plataforma** (`/settings/platform`) aparece somente para contas com `is_superuser=true`. O formulário cria uma organização e seu primeiro administrador em uma única transação por `POST /platform/organizations`. O superadministrador pode usar o painel mesmo sem vínculo com uma organização; sua conta e sua sessão não são transferidas para a empresa criada.

O novo usuário recebe `role=admin`, `is_superuser=false` e vínculo somente com a nova organização. O formulário permite definir nome, nome fantasia, documento, contatos e limite de usuários ativos (incluindo o administrador); endereço e logo podem ser completados depois. A senha inicial é validada, armazenada como hash e nunca devolvida na resposta. Não é enviado e-mail automaticamente.

Administradores de organizações, gestores e operacionais não veem o link, não recebem o formulário por URL direta e recebem 403 ao chamar a API. A autorização consulta o usuário no banco a cada requisição. E-mail já cadastrado ou falha na gravação desfazem toda a criação. O painel não cria nem promove superadministradores.

```sh
# Banco temporário; não altera organizações reais:
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:platform
```

Os testes cobrem criação em 320 e 1440 px, login do novo administrador, isolamento da organização, recuperação de e-mail duplicado e bloqueio dos demais perfis. No backend, os testes de plataforma também verificam revogação de permissão, tentativa de elevação de privilégios e rollback após falhas de persistência.

### Instalação

No projeto backend, instale as dependências e aplique a migração antes de iniciar a nova versão:

```sh
venv/bin/pip install -r requirements.txt
venv/bin/alembic upgrade head
venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

A migração adiciona a versão de autenticação aos usuários e amplia o armazenamento de logos. Os dados existentes são mantidos.

Para os testes de API, instale `requirements-dev.txt` no backend e execute `venv/bin/python -m unittest discover -s tests -p 'test_*.py'`.

Para testar os fluxos completos com frontend e backend reais, execute no frontend:

```sh
npm run test:settings
# Alternativa com o Chrome já instalado:
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:settings
```

Esse comando usa o backend irmão em `../backend`, inicia servidores nas portas 4176 e 8002 e cria um banco SQLite temporário. Não usa o banco configurado no `.env` nem modifica os cadastros reais. Não execute as duas suítes de navegador simultaneamente.
