#!/bin/bash

# 🚀 CI Build Script for CandiVoc
set -e

# 🎨 Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 📊 Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${BOLD}$1${NC}"
}

# 🚀 Main build function
main() {
    log_header "🚀 CandiVoc CI Build Process"
    echo "=================================================="

    # 📊 Environment info
    log_info "Node.js version: $(node --version)"
    log_info "NPM version: $(npm --version)"
    log_info "Environment: ${NODE_ENV:-development}"
    log_info "Working directory: $(pwd)"
    echo ""

    # 🧹 Clean previous builds
    log_header "🧹 Cleaning Previous Builds"
    if [ -d "dist" ]; then
        rm -rf dist
        log_success "Removed existing dist directory"
    fi
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_success "Cleaned npm cache"
    fi
    echo ""

    # 🔍 Pre-build checks
    log_header "🔍 Pre-Build Checks"

    # Check Node.js version
    NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_error "Node.js version 18+ required, found $(node --version)"
        exit 1
    fi
    log_success "Node.js version check passed"

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        exit 1
    fi
    log_success "package.json found"

    # Check critical files
    CRITICAL_FILES=(
        "src/main.tsx"
        "index.html"
        "vite.config.ts"
        "package.json"
    )

    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Critical file missing: $file"
            exit 1
        fi
    done
    log_success "All critical files found"
    echo ""

    # 📦 Install dependencies
    log_header "📦 Installing Dependencies"
    if [ "$CI" = "true" ]; then
        log_info "Running in CI mode, using npm ci"
        npm ci --prefer-offline --no-audit --no-fund
    else
        npm install
    fi
    log_success "Dependencies installed"
    echo ""

    # 🔍 Linting
    log_header "🔍 Running Linting"

    # ESLint
    if npm run lint --silent > /dev/null 2>&1; then
        log_success "ESLint check passed"
    else
        log_error "ESLint check failed"
        npm run lint
        exit 1
    fi

    # TypeScript check
    if npm run type-check --silent > /dev/null 2>&1; then
        log_success "TypeScript check passed"
    else
        log_error "TypeScript check failed"
        npm run type-check
        exit 1
    fi
    echo ""

    # 🧪 Run tests
    log_header "🧪 Running Tests"

    if npm run test:ci --silent > /dev/null 2>&1; then
        log_success "All tests passed"
    else
        log_error "Tests failed"
        npm run test:ci
        exit 1
    fi
    echo ""

    # 🏗️ Build application
    log_header "🏗️ Building Application"

    # Set environment variables
    export NODE_ENV=production
    export VITE_APP_ENV=production

    # Run build with timing
    BUILD_START=$(date +%s%N)

    if npm run build > /dev/null 2>&1; then
        BUILD_END=$(date +%s%N)
        BUILD_TIME=$(( (BUILD_END - BUILD_START) / 1000000 ))
        log_success "Build completed in ${BUILD_TIME}ms"
    else
        log_error "Build failed"
        npm run build
        exit 1
    fi
    echo ""

    # 📊 Post-build analysis
    log_header "📊 Post-Build Analysis"

    # Check if dist directory exists and has files
    if [ ! -d "dist" ]; then
        log_error "Build directory not created"
        exit 1
    fi

    # Count files
    JS_FILES=$(find dist -name "*.js" | wc -l)
    CSS_FILES=$(find dist -name "*.css" | wc -l)
    HTML_FILES=$(find dist -name "*.html" | wc -l)

    log_info "JavaScript files: $JS_FILES"
    log_info "CSS files: $CSS_FILES"
    log_info "HTML files: $HTML_FILES"

    # Calculate total size
    if command -v du >/dev/null 2>&1; then
        TOTAL_SIZE=$(du -sh dist | cut -f1)
        log_info "Total bundle size: $TOTAL_SIZE"
    fi

    # Check for critical files in dist
    CRITICAL_OUTPUT_FILES=(
        "dist/index.html"
    )

    for file in "${CRITICAL_OUTPUT_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Critical output file missing: $file"
            exit 1
        fi
    done
    log_success "All critical output files present"
    echo ""

    # 📏 Bundle size check
    log_header "📏 Bundle Size Check"
    if [ -f "scripts/check-bundle-size.js" ]; then
        node scripts/check-bundle-size.js
        log_success "Bundle size check completed"
    else
        log_warning "Bundle size check script not found, skipping"
    fi
    echo ""

    # 🔒 Security audit
    log_header "🔒 Security Audit"
    if npm audit --audit-level moderate > /dev/null 2>&1; then
        log_success "Security audit passed"
    else
        log_warning "Security audit found issues (continuing)"
        npm audit --audit-level moderate || true
    fi
    echo ""

    # 📋 Build summary
    log_header "📋 Build Summary"
    log_success "✅ All checks passed"
    log_success "✅ Build completed successfully"
    log_success "✅ Ready for deployment"

    if [ -n "$BUILD_TIME" ]; then
        log_info "⏱️  Total build time: ${BUILD_TIME}ms"
    fi

    if [ -n "$TOTAL_SIZE" ]; then
        log_info "📦 Bundle size: $TOTAL_SIZE"
    fi

    echo ""
    log_info "🚀 CandiVoc is ready to deploy!"
}

# 🚀 Run the build
main "$@"