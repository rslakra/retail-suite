#!/bin/bash
# Script to build the frontend from src/ directory to src/main/resources/static/
# Uses Webpack 5 and npm (migrated from Grunt/Bower)
# Author: Rohtash Lakra

set -e  # Exit on error

echo "=========================================="
echo "Building Frontend for web-apps-ui"
echo "=========================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js >= 18.0.0 from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: NPM is not installed."
    echo "NPM should come with Node.js."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js version must be >= 18.0.0"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "WARNING: npm version should be >= 9.0.0"
    echo "Current version: $(npm -v)"
    echo "Consider upgrading npm: npm install -g npm@latest"
    echo
fi

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in current directory"
    echo "Please run this script from the web-apps-ui directory"
    exit 1
fi

# Check if webpack.config.js exists
if [ ! -f "webpack.config.js" ]; then
    echo "WARNING: webpack.config.js not found"
    echo "The build may fail if Webpack configuration is missing"
    echo
fi

# Install NPM dependencies
echo "Step 1: Installing NPM dependencies..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "Installing/updating dependencies..."
    npm install --legacy-peer-deps
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed (node_modules exists and is up to date)"
fi
echo

# Clean previous build
echo "Step 2: Cleaning previous build..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "✓ Removed old dist/ directory"
fi
if [ -d ".tmp" ]; then
    rm -rf .tmp
    echo "✓ Removed old .tmp/ directory"
fi
echo

# Build the frontend using Webpack
echo "Step 3: Building frontend with Webpack (this may take a few minutes)..."
echo "Running: npm run build"
echo

set +e  # Don't exit on error for build (to capture error messages)
npm run build 2>&1 | tee /tmp/webpack_build.log
BUILD_EXIT_CODE=$?
set -e  # Re-enable exit on error

# Check if dist was created
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    echo "✓ Build completed - dist/ directory created successfully"
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        echo "⚠ Build completed with warnings (check /tmp/webpack_build.log for details)"
    fi
else
    echo "ERROR: Build failed - dist directory is empty or missing"
    echo
    echo "Build errors:"
    tail -50 /tmp/webpack_build.log
    echo
    echo "Troubleshooting:"
    echo "1. Check Node.js version: node -v (must be >= 18.0.0)"
    echo "2. Check npm version: npm -v (should be >= 9.0.0)"
    echo "3. Try cleaning and reinstalling:"
    echo "   rm -rf node_modules package-lock.json"
    echo "   npm install --legacy-peer-deps"
    echo "4. Check webpack.config.js exists and is valid"
    echo "5. Review full build log: /tmp/webpack_build.log"
    exit 1
fi
echo

# Verify build output
echo "Step 4: Verifying build output..."
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found - build may have failed"
    exit 1
fi

# Count files in dist
FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
echo "✓ Build output verified: $FILE_COUNT files in dist/"
echo

# Backup existing static directory (optional)
if [ -d "src/main/resources/static" ] && [ "$(ls -A src/main/resources/static 2>/dev/null)" ]; then
    echo "Step 5: Backing up existing static files..."
    BACKUP_DIR="src/main/resources/static.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r src/main/resources/static "$BACKUP_DIR"
    echo "✓ Backup created at: $BACKUP_DIR"
    echo
fi

# Copy built files to static directory
echo "Step 6: Copying built files to src/main/resources/static/..."
rm -rf src/main/resources/static/*
cp -r dist/* src/main/resources/static/
echo "✓ Files copied to src/main/resources/static/"
echo

# Verify files were copied
if [ -f "src/main/resources/static/index.html" ]; then
    echo "✓ Build successful!"
    echo "✓ Files copied to src/main/resources/static/"
    
    # Clean up old backup folders after successful build
    echo "Step 7: Cleaning up old backup folders..."
    if ls src/main/resources/static.backup.* 1>/dev/null 2>&1; then
        BACKUP_COUNT=$(ls -d src/main/resources/static.backup.* 2>/dev/null | wc -l | tr -d ' ')
        # Keep only the 3 most recent backups
        if [ "$BACKUP_COUNT" -gt 3 ]; then
            ls -t src/main/resources/static.backup.* | tail -n +4 | xargs rm -rf
            REMOVED=$((BACKUP_COUNT - 3))
            echo "✓ Removed $REMOVED old backup folder(s) (kept 3 most recent)"
        else
            echo "✓ No old backups to clean up (keeping $BACKUP_COUNT backup(s))"
        fi
    else
        echo "✓ No backup folders to clean up"
    fi
    echo
    echo "Next steps:"
    echo "1. Rebuild the Spring Boot service: ./buildMaven.sh"
    echo "2. Or restart the service: ./runMaven.sh"
else
    echo "ERROR: Build may have failed - index.html not found in static directory"
    exit 1
fi

echo
echo "=========================================="
echo "Frontend build completed!"
echo "=========================================="
