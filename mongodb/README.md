# MongoDB Service

## Overview

MongoDB is a NoSQL document database used by the **store-service** to store store information with geospatial data. It enables location-based queries to find stores near a given location.

**Purpose in Retail Suite:**
- Store data persistence for store-service
- Geospatial queries for location-based store search
- Document-based storage for flexible store data structure

---

## Service Information

- **Port**: `27017` (MongoDB protocol)
- **Database Name**: `stores`
- **Collection Name**: `store`
- **Connection String**: `mongodb://localhost:27017/stores`
- **Protocol**: MongoDB binary protocol (not HTTP)

---

## Installation

### Option 1: Using Docker (Recommended)

The provided script uses Docker to run MongoDB:

```bash
cd mongodb
./startMongoDBService.sh
```

This will:
- Start MongoDB server on port 27017
- Create a container named `mongodb`
- Use the latest MongoDB image

### Option 2: Using Homebrew (macOS)

```bash
brew install mongodb-community
brew services start mongodb-community
```

### Option 3: Manual Docker Command

```bash
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  mongo:latest
```

### Option 4: Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db

volumes:
  mongodb-data:
```

---

## Start/Stop

### Start MongoDB

**Using script:**
```bash
cd mongodb
./startMongoDBService.sh
```

**Using Docker directly:**
```bash
docker start mongodb
# Or if container doesn't exist:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Using Homebrew:**
```bash
brew services start mongodb-community
```

### Stop MongoDB

**Using script:**
```bash
cd mongodb
./stopMongoDBService.sh
```

**Using Docker:**
```bash
docker stop mongodb
```

**Using Homebrew:**
```bash
brew services stop mongodb-community
```

### Remove MongoDB Container

```bash
docker stop mongodb
docker rm mongodb
```

---

## Connection

### Connection String Format

```
mongodb://[host]:[port]/[database]
```

**Default:**
```
mongodb://localhost:27017/stores
```

### Connect Using MongoDB Shell

**Using Docker:**
```bash
docker exec -it mongodb mongosh
```

**Using local mongosh:**
```bash
mongosh mongodb://localhost:27017
```

**Connect to specific database:**
```bash
mongosh mongodb://localhost:27017/stores
```

### Connect from Application

Services connect using Spring Data MongoDB:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://${MONGODB_HOST:localhost}:${MONGODB_PORT:27017}/stores
```

---

## Database Structure

### Database: `stores`

### Collection: `store`

**Document Structure:**
```json
{
  "_id": "string",
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "zip": "string",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    }
  }
}
```

### Geospatial Index

**Index on:** `address.location`
**Index Type:** `2dsphere`
**Purpose:** Enables geospatial queries (find stores near location)

**Create Index Manually:**
```javascript
db.store.createIndex({ "address.location": "2dsphere" })
```

**Check Indexes:**
```javascript
db.store.getIndexes()
```

---

## Usage in Retail Suite

### Store Service

MongoDB is used by the **store-service** to:
- Store store information
- Perform geospatial queries
- Support location-based store search

### Geospatial Queries

The store-service uses MongoDB's geospatial capabilities:

```java
// Find stores near a location
Page<Store> findByAddressLocationNear(
    Point location, 
    Distance distance, 
    Pageable pageable
);
```

**Example Query:**
```javascript
db.store.find({
  "address.location": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-74.0060, 40.7128]  // [longitude, latitude]
      },
      $maxDistance: 50000  // 50km in meters
    }
  }
})
```

---

## Configuration

### Environment Variables

Services connect to MongoDB using these environment variables:

```bash
export MONGODB_HOST=localhost
export MONGODB_PORT=27017
```

### Service Configuration

Store-service is configured via `application.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://${MONGODB_HOST:localhost}:${MONGODB_PORT:27017}/stores
```

---

## Common Operations

### View All Stores

```javascript
use stores
db.store.find().pretty()
```

### Count Stores

```javascript
db.store.countDocuments()
```

### Find Stores Near Location

```javascript
db.store.find({
  "address.location": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-74.0060, 40.7128]
      },
      $maxDistance: 50000
    }
  }
})
```

### Clear All Stores

```javascript
db.store.deleteMany({})
```

### Drop Collection

```javascript
db.store.drop()
```

---

## Verification

### Check if MongoDB is Running

**Using Docker:**
```bash
docker ps | grep mongodb
```

**Using MongoDB Shell:**
```bash
mongosh mongodb://localhost:27017 --eval "db.adminCommand('ping')"
```

**Using Connection Test:**
```bash
docker exec -it mongodb mongosh --eval "db.version()"
```

### Test Connection

```bash
# Using mongosh
mongosh mongodb://localhost:27017

# Test connection
db.adminCommand('ping')
# Should return: { ok: 1 }
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 27017
lsof -i :27017

# Stop existing MongoDB
docker stop mongodb
# Or
brew services stop mongodb-community
```

### Connection Refused

1. Verify MongoDB is running: `docker ps | grep mongodb`
2. Check port is accessible: `telnet localhost 27017`
3. Verify firewall settings
4. Check MongoDB logs: `docker logs mongodb`

### Geospatial Query Errors

**Error: "unable to find index for $geoNear query"**

**Solution:** Create the geospatial index:
```javascript
db.store.createIndex({ "address.location": "2dsphere" })
```

**Note:** The store-service test suite automatically creates this index.

### Database Not Found

MongoDB creates databases automatically on first write. If the database doesn't exist:
1. Start the store-service (it will create the database)
2. Or create manually: `use stores` in mongosh

---

## Data Persistence

### Docker Volume

To persist data across container restarts:

```bash
docker run -d \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  --name mongodb \
  mongo:latest
```

### Backup

```bash
# Export database
docker exec -it mongodb mongodump --db stores --out /backup

# Copy from container
docker cp mongodb:/backup ./backup
```

### Restore

```bash
# Copy to container
docker cp ./backup mongodb:/backup

# Restore database
docker exec -it mongodb mongorestore --db stores /backup/stores
```

---

## Production Considerations

### Security

- Enable authentication
- Use strong passwords
- Restrict network access
- Enable SSL/TLS
- Use MongoDB Atlas for managed service

### Performance

- Create appropriate indexes
- Monitor query performance
- Use connection pooling
- Configure appropriate memory limits

### High Availability

- Set up replica sets
- Configure sharding for large datasets
- Use MongoDB Atlas for managed clusters

---

## Related Documentation

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [Spring Data MongoDB Documentation](https://spring.io/projects/spring-data-mongodb)
- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [Docker Hub: MongoDB](https://hub.docker.com/_/mongo)

---

## Quick Reference

```bash
# Start
./startMongoDBService.sh

# Stop
./stopMongoDBService.sh

# Check status
docker ps | grep mongodb

# View logs
docker logs mongodb

# Connect to shell
docker exec -it mongodb mongosh

# Connect to stores database
docker exec -it mongodb mongosh mongodb://localhost:27017/stores
```
