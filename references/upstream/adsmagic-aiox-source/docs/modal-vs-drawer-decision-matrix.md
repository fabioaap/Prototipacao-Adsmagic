# Modal vs Drawer: Matriz de Decisão

## Objetivo

Definir um critério único de UX para decidir quando usar modal, drawer e alert dialog no AdsMagic, reduzindo inconsistência visual e comportamental entre domínios como contatos, vendas, integrações, tracking e dashboard.

## Resumo Executivo

No contexto do AdsMagic, a melhor decisão não é padronizar tudo em modal nem tudo em drawer. O padrão mais coerente é:

1. Modal para tarefas focadas, curtas e transacionais.
2. Drawer para inspeção, suporte contextual e configuração densa.
3. AlertDialog para confirmações destrutivas ou irreversíveis.

Esse critério é mais alinhado ao produto porque a aplicação é operacional, baseada em listas, tabelas, drill-downs e configurações por projeto. Em vários fluxos, manter o pano de fundo visível ajuda o usuário a preservar contexto. Em outros, o comportamento desejado é bloquear o restante e induzir conclusão.

## Matriz de Decisão

| Critério | Modal | Drawer |
|---|---|---|
| Objetivo principal | Concluir uma tarefa | Inspecionar ou configurar com contexto |
| Duração esperada da tarefa | Curta | Média ou longa |
| Relação com a tela de fundo | Secundária | Importante |
| Tipo de conteúdo | Formulário curto, confirmação, asset pontual | Detalhe lateral, lista auxiliar, configuração extensa |
| Necessidade de comparar com a lista atrás | Baixa | Alta |
| Navegação entre itens | Ruim | Boa |
| Sensação de UX | Interrupção controlada | Continuidade contextual |
| Melhor uso em mobile | Pode virar quase full-screen | Também vira quase full-screen |
| Critério de escolha em mobile | Continua sendo semântico, não visual | Continua sendo semântico, não visual |

## Regras de UX no nosso contexto

### Use modal quando

1. A tarefa tem começo, meio e fim claros.
2. O usuário deve focar em um único objetivo antes de voltar à tela.
3. O conteúdo é relativamente curto, mesmo que tenha mais de um grupo de campos.
4. O fundo não precisa servir como referência durante a interação.
5. O componente comunica criação, edição curta, seleção pontual ou visualização concentrada.

### Use drawer quando

1. O usuário saiu de uma tabela, card ou drill-down e quer ver mais sem perder o contexto.
2. O conteúdo é denso, tem múltiplas seções, listas auxiliares ou configuração avançada.
3. A tela de fundo ajuda a orientar a decisão.
4. Há chance de o usuário navegar entre vários itens em sequência.
5. O componente funciona como inspetor lateral ou painel de suporte operacional.

### Use AlertDialog quando

1. A ação é destrutiva.
2. A ação é irreversível ou difícil de desfazer.
3. A confirmação precisa ser inequívoca e curta.

## Anti-padrões

1. Não usar drawer para formulário curto só porque ele cabe lateralmente.
2. Não usar modal para detalhe longo que o usuário consulta repetidamente item a item.
3. Não usar modal genérico para confirmação destrutiva quando AlertDialog resolve melhor.
4. Não misturar semânticas. Se o componente é inspetor contextual, ele não deve se comportar como formulário bloqueante.
5. Não criar implementações customizadas novas fora de [front-end/src/components/ui/Modal.vue](front-end/src/components/ui/Modal.vue), [front-end/src/components/ui/Drawer.vue](front-end/src/components/ui/Drawer.vue) e [front-end/src/components/ui/AlertDialog.vue](front-end/src/components/ui/AlertDialog.vue) sem motivo claro.

## Critério objetivo para novos componentes

### Escolha modal se a maioria das respostas for sim

1. O usuário precisa concluir essa tarefa antes de seguir.
2. O conteúdo cabe bem em uma janela central sem depender do fundo.
3. A tarefa é criar, editar ou selecionar algo de forma direta.
4. O fluxo tem um CTA primário dominante.

### Escolha drawer se a maioria das respostas for sim

1. O usuário se beneficia de manter a lista ou página visível atrás.
2. O conteúdo funciona como inspeção, aprofundamento ou configuração lateral.
3. Há múltiplas seções, leitura longa ou suportes auxiliares.
4. O usuário pode abrir vários itens em sequência.

## Auditoria dos componentes atuais

### Manter como drawer

