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

| Route | Backend Service | Description |
|-------|----------------|-------------|
| `/stores/**` | store-service | Routes to store-service |
| `/customers/**` | customer-service | Routes to customer-service |
| `/` | Static | Redirects to `/index.html#/customers` |

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

## Development

### Frontend Development

The frontend is a pre-built AngularJS application. If you need to modify the frontend:

1. **Original source** (if available): Check `app/` directory
2. **Build tools**: Grunt, Bower, NPM (see original README notes below)
3. **Built files**: Located in `src/main/resources/static/`

**Note**: The original README mentioned using Grunt/Bower for frontend development, but the service now uses pre-built static resources. For frontend changes, you may need to:
- Install Node.js and NPM
- Install Bower: `npm install -g bower`
- Install dependencies: `npm install && bower install`
- Build: `grunt build`
- Copy built files to `src/main/resources/static/`

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
