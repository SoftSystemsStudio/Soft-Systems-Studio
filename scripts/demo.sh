#!/bin/bash

# ============================================
# Soft Systems Studio - Demo Setup Script
# ============================================
# This script automates the complete demo setup process:
# - Prerequisites check
# - Dependency installation
# - Infrastructure startup
# - Database initialization
# - API server launch
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_PORT="${PORT:-5000}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ============================================
# Helper Functions
# ============================================

print_header() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║                                                                ║"
  echo "║           Soft Systems Studio - Demo Setup                    ║"
  echo "║                                                                ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_step() {
  echo -e "\n${BLUE}━━━ $1${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "$1 is not installed"
    return 1
  fi
  print_success "$1 is installed"
  return 0
}

wait_for_service() {
  local service_name=$1
  local url=$2
  local max_attempts=30
  local attempt=0

  print_info "Waiting for $service_name to be ready..."
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "$url" > /dev/null 2>&1; then
      print_success "$service_name is ready"
      return 0
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
  done

  print_error "$service_name failed to start"
  return 1
}

# ============================================
# Main Steps
# ============================================

step1_check_prerequisites() {
  print_step "Step 1: Checking Prerequisites"
  
  local all_good=true
  
  # Check Node.js
  if check_command "node"; then
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 22 ]; then
      print_warning "Node.js version $node_version detected. Version 22+ recommended."
      all_good=false
    fi
  else
    all_good=false
  fi
  
  # Check Docker
  if ! check_command "docker"; then
    all_good=false
  fi
  
  # Check Docker Compose
  if ! check_command "docker-compose" && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    all_good=false
  else
    print_success "Docker Compose is installed"
  fi
  
  # Check corepack
  if ! check_command "corepack"; then
    print_warning "Corepack not found. Enabling..."
    corepack enable || {
      print_error "Failed to enable corepack"
      all_good=false
    }
  fi
  
  if [ "$all_good" = false ]; then
    print_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
  fi
  
  print_success "All prerequisites met"
}

step2_setup_environment() {
  print_step "Step 2: Environment Configuration"
  
  cd "$PROJECT_ROOT"
  
  # Copy root .env if needed
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      print_success "Created .env from .env.example"
    else
      print_warning "No .env.example found, skipping root .env"
    fi
  else
    print_info ".env already exists"
  fi
  
  # Copy agent-api .env if needed
  if [ ! -f "apps/agent-api/.env" ]; then
    if [ -f "apps/agent-api/.env.example" ]; then
      cp apps/agent-api/.env.example apps/agent-api/.env
      print_success "Created apps/agent-api/.env from example"
      
      # Generate JWT secret if not set
      if ! grep -q "JWT_SECRET=" apps/agent-api/.env || grep -q "JWT_SECRET=your-secret-key-here" apps/agent-api/.env; then
        JWT_SECRET=$(openssl rand -base64 32)
        if grep -q "JWT_SECRET=" apps/agent-api/.env; then
          sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/agent-api/.env && rm apps/agent-api/.env.bak
        else
          echo "JWT_SECRET=$JWT_SECRET" >> apps/agent-api/.env
        fi
        print_success "Generated JWT_SECRET"
      fi
    else
      print_warning "No .env.example found in apps/agent-api"
    fi
  else
    print_info "apps/agent-api/.env already exists"
  fi
  
  print_warning "Note: For full functionality, you'll need to add your OPENAI_API_KEY to apps/agent-api/.env"
}

step3_install_dependencies() {
  print_step "Step 3: Installing Dependencies"
  
  cd "$PROJECT_ROOT"
  
  print_info "Running: pnpm install"
  pnpm install || {
    print_error "Failed to install dependencies"
    exit 1
  }
  
  print_success "Dependencies installed"
}

step4_start_infrastructure() {
  print_step "Step 4: Starting Infrastructure Services"
  
  cd "$PROJECT_ROOT"
  
  # Check if docker-compose file exists
  if [ -f "infra/docker-compose.yml" ]; then
    print_info "Starting Postgres, Redis, and Qdrant..."
    docker compose -f infra/docker-compose.yml up -d || {
      print_error "Failed to start infrastructure services"
      exit 1
    }
  elif [ -f "docker-compose.yml" ]; then
    print_info "Starting services from root docker-compose.yml..."
    docker compose up -d db redis qdrant 2>/dev/null || docker compose up -d || {
      print_error "Failed to start infrastructure services"
      exit 1
    }
  else
    print_error "No docker-compose.yml found"
    exit 1
  fi
  
  # Wait for services
  sleep 5
  wait_for_service "PostgreSQL" "postgresql://postgres:password@localhost:5432/softsystems" || true
  print_success "Infrastructure services started"
}

