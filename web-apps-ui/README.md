# Web Apps UI Service

## Overview

The **web-apps-ui** is a Spring Boot microservice that serves as a gateway and frontend for the retail-suite application. It provides an AngularJS-based user interface and routes requests to the customer-service and store-service using Spring Cloud Gateway.

**Key Features:**
- AngularJS frontend for customer and store management
- Spring Cloud Gateway for routing to backend services
- Service discovery via Eureka
- Static resource serving
- API gateway functionality

---

## Service Information

- **Port**: `9900`
- **Application Name**: `retail-suite-ui`
- **Base URL**: `http://localhost:9900`
- **Java Version**: 21
- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2024.0.0

---

## Dependencies

### Infrastructure Services (Optional)

1. **Eureka Server** (Optional)
   - Used for: Service discovery and load balancing
   - Services can run without Eureka, but load balancing won't work
   - Gateway routes will fall back to direct URLs if Eureka is unavailable

2. **Config Server** (Optional)
   - Default: `http://localhost:8888`
   - Used for: Centralized configuration management
   - Service has local fallback configuration

### Backend Services (Required for Full Functionality)

- **customer-service**: Must be running on port 9000 (or discoverable via Eureka)
- **store-service**: Must be running on port 8081 (or discoverable via Eureka)

### Maven Dependencies

- Spring Boot Starter WebFlux
- Spring Cloud Starter Gateway
- Spring Cloud Starter Netflix Eureka Client
- Spring Cloud Starter Config

---

## Build

### Prerequisites
- Java 21+
- Maven 3.6+

### Build Commands

**Option 1: Using build script (recommended)**
```bash
cd web-apps-ui
./buildMaven.sh
```

**Option 2: Using Maven directly**
```bash
cd web-apps-ui
mvn clean install
```

**Option 3: Build with tests**
```bash
cd web-apps-ui
mvn clean install -DskipTests=false
```

**Note**: Currently, there are no unit tests in this service. The build script skips tests by default.

The build script creates:
- SNAPSHOT version: `target/web-apps-ui-0.0.X-SNAPSHOT.jar`
- RELEASE version: `target/web-apps-ui-0.0.X.jar`

---

## Run

### Prerequisites

1. **Start backend services** (recommended):
   - Start customer-service (see [Customer Service README](../customer-service/README.md))
   - Start store-service (see [Store Service README](../store-service/README.md))

2. **Start Eureka Server** (optional, for service discovery)

### Run Commands

**Option 1: Using run script (Spring Boot - Production)**
```bash
cd web-apps-ui
./runMaven.sh
```

**Option 2: Using Maven (Spring Boot - Production)**
```bash
cd web-apps-ui
mvn spring-boot:run
```

**Option 3: Run JAR file (Spring Boot - Production)**
```bash
cd web-apps-ui
java -jar target/web-apps-ui-*.jar
```

**Option 4: Frontend Development Server (Hot Reload)**
For active frontend development with hot module replacement:
```bash
cd web-apps-ui

# Install dependencies (first time only)
yarn install
# or
npm install

# Start development server
npm start
# or
yarn start
# Opens http://localhost:9900 with auto-reload on file changes
```

**Note**: 
- Options 1-3 run the Spring Boot service with pre-built static files
- Option 4 runs the Webpack development server for frontend development
- Both can run simultaneously on different ports if needed

### Environment Variables

```bash
# Backend Service URLs (optional, defaults to localhost)
export STORE_SERVICE_URI=http://localhost:8081
export CUSTOMER_SERVICE_URI=http://localhost:9000

# Config Server (optional)
export CONFIG_SERVER_URI=http://localhost:8888
```

---

## Test

### Run Tests

Currently, there are no unit tests in this service. To run tests (if added in the future):

```bash
cd web-apps-ui
mvn test
```

---

## Gateway Routes

The service uses Spring Cloud Gateway to route requests to backend services:

| Route           | Backend Service  | Description                           |
|-----------------|------------------|---------------------------------------|
| `/stores/**`    | store-service    | Routes to store-service               |
| `/customers/**` | customer-service | Routes to customer-service            |
| `/`             | Static           | Redirects to `/index.html#/customers` |

### Service Discovery

**Default Configuration (Direct URLs):**
The gateway uses direct URLs by default (no Eureka required):
- `http://localhost:8081` - Direct route to store-service
- `http://localhost:9000` - Direct route to customer-service

**Using Eureka (Optional):**
If you want to use Eureka for service discovery and load balancing, update the routes in `application.yml`:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: stores
          uri: lb://store-service  # Use lb:// for service discovery
        - id: customers
          uri: lb://customer-service  # Use lb:// for service discovery
```

**Environment Variables:**
You can override service URLs using environment variables:
```bash
export STORE_SERVICE_URI=http://localhost:8081
export CUSTOMER_SERVICE_URI=http://localhost:9000
```

---

## Frontend

### AngularJS Application

The frontend is an AngularJS application located in `src/main/resources/static/`:
- **Main HTML**: `index.html`
- **Views**: `views/` directory
- **Scripts**: `scripts/` directory
- **Styles**: `styles/` directory

### Frontend Features

- Customer management (list, create, view details)
- Store management (list, view)
- Integration with backend APIs via gateway routes

### Frontend Build Systems

The project supports **two build systems**:

#### 1. Modern Webpack Setup (Recommended) ⭐

**Status**: ✅ Fully migrated and working

The modern setup uses **Webpack** and **npm/yarn** instead of Grunt/Bower:

- **Location**: `app/` directory (source files)
- **Build Tool**: Webpack 5
- **Package Manager**: npm/yarn (no Bower)
- **Configuration**: `webpack.config.js`
- **Entry Point**: `app/scripts/main.js`

**Quick Start:**
```bash
cd web-apps-ui

# Install dependencies
yarn install
# or
npm install

# Development server (with hot reload)
npm start
# Opens http://localhost:9900

# Production build
npm run build
# Output: dist/ directory
```

**For detailed instructions**, see [REACT-NATIVE-MIGRATION.md](./REACT-NATIVE-MIGRATION.md)

**Key Features:**
- ✅ Hot module replacement (HMR)
- ✅ Modern dependency management (npm/yarn)
- ✅ Webpack 5 with code splitting
- ✅ Production-ready builds
- ✅ Source maps for debugging
- ✅ Proxy configuration for backend services

**Integration with Spring Boot:**
After building with Webpack, copy the output to Spring Boot static resources:
```bash
npm run build
cp -r dist/* src/main/resources/static/
./buildMaven.sh
```

#### 2. Legacy Grunt/Bower Setup (Deprecated)

**Status**: ⚠️ Still functional but deprecated

The legacy setup uses **Grunt** and **Bower**:

- **Location**: `app/` directory (source files)
- **Build Tool**: Grunt
- **Package Manager**: Bower + npm
- **Configuration**: `Gruntfile.js`
- **Build Script**: `buildFrontend.sh`

**Quick Start:**
```bash
cd web-apps-ui
./buildFrontend.sh
```

**Note**: This setup is maintained for backward compatibility but is **not recommended** for new development. Use the Webpack setup instead.

**When to Use Each:**

- **Use Webpack (Modern)**: ✅ For all new development, active maintenance, and production builds
- **Use Grunt (Legacy)**: ⚠️ Only if you need to maintain compatibility with old build processes or if Webpack setup has issues

**Both systems can coexist** - they both build from the same `app/` source directory to `dist/` or `src/main/resources/static/`.

---

## Configuration

### Application Configuration (`application.yml`)

- **Server Port**: 9900
- **Gateway Routes**: Configured to route to customer-service and store-service
- **Eureka**: Optional service discovery
- **Management Endpoints**: All endpoints exposed for monitoring

### Gateway Configuration

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: stores
          uri: ${STORE_SERVICE_URI:http://localhost:8081}
          predicates:
            - Path=/stores/**
        - id: customers
          uri: ${CUSTOMER_SERVICE_URI:http://localhost:9000}
          predicates:
            - Path=/customers/**
```

**Note:** The configuration uses direct URLs by default. To use Eureka service discovery, change `uri` to `lb://store-service` or `lb://customer-service`.

---

## Accessing the Application

Once the service is running:

1. **Open browser**: `http://localhost:9900`
2. The application will redirect to the customers page
3. Use the UI to:
   - View and manage customers
   - View stores
   - Search for stores near customers

---

## Troubleshooting

### Port Already in Use
```bash
lsof -i :9900
# Kill process or change port in application.yml
```

### Backend Services Not Found

**If using Eureka:**
- Verify Eureka server is running
- Check service registration: `http://eureka-server:8761`
- Verify customer-service and store-service are registered

**If not using Eureka (default):**
- The gateway uses direct URLs by default (`http://localhost:8081` and `http://localhost:9000`)
- Ensure backend services are running on the default ports
- Or set environment variables to override:
  ```bash
  export STORE_SERVICE_URI=http://localhost:8081
  export CUSTOMER_SERVICE_URI=http://localhost:9000
  ```

### Gateway Routes Not Working

1. Verify backend services are running
2. Check gateway logs for routing errors
3. Test backend services directly:
   - `curl http://localhost:9000/customers`
   - `curl http://localhost:8081/stores`

### Static Resources Not Loading

1. Verify files exist in `src/main/resources/static/`
2. Check browser console for 404 errors
3. Verify Spring Boot is serving static resources correctly

---

## Project Structure

### Frontend Files Organization

The web-apps-ui has two sets of frontend files:

1. **Source Files** (`app/` directory):
   - **Purpose**: Original AngularJS source code for development
   - **Contains**: 
     - `app/scripts/` - JavaScript source files
     - `app/styles/` - CSS/LESS source files
     - `app/views/` - HTML templates
     - `app/index.html` - Main HTML file
   - **Required for**: Frontend development and modifications
   - **Not required for**: Running the service (only needed if you want to modify the frontend)

2. **Built/Static Files** (`src/main/resources/static/` directory):
   - **Purpose**: Compiled, minified, and optimized frontend files served by Spring Boot
   - **Contains**: Pre-built JavaScript, CSS, HTML, images, fonts
   - **Required for**: Running the service (Spring Boot serves these files)
   - **Generated from**: `app/` directory using build tools

### Build Tools and Configuration Files

The following files are used for frontend development and building:

| File                         | Purpose                                              | Required for Running?                 |
|------------------------------|------------------------------------------------------|---------------------------------------|
| `package.json`               | NPM dependencies (Grunt, build tools)                | No - only for frontend development    |
| `bower.json`                 | Frontend library dependencies (AngularJS, Bootstrap) | No - only for frontend development    |
| `Gruntfile.js`               | Grunt build configuration                            | No - only for frontend development    |
| `buildFrontend.sh`            | Script to build frontend from app/ to static/        | No - only for frontend development    |
| `.bowerrc`                   | Bower configuration                                  | No - only for frontend development    |
| `.jshintrc`                  | JavaScript linting rules                             | No - only for frontend development    |
| `.travis.yml`                | Old CI/CD configuration (deprecated)                 | No - can be removed                   |
| `app/` directory             | Frontend source code                                 | No - only for frontend development    |
| `src/main/resources/static/` | Built frontend files                                 | **Yes** - required for service to run |

### Summary

- **To run the service**: Only `src/main/resources/static/` is needed (already present)
- **To modify the frontend**: You need `app/`, `package.json`, `bower.json`, `Gruntfile.js`, and Node.js/NPM/Bower

---

## Development

### Building the Frontend

**Choose Your Build System:**

#### Option 1: Modern Webpack Build (Recommended) ⭐

```bash
cd web-apps-ui

# Install dependencies
yarn install
# or
npm install

# Build for production
npm run build
# Output: dist/ directory

# Copy to Spring Boot static resources
cp -r dist/* src/main/resources/static/

# Rebuild Spring Boot service
./buildMaven.sh
```

**For development with hot reload:**
```bash
npm start
# Opens http://localhost:9900 with auto-reload
```

#### Option 2: Legacy Grunt Build (Deprecated)

```bash
cd web-apps-ui
./buildFrontend.sh
./buildMaven.sh  # Rebuild Spring Boot service
```

**Note**: The Webpack setup is recommended. The Grunt setup is maintained for backward compatibility only.

---

### Frontend Development

The frontend is a pre-built AngularJS application. The service runs using the built files in `src/main/resources/static/`. 

**If you need to modify the frontend:**

#### Modern Webpack Development (Recommended) ⭐

See [REACT-NATIVE-MIGRATION.md](./REACT-NATIVE-MIGRATION.md) for complete Webpack setup instructions.

**Quick Development Workflow:**
```bash
cd web-apps-ui

# Start development server (auto-reload on changes)
npm start
# Opens browser at http://localhost:9900

# Make changes to files in app/ directory
# Changes will auto-reload in browser

# When done, build for production:
npm run build
cp -r dist/* src/main/resources/static/
./buildMaven.sh
```

#### Legacy Grunt Development (Deprecated)

#### Quick Build (Recommended)

Use the provided build script:

```bash
cd web-apps-ui
./buildFrontend.sh
```

This script automatically:
1. **Checks prerequisites**: Node.js, NPM, Bower, Grunt CLI (installs missing tools)
2. **Installs NPM dependencies**: Uses `--legacy-peer-deps` for compatibility with old packages
3. **Installs Bower dependencies**: Frontend libraries (AngularJS, Bootstrap, etc.)
4. **Installs missing imagemin dependencies**: Required for image optimization
5. **Applies Node.js compatibility fixes**: For Node.js 12+ (graceful-fs fix)
6. **Builds frontend using Grunt**: Runs `grunt build --force` (continues despite non-critical errors)
7. **Backs up existing static files**: Creates timestamped backup before overwriting
8. **Copies built files**: From `dist/` to `src/main/resources/static/`
9. **Copies bower_components**: Needed for unprocessed build blocks in HTML
10. **Copies source scripts**: Individual JS files (app.js, routes.js, controllers)
11. **Compiles LESS to CSS**: Converts LESS files to CSS
12. **Copies fonts**: To `styles/app/fonts/` (CSS references them with relative paths)
13. **Copies images**: To `styles/app/images/` (CSS references them with relative paths)
14. **Cleans up backup folders**: Removes old backups after successful build

After building, rebuild the Spring Boot service:
```bash
./buildMaven.sh
```

**Note**: The script handles Node.js compatibility issues automatically. Some non-critical errors (cdnify, grunt-karma) may appear but are ignored with the `--force` flag.

**⚠️ Node.js Version Compatibility:**

The script automatically handles Node.js compatibility:
- **Node.js 14-16**: Works best, no compatibility issues
- **Node.js 18+**: Script applies workarounds automatically (graceful-fs fix)
- **Node.js 12-13**: Works with compatibility fixes
- **Node.js < 12**: May have issues, upgrade recommended

The build script will:
- Warn you if using Node.js 18+
- Automatically install compatibility fixes
- Continue building despite non-critical errors (uses `--force` flag)

**For best results with Node.js 18+:**
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 16
nvm install 16
nvm use 16

# Then run the build
./buildFrontend.sh
```

#### Manual Build Steps

If you prefer to build manually (not recommended - use `buildFrontend.sh` instead):

1. **Prerequisites**:
   ```bash
   # Install Node.js (if not installed)
   # Download from https://nodejs.org/ or use:
   brew install node  # macOS
   
   # Install Bower globally
   npm install -g bower
   
   # Install Grunt CLI globally
   npm install -g grunt-cli
   ```

2. **Install Dependencies**:
   ```bash
   cd web-apps-ui
   npm install --legacy-peer-deps  # Use --legacy-peer-deps for compatibility
   bower install
   ```

3. **Install Missing Dependencies**:
   ```bash
   # Install imagemin dependencies
   npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev --legacy-peer-deps
   
   # Install Node.js compatibility fix (for Node.js 12+)
   npm install graceful-fs@latest --save-dev --legacy-peer-deps
   ```

4. **Build the Frontend**:
   ```bash
   # Production build (minified, optimized) - Recommended
   grunt build --force  # Use --force to continue despite non-critical errors
   ```
   This builds from `app/` to `dist/` directory.

5. **Copy to Static Resources**:
   ```bash
   # Backup existing files (optional)
   cp -r src/main/resources/static src/main/resources/static.backup.$(date +%Y%m%d_%H%M%S)
   
   # Remove old static files
   rm -rf src/main/resources/static/*
   
   # Copy built files
   cp -r dist/* src/main/resources/static/
   
   # Copy bower_components (needed for unprocessed build blocks)
   cp -r bower_components src/main/resources/static/
   
   # Copy source scripts
   mkdir -p src/main/resources/static/scripts/controllers
   cp app/scripts/*.js src/main/resources/static/scripts/
   cp -r app/scripts/controllers/*.js src/main/resources/static/scripts/controllers/
   
   # Compile LESS to CSS
   grunt less:server
   cp .tmp/styles/main.css src/main/resources/static/styles/
   
   # Copy fonts and images (CSS references them with relative paths)
   mkdir -p src/main/resources/static/styles/app/fonts
   mkdir -p src/main/resources/static/styles/app/images
   cp app/fonts/varela_round-webfont.* src/main/resources/static/styles/app/fonts/
   cp app/fonts/montserrat-webfont.* src/main/resources/static/styles/app/fonts/
   cp app/images/spring-logo-platform.png src/main/resources/static/styles/app/images/
   cp app/images/*.png src/main/resources/static/styles/app/images/
   ```

6. **Rebuild Spring Boot Service**:
   ```bash
   ./buildMaven.sh
   ```

**Note**: Manual build is complex and error-prone. Use `./buildFrontend.sh` instead!

#### Development Workflow

For active frontend development:

```bash
# Terminal 1: Start development server (auto-reload on changes)
cd web-apps-ui
grunt serve
# Opens browser at http://localhost:9900

# Terminal 2: Make changes to files in app/ directory
# Changes will auto-reload in browser

# When done, build for production:
./buildFrontend.sh  # Use the build script - it handles everything
./buildMaven.sh     # Rebuild Spring Boot service
```

### Frontend Dependencies

**Current Versions** (from `bower.json`):
- AngularJS: 1.2.16 (very old - consider upgrading)
- Bootstrap: 3.2.0 (old - consider upgrading)
- Angular UI Router: 0.2.10
- Angular Google Maps: 1.2.0

**Upgrading Frontend Dependencies**:

1. **Update `bower.json`**:
   ```json
   {
     "dependencies": {
       "angular": "1.8.x",  // Upgrade from 1.2.16
       "bootstrap": "3.4.x",  // Upgrade from 3.2.0
       ...
     }
   }
   ```

2. **Update Dependencies**:
   ```bash
   bower update
   ```

3. **Test and Fix Breaking Changes**:
   - AngularJS 1.2 → 1.8 has breaking changes
   - Test thoroughly after upgrading
   - Update code if needed

4. **Rebuild**:
   ```bash
   grunt build
   cp -r dist/* src/main/resources/static/
   ```

**Note**: The current frontend dependencies are very old (from 2014). Consider:
- Upgrading to modern AngularJS (1.8.x) or migrating to Angular (2+)
- Upgrading Bootstrap to 3.4.x or 4.x/5.x
- Testing thoroughly after upgrades

### NPM Package Security

**✅ Recent Security Fixes (2025):**
- **glob**: Updated to ^11.1.0 (fixed command injection vulnerability in versions 10.3.7-11.0.3)
- **js-yaml**: Updated to ^4.1.1 (fixed prototype pollution vulnerability in version 4.1.0)

These fixes are enforced via `overrides` and `resolutions` in `package.json` to ensure all transitive dependencies use secure versions.

### Build Tool Dependencies

**Current Versions** (from `package.json`):
- Grunt: ^0.4.1 (very old)
- Node.js: >=0.10.0 (very old requirement)

**⚠️ Security Vulnerabilities:**

The current `package.json` has **multiple security vulnerabilities** in development dependencies:
- **Critical**: grunt-karma (prototype pollution)
- **High**: grunt (arbitrary code execution, race condition, path traversal)
- **Moderate**: karma (cross-site scripting, open redirect)

**Security Risk Assessment:**
- **Runtime Risk**: **NONE** - These are development dependencies only. The service runs using pre-built static files and doesn't execute these tools at runtime.
- **Development Risk**: **HIGH** - If you modify the frontend and run `npm install` or `grunt build`, you're using vulnerable tools.

**Recommendation:**
- **If NOT modifying frontend**: No action needed. The vulnerabilities don't affect the running service.
- **If modifying frontend**: **Upgrade immediately** before running `npm install` or `grunt build`.

**Upgrading Build Tools**:

1. **Update `package.json`**:
   ```json
   {
     "devDependencies": {
       "grunt": "^1.6.0",  // Upgrade from 0.4.1
       ...
     },
     "engines": {
       "node": ">=14.0.0"  // Upgrade from 0.10.0
     }
   }
   ```

2. **Update Dependencies**:
   ```bash
   npm update
   ```

3. **Test Build**:
   ```bash
   grunt build
   lsof -ti:9900 | xargs kill -9
   ```

**Note**: Grunt 0.4 → 1.6 has significant breaking changes. You may need to update `Gruntfile.js` syntax.

**Security-Focused Upgrade Example:**

Here's a safer `package.json` with updated versions that address the security vulnerabilities:

```json
{
  "name": "customersstoresui",
  "version": "0.0.0",
  "devDependencies": {
    "grunt": "^1.6.0",
    "grunt-autoprefixer": "^0.8.2",
    "grunt-concurrent": "^3.0.1",
    "grunt-contrib-clean": "^2.0.1",
    "grunt-contrib-concat": "^2.1.0",
    "grunt-contrib-connect": "^3.0.0",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-contrib-cssmin": "^5.0.0",
    "grunt-contrib-htmlmin": "^3.1.0",
    "grunt-contrib-imagemin": "^5.0.0",
    "grunt-contrib-jshint": "^3.2.0",
    "grunt-contrib-uglify": "^5.2.2",
    "grunt-contrib-watch": "^1.1.0",
    "grunt-filerev": "^2.3.1",
    "grunt-google-cdn": "^0.6.0",
    "grunt-newer": "^1.3.0",
    "grunt-ngmin": "^0.0.3",
    "grunt-svgmin": "^6.0.1",
    "grunt-usemin": "^3.1.1",
    "grunt-wiredep": "^5.0.0",
    "jshint-stylish": "^2.2.1",
    "load-grunt-tasks": "^5.1.0",
    "time-grunt": "^2.0.0",
    "grunt-karma": "^4.0.2",
    "karma": "^6.4.0",
    "karma-jasmine": "^5.1.0",
    "karma-chrome-launcher": "^3.1.1",
    "grunt-contrib-less": "^3.0.0",
    "grunt-connect-proxy": "^0.2.3"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "scripts": {
    "test": "grunt test"
  }
}
```

**Important Notes:**
- `karma-phantomjs-launcher` is deprecated (PhantomJS is no longer maintained). Use `karma-chrome-launcher` instead.
- Many grunt plugins have breaking changes between versions.
- Test thoroughly after upgrading, as some plugins may require configuration changes.

### Removing Unused Files

If you're not planning to modify the frontend, you can optionally remove:
- `app/` directory (source files)
- `package.json`, `bower.json`, `Gruntfile.js` (build tools)
- `.bowerrc`, `.jshintrc`, `.travis.yml` (config files)
- `test/` directory (if present)

**However**, it's recommended to keep them for future reference and potential frontend updates.

---

## Docker

Build Docker image:
```bash
cd web-apps-ui
./buildMaven.sh
docker build -t web-apps-ui:latest -f src/main/docker/Dockerfile .
```

Run Docker container:
```bash
docker run -p 9900:9900 \
  -e CONFIG_SERVER_URI=http://host.docker.internal:8888 \
  web-apps-ui:latest
```

---

## Related Services

- **[Customer Service](../customer-service/README.md)** - Customer management backend
- **[Store Service](../store-service/README.md)** - Store management backend

---

## Notes

- The service has been upgraded to **Spring Boot 3.5.7** and **Spring Cloud 2024.0.0**
- **Ribbon** and **Hystrix** configurations have been removed (deprecated in Spring Boot 3.x)
- Spring Cloud Gateway now uses **Spring Cloud LoadBalancer** instead of Ribbon
- The service can run without Eureka, but load balancing requires service discovery
- Frontend is pre-built and served as static resources
- No unit tests are currently implemented

---

## Legacy Notes

The original README mentioned:
- **Groovy/Spring CLI**: The service now uses Java (`WebAppsServiceApplication.java`), not Groovy
- **Grunt/Bower**: Used for frontend development, but the service now uses pre-built static resources
- **Spring Boot CLI**: No longer needed - use `mvn spring-boot:run` instead
