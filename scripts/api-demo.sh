#!/bin/bash

# ============================================
# API Demo Script
# ============================================
# Interactive script to demonstrate key API endpoints
# Run after: ./scripts/demo.sh
# ============================================

set -e

# Configuration
API_BASE="${API_BASE:-http://localhost:5000}"
ACCESS_TOKEN=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Helper functions
print_header() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}  $1"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
  echo -e "\n${CYAN}▶ $1${NC}"
}

print_response() {
  echo -e "${GREEN}Response:${NC}"
  echo "$1" | jq . 2>/dev/null || echo "$1"
}

print_error() {
  echo -e "${RED}Error: $1${NC}"
}

wait_for_enter() {
  echo -e "\n${YELLOW}Press ENTER to continue...${NC}"
  read
}

# API calls
demo_health_check() {
  print_step "1. Health Check"
  echo "GET $API_BASE/health"
  
  response=$(curl -s "$API_BASE/health")
  print_response "$response"
  
  wait_for_enter
}

demo_register() {
  print_step "2. Register New User"
  echo "POST $API_BASE/api/v1/auth/register"
  
  timestamp=$(date +%s)
  email="demo-test-$timestamp@example.com"
  
  echo -e "${YELLOW}Creating user: $email${NC}"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"TestPass123!\",
      \"workspaceId\": \"demo\"
    }")
  
  print_response "$response"
  
  wait_for_enter
}

demo_login() {
  print_step "3. Login"
  echo "POST $API_BASE/api/v1/auth/login"
  
  echo -e "${YELLOW}Logging in as: demo@example.com${NC}"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "demo@example.com",
      "password": "SecurePass123!"
    }')
  
  print_response "$response"
  
  # Extract access token
  ACCESS_TOKEN=$(echo "$response" | jq -r '.accessToken // empty')
  
  if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "\n${GREEN}✅ Access token received and saved${NC}"
    echo -e "${CYAN}Token: ${ACCESS_TOKEN:0:20}...${NC}"
  else
    print_error "Failed to get access token"
    exit 1
  fi
  
  wait_for_enter
}

demo_agent_query() {
  print_step "4. Query Customer Service Agent"
  echo "POST $API_BASE/api/v1/agents/customer-service/run"
  
  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Not authenticated. Run login first."
    return
  fi
  
  query="What is Soft Systems Studio?"
  echo -e "${YELLOW}Query: $query${NC}"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/agents/customer-service/run" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"workspaceId\": \"demo\",
      \"agentId\": \"customer-service\",
      \"input\": {
        \"messages\": [
          {
            \"role\": \"user\",
            \"content\": \"$query\"
          }
        ]
      },
      \"stream\": false
    }")
  
  print_response "$response"
  
  wait_for_enter
}

demo_agent_followup() {
  print_step "5. Multi-Turn Conversation"
  echo "POST $API_BASE/api/v1/agents/customer-service/run"
  
  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Not authenticated. Run login first."
    return
  fi
  
  echo -e "${YELLOW}Conversation:${NC}"
  echo "User: What databases do you support?"
  echo "Agent: [previous response]"
  echo "User: How do I set up PostgreSQL?"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/agents/customer-service/run" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "workspaceId": "demo",
      "agentId": "customer-service",
      "input": {
        "messages": [
          {
            "role": "user",
            "content": "What databases do you support?"
          },
          {
            "role": "assistant",
            "content": "Soft Systems Studio supports PostgreSQL as the primary relational database, Redis for caching and queues, and Qdrant for vector similarity search."
          },
          {
            "role": "user",
            "content": "How do I set up PostgreSQL?"
          }
        ]
      },
      "stream": false
    }')
  
  print_response "$response"
  
  wait_for_enter
}

demo_document_upload() {
  print_step "6. Upload Knowledge Base Document"
  echo "POST $API_BASE/api/v1/workspaces/demo/documents"
  
  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Not authenticated. Run login first."
    return
  fi
  
  echo -e "${YELLOW}Uploading document...${NC}"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/workspaces/demo/documents" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "title": "Demo API Documentation",
      "content": "This is a sample document for the knowledge base. It demonstrates how documents are ingested asynchronously via BullMQ workers, embedded using OpenAI, and stored in Qdrant for semantic search.",
      "metadata": {
        "category": "documentation",
        "author": "Demo Script"
      }
    }')
  
  print_response "$response"
  
  # Extract document ID
  DOC_ID=$(echo "$response" | jq -r '.documentId // empty')
  
  if [ -n "$DOC_ID" ]; then
    echo -e "\n${GREEN}✅ Document queued for ingestion${NC}"
    echo -e "${CYAN}Document ID: $DOC_ID${NC}"
  fi
  
  wait_for_enter
}

demo_metrics() {
  print_step "7. View Prometheus Metrics"
  echo "GET $API_BASE/metrics"
  
  echo -e "${YELLOW}Fetching metrics (showing first 20 lines)...${NC}"
  
  response=$(curl -s "$API_BASE/metrics" | head -20)
  echo -e "${GREEN}$response${NC}"
  echo "..."
  
  wait_for_enter
}

demo_admin_stats() {
  print_step "8. Workspace Statistics (Admin)"
  echo "GET $API_BASE/api/v1/admin/workspaces/demo/stats"
  
  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Not authenticated. Run login first."
    return
  fi
  
  echo -e "${YELLOW}Note: This requires admin role${NC}"
  
  response=$(curl -s -X GET "$API_BASE/api/v1/admin/workspaces/demo/stats" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  print_response "$response"
  
  wait_for_enter
}

demo_refresh_token() {
  print_step "9. Refresh Access Token"
  echo "POST $API_BASE/api/v1/auth/refresh"
  
  echo -e "${YELLOW}Refreshing token...${NC}"
  
  response=$(curl -s -X POST "$API_BASE/api/v1/auth/refresh" \
    -H "Content-Type: application/json" \
    --cookie-jar cookies.txt \
    --cookie cookies.txt)
  
  print_response "$response"
  
  # Clean up cookie file
  rm -f cookies.txt
  
  wait_for_enter
}

demo_logout() {
  print_step "10. Logout"
  echo "POST $API_BASE/api/v1/auth/logout"
  
  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Not authenticated."
    return
  fi
  
  response=$(curl -s -X POST "$API_BASE/api/v1/auth/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  print_response "$response"
  
  ACCESS_TOKEN=""
  echo -e "\n${GREEN}✅ Logged out${NC}"
}

# Interactive menu
show_menu() {
  clear
  print_header "Soft Systems Studio - API Demo"
  echo ""
  echo "Select an endpoint to test:"
  echo ""
  echo "  ${CYAN}1${NC}) Health Check"
  echo "  ${CYAN}2${NC}) Register User"
  echo "  ${CYAN}3${NC}) Login"
  echo "  ${CYAN}4${NC}) Query Agent (Simple)"
  echo "  ${CYAN}5${NC}) Query Agent (Multi-turn)"
  echo "  ${CYAN}6${NC}) Upload Document"
  echo "  ${CYAN}7${NC}) View Metrics"
  echo "  ${CYAN}8${NC}) Workspace Stats (Admin)"
  echo "  ${CYAN}9${NC}) Refresh Token"
  echo "  ${CYAN}10${NC}) Logout"
  echo ""
  echo "  ${CYAN}A${NC}) Run All (Auto-demo)"
  echo "  ${CYAN}Q${NC}) Quit"
  echo ""
  
  if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}Status: Authenticated ✅${NC}"
  else
    echo -e "${YELLOW}Status: Not authenticated${NC}"
  fi
  
  echo ""
  echo -n "Choice: "
  read choice
  
  case $choice in
    1) demo_health_check ;;
    2) demo_register ;;
    3) demo_login ;;
    4) demo_agent_query ;;
    5) demo_agent_followup ;;
    6) demo_document_upload ;;
    7) demo_metrics ;;
    8) demo_admin_stats ;;
    9) demo_refresh_token ;;
    10) demo_logout ;;
    A|a)
      demo_health_check
      demo_login
      demo_agent_query
      demo_agent_followup
      demo_document_upload
      demo_metrics
      echo -e "\n${GREEN}✅ Auto-demo complete!${NC}"
      wait_for_enter
      ;;
    Q|q)
      echo -e "\n${BLUE}Goodbye!${NC}\n"
      exit 0
      ;;
    *)
      echo -e "\n${RED}Invalid choice${NC}"
      wait_for_enter
      ;;
  esac
}

# Check if API is running
check_api() {
  if ! curl -sf "$API_BASE/health" > /dev/null 2>&1; then
    print_error "API server is not running at $API_BASE"
    echo -e "${YELLOW}Run: ./scripts/demo.sh first${NC}"
    exit 1
  fi
}

# Main loop
main() {
  # Check dependencies
  if ! command -v jq &> /dev/null; then
    print_error "jq is not installed. Install with: apt-get install jq"
    exit 1
  fi
  
  check_api
  
  # Interactive menu loop
  while true; do
    show_menu
  done
}

# Run
main
