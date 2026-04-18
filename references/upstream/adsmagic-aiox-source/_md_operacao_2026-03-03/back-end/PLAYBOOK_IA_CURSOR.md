# 🎯 Playbook: Usando IA do Cursor para Implementar Backend

**Versão**: 1.0  
**Data**: 2025-01-28  
**Objetivo**: Templates prontos para copiar e colar - Prompts simples que funcionam

---

## 🚀 Como Usar Este Playbook

1. **Escolha o template** que se encaixa na sua necessidade
2. **Copie e cole** no Cursor
3. **Ajuste** apenas o que for específico (número da sessão, nome da tabela, etc)
4. **Execute** e valide o resultado

---

## 📋 Templates Prontos (Copie e Cole)

### **1. Implementar Sessão Completa**

```
Implementar Sessão [X] seguindo:

1. @BACKEND_IMPLEMENTATION_PLAN.md - Para ver o que fazer
2. @BACKEND_PROGRESS.md - Para ver o que já está feito  
3. @supabase/functions/projects/ - Para seguir o padrão
4. @doc/database-schema.md - Para o schema do banco

Implemente tudo que está no plano da sessão, seguindo 
os padrões existentes.

Se precisar de alguma decisão, me pergunte antes de continuar.
```

**Exemplo de uso:**
```
Implementar Sessão 4 seguindo:

1. @BACKEND_IMPLEMENTATION_PLAN.md - Para ver o que fazer
2. @BACKEND_PROGRESS.md - Para ver o que já está feito  
3. @supabase/functions/projects/ - Para seguir o padrão
4. @doc/database-schema.md - Para o schema do banco

Implemente tudo que está no plano da sessão, seguindo 
os padrões existentes.

Se precisar de alguma decisão, me pergunte antes de continuar.
```

---

### **2. Análise e Planejamento Primeiro**

```
Analise a Sessão [X] em @BACKEND_IMPLEMENTATION_PLAN.md.

Mostre:
1. O que precisa ser feito (lista de tarefas)
2. Em que ordem fazer (sequência lógica)
3. O que usar como referência (arquivos/padrões)

Depois, comece a implementar seguindo o plano que você criou.
```

**Exemplo de uso:**
```
Analise a Sessão 4 em @BACKEND_IMPLEMENTATION_PLAN.md.

Mostre:
1. O que precisa ser feito (lista de tarefas)
2. Em que ordem fazer (sequência lógica)
3. O que usar como referência (arquivos/padrões)

Depois, comece a implementar seguindo o plano que você criou.
```

---

### **3. Criar Migration**

```
Criar migration para [nome da tabela/sistema] seguindo:

- Schema em @doc/database-schema.md (seção [nome])
- Padrão de migrations existentes em @supabase/migrations/
- Incluir: tabelas, índices, constraints, RLS básico
- Comentários explicativos

Use o próximo número sequencial de migration.
```

**Exemplo de uso:**
```
Criar migration para sistema de contatos seguindo:

- Schema em @doc/database-schema.md (seção de contatos)
- Padrão de migrations existentes em @supabase/migrations/
- Incluir: tabelas, índices, constraints, RLS básico
- Comentários explicativos

Use o próximo número sequencial de migration.
```

---

### **4. Criar Edge Function**

```
Criar Edge Function [nome] seguindo o mesmo padrão de 
@supabase/functions/projects/:

- Estrutura completa (index.ts, handlers/, validators/, utils/, types.ts)
- Todos os endpoints CRUD (create, list, get, update, delete)
- Validação Zod em todos os endpoints
- CORS e autenticação obrigatória
- Error handling adequado

Adapte para [entidade] mas mantenha a mesma estrutura.
```

**Exemplo de uso:**
```
Criar Edge Function contacts seguindo o mesmo padrão de 
@supabase/functions/projects/:

- Estrutura completa (index.ts, handlers/, validators/, utils/, types.ts)
- Todos os endpoints CRUD (create, list, get, update, delete)
- Validação Zod em todos os endpoints
- CORS e autenticação obrigatória
- Error handling adequado

Adapte para contacts mas mantenha a mesma estrutura.
```

---

### **5. Implementar Handler Específico**

```
Implementar handler [ação].ts para [entidade] seguindo 
@supabase/functions/projects/handlers/[ação].ts:

- Mesma estrutura e padrão
- Validação Zod obrigatória
- Autenticação JWT
- RLS automático
- Error handling robusto
- Logs para debug

Adapte os campos para [entidade].
```

**Exemplo de uso:**
```
Implementar handler create.ts para contacts seguindo 
@supabase/functions/projects/handlers/create.ts:

- Mesma estrutura e padrão
- Validação Zod obrigatória
- Autenticação JWT
- RLS automático
- Error handling robusto
- Logs para debug

Adapte os campos para contacts.
```

