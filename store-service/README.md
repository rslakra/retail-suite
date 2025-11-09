# Store Service Microservice

## Overview

The **store-service** is a Spring Boot microservice that manages store data using MongoDB. It provides REST APIs for store CRUD operations and supports geospatial queries to find stores near a given location.

**Key Features:**
- Store management (CRUD operations)
- Geospatial queries (find stores by location and distance)
- MongoDB with geospatial indexing
- Spring Batch for data loading
- Service discovery via Eureka
- HATEOAS-compliant REST APIs

---

## Service Information

- **Port**: `8081`
- **Application Name**: `store-service`
- **Base URL**: `http://localhost:8081`
- **Java Version**: 21
- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2024.0.0
- **Database**: MongoDB

---

## Dependencies

### Infrastructure Services (Required)

1. **MongoDB** (localhost:27017)
   - Database: `stores`
   - Used for: Store data storage with geospatial indexing
   - See [MongoDB README](../mongodb/README.md) for setup instructions

2. **RabbitMQ** (localhost:5672)
   - Used for: Spring Cloud Bus (configuration refresh)
   - See [RabbitMQ README](../rabbitmq/README.md) for setup instructions

3. **Eureka Server** (Optional)
   - Used for: Service discovery
   - Services can run without Eureka, but service discovery won't work

4. **Config Server** (Optional)
   - Default: `http://localhost:8888`
   - Used for: Centralized configuration management
   - Services have local fallback configurations

### Maven Dependencies

- Spring Boot Starter Data MongoDB
- Spring Boot Starter Data REST
- Spring Boot Starter Batch (for data loading)
- Spring Cloud Starter Config
- Spring Cloud Starter Netflix Eureka Client
- Spring Cloud Starter Bus AMQP (RabbitMQ)
- H2 Database (for Spring Batch job repository)
- Lombok

---

## Build

### Prerequisites
- Java 21+
- Maven 3.6+
- MongoDB running (for tests)

### Build Commands

**Option 1: Using build script (recommended)**
```bash
cd store-service
./buildMaven.sh
```

**Option 2: Using Maven directly**
```bash
cd store-service
mvn clean install
```

**Option 3: Build with tests**
```bash
cd store-service
mvn clean install -DskipTests=false
```

**Note**: Tests require MongoDB to be running and will create a geospatial index automatically.

The build script creates:
- SNAPSHOT version: `target/store-service-0.0.X-SNAPSHOT.jar`
- RELEASE version: `target/store-service-0.0.X.jar`

---

## Run

### Prerequisites
1. **Start MongoDB** (see [MongoDB README](../mongodb/README.md))
   ```bash
   cd ../mongodb
   ./startMongoDBService.sh
   ```

2. **Start RabbitMQ** (see [RabbitMQ README](../rabbitmq/README.md))
   ```bash
   cd ../rabbitmq
   ./startRabbitMQServer.sh
   ```

3. **Start Eureka Server** (optional, if using service discovery)

### Run Commands

**Option 1: Using run script**
```bash
cd store-service
./runMaven.sh
```

**Option 2: Using Maven**
```bash
cd store-service
mvn spring-boot:run
```

**Option 3: Run JAR file**
```bash
cd store-service
java -jar target/store-service-*.jar
```

### Environment Variables

```bash
# MongoDB
export MONGODB_HOST=localhost
export MONGODB_PORT=27017

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
cd store-service
mvn test
```

### Test Coverage

- **StoreRepositoryIntegrationTests**: Tests geospatial queries
  - Creates geospatial index automatically in `@BeforeEach`
  - Tests `findByAddressLocationNear` method

**Note**: Tests require MongoDB to be running. The test setup automatically creates the required geospatial index on `address.location`.

---

## REST API Endpoints

The service uses Spring Data REST to automatically expose REST endpoints for the `Store` entity, plus a custom endpoint.

### Base URL
```
http://localhost:8081
```

### Store Endpoints

| Method | Endpoint                                                              | Description                          |
|--------|-----------------------------------------------------------------------|--------------------------------------|
| GET    | `/stores`                                                             | Get all stores (paginated)           |
| GET    | `/stores/{id}`                                                        | Get store by ID                      |
| POST   | `/stores`                                                             | Create a new store                   |
| PUT    | `/stores/{id}`                                                        | Update store                         |
| PATCH  | `/stores/{id}`                                                        | Partially update store               |
| DELETE | `/stores/{id}`                                                        | Delete store                         |
| GET    | `/stores/search/by-location?location={lat},{lng}&distance={distance}` | Find stores near location            |
| GET    | `/simple/stores`                                                      | Get simple list of stores (first 10) |

### Geospatial Search Endpoint

**Find stores by location:**
```
GET /stores/search/by-location?location={latitude},{longitude}&distance={distance}
```

**Parameters:**
- `location`: Comma-separated latitude and longitude (e.g., `40.7128,-74.0060`)
- `distance`: Distance in kilometers (e.g., `50km`)
- `page`: Page number (optional, default: 0)
- `size`: Page size (optional, default: 20)

**Example:**
```bash
curl "http://localhost:8081/stores/search/by-location?location=40.7128,-74.0060&distance=50km"
```

### Example Requests

**Create a store:**
```bash
curl -X POST http://localhost:8081/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starbucks Downtown",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001",
      "location": {
        "x": -74.0060,
        "y": 40.7128
      }
    }
  }'
```

**Get all stores:**
```bash
curl http://localhost:8081/stores
```

**Get stores near location:**
```bash
curl "http://localhost:8081/stores/search/by-location?location=40.7128,-74.0060&distance=10km&page=0&size=10"
```

**Get simple stores list:**
```bash
curl http://localhost:8081/simple/stores
```

### Management Endpoints

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health check |
| `/actuator/info` | Application information |
| `/actuator/metrics` | Application metrics |

---

## Data Model

### Store Entity

```json
{
  "id": "string",
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "zip": "string",
    "location": {
      "x": double,  // longitude
      "y": double   // latitude
    }
  }
}
```

### MongoDB Collection

- **Collection Name**: `store`
- **Database**: `stores`
- **Geospatial Index**: `address.location` (2dsphere index)

---

## Geospatial Queries

The service supports MongoDB geospatial queries using Spring Data MongoDB:

- **Index Type**: 2dsphere (for Earth-like queries)
- **Index Field**: `address.location`
- **Query Method**: `findByAddressLocationNear`

The geospatial index is automatically created:
- In tests: via `MongoTemplate` in test setup
- In production: via `@GeoSpatialIndexed` annotation on `Address.location`

---

## Data Loading

The service uses Spring Batch to load initial store data from CSV files (e.g., `starbucks.csv`). The batch job runs automatically on application startup if the database is empty.

---

## Configuration

### Application Configuration (`application.yml`)

- **Server Port**: 8081
- **MongoDB URI**: `mongodb://localhost:27017/stores`
- **RabbitMQ**: Configured via environment variables

### MongoDB Connection

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://${MONGODB_HOST:localhost}:${MONGODB_PORT:27017}/stores
```

---

## Troubleshooting

1. **Port Already in Use**
   ```bash
   lsof -i :8081
   # Kill process or change port in application.yml
   ```

2. **MongoDB Connection Failed**
   - Verify MongoDB is running: `docker ps | grep mongodb`
   - Test connection: `mongosh mongodb://localhost:27017`
   - Check connection string in `application.yml`

3. **Geospatial Query Errors**
   - Ensure geospatial index exists: `db.store.getIndexes()`
   - Index should be on `address.location` with type `2dsphere`
   - Tests automatically create the index

4. **No Stores Returned**
   - Verify data is loaded: Check MongoDB collection
   - Verify geospatial index exists
   - Check query parameters (location format, distance units)

---

## Docker

Build Docker image:
```bash
cd store-service
./buildMaven.sh
docker build -t store-service:latest -f src/main/docker/Dockerfile .
```

Run Docker container:
```bash
docker run -p 8081:8081 \
  -e MONGODB_HOST=host.docker.internal \
  -e MONGODB_PORT=27017 \
  -e RABBITMQ_HOST=host.docker.internal \
  -e RABBITMQ_PORT=5672 \
  store-service:latest
```

---

## Related Services

- **customer-service**: Consumes store location data (see [Customer Service README](../customer-service/README.md))
- **web-apps-ui**: Frontend application (see [UI Service README](../web-apps-ui/README.md))
