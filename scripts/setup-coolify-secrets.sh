#!/bin/bash
# Script para configurar secrets en GitHub para Coolify
# En las Nubes Restobar - Configuración automatizada de secrets

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar que gh CLI está instalado
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed. Please install it first:"
        echo "  macOS: brew install gh"
        echo "  Ubuntu: sudo apt install gh"
        echo "  Windows: winget install GitHub.cli"
        exit 1
    fi

    # Verificar que está autenticado
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated. Please run: gh auth login"
        exit 1
    fi

    log_success "GitHub CLI is ready"
}

# Función para configurar un secret
set_secret() {
    local secret_name="$1"
    local description="$2"
    local prompt_value="$3"
    local default_value="$4"

    echo ""
    log_info "Configuring secret: $secret_name"
    echo "Description: $description"

    if [ -n "$default_value" ]; then
        read -p "Enter value for $secret_name [default: $default_value]: " value
        value="${value:-$default_value}"
    else
        read -p "Enter value for $secret_name: " value
    fi

    if [ -z "$value" ]; then
        log_warning "Skipping $secret_name (empty value)"
        return 1
    fi

    # Usar GitHub CLI para configurar el secret
    if echo "$value" | gh secret set "$secret_name"; then
        log_success "Secret $secret_name configured successfully"
        return 0
    else
        log_error "Failed to configure secret $secret_name"
        return 1
    fi
}

# Configurar secrets de Coolify
setup_coolify_secrets() {
    log_info "Setting up Coolify deployment secrets..."

    # Secrets principales de Coolify
    set_secret "COOLIFY_SERVER_URL" \
        "URL del servidor Coolify (ej: https://coolify.yourdomain.com)" \
        "" \
        "https://coolify.yourdomain.com"

    set_secret "COOLIFY_API_KEY" \
        "API key de Coolify para despliegues automatizados" \
        ""

    set_secret "COOLIFY_APPLICATION_ID" \
        "ID de la aplicación en Coolify" \
        ""

    set_secret "COOLIFY_APP_URL" \
        "URL final de la aplicación desplegada" \
        "" \
        "https://enlasnubes.yourdomain.com"

    # Secrets de la aplicación
    set_secret "VITE_API_BASE_URL" \
        "URL base para las APIs de la aplicación" \
        "" \
        "/api"

    # Secrets de integraciones externas
    set_secret "CARTAMENU_API_KEY" \
        "API key para cartamenú.com (pipeline de datos)" \
        ""

    set_secret "CELEBRARLO_API_KEY" \
        "API key para celebrarlo.com (reservas)" \
        ""

    set_secret "RESTAURANTGURU_API_KEY" \
        "API key para restaurantguru.com (reviews)" \
        ""

    # Secrets de analíticas
    set_secret "GTM_ID" \
        "Google Tag Manager Container ID" \
        "" \
        "GTM-XXXXXXX"

    set_secret "HOTJAR_ID" \
        "Hotjar Site ID para analítica de comportamiento" \
        ""

    # Secrets de monitoreo
    set_secret "SENTRY_DSN" \
        "Sentry DSN para error tracking" \
        ""

    # Secrets de notificaciones
    set_secret "SLACK_WEBHOOK_URL" \
        "Webhook URL para notificaciones en Slack" \
        ""

    set_secret "NOTIFICATION_EMAIL" \
        "Email para notificaciones de despliegue" \
        "" \
        "admin@enlasnubes.yourdomain.com"

    # Secrets para notificaciones por email
    set_secret "EMAIL_USERNAME" \
        "Username para envío de notificaciones por email" \
        ""

    set_secret "EMAIL_PASSWORD" \
        "Password para envío de notificaciones por email" \
        ""

    set_secret "EMAIL_FROM" \
        "Email remitente para notificaciones" \
        "" \
        "noreply@enlasnubes.yourdomain.com"

    # Secrets de servicios de pago (si aplica)
    set_secret "STRIPE_PUBLIC_KEY" \
        "Stripe public key para procesamiento de pagos" \
        ""

    set_secret "STRIPE_SECRET_KEY" \
        "Stripe secret key para procesamiento de pagos" \
        ""

    # Secrets de servicios de email (si aplica)
    set_secret "SENDGRID_API_KEY" \
        "SendGrid API key para envío de emails" \
        ""

    log_success "Coolify secrets configuration completed!"
}

