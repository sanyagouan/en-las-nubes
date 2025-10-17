#!/bin/bash
# Script de despliegue local para testing antes de Coolify
# En las Nubes Restobar - Validación local de despliegue

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
PROJECT_NAME="enlasnubes"
CONTAINER_NAME="${PROJECT_NAME}-test"
IMAGE_NAME="${PROJECT_NAME}:test"
HOST_PORT="8080"
CONTAINER_PORT="80"

# Función de limpieza
cleanup() {
    log_info "Cleaning up..."

    # Detener y eliminar contenedor si existe
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log_info "Stopping existing container..."
        docker stop "$CONTAINER_NAME"
    fi

    if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        log_info "Removing existing container..."
        docker rm "$CONTAINER_NAME"
    fi

    # Eliminar imagen si existe
    if docker images -q "$IMAGE_NAME" | grep -q .; then
        log_info "Removing existing image..."
        docker rmi "$IMAGE_NAME" 2>/dev/null || true
    fi

    log_success "Cleanup completed"
}

# Función de verificación de Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    log_success "Docker is ready"
}

# Función de verificación de archivos
check_files() {
    local required_files=("Dockerfile" "nginx.conf" "healthcheck.sh" "package.json")
    local missing_files=0

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file missing: $file"
            missing_files=$((missing_files + 1))
        fi
    done

    if [ $missing_files -gt 0 ]; then
        log_error "$missing_files required files are missing"
        exit 1
    fi

    log_success "All required files are present"
}

# Función de build
build_image() {
    log_info "Building Docker image..."

    docker build \
        --tag "$IMAGE_NAME" \
        --build-arg NODE_ENV=production \
        --build-arg VITE_APP_VERSION="local-test-$(date +%s)" \
        . || {
        log_error "Docker build failed"
        exit 1
    }

    log_success "Docker image built successfully"
}

# Función de ejecución
run_container() {
    log_info "Running container..."

    # Mapear puerto y variables de entorno
    docker run -d \
        --name "$CONTAINER_NAME" \
        --publish "$HOST_PORT:$CONTAINER_PORT" \
        --env NODE_ENV=production \
        --env NGINX_HOST="localhost" \
        --env NGINX_PORT="$CONTAINER_PORT" \
        --env EXTENDED_HEALTH_CHECK=true \
        --memory="256m" \
        --cpus="0.5" \
        "$IMAGE_NAME" || {
        log_error "Failed to start container"
        exit 1
    }

    log_success "Container started successfully"
    log_info "Container name: $CONTAINER_NAME"
    log_info "URL: http://localhost:$HOST_PORT"
}

# Función de espera
wait_for_container() {
    log_info "Waiting for container to be ready..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:$HOST_PORT/api/health" > /dev/null 2>&1; then
            log_success "Container is ready!"
            return 0
        fi

        log_info "Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "Container failed to start within $max_attempts attempts"
    docker logs "$CONTAINER_NAME"
    return 1
}

# Función de testing
run_tests() {
    log_info "Running deployment tests..."

    local failed_tests=0

    # Test 1: Health check endpoint
    log_info "Test 1: Health check endpoint"
    if curl -f -s "http://localhost:$HOST_PORT/api/health" | grep -q '"status":"ok"'; then
        log_success "✅ Health check endpoint working"
    else
        log_error "❌ Health check endpoint failed"
        failed_tests=$((failed_tests + 1))
    fi

    # Test 2: Main page
    log_info "Test 2: Main page accessibility"
    if curl -f -s -I "http://localhost:$HOST_PORT/" | grep -q "200 OK"; then
        log_success "✅ Main page accessible"
    else
        log_error "❌ Main page not accessible"
        failed_tests=$((failed_tests + 1))
    fi

    # Test 3: Service Worker
    log_info "Test 3: Service Worker"
    if curl -f -s "http://localhost:$HOST_PORT/sw.js" | grep -q "serviceWorker"; then
        log_success "✅ Service Worker accessible"
    else
        log_warning "⚠️ Service Worker not found or invalid"
    fi

    # Test 4: PWA Manifest
    log_info "Test 4: PWA Manifest"
    if curl -f -s "http://localhost:$HOST_PORT/manifest.json" | grep -q "En las Nubes"; then
        log_success "✅ PWA Manifest accessible"
    else
        log_warning "⚠️ PWA Manifest not found or invalid"
    fi

    # Test 5: Static assets
    log_info "Test 5: Static assets"
    local css_file="assets/main.css"
    if curl -f -s -I "http://localhost:$HOST_PORT/$css_file" | grep -q "200 OK"; then
        log_success "✅ CSS assets accessible"
    else
        log_warning "⚠️ CSS assets not accessible"
    fi

    # Test 6: Performance check
    log_info "Test 6: Performance check"
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:$HOST_PORT/")
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_success "✅ Response time acceptable: ${response_time}s"
    else
        log_warning "⚠️ Slow response time: ${response_time}s"
    fi

    # Test 7: Headers check
    log_info "Test 7: Security headers"
    local headers=$(curl -s -I "http://localhost:$HOST_PORT/")
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        log_success "✅ Security headers present"
    else
        log_warning "⚠️ Some security headers missing"
    fi

    if [ $failed_tests -eq 0 ]; then
        log_success "🎉 All critical tests passed!"
        return 0
    else
        log_error "$failed_tests tests failed"
        return 1
    fi
}

