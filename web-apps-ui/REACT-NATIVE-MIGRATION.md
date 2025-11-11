# Webpack Migration Guide

## Quick Start Commands

### Installation
```bash
# Install dependencies
yarn install
# or
npm install

# Note: If yarn install gets stuck, use:
yarn install --network-timeout 100000
```

### Development
```bash
# Start development server
yarn start
# or
npm start

# Server runs on http://localhost:9900
# Hot module replacement enabled
# Proxies /customers → http://localhost:9000
# Proxies /stores → http://localhost:8081
```

### Building
```bash
# Production build
yarn build
# or
npm run build

# Development build (no minification)
yarn build:dev
# or
npm run build:dev

# Output: dist/ directory
# - dist/index.html
# - dist/scripts/main.js (and vendor.js)
# - dist/styles/main.css
# - dist/images/
# - dist/fonts/
```

### Testing
```bash
# Run tests once
yarn test
# or
npm test

# Run tests in watch mode
yarn test:watch
# or
npm run test:watch
```

### Debugging
```bash
# Start dev server with debugging
yarn start
# Open browser DevTools (F12)
# Set breakpoints in app/scripts/*.js

# Build with source maps (already enabled)
yarn build:dev
# Source maps available in browser DevTools

# Check for issues
yarn list --depth=0
# or
npm list --depth=0
```

## Import Commands

### Entry Point (app/scripts/main.js)
```javascript
// Import jQuery first (required by Bootstrap) - must be global
window.$ = window.jQuery = require('jquery');

// Import Bootstrap JS (CSS is imported via LESS)
require('bootstrap/dist/js/bootstrap.js');

// Import AngularJS and modules - must be global for AngularJS
window.angular = require('angular');
require('angular-animate');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-touch');
require('angular-ui-router');

// Import lodash - make it global
window._ = require('lodash');

// Import angular-simple-logger (required by angular-google-maps)
// This provides the 'nemLogging' module
require('angular-simple-logger/dist/angular-simple-logger.js');

// Import angular-google-maps (must be loaded after angular-simple-logger)
// Use full path to ensure proper loading
require('angular-google-maps/dist/angular-google-maps.js');

// Import legacy shims (for IE support)
require('es5-shim');
require('json3');

// Import application styles
require('../styles/main.less');

// Import application code (order matters for AngularJS)
require('./app.js');
require('./routes.js');
require('./controllers/customer-controller.js');
require('./controllers/store-controller.js');
require('./controllers/about-controller.js');
```

## Configuration Files

- `package.json` - Dependencies and scripts
- `webpack.config.js` - Webpack configuration
- `app/scripts/main.js` - Entry point
- `app/index.webpack.html` - HTML template

## Proxy Configuration

Development server proxies:
- `/customers` → `http://localhost:9000`
- `/stores` → `http://localhost:8081`

Configured in `webpack.config.js` → `devServer.proxy`

## Troubleshooting

### Installation Issues
```bash
# Clear cache and retry
yarn cache clean
rm -rf node_modules yarn.lock
yarn install

# If stuck on dependency resolution:
yarn install --network-timeout 100000

# Fix Git protocol issues:
git config --global url."https://".insteadOf git://
```

### Build Issues
```bash
# Check for errors
yarn build 2>&1 | tee build.log

# Verify dependencies
yarn check --integrity

# Common fixes:
# - Bootstrap fonts: Copied to app/fonts/bootstrap/
# - LESS paths: Updated to use node_modules instead of bower_components
# - Font paths: Fixed in typography.less and header.less
# - angular-simple-logger: Must be imported before angular-google-maps
# - Module name: Use 'uiGmapgoogle-maps' instead of 'google-maps' in app.js
```

### Runtime Issues
```bash
# Check browser console for errors
# Verify all dependencies loaded
# Check network tab for failed requests

# Verify build output
ls -la dist/
# Should contain: index.html, scripts/, styles/, images/, fonts/
```

## Migration Status

- ✅ Bower removed (using npm/yarn only)
- ✅ Grunt replaced with Webpack
- ✅ Dependencies updated (AngularJS 1.8.3, Bootstrap 3.4.1)
- ✅ Modern build tools configured
- ✅ Hot module replacement enabled
- ✅ Build successful (dist/ directory created)
- ✅ All LESS/CSS paths fixed
- ✅ Font paths resolved
- ✅ Angular Google Maps module fixed (uiGmapgoogle-maps)
- ✅ Angular Simple Logger dependency added (nemLogging module)
- ✅ Runtime errors resolved

