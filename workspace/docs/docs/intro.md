---
sidebar_position: 1
---

# Adsmagic Docs

Este portal organiza a documentacao viva do Adsmagic ao lado do Adsmagic Workspace. A navegacao principal da wiki agora segue a taxonomia editorial inspirada no GitHub Docs, adaptada ao nosso contexto de produto, operacao, marketing e prototipacao assistida por IA.

## O que você encontra aqui

- visão geral do workspace atual
- setup local da aplicação e do portal de documentação
- wiki estruturada por taxonomias editoriais inspiradas no GitHub Docs
- produto dividido entre As-Is e To-Be
- arquitetura, jornadas, stories e workflow dos prototipos hospedados

## Estrutura da wiki

A wiki do Adsmagic passou a ser organizada pelas seguintes taxonomias de navegacao:

- Introdução
- Codificação colaborativa
- GitHub Copilot
- CI/CD e DevOps
- Segurança e qualidade
- Aplicativos cliente
- Gerenciamento de projetos
- Empresas e equipes
- Desenvolvedores
- Community
- Mais documentos

Esses grupos nao sao uma copia literal do conteudo do GitHub Docs. Eles funcionam como uma grade editorial para organizar o nosso material por intencao de leitura e tipo de decisao.

Dentro de Codificação colaborativa, a documentação do produto continua separada em duas leituras complementares:

- As-Is: como o Adsmagic existe hoje em producao
- To-Be: como o produto deve evoluir, usando prototipos hospedados como referencia do estado desejado

## Estrutura de alto nível

Atualmente o repositório está dividido em dois apps complementares:

1. `Plataforma/` concentra a aplicacao Vue do Adsmagic Workspace.
2. `docs/` concentra este portal Docusaurus de documentação.

Essa separação permite evoluir a documentação sem alterar o Vite principal nem a navegação da aplicação.

## Entradas principais do produto

As superficies mais importantes do workspace hoje sao:

- `Início` para leitura por jornadas
- `Rotas` para mapa de estrutura e sitemap
- `Kanban` para condução operacional
- `Wiki` no Docusaurus para documentação viva do produto

## Próximos passos sugeridos

Se você está chegando agora ao projeto, a ordem recomendada é:

1. ler o [setup local](./setup-local.md)
2. passar pela [wiki](./wiki/index.md)
3. revisar o [produto As-Is](./product/as-is.md) e o [produto To-Be](./product/to-be.md)
4. entender as [jornadas](./jornadas.md)

> A documentação em `docs/` é a fonte organizada para mudanças estruturais. A rota `/wiki` da app apenas redireciona para essa wiki no Docusaurus.
