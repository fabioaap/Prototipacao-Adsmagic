# Plano de Teste de Usabilidade - Página de Contatos

## Visão Geral

Este documento detalha o plano abrangente de teste de usabilidade para a página de contatos do Adsmagic, cobrindo todas as jornadas possíveis de usuário e validando a experiência através de testes automatizados com Playwright.

## Objetivo

Validar que todos os fluxos de usuário na página de contatos são:
- **Intuitivos**: Usuário consegue descobrir e usar funcionalidades sem treinamento
- **Eficientes**: Tarefas são completadas no menor tempo possível
- **Acessíveis**: Interface funciona para diferentes perfis de usuário e dispositivos
- **Robustos**: Sistema lida bem com erros e cenários extremos

## Metodologia

### Tipos de Teste
1. **Testes de Jornada**: Simulam fluxos completos de usuário real
2. **Testes de Interação**: Validam componentes individuais e micro-interações
3. **Testes de Estado**: Verificam diferentes estados da interface (loading, erro, vazio)
4. **Testes de Acessibilidade**: Garantem compatibilidade com tecnologias assistivas
5. **Testes de Responsividade**: Validam experiência em diferentes dispositivos

### Ferramentas
- **Playwright**: Automação de testes E2E
- **Visual Regression**: Screenshots para comparação visual
- **Performance Monitoring**: Medição de tempos de carregamento
- **Accessibility Testing**: Validação de ARIA, contraste e navegação por teclado

## Mapeamento de Jornadas de Usuário

### J1: Descoberta e Orientação
**Perfil**: Usuário novo ou ocasional
**Objetivo**: Compreender o que é possível fazer na página

#### Cenários
1. **J1.1 - Primeira Impressão**
   - Usuário acessa a página pela primeira vez
   - Deve entender imediatamente que está na seção de contatos
   - Deve ver métricas resumo e entender o status atual

2. **J1.2 - Descoberta de Funcionalidades**
   - Usuário explora os controles disponíveis
   - Deve identificar toggles de visualização (Lista vs Kanban)
   - Deve encontrar botões de ação principais (Novo, Importar, Exportar)

3. **J1.3 - Compreensão de Métricas**
   - Usuário interpreta os KPIs apresentados
   - Deve entender métricas como Total, Ativos, Convertidos, Taxa de Conversão
   - Deve perceber tendências (setas para cima/baixo)

### J2: Busca e Descoberta de Contatos
**Perfil**: Usuário buscando contatos específicos
**Objetivo**: Encontrar rapidamente contatos usando diferentes métodos

#### Cenários
1. **J2.1 - Busca por Texto Livre**
   - Usuário digita nome, email ou telefone na busca
   - Sistema deve filtrar resultados em tempo real
   - Deve funcionar com busca parcial e ser tolerante a erros

2. **J2.2 - Filtros Avançados**
   - Usuário usa filtros por etapa, origem, localização, data
   - Deve poder combinar múltiplos filtros
   - Deve poder limpar filtros facilmente

3. **J2.3 - Navegação com Filtros Ativos**
   - Usuário alterna entre visualizações mantendo filtros
   - Filtros devem persistir entre Lista e Kanban
   - Deve ter feedback claro de quais filtros estão ativos

### J3: Gestão de Contatos Individuais
**Perfil**: Usuário gerenciando leads ativamente
**Objetivo**: Criar, editar, visualizar e organizar contatos

#### Cenários
1. **J3.1 - Criação de Novo Contato**
   - Usuário clica em "Novo Contato"
   - Preenche formulário com dados obrigatórios e opcionais
   - Recebe feedback claro sobre sucesso/erro

2. **J3.2 - Visualização de Detalhes**
   - Usuário clica em contato existente
   - Vê drawer/modal com informações completas
   - Pode navegar pelo histórico de atividades

3. **J3.3 - Edição de Contato**
   - Usuário modifica dados de contato existente
   - Pode atualizar informações, mudar etapa, adicionar notas
   - Mudanças são refletidas imediatamente na interface

### J4: Gestão de Funil e Etapas
**Perfil**: Gestor ou vendedor organizando processo de vendas
**Objetivo**: Configurar e gerenciar o funil de vendas

#### Cenários
1. **J4.1 - Visualização do Funil**
   - Usuário usa modo Kanban para ver funil
   - Compreende distribuição de contatos por etapa
   - Identifica gargalos e oportunidades

2. **J4.2 - Configuração de Etapas**
   - Usuário acessa gerenciamento de etapas
   - Pode adicionar, remover, reordenar etapas
   - Define tipos de etapa (Normal, Venda, Perdido)

