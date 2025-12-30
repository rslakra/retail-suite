# Customer Service Microservice

## Overview

The **customer-service** is a Spring Boot microservice that manages customer data using JPA. It provides REST APIs for customer CRUD operations and integrates with the store-service to find nearby stores for customers.

**Key Features:**
- Customer management (CRUD operations)
- Integration with store-service for location-based store discovery
- Circuit breaker pattern using Resilience4j
- Service discovery via Eureka
- HATEOAS-compliant REST APIs

---

## Service Information

- **Port**: `8082`
- **Application Name**: `customer-service`
- **Base URL**: `http://localhost:8082`
- **Java Version**: 21
- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2024.0.0

---

## Dependencies

### Infrastructure Services (Required)

1. **RabbitMQ** (localhost:5672)
   - Used for: Spring Cloud Bus (configuration refresh)
   - See [RabbitMQ README](../rabbitmq/README.md) for setup instructions

2. **Eureka Server** (Optional)
   - Used for: Service discovery
   - Services can run without Eureka, but service discovery won't work

3. **Config Server** (Optional)
   - Default: `http://localhost:8888`
   - Used for: Centralized configuration management
   - Services have local fallback configurations

### Database Options

- **H2** (Default) - File-based database
  - Profile: `h2`
  - Connection: `jdbc:h2:file:~/Downloads/H2DB/RetailSuite`
  - Username: `sa`, Password: (empty)
  - H2 Console: `http://localhost:8082/h2`
- **MySQL** (Optional) - Requires MySQL server
  - Profile: `mysql`
  - Connection: `jdbc:mysql://localhost/RetailSuite`
  - Username: `root`, Password: (empty)

### Maven Dependencies

- Spring Boot Starter Data JPA
- Spring Boot Starter Data REST
- Spring HATEOAS
- Spring Cloud Starter Config
- Spring Cloud Starter Netflix Eureka Client
- Spring Cloud Starter Circuit Breaker Resilience4j
- Spring Cloud Starter Bus AMQP (RabbitMQ)
- H2 Database (default database)
- MySQL Connector (optional, for MySQL profile)
- Spring HATEOAS

---

## Build

### Prerequisites
- Java 21+
- Maven 3.6+

### Build Commands

**Option 1: Using build script (recommended)**
```bash
cd customer-service
./buildMaven.sh
```

**Option 2: Using Maven directly**
```bash
cd customer-service
mvn clean install
```

**Option 3: Build with tests**
```bash
cd customer-service
mvn clean install -DskipTests=false
```

The build script creates:
- SNAPSHOT version: `target/customer-service-0.0.X-SNAPSHOT.jar`
- RELEASE version: `target/customer-service-0.0.X.jar`

---

## Run

### Prerequisites
1. **Start RabbitMQ** (see [RabbitMQ README](../rabbitmq/README.md))
   ```bash
   cd ../rabbitmq
   ./rabbitmq.sh --start
   ```

2. **Start Eureka Server** (optional, if using service discovery)

### Run Commands

**Option 1: Using run script**
```bash
cd customer-service
./runMaven.sh
```

**Option 2: Using Maven**
```bash
cd customer-service
mvn spring-boot:run
```

**Option 3: Run JAR file**
```bash
cd customer-service
java -jar target/customer-service-*.jar
```

**Option 4: Run with MySQL profile**
```bash
cd customer-service
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### Environment Variables

```bash
# RabbitMQ
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672

# Config Server (optional)
export CONFIG_SERVER_URI=http://localhost:8888
```

---

## Test

### Run Tests

```bash
cd customer-service
mvn test
```

### Test Coverage

- **CustomerRepositoryIntegrationTest**: Tests customer CRUD operations with HSQLDB

---

## REST API Endpoints

The service uses Spring Data REST to automatically expose REST endpoints for the `Customer` entity.

### Base URL
```
http://localhost:8082
```

### Customer Endpoints

| Method | Endpoint                        | Description                                       |
|--------|---------------------------------|---------------------------------------------------|
| GET    | `/customers`                    | Get all customers (paginated)                     |         
| GET    | `/customers/{id}`               | Get customer by ID                                |
| POST   | `/customers`                    | Create a new customer                             |
| PUT    | `/customers/{id}`               | Update customer                                   |
| PATCH  | `/customers/{id}`               | Partially update customer                         |
| DELETE | `/customers/{id}`               | Delete customer                                   |
| GET    | `/customers/{id}/stores-nearby` | Get nearby stores link (if customer has location) |

### Example Requests

**Create a customer:**
```bash
curl -X POST http://localhost:8082/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "address": {
      "street": "123 Main St",
      "zipCode": "12345",
      "city": "New York",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    }
  }'
```

**Get all customers:**
```bash
curl http://localhost:8082/customers
```

**Get customer by ID:**
```bash
curl http://localhost:8082/customers/1
```

### Management Endpoints

| Endpoint                    | Description             |
|-----------------------------|-------------------------|
| `/actuator/health`          | Health check            |
| `/actuator/info`            | Application information |
| `/actuator/metrics`         | Application metrics     |
| `/actuator/circuitbreakers` | Circuit breaker status  |

---

## Service Integration

### Integration with Store Service

The customer-service integrates with the store-service to provide nearby store links:

- **Integration Class**: `StoreIntegration`
- **Circuit Breaker**: Resilience4j (replaces Hystrix)
- **Fallback**: Returns `null` if store-service is unavailable
- **Configuration**: `integration.stores.uri` in `application.yml`

**How it works:**
1. When a customer resource is processed, if the customer has a location, the service attempts to discover the store-service
2. If found, a `stores-nearby` link is added to the customer resource
3. The link points to the store-service's location-based search endpoint
4. Circuit breaker protects against repeated failures

---

## Configuration

### Application Configuration (`application.yml`)

- **Server Port**: 8082
- **Database**: H2 (default, file-based at `~/Downloads/H2DB/RetailSuite`) or MySQL (with `mysql` profile)
- **Store Service Integration**: `http://localhost:8081` (configured via `integration.stores.uri`)
- **RabbitMQ**: Configured via environment variables
- **Circuit Breaker**: Resilience4j configuration for store integration

### Circuit Breaker Configuration

```yaml
resilience4j:
  circuitbreaker:
    instances:
      storeIntegration:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 10s
        failureRateThreshold: 50
        eventConsumerBufferSize: 10
```

---

## Troubleshooting

1. **Port Already in Use**
   ```bash
   lsof -i :8082
   # Kill process or change port in application.yml
   ```

2. **RabbitMQ Connection Failed**
   - Verify RabbitMQ is running: `docker ps | grep rabbitmq`
   - Check management UI: `http://localhost:15672`

3. **Store Service Integration Failing**
   - Verify store-service is running on port 8081
   - Check circuit breaker status: `http://localhost:8082/actuator/circuitbreakers`
   - Verify store service URI in `application.yml`: `integration.stores.uri`

4. **Database Issues**
   - H2: File-based database at `~/Downloads/H2DB/RetailSuite` (created automatically)
   - H2 Console: Access at `http://localhost:8082/h2` (JDBC URL: `jdbc:h2:file:~/Downloads/H2DB/RetailSuite`)
   - MySQL: Ensure MySQL server is running and database `RetailSuite` exists

---

## Docker

Build Docker image:
```bash
cd customer-service
./buildMaven.sh
docker build -t customer-service:latest -f src/main/docker/Dockerfile .
```

Run Docker container:
```bash
docker run -p 8082:8082 \
  -e RABBITMQ_HOST=host.docker.internal \
  -e RABBITMQ_PORT=5672 \
  customer-service:latest
```

---

## Related Services

- **store-service**: Provides store location data (see [Store Service README](../store-service/README.md))
- **web-apps-ui**: Frontend application (see [UI Service README](../web-apps-ui/README.md))
