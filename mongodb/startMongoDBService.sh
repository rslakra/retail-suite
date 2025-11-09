#!/bin/sh
# Author: Rohtash Lakra
clear
echo "Starting MongoDB server..."
docker run -d -p 27017:27017 --name mongodb mongo:latest
echo "MongoDB server started on port 27017"
echo ""
echo "MongoDB is now running and accessible at: mongodb://localhost:27017"
echo ""
echo "To connect using MongoDB shell:"
echo "  docker exec -it mongodb mongosh"
echo ""
echo "Or install mongosh locally and connect:"
echo "  mongosh mongodb://localhost:27017"
echo ""
echo "Note: MongoDB uses its own binary protocol, not HTTP."
echo "Your Spring Boot application can connect using: mongodb://localhost:27017/stores"
