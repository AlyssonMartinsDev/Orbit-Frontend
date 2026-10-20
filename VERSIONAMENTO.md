# Versionamento do Orbit

## Marco 1.0.0

A versão **1.0.0**, de 19/10/2026, encerra esta etapa funcional e estabelece a primeira referência formal conjunta do frontend e da API. Não existiam tags de versão; os números anteriores (frontend 0.0.0, configuração local da API 0.1.0 e exemplo Docker 1.0.0) não representavam lançamentos coordenados. Não serão criadas tags retroativas para eles.

O número representa o produto integrado. Os dois repositórios recebem a tag anotada `v1.0.0`, cada uma apontando para seu próprio commit de fechamento. Publicar commits/tags em `develop` registra o marco; não significa que a produção foi atualizada.

## Política

Seguimos [Versionamento Semântico](https://semver.org/lang/pt-BR/):

- **PATCH**, como 1.0.1: correções compatíveis.
- **MINOR**, como 1.1.0: funcionalidades novas compatíveis.
- **MAJOR**, como 2.0.0: quebra de compatibilidade nos contratos suportados.
- Candidatas a lançamento podem usar `1.1.0-rc.1`.

A quantidade de funcionalidades ou o início de uma nova etapa não determina uma versão maior. O contrato suportado inclui a API HTTP autenticada, suas regras documentadas e a atualização dos dados existentes pelas migrações. IDs de revisão Alembic e versões dos templates de PDF têm sequências próprias e não são versões do produto.

Mudanças que removam endpoints/campos suportados ou exijam adaptação incompatível dos consumidores precisam de planejamento explícito de migração. Campos opcionais novos e migrações que preservam os dados podem integrar versões menores. A classificação deve ser revista antes de cada lançamento, com testes de compatibilidade.

## Trabalho e publicação

1. Desenvolver em branches de trabalho a partir de `develop`, com commits Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
2. Registrar alterações na seção **Não lançado** do changelog de cada repositório.
3. No fechamento, definir a mesma versão do produto nos dois projetos, atualizar changelogs e executar as validações.
4. Criar tags anotadas `vX.Y.Z` nos commits correspondentes e enviar explicitamente a branch e a tag.
5. Tags publicadas são imutáveis: correções recebem novo commit e nova versão. Não mover tags nem usar force-push para substituir um lançamento.
6. A promoção para `main` e a implantação devem ocorrer em uma etapa própria, com as migrações e o armazenamento preparados.

A próxima etapa começa na seção Não lançado. Se acrescentar funcionalidades compatíveis, seu próximo fechamento será **1.1.0**. Correções isoladas do marco atual podem sair como **1.0.1**.

## Fonte da versão e validação

A versão fica em [package.json](package.json) e no pacote raiz de [package-lock.json](package-lock.json). Atualizar ambos sem alterar dependências incidentalmente.

```sh
npm run lint
npm test
npm run build
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:e2e
PLAYWRIGHT_BROWSER_CHANNEL=chrome npx playwright test --config playwright.settings.config.mjs
```

As duas suítes de navegador devem rodar em sequência. A suíte de integração depende do backend irmão e de suas dependências de desenvolvimento instaladas; usa banco e servidores descartáveis. Consulte [README](README.md) para detalhes.

O frontend 1.0.0 deve ser usado com o backend 1.0.0 e suas migrações aplicadas. Publique primeiro a API compatível e depois o frontend. [Notas desta versão](CHANGELOG.md).