---

### **6. Implementar RLS Policies**

```
Implementar RLS policies para [tabela] seguindo:

- Padrão de @supabase/policies/002_projects_rls.sql
- Isolamento por project_id
- Permissões por role (owner, admin, manager, member, viewer)
- Performance otimizada (SELECT auth.uid() uma vez)
- Policies para SELECT, INSERT, UPDATE, DELETE

Adapte para [tabela] mas mantenha a mesma lógica.
```

**Exemplo de uso:**
```
Implementar RLS policies para contacts seguindo:

- Padrão de @supabase/policies/002_projects_rls.sql
- Isolamento por project_id
- Permissões por role (owner, admin, manager, member, viewer)
- Performance otimizada (SELECT auth.uid() uma vez)
- Policies para SELECT, INSERT, UPDATE, DELETE

Adapte para contacts mas mantenha a mesma lógica.
```

---

### **7. Validar Implementação**

```
Validar a implementação de [sessão/feature]:

- Verificar TypeScript (sem erros, sem any)
- Confirmar que segue padrões de @supabase/functions/projects/
- Validar RLS policies ativas
- Testar estrutura de endpoints
- Verificar validação Zod em todos endpoints
- Confirmar CORS configurado
- Verificar error handling

Mostre o que está correto e o que precisa ajustar.
```

**Exemplo de uso:**
```
Validar a implementação da Sessão 4:

- Verificar TypeScript (sem erros, sem any)
- Confirmar que segue padrões de @supabase/functions/projects/
- Validar RLS policies ativas
- Testar estrutura de endpoints
- Verificar validação Zod em todos endpoints
- Confirmar CORS configurado
- Verificar error handling

Mostre o que está correto e o que precisa ajustar.
```

---

### **8. Atualizar Documentação**

```
Atualizar @BACKEND_PROGRESS.md:

- Marcar Sessão [X] como concluída (ou atualizar progresso)
- Adicionar endpoints implementados na seção de APIs
- Atualizar métricas gerais (tarefas concluídas, tempo)
- Adicionar nota no histórico com data de hoje
- Atualizar próximos passos se necessário

Mantenha o mesmo formato e estilo do documento.
```

**Exemplo de uso:**
```
Atualizar @BACKEND_PROGRESS.md:

- Marcar Sessão 4 como concluída
- Adicionar endpoints implementados na seção de APIs
- Atualizar métricas gerais (tarefas concluídas, tempo)
- Adicionar nota no histórico com data de hoje
- Atualizar próximos passos se necessário

Mantenha o mesmo formato e estilo do documento.
```

---

### **9. Próxima Tarefa (Quando Não Sabe o Que Fazer)**

```
Qual a próxima coisa a fazer para completar a Sessão [X]?

Consulte:
- @BACKEND_IMPLEMENTATION_PLAN.md para ver o que está planejado
- @BACKEND_PROGRESS.md para ver o que já está feito

Mostre o que falta e comece a implementar.
```

**Exemplo de uso:**
```
Qual a próxima coisa a fazer para completar a Sessão 4?

Consulte:
- @BACKEND_IMPLEMENTATION_PLAN.md para ver o que está planejado
- @BACKEND_PROGRESS.md para ver o que já está feito

Mostre o que falta e comece a implementar.
```

---

### **10. Corrigir Erro ou Problema**

```
Corrigir [descrição do problema] em [arquivo/código].

O erro é: [cole o erro ou descreva]

Siga os padrões do projeto e mantenha consistência com 
@supabase/functions/projects/.
```

**Exemplo de uso:**
```
Corrigir erro de TypeScript em handlers/create.ts.

O erro é: "Property 'email' does not exist on type..."

Siga os padrões do projeto e mantenha consistência com 
@supabase/functions/projects/.
```

---

### **11. Implementar Feature Específica**

```
Implementar [feature específica] para [entidade] seguindo:

- Padrão de [arquivo similar] em @supabase/functions/
- Schema em @doc/database-schema.md
- Validação Zod como em @supabase/functions/projects/validators/

Se precisar de alguma decisão, me pergunte.
```

**Exemplo de uso:**
```
Implementar busca full-text para contacts seguindo:

- Padrão de busca em @supabase/functions/projects/handlers/list.ts
- Schema em @doc/database-schema.md
- Validação Zod como em @supabase/functions/projects/validators/

Se precisar de alguma decisão, me pergunte.
```

---

### **12. Refatorar ou Melhorar Código**

```
Melhorar [arquivo/código] seguindo:

- Princípios SOLID
- Clean Code
- Padrões de @supabase/functions/projects/
- TypeScript strict

Mantenha a funcionalidade mas melhore a qualidade do código.
```