# Configurar variables de entorno del repositorio
setup_repo_variables() {
    log_info "Setting up repository variables..."

    # Variables que no son secretas pero se usan en el workflow
    gh variable set REGISTRY --body "ghcr.io"
    gh variable set IMAGE_NAME --body "$(gh repo view --json nameWithOwner -q '.nameWithOwner')"

    log_success "Repository variables configured!"
}

# Verificar configuración actual
verify_configuration() {
    log_info "Verifying current configuration..."

    echo ""
    log_info "Current secrets:"
    gh secret list | grep -E "(COOLIFY|VITE_|GTM_|STRIPE|SENDGRID|SENTRY)" || echo "No matching secrets found"

    echo ""
    log_info "Current variables:"
    gh variable list || echo "No variables found"

    echo ""
    log_success "Configuration verification completed!"
}

# Generar archivo .env.local para desarrollo
generate_dev_env() {
    log_info "Generating .env.local for development..."

    cat > .env.local << EOF
# Variables de entorno para desarrollo local
# Este archivo se genera automáticamente y NO debe subirse al repositorio

# Configuración básica
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5173/api
VITE_APP_VERSION=dev

# URLs de APIs (desarrollo)
CARTAMENU_API_URL=https://cartamenú.com/api/v1/restaurants/enlasnubes
CELEBRARLO_API_URL=https://celebrarlo.com/api/restaurants/enlasnubes
RESTAURANTGURU_API_URL=https://restaurantguru.com/api/enlasnubes

# Analíticas (desarrollo - usar IDs de prueba)
GTM_ID=GTM-XXXXXXX
HOTJAR_ID=1234567

# Monitoreo (desarrollo)
SENTRY_DSN=

# Servicios de pago (desarrollo - usar claves de prueba)
STRIPE_PUBLIC_KEY=pk_test_XXXXX
STRIPE_SECRET_KEY=sk_test_XXXXX

# Email (desarrollo)
SENDGRID_API_KEY=

# Características
FEATURE_ONLINE_PAYMENT=false
FEATURE_TABLE_RESERVATION=true
FEATURE_EVENT_BOOKING=true
FEATURE_DELIVERY=false
FEATURE_TAKEAWAY=true

# Logs
LOG_LEVEL=debug
DEBUG_MODE=true
EOF

    log_success ".env.local generated for development"
}

# Función principal
main() {
    echo "🚀 Coolify Secrets Configuration Script"
    echo "======================================"
    echo "En las Nubes Restobar - Deployment Setup"
    echo ""

    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi

    # Verificar gh CLI
    check_gh_cli

    # Verificar que estamos en un repositorio de GitHub
    if ! git remote get-url origin 2>/dev/null | grep -q github.com; then
        log_error "This is not a GitHub repository. Please run this script in a GitHub repo."
        exit 1
    fi

    echo ""
    log_info "Repository: $(gh repo view --json nameWithOwner -q '.nameWithOwner')"
    log_info "Current branch: $(git branch --show-current)"
    echo ""

    # Menú interactivo
    echo "Choose an option:"
    echo "1) Setup Coolify secrets"
    echo "2) Setup repository variables"
    echo "3) Verify current configuration"
    echo "4) Generate .env.local for development"
    echo "5) Full setup (all of the above)"
    echo "6) Exit"

    read -p "Enter your choice (1-6): " choice

    case $choice in
        1)
            setup_coolify_secrets
            ;;
        2)
            setup_repo_variables
            ;;
        3)
            verify_configuration
            ;;
        4)
            generate_dev_env
            ;;
        5)
            setup_coolify_secrets
            setup_repo_variables
            generate_dev_env
            verify_configuration
            ;;
        6)
            log_info "Exiting..."
            exit 0
            ;;
        *)
            log_error "Invalid choice. Please select 1-6."
            exit 1
            ;;
    esac

    echo ""
    log_success "Configuration completed successfully!"
    log_info "Remember to:"
    echo "  1. Review and test your Coolify deployment"
    echo "  2. Update your .env file with the correct values"
    echo "  3. Test all integrations (APIs, payment gateways, etc.)"
    echo "  4. Monitor the first deployment carefully"
}

# Ejecutar script
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi