# RetailSuite Microservices

## Project Overview

This project contains 3 standalone Spring Boot Maven based microservices:

- **retail-suite-store-service** - MongoDB-based service for store management with geospatial functionality
- **retail-suite-customer-service** - JPA-based service for customer management
- **retail-suite-ui** - Angular frontend with Spring Boot backend

The customer-service integrates with store-service to discover nearby stores for customers. It uses Resilience4j circuit breaker to monitor store-service availability and includes links to nearby stores in customer resources when available.

---

## Quick Start

**Prerequisites:**
- Java 21+
- Maven 3.6+
- Docker (for infrastructure services)
- Node.js 18+ and npm/yarn (for web-apps-ui frontend development - optional)

**Infrastructure Services:**
1. Start RabbitMQ: See [RabbitMQ README](rabbitmq/README.md)
2. Start MongoDB: See [MongoDB README](mongodb/README.md)

**Service Ports:**
- customer-service: `8082`
- store-service: `8081`
- web-apps-ui (Spring Boot): `8083`
- web-apps-ui (Angular Dev Server): `9016` (npm start - optional)

**Run Services:**
```bash
# Terminal 1 - Customer Service
cd customer-service && ./runMaven.sh

# Terminal 2 - Store Service
cd store-service && ./runMaven.sh

# Terminal 3 - UI Service
cd web-apps-ui && ./runMaven.sh
```

**Access UI:** 
- Spring Boot: `http://localhost:8083`
- Angular Dev Server: `http://localhost:9016` (npm start - optional)

---

## Service Documentation

For detailed information about each service, see their respective README files:

### Services

- **[Customer Service](customer-service/README.md)** - Customer management service
  - Build, run, test instructions
  - REST API endpoints
  - Dependencies and configuration
  - Integration with store-service

- **[Store Service](store-service/README.md)** - Store management service with geospatial queries
  - Build, run, test instructions
  - REST API endpoints including geospatial search
  - MongoDB configuration
  - Geospatial query documentation

- **[Web Apps UI](web-apps-ui/README.md)** - UI service with Angular frontend
  - Build, run, test instructions
  - API proxy configuration
  - Frontend structure and development (Angular 21)
  - Static resources management
  - Spring MVC with API proxy controller

### Infrastructure Services

- **[RabbitMQ](rabbitmq/README.md)** - Message broker for Spring Cloud Bus
  - Installation and setup
  - Start/stop instructions
  - Management UI access
  - Configuration

- **[MongoDB](mongodb/README.md)** - NoSQL database for store-service
  - Installation and setup
  - Start/stop instructions
  - Connection details
  - Database structure and geospatial indexes

---

## Architecture

### Technology Stack

- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2024.0.0
- **Java**: 21
- **Build Tool**: Maven

### Service Dependencies

- **customer-service**:
  - Spring Data JPA (H2/MySQL)
  - Spring Data REST
  - Spring HATEOAS
  - Resilience4j (Circuit Breaker)
  - Eureka Client (optional)
  - RabbitMQ (Spring Cloud Bus)

- **store-service**:
  - Spring Data MongoDB
  - Spring Data REST
  - Spring Batch
  - Eureka Client (optional)
  - RabbitMQ (Spring Cloud Bus)

- **web-apps-ui**:
  - Spring Web MVC
  - RestTemplate (API proxy)
  - Angular 21 frontend
  - Webpack for frontend builds
  - Static resources served from classpath

### Service Communication

- **customer-service** → **store-service**
  - Integration endpoint: `http://localhost:8081`
  - Uses Resilience4j circuit breaker
  - Periodically verifies store service availability
  - Adds `stores-nearby` links to customer resources

- **web-apps-ui** → **customer-service** & **store-service**
  - API Proxy: `/api/customers/**` → `http://localhost:8082/customers/**`
  - API Proxy: `/api/stores/**` → `http://localhost:8081/stores/**`
  - Uses `ApiProxyController` with RestTemplate
  - Configurable via `customer.service.uri` and `store.service.uri` in `application.yml`
  - No Eureka required (direct URLs)

---

## Prerequisites Setup

### 1. Infrastructure Services

**RabbitMQ:**
```bash
cd rabbitmq
./startRabbitMQServer.sh
```
See [RabbitMQ README](rabbitmq/README.md) for details.

**MongoDB:**
```bash
cd mongodb
./startMongoDBService.sh
```
See [MongoDB README](mongodb/README.md) for details.

### 2. Optional Services

- **Eureka Server**: Service discovery (optional, services can run without it)
- **Config Server**: Centralized configuration (optional, services have local fallback)

---

## Build

### Build All Services

```bash
# From root directory
mvn clean install
```

### Build Individual Services

See individual service READMEs for detailed build instructions:
- [Customer Service Build](customer-service/README.md#build)
- [Store Service Build](store-service/README.md#build)
- [Web Apps UI Build](web-apps-ui/README.md#build)

---

## Run

### Running Individual Services

Each service can be run independently. See detailed instructions:

- [Customer Service Run](customer-service/README.md#run)
- [Store Service Run](store-service/README.md#run)
- [Web Apps UI Run](web-apps-ui/README.md#run)

### Running All Services

**Terminal 1 - Customer Service:**
```bash
cd customer-service && ./runMaven.sh
```

**Terminal 2 - Store Service:**
```bash
cd store-service && ./runMaven.sh
```

**Terminal 3 - UI Service (Spring Boot):**
```bash
cd web-apps-ui && ./runMaven.sh
```

**Terminal 4 - UI Service (Frontend Development - Optional):**
For frontend development with hot reload:
```bash
cd web-apps-ui
# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start development server with hot reload
npm start
# Opens http://localhost:9016 with auto-reload on file changes
# Proxies /api/customers → http://localhost:8082
# Proxies /api/stores → http://localhost:8081
```

**Note**: 
- The Spring Boot service (Terminal 3) serves the pre-built frontend from `src/main/resources/static/`
- The frontend development server (Terminal 4) is optional and only needed if you're actively developing the frontend with hot reload
- The Angular dev server runs on port `9016` and proxies API calls to backend services

---

## Environment Variables

```bash
# RabbitMQ
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672

# MongoDB
export MONGODB_HOST=localhost
export MONGODB_PORT=27017

# Config Server (optional)
export CONFIG_SERVER_URI=http://user:password@localhost:8888
```

---

## Testing

### Run Tests

```bash
# All services
mvn test

# Individual service
cd customer-service && mvn test
cd store-service && mvn test
```

See individual service READMEs for test details:
- [Customer Service Tests](customer-service/README.md#test)
- [Store Service Tests](store-service/README.md#test)
- [Web Apps UI Tests](web-apps-ui/README.md#test)

---

## API Endpoints

### Customer Service
- Base URL: `http://localhost:8082`
- See [Customer Service API Documentation](customer-service/README.md#rest-api-endpoints)

### Store Service
- Base URL: `http://localhost:8081`
- See [Store Service API Documentation](store-service/README.md#rest-api-endpoints)

### Web Apps UI
- Spring Boot: `http://localhost:8083`
- Angular Dev Server: `http://localhost:9016` (npm start)
- API Proxy: `/api/customers/**` → customer-service, `/api/stores/**` → store-service

---

---

## Docker Deployment

Each service has a Dockerfile in `src/main/docker/`:

1. Build JARs first using `buildMaven.sh` in each service directory
2. Build Docker images from the Dockerfiles
3. Services expect environment variables for RabbitMQ and MongoDB

See individual service READMEs for Docker details:
- [Customer Service Docker](customer-service/README.md#docker)
- [Store Service Docker](store-service/README.md#docker)
- [Web Apps UI Docker](web-apps-ui/README.md#docker)

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check: `lsof -i :8082` (customer-service), `lsof -i :8081` (store-service), `lsof -i :8083` (web-apps-ui Spring Boot), `lsof -i :9016` (web-apps-ui Angular dev server)
   - Kill existing processes or change ports in `application.yml` or `webpack.config.js`

2. **MongoDB Connection Failed**
   - See [MongoDB README Troubleshooting](mongodb/README.md#troubleshooting)

3. **RabbitMQ Connection Failed**
   - See [RabbitMQ README Troubleshooting](rabbitmq/README.md#troubleshooting)

4. **Service Integration Issues**
   - Verify all services are running on correct ports:
     - customer-service: `8082`
     - store-service: `8081`
     - web-apps-ui: `8083`
   - Check circuit breaker status: `http://localhost:8082/actuator/circuitbreakers`
   - Verify API proxy configuration in web-apps-ui `application.yml`
   - See [Customer Service Integration](customer-service/README.md#service-integration)

5. **Netty DNS Resolver Warning (macOS)**
   - If you see Netty DNS resolver warnings on macOS, the web-apps-ui includes the native resolver dependency
   - The warning is non-critical and doesn't affect functionality
   - See [Web Apps UI README](web-apps-ui/README.md) for details

For detailed troubleshooting, see individual service READMEs.

---

## Quick Start Checklist

- [ ] Install Java 21+
- [ ] Install Maven 3.6+
- [ ] (Optional) Install Node.js 18+ and npm/yarn (for frontend development)
- [ ] Start RabbitMQ (see [RabbitMQ README](rabbitmq/README.md))
- [ ] Start MongoDB (see [MongoDB README](mongodb/README.md))
- [ ] (Optional) Set up Eureka Server
- [ ] (Optional) Set up Config Server
- [ ] Build project: `mvn clean install` (from root)
- [ ] Start customer-service: `cd customer-service && ./runMaven.sh`
- [ ] Start store-service: `cd store-service && ./runMaven.sh`
- [ ] Start web-apps-ui: `cd web-apps-ui && ./runMaven.sh`
- [ ] (Optional) For frontend development: `cd web-apps-ui && npm install --legacy-peer-deps && npm start`
- [ ] Access UI at: `http://localhost:8083` (Spring Boot) or `http://localhost:9016` (npm start)

---

## Project Structure

```
retail-suite/
├── customer-service/     # Customer management service
│   ├── README.md         # Detailed customer-service documentation
│   ├── buildMaven.sh     # Build script
│   └── runMaven.sh      # Run script
├── store-service/        # Store management service
│   ├── README.md         # Detailed store-service documentation
│   ├── buildMaven.sh     # Build script
│   └── runMaven.sh       # Run script
├── web-apps-ui/          # UI service
│   ├── README.md         # Detailed web-apps-ui documentation
│   ├── buildMaven.sh     # Build script
│   └── runMaven.sh       # Run script
├── rabbitmq/             # RabbitMQ infrastructure
│   ├── README.md         # RabbitMQ documentation
│   ├── startRabbitMQServer.sh
│   └── stopRabbitMQServer.sh
├── mongodb/              # MongoDB infrastructure
│   ├── README.md         # MongoDB documentation
│   ├── startMongoDBService.sh
│   └── stopMongoDBService.sh
└── pom.xml               # Parent POM
```

---

## Notes

- Services have been upgraded to **Spring Boot 3.5.7** and **Spring Cloud 2024.0.0**
- **Hystrix** has been replaced with **Resilience4j** for circuit breaking
- All services use **Java 21**
- **web-apps-ui** uses **Spring Web MVC** (not WebFlux) with `ApiProxyController` for API routing
- **web-apps-ui** frontend uses **Angular 21** (not AngularJS) with Webpack
- Services can run without Eureka, but service discovery features won't work
- MongoDB is required only for store-service
- RabbitMQ is required for Spring Cloud Bus functionality
- **customer-service** uses **H2** database (file-based) by default, MySQL optional
- **web-apps-ui** uses direct URLs for backend services via `ApiProxyController` (no Eureka required)
- Frontend is built with Webpack and served as static resources from `src/main/resources/static/`
- Frontend can be developed independently using `npm start` on port `9016` with hot reload

---

## Related Documentation

- [Customer Service README](customer-service/README.md)
- [Store Service README](store-service/README.md)
- [Web Apps UI README](web-apps-ui/README.md)
- [RabbitMQ README](rabbitmq/README.md)
- [MongoDB README](mongodb/README.md)

# Author
- Rohtash Lakra
