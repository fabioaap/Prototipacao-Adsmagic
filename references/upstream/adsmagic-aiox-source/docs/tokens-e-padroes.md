# Tokens e Padrões – Mapeamento Protótipo → Projeto

Este documento cataloga tokens de design e padrões estruturais observados no protótipo e seu mapeamento no projeto Vue/Tailwind.

Fonte: `Adsmagic-prot-tipo` (protótipo HTML) – https://github.com/fabioaap/Adsmagic-prot-tipo

## 1) Tokens de Cores

| Protótipo | Projeto (Tailwind/CSS vars) | Observações |
|---|---|---|
| Primária (brand) | `--primary` (semântico) ou `--brand` + `theme.colors.brand` | Usar HSL em CSS vars |
| Sucesso | `--success` + `theme.colors.success` | Estados de feedback |
| Aviso | `--warning` + `theme.colors.warning` | Estados de aviso |
| Informação | `--info` + `theme.colors.info` | Estados informativos |
| Perigo/Erro | `--destructive` + `theme.colors.destructive` | Já existe no projeto |

Sugestão de escala (exemplo): 50..900 para `brand` quando necessário.

## 2) Tipografia

| Protótipo | Projeto |
|---|---|
| Fonte base | `theme.fontFamily.sans` (ex.: Inter/system-ui) |
| Fonte display (títulos) | `theme.fontFamily.display` (ex.: Poppins) |

## 3) Sombras e Radius

| Protótipo | Projeto |
|---|---|
| `.card-shadow` | `theme.boxShadow.card` e utilitário `.shadow-card` |
| Radius padrão | `--radius` + `theme.borderRadius` (lg, md, sm) |

## 4) Utilitários Estruturais

| Protótipo | Projeto |
|---|---|
| `.badge-soft` | Componente `Badge.vue` (variant="soft") + utilitário `@layer utilities` |
| `.table-shell` | `Table.vue` com slots + utilitários de densidade/scroll |
| Sidebar colapsável | `AppSidebar.vue` + `useSidebar()` (localStorage, active) |

## 5) Padrões de Layout

- Dashboard: grid de cards (KPIs), sombras suaves, espaçamento consistente
- Contatos: tabela com filtros, header sticky, estados (loading/empty)
- Navegação: sidebar com estado colapsado, item ativo, tooltips quando colapsado

## 6) Regras de Estados e Acessibilidade

- Focus/hover/active/disabled padronizados via tokens
- Contraste mínimo WCAG AA para texto relevante
- Navegação por teclado na sidebar e componentes interativos

## 7) Tabela Protótipo → Projeto (exemplos)

| Protótipo | Projeto |
|---|---|
| `.badge-soft.badge-success` | `<Badge variant="soft" color="success" />` |
| `.card-shadow` | `<Card variant="elevated" />` + `.shadow-card` |
| `.table-shell` | `<Table density="comfortable" stickyHeader />` |

Atualizar este documento à medida que tokens/variantes forem consolidados no Tailwind.


