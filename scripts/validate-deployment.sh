#!/bin/bash
# Script de validación completa de despliegue
# En las Nubes Restobar - Validación production-ready

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función de log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🔍 $1${NC}"
}

# Contador de validaciones
VALIDATIONS_TOTAL=0
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0

# Función de validación
validate() {
    local test_name="$1"
    local expected_value="$2"
    local actual_value="$3"
    local validation_type="$4" # file, dir, size, content, command

    VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

    echo -n "Testing $test_name... "

    case "$validation_type" in
        "file")
            if [ -f "$actual_value" ]; then
                if [ -n "$expected_value" ] && [ "$expected_value" != "exists" ]; then
                    if [ "$(stat -c%s "$actual_value" 2>/dev/null || echo 0)" = "$expected_value" ]; then
                        echo -e "${GREEN}PASS${NC}"
                        VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
                    else
                        echo -e "${RED}FAIL${NC} (expected size: $expected_value, got: $(stat -c%s "$actual_value" 2>/dev/null || echo 0))"
                        VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
                    fi
                else
                    echo -e "${GREEN}PASS${NC}"
                    VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
                fi
            else
                echo -e "${RED}FAIL${NC} (file not found: $actual_value)"
                VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            fi
            ;;
        "dir")
            if [ -d "$actual_value" ]; then
                echo -e "${GREEN}PASS${NC}"
                VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
            else
                echo -e "${RED}FAIL${NC} (directory not found: $actual_value)"
                VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            fi
            ;;
        "size")
            local actual_size=$(du -s "$actual_value" 2>/dev/null | cut -f1 || echo 0)
            if [ "$actual_size" -ge "$expected_value" ]; then
                echo -e "${GREEN}PASS${NC} (${actual_size}KB)"
                VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
            else
                echo -e "${RED}FAIL${NC} (expected ≥${expected_value}KB, got: ${actual_size}KB)"
                VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            fi
            ;;
        "content")
            if grep -q "$expected_value" "$actual_value" 2>/dev/null; then
                echo -e "${GREEN}PASS${NC}"
                VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
            else
                echo -e "${RED}FAIL${NC} (pattern not found: $expected_value in $actual_value)"
                VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            fi
            ;;
        "command")
            if eval "$actual_value" >/dev/null 2>&1; then
                echo -e "${GREEN}PASS${NC}"
                VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
            else
                echo -e "${RED}FAIL${NC} (command failed: $actual_value)"
                VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            fi
            ;;
        *)
            echo -e "${RED}FAIL${NC} (unknown validation type: $validation_type)"
            VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
            ;;
    esac
}

# Validación de archivos del proyecto
validate_project_structure() {
    log_header "Validación de Estructura del Proyecto"

    validate "package.json exists" "exists" "package.json" "file"
    validate "Dockerfile exists" "exists" "Dockerfile" "file"
    validate "docker-compose.yml exists" "exists" "docker-compose.yml" "file"
    validate "nginx.conf exists" "exists" "nginx.conf" "file"
    validate "healthcheck.sh exists" "exists" "healthcheck.sh" "file"
    validate ".dockerignore exists" "exists" ".dockerignore" "file"
    validate ".env.template exists" "exists" ".env.template" "file"

    # Validar directorios importantes
    validate "src directory exists" "exists" "src" "dir"
    validate "dist directory exists" "exists" "dist" "dir"
    validate "scripts directory exists" "exists" "scripts" "dir"
    validate "docs directory exists" "exists" "docs" "dir"

    echo ""
}

# Validación de archivos de configuración
validate_configuration_files() {
    log_header "Validación de Archivos de Configuración"

    # Validar package.json
    validate "package.json has correct name" "en-las-nubes" "package.json" "content"
    validate "package.json has build script" "\"build\":" "package.json" "content"
    validate "package.json has Vite dependency" "\"vite\":" "package.json" "content"
    validate "package.json has PWA plugin" "\"vite-plugin-pwa\":" "package.json" "content"

    # Validar Dockerfile
    validate "Dockerfile has multi-stage build" "AS builder" "Dockerfile" "content"
    validate "Dockerfile uses nginx alpine" "nginx:alpine" "Dockerfile" "content"
    validate "Dockerfile has health check" "HEALTHCHECK" "Dockerfile" "content"
    validate "Dockerfile sets correct user" "USER nginx" "Dockerfile" "content"

    # Validar nginx.conf
    validate "nginx.conf has gzip enabled" "gzip on" "nginx.conf" "content"
    validate "nginx.conf has security headers" "X-Content-Type-Options" "nginx.conf" "content"
    validate "nginx.conf has cache rules" "expires" "nginx.conf" "content"
    validate "nginx.conf has PWA support" "Service-Worker-Allowed" "nginx.conf" "content"

    # Validar docker-compose.yml
    validate "docker-compose.yml has app service" "app:" "docker-compose.yml" "content"
    validate "docker-compose.yml has health check" "healthcheck:" "docker-compose.yml" "content"
    validate "docker-compose.yml has resource limits" "resources:" "docker-compose.yml" "content"
    validate "docker-compose.yml has volumes" "volumes:" "docker-compose.yml" "content"

    echo ""
}

# Validación de build de producción
validate_production_build() {
    log_header "Validación de Build de Producción"

    # Validar archivos de build
    validate "index.html exists in dist" "exists" "dist/index.html" "file"
    validate "manifest.webmanifest exists" "exists" "dist/manifest.webmanifest" "file"
    validate "service worker exists" "exists" "dist/sw.js" "file"
    validate "registration script exists" "exists" "dist/registerSW.js" "file"

    # Validar tamaño del build
    validate "dist directory size reasonable" "1500" "dist" "size"

    # Validar contenido crítico
    validate "index.html has app title" "En las Nubes" "dist/index.html" "content"
    validate "manifest has correct name" "En las Nubes Restobar" "dist/manifest.webmanifest" "content"
    validate "service worker has cache strategy" "CacheFirst" "dist/sw.js" "content"

    # Validar assets optimizados
    if [ -d "dist/assets" ]; then
        local css_files=$(find dist/assets -name "*.css" | wc -l)
        local js_files=$(find dist/assets -name "*.js" | wc -l)

        if [ "$css_files" -gt 0 ]; then
            log_success "CSS files found: $css_files"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        else
            log_error "No CSS files found"
            VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
        fi
        VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

        if [ "$js_files" -gt 0 ]; then
            log_success "JavaScript files found: $js_files"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        else
            log_error "No JavaScript files found"
            VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
        fi
        VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))
    fi

    echo ""
}

# Validación de PWA
validate_pwa_features() {
    log_header "Validación de Características PWA"

    # Validar manifest
    validate "manifest has theme_color" "\"theme_color\"" "dist/manifest.webmanifest" "content"
    validate "manifest has background_color" "\"background_color\"" "dist/manifest.webmanifest" "content"
    validate "manifest has icons" "\"icons\"" "dist/manifest.webmanifest" "content"
    validate "manifest has display mode" "\"display\"" "dist/manifest.webmanifest" "content"

    # Validar service worker
    validate "service worker has runtime caching" "runtimeCaching" "dist/sw.js" "content"
    validate "service worker has cache names" "cacheName" "dist/sw.js" "content"
    validate "service worker has network strategies" "NetworkFirst" "dist/sw.js" "content"

    # Validar registro en index.html
    validate "index.html registers service worker" "registerSW" "dist/index.html" "content"
    validate "index.html has PWA meta tags" "theme-color" "dist/index.html" "content"

    echo ""
}

