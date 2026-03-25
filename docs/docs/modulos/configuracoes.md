---
title: Configurações
---

# Configurações

As configurações do projeto são divididas em três sub-rotas, todas acessíveis via layout `SettingsLayout`:

| Seção | Rota | Descrição |
|-------|------|-----------|
| [Geral](#geral) | `settings/general` | Nome, moeda, notificações e ciclo de vida do projeto |
| [Funil](#funil) | `settings/funnel` | Estágios do funil de vendas |
| [Origens](#origens) | `settings/origins` | Canais e origens de tráfego |

---

## Geral

**Rota:** `/pt/projects/:projectId/settings/general`

![Configurações Gerais](/img/screens/adsmagic/settings-geral-form.png)

### Seções da tela

#### Configurações do projeto

Componente `SettingsGeneralTab`:

![Formulário geral do projeto](/img/screens/adsmagic/settings-geral-form.png)

- Nome e descrição do projeto
- ID do projeto com ação de copiar
- Data de criação
- Modelo de atribuição das conversões
- Segmento/nicho de mercado
- **Arquivar projeto**: desativa o projeto sem excluir dados
- **Excluir projeto**: ação irreversível com confirmação explícita

![Zona de perigo e atributos do projeto](/img/screens/adsmagic/settings-geral-moeda.png)

#### Moeda

Componente `SettingsCurrencyTab`:

![Moeda e fuso horário](/img/screens/adsmagic/settings-geral-moeda.png)

- Seleção da moeda padrão do projeto (BRL, USD, EUR, etc.)
- Símbolo e formato exibido nos relatórios financeiros

#### Notificações

Componente `SettingsNotificationsTab`:

![Notificações e preferências](/img/screens/adsmagic/settings-geral-notif.png)

- Preferências de alerta por e-mail / in-app
- Configurações de resumo periódico (diário, semanal)

---

## Funil

**Rota:** `/pt/projects/:projectId/settings/funnel`

![Configurações do Funil](/img/screens/adsmagic/settings-funil-etapas.png)

O funil define os **estágios pelos quais um contato progride** até a conversão. Esses estágios aparecem no kanban de Contatos e nos gráficos de funil.

### Barra de ações do funil

![Barra de ações do funil](/img/screens/adsmagic/settings-funil-etapas.png)

- Botões **Templates**, **Exportar**, **Importar**, **Ver Kanban** e **Selecionar**
- Botão **Nova etapa** para criar um estágio via `StageFormDrawer`

### Funcionalidades

- **Lista de estágios** (`StagesList`): ordem, nome, tipo e cor de cada etapa.
- **Criar/Editar estágio** (`StageFormDrawer`): gaveta com campos de nome, tipo (`lead`, `qualified`, `customer`, etc.) e cor.
- **Reordenar**: arrastar e soltar para alterar a sequência do funil.
- **Excluir estágio**: bloqueado se houver contatos no estágio — exibe o count de dependentes.

![Lista de etapas do funil](/img/screens/adsmagic/settings-funil-templates.png)

### Templates pré-configurados

Funis prontos para uso com `Sparkles` (ícone):

| Template | Modelo |
|----------|--------|
| E-commerce | Visitante → Carrinho → Compra |
| Educação | Lead → Matrícula → Aluno |
| SaaS | Trial → Ativo → Churned |
| Serviços locais | Interesse → Orçamento → Cliente |
| Geral | Lead → Qualificado → Venda |

### Importação / Exportação

- **Importar JSON**: sobe um arquivo de estágios previamente exportado.
  - Modos: `merge` (mescla com existentes) ou `replace` (substitui tudo).
- **Exportar JSON**: baixa a configuração atual do funil.

---

## Origens

**Rota:** `/pt/projects/:projectId/settings/origins`

![Configurações de Origens anotadas](/img/screens/adsmagic/settings-origens-annotated.png)

As origens identificam de **onde vieram os contatos** (canal de aquisição). São usadas em filtros de Contatos, Vendas e Analytics.

### Funcionalidades

![Lista de origens anotada](/img/screens/adsmagic/settings-origens-annotated.png)

- **Lista de origens** (`OriginsList`): nome, cor, ícone, status ativo/inativo.
- **Criar/Editar origem** (`OriginFormModal`): campos de nome, descrição, cor, ícone e regra UTM.
- **Excluir origem**: bloqueado se houver contatos atribuídos à origem.

### Matching de UTM Source

Cada origem pode ser associada automaticamente a um valor de `utm_source`:

| Modo | Comportamento |
|------|--------------|
| `exact` | Atribui a origem somente quando `utm_source` é exatamente o valor configurado |
| `contains` | Atribui a origem quando `utm_source` contém o valor (substring) |

Isso automatiza a classificação de contatos que chegam via links rastreados com UTM.

### Importação / Exportação

- **Importar JSON**: modos `merge` ou `replace`.
- **Exportar JSON**: baixa a lista de origens com todos os metadados.

---

## Estado atual (As-Is)

- As três seções compartilham o mesmo layout lateral (`SettingsLayout`) com navegação por abas/menu.
- Alterações em Funil e Origens refletem imediatamente nos módulos de Contatos, Vendas e Analytics.
- Não há controle de acesso granular por seção de configuração — qualquer usuário autenticado no projeto pode alterar.
