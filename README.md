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

**Infrastructure Services:**
1. Start RabbitMQ: See [RabbitMQ README](rabbitmq/README.md)
2. Start MongoDB: See [MongoDB README](mongodb/README.md)

**Service Ports:**
- customer-service: `9000`
- store-service: `8081`
- web-apps-ui: `9900`

**Run Services:**
```bash
# Terminal 1 - Customer Service
cd customer-service && ./runMaven.sh

# Terminal 2 - Store Service
cd store-service && ./runMaven.sh

# Terminal 3 - UI Service
cd web-apps-ui && mvn spring-boot:run
```

**Access UI:** `http://localhost:9900`

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
  - Spring Data JPA (HSQLDB/MySQL)
  - Spring Data REST
  - Spring HATEOAS
  - Resilience4j (Circuit Breaker)
  - Eureka Client
  - RabbitMQ (Spring Cloud Bus)

- **store-service**:
  - Spring Data MongoDB
  - Spring Data REST
  - Spring Batch
  - Eureka Client
  - RabbitMQ (Spring Cloud Bus)

- **web-apps-ui**:
  - Spring WebFlux
  - Spring Cloud Gateway
  - Eureka Client
  - AngularJS frontend

### Service Communication

- **customer-service** → **store-service**
  - Integration endpoint: `http://localhost:8081`
  - Uses Resilience4j circuit breaker
  - Periodically verifies store service availability
  - Adds `stores-nearby` links to customer resources

- **web-apps-ui** → **customer-service** & **store-service**
  - Routes: `/customers/**` → customer-service
  - Routes: `/stores/**` → store-service
  - Load balancing via Eureka (if available)

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

---

## Run

### Running Individual Services

Each service can be run independently. See detailed instructions:

- [Customer Service Run](customer-service/README.md#run)
- [Store Service Run](store-service/README.md#run)

### Running All Services

**Terminal 1 - Customer Service:**
```bash
cd customer-service && ./runMaven.sh
```

**Terminal 2 - Store Service:**
```bash
cd store-service && ./runMaven.sh
```

**Terminal 3 - UI Service:**
```bash
cd web-apps-ui && mvn spring-boot:run
```

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
export CONFIG_SERVER_URI=http://localhost:8888
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

---

## API Endpoints

### Customer Service
- Base URL: `http://localhost:9000`
- See [Customer Service API Documentation](customer-service/README.md#rest-api-endpoints)

### Store Service
- Base URL: `http://localhost:8081`
- See [Store Service API Documentation](store-service/README.md#rest-api-endpoints)

---

## IDE Support

To use these projects in an IDE:

1. Install [Lombok plugin](http://projectlombok.org/features/index.html) in your IDE
2. Enable annotation processing
3. Without Lombok, you'll see compiler errors for missing methods/fields

---

## Docker Deployment

Each service has a Dockerfile in `src/main/docker/`:

1. Build JARs first using `buildMaven.sh` in each service directory
2. Build Docker images from the Dockerfiles
3. Services expect environment variables for RabbitMQ and MongoDB

See individual service READMEs for Docker details:
- [Customer Service Docker](customer-service/README.md#docker)
- [Store Service Docker](store-service/README.md#docker)

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check: `lsof -i :9000`, `lsof -i :8081`, `lsof -i :9900`
   - Kill existing processes or change ports in `application.yml`

2. **MongoDB Connection Failed**
   - See [MongoDB README Troubleshooting](mongodb/README.md#troubleshooting)

3. **RabbitMQ Connection Failed**
   - See [RabbitMQ README Troubleshooting](rabbitmq/README.md#troubleshooting)

4. **Service Integration Issues**
   - Verify all services are running
   - Check circuit breaker status: `http://localhost:9000/actuator/circuitbreakers`
   - See [Customer Service Integration](customer-service/README.md#service-integration)

5. **OS Specific Info**
  Netty already includes osx-x86_64 (Intel). If you're on Apple Silicon (M1/M2/M3), we need osx-aarch_64. Updating the dependency to support both architectures:
  - uname -m

For detailed troubleshooting, see individual service READMEs.

---

## Quick Start Checklist

- [ ] Install Java 21+
- [ ] Install Maven 3.6+
- [ ] Start RabbitMQ (see [RabbitMQ README](rabbitmq/README.md))
- [ ] Start MongoDB (see [MongoDB README](mongodb/README.md))
- [ ] (Optional) Set up Eureka Server
- [ ] (Optional) Set up Config Server
- [ ] Build project: `mvn clean install` (from root)
- [ ] Start customer-service: `cd customer-service && ./runMaven.sh`
- [ ] Start store-service: `cd store-service && ./runMaven.sh`
- [ ] Start web-apps-ui: `cd web-apps-ui && mvn spring-boot:run`
- [ ] Access UI at: `http://localhost:9900`

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
- Services can run without Eureka, but service discovery features won't work
- MongoDB is required only for store-service
- RabbitMQ is required for Spring Cloud Bus functionality

---

## Related Documentation

- [Customer Service README](customer-service/README.md)
- [Store Service README](store-service/README.md)
- [RabbitMQ README](rabbitmq/README.md)
- [MongoDB README](mongodb/README.md)
