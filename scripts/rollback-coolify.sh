#!/bin/bash
# Script de rollback automático para Coolify
# En las Nubes Restobar - Recuperación ante fallos

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

# Configuración
COOLIFY_SERVER_URL="${COOLIFY_SERVER_URL:-}"
COOLIFY_API_KEY="${COOLIFY_API_KEY:-}"
COOLIFY_APPLICATION_ID="${COOLIFY_APPLICATION_ID:-}"
BACKUP_ENABLED="${BACKUP_ENABLED:-true}"
MAX_ROLLBACK_ATTEMPTS="${MAX_ROLLBACK_ATTEMPTS:-3}"
NOTIFICATION_ENABLED="${NOTIFICATION_ENABLED:-true}"

# Función de verificación de dependencias
check_dependencies() {
    local missing_deps=0

    # Verificar curl
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        missing_deps=$((missing_deps + 1))
    fi

    # Verificar jq (para procesamiento JSON)
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. Some features may not work properly"
    fi

    # Verificar variables de entorno
    if [ -z "$COOLIFY_SERVER_URL" ]; then
        log_error "COOLIFY_SERVER_URL is not set"
        missing_deps=$((missing_deps + 1))
    fi

    if [ -z "$COOLIFY_API_KEY" ]; then
        log_error "COOLIFY_API_KEY is not set"
        missing_deps=$((missing_deps + 1))
    fi

    if [ -z "$COOLIFY_APPLICATION_ID" ]; then
        log_error "COOLIFY_APPLICATION_ID is not set"
        missing_deps=$((missing_deps + 1))
    fi

    if [ $missing_deps -gt 0 ]; then
        log_error "$missing_deps dependencies are missing"
        exit 1
    fi

    log_success "All dependencies are available"
}

# Función para hacer llamadas a la API de Coolify
call_coolify_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    local url="${COOLIFY_SERVER_URL}/api/v1/${endpoint}"
    local headers=(
        -H "Authorization: Bearer ${COOLIFY_API_KEY}"
        -H "Content-Type: application/json"
        -H "Accept: application/json"
    )

    log_info "Calling Coolify API: $method $endpoint"

    case "$method" in
        "GET")
            curl -s "${headers[@]}" "$url"
            ;;
        "POST")
            if [ -n "$data" ]; then
                curl -s -X POST "${headers[@]}" -d "$data" "$url"
            else
                curl -s -X POST "${headers[@]}" "$url"
            fi
            ;;
        "PUT")
            if [ -n "$data" ]; then
                curl -s -X PUT "${headers[@]}" -d "$data" "$url"
            else
                curl -s -X PUT "${headers[@]}" "$url"
            fi
            ;;
        *)
            log_error "Unsupported HTTP method: $method"
            return 1
            ;;
    esac
}

# Función para verificar salud de la aplicación
check_app_health() {
    local app_url="${APP_URL:-}"
    local max_attempts="${HEALTH_CHECK_MAX_ATTEMPTS:-10}"
    local attempt=1

    if [ -z "$app_url" ]; then
        log_warning "APP_URL not set, skipping health check"
        return 0
    fi

    log_info "Checking application health at $app_url"

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"

        if curl -f -s "$app_url/api/health" | grep -q '"status":"ok"'; then
            log_success "Application is healthy"
            return 0
        fi

        log_info "Waiting 10 seconds before next attempt..."
        sleep 10
        attempt=$((attempt + 1))
    done

    log_error "Application health check failed after $max_attempts attempts"
    return 1
}

# Función para obtener deployments recientes
get_recent_deployments() {
    log_info "Fetching recent deployments..."

    local response=$(call_coolify_api "GET" "applications/${COOLIFY_APPLICATION_ID}/deployments")

    if [ $? -eq 0 ]; then
        if command -v jq &> /dev/null; then
            echo "$response" | jq '.data | sort_by(.created_at) | reverse | .[0:5]'
        else
            echo "$response"
        fi
    else
        log_error "Failed to fetch deployments"
        return 1
    fi
}

# Función para obtener último deployment exitoso
get_last_successful_deployment() {
    log_info "Finding last successful deployment..."

    local response=$(call_coolify_api "GET" "applications/${COOLIFY_APPLICATION_ID}/deployments?status=successful&limit=1")

    if [ $? -eq 0 ]; then
        if command -v jq &> /dev/null; then
            local deployment_id=$(echo "$response" | jq -r '.data[0].uuid // empty')
            if [ -n "$deployment_id" ] && [ "$deployment_id" != "null" ]; then
                echo "$deployment_id"
                return 0
            fi
        else
            # Fallback sin jq
            echo "$response" | grep -o '"uuid":"[^"]*"' | head -1 | cut -d'"' -f4
            return 0
        fi
    fi

    log_error "No successful deployment found"
    return 1
}

