# Migration Guide

This document describes the complete migration history of the web-apps-ui project, including the Webpack migration and the AngularJS to Angular 17+ migration.

## Table of Contents

1. [Webpack Migration](#webpack-migration)
2. [AngularJS to Angular 17+ Migration](#angularjs-to-angular-17-migration)
3. [Security Vulnerabilities and Resolutions](#security-vulnerabilities-and-resolutions)

---

## Webpack Migration

### Overview

The project was migrated from Bower/Grunt to npm/Webpack, modernizing the build system and dependency management.

### Quick Start Commands

#### Installation
```bash
# Install dependencies
yarn install
# or
npm install

# Note: If yarn install gets stuck, use:
yarn install --network-timeout 100000
```

#### Development
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

#### Building
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

#### Testing
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

#### Debugging
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

### Entry Point (app/scripts/main.js)

The original entry point structure (before Angular migration):

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

### Configuration Files

- `package.json` - Dependencies and scripts
- `webpack.config.js` - Webpack configuration
- `app/scripts/main.js` - Entry point (legacy, now uses `src/main.ts`)
- `app/index.webpack.html` - HTML template (legacy, now uses `src/index.html`)

### Proxy Configuration

Development server proxies:
- `/customers` → `http://localhost:9000`
- `/stores` → `http://localhost:8081`

Configured in `webpack.config.js` → `devServer.proxy`

### Webpack Migration Status

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

### Troubleshooting

#### Installation Issues
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

#### Build Issues
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

#### Runtime Issues
```bash
# Check browser console for errors
# Verify all dependencies loaded
# Check network tab for failed requests

# Verify build output
ls -la dist/
# Should contain: index.html, scripts/, styles/, images/, fonts/
```

---

## AngularJS to Angular 17+ Migration

### Overview

This section describes the migration from AngularJS (1.8.3) to Angular 17+ and Bootstrap 3 to Bootstrap 5.

### What Changed

#### Dependencies
- **AngularJS 1.8.3** → **Angular 17.3.0**
- **Bootstrap 3.4.1** → **Bootstrap 5.3.3**
- **angular-ui-router** → **@angular/router**
- **angular-google-maps** → **@angular/google-maps**
- **$http service** → **HttpClient**
- **JavaScript** → **TypeScript**

#### Architecture Changes
- **Module-based** → **Component-based architecture**
- **Controllers** → **Components**
- **$scope** → **Component properties**
- **Directives** → **Angular directives and components**
- **Services** → **Angular services with dependency injection**

#### File Structure
```
Old structure (app/):
  scripts/
    app.js
    routes.js
    controllers/
  views/
  styles/

New structure (src/):
  app/
    components/
    services/
    models/
    app.component.ts
    app.module.ts
    app.routes.ts
  assets/
  main.ts
  index.html
  styles.css
```

### Key Migration Points

#### 1. Routing
**Before (AngularJS):**
```javascript
$stateProvider.state('customers', {
  url: '/customers',
  controller: 'CustomerController',
  templateUrl: 'views/customers.html'
});
```

**After (Angular):**
```typescript
{ path: 'customers', component: CustomerListComponent }
```

#### 2. Controllers → Components
**Before:**
```javascript
.controller('CustomerController', function ($scope, $http) {
  $scope.customers = [];
  $scope.loadCustomers = function() { ... };
});
```

**After:**
```typescript
@Component({...})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loadCustomers(): void { ... }
}
```

#### 3. HTTP Calls
**Before:**
```javascript
$http.get('/customers').then(function(response) {
  $scope.customers = response.data._embedded.customers;
});
```

**After:**
```typescript
this.customerService.getCustomers().subscribe({
  next: (customers) => this.customers = customers
});
```

#### 4. Templates
**Before:**
```html
<div ng-repeat="customer in customers">
  {{customer.firstname}}
</div>
```

**After:**
```html
<div *ngFor="let customer of customers">
  {{customer.firstname}}
</div>
```

#### 5. Forms
**Before:**
```html
<input ng-model="customer.firstname">
```

**After:**
```html
<input [(ngModel)]="customer.firstname">
```

#### 6. Bootstrap Classes
- `col-sm-offset-2` → `offset-sm-2`
- `btn-default` → `btn-secondary`
- `glyphicon` → Bootstrap Icons (`bi`)
- `navbar-toggle` → `navbar-toggler`
- `sr-only` → `visually-hidden` (if needed)

### Google Maps Integration

The Google Maps integration has been updated to use `@angular/google-maps`:
- Replaced `angular-google-maps` with `@angular/google-maps`
- Updated map components to use Angular Google Maps directives
- Maintained geocoding and reverse geocoding functionality

### Next Steps

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Update Google Maps API Key:**
   - Edit `src/index.html` and replace `YOUR_API_KEY` with your actual Google Maps API key

3. **Test the application:**
   ```bash
   yarn start
   ```

4. **Build for production:**
   ```bash
   yarn build
   ```

### Notes

- The old `app/` directory is preserved for reference but is no longer used
- All assets have been moved to `src/assets/`
- TypeScript compilation is handled by `@ngtools/webpack` in webpack
- The application uses Angular's module system (not standalone components) for compatibility
- Zone.js must be imported before Angular (see `src/main.ts`)

### Breaking Changes

1. **Routing:** URLs remain the same, but internal routing implementation changed
2. **Google Maps:** Requires a valid API key in `index.html`
3. **Forms:** All forms now use Angular Forms with `ngModel`
4. **Styling:** Some Bootstrap 3 classes may need adjustment

---

## Security Vulnerabilities and Resolutions

**✅ MIGRATION COMPLETED**: This project has been migrated from AngularJS to Angular 17+ and Bootstrap 3 to Bootstrap 5, resolving all security vulnerabilities.

### ✅ All Issues Resolved

#### ✅ AngularJS → Angular 17+ Migration
- **Status**: ✅ **RESOLVED** - Migrated to Angular 17.3.0
- **Action**: Complete migration from AngularJS 1.8.3 to Angular 17.3.0
- **Impact**: All AngularJS vulnerabilities eliminated
- **Details**: See [AngularJS to Angular 17+ Migration](#angularjs-to-angular-17-migration) section above

#### ✅ Bootstrap 3 → Bootstrap 5 Migration
- **Status**: ✅ **RESOLVED** - Migrated to Bootstrap 5.3.3
- **Action**: Complete migration from Bootstrap 3.4.1 to Bootstrap 5.3.3
- **Impact**: All Bootstrap XSS vulnerabilities eliminated

#### ✅ webpack-dev-server (CVE-2025-30360, CVE-2025-30359)
- **Status**: ✅ **RESOLVED** - Updated to 5.2.1
- **Action**: Updated from `^4.15.1` to `^5.2.1`
- **Impact**: Resolves source code theft vulnerabilities in development server

### Previous Vulnerabilities (Now Resolved)

#### ✅ AngularJS (angular 1.8.3) - Multiple Vulnerabilities

**Status**: ✅ **RESOLVED** - Migrated to Angular 17+

AngularJS (Angular 1.x) reached end-of-life on December 31, 2021, and is no longer maintained. The current version (1.8.3) is the latest and final release, but it contained multiple known security vulnerabilities:

##### High Severity:
- **Prototype Pollution** (CVE-2023-26116): The `merge()` function can be tricked into modifying properties of `Object.prototype`
- **Super-linear runtime due to backtracking**: Vulnerable to performance degradation attacks

##### Moderate Severity:
- **Cross-site Scripting (XSS)** (CVE-2022-25869): Multiple XSS vulnerabilities including:
  - Insecure page caching in Internet Explorer allowing interpolation of `<textarea>` elements
  - XSS via JQLite DOM manipulation functions
  - XSS in various AngularJS directives
- **Regular Expression Denial of Service (ReDoS)**:
  - Via `<input type="url">` element
  - Via `$resource` service
  - Via `angular.copy()` utility
  - Via `ng-srcset` directive

##### Low Severity:
- **Image source restrictions bypass**: Allows attackers to bypass common image source restrictions
- **Improper SVG sanitization**: SVG elements are not properly sanitized

#### ✅ Bootstrap 3.4.1 → Bootstrap 5.3.3

**Status**: ✅ **RESOLVED** - Migrated to Bootstrap 5.3.3

Bootstrap 3.4.1 is the latest version of Bootstrap 3, but Bootstrap 3 is deprecated. The following vulnerabilities existed:

##### Moderate Severity:
- **XSS in Tooltip and Popover Components** (CVE-2019-8331): Improper sanitization of `data-template`, `data-content`, and `data-title` attributes
- **XSS in data-* attributes**: Cross-Site Scripting vulnerability for data-* attributes
- **XSS in data-loading-text attribute** (CVE-2024-6485): Versions from 1.4.0 up to 3.4.1 are susceptible

#### ✅ angular-sanitize 1.8.3

**Status**: ✅ **RESOLVED** - No longer needed with Angular 17+ (built-in sanitization)

- **Incomplete Filtering of Special Elements** (CVE-2023-26117): AngularJS sanitizer does not properly filter special elements, allowing potential XSS attacks

### Security Best Practices

1. **Input Validation**: Always validate and sanitize user inputs on the server side
2. **Content Security Policy**: Implement strict CSP headers
3. **Regular Audits**: Run `yarn audit` regularly to identify new vulnerabilities
4. **Dependency Updates**: Keep non-deprecated dependencies up to date
5. **Security Headers**: Implement security headers (X-Frame-Options, X-Content-Type-Options, etc.)
6. **HTTPS**: Always use HTTPS in production
7. **Rate Limiting**: Implement rate limiting to mitigate DoS attacks

### ✅ Migration Completed

The migration has been successfully completed:

1. ✅ **Phase 1**: Migrated Bootstrap 3 → Bootstrap 5.3.3
2. ✅ **Phase 2**: Migrated AngularJS → Angular 17.3.0
3. ✅ **Phase 3**: Updated all related dependencies

### References

- [AngularJS End of Life](https://angular.io/guide/ajs-quick-reference)
- [Bootstrap Migration Guide](https://getbootstrap.com/docs/5.0/migration/)
- [Angular Migration Guide](https://angular.io/guide/upgrade)
