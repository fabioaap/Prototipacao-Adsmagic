# Plano de Teste de Usabilidade - Página de Vendas

## Objetivo
Validar a usabilidade e experiência do usuário na página de vendas, verificando se as funcionalidades estão intuitivas, acessíveis e seguem as diretrizes do Design System.

## Escopo
- **Página**: `/pt/projects/mock-project-001/sales` 
- **Componentes**: Design System aplicado (Cards, MetricCards, Buttons, etc.)
- **Responsividade**: Desktop (1280x720) e Mobile (375x667)

## Cenários de Teste

### 📊 J1. Visualização de Métricas
**Objetivo**: Verificar se as métricas são apresentadas de forma clara e compreensível

**Passos**:
1. Acesse a página de vendas
2. Observe a seção "Métricas de Vendas"
3. Verifique se todos os cards de métricas são visíveis
4. Confirme se os valores estão formatados corretamente

**Critérios de Sucesso**:
- ✅ 4 cards de métricas visíveis (Receita Total, Vendas Realizadas, Ticket Médio, Taxa de Conversão)
- ✅ Valores monetários formatados em BRL (R$ 0,00)
- ✅ Indicadores de mudança (↑ ↓) com percentuais
- ✅ Layout responsivo em mobile e desktop

### 🎯 J2. Funil de Vendas Interativo
**Objetivo**: Validar a visualização e interação do funil de vendas

**Passos**:
1. Localize a seção "Funil de Vendas"
2. Observe as etapas do funil
3. Verifique os percentuais de conversão
4. Teste clique nas etapas (se aplicável)

**Critérios de Sucesso**:
- ✅ Visualização clara das etapas do funil
- ✅ Contadores de contatos por etapa
- ✅ Percentuais de conversão calculados
- ✅ Design responsivo e legibilidade

### 📈 J3. Previsão de Vendas
**Objetivo**: Verificar se as projeções são apresentadas de forma clara

**Passos**:
1. Examine a seção "Previsão de Vendas"
2. Verifique os cards de previsão (30 dias, Pipeline Total, Confiança)
3. Teste os botões de período (30, 60, 90 dias)
4. Observe a área "Pipeline por Estágio"

**Critérios de Sucesso**:
- ✅ 3 cards de previsão claramente visíveis
- ✅ Botões de período responsivos
- ✅ Estados vazios tratados adequadamente
- ✅ Layout consistente com Design System

### ⏰ J4. Follow-up Pendente
**Objetivo**: Validar a funcionalidade de acompanhamento de vendas

**Passos**:
1. Localize a seção "Follow-up Pendente"
2. Observe a lista de contatos urgentes
3. Verifique as informações de cada contato
4. Teste os botões de ação (se disponíveis)

**Critérios de Sucesso**:
- ✅ Lista de contatos urgentes visível
- ✅ Informações completas (nome, telefone, estágio, tempo)
- ✅ Badges de urgência claramente identificáveis
- ✅ Ações disponíveis e intuitivas

### 📋 J5. Listagem de Vendas
**Objetivo**: Verificar a organização e apresentação das vendas

**Passos**:
1. Navegue para as tabs "Realizadas" e "Perdidas"
2. Observe a estrutura da tabela
3. Verifique o campo de busca
4. Teste o botão de exportar

**Critérios de Sucesso**:
- ✅ Tabs funcionais entre realizadas e perdidas
- ✅ Tabela organizada com headers claros
- ✅ Campo de busca funcional
- ✅ Botão exportar visível e acessível

### 🎨 J6. Consistência do Design System
**Objetivo**: Validar aplicação consistente dos componentes do DS

**Passos**:
1. Observe todas as seções da página
2. Verifique padronização de cards
3. Confirme espaçamentos e gutters
4. Valide cores e tipografia

**Critérios de Sucesso**:
- ✅ Cards padronizados com bordas e sombras consistentes
- ✅ Espaçamentos uniformes (24px desktop, 16px mobile)
- ✅ Tipografia seguindo hierarquia definida
- ✅ Cores dentro da paleta do DS

### 📱 J7. Responsividade
**Objetivo**: Garantir experiência otimizada em dispositivos móveis

**Passos**:
1. Acesse em viewport mobile (375x667)
2. Verifique layout de cards empilhados
3. Teste navegação e scroll
4. Confirme legibilidade em tela menor

**Critérios de Sucesso**:
- ✅ Cards adaptam para layout vertical
- ✅ Textos mantêm legibilidade
- ✅ Botões têm área de toque adequada (min 44px)
- ✅ Menu lateral funciona corretamente

### 🔄 J8. Estados e Feedback
**Objetivo**: Verificar tratamento de estados vazios e loading

**Passos**:
1. Observe áreas sem dados (vendas, pipeline)
2. Verifique mensagens de estado vazio
3. Simule estado de loading (se possível)
4. Teste feedback de ações

**Critérios de Sucesso**:
- ✅ Estados vazios tratados com mensagens claras
- ✅ Ícones e ilustrações apropriadas
- ✅ Chamadas para ação quando aplicável
- ✅ Loading states onde necessário

## Métricas de Sucesso
- **Taxa de Conclusão**: 100% dos cenários executados com sucesso
- **Tempo Médio**: < 3 segundos para localizar qualquer seção
- **Erros de Usabilidade**: 0 problemas críticos de navegação
- **Satisfação Visual**: Layout limpo e profissional

## Ambiente de Teste
- **URL Base**: http://localhost:5174
- **Navegador**: Chrome/Edge latest
- **Projeto**: mock-project-001
- **Dados**: Mock data com contatos e vendas simuladas

## Entregáveis
- [x] Screenshots desktop e mobile
- [x] Relatório de conformidade com DS
- [ ] Lista de melhorias identificadas
- [ ] Aprovação para produção

---

**Data**: 27 de dezembro de 2025  
**Responsável**: Sistema de Design & Usabilidade  
**Status**: ✅ Pronto para execução