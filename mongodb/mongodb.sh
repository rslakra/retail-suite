#!/bin/sh
# Author: Rohtash Lakra
# Unified MongoDB service management script
# 
# Usage:
#   ./mongodb.sh --start       # Start MongoDB container
#   ./mongodb.sh --stop        # Stop MongoDB container
#   ./mongodb.sh --status      # Check MongoDB container status
#   ./mongodb.sh --restart     # Restart MongoDB container

clear

# Configuration variables
MONGODB_PORT="27017"
MONGODB_CONTAINER_NAME="mongodb"
MONGODB_IMAGE="mongo:latest"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ ERROR: Docker is not running!"
        echo ""
        echo "Please start Docker Desktop (or Docker daemon) and try again."
        echo ""
        echo "To start Docker Desktop:"
        echo "  - macOS: Open Docker Desktop application"
        echo "  - Linux: sudo systemctl start docker"
        echo "  - Windows: Start Docker Desktop from Start menu"
        echo ""
        exit 1
    fi
}

# Function to get container status
get_container_status() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
        if docker ps --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
            echo "running"
        else
            echo "stopped"
        fi
    else
        echo "not_exists"
    fi
}

# Function to start MongoDB
start_mongodb() {
    check_docker
    
    echo "🚀 Starting MongoDB server..."
    echo ""
    
    # Check if MongoDB container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
        # Check if container is already running
        if docker ps --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
            CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            echo "ℹ️  MongoDB container '${MONGODB_CONTAINER_NAME}' is already running"
            echo "   Container ID: ${CONTAINER_ID}"
            echo "   Port: ${MONGODB_PORT}"
        else
            echo "📦 Starting existing MongoDB container '${MONGODB_CONTAINER_NAME}'..."
            docker start ${MONGODB_CONTAINER_NAME} > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
                echo "✅ MongoDB server started successfully"
                echo "   Container: ${MONGODB_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
                echo "   Port: ${MONGODB_PORT}"
            else
                echo "❌ ERROR: Failed to start existing MongoDB container"
                exit 1
            fi
        fi
    else
        # Create and start new MongoDB container
        echo "📦 Creating new MongoDB container..."
        CONTAINER_ID=$(docker run -d -p ${MONGODB_PORT}:${MONGODB_PORT} --name ${MONGODB_CONTAINER_NAME} ${MONGODB_IMAGE} 2>&1)
        DOCKER_EXIT_CODE=$?
        
        if [ $DOCKER_EXIT_CODE -eq 0 ]; then
            # Wait a moment for container to be fully started
            sleep 1
            echo "✅ MongoDB server started successfully"
            echo "   Container: ${MONGODB_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
            echo "   Image: ${MONGODB_IMAGE}"
            echo "   Port: ${MONGODB_PORT}"
        else
            echo "❌ ERROR: Failed to create MongoDB container"
            echo ""
            # Check if it's a port conflict
            if echo "${CONTAINER_ID}" | grep -q "port is already allocated"; then
                echo "   Port ${MONGODB_PORT} is already in use"
                echo "   Please stop the service using port ${MONGODB_PORT} or use a different port"
            elif echo "${CONTAINER_ID}" | grep -q "name is already in use"; then
                echo "   Container name '${MONGODB_CONTAINER_NAME}' is already in use"
                echo "   Please remove the existing container or use a different name"
            else
                echo "   Error details: ${CONTAINER_ID}"
            fi
            echo ""
            echo "Please check:"
            echo "  1. Docker is running and accessible"
            echo "  2. Port ${MONGODB_PORT} is not already in use"
            echo "  3. You have sufficient permissions to run Docker"
            echo ""
            exit 1
        fi
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Connection Information"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔗 Connection String:"
    echo "   mongodb://localhost:${MONGODB_PORT}"
    echo ""
    echo "💻 Connect using MongoDB shell (inside container):"
    echo "   docker exec -it ${MONGODB_CONTAINER_NAME} mongosh"
    echo ""
    echo "💻 Connect using MongoDB shell (local installation):"
    echo "   mongosh mongodb://localhost:${MONGODB_PORT}"
    echo ""
    echo "🔧 Spring Boot application configuration:"
    echo "   mongodb://localhost:${MONGODB_PORT}/stores"
    echo ""
    echo "ℹ️  Note: MongoDB uses its own binary protocol, not HTTP."
    echo ""
}