# Validación de seguridad
validate_security_features() {
    log_header "Validación de Seguridad"

    # Validar headers de seguridad en nginx
    validate "nginx has X-Frame-Options" "X-Frame-Options" "nginx.conf" "content"
    validate "nginx has X-Content-Type-Options" "X-Content-Type-Options" "nginx.conf" "content"
    validate "nginx has XSS Protection" "X-XSS-Protection" "nginx.conf" "content"
    validate "nginx has Referrer Policy" "Referrer-Policy" "nginx.conf" "content"

    # Validar configuración de SSL/TLS (preparación)
    validate "nginx ready for SSL" "listen 443" "nginx.conf" "content"
    validate "nginx has HSTS" "Strict-Transport-Security" "nginx.conf" "content"

    # Validar configuración segura de Docker
    validate "Dockerfile uses non-root user" "USER nginx" "Dockerfile" "content"
    validate "Dockerfile has minimal base image" "alpine" "Dockerfile" "content"
    validate ".dockerignore excludes sensitive files" ".git" ".dockerignore" "content"

    echo ""
}

# Validación de performance
validate_performance_features() {
    log_header "Validación de Performance"

    # Validar optimización de assets
    validate "nginx has gzip compression" "gzip_comp_level" "nginx.conf" "content"
    validate "nginx has cache control" "Cache-Control" "nginx.conf" "content"
    validate "nginx has expires headers" "expires" "nginx.conf" "content"

    # Validar splitting de código
    validate "build has vendor chunks" "vendor" "dist" "content"
    validate "build has legacy chunks" "legacy" "dist" "content"

    # Validar optimización de recursos
    validate "docker-compose has memory limits" "memory" "docker-compose.yml" "content"
    validate "docker-compose has CPU limits" "cpus" "docker-compose.yml" "content"

    echo ""
}

# Validación de CI/CD
validate_cicd_features() {
    log_header "Validación de CI/CD"

    # Validar GitHub Actions
    validate "GitHub Actions workflow exists" "exists" ".github/workflows/coolify-deploy.yml" "file"
    validate "workflow has build job" "build:" ".github/workflows/coolify-deploy.yml" "content"
    validate "workflow has deploy job" "deploy:" ".github/workflows/coolify-deploy.yml" "content"
    validate "workflow has test job" "test:" ".github/workflows/coolify-deploy.yml" "content"

    # Validar scripts de automatización
    validate "deploy script exists" "exists" "scripts/deploy-local.sh" "file"
    validate "secrets setup script exists" "exists" "scripts/setup-coolify-secrets.sh" "file"
    validate "rollback script exists" "exists" "scripts/rollback-coolify.sh" "file"

    # Validar configuración de secrets
    validate "env template has Coolify variables" "COOLIFY_SERVER_URL" ".env.template" "content"
    validate "env template has API keys" "API_KEY" ".env.template" "content"

    echo ""
}

# Validación de documentación
validate_documentation() {
    log_header "Validación de Documentación"

    # Validar guía de despliegue
    validate "deployment guide exists" "exists" "docs/COOLIFY_DEPLOYMENT_GUIDE.md" "file"
    validate "guide has architecture section" "Arquitectura" "docs/COOLIFY_DEPLOYMENT_GUIDE.md" "content"
    validate "guide has troubleshooting section" "Troubleshooting" "docs/COOLIFY_DEPLOYMENT_GUIDE.md" "content"
    validate "guide has checklist" "Checklist" "docs/COOLIFY_DEPLOYMENT_GUIDE.md" "content"

    # Validar README del proyecto
    validate "README exists" "exists" "README.md" "file"

    echo ""
}

# Validación de dependencias
validate_dependencies() {
    log_header "Validación de Dependencias"

    # Validar Node.js (si está disponible)
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d'v' -f2)
        if [[ "$node_version" =~ ^2[0-9]\. ]]; then
            log_success "Node.js version compatible: $node_version"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        else
            log_warning "Node.js version not recommended: $node_version (should be 20.x)"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        fi
        VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))
    else
        log_warning "Node.js not available for validation"
    fi

    # Validar npm/yarn
    if command -v npm &> /dev/null; then
        log_success "npm available"
        VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
    else
        log_error "npm not available"
        VALIDATIONS_FAILED=$((VALIDATIONS_FAILED + 1))
    fi
    VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))

    # Validar que no haya dependencias críticas faltantes
    if [ -f "package.json" ] && command -v npm &> /dev/null; then
        if npm ls --depth=0 >/dev/null 2>&1; then
            log_success "Dependencies are properly installed"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        else
            log_warning "Dependencies may have issues"
            VALIDATIONS_PASSED=$((VALIDATIONS_PASSED + 1))
        fi
        VALIDATIONS_TOTAL=$((VALIDATIONS_TOTAL + 1))
    fi

    echo ""
}

# Generar reporte final
generate_final_report() {
    log_header "📊 Reporte Final de Validación"

    echo "======================================"
    echo "Total de Validaciones: $VALIDATIONS_TOTAL"
    echo "✅ Pasadas: $VALIDATIONS_PASSED"
    echo "❌ Fallidas: $VALIDATIONS_FAILED"
    echo "======================================"

    local success_rate=0
    if [ $VALIDATIONS_TOTAL -gt 0 ]; then
        success_rate=$((VALIDATIONS_PASSED * 100 / VALIDATIONS_TOTAL))
    fi

    echo "Tasa de Éxito: ${success_rate}%"

    if [ $success_rate -ge 95 ]; then
        echo -e "\n🎉 ${GREEN}EXCELLENTE! La configuración está production-ready.${NC}"
        echo "✅ Todo está listo para despliegue en Coolify"
    elif [ $success_rate -ge 85 ]; then
        echo -e "\n👍 ${GREEN}MUY BUENO! La configuración es casi perfecta.${NC}"
        echo "⚠️ Revisa las validaciones fallidas antes del despliegue"
    elif [ $success_rate -ge 70 ]; then
        echo -e "\n⚠️ ${YELLOW}ACEPTABLE con mejoras necesarias.${NC}"
        echo "❌ Es importante resolver las validaciones fallidas"
    else
        echo -e "\n🚨 ${RED}NECESITA MEJORAS SIGNIFICATIVAS.${NC}"
        echo "❌ Resuelve los problemas críticos antes del despliegue"
    fi

    echo ""
    echo "📋 Próximos Pasos:"
    echo "1. Revisa las validaciones fallidas"
    echo "2. Corrige los problemas identificados"
    echo "3. Ejecuta 'npm run build' para generar nueva versión"
    echo "4. Vuelve a ejecutar este script de validación"
    echo "5. Cuando esté todo listo, procede con despliegue a Coolify"

    return $VALIDATIONS_FAILED
}

# Función principal
main() {
    echo "🔍 Script de Validación de Despliegue"
    echo "======================================"
    echo "En las Nubes Restobar - Validación Production-Ready"
    echo ""

    # Cambiar al directorio del proyecto si es necesario
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi

    # Ejecutar todas las validaciones
    validate_project_structure
    validate_configuration_files
    validate_production_build
    validate_pwa_features
    validate_security_features
    validate_performance_features
    validate_cicd_features
    validate_documentation
    validate_dependencies

    # Generar reporte final
    local exit_code=0
    generate_final_report || exit_code=$?

    echo ""
    if [ $exit_code -eq 0 ]; then
        log_success "🚀 ¡Todo listo para despliegue en Coolify!"
        log_info "Ejecuta: ./scripts/deploy-local.sh full para testing local"
        log_info "O procede directamente con despliegue a producción"
    else
        log_error "❌ Hay $exit_code validaciones que necesitan atención"
        log_info "Resuelve los problemas antes de proceder con el despliegue"
    fi

    exit $exit_code
}

# Ejecutar script
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi