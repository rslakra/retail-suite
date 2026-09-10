# Web Apps UI Service

## Overview

The **web-apps-ui** is a Spring Boot microservice that serves the retail-suite frontend and proxies API calls to backend services. It provides an **Angular 21** user interface; `ApiProxyController` forwards `/api/customers/**` and `/api/stores/**` to customer-service and store-service.

## Key Features

- **Angular 21** frontend with TypeScript for customer and store management
- **Bootstrap 5** for responsive UI components
- **ApiProxyController** (Spring Web MVC + RestTemplate) for backend routing on port `8083`
- **Webpack dev server** on port `9016` with `/api/*` proxy to backends during development
- Static resource serving from `src/main/resources/static/`
- Webpack 5 build tooling; hot module replacement for development
- Customer management (list, add, edit, view details, delete)
- Nearby-store search on customer details (distance + optional name/city filter)
- Optional **Google Maps** (geocode/map on add/edit; runtime load via `GOOGLE_MAPS_API_KEY`)

## Service Information

- **UI Spring Boot Port**: `8083`
- **Angular Dev Server Port**: `9016` (npm start)
- **Customer Service Port**: `8082`
- **Store Service Port**: `8081`
- **Application Name**: `retail-suite-ui`
- **Base URL**: `http://localhost:8083` (Spring Boot) or `http://localhost:9016` (npm start)
- **Java Version**: 21
- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2024.0.0

## Tech Stack

### Backend
- **Spring Boot**: 3.5.7
- **Spring Web MVC** (`spring-boot-starter-web`)
- **Java**: 21

### Frontend
- **Angular**: 21.2.x
- **TypeScript**: 5.9.x
- **Bootstrap**: 5.3.x
- **RxJS**: 7.8.x
- **Webpack**: 5.x
- **webpack-dev-server**: 6.x
- **Node.js**: >= 22.15.0 (required by webpack-dev-server 6)
- **npm**: >= 10.0.0 (**npm only** — no `yarn.lock`)

## Dependencies

### Backend Services (required for full functionality)

- **customer-service** on port `8082`
- **store-service** on port `8081` (required for nearby-store search and store list)

### Maven Dependencies

- Spring Boot Starter Web (`spring-boot-starter-web`)

### API Proxy Routes

`ApiProxyController` forwards requests from the Angular app to backend services:

| Route              | Backend Service  | Description                    |
|--------------------|------------------|--------------------------------|
| `/api/customers/**`| customer-service | Customer CRUD (Spring Data REST) |
| `/api/stores/**`   | store-service    | Store list and geospatial search |
| `/`, static assets | —                | Angular SPA from `classpath:/static/` |

**Default backend URLs** (in `application.yml`):

- `http://localhost:8082` — customer-service
- `http://localhost:8081` — store-service

**Webpack dev server** (`npm start`) uses the same `/api/*` paths and proxies to those ports (see `webpack.config.js`).

**Environment variables:**

```bash
export STORE_SERVICE_URI=http://localhost:8081
export CUSTOMER_SERVICE_URI=http://localhost:8082
```

**Google Maps (optional):**

```bash
cd web-apps-ui
cp .env.example .env
# set GOOGLE_MAPS_API_KEY in .env, then npm start or npm run build
```

Maps load at runtime when a key is set. Without a key, customer CRUD and nearby-store search still work; map panels show a configuration warning.

## Build

### Prerequisites

**Backend:**
- Java 21+
- Maven 3.6+

**Frontend:**
- Node.js >= 22.15.0
- npm >= 10.0.0

### Build Backend

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

**Note**: 
- Currently, there are no unit tests in this service. The build script skips tests by default.
- The `buildMaven.sh` script automatically builds the frontend (if needed) and copies it to `src/main/resources/static/` before running Maven
- The `static/` folder is populated during the build process - it should be empty initially (or only contain `.gitkeep`)

The build script creates:
- SNAPSHOT version: `target/web-apps-ui-0.0.X-SNAPSHOT.jar`
- RELEASE version: `target/web-apps-ui-0.0.X.jar`

### Build Frontend

**Install dependencies (first time only):**
```bash
cd web-apps-ui
npm install
```

**Production build:**
```bash
# Build for production
npm run build
# Output: dist/ directory

# Note: The build scripts (buildMaven.sh, runMaven.sh) automatically copy
# dist/* to src/main/resources/static/ before building/running.
# You don't need to manually copy files.

# Rebuild Spring Boot service (automatically handles static/ folder)
./buildMaven.sh
```

**Development build (with source maps):**
```bash
npm run build:dev
# Source maps available in browser DevTools
```

## Run

### Prerequisites

1. **Start backend services** (recommended):
   - Start customer-service (see [Customer Service README](../customer-service/README.md))
   - Start store-service (see [Store Service README](../store-service/README.md))

### Run Backend

