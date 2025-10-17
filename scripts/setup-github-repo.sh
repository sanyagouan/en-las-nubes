#!/bin/bash

# =================================================================
# Script Automático para Crear Repositorio GitHub y Subir Proyecto
# En las Nubes Restobar - Complete Setup
# =================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando repositorio GitHub para En las Nubes Restobar${NC}"
echo "=================================================================="

# Verificar si tenemos git instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado. Por favor instala Git primero.${NC}"
    exit 1
fi

# Verificar si tenemos gh CLI (GitHub CLI)
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) no está instalado.${NC}"
    echo "Instálalo desde: https://cli.github.com/"
    echo "O crea el repositorio manualmente en GitHub.com"
    echo ""
    echo -e "${BLUE}📋 Instrucciones manuales:${NC}"
    echo "1. Ve a https://github.com/new"
    echo "2. Repository name: en-las-nubes"
    echo "3. Description: Web gastronómica cinematográfica"
    echo "4. Marca 'Public' o 'Private' según prefieras"
    echo "5. NO marques 'Add README' (ya tenemos uno)"
    echo "6. Click en 'Create repository'"
    echo "7. Copia la URL del repositorio y ejecuta:"
    echo "   git remote add origin TU_URL"
    echo "   git push -u origin main"
    exit 1
fi

# Verificar si estamos autenticados en GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 No estás autenticado en GitHub CLI${NC}"
    echo "Por favor ejecuta primero: gh auth login"
    echo "Sigue las instrucciones para autenticarte"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI detectado y autenticado${NC}"

# Obtener información del usuario
GITHUB_USER=$(gh api user --jq '.login')
echo -e "${BLUE}👤 Usuario GitHub: ${GITHUB_USER}${NC}"

# Nombre del repositorio
REPO_NAME="en-las-nubes"
REPO_DESCRIPTION="Web gastronómica cinematográfica - En las Nubes Restobar"

echo -e "${BLUE}📁 Creando repositorio: ${REPO_NAME}${NC}"

# Crear repositorio en GitHub
if gh repo create ${REPO_NAME} \
    --description "${REPO_DESCRIPTION}" \
    --public \
    --source=. \
    --remote=origin \
    --push; then

    echo -e "${GREEN}✅ Repositorio creado y código subido exitosamente${NC}"
else
    echo -e "${RED}❌ Error creando repositorio${NC}"
    echo "Verifica que no tengas un repositorio con ese nombre"
    exit 1
fi

# Obtener la URL del repositorio
REPO_URL=$(gh api repos/${GITHUB_USER}/${REPO_NAME} --jq '.html_url')

echo ""
echo -e "${GREEN}🎉 ¡LISTO! Repositorio configurado exitosamente${NC}"
echo "=================================================================="
echo -e "${BLUE}📍 URL del repositorio:${NC} ${REPO_URL}"
echo ""
echo -e "${BLUE}📋 Siguientes pasos:${NC}"
echo "1. Configura los secrets en GitHub:"
echo "   ${REPO_URL}/settings/secrets/actions"
echo ""
echo "2. Secrets necesarios:"
echo "   - COOLIFY_SERVER_URL=https://tu-coolify.com"
echo "   - COOLIFY_API_KEY=tu-api-key"
echo "   - COOLIFY_APPLICATION_ID=tu-app-id"
echo "   - COOLIFY_APP_URL=https://enlasnubes.tudominio.com"
echo ""
echo "3. Sigue el tutorial TUTORIAL_PASO_A_PASO.md"
echo ""
echo -e "${GREEN}🚀 Tu proyecto está listo para desplegar en Coolify${NC}"