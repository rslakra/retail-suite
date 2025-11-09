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

**Option 1: Using run script**
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

### Frontend Development

The frontend is a pre-built AngularJS application. The service runs using the built files in `src/main/resources/static/`. 

**If you need to modify the frontend:**

1. **Prerequisites**:
   - Node.js (v0.10+ or newer)
   - NPM (comes with Node.js)
   - Bower: `npm install -g bower`

2. **Install Dependencies**:
   ```bash
   cd web-apps-ui
   npm install
   bower install
   ```

3. **Build Process**:
   ```bash
   # Development build (with source maps, no minification)
   grunt serve
   
   # Production build (minified, optimized)
   grunt build
   ```
   This builds from `app/` to `dist/` directory.

4. **Copy to Static Resources**:
   After building, copy the contents of `dist/` to `src/main/resources/static/`:
   ```bash
   cp -r dist/* src/main/resources/static/
   ```

5. **Rebuild Spring Boot Service**:
   ```bash
   ./buildMaven.sh
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

### Build Tool Dependencies

**Current Versions** (from `package.json`):
- Grunt: ^0.4.1 (very old)
- Node.js: >=0.10.0 (very old requirement)

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
   ```

**Note**: Grunt 0.4 → 1.6 has significant breaking changes. You may need to update `Gruntfile.js` syntax.

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
