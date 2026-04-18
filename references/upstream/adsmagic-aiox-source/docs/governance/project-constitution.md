# AdsMagic First AI Project Constitution

## Finalidade

Esta constitution define os princípios inegociáveis de engenharia, segurança, governança e entrega do produto AdsMagic First AI.

O AIOX é apenas o framework de apoio usado pelo time para organizar agentes, workflows e automações. Ele não define o produto. O que este documento governa é o AdsMagic: sua arquitetura, seus limites de segurança, seus contratos, seus fluxos críticos e seu padrão de entrega.

## Escopo

Esta constitution se aplica a todo o repositório do AdsMagic, incluindo frontend, backend, integrações, infraestrutura de desenvolvimento, automações e documentação operacional.

## Níveis de Severidade

- Inegociável: bloqueia implementação, merge ou rollout.
- Obrigatória: exige correção antes de concluir a entrega.
- Recomendada: admite exceção consciente e justificada.

## Política Executiva

### Artigo I. Story Antes do Código

Severidade: Inegociável

Nenhuma mudança funcional relevante deve ser implementada sem story, requisito validado ou artefato equivalente que delimite objetivo, escopo e critério de aceite.

Justificativa: o AdsMagic opera com múltiplas áreas críticas de negócio e precisa preservar rastreabilidade, previsibilidade e controle de escopo.

### Artigo II. Sem Invenção de Requisitos

Severidade: Inegociável

Nenhum comportamento, contrato, fluxo ou regra de negócio pode ser inventado fora da story, requisito, arquitetura aceita ou evidência técnica explícita.

Justificativa: o AdsMagic depende de integrações, analytics, autenticação e multi-tenant; mudanças inventadas nessas áreas elevam risco técnico e de negócio.

### Artigo III. Isolamento Multi-Tenant é Regra de Plataforma

Severidade: Inegociável

Toda operação deve respeitar isolamento por company e project, com contexto explícito e enforcement consistente em frontend, backend e banco.

Justificativa: erro de isolamento no AdsMagic representa risco direto de vazamento entre clientes e projetos.

### Artigo IV. RLS é Barreira Final de Segurança

Severidade: Inegociável

Toda tabela multi-tenant e toda operação de dados sensível devem assumir Row-Level Security como proteção final obrigatória, e não como reforço opcional.

Justificativa: autenticação sem autorização contextual não protege o AdsMagic contra acesso indevido.

### Artigo V. Autenticação e Autorização São Coisas Diferentes

Severidade: Obrigatória

JWT válido prova identidade, mas não substitui validação de pertencimento, escopo de projeto, papel do usuário e permissão operacional.

Justificativa: sessão autenticada sem escopo correto ainda pode gerar acesso indevido entre tenants e projetos.

### Artigo VI. OAuth, Webhooks e Integrações Sensíveis Exigem Defesa em Profundidade

Severidade: Inegociável

Fluxos de OAuth, tokens, callbacks, webhooks e integrações externas devem ser tratados como fluxos críticos, com validação de origem, controle de contexto, idempotência, manejo de erro e proteção de segredo.

Justificativa: essas superfícies concentram maior risco operacional, de segurança e de inconsistência de estado.

### Artigo VII. Segredos Nunca Vivem no Código de Aplicação

Severidade: Inegociável

Tokens, chaves, segredos, credenciais e material sensível devem existir apenas em variáveis de ambiente, cofre apropriado ou backend protegido.

Justificativa: exposição acidental em código, cliente ou logs compromete o produto e suas integrações.

### Artigo VIII. Adapters São a Fronteira Oficial de Contrato

Severidade: Obrigatória

O frontend deve consumir modelos adaptados e tipados; payloads brutos do backend não devem vazar para views, stores ou componentes.

Justificativa: a camada de adapters protege a UI contra acoplamento indevido a snake_case, mudanças de contrato e regressões de integração.

### Artigo IX. Internacionalização é Padrão, Não Pós-Tratamento

Severidade: Obrigatória

Toda experiência user-facing deve respeitar locale, rotas localizadas, traduções e convenções existentes de i18n.

Justificativa: o produto já opera em estrutura multilíngue e não pode regredir para textos hardcoded ou navegação inconsistente.

### Artigo X. Frontend e Backend Mantêm Limites Claros

Severidade: Obrigatória

O frontend é responsável por experiência, estado de interface e consumo de serviços; o backend é responsável por regras de negócio, segurança, persistência e integrações externas.

Justificativa: romper essa fronteira aumenta acoplamento, reduz testabilidade e fragiliza evolução do sistema.

### Artigo XI. Qualidade é Gate de Entrega

Severidade: Obrigatória

Toda entrega deve passar pelos checks relevantes de lint, typecheck, testes e build, além de validação coerente com o risco do fluxo alterado.

Justificativa: velocidade sem gate em um sistema com UI, Edge Functions, OAuth e multi-tenant gera regressão cara e silenciosa.

### Artigo XII. Mudanças Devem Ser Pequenas, Observáveis e Reversíveis

Severidade: Recomendada

Sempre que possível, mudanças devem ser incrementais, de baixo acoplamento, com rollback claro e documentação mínima quando impactarem autenticação, contratos, tenant isolation ou deploy.

Justificativa: reduzir blast radius é essencial em um produto com múltiplas camadas e integrações externas.

## Checklist Operacional

Antes de considerar uma entrega pronta, confirme:

1. Existe story, requisito ou artefato equivalente delimitando o trabalho.
2. A mudança respeita isolamento por tenant, company e project.
3. Nenhum segredo, token ou credencial foi exposto em código, cliente ou logs.
4. Se houve mudança de contrato, adapters, tipos e validações foram atualizados.
5. Se houve impacto de UI, locale, traduções e navegação foram tratados.
6. Se houve impacto em OAuth, webhook ou integração, origem, idempotência e tratamento de erro foram revisados.
7. Lint, typecheck, testes relevantes e build foram executados quando aplicável.
8. A story e a documentação operacional mínima foram atualizadas quando necessário.

## Resumo Executivo

- O AdsMagic governa o produto; o AIOX apenas apoia o processo.
- Segurança, multi-tenant e integridade de contrato têm precedência sobre conveniência local.
- OAuth, webhooks, adapters, i18n e gates de qualidade são áreas críticas e não podem ser tratadas como detalhe de implementação.

## Regra de Precedência

Quando houver conflito:

1. Segurança, isolamento multi-tenant e integridade do produto prevalecem.
2. Esta constitution do AdsMagic prevalece sobre conveniências locais de implementação.
3. O AIOX pode orientar o processo de trabalho, mas não redefine regras centrais do produto.

## Emendas

Esta constitution pode evoluir com o AdsMagic, mas qualquer emenda deve preservar:

- isolamento multi-tenant
- proteção de segredos
- integridade de autenticação e autorização
- uso de adapters como boundary de contrato
- qualidade mínima como gate de entrega