**Option 1: Using run script (recommended)**
```bash
cd web-apps-ui
./runMaven.sh
```

**Option 2: Using Maven**
```bash
cd web-apps-ui
mvn spring-boot:run
```

**Option 3: Run JAR file**
```bash
cd web-apps-ui
java -jar target/web-apps-ui-*.jar
```

**Note**: 
- These options run the Spring Boot service with pre-built static files from `src/main/resources/static/`
- The `runMaven.sh` script automatically builds the frontend (if needed) and copies it to `src/main/resources/static/` before starting the service
- The `static/` folder is populated during the build process - it should be empty initially

### Run Frontend (Development Server)

For active frontend development with hot module replacement:
```bash
cd web-apps-ui

# Install dependencies (first time only)
npm install

# Optional: copy .env.example to .env and set GOOGLE_MAPS_API_KEY for maps

# Start development server
npm start
# Opens http://localhost:9016 with auto-reload on file changes
# Proxies /api/customers → http://localhost:8082/customers
# Proxies /api/stores → http://localhost:8081/stores
```

**Note**: The Webpack development server runs independently and can run simultaneously with the Spring Boot service on different ports if needed.

### Accessing the Application

Once the service is running:

1. **Open browser**: `http://localhost:9016` (`npm start`) or `http://localhost:8083` (Spring Boot)
2. The application loads the customers module at `/customers`

**UI routes (dev server on `9016`):**

| Page | URL | Notes |
|------|-----|--------|
| Customer list | `/customers` | List, add, edit, delete |
| Add customer | `/customers/add` | Form + optional map |
| Edit customer | `/customers/{id}/edit` | Updates via `PATCH` + `merge-patch+json`; save/cancel returns to `/customers` |
| Search nearby stores | `/customers/{id}` | Enter distance (km) and optional name/city filter, then **Search Stores** |
| Store list | `/stores` | View stores |

Nearby-store search calls store-service (`/stores/search/findByAddressLocationNear`). Results are not auto-loaded — click **Search Stores**. MongoDB must be running with store data.

## Test

Currently, there are no unit tests in this service. To run tests (if added in the future):

**Backend tests:**
```bash
cd web-apps-ui
mvn test
```

