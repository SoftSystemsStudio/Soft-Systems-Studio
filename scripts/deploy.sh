#!/bin/bash
set -euo pipefail

# ==============================================================================
# Safe Deploy Script for Soft Systems Studio
# ==============================================================================
# Usage: ./scripts/deploy.sh [staging|production]
#
# This script ensures safe deployments with:
# - Pre-deploy checks (env validation, placeholder scan)
# - Database migration with confirmation
# - Post-deploy health checks
# - Rollback instructions on failure
# ==============================================================================

ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==============================================================================
# Pre-deploy Checks
# ==============================================================================

pre_deploy_checks() {
    log_info "Running pre-deploy checks for $ENVIRONMENT..."

    # 1. Check NODE_ENV matches deployment target
    if [[ "$ENVIRONMENT" == "production" && "${NODE_ENV:-}" != "production" ]]; then
        log_warn "NODE_ENV is not set to 'production'. Current: ${NODE_ENV:-unset}"
    fi

    # 2. Scan for placeholder secrets
    log_info "Scanning for placeholder secrets..."
    if ! node "$ROOT_DIR/scripts/scan-placeholders.js"; then
        log_error "Placeholder secrets detected! Fix before deploying."
        exit 1
    fi
    log_success "No placeholder secrets found"

    # 3. Check for committed .env files
    log_info "Checking for committed .env files..."
    if ! node "$ROOT_DIR/scripts/check-env-committed.js"; then
        log_error ".env files may be committed! Fix before deploying."
        exit 1
    fi
    log_success "No .env files committed"

    # 4. Run typecheck
    log_info "Running TypeScript typecheck..."
    if ! pnpm typecheck; then
        log_error "TypeScript errors detected! Fix before deploying."
        exit 1
    fi
    log_success "TypeScript check passed"

    # 5. Run tests
    log_info "Running tests..."
    if ! pnpm test; then
        log_error "Tests failed! Fix before deploying."
        exit 1
    fi
    log_success "All tests passed"

    # 6. Build check
    log_info "Building application..."
    if ! pnpm build; then
        log_error "Build failed! Fix before deploying."
        exit 1
    fi
    log_success "Build successful"

    log_success "All pre-deploy checks passed!"
}

# ==============================================================================
# Database Migration
# ==============================================================================

run_migrations() {
    log_info "Checking for pending database migrations..."
    
    cd "$ROOT_DIR/apps/agent-api"
    
    # Check if there are pending migrations
    PENDING=$(pnpm prisma migrate status 2>&1 || true)
    
    if echo "$PENDING" | grep -q "Database schema is up to date"; then
        log_success "Database is up to date. No migrations needed."
        return 0
    fi
    
    log_warn "Pending migrations detected:"
    echo "$PENDING"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo ""
        log_warn "⚠️  You are about to run migrations on PRODUCTION!"
        echo ""
        read -p "Type 'yes-migrate-production' to confirm: " CONFIRM
        if [[ "$CONFIRM" != "yes-migrate-production" ]]; then
            log_error "Migration cancelled by user."
            exit 1
        fi
    else
        read -p "Run migrations on $ENVIRONMENT? (y/N): " CONFIRM
        if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
            log_warn "Migrations skipped by user."
            return 0
        fi
    fi
    
    log_info "Running database migrations..."
    if ! pnpm migrate:$ENVIRONMENT; then
        log_error "Migration failed! Check database logs."
        log_warn "Rollback may be required. Check Prisma migration history."
        exit 1
    fi
    
    log_success "Migrations completed successfully!"
    cd "$ROOT_DIR"
}

# ==============================================================================
# Deploy
# ==============================================================================