# Function to stop MongoDB
stop_mongodb() {
    check_docker
    
    echo "🛑 Stopping MongoDB server..."
    echo ""
    
    # Check if MongoDB container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
        echo "ℹ️  MongoDB container '${MONGODB_CONTAINER_NAME}' does not exist"
        echo "   Nothing to stop."
        echo ""
        exit 0
    fi
    
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER_NAME}$"; then
        CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
        echo "📦 Stopping MongoDB container '${MONGODB_CONTAINER_NAME}' (${CONTAINER_ID:0:12})..."
        docker stop ${MONGODB_CONTAINER_NAME} > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ MongoDB container stopped successfully"
        else
            echo "❌ ERROR: Failed to stop MongoDB container"
            exit 1
        fi
    else
        echo "ℹ️  MongoDB container '${MONGODB_CONTAINER_NAME}' is already stopped"
    fi
    
    # Remove the container
    echo "🗑️  Removing MongoDB container '${MONGODB_CONTAINER_NAME}'..."
    docker rm ${MONGODB_CONTAINER_NAME} > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB container removed successfully"
    else
        echo "❌ ERROR: Failed to remove MongoDB container"
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ MongoDB server stopped and container removed"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to show MongoDB status
show_status() {
    check_docker
    
    echo "📊 MongoDB Service Status"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    STATUS=$(get_container_status)
    
    case "$STATUS" in
        "running")
            CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            CONTAINER_IMAGE=$(docker ps --format '{{.Image}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            RUNNING_FOR=$(docker ps --format '{{.RunningFor}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            STARTED_AT=$(docker inspect --format '{{.State.StartedAt}}' ${MONGODB_CONTAINER_NAME} 2>/dev/null | cut -d'T' -f1 2>/dev/null || echo "N/A")
            
            echo "✅ Status: RUNNING"
            echo ""
            echo "📦 Container Details:"
            echo "   Name: ${MONGODB_CONTAINER_NAME}"
            echo "   ID: ${CONTAINER_ID}"
            echo "   Image: ${CONTAINER_IMAGE}"
            echo "   Port: ${MONGODB_PORT}"
            echo "   Running For: ${RUNNING_FOR}"
            if [ "$STARTED_AT" != "N/A" ]; then
                echo "   Started: ${STARTED_AT}"
            fi
            echo ""
            echo "🔗 Connection:"
            echo "   mongodb://localhost:${MONGODB_PORT}"
            ;;
        "stopped")
            CONTAINER_ID=$(docker ps -a --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            CONTAINER_IMAGE=$(docker ps -a --format '{{.Image}}' --filter "name=${MONGODB_CONTAINER_NAME}")
            
            echo "⏸️  Status: STOPPED"
            echo ""
            echo "📦 Container Details:"
            echo "   Name: ${MONGODB_CONTAINER_NAME}"
            echo "   ID: ${CONTAINER_ID}"
            echo "   Image: ${CONTAINER_IMAGE}"
            echo ""
            echo "💡 To start: ./mongodb.sh --start"
            ;;
        "not_exists")
            echo "❌ Status: NOT FOUND"
            echo ""
            echo "   MongoDB container '${MONGODB_CONTAINER_NAME}' does not exist."
            echo ""
            echo "💡 To create and start: ./mongodb.sh --start"
            ;;
    esac
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to restart MongoDB
restart_mongodb() {
    check_docker
    
    echo "🔄 Restarting MongoDB server..."
    echo ""
    
    STATUS=$(get_container_status)
    
    if [ "$STATUS" = "not_exists" ]; then
        echo "ℹ️  Container does not exist. Creating and starting..."
        echo ""
        start_mongodb
    elif [ "$STATUS" = "stopped" ]; then
        echo "ℹ️  Container is stopped. Starting..."
        echo ""
        start_mongodb
    else
        echo "📦 Stopping MongoDB container..."
        docker stop ${MONGODB_CONTAINER_NAME} > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Container stopped"
            echo ""
            echo "📦 Starting MongoDB container..."
            sleep 1
            docker start ${MONGODB_CONTAINER_NAME} > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${MONGODB_CONTAINER_NAME}")
                echo "✅ MongoDB server restarted successfully"
                echo "   Container: ${MONGODB_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
                echo "   Port: ${MONGODB_PORT}"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "📋 Connection Information"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "🔗 Connection String:"
                echo "   mongodb://localhost:${MONGODB_PORT}"
                echo ""
            else
                echo "❌ ERROR: Failed to restart MongoDB container"
                exit 1
            fi
        else
            echo "❌ ERROR: Failed to stop MongoDB container"
            exit 1
        fi
    fi
}

# Function to show usage
show_usage() {
    echo "MongoDB Service Management Script"
    echo ""
    echo "Usage:"
    echo "  ./mongodb.sh --start    Start MongoDB container"
    echo "  ./mongodb.sh --stop     Stop and remove MongoDB container"
    echo "  ./mongodb.sh --status   Show MongoDB container status"
    echo "  ./mongodb.sh --restart  Restart MongoDB container"
    echo ""
    echo "Configuration:"
    echo "  Container Name: ${MONGODB_CONTAINER_NAME}"
    echo "  Port: ${MONGODB_PORT}"
    echo "  Image: ${MONGODB_IMAGE}"
    echo ""
}

# Main script logic
case "$1" in
    --start)
        start_mongodb
        ;;
    --stop)
        stop_mongodb
        ;;
    --status)
        show_status
        ;;
    --restart)
        restart_mongodb
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

