# Changelog

O produto segue a [política de versionamento](VERSIONAMENTO.md). Este arquivo registra lançamentos; os documentos ESTADO-* preservam notas históricas de implementação.

## Não lançado

Próxima etapa aberta, ainda sem alterações ou versão definida.

## 1.0.0 — 2026-10-19

Primeiro marco formal integrado com o backend 1.0.0. Fecha a etapa de atendimento, propostas, execução e acompanhamento de serviços.

### Funcionalidades consolidadas

- Clientes, organizações, perfil com foto, senha e gestão de usuários por permissão; painel restrito ao superadministrador para criar organizações e seus administradores.
- Orçamentos com validade, aprovação, histórico, PDF e conversão em OS sem duplicidade.
- OS com descrição livre ou itens, pagamentos totais/parciais, revisão de registros legados, prazos e acompanhamentos.
- Campos personalizados exclusivos de orçamento, exclusivos de OS ou compartilhados; obrigatoriedade independente e preenchimento na conversão.
- Endereço principal de clientes e organizações com seleção de UF/cidade, busca por CEP e edição manual.
- Fotos e anexos nas OS: seleção múltipla, câmera, colagem de capturas, fila, miniaturas, visualização e download autenticado.
- Exportação de PDF com seleção de fotos reduzidas; apresentação dos endereços e campos personalizados conforme o documento.

### Correções e consistência

- Isolamento de sessões, cancelamento de operações e descarte de respostas de contas anteriores.
- Edição da OS e de seus campos personalizados em uma única transação.
- Layouts responsivos, estados de carregamento, recuperação de falhas e validações dos formulários.
- Versão 1.0.0 alinhada no manifesto e lockfile, com changelog e política para próximos lançamentos.

### Entrega e continuidade

- Validar lint, testes unitários, build e as duas suítes de navegador antes de publicar a tag.
- A API deve ser atualizada e as migrações aplicadas antes deste frontend. Veja [implantação](VERSIONAMENTO.md).
- Este marco registra o código em `develop`; a promoção para produção é uma etapa própria.
- Evoluções possíveis: endereço histórico por documento, múltiplos endereços, categorias/legendas de fotos e armazenamento em nuvem. Não fazem parte deste fechamento.