step5_setup_database() {
  print_step "Step 5: Database Setup"
  
  cd "$PROJECT_ROOT"
  
  print_info "Generating Prisma client..."
  pnpm --filter apps-agent-api prisma:generate || {
    print_error "Failed to generate Prisma client"
    exit 1
  }
  
  print_info "Running database migrations..."
  pnpm --filter apps-agent-api migrate:dev --name init || {
    print_warning "Migration failed or already applied"
  }
  
  print_info "Seeding demo data..."
  pnpm --filter apps-agent-api seed || {
    print_warning "Seed failed (may already be seeded)"
  }
  
  print_success "Database setup complete"
}

step6_build_project() {
  print_step "Step 6: Building Project"
  
  cd "$PROJECT_ROOT"
  
  print_info "Building all packages..."
  pnpm build || {
    print_error "Build failed"
    exit 1
  }
  
  print_success "Build complete"
}

step7_start_api() {
  print_step "Step 7: Starting API Server"
  
  cd "$PROJECT_ROOT"
  
  print_info "Starting API server in background..."
  
  # Kill existing process on port if any
  lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
  
  # Start API in background
  pnpm --filter apps-agent-api start > /tmp/soft-systems-api.log 2>&1 &
  API_PID=$!
  
  echo $API_PID > /tmp/soft-systems-api.pid
  
  # Wait for API to be ready
  if wait_for_service "API Server" "http://localhost:$API_PORT/health"; then
    print_success "API server started (PID: $API_PID)"
    return 0
  else
    print_error "API server failed to start. Check logs: /tmp/soft-systems-api.log"
    return 1
  fi
}

step8_print_summary() {
  print_step "Demo Setup Complete! 🎉"
  
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║                    Setup Successful!                           ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  echo -e "\n${BLUE}📍 Service URLs:${NC}"
  echo "   API Server:       http://localhost:$API_PORT"
  echo "   Health Check:     http://localhost:$API_PORT/health"
  echo "   Metrics:          http://localhost:$API_PORT/metrics"
  echo "   PostgreSQL:       localhost:5432"
  echo "   Redis:            localhost:6379"
  echo "   Qdrant:           http://localhost:6333"
  
  echo -e "\n${BLUE}🔐 Demo Credentials:${NC}"
  echo "   Email:            demo@example.com"
  echo "   Password:         SecurePass123!"
  echo "   Workspace ID:     demo"
  echo ""
  echo "   Admin Email:      admin@example.com"
  echo "   Admin Password:   SecurePass123!"
  
  echo -e "\n${BLUE}🧪 Test the API:${NC}"
  echo "   # Health check"
  echo "   curl http://localhost:$API_PORT/health"
  echo ""
  echo "   # Login"
  echo "   curl -X POST http://localhost:$API_PORT/api/v1/auth/login \\"
  echo "     -H \"Content-Type: application/json\" \\"
  echo "     -d '{\"email\":\"demo@example.com\",\"password\":\"SecurePass123!\"}'"
  
  echo -e "\n${BLUE}📚 Documentation:${NC}"
  echo "   Demo Guide:       docs/DEMO.md"
  echo "   API Reference:    docs/API.md"
  echo "   Architecture:     docs/ARCHITECTURE.md"
  
  echo -e "\n${BLUE}🛠️  Management:${NC}"
  echo "   View logs:        tail -f /tmp/soft-systems-api.log"
  echo "   Stop API:         kill \$(cat /tmp/soft-systems-api.pid)"
  echo "   Stop services:    docker compose -f infra/docker-compose.yml down"
  
  echo -e "\n${YELLOW}⚠️  Important:${NC}"
  echo "   Add your OPENAI_API_KEY to apps/agent-api/.env for full AI functionality"
  
  echo ""
}

# ============================================
# Error Handler
# ============================================

cleanup_on_error() {
  print_error "Setup failed. Cleaning up..."
  
  # Stop API if started
  if [ -f /tmp/soft-systems-api.pid ]; then
    kill $(cat /tmp/soft-systems-api.pid) 2>/dev/null || true
    rm /tmp/soft-systems-api.pid
  fi
  
  exit 1
}

trap cleanup_on_error ERR

# ============================================
# Main Execution
# ============================================

main() {
  print_header
  
  step1_check_prerequisites
  step2_setup_environment
  step3_install_dependencies
  step4_start_infrastructure
  step5_setup_database
  step6_build_project
  step7_start_api
  step8_print_summary
}

# Run main function
main
