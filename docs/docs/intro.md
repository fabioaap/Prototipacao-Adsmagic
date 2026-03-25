---
slug: /
sidebar_position: 1
---

# Adsmagic Docs

Este portal organiza a documentação viva do Adsmagic fora da interface do protótipo. A estrutura principal agora parte de uma Wiki organizada por seções, com destaque para a seção de Produto separada entre As-Is e To-Be.

## O que você encontra aqui

- visão geral do workspace atual
- setup local da aplicação e do portal de documentação
- wiki estruturada por seções para documentar o Adsmagic
- produto dividido entre As-Is e To-Be
- arquitetura, jornadas e workflow de prototipação

## Estrutura da wiki

A wiki do Adsmagic passou a ser organizada pelas seguintes seções:

- Produto
- Arquitetura
- Operacao

Dentro de Produto, a documentação foi separada em duas leituras complementares:

- As-Is: como o Adsmagic está documentado e prototipado agora
- To-Be: como o produto deve evoluir, usando protótipos como referência do estado desejado

## Estrutura de alto nível

Atualmente o repositório está dividido em dois apps complementares:

1. `Plataforma/` concentra a aplicação Vue usada no protótipo.
2. `docs/` concentra este portal Docusaurus de documentação.

Essa separação permite evoluir a documentação sem alterar o Vite principal nem a navegação da aplicação.

## Entradas principais do produto

As superfícies mais importantes do protótipo hoje são:

- `Início` para leitura por jornadas
- `Rotas` para mapa de estrutura e sitemap
- `Kanban` para condução operacional
- `Wiki` para alinhamento rápido dentro do protótipo

## Próximos passos sugeridos

Se você está chegando agora ao projeto, a ordem recomendada é:

1. ler o [setup local](./setup-local.md)
2. passar pela [wiki](./wiki/index.md)
3. revisar o [produto As-Is](./product/as-is.md) e o [produto To-Be](./product/to-be.md)
4. entender as [jornadas](./jornadas.md)

> A documentação em `docs/` é a fonte organizada para mudanças estruturais. A tela `/wiki` da app continua existindo como apoio visual leve do protótipo.