# Función de logs
show_logs() {
    log_info "Container logs:"
    echo "========================"
    docker logs "$CONTAINER_NAME"
    echo "========================"
}

# Función de monitor
monitor_container() {
    log_info "Monitoring container... (Press Ctrl+C to stop)"

    # Mostrar uso de recursos
    while true; do
        clear
        echo "🔍 Container Monitor - $CONTAINER_NAME"
        echo "======================================"
        echo "URL: http://localhost:$HOST_PORT"
        echo "Time: $(date)"
        echo ""

        # Estadísticas del contenedor
        docker stats --no-stream "$CONTAINER_NAME"

        echo ""
        echo "Health check status:"
        if curl -f -s "http://localhost:$HOST_PORT/api/health" | jq -r .status 2>/dev/null || echo "checking..."; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy"
        fi

        sleep 5
    done
}

# Función de ayuda
show_help() {
    echo "Local Deployment Script for En las Nubes Restobar"
    echo "=================================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker image only"
    echo "  run       - Build and run container"
    echo "  test      - Run tests on running container"
    echo "  logs      - Show container logs"
    echo "  monitor   - Monitor container resources"
    echo "  cleanup   - Clean up containers and images"
    echo "  full      - Build, run, test and monitor"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 run     # Build and run"
    echo "  $0 test    # Run tests (container must be running)"
    echo "  $0 full    # Complete deployment test"
}

# Función principal
main() {
    echo "🚀 Local Deployment Script"
    echo "==========================="
    echo "En las Nubes Restobar - Local Testing"
    echo ""

    # Verificar Docker
    check_docker

    # Verificar archivos
    check_files

    # Procesar comandos
    case "${1:-full}" in
        "build")
            cleanup
            build_image
            ;;
        "run")
            cleanup
            build_image
            run_container
            if wait_for_container; then
                log_success "🎉 Container is running at http://localhost:$HOST_PORT"
            else
                log_error "❌ Container failed to start properly"
                show_logs
                exit 1
            fi
            ;;
        "test")
            if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
                log_error "Container is not running. Run '$0 run' first."
                exit 1
            fi
            if run_tests; then
                log_success "🎉 All tests passed! Ready for Coolify deployment."
            else
                log_error "❌ Some tests failed. Check logs and fix issues."
                show_logs
                exit 1
            fi
            ;;
        "logs")
            if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
                log_error "Container is not running."
                exit 1
            fi
            show_logs
            ;;
        "monitor")
            if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
                log_error "Container is not running. Run '$0 run' first."
                exit 1
            fi
            monitor_container
            ;;
        "cleanup")
            cleanup
            ;;
        "full")
            cleanup
            build_image
            run_container

            if wait_for_container; then
                if run_tests; then
                    log_success "🎉 Full deployment test completed successfully!"
                    log_info "Container is running at http://localhost:$HOST_PORT"
                    log_info "Ready for deployment to Coolify!"
                    echo ""
                    read -p "Press Enter to start monitoring (Ctrl+C to stop)..."
                    monitor_container
                else
                    log_error "❌ Tests failed. Check logs and fix issues."
                    show_logs
                    exit 1
                fi
            else
                log_error "❌ Container failed to start properly."
                show_logs
                exit 1
            fi
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

# Trap para limpieza
trap cleanup EXIT

# Ejecutar script
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi