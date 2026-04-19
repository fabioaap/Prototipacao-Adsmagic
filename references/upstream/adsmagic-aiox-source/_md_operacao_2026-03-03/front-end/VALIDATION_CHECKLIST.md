# Checklist de Validação - ETAPAs 1-5

## Autenticação
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas retorna erro apropriado
- [ ] Registro de novo usuário funciona
- [ ] Password reset envia email
- [ ] Sessão persiste após reload
- [ ] Logout limpa sessão

## Empresas
- [ ] Usuário pode criar nova empresa
- [ ] Usuário pode listar suas empresas
- [ ] Usuário pode alterar empresa atual
- [ ] Configurações de empresa são persistidas
- [ ] Multi-tenancy isola dados por empresa

## Projetos
- [ ] Usuário pode criar novo projeto
- [ ] Projetos são filtrados por empresa atual
- [ ] Busca de projetos funciona
- [ ] Alteração de empresa recarrega projetos
- [ ] ProjectWizard cria projeto no backend

## Onboarding
- [ ] Novo usuário vê onboarding
- [ ] Progresso é salvo entre etapas
- [ ] Conclusão cria empresa automaticamente
- [ ] Usuário que completou não vê onboarding novamente

## Performance
- [ ] Carregamento inicial < 2s
- [ ] Navegação entre páginas < 500ms
- [ ] Cache reduz chamadas ao Supabase
- [ ] Busca com debounce não sobrecarrega

## Cache
- [ ] Cache de empresas funciona (5 minutos)
- [ ] Cache de projetos funciona (5 minutos)
- [ ] Cache é invalidado em operações de escrita
- [ ] Cache é limpo ao trocar de empresa

## Testes
- [ ] Testes de stores passam
- [ ] Cobertura de código > 70%
- [ ] Testes de integração básicos funcionam
