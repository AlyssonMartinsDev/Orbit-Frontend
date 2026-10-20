# Fotos e anexos — continuidade

Implementado nos detalhes da OS, com atalho no cabeçalho para a seção “Fotos e anexos”.

- Seleção múltipla de fotos/PDF e botão de câmera para dispositivos compatíveis.
- Campo “Colar print ou imagem”: recebe JPEG/PNG/WebP via Ctrl+V ou ⌘V, atribui nome automático e usa a mesma fila, limites e botão de envio. Texto, HTML e links não são convertidos em anexos; a área de transferência só é tratada durante o gesto de colar nesse campo.
- Fila com progresso, erros por arquivo e repetição idempotente dos pendentes. Envios concluídos saem da fila.
- Galeria responsiva, miniaturas autenticadas, foto ampliada em modal, download e confirmação de exclusão.
- “Incluir fotos no PDF” nos detalhes da OS: seleção com miniaturas, emissão com até quatro imagens por página e compressão JPEG (até 1200 px/180 KiB por foto antes da incorporação). Mantém o botão de exportação comum sem imagens. A seleção não altera os anexos e vale apenas para a emissão atual.
- Operacional envia e consulta; gestor/administrador também exclui.
- JPEG/PNG/WebP/PDF, 10 MiB por arquivo, 30 anexos e 100 MiB por OS. Fotos otimizadas para até 2560 px, sem metadados de localização. HEIC não suportado.
- Sessões isoladas; operações abortadas e URLs revogadas ao sair. A fila não continua com a conta seguinte.

Código: [componente](src/modules/work-orders/components/WorkOrderAttachments.tsx), [serviço](src/modules/work-orders/services/attachment.service.ts) e [testes de integração](tests/e2e/attachments-integration.spec.mjs).

Backend: [esquema, API, limites e implantação](../backend/docs/anexos-os.md). Migração `f05c3a81b6e4` necessária. Armazenamento privado configurado por `ATTACHMENTS_DIR`; usar volume persistente e backup dos arquivos junto com o banco. O Compose já possui volume específico.

Verificação: `npm run build`, `npm run lint`, `npm test` e `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:attachments` (Chrome instalado; pode omitir a variável se o Chromium do Playwright estiver disponível).

Concluído nesta implementação: build e lint aprovados, 22 testes do frontend e 7 testes de navegador de anexos aprovados, além de 2 de exportação padrão (incluindo colar imagem e sair durante envio). O teste de colagem usa um evento com imagem em memória, sem ler nem substituir a área de transferência do sistema. No backend, 70 testes sem PostgreSQL e 56 testes com PostgreSQL passaram. A migração foi aplicada somente no banco local, preservando integralmente as 11 OS existentes. Nenhum anexo de teste ficou no banco local; os testes usam bancos/esquemas e pastas temporárias.

PDF com fotos implementado no [seletor de exportação](src/modules/work-orders/components/WorkOrderPdfExport.tsx). Validada a seleção, ausência/exclusão de fotos, isolamento, limite de 30 imagens, paginação, redução de tamanho e preservação dos arquivos. Layout conferido com imagens horizontais, verticais, panorâmicas e nomes longos. Não há nova migração nesta etapa.

Legendas, categorias antes/depois e armazenamento em nuvem ficam como evoluções.
