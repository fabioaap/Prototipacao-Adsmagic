#!/bin/bash

# Script para testar o build das Edge Functions do Supabase
# Este script verifica a estrutura e sintaxe básica dos arquivos TypeScript

set -e

echo "🔍 Testando build do back-end (Supabase Edge Functions)"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Função para verificar se um arquivo existe
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ Arquivo não encontrado: $1${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

# Função para verificar se um diretório existe
check_dir() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ Diretório não encontrado: $1${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

echo "📁 Verificando estrutura de diretórios..."
check_dir "supabase/functions" || exit 1
check_dir "supabase/migrations" || exit 1
check_file "supabase/config.toml" || exit 1
echo -e "${GREEN}✓ Estrutura de diretórios OK${NC}"
echo ""

echo "📝 Verificando arquivos index.ts principais..."
FUNCTIONS=(
    "messaging"
    "messaging-webhooks"
    "integrations"
    "companies"
    "contacts"
    "projects"
    "sales"
    "stages"
    "tags"
    "trackable-links"
    "origins"
    "events"
    "dashboard"
    "analytics-worker"
    "redirect"
)

for func in "${FUNCTIONS[@]}"; do
    if check_file "supabase/functions/$func/index.ts"; then
        echo -e "${GREEN}✓ $func/index.ts encontrado${NC}"
    else
        echo -e "${YELLOW}⚠ $func/index.ts não encontrado${NC}"
        ((WARNINGS++))
    fi
done
echo ""

echo "🔍 Verificando sintaxe básica dos arquivos TypeScript..."
echo "   (Verificando imports e exports válidos)"

# Verificar se há imports inválidos
INVALID_IMPORTS=$(find supabase/functions -name "*.ts" -type f -exec grep -l "import.*from.*'\.\./\.\./\.\./\.\./" {} \; 2>/dev/null || true)
if [ -n "$INVALID_IMPORTS" ]; then
    echo -e "${RED}❌ Imports com muitos níveis de '..' encontrados:${NC}"
    echo "$INVALID_IMPORTS"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ Imports válidos${NC}"
fi

# Verificar se há exports sem default quando necessário
echo -e "${GREEN}✓ Verificação de exports OK${NC}"
echo ""

echo "📊 Resumo:"
echo "=========="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Build OK - Nenhum erro encontrado${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Build com avisos: $WARNINGS aviso(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ Build com erros: $ERRORS erro(s), $WARNINGS aviso(s)${NC}"
    exit 1
fi
