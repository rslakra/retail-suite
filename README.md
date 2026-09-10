# RetailSuite Microservices

Three Spring Boot Maven microservices with an Angular UI:


| Service              | Role                                                                      | Port                                      |
| -------------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| **store-service**    | Store management (MongoDB, geospatial queries)                            | `8081`                                    |
| **customer-service** | Customer management (JPA); integrates with store-service via Resilience4j | `8082`                                    |
| **web-apps-ui**      | Angular frontend + Spring MVC API proxy                                   | `8083` (Spring Boot), `9016` (dev server) |


**customer-service** calls **store-service** to add nearby-store links to customer resources when the store service is available.

---

## Setup

**Prerequisites**

- Java 21+
- Maven 3.6+
- Docker (for RabbitMQ and MongoDB scripts)
- Node.js 22.15+ and npm 10+ (only for frontend development in `web-apps-ui`; required by webpack-dev-server 6)

**Infrastructure** — required before **local deployment** and before **builds that run tests** (root `mvn clean install`, store-service `./buildMaven.sh` snapshot pass). Not required for compile-only builds (`-DskipTests=true`).

```bash
cd rabbitmq && ./rabbitmq.sh --start   # AMQP 5672, management UI http://localhost:15672
cd mongodb && ./mongodb.sh --start     # MongoDB 27017
```

See [rabbitmq/README.md](rabbitmq/README.md) and [mongodb/README.md](mongodb/README.md) for install options and details.

**Optional:** Eureka Server and Config Server — services run without them using local `application.yml` defaults.

**Optional:** Eureka Server and Config Server — services run without them using local `application.yml` defaults.

## Environment


| Variable                 | Default                               | Used by                                    |
| ------------------------ | ------------------------------------- | ------------------------------------------ |
| `RABBITMQ_HOST`          | `localhost`                           | customer-service, store-service            |
| `RABBITMQ_PORT`          | `5672`                                | customer-service, store-service            |
| `MONGODB_HOST`           | `localhost`                           | store-service                              |
| `MONGODB_PORT`           | `27017`                               | store-service                              |
| `CONFIG_SERVER_URI`      | `http://user:password@localhost:8888` | customer-service, store-service (optional) |
| `SPRING_PROFILES_ACTIVE` | `h2`                                  | customer-service (`mysql` for MySQL)       |
| `CUSTOMER_SERVICE_URI`   | `http://localhost:8082`               | web-apps-ui (Spring Boot proxy)            |
| `STORE_SERVICE_URI`      | `http://localhost:8081`               | web-apps-ui (Spring Boot proxy)            |
| `GOOGLE_MAPS_API_KEY`    | *(unset)*                             | web-apps-ui frontend build / `npm start`   |


Example:

```bash
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672
export MONGODB_HOST=localhost
export MONGODB_PORT=27017
```

**Google Maps (optional, for map/geocode on customer add/edit/search):**

```bash
cd web-apps-ui
cp .env.example .env
# set GOOGLE_MAPS_API_KEY in .env, then:
npm start
```

Maps load at runtime when a key is set. Without a key, customer CRUD and nearby-store search still work; map panels show a configuration warning instead of console errors.

Per-service configuration: `customer-service/src/main/resources/application.yml`, `store-service/src/main/resources/application.yml`, `web-apps-ui/src/main/resources/application.yml`.

---

## Build

**Order:** complete [Setup](#setup) (start RabbitMQ and MongoDB if tests will run) → build → [Deployment](#deployment).

**All modules** (from repo root; runs tests — MongoDB must be up):

```bash
mvn clean install
```

**Per service** (uses versioned JAR via `buildMaven.sh`):

```bash
cd customer-service && ./buildMaven.sh
cd store-service && ./buildMaven.sh
cd web-apps-ui && ./buildMaven.sh
```

**Frontend** (bundled into `web-apps-ui` static resources; **npm only** — no `yarn.lock`):

```bash
cd web-apps-ui
npm install
npm run build          # production bundle → dist/
./buildWebapp.sh       # or copy dist/ into src/main/resources/static/
```

Set `GOOGLE_MAPS_API_KEY` in `web-apps-ui/.env` (or export it) before `npm run build` / `npm start` if you need maps.

API, build options, and endpoint details: [customer-service/README.md](customer-service/README.md), [store-service/README.md](store-service/README.md), [web-apps-ui/README.md](web-apps-ui/README.md).

---

## Deployment

### Local

If not already running, start infrastructure from [Setup](#setup), then run each service (order: store → customer → UI):

```bash
# Terminal 1
cd store-service && ./runMaven.sh

# Terminal 2
cd customer-service && ./runMaven.sh

# Terminal 3 — serves built frontend from classpath
cd web-apps-ui && ./runMaven.sh
```

**UI access**

- Production-like: [http://localhost:8083](http://localhost:8083)
- Frontend dev (hot reload): `cd web-apps-ui && npm start` → [http://localhost:9016](http://localhost:9016)

Dev server proxies `/api/customers` → `8082` and `/api/stores` → `8081`.

**UI workflow (dev server on `9016`)**

| Page | URL | Notes |
|------|-----|--------|
| Customer list | `/customers` | List, add, edit, delete |
| Add customer | `/customers/add` | Form + optional map |
| Edit customer | `/customers/{id}/edit` | Save/cancel returns to `/customers` |
| Search nearby stores | `/customers/{id}` | Enter distance (km) and optional name/city filter, then **Search Stores** |

Nearby-store search calls **store-service** geospatial API (`/stores/search/findByAddressLocationNear`). **MongoDB** must be running with store data loaded.

### Docker

Dockerfiles: `customer-service/src/main/docker/Dockerfile`, `store-service/src/main/docker/Dockerfile`. Build JARs first, then images from each service directory.

**customer-service**

```bash
cd customer-service
./buildMaven.sh
docker build -t customer-service:latest -f src/main/docker/Dockerfile .
docker run -p 8082:8082 \
  -e RABBITMQ_HOST=host.docker.internal \
  -e RABBITMQ_PORT=5672 \
  customer-service:latest
```

**store-service**

```bash
cd store-service
./buildMaven.sh
docker build -t store-service:latest -f src/main/docker/Dockerfile .
docker run -p 8081:8081 \
  -e RABBITMQ_HOST=host.docker.internal \
  -e RABBITMQ_PORT=5672 \
  -e MONGODB_HOST=host.docker.internal \
  -e MONGODB_PORT=27017 \
  store-service:latest
```

`web-apps-ui` has no Dockerfile; run locally or package the JAR after `buildMaven.sh`.

RabbitMQ and MongoDB can also be started via their Docker scripts under `rabbitmq/` and `mongodb/`.

---

## Testing

```bash
# All modules
mvn test

# Single service
cd customer-service && mvn test
cd store-service && mvn test
cd web-apps-ui && mvn test
```

- **store-service** tests need MongoDB running (geospatial index is created in test setup).
- **web-apps-ui**: backend tests via Maven; frontend via `npm test` / `npm run test:watch` when configured.

See service READMEs for coverage and test notes.

---

## Troubleshooting


| Issue                         | What to check                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Port in use                   | `lsof -i :8081` / `:8082` / `:8083` / `:9016` — stop process or change port in `application.yml` / `webpack.config.js`                        |
| MongoDB connection            | MongoDB running (`./mongodb.sh --start`); see [mongodb/README.md](mongodb/README.md#troubleshooting)                                          |
| RabbitMQ connection           | RabbitMQ running (`./rabbitmq.sh --start`); see [rabbitmq/README.md](rabbitmq/README.md#troubleshooting)                                      |
| Customer ↔ store integration  | store-service on `8081`; circuit breakers at [http://localhost:8082/actuator/circuitbreakers](http://localhost:8082/actuator/circuitbreakers) |
| UI API errors                 | `CUSTOMER_SERVICE_URI` / `STORE_SERVICE_URI` in `web-apps-ui` `application.yml`; backends reachable                                           |
| Customer update fails         | **customer-service** must be running; UI uses `PATCH` with `merge-patch+json` (not `PUT`) for customer updates                                 |
| No nearby stores in search    | **store-service** on `8081`, **MongoDB** up; click **Search Stores** on `/customers/{id}` (results are not auto-loaded)                      |
| Google Maps warnings          | Set `GOOGLE_MAPS_API_KEY` in `web-apps-ui/.env`; restart `npm start` / rebuild frontend                                                       |
| Netty DNS warning (macOS, UI) | Non-critical; native resolver dependency is included in web-apps-ui                                                                           |


---

## Layout

```
retail-suite/
├── pom.xml                 # Parent POM (store-service, customer-service, web-apps-ui)
├── customer-service/       # JPA customer API
├── store-service/          # MongoDB store API + geospatial search
├── web-apps-ui/            # Angular UI + ApiProxyController
├── rabbitmq/               # rabbitmq.sh, README
├── mongodb/                # mongodb.sh, README
├── version.sh
├── customer-service/buildMaven.sh, runMaven.sh
├── store-service/buildMaven.sh, runMaven.sh
└── web-apps-ui/buildMaven.sh, runMaven.sh, npmStart.sh
```

---

## Architecture

**Stack:** Spring Boot 3.5.7, Spring Cloud 2024.0.0, Java 21, Maven. UI: Angular 21, Webpack. Circuit breaking: Resilience4j (not Hystrix).

**Data & messaging**

- **store-service** — Spring Data MongoDB (`stores` DB); Spring Cloud Bus (RabbitMQ); optional Eureka.
- **customer-service** — Spring Data JPA (H2 file DB by default, MySQL optional); Resilience4j to **store-service**; Spring Cloud Bus; optional Eureka.
- **web-apps-ui** — Spring Web MVC; `ApiProxyController` + RestTemplate; Angular 21 + Webpack 5 static build on classpath. Dev: `webpack-dev-server` on `9016` proxies `/api/*` to backends.

**Communication**

```
web-apps-ui  --/api/customers/**-->  customer-service :8082
web-apps-ui  --/api/stores/**----->  store-service    :8081
customer-service  --integration-->   store-service    :8081  (circuit breaker: storeIntegration)
```

Eureka and Config Server are optional; local runs use fixed URLs in `application.yml`.

**Further reading**

- [customer-service/README.md](customer-service/README.md) — REST API, integration, Docker
- [store-service/README.md](store-service/README.md) — geospatial API, MongoDB model
- [web-apps-ui/README.md](web-apps-ui/README.md) — frontend structure, proxy routes
- [rabbitmq/README.md](rabbitmq/README.md) · [mongodb/README.md](mongodb/README.md)

---

**Author:** Rohtash Lakra