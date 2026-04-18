# Execução dos Testes de Usabilidade - Página de Contatos

## Pré-requisitos

1. **Node.js** (v18+) e **pnpm** instalados
2. **Servidor frontend** rodando na porta 5173
3. **Dependências instaladas**:
   ```bash
   cd front-end
   pnpm install
   pnpm playwright install
   ```

## Execução Rápida

### 1. Iniciar Servidor
```bash
# Terminal 1 - Manter rodando durante os testes
cd front-end
pnpm dev
```

### 2. Executar Testes de Usabilidade
```bash
# Terminal 2 - Executar testes
cd front-end
pnpm test:e2e --config=tests/e2e/playwright.usability.config.ts

# Ou usar o script direto:
npx playwright test --config=tests/e2e/playwright.usability.config.ts
```

## Modos de Execução

### Execução Padrão (Headless)
```bash
npx playwright test --config=tests/e2e/playwright.usability.config.ts
```
- Executa todos os testes em background
- Gera screenshots e vídeos automaticamente
- Mais rápido para CI/CD

### Execução com Interface (UI Mode)
```bash
npx playwright test --config=tests/e2e/playwright.usability.config.ts --ui
```
- Interface visual para acompanhar testes
- Permite executar testes individuais
- Ideal para desenvolvimento e debug

### Execução com Navegador Visível (Headed)
```bash
npx playwright test --config=tests/e2e/playwright.usability.config.ts --headed
```
- Mostra navegador durante execução
- Bom para observar comportamento real
- Mais lento, mas didático

### Debug Mode
```bash
npx playwright test --config=tests/e2e/playwright.usability.config.ts --debug
```
- Pausa execução para inspeção
- Permite stepping através do código
- Ideal para investigar problemas específicos

## Filtrando Testes

### Executar Jornada Específica
```bash
# Apenas jornadas de descoberta
npx playwright test --config=tests/e2e/playwright.usability.config.ts --grep "J1:"

# Apenas testes de busca
npx playwright test --config=tests/e2e/playwright.usability.config.ts --grep "J2:"

# Apenas gestão de contatos
npx playwright test --config=tests/e2e/playwright.usability.config.ts --grep "J3:"
```

### Executar Projeto Específico
```bash
# Apenas desktop
npx playwright test --config=tests/e2e/playwright.usability.config.ts --project="desktop-chrome"

# Apenas mobile
npx playwright test --config=tests/e2e/playwright.usability.config.ts --project="mobile-iphone"

# Apenas acessibilidade
npx playwright test --config=tests/e2e/playwright.usability.config.ts --project="accessibility-test"
```

## Relatórios e Resultados

### Visualizar Relatório HTML
```bash
npx playwright show-report usability-report
```
- Abre relatório interativo no navegador
- Mostra detalhes de cada teste
- Inclui screenshots e vídeos

### Visualizar Traces
```bash
npx playwright show-trace usability-test-results/traces/
```
- Análise detalhada de interações
- Timeline de eventos
- Network requests e console logs

### Estrutura de Arquivos Gerados
```
usability-test-results/
├── config.json              # Configuração da execução
├── summary.json             # Resumo e recomendações
└── traces/                  # Traces detalhados de cada teste

usability-report/            # Relatório HTML interativo
├── index.html
├── data/
└── assets/

Screenshots automáticos em:
tests-results/
├── test-name-project-screenshot.png
├── test-name-project-video.webm
└── test-name-project-trace.zip
```

## Análise de Resultados

### Métricas de Sucesso
- **Taxa de Aprovação**: % de jornadas completadas
- **Tempo de Execução**: Performance de cada fluxo
- **Screenshots**: Evidências visuais de cada etapa
- **Recomendações**: Sugestões de melhoria automáticas

### Interpretando Falhas

#### Timeouts
```
Error: Timeout 30000ms exceeded.
```
**Causa**: Elemento não apareceu ou ação demorou muito
**Solução**: Verificar performance ou seletores

#### Elementos Não Encontrados
```
Error: Locator not found
```
**Causa**: Interface mudou ou elemento não existe
**Solução**: Atualizar seletores ou aguardar carregamento

#### Asserções Falharam
```
Error: expect() failed
```
**Causa**: Comportamento inesperado da interface
**Solução**: Revisar lógica do teste ou comportamento real

### Dashboard de Métricas
O arquivo `summary.json` contém:
```json
{
  "executionSummary": {
    "startTime": "2025-12-26T...",
    "endTime": "2025-12-26T...",
    "environment": "development",
    "baseURL": "http://localhost:5173"
  },
  "testResults": {
    "totalTests": 25,
    "passedTests": 23,
    "failedTests": 2
  },
  "recommendations": [
    "Otimizar performance - muitos timeouts detectados",
    "Revisar seletores - elementos não encontrados"
  ]
}
```

## Integração com CI/CD

### GitHub Actions
```yaml
name: Testes de Usabilidade

on:
  push:
    paths: ['front-end/src/**', 'front-end/tests/**']

jobs:
  usability-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd front-end
          pnpm install
          pnpm playwright install
      - name: Start server
        run: cd front-end && pnpm dev &
      - name: Wait for server
        run: npx wait-on http://localhost:5173
      - name: Run usability tests
        run: cd front-end && npx playwright test --config=tests/e2e/playwright.usability.config.ts
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: usability-test-results
          path: |
            front-end/usability-test-results/
            front-end/usability-report/
```

## Troubleshooting

### Servidor não está rodando
```bash
# Verificar se porta 5173 está livre
netstat -an | grep :5173

# Matar processos se necessário
pkill -f "vite"
```

### Dependências em falta
```bash
cd front-end
pnpm install
pnpm playwright install --with-deps
```

### Problemas de permissão
```bash
# Linux/Mac
chmod +x tests/e2e/*.sh

# Windows
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Testes muito lentos
```bash
# Executar em paralelo (cuidado com interferências)
npx playwright test --config=tests/e2e/playwright.usability.config.ts --workers=2

# Pular screenshots em modo development
PWDEBUG=0 npx playwright test --config=tests/e2e/playwright.usability.config.ts
```

## Próximos Passos

1. **Executar baseline**: Rodar todos os testes para estabelecer métricas iniciais
2. **Analisar falhas**: Investigar problemas encontrados
3. **Otimizar interface**: Implementar melhorias baseadas nos resultados
4. **Monitoramento contínuo**: Configurar execução automática em CI/CD
5. **Expansão**: Aplicar metodologia para outras páginas

---

**Suporte**: Equipe de Qualidade  
**Documentação completa**: `PLANO_TESTE_USABILIDADE_CONTATOS.md`