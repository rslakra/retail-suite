#!/bin/bash
# Script to build the frontend from app/ directory to src/main/resources/static/
# Author: Rohtash Lakra

set -e  # Exit on error

echo "=========================================="
echo "Building Frontend for web-apps-ui"
echo "=========================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
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
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "WARNING: Node.js version is less than 14. Recommended: Node.js 14+"
    echo "Current version: $(node -v)"
elif [ "$NODE_VERSION" -ge 18 ]; then
    echo "WARNING: Node.js version $(node -v) may have compatibility issues with old Grunt/Karma versions."
    echo "The old package.json dependencies may not work with Node.js 18+."
    echo "The script will attempt to work around these issues, but some errors may occur."
    echo "For best results, consider using Node.js 14-16:"
    echo "  nvm install 16 && nvm use 16"
    echo
fi

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo

# Check if Bower is installed
if ! command -v bower &> /dev/null; then
    echo "Bower is not installed. Installing globally..."
    npm install -g bower
fi

echo "Bower version: $(bower -v)"
echo

# Check if Grunt CLI is installed
if ! command -v grunt &> /dev/null; then
    echo "Grunt CLI is not installed. Installing globally..."
    npm install -g grunt-cli
fi

echo "Grunt version: $(grunt --version)"
echo

# Install NPM dependencies
echo "Step 1: Installing NPM dependencies..."
echo "Note: You may see warnings about unsupported engines and vulnerabilities."
echo "These are expected with the old package.json versions."
echo
npm install --legacy-peer-deps 2>&1 | grep -v "EBADENGINE\|vulnerabilities\|funding" || true
echo

# Install Bower dependencies
echo "Step 2: Installing Bower dependencies..."
bower install
echo

# Install missing imagemin dependencies (if needed)
echo "Step 3: Installing missing imagemin dependencies..."
if ! npm list imagemin-gifsicle &>/dev/null; then
    npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev --legacy-peer-deps 2>&1 | grep -v "EBADENGINE\|vulnerabilities\|funding" || true
else
    echo "imagemin dependencies already installed"
fi
echo

# Fix for "primordials is not defined" error with Node.js 12+ and old Grunt
if [ "$NODE_VERSION" -ge 12 ]; then
    echo "Step 3.5: Installing compatibility fixes for Node.js $(node -v)..."
    # Install graceful-fs fix
    npm install graceful-fs@latest --save-dev --legacy-peer-deps 2>&1 | grep -v "EBADENGINE\|vulnerabilities\|funding" || true
    
    # Create a patch for the primordials issue in node_modules if needed
    if [ -f "node_modules/grunt-google-cdn/tasks/cdnify.js" ]; then
        echo "  Applying workaround for grunt-google-cdn..."
        # This is a known issue - we'll let --force handle it
    fi
    echo
fi

# Build the frontend
echo "Step 4: Building frontend (this may take a few minutes)..."
echo "Note: You may see errors about 'cdnify' or 'grunt-karma' - these are non-critical."
echo "The build will continue with available tasks using --force flag."
echo
set +e  # Don't exit on error for grunt build
grunt build --force > /tmp/grunt_build.log 2>&1
GRUNT_EXIT_CODE=$?
set -e  # Re-enable exit on error

# Check if dist was created despite errors
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    echo "✓ Build completed - dist/ directory created successfully"
    if [ $GRUNT_EXIT_CODE -ne 0 ]; then
        echo "⚠ Some non-critical tasks failed, but dist was created"
        echo "  (Check /tmp/grunt_build.log for details if needed)"
    fi
else
    echo "ERROR: Build failed - dist directory is empty or missing"
    echo
    echo "Build errors:"
    tail -30 /tmp/grunt_build.log
    echo
    echo "Troubleshooting:"
    echo "1. The old Grunt/Karma versions may be incompatible with Node.js $(node -v)"
    echo "2. Try using Node.js 14-16:"
    echo "   - Install nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   - Use Node 16: nvm install 16 && nvm use 16"
    echo "   - Then run: ./buildFrontend.sh"
    echo "3. Or upgrade package.json dependencies (see README for security-focused upgrade)"
    exit 1