| Componente | Decisão | Racional |
|---|---|---|
| [front-end/src/components/contacts/ContactDetailsDrawer.vue](front-end/src/components/contacts/ContactDetailsDrawer.vue) | Manter drawer | Inspetor de contato com timeline e ações contextuais. |
| [front-end/src/components/sales/SaleDetailsDrawer.vue](front-end/src/components/sales/SaleDetailsDrawer.vue) | Manter drawer | Detalhe de venda e atribuição, com leitura lateral clara. |
| [front-end/src/components/dashboardV2/EntityListDrawer.vue](front-end/src/components/dashboardV2/EntityListDrawer.vue) | Manter drawer | Drill-down contextual vindo do dashboard. |
| [front-end/src/components/dashboardV2/NorthStarConfigDrawer.vue](front-end/src/components/dashboardV2/NorthStarConfigDrawer.vue) | Manter drawer | Configuração densa, melhor com dashboard visível ao fundo. |
| [front-end/src/components/settings/StageFormDrawer.vue](front-end/src/components/settings/StageFormDrawer.vue) | Manter drawer | Formulário avançado com regras, integrações e múltiplas seções. |
| [front-end/src/components/tracking/LinkStatsDrawer.vue](front-end/src/components/tracking/LinkStatsDrawer.vue) | Manter drawer | Estatísticas e leitura comparativa a partir da lista de links. |
| [front-end/src/components/integrations/GoogleConversionActionsDrawer.vue](front-end/src/components/integrations/GoogleConversionActionsDrawer.vue) | Manter drawer | Seleção extensa e operacional de itens, com contexto da integração. |
| [front-end/src/components/campaigns/AdsIndicatorsConfigDrawer.vue](front-end/src/components/campaigns/AdsIndicatorsConfigDrawer.vue) | Manter drawer | Painel de configuração lateral de indicadores. |
| [front-end/src/components/contacts/StagesManagementDrawer.vue](front-end/src/components/contacts/StagesManagementDrawer.vue) | Manter drawer | Gestão contextual de etapas dentro do domínio de contatos. |

### Manter como modal

| Componente | Decisão | Racional |
|---|---|---|
| [front-end/src/components/contacts/ContactFormModal.vue](front-end/src/components/contacts/ContactFormModal.vue) | Manter modal | CRUD direto, foco único e encerramento claro. |
| [front-end/src/components/sales/SaleFormModal.vue](front-end/src/components/sales/SaleFormModal.vue) | Manter modal | Registro de venda é tarefa transacional curta. |
| [front-end/src/components/settings/OriginFormModal.vue](front-end/src/components/settings/OriginFormModal.vue) | Manter modal | Configuração curta e fechada. |
| [front-end/src/components/messages/MessageFormModal.vue](front-end/src/components/messages/MessageFormModal.vue) | Manter modal | Criação e edição focadas, sem depender do fundo. |
| [front-end/src/components/companies/CompanyFormModal.vue](front-end/src/components/companies/CompanyFormModal.vue) | Manter modal | Formulário estruturado, mas ainda de natureza transacional. |
| [front-end/src/components/projects/CreateProjectModal.vue](front-end/src/components/projects/CreateProjectModal.vue) | Manter modal | Fluxo curto, único CTA e pouca complexidade. |
| [front-end/src/components/tracking/LinkFormModal.vue](front-end/src/components/tracking/LinkFormModal.vue) | Manter modal | Criação pontual de link com foco isolado. |
| [front-end/src/components/tracking/QRCodeModal.vue](front-end/src/components/tracking/QRCodeModal.vue) | Manter modal | Visualização concentrada de um asset único com ação de download. |
| [front-end/src/components/integrations/GoogleAccountModal.vue](front-end/src/components/integrations/GoogleAccountModal.vue) | Manter modal | Seleção/conexão focada e autocontida. |
| [front-end/src/components/integrations/MetaAccountPixelModal.vue](front-end/src/components/integrations/MetaAccountPixelModal.vue) | Manter modal | Fluxo curto de associação de conta e pixel. |
| [front-end/src/components/integrations/WhatsAppQRModal.vue](front-end/src/components/integrations/WhatsAppQRModal.vue) | Manter modal | Atenção total em um fluxo bloqueante de conexão. |
| [front-end/src/components/contacts/ContactImportModal.vue](front-end/src/components/contacts/ContactImportModal.vue) | Manter modal | Fluxo multi-step, mas autocontido e orientado à conclusão. |

### Candidatos a revisão

| Componente | Recomendação | Racional |
|---|---|---|
| [front-end/src/components/tracking/ABTestModal.vue](front-end/src/components/tracking/ABTestModal.vue) | Manter modal por enquanto | O fluxo é de criação/edição focada, mas já está ficando mais denso. Se ganhar analytics, pré-visualização ou assistências laterais, passa a ser bom candidato a drawer. |

### Migrados seguindo esta matriz

| Componente | Decisão | Racional |
|---|---|---|
| [front-end/src/components/events/EventDetailsDrawer.vue](front-end/src/components/events/EventDetailsDrawer.vue) | Migrado para drawer | Era um detalhe longo de evento com payload, response, erro e retry, com forte caráter de inspeção contextual. |

## Decisão recomendada para o time

1. Preservar a estratégia híbrida.
2. Formalizar modal para CRUD curto e tarefas focadas.
3. Formalizar drawer para inspeção, drill-down e configuração densa.
4. Formalizar AlertDialog para confirmação destrutiva.
5. Em novas implementações, usar os wrappers compartilhados em vez de soluções customizadas ad hoc.

## Próximo passo recomendado

1. Padronizar os componentes legados/customizados para [front-end/src/components/ui/Modal.vue](front-end/src/components/ui/Modal.vue) e [front-end/src/components/ui/Drawer.vue](front-end/src/components/ui/Drawer.vue).
2. Revisar o próximo candidato de densidade crescente, [front-end/src/components/tracking/ABTestModal.vue](front-end/src/components/tracking/ABTestModal.vue), se ele ganhar mais conteúdo analítico ou assistências laterais.
3. Adicionar este critério ao guia interno de frontend quando consolidarmos a próxima rodada de refactors.