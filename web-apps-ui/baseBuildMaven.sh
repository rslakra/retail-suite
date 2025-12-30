#!/bin/bash
# Author: Rohtash Lakra
# Common Maven prerequisite check and Node.js build function
# 
# This function ensures the frontend is built and ready for Maven.
# Maven requires src/main/resources/static/ to contain the frontend build.
# If missing or outdated, it builds the frontend using Node.js/npm/Webpack.
#
# Note: This contains the Node.js build steps needed for Maven.
#       It is separate from buildWebapp.sh to keep Maven and Node.js builds independent.
#
# Usage:
#   source ./baseBuildMaven.sh
#   ensureFrontendBuilt

function ensureFrontendBuilt() {
    local NEEDS_BUILD=false
    
    # Maven prerequisite: Check if frontend exists
    if [ ! -f "src/main/resources/static/index.html" ]; then
        echo "Frontend not found in src/main/resources/static/"
        echo "Maven requires the frontend to be built first."
        NEEDS_BUILD=true
    # Check if it's the old AngularJS build (has bower_components references)
    elif grep -q "bower_components" "src/main/resources/static/index.html" 2>/dev/null; then
        echo "Old AngularJS build detected in src/main/resources/static/"
        echo "Maven requires the new Angular 21 build."
        NEEDS_BUILD=true
    fi
    
    # If frontend needs to be built, build it using Node.js/npm/Webpack
    if [ "$NEEDS_BUILD" = true ]; then
        echo "Building frontend for Maven using Node.js/npm/Webpack..."
        echo
        
        # Check Node.js prerequisites
        if ! command -v node &> /dev/null; then
            echo "ERROR: Node.js is not installed."
            echo "       Please install Node.js >= 18.0.0 from https://nodejs.org/"
            exit 1
        fi
        
        if ! command -v npm &> /dev/null; then
            echo "ERROR: NPM is not installed."
            echo "       NPM should come with Node.js."
            exit 1
        fi
        
        # Check Node.js version
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            echo "ERROR: Node.js version must be >= 18.0.0"
            echo "       Current version: $(node -v)"
            exit 1
        fi
        
        # Check if package.json exists
        if [ ! -f "package.json" ]; then
            echo "ERROR: package.json not found"
            echo "       Cannot build frontend for Maven."
            exit 1
        fi
        
        # Install NPM dependencies (if needed)
        if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
            echo "Installing NPM dependencies..."
            npm install --legacy-peer-deps 2>&1 | grep -v "EBADENGINE\|vulnerabilities\|funding" || true
            echo "✓ Dependencies installed"
        fi
        
        # Clean previous build
        if [ -d "dist" ]; then
            rm -rf dist
        fi
        if [ -d ".tmp" ]; then
            rm -rf .tmp
        fi
        
        # Build the frontend using Webpack
        echo "Building frontend with Webpack..."
        set +e  # Don't exit on error for build (to capture error messages)
        npm run build 2>&1 | tee /tmp/webpack_maven_build.log
        BUILD_EXIT_CODE=$?
        set -e  # Re-enable exit on error
        
        # Check if dist was created
        if [ ! -d "dist" ] || [ ! "$(ls -A dist 2>/dev/null)" ]; then
            echo "ERROR: Frontend build failed - dist directory is empty or missing"
            echo "       Check /tmp/webpack_maven_build.log for details"
            exit 1
        fi
        
        if [ ! -f "dist/index.html" ]; then
            echo "ERROR: Frontend build failed - dist/index.html not found"
            exit 1
        fi
        
        if [ $BUILD_EXIT_CODE -ne 0 ]; then
            echo "WARNING: Build completed with warnings (check /tmp/webpack_maven_build.log)"
        fi
        
        # Backup existing static directory (if it exists and has content)
        if [ -d "src/main/resources/static" ] && [ "$(ls -A src/main/resources/static 2>/dev/null)" ]; then
            BACKUP_DIR="src/main/resources/static.backup.$(date +%Y%m%d_%H%M%S)"
            cp -r src/main/resources/static "$BACKUP_DIR"
            echo "✓ Backup created at: $BACKUP_DIR"
        fi
        
        # Copy built files to static directory for Maven
        echo "Copying built files to src/main/resources/static/..."
        rm -rf src/main/resources/static/*
        cp -r dist/* src/main/resources/static/
        
        # Verify files were copied
        if [ ! -f "src/main/resources/static/index.html" ]; then
            echo "ERROR: Failed to copy frontend files to static directory"
            exit 1
        fi
        
        echo "✓ Frontend built and copied to src/main/resources/static/ (ready for Maven)"
        echo
    else
        # Frontend is ready for Maven - no message needed (silent check)
        # The frontend exists and is not the old AngularJS build
        return 0
    fi
}
