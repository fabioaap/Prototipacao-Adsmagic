# UI PR Checklist

Use este checklist antes de abrir PR de front-end.

## Design system

- [ ] Usei componentes oficiais de `src/components/ui/README.md`.
- [ ] Não adicionei novos imports de `@/components/ui/aesthetic/*`.
- [ ] Não adicionei novos imports de `@/components/ui/radix/*` em código de produto.
- [ ] Não usei `ModalV2`.

## Consistência visual

- [ ] Busca de listas/tabelas usa `SearchInput`.
- [ ] Ações principais/secundárias/destrutivas usam `Button` com variantes oficiais.
- [ ] Cards/KPIs usam `Card`/`StatGrid`/`MetricCard` oficiais (sem estilos paralelos desnecessários).

## Modal e acessibilidade

- [ ] Modal não tem duplicidade de botão de fechar.
- [ ] Verifiquei fechamento por `Esc` e clique fora (quando aplicável).
- [ ] Labels e `aria-label` de controles críticos estão definidos.

## Validação

- [ ] `pnpm -s vue-tsc -b` executado.
- [ ] Smoke visual manual feito nas telas alteradas.
