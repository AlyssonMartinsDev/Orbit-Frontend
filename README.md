# Orbit — frontend

Aplicação React, TypeScript e Vite para clientes, ordens de serviço e configurações.

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
- A edição de OS salva o serviço e os campos personalizados em duas chamadas. Se a segunda falhar, a tela informa o salvamento parcial e permite tentar novamente.
- Os campos personalizados usam `PUT /custom-fields/{id}/custom-fields`. O backend precisa confirmar a transação desse endpoint; a correção correspondente e três testes de persistência estão no projeto backend.
- As telas de organização, conta e usuários ainda são prévias sem persistência; seus controles estão desabilitados e identificados na interface.
