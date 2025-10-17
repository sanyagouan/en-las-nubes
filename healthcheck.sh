#!/bin/sh
# Health check script para Coolify VPS
# En las Nubes Restobar - Monitoreo de salud del servicio

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1${NC}"
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1${NC}"
}

# Variables de configuración
HOST=${NGINX_HOST:-localhost}
PORT=${NGINX_PORT:-80}
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-10}
RETRY_DELAY=${HEALTH_CHECK_RETRY_DELAY:-2}
MAX_RETRIES=${HEALTH_CHECK_MAX_RETRIES:-3}

# Función principal de health check
check_health() {
    local retry_count=0

    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "Health check attempt $((retry_count + 1))/$MAX_RETRIES"

        # Verificar que nginx está corriendo
        if ! pgrep nginx > /dev/null; then
            log_error "Nginx process not running"
            return 1
        fi

        # Verificar que el puerto está escuchando
        if ! netstat -tlnp | grep ":$PORT " > /dev/null; then
            log_error "Port $PORT is not listening"
            return 1
        fi

        # Verificar endpoint de salud HTTP
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time $TIMEOUT \
            --connect-timeout $TIMEOUT \
            "http://localhost:$PORT/api/health" || echo "000")

        case $response_code in
            200)
                log_success "Health endpoint returned 200 OK"

                # Verificación adicional: contenido del response
                local response_body=$(curl -s --max-time $TIMEOUT \
                    "http://localhost:$PORT/api/health" || echo "")

                if echo "$response_body" | grep -q '"status":"ok"'; then
                    log_success "Health check passed - All services healthy"

                    # Verificación de archivos críticos
                    check_critical_files

                    return 0
                else
                    log_error "Health endpoint returned invalid response: $response_body"
                    return 1
                fi
                ;;
            000)
                log_error "Failed to connect to health endpoint"
                ;;
            5*)
                log_error "Server error (5xx) from health endpoint: $response_code"
                ;;
            4*)
                log_error "Client error (4xx) from health endpoint: $response_code"
                ;;
            *)
                log_error "Unexpected response code from health endpoint: $response_code"
                ;;
        esac

        retry_count=$((retry_count + 1))

        if [ $retry_count -lt $MAX_RETRIES ]; then
            log "Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    done

    log_error "Health check failed after $MAX_RETRIES attempts"
    return 1
}

# Verificar archivos críticos del sistema
check_critical_files() {
    local critical_files="/usr/share/nginx/html/index.html /etc/nginx/nginx.conf"
    local missing_files=0

    for file in $critical_files; do
        if [ ! -f "$file" ]; then
            log_error "Critical file missing: $file"
            missing_files=$((missing_files + 1))
        fi
    done

    if [ $missing_files -gt 0 ]; then
        log_error "$missing_files critical files are missing"
        return 1
    fi

    log_success "All critical files present"
    return 0
}

# Verificar uso de recursos
check_resources() {
    # Verificar uso de memoria
    local memory_usage=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2}')
    local memory_threshold=${MEMORY_THRESHOLD:-80}

    if (( $(echo "$memory_usage > $memory_threshold" | bc -l) )); then
        log_warning "High memory usage: ${memory_usage}% (threshold: ${memory_threshold}%)"
    fi

    # Verificar uso de CPU
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_threshold=${CPU_THRESHOLD:-2.0}

    if (( $(echo "$cpu_load > $cpu_threshold" | bc -l) )); then
        log_warning "High CPU load: $cpu_load (threshold: $cpu_threshold)"
    fi

    # Verificar espacio en disco
    local disk_usage=$(df /usr/share/nginx/html | awk 'NR==2{print $5}' | sed 's/%//')
    local disk_threshold=${DISK_THRESHOLD:-85}

    if [ "$disk_usage" -gt "$disk_threshold" ]; then
        log_warning "High disk usage: ${disk_usage}% (threshold: ${disk_threshold}%)"
    fi
}

# Verificar conectividad con APIs externas
check_external_apis() {
    local apis="${EXTERNAL_API_CHECKS:-}"

    if [ -n "$apis" ]; then
        for api in $apis; do
            log "Checking external API: $api"
            local api_response=$(curl -s -o /dev/null -w "%{http_code}" \
                --max-time 5 --connect-timeout 5 "$api" || echo "000")

            case $api_response in
                200)
                    log_success "External API $api is responding"
                    ;;
                000)
                    log_warning "Cannot connect to external API: $api"
                    ;;
                *)
                    log_warning "External API $api returned: $api_response"
                    ;;
            esac
        done
    fi
}

# Verificar estado del Service Worker (solo si está habilitado)
check_service_worker() {
    if [ "$PWA_ENABLED" = "true" ]; then
        local sw_response=$(curl -s -o /dev/null -w "%{http_code}" \
            "http://localhost:$PORT/sw.js" || echo "000")

        case $sw_response in
            200)
                log_success "Service Worker is accessible"
                ;;
            *)
                log_warning "Service Worker not accessible (HTTP $sw_response)"
                ;;
        esac
    fi
}

# Ejecutar checks extendidos si está habilitado
if [ "$EXTENDED_HEALTH_CHECK" = "true" ]; then
    log "Running extended health checks..."
    check_resources
    check_external_apis
    check_service_worker
fi

# Ejecutar health check principal
if check_health; then
    log_success "All health checks passed successfully"
    exit 0
else
    log_error "Health check failed"
    exit 1
fi