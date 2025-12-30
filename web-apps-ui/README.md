# Web Apps UI Service

## Overview

The **web-apps-ui** is a Spring Boot microservice that serves as a gateway and frontend for the retail-suite application. It provides an **Angular 21**-based user interface and routes requests to the customer-service and store-service using Spring Cloud Gateway.

## Key Features

- **Angular 21** frontend with TypeScript for customer and store management
- **Bootstrap 5.3.3** for modern, responsive UI components
- Spring Cloud Gateway for routing to backend services
- Service discovery via Eureka (optional)
- Static resource serving
- API gateway functionality
- Webpack 5 for modern build tooling
- Hot module replacement for development
- Customer management (list, create, view details, delete)
- Store management (list, view)
- Google Maps integration for store locations

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
- **Spring Cloud Gateway**: 2024.0.0
- **Java**: 21

### Frontend
- **Angular**: 21.0.6
- **TypeScript**: 5.9.0
- **Bootstrap**: 5.3.3
- **RxJS**: 7.8.1
- **Webpack**: 5.89.0
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

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

- **customer-service**: Must be running on port 8082 (or discoverable via Eureka)
- **store-service**: Must be running on port 8081 (or discoverable via Eureka)

### Maven Dependencies

- Spring Boot Starter WebFlux
- Spring Cloud Starter Gateway
- Spring Cloud Starter Netflix Eureka Client
- Spring Cloud Starter Config

### Gateway Routes

The service uses Spring Cloud Gateway to route requests to backend services:

| Route           | Backend Service  | Description                           |
|-----------------|------------------|---------------------------------------|
| `/stores/**`    | store-service    | Routes to store-service               |
| `/customers/**` | customer-service | Routes to customer-service            |
| `/`             | Static           | Redirects to `/index.html#/customers` |

**Default Configuration (Direct URLs):**
- `http://localhost:8081` - Direct route to store-service
- `http://localhost:8082` - Direct route to customer-service

**Using Eureka (Optional):**
Update routes in `application.yml` to use `lb://store-service` or `lb://customer-service` for service discovery.

**Environment Variables:**
```bash
export STORE_SERVICE_URI=http://localhost:8081
export CUSTOMER_SERVICE_URI=http://localhost:8082
export CONFIG_SERVER_URI=http://localhost:8888
```

## Build

### Prerequisites

**Backend:**
- Java 21+
- Maven 3.6+

**Frontend:**
- Node.js >= 18.0.0
- npm >= 9.0.0

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
# or
yarn install
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

2. **Start Eureka Server** (optional, for service discovery)

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

# Start development server
npm start
# Opens http://localhost:9016 with auto-reload on file changes
# Proxies /customers → http://localhost:8082
# Proxies /stores → http://localhost:8081
```

**Note**: The Webpack development server runs independently and can run simultaneously with the Spring Boot service on different ports if needed.

### Accessing the Application

Once the service is running:

1. **Open browser**: `http://localhost:9016` (for npm start) or `http://localhost:8083` (for Spring Boot)
2. The application will redirect to the customers page
3. Use the UI to:
   - View and manage customers
   - View stores
   - Search for stores near customers

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
│   │   │   ├── customer-details/     # Customer details component
│   │   │   ├── store-list/           # Store list component
│   │   │   └── about/                # About component
│   │   ├── services/                 # Angular services
│   │   │   ├── customer.service.ts   # Customer service for API communication
│   │   │   └── store.service.ts      # Store service for API communication
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
├── webpack.config.js                 # Webpack build configuration
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
- **To modify the frontend**: You need `src/`, `package.json`, `webpack.config.js`, `tsconfig.json`, and Node.js 18+/npm 9+

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

**If using Eureka:**
- Verify Eureka server is running
- Check service registration: `http://eureka-server:8761`
- Verify customer-service and store-service are registered

**If not using Eureka (default):**
- The gateway uses direct URLs by default (`http://localhost:8081` for stores and `http://localhost:8082` for customers)
- Ensure backend services are running on the default ports:
  - Store service: `8081`
  - Customer service: `8082`
- Or set environment variables to override:
  ```bash
  export STORE_SERVICE_URI=http://localhost:8081
  export CUSTOMER_SERVICE_URI=http://localhost:8082
  ```

### Gateway Routes Not Working

1. Verify backend services are running
2. Check gateway logs for routing errors
3. Test backend services directly:
   - `curl http://localhost:8082/customers`
   - `curl http://localhost:8081/stores`

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
npm install --legacy-peer-deps
```

**Build Issues:**
```bash
# Check for errors
npm run build 2>&1 | tee build.log

# Verify dependencies
npm list --depth=0

# Common fixes:
# - Ensure Node.js >= 18.0.0
# - Ensure npm >= 9.0.0
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
   - Migrated from AngularJS 1.8.3 to Angular 21.0.6
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
- ✅ **webpack-dev-server vulnerabilities**: Updated to 5.2.1
- ✅ **Dependency vulnerabilities**: All critical and high-severity issues resolved

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

- The service has been upgraded to **Spring Boot 3.5.7** and **Spring Cloud 2024.0.0**
- **Ribbon** and **Hystrix** configurations have been removed (deprecated in Spring Boot 3.x)
- Spring Cloud Gateway now uses **Spring Cloud LoadBalancer** instead of Ribbon
- The service can run without Eureka, but load balancing requires service discovery
- Frontend is built with **Angular 21** and **TypeScript 5.9**
- Frontend is pre-built and served as static resources
- No unit tests are currently implemented
- The old `app/` directory (AngularJS) is preserved for reference but is no longer used

### Related Services

- **[Customer Service](../customer-service/README.md)** - Customer management backend
- **[Store Service](../store-service/README.md)** - Store management backend

---

# Author
- Rohtash Lakra