3. **J4.3 - Movimentação no Funil**
   - Usuário arrasta contatos entre etapas
   - Drag-and-drop funciona de forma fluida
   - Mudanças são persistidas e refletidas nas métricas

### J5: Operações em Lote
**Perfil**: Usuário com muitos contatos para gerenciar
**Objetivo**: Executar ações em múltiplos contatos simultaneamente

#### Cenários
1. **J5.1 - Seleção Múltipla**
   - Usuário seleciona múltiplos contatos
   - Interface mostra claramente quantos/quais estão selecionados
   - Ações em lote ficam disponíveis

2. **J5.2 - Exportação em Lote**
   - Usuário exporta contatos filtrados
   - Pode exportar todos ou apenas selecionados
   - Recebe arquivo CSV com dados formatados

3. **J5.3 - Importação via CSV**
   - Usuário faz upload de arquivo CSV
   - Sistema valida dados e mostra preview
   - Importação é executada com feedback de progresso

### J6: Experiência Responsiva
**Perfil**: Usuário em diferentes dispositivos
**Objetivo**: Manter usabilidade em tablet e mobile

#### Cenários
1. **J6.1 - Uso em Tablet**
   - Interface se adapta para 768px
   - Touch interactions funcionam bem
   - Elementos mantêm tamanho adequado

2. **J6.2 - Uso em Mobile**
   - Interface se adapta para 375px
   - Navegação é touch-friendly
   - Funcionalidades críticas permanecem acessíveis

### J7: Estados de Erro e Edge Cases
**Perfil**: Situações não-ideais de uso
**Objetivo**: Manter boa experiência mesmo em cenários problemáticos

#### Cenários
1. **J7.1 - Lista Vazia**
   - Sistema mostra estado vazio apropriado
   - Oferece ações construtivas (criar primeiro contato)
   - Mensagem é clara e encorajadora

2. **J7.2 - Erros de Conectividade**
   - Sistema detecta problemas de rede
   - Mostra mensagens de erro claras
   - Oferece opções de retry

### J8: Performance e Feedback
**Perfil**: Usuário focado na eficiência
**Objetivo**: Interface responsiva com feedback claro

#### Cenários
1. **J8.1 - Estados de Loading**
   - Loading states são mostrados para ações demoradas
   - Usuário sempre sabe que sistema está processando
   - Transições são suaves

2. **J8.2 - Feedback de Ações**
   - Ações do usuário têm feedback imediato
   - Toast notifications para sucesso/erro
   - Estados visuais indicam resultado das ações

## Critérios de Sucesso

### Métricas de Usabilidade
- **Taxa de Completude**: % de jornadas completadas com sucesso
- **Tempo para Completar**: Tempo médio para cada tarefa principal
- **Taxa de Erro**: % de jornadas que resultaram em erro
- **Satisfação**: Feedback qualitativo sobre experiência

### Benchmarks Específicos
- **Busca de Contato**: < 5 segundos para encontrar contato específico
- **Criação de Contato**: < 30 segundos para criar novo contato
- **Movimentação no Funil**: < 2 segundos para mover contato
- **Exportação**: < 10 segundos para iniciar download

### Acessibilidade
- **Navegação por Teclado**: Todos os elementos funcionais acessíveis via Tab
- **Screen Reader**: Elementos têm labels e ARIA adequados
- **Contraste**: Mínimo 4.5:1 para textos principais
- **Responsive**: Funcional em viewports de 320px a 1920px

## Execução dos Testes

### Configuração
```bash
# Instalar dependências
cd front-end
pnpm install

# Executar servidor local
pnpm dev

# Executar testes de usabilidade
pnpm test:e2e contacts-usability-test-plan.spec.ts
```

### Relatórios
Os testes geram:
- **Screenshots**: Evidências visuais de cada jornada
- **HTML Report**: Relatório detalhado com métricas
- **Video**: Gravações de falhas para debug
- **Trace**: Logs detalhados de interação

### Monitoramento Contínuo
- Testes executados em CI/CD
- Alertas para regressões de usabilidade
- Dashboard de métricas de UX
- Reviews regulares com equipe de produto

## Próximos Passos

1. **Implementar Testes**: Executar e refinar os cenários
2. **Baseline**: Estabelecer métricas iniciais de performance
3. **Iteração**: Melhorar interface baseado nos resultados
4. **Expansão**: Aplicar metodologia para outras páginas
5. **Automação**: Integrar testes no pipeline de desenvolvimento

---

**Versão**: 1.0  
**Data**: 26 de dezembro de 2025  
**Responsável**: Equipe de Qualidade e UX