# Función para ejecutar rollback
execute_rollback() {
    local target_deployment="$1"
    local reason="$2"

    log_info "Executing rollback to deployment: $target_deployment"
    log_info "Reason: $reason"

    local rollback_data=$(cat <<EOF
{
    "deployment_uuid": "$target_deployment",
    "rollback_reason": "$reason",
    "initiated_by": "rollback-script",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF
)

    local response=$(call_coolify_api "POST" "applications/${COOLIFY_APPLICATION_ID}/rollback" "$rollback_data")

    if [ $? -eq 0 ]; then
        log_success "Rollback request submitted successfully"

        if command -v jq &> /dev/null; then
            local task_id=$(echo "$response" | jq -r '.data.uuid // empty')
            if [ -n "$task_id" ] && [ "$task_id" != "null" ]; then
                log_info "Rollback task ID: $task_id"
                monitor_rollback "$task_id"
            fi
        fi

        return 0
    else
        log_error "Failed to execute rollback"
        return 1
    fi
}

# Función para monitorear rollback
monitor_rollback() {
    local task_id="$1"
    local max_wait_time="${ROLLBACK_MAX_WAIT_TIME:-300}" # 5 minutos
    local check_interval="${ROLLBACK_CHECK_INTERVAL:-10}"
    local elapsed_time=0

    log_info "Monitoring rollback task: $task_id"

    while [ $elapsed_time -lt $max_wait_time ]; do
        local response=$(call_coolify_api "GET" "tasks/$task_id")

        if [ $? -eq 0 ]; then
            if command -v jq &> /dev/null; then
                local status=$(echo "$response" | jq -r '.data.status // unknown')
                local progress=$(echo "$response" | jq -r '.data.progress // 0')

                log_info "Rollback status: $status (Progress: $progress%)"

                case "$status" in
                    "finished"|"success")
                        log_success "🎉 Rollback completed successfully!"
                        return 0
                        ;;
                    "failed"|"error")
                        log_error "❌ Rollback failed!"
                        return 1
                        ;;
                    "running"|"in_progress")
                        log_info "Rollback in progress..."
                        ;;
                    *)
                        log_warning "Unknown rollback status: $status"
                        ;;
                esac
            else
                log_info "Rollback is in progress... (elapsed: ${elapsed_time}s)"
            fi
        fi

        sleep $check_interval
        elapsed_time=$((elapsed_time + check_interval))
    done

    log_warning "Rollback monitoring timeout after ${max_wait_time}s"
    return 2
}

# Función para crear backup antes del rollback
create_backup() {
    if [ "$BACKUP_ENABLED" != "true" ]; then
        log_info "Backup is disabled, skipping..."
        return 0
    fi

    log_info "Creating backup before rollback..."

    local backup_name="rollback-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_data=$(cat <<EOF
{
    "name": "$backup_name",
    "type": "rollback_backup",
    "reason": "Automatic backup before rollback",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF
)

    local response=$(call_coolify_api "POST" "applications/${COOLIFY_APPLICATION_ID}/backups" "$backup_data")

    if [ $? -eq 0 ]; then
        log_success "Backup created: $backup_name"
        return 0
    else
        log_warning "Failed to create backup, proceeding with rollback anyway"
        return 0
    fi
}

# Función de notificación
send_notification() {
    if [ "$NOTIFICATION_ENABLED" != "true" ]; then
        return 0
    fi

    local message="$1"
    local status="$2" # success, warning, error

    log_info "Sending notification: $message"

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        case "$status" in
            "error") color="danger" ;;
            "warning") color="warning" ;;
        esac

        local slack_payload=$(cat <<EOF
{
    "text": "🔄 Coolify Rollback - En las Nubes",
    "attachments": [
        {
            "color": "$color",
            "fields": [
                {
                    "title": "Status",
                    "value": "$message",
                    "short": false
                },
                {
                    "title": "Application",
                    "value": "En las Nubes Restobar",
                    "short": true
                },
                {
                    "title": "Time",
                    "value": "$(date)",
                    "short": true
                }
            ]
        }
    ]
}
EOF
)

        curl -s -X POST -H 'Content-type: application/json' \
            --data "$slack_payload" \
            "$SLACK_WEBHOOK_URL" > /dev/null
    fi

    # Email notification (si está configurado)
    if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "🔄 Coolify Rollback - En las Nubes" "$NOTIFICATION_EMAIL"
    fi
}