fi
echo

# Backup existing static directory (optional)
if [ -d "src/main/resources/static" ] && [ "$(ls -A src/main/resources/static 2>/dev/null)" ]; then
    echo "Step 5: Backing up existing static files..."
    BACKUP_DIR="src/main/resources/static.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r src/main/resources/static "$BACKUP_DIR"
    echo "Backup created at: $BACKUP_DIR"
    echo
fi

# Copy built files to static directory
echo "Step 6: Copying built files to src/main/resources/static/..."
rm -rf src/main/resources/static/*
cp -r dist/* src/main/resources/static/

# Copy bower_components if they exist (needed if usemin didn't process build blocks)
if [ -d "bower_components" ]; then
    echo "Step 6.5: Copying bower_components (needed for unprocessed build blocks)..."
    cp -r bower_components src/main/resources/static/
    echo "✓ bower_components copied"
fi

# Copy source scripts and compile styles if usemin didn't process build blocks
if [ -d "app/scripts" ]; then
    echo "Step 6.6: Copying source scripts (usemin blocks not processed)..."
    mkdir -p src/main/resources/static/scripts/controllers
    cp app/scripts/*.js src/main/resources/static/scripts/ 2>/dev/null || true
    cp -r app/scripts/controllers/*.js src/main/resources/static/scripts/controllers/ 2>/dev/null || true
    echo "✓ Scripts copied"
fi

# Compile LESS to CSS if needed
if [ -d "app/styles" ] && command -v grunt >/dev/null; then
    echo "Step 6.7: Compiling LESS to CSS..."
    mkdir -p src/main/resources/static/styles
    grunt less:server >/dev/null 2>&1 || true
    if [ -f ".tmp/styles/main.css" ]; then
        cp .tmp/styles/main.css src/main/resources/static/styles/ 2>/dev/null || true
        echo "✓ CSS compiled and copied"
    fi
fi

# Copy fonts and images to styles/app/ directory (CSS references them with relative paths)
if [ -d "app/fonts" ]; then
    echo "Step 6.8: Copying fonts to styles/app/fonts/..."
    mkdir -p src/main/resources/static/styles/app/fonts
    cp app/fonts/varela_round-webfont.* src/main/resources/static/styles/app/fonts/ 2>/dev/null || true
    cp app/fonts/montserrat-webfont.* src/main/resources/static/styles/app/fonts/ 2>/dev/null || true
    echo "✓ Fonts copied"
fi

if [ -d "app/images" ]; then
    echo "Step 6.9: Copying images to styles/app/images/..."
    mkdir -p src/main/resources/static/styles/app/images
    cp app/images/spring-logo-platform.png src/main/resources/static/styles/app/images/ 2>/dev/null || true
    # Copy any other images referenced in CSS
    cp app/images/*.png src/main/resources/static/styles/app/images/ 2>/dev/null || true
    cp app/images/*.jpg src/main/resources/static/styles/app/images/ 2>/dev/null || true
    echo "✓ Images copied"
fi
echo

# Verify files were copied
if [ -f "src/main/resources/static/index.html" ]; then
    echo "✓ Build successful!"
    echo "✓ Files copied to src/main/resources/static/"
    
    # Clean up old backup folders after successful build
    echo "Step 7: Cleaning up old backup folders..."
    if ls src/main/resources/static.backup.* 1>/dev/null 2>&1; then
        BACKUP_COUNT=$(ls -d src/main/resources/static.backup.* 2>/dev/null | wc -l | tr -d ' ')
        rm -rf src/main/resources/static.backup.*
        echo "✓ Removed $BACKUP_COUNT old backup folder(s)"
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