deploy() {
    log_info "Deploying to $ENVIRONMENT..."
    
    # Add your deployment commands here based on your platform
    # Examples:
    
    # Railway
    # if command -v railway &> /dev/null; then
    #     railway deploy --environment "$ENVIRONMENT"
    # fi
    
    # Fly.io
    # if command -v fly &> /dev/null; then
    #     fly deploy --config "fly.$ENVIRONMENT.toml"
    # fi
    
    # Docker
    # docker compose -f "docker-compose.$ENVIRONMENT.yml" up -d --build
    
    # Kubernetes
    # kubectl apply -f "k8s/$ENVIRONMENT/"
    
    log_warn "TODO: Add your deployment commands to scripts/deploy.sh"
    log_success "Deployment step completed"
}

# ==============================================================================
# Post-deploy Health Check
# ==============================================================================

health_check() {
    log_info "Running post-deploy health checks..."
    
    # Set the URL based on environment
    case "$ENVIRONMENT" in
        staging)
            HEALTH_URL="${STAGING_URL:-http://localhost:5000}/health"
            STATUS_URL="${STAGING_URL:-http://localhost:5000}/status"
            ;;
        production)
            HEALTH_URL="${PRODUCTION_URL:-http://localhost:5000}/health"
            STATUS_URL="${PRODUCTION_URL:-http://localhost:5000}/status"
            ;;
        *)
            HEALTH_URL="http://localhost:5000/health"
            STATUS_URL="http://localhost:5000/status"
            ;;
    esac
    
    # Wait for service to be ready (max 60 seconds)
    MAX_RETRIES=12
    RETRY_INTERVAL=5
    
    log_info "Waiting for service to be healthy at $HEALTH_URL..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
            log_success "Health check passed!"
            
            # Get status details
            log_info "Fetching status from $STATUS_URL..."
            STATUS=$(curl -s "$STATUS_URL" 2>/dev/null || echo '{"error": "status endpoint unavailable"}')
            echo "$STATUS" | jq '.' 2>/dev/null || echo "$STATUS"
            
            return 0
        fi
        
        log_warn "Health check attempt $i/$MAX_RETRIES failed. Retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    
    log_error "Health check failed after $MAX_RETRIES attempts!"
    log_error "Consider rolling back the deployment."
    exit 1
}

# ==============================================================================
# Notify
# ==============================================================================

notify_deployment() {
    local STATUS="$1"
    
    log_info "Sending deployment notification..."
    
    # Slack webhook notification (if configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")
        DEPLOYER=$(git config user.name 2>/dev/null || whoami)
        
        if [[ "$STATUS" == "success" ]]; then
            COLOR="good"
            EMOJI="✅"
        else
            COLOR="danger"
            EMOJI="❌"
        fi
        
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$COLOR\",
                    \"title\": \"$EMOJI Deployment to $ENVIRONMENT: $STATUS\",
                    \"fields\": [
                        {\"title\": \"Commit\", \"value\": \"$COMMIT_SHA\", \"short\": true},
                        {\"title\": \"Deployer\", \"value\": \"$DEPLOYER\", \"short\": true},
                        {\"title\": \"Message\", \"value\": \"$COMMIT_MSG\", \"short\": false}
                    ]
                }]
            }" > /dev/null
            
        log_success "Slack notification sent"
    else
        log_warn "SLACK_WEBHOOK_URL not set, skipping notification"
    fi
}

# ==============================================================================
# Main
# ==============================================================================

main() {
    echo ""
    echo "=============================================="
    echo "  Soft Systems Studio - Safe Deploy"
    echo "  Environment: $ENVIRONMENT"
    echo "=============================================="
    echo ""
    
    # Validate environment
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Usage: $0 [staging|production]"
        exit 1
    fi
    
    # Production confirmation
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo ""
        log_warn "⚠️  PRODUCTION DEPLOYMENT ⚠️"
        echo ""
        read -p "Are you sure you want to deploy to production? (y/N): " CONFIRM
        if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
            log_info "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Run deployment pipeline
    pre_deploy_checks
    run_migrations
    deploy
    health_check
    notify_deployment "success"
    
    echo ""
    log_success "🎉 Deployment to $ENVIRONMENT completed successfully!"
    echo ""
}

# Handle errors
trap 'log_error "Deployment failed!"; notify_deployment "failure"; exit 1' ERR

main "$@"
