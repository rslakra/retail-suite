# RabbitMQ Service

## Overview

RabbitMQ is a message broker that provides messaging services for the retail-suite microservices. It is used for Spring Cloud Bus, which enables configuration refresh across multiple service instances.

**Purpose in Retail Suite:**
- Spring Cloud Bus: Broadcasts configuration changes to all service instances
- Message queuing: Enables asynchronous communication between services
- Event distribution: Distributes configuration refresh events

---

## Service Information

- **Port**: `5672` (AMQP protocol)
- **Management UI Port**: `15672` (HTTP)
- **Default Username**: `guest`
- **Default Password**: `guest`
- **Management UI URL**: `http://localhost:15672`

---

## Installation

### Option 1: Using Docker (Recommended)

The provided script uses Docker to run RabbitMQ:

```bash
cd rabbitmq
./rabbitmq.sh --start
```

This will:
- Start RabbitMQ server on port 5672
- Start management UI on port 15672
- Create a container named `rabbitmq`

### Option 2: Using Homebrew (macOS)

```bash
brew install rabbitmq
brew services start rabbitmq
```

### Option 3: Manual Docker Command

```bash
docker run -d \
  -p 5672:5672 \
  -p 15672:15672 \
  --name rabbitmq \
  rabbitmq:3-management
```

### Option 4: Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

---

## Start/Stop

### Start RabbitMQ

**Using script:**
```bash
cd rabbitmq
./rabbitmq.sh --start
```

**Using Docker directly:**
```bash
docker start rabbitmq
# Or if container doesn't exist:
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management
```

**Using Homebrew:**
```bash
brew services start rabbitmq
```

### Stop RabbitMQ

**Using script:**
```bash
cd rabbitmq
./rabbitmq.sh --stop
```

**Using Docker:**
```bash
docker stop rabbitmq
```

**Using Homebrew:**
```bash
brew services stop rabbitmq
```

### Remove RabbitMQ Container

```bash
docker stop rabbitmq
docker rm rabbitmq
```

---

## Management UI

### Access Management UI

1. Open browser: `http://localhost:15672`
2. Login with:
   - Username: `guest`
   - Password: `guest`

### Management UI Features

- **Overview**: Server statistics and node information
- **Connections**: Active client connections
- **Channels**: Open channels
- **Exchanges**: Message exchanges
- **Queues**: Message queues
- **Admin**: User and virtual host management

---

## Configuration

### Environment Variables

Services connect to RabbitMQ using these environment variables:

```bash
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672
```

### Connection String Format

```
amqp://[username]:[password]@[host]:[port]
```

**Example:**
```
amqp://guest:guest@localhost:5672
```

### Service Configuration

Services are configured to use RabbitMQ via `application.yml`:

```yaml
spring:
  rabbitmq:
    addresses: amqp://${RABBITMQ_HOST:localhost}:${RABBITMQ_PORT:5672}
```

---

## Usage in Retail Suite

### Spring Cloud Bus

RabbitMQ is used by Spring Cloud Bus to:
- Broadcast configuration refresh events
- Synchronize configuration across service instances
- Enable `/actuator/busrefresh` endpoint

### Services Using RabbitMQ

- **customer-service**: Spring Cloud Bus
- **store-service**: Spring Cloud Bus
- **web-apps-ui**: Spring Cloud Bus (if configured)

---

## Verification

### Check if RabbitMQ is Running

**Using Docker:**
```bash
docker ps | grep rabbitmq
```

**Using Management UI:**
```bash
curl http://localhost:15672/api/overview
```

**Using RabbitMQ CLI:**
```bash
docker exec -it rabbitmq rabbitmqctl status
```

### Test Connection

**Using telnet:**
```bash
telnet localhost 5672
```

**Using Management API:**
```bash
curl -u guest:guest http://localhost:15672/api/overview
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5672
lsof -i :5672

# Stop existing RabbitMQ
docker stop rabbitmq
# Or
brew services stop rabbitmq
```

### Connection Refused

1. Verify RabbitMQ is running: `docker ps | grep rabbitmq`
2. Check port is accessible: `telnet localhost 5672`
3. Verify firewall settings
4. Check RabbitMQ logs: `docker logs rabbitmq`

### Management UI Not Accessible

1. Ensure management plugin is enabled (included in `rabbitmq:3-management` image)
2. Verify port 15672 is not blocked
3. Check container logs: `docker logs rabbitmq`

### Authentication Issues

- Default credentials: `guest`/`guest`
- To change: Set environment variables in Docker:
  ```bash
  docker run -d \
    -p 5672:5672 \
    -p 15672:15672 \
    -e RABBITMQ_DEFAULT_USER=admin \
    -e RABBITMQ_DEFAULT_PASS=password \
    --name rabbitmq \
    rabbitmq:3-management
  ```

---

## Production Considerations

### Security

- Change default credentials
- Use environment variables for sensitive data
- Enable SSL/TLS for production
- Restrict network access

### Performance

- Configure memory limits
- Set up clustering for high availability
- Monitor queue sizes
- Use persistent queues for critical messages

### Monitoring

- Set up monitoring and alerting
- Monitor queue depths
- Track message rates
- Monitor connection counts

---

## Related Documentation

- [RabbitMQ Official Documentation](https://www.rabbitmq.com/documentation.html)
- [Spring Cloud Bus Documentation](https://spring.io/projects/spring-cloud-bus)
- [Docker Hub: RabbitMQ](https://hub.docker.com/_/rabbitmq)

---

## Quick Reference

# Start
./rabbitmq.sh --start

# Stop
./rabbitmq.sh --stop

# Status
./rabbitmq.sh --status

# Restart
./rabbitmq.sh --restart

# Check status (Docker)
docker ps | grep rabbitmq

# View logs
docker logs rabbitmq

# Access management UI
open http://localhost:15672
```