**Frontend tests:**
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Lint TypeScript files
npm run lint
```

## Project Structure

### Backend Structure

```
/
├── src/                              # The src folder
│   └── main/                         # Main source directory
│       ├── java/                     # Java source code
│       │   └── .../controller/
│       │       ├── ApiProxyController.java   # Proxies /api/customers, /api/stores
│       │       └── HomeController.java       # SPA fallback routing
│       ├── resources/                # Application resources
│       │   ├── application.yml       # Application configuration file
│       │   └── static/               # Built frontend files (populated by build process)
│       │                             # Should be empty initially (or only contain .gitkeep)
│       │                             # Automatically populated by buildMaven.sh or runMaven.sh
│       └── docker/                   # Docker configuration directory
│           └── Dockerfile            # Docker image build configuration
├── buildMaven.sh                     # Maven build script that automatically builds frontend and packages the application
├── runMaven.sh                       # Maven run script that automatically builds frontend and runs the Spring Boot application
├── pom.xml                           # Project Object Model - Maven configuration file
└── README.md                         # This documentation file
```

**Important Notes about `static/` folder:**
- The `src/main/resources/static/` folder should be **empty initially** (or only contain `.gitkeep` for Git tracking)
- The build process (`buildMaven.sh`, `runMaven.sh`, `baseBuildMaven.sh`) automatically:
  1. Checks if the frontend needs to be built
  2. Builds the frontend using Webpack (if needed)
  3. Copies the built files from `dist/` to `src/main/resources/static/`
  4. Then runs Maven to package everything
- **Do not manually maintain files in `static/`** - they are generated during the build
- If you need to update the frontend, modify the source files in `src/` and rebuild

### Frontend Structure

```
/
├── src/                              # Frontend source directory
│   ├── app/                          # Angular application directory
│   │   ├── components/               # Angular components
│   │   │   ├── customer-list/        # Customer list component
│   │   │   ├── customer-add/         # Customer add component
│   │   │   ├── customer-edit/        # Customer edit component
│   │   │   ├── customer-details/     # Customer details + nearby-store search
│   │   │   ├── store-list/           # Store list component
│   │   │   └── about/                # About component
│   │   ├── features/                 # Lazy-loaded feature modules
│   │   │   ├── customers/            # Customer routes (list, add, edit, details)
│   │   │   ├── stores/               # Store routes
│   │   │   └── about/                # About route
│   │   ├── services/                 # Angular services
│   │   │   ├── customer.service.ts   # Customer API (PATCH merge-patch for updates)
│   │   │   ├── store.service.ts      # Store API + geospatial search
│   │   │   └── google-maps-loader.service.ts  # Runtime Google Maps script load
│   │   ├── models/                   # TypeScript interfaces and models
│   │   │   ├── customer.model.ts     # Customer data model
│   │   │   └── store.model.ts        # Store data model
│   │   ├── app.component.ts          # Root Angular component
│   │   ├── app.module.ts             # Root Angular module
│   │   └── app.routes.ts             # Angular routing configuration
│   ├── assets/                       # Static assets (images, fonts, etc.)
│   ├── main.ts                       # Application entry point
│   ├── index.html                    # Main HTML template
│   └── styles.css                    # Global CSS styles
├── package.json                      # NPM dependencies and scripts configuration
├── webpack.config.js                 # Webpack build + dev-server proxy configuration
├── .env.example                      # Template for GOOGLE_MAPS_API_KEY
├── scripts/load-env.mjs              # Loads .env before webpack start/build
├── tsconfig.json                     # TypeScript compiler configuration
└── README.md                         # This documentation file
```

### Build Tools and Configuration Files

| File                         | Purpose                                              | Required for Running?                 |
|------------------------------|------------------------------------------------------|---------------------------------------|
| `package.json`               | NPM dependencies (Angular, Webpack, build tools)     | No - only for frontend development    |
| `webpack.config.js`          | Webpack build configuration                          | No - only for frontend development    |
| `tsconfig.json`              | TypeScript compiler configuration                    | No - only for frontend development    |
| `src/` directory             | Angular 21 TypeScript source code                    | No - only for frontend development    |
| `src/main/resources/static/` | Built frontend files (populated by build process)    | **Yes** - required for service to run |

**Summary:**
- **To run the service**: The `src/main/resources/static/` folder is automatically populated during the build process (`buildMaven.sh` or `runMaven.sh`)
- **Important**: The `static/` folder should be **empty initially** (or only contain `.gitkeep`). The build scripts automatically copy the built frontend files from `dist/` to `static/` before Maven builds/runs
- **To modify the frontend**: You need `src/`, `package.json`, `webpack.config.js`, `tsconfig.json`, and Node.js 22.15+/npm 10+

## Troubleshooting

### Port Already in Use
```bash
# For Angular/Node dev server (npm start):
lsof -i :9016
# For Spring Boot UI:
lsof -i :8083
# Kill process or change port in webpack.config.js (dev server) or application.yml (Spring Boot)
```

### Backend Services Not Found

- Ensure **customer-service** (`8082`) and **store-service** (`8081`) are running
- Dev server proxies `/api/customers` and `/api/stores`; Spring Boot uses `ApiProxyController` on the same paths
- Override URLs if needed:
  ```bash
  export STORE_SERVICE_URI=http://localhost:8081
  export CUSTOMER_SERVICE_URI=http://localhost:8082
  ```

### API Proxy / Proxy Routes Not Working

1. Verify backend services are running
2. Check Spring Boot or webpack-dev-server logs for proxy errors
3. Test backends directly:
   - `curl http://localhost:8082/customers`
   - `curl http://localhost:8081/stores`
4. Test through the UI proxy:
   - `curl http://localhost:8083/api/customers` (Spring Boot)
   - `curl http://localhost:9016/api/customers` (dev server)

### Customer Update Fails

- UI uses **`PATCH`** with `Content-Type: application/merge-patch+json` (not `PUT`)
- Ensure **customer-service** is running on `8082`

### No Nearby Stores in Search

- **store-service** must be on `8081`; **MongoDB** must be running with store data
- On `/customers/{id}`, click **Search Stores** (results are not auto-loaded)
- Set distance (km) and optional name/city filter before searching

### Google Maps Warnings

- Copy `.env.example` to `.env` and set `GOOGLE_MAPS_API_KEY`
- Restart `npm start` or rebuild after changing the key
- Maps are optional; CRUD and store search work without a key

### Static Resources Not Loading

1. **Verify build process completed**: The `static/` folder should be populated by `buildMaven.sh` or `runMaven.sh`
   - If `static/` is empty, run `./buildMaven.sh` or `./runMaven.sh` to build the frontend
   - The build scripts automatically copy files from `dist/` to `src/main/resources/static/`
2. **Verify files exist**: Check that `src/main/resources/static/index.html` exists after build
3. **Check browser console** for 404 errors
4. **Verify Spring Boot** is serving static resources correctly
5. **Note**: The `static/` folder should be empty initially - it's populated during the build process

### Frontend Development Issues

**Installation Issues:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If stuck on dependency resolution:
npm install
```

**Build Issues:**
```bash
# Check for errors
npm run build 2>&1 | tee build.log

# Verify dependencies
npm list --depth=0

# Common fixes:
# - Ensure Node.js >= 22.15.0
# - Ensure npm >= 10.0.0
# - Use npm only (no yarn.lock)
# - Clear node_modules and reinstall
```

**Runtime Issues:**
```bash
# Check browser console for errors
# Verify all dependencies loaded
# Check network tab for failed requests

# Verify build output
ls -la dist/
# Should contain: index.html, scripts/, styles/, images/, fonts/
```

**TypeScript Compilation Errors:**
- Ensure `tsconfig.json` has correct `moduleResolution` setting
- Check that all Angular imports are correct
- Verify TypeScript version is 5.9.0 (compatible with Angular 21)

**Debugging:**
```bash
# Development server with debugging
npm start
# Open browser DevTools (F12)
# Set breakpoints in src/app/**/*.ts files
# Source maps are enabled for debugging
```

## Docker

Build Docker image:
```bash
cd web-apps-ui
./buildMaven.sh
docker build -t web-apps-ui:latest -f src/main/docker/Dockerfile .
```

Run Docker container:
```bash
docker run -p 8083:8083 \
  -e CONFIG_SERVER_URI=http://host.docker.internal:8888 \
  web-apps-ui:latest
```

## Notes

### Migration History

**✅ Completed Migrations:**

1. **AngularJS → Angular 21** (Completed)
   - Migrated from AngularJS 1.8.3 to Angular 21
   - Converted JavaScript to TypeScript
   - Updated all components, services, and routing
   - Resolved all AngularJS security vulnerabilities
   - **Architecture changes:**
     - Module-based → Component-based architecture
     - Controllers → Components
     - $scope → Component properties
     - $http service → HttpClient
     - JavaScript → TypeScript
   - **Key migration points:**
     - Routing: Uses `@angular/router` instead of `angular-ui-router`
     - HTTP: Uses `HttpClient` with observables instead of `$http` promises
     - Templates: Uses Angular directives (`*ngFor`, `*ngIf`) instead of AngularJS directives
     - Forms: Uses Angular Forms with `ngModel` instead of `ng-model`
     - Bootstrap: Updated to Bootstrap 5 with new class names

2. **Bootstrap 3 → Bootstrap 5** (Completed)
   - Migrated from Bootstrap 3.4.1 to Bootstrap 5.3.3
   - Updated all CSS classes and components
   - Resolved all Bootstrap XSS vulnerabilities

3. **Build System Modernization** (Completed)
   - Migrated from Grunt/Bower to Webpack/npm
   - Updated to Webpack 5 with modern tooling
   - Implemented TypeScript compilation
   - Added hot module replacement for development

### Security

**✅ All Security Vulnerabilities Resolved**

The migration to Angular 21 and Bootstrap 5 has resolved all known security vulnerabilities:

- ✅ **AngularJS vulnerabilities**: Eliminated by migrating to Angular 21
- ✅ **Bootstrap 3 XSS vulnerabilities**: Eliminated by migrating to Bootstrap 5
- ✅ **webpack-dev-server vulnerabilities**: Updated to 6.x (requires Node.js 22.15+)
- ✅ **Dependency vulnerabilities**: `npm audit` reports 0 vulnerabilities (overrides in `package.json`)

**Security Best Practices:**
1. **Input Validation**: Always validate and sanitize user inputs on the server side
2. **Content Security Policy**: Implement strict CSP headers
3. **Regular Audits**: Run `npm audit` regularly to identify new vulnerabilities
4. **Dependency Updates**: Keep dependencies up to date
5. **Security Headers**: Implement security headers (X-Frame-Options, X-Content-Type-Options, etc.)
6. **HTTPS**: Always use HTTPS in production
7. **Rate Limiting**: Implement rate limiting to mitigate DoS attacks

**Recent Security Fixes:**
- **glob**: Updated to ^11.1.0 (fixed command injection vulnerability)
- **js-yaml**: Updated to ^4.1.1 (fixed prototype pollution vulnerability)
- **rimraf**: Updated to ^5.0.5 (fixed in overrides)

These fixes are enforced via `overrides` and `resolutions` in `package.json` to ensure all transitive dependencies use secure versions.

### Additional Notes

- Backend uses **Spring Boot 3.5.7** with **Spring Web MVC** (`ApiProxyController`), not Spring Cloud Gateway
- Frontend is **Angular 21** + **TypeScript 5.9**, built with **Webpack 5** and **webpack-dev-server 6**
- Frontend is pre-built and served as static resources (`buildMaven.sh` / `buildWebapp.sh` copy `dist/` → `static/`)
- **npm only** for frontend dependencies (`engines`: Node >= 22.15.0, npm >= 10.0.0)
- No backend unit tests; frontend Karma tests may need updates (legacy AngularJS references)
- Legacy `app/` and `bower_components/` folders may remain on disk but are not used

### Related Services

- **[Customer Service](../customer-service/README.md)** - Customer management backend
- **[Store Service](../store-service/README.md)** - Store management backend

---

# Author
- Rohtash Lakra