**Exemplo de uso:**
```
Melhorar handlers/create.ts seguindo:

- Princípios SOLID
- Clean Code
- Padrões de @supabase/functions/projects/
- TypeScript strict

Mantenha a funcionalidade mas melhore a qualidade do código.
```

---

## 🔄 Fluxo Completo: Sessão do Zero ao Fim

### **Passo 1: Planejamento**
```
Analise a Sessão [X] em @BACKEND_IMPLEMENTATION_PLAN.md.

Mostre o que precisa ser feito e em que ordem.
Depois, comece a implementar.
```

### **Passo 2: Migration**
```
Criar migration para [sistema] seguindo:
- Schema em @doc/database-schema.md
- Padrão de @supabase/migrations/
```

### **Passo 3: Validar Migration**
```
Validar a migration criada:
- Sintaxe SQL
- Foreign keys
- Constraints
- Índices
```

### **Passo 4: Edge Function**
```
Criar Edge Function [nome] seguindo @supabase/functions/projects/
```

### **Passo 5: Validar Implementação**
```
Validar implementação completa:
- TypeScript
- Padrões
- RLS
- Endpoints
```

### **Passo 6: Documentação**
```
Atualizar @BACKEND_PROGRESS.md com progresso da Sessão [X]
```

---

## 💡 Dicas de Uso

### **1. Sempre Anexe Documentação**
```
✅ "Implementar Sessão 4. Veja @BACKEND_IMPLEMENTATION_PLAN.md"
❌ "Implementar contatos"
```

### **2. Use "Seguindo o Padrão de..."**
```
✅ "Criar endpoint seguindo padrão de @projects/"
❌ "Criar endpoint de contatos"
```

### **3. Deixe a IA Fazer Perguntas**
```
✅ "Implemente. Se precisar de decisão, me pergunte."
❌ "Implemente tudo sem perguntar nada."
```

### **4. Valide em Etapas**
```
✅ "Implemente migration primeiro, valide, depois continue."
❌ "Implemente tudo de uma vez."
```

---

## ⚠️ Respostas Rápidas para Quando a IA Perguntar

### **"Qual o nome da migration?"**
```
Use o padrão: [número sequencial]_[nome descritivo].sql
Exemplo: 019_contacts_system.sql
```

### **"Quais campos na tabela?"**
```
Veja o schema em @doc/database-schema.md na seção [nome]
```

### **"Qual estrutura de resposta?"**
```
Siga o padrão de @supabase/functions/projects/handlers/get.ts
```

### **"Qual validação usar?"**
```
Siga o padrão de @supabase/functions/projects/validators/project.ts
```

### **"Qual padrão seguir?"**
```
Siga o padrão de @supabase/functions/projects/ para tudo
```

---

## 📊 Checklist: Seu Prompt Está Bom?

- [ ] Anexa documentação relevante (`@arquivo`)
- [ ] Referencia padrões existentes (`@projects/`)
- [ ] Instrução clara ("Implemente", "Crie", "Analise")
- [ ] Permite que IA faça perguntas se necessário
- [ ] Específico o suficiente mas não detalhado demais

---

## 🎯 Exemplos Reais de Uso

### **Cenário 1: Implementar Sessão 4 Completa**

**Prompt:**
```
Implementar Sessão 4 seguindo:

1. @BACKEND_IMPLEMENTATION_PLAN.md
2. @BACKEND_PROGRESS.md  
3. @supabase/functions/projects/
4. @doc/database-schema.md

Implemente tudo da sessão, seguindo os padrões.
```

### **Cenário 2: Apenas Criar Migration**

**Prompt:**
```
Criar migration para contatos seguindo:
- @doc/database-schema.md (seção contatos)
- Padrão de @supabase/migrations/
```

### **Cenário 3: Apenas Edge Function**

**Prompt:**
```
Criar Edge Function contacts seguindo @supabase/functions/projects/
```

### **Cenário 4: Não Sabe Por Onde Começar**

**Prompt:**
```
Qual a próxima coisa a fazer? Veja @BACKEND_PROGRESS.md
```

---

## 🚀 Resultado Esperado

Ao usar estes templates:
- ✅ IA implementa seguindo padrões do projeto
- ✅ Código consistente e de qualidade
- ✅ Documentação sempre atualizada
- ✅ Você não precisa saber todos os detalhes
- ✅ Progresso mensurável e rastreável

---

## 📝 Notas Finais

1. **Copie e cole** os templates - não precisa criar do zero
2. **Ajuste apenas** o que é específico (número da sessão, nome)
3. **Valide** cada etapa antes de continuar
4. **Deixe a IA perguntar** quando tiver dúvidas
5. **Use a documentação** como fonte da verdade

---

**💡 Lembre-se**: A documentação e código existente já definem os padrões. Você só precisa apontar a IA para eles!