# Función de rollback automático
auto_rollback() {
    local reason="$1"

    log_info "Starting automatic rollback..."
    log_info "Reason: $reason"

    # Verificar que el rollback no ha sido ejecutado recientemente
    local lock_file="/tmp/coolify-rollback.lock"
    if [ -f "$lock_file" ]; then
        local lock_time=$(cat "$lock_file")
        local current_time=$(date +%s)
        if [ $((current_time - lock_time)) -lt 300 ]; then
            log_warning "Rollback was executed recently (within 5 minutes), skipping..."
            return 1
        fi
    fi

    # Crear lock file
    date +%s > "$lock_file"

    # Crear backup
    create_backup

    # Encontrar último deployment exitoso
    local last_successful=$(get_last_successful_deployment)
    if [ $? -ne 0 ]; then
        log_error "Cannot find a successful deployment to rollback to"
        send_notification "Rollback failed: No successful deployment found" "error"
        return 1
    fi

    log_info "Found last successful deployment: $last_successful"

    # Ejecutar rollback
    if execute_rollback "$last_successful" "$reason"; then
        log_success "Rollback executed successfully"
        send_notification "Rollback completed successfully to deployment $last_successful" "success"

        # Esperar y verificar salud
        log_info "Waiting for application to be healthy after rollback..."
        sleep 30

        if check_app_health; then
            log_success "Application is healthy after rollback"
            send_notification "Application is healthy after rollback" "success"
        else
            log_warning "Application is still unhealthy after rollback"
            send_notification "Application still unhealthy after rollback" "warning"
        fi
    else
        log_error "Rollback failed"
        send_notification "Rollback failed" "error"
        return 1
    fi

    # Limpiar lock file
    rm -f "$lock_file"

    return 0
}

# Función de rollback manual
manual_rollback() {
    local deployment_id="$1"
    local reason="$2"

    if [ -z "$deployment_id" ]; then
        log_error "Deployment ID is required for manual rollback"
        return 1
    fi

    log_info "Starting manual rollback to deployment: $deployment_id"

    # Crear backup
    create_backup

    # Ejecutar rollback
    if execute_rollback "$deployment_id" "$reason"; then
        log_success "Manual rollback executed successfully"
        send_notification "Manual rollback completed to deployment $deployment_id" "success"
    else
        log_error "Manual rollback failed"
        send_notification "Manual rollback failed" "error"
        return 1
    fi
}

# Función de ayuda
show_help() {
    echo "Coolify Rollback Script for En las Nubes Restobar"
    echo "=================================================="
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  auto [reason]           - Execute automatic rollback to last successful deployment"
    echo "  manual <deployment_id> [reason] - Execute manual rollback to specific deployment"
    echo "  health                  - Check application health"
    echo "  deployments             - Show recent deployments"
    echo "  last-successful         - Show last successful deployment"
    echo "  help                    - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  COOLIFY_SERVER_URL      - Coolify server URL"
    echo "  COOLIFY_API_KEY         - Coolify API key"
    echo "  COOLIFY_APPLICATION_ID  - Application ID in Coolify"
    echo "  APP_URL                 - Application URL for health checks"
    echo "  SLACK_WEBHOOK_URL       - Slack webhook for notifications"
    echo "  NOTIFICATION_EMAIL      - Email for notifications"
    echo "  BACKUP_ENABLED          - Enable backups before rollback (default: true)"
    echo "  NOTIFICATION_ENABLED    - Enable notifications (default: true)"
    echo ""
    echo "Examples:"
    echo "  $0 auto \"Health check failed\""
    echo "  $0 manual abc123-def456 \"Manual rollback requested\""
    echo "  $0 health"
}

# Función principal
main() {
    echo "🔄 Coolify Rollback Script"
    echo "=========================="
    echo "En las Nubes Restobar - Rollback Management"
    echo ""

    # Verificar dependencias
    check_dependencies

    # Procesar comandos
    case "${1:-help}" in
        "auto")
            local reason="${2:-Automatic rollback due to deployment failure}"
            auto_rollback "$reason"
            ;;
        "manual")
            if [ -z "$2" ]; then
                log_error "Deployment ID is required for manual rollback"
                show_help
                exit 1
            fi
            local deployment_id="$2"
            local reason="${3:-Manual rollback requested}"
            manual_rollback "$deployment_id" "$reason"
            ;;
        "health")
            check_app_health
            ;;
        "deployments")
            get_recent_deployments
            ;;
        "last-successful")
            get_last_successful_deployment
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar script
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi