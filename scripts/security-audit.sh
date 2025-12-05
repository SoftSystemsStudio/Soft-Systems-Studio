#!/bin/bash
#
# Security Audit Script for Soft Systems Studio
# Run this script to check for common security issues
#
# Usage: ./scripts/security-audit.sh
#

set -e

echo "🔒 Soft Systems Studio Security Audit"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Function to report issues
report_issue() {
    echo -e "${RED}❌ ISSUE:${NC} $1"
    ((ISSUES_FOUND++))
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

report_ok() {
    echo -e "${GREEN}✅ OK:${NC} $1"
}

echo "1. Checking for dependency vulnerabilities..."
echo "----------------------------------------------"
if pnpm audit 2>/dev/null | grep -q "No known vulnerabilities"; then
    report_ok "No known vulnerabilities in dependencies"
else
    report_warning "Run 'pnpm audit' to see vulnerability details"
fi
echo ""

echo "2. Checking for hardcoded secrets..."
echo "----------------------------------------------"
# Check for potential API keys (excluding common patterns)
SECRETS_FOUND=$(grep -rn "sk-[a-zA-Z0-9]\{20,\}" --include="*.ts" --include="*.tsx" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next \
    --exclude="*.test.ts" --exclude="*boot-test*" --exclude="*scan-placeholders*" 2>/dev/null | wc -l)

if [ "$SECRETS_FOUND" -gt 0 ]; then
    report_issue "Potential hardcoded API keys found"
else
    report_ok "No hardcoded API keys detected"
fi
echo ""

echo "3. Checking for dangerous patterns..."
echo "----------------------------------------------"

# Check for eval usage in source code (not build artifacts)
EVAL_FOUND=$(grep -rn "eval\s*(" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next 2>/dev/null | wc -l)
if [ "$EVAL_FOUND" -gt 0 ]; then
    report_warning "eval() usage detected - review for security"
else
    report_ok "No eval() usage in source code"
fi

# Check for new Function() constructor
FUNC_FOUND=$(grep -rn "new Function\s*(" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next 2>/dev/null | wc -l)
if [ "$FUNC_FOUND" -gt 0 ]; then
    report_warning "new Function() usage detected - review for security"
else
    report_ok "No new Function() usage in source code"
fi
echo ""

echo "4. Checking for SQL injection risks..."
echo "----------------------------------------------"
# Look for raw SQL that might have string interpolation
RAW_SQL=$(grep -rn '\$queryRaw`\|executeRaw`' --include="*.ts" \
    --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | \
    grep -v "SELECT 1" | wc -l)
if [ "$RAW_SQL" -gt 0 ]; then
    report_warning "Raw SQL queries found - ensure parameterization"
else
    report_ok "No risky raw SQL queries detected"
fi
echo ""

echo "5. Checking for sensitive data exposure..."
echo "----------------------------------------------"
# Check if .env files are in git
if git ls-files | grep -q "^\.env$\|^\.env\.local$\|^\.env\.production$"; then
    report_issue ".env files are tracked in git!"
else
    report_ok ".env files are not tracked in git"
fi

# Check .gitignore for env patterns
if grep -q "\.env" .gitignore 2>/dev/null; then
    report_ok ".env patterns in .gitignore"
else
    report_warning ".env patterns not found in .gitignore"
fi
echo ""

echo "6. Checking security headers configuration..."
echo "----------------------------------------------"
if grep -q "helmet" apps/agent-api/src/index.ts 2>/dev/null; then
    report_ok "Helmet security middleware is configured"
else
    report_warning "Helmet not found in API - consider adding security headers"
fi

if grep -q "Content-Security-Policy" packages/frontend/next.config.mjs 2>/dev/null; then
    report_ok "CSP headers configured in frontend"
else
    report_warning "CSP not found in frontend config"
fi
echo ""

echo "7. Checking authentication configuration..."
echo "----------------------------------------------"
if grep -q 'algorithms:' apps/agent-api/src/middleware/*.ts 2>/dev/null; then
    report_ok "JWT algorithm is explicitly specified"
else
    report_warning "JWT algorithm should be explicitly specified"
fi
echo ""

echo "8. Checking rate limiting..."
echo "----------------------------------------------"
if grep -q "rateLimit\|rateLimiter" apps/agent-api/src/middleware/*.ts 2>/dev/null; then
    report_ok "Rate limiting is implemented"
else
    report_warning "Rate limiting not found"
fi
echo ""

echo "======================================"
echo "Audit Complete"
echo ""
if [ "$ISSUES_FOUND" -gt 0 ]; then
    echo -e "${RED}Found $ISSUES_FOUND issue(s) that need attention${NC}"
    exit 1
else
    echo -e "${GREEN}No critical issues found!${NC}"
    exit 0
fi
