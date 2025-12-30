#!/bin/sh
# Author: Rohtash Lakra
# Unified RabbitMQ service management script
# 
# Usage:
#   ./rabbitmq.sh --start       # Start RabbitMQ container
#   ./rabbitmq.sh --stop        # Stop RabbitMQ container
#   ./rabbitmq.sh --status      # Check RabbitMQ container status
#   ./rabbitmq.sh --restart     # Restart RabbitMQ container

clear

# Configuration variables
RABBITMQ_PORT="5672"
RABBITMQ_MGMT_PORT="15672"
RABBITMQ_CONTAINER_NAME="rabbitmq"
RABBITMQ_IMAGE="rabbitmq:3-management"
RABBITMQ_USERNAME="guest"
RABBITMQ_PASSWORD="guest"

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
    if docker ps -a --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
        if docker ps --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
            echo "running"
        else
            echo "stopped"
        fi
    else
        echo "not_exists"
    fi
}

# Function to start RabbitMQ
start_rabbitmq() {
    check_docker
    
    echo "🚀 Starting RabbitMQ server..."
    echo ""
    
    # Check if RabbitMQ container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
        # Check if container is already running
        if docker ps --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
            CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            echo "ℹ️  RabbitMQ container '${RABBITMQ_CONTAINER_NAME}' is already running"
            echo "   Container ID: ${CONTAINER_ID}"
            echo "   AMQP Port: ${RABBITMQ_PORT}"
            echo "   Management UI Port: ${RABBITMQ_MGMT_PORT}"
        else
            echo "📦 Starting existing RabbitMQ container '${RABBITMQ_CONTAINER_NAME}'..."
            docker start ${RABBITMQ_CONTAINER_NAME} > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
                echo "✅ RabbitMQ server started successfully"
                echo "   Container: ${RABBITMQ_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
                echo "   AMQP Port: ${RABBITMQ_PORT}"
                echo "   Management UI Port: ${RABBITMQ_MGMT_PORT}"
            else
                echo "❌ ERROR: Failed to start existing RabbitMQ container"
                exit 1
            fi
        fi
    else
        # Create and start new RabbitMQ container
        echo "📦 Creating new RabbitMQ container..."
        CONTAINER_ID=$(docker run -d -p ${RABBITMQ_PORT}:${RABBITMQ_PORT} -p ${RABBITMQ_MGMT_PORT}:${RABBITMQ_MGMT_PORT} --name ${RABBITMQ_CONTAINER_NAME} ${RABBITMQ_IMAGE} 2>&1)
        DOCKER_EXIT_CODE=$?
        
        if [ $DOCKER_EXIT_CODE -eq 0 ]; then
            # Wait a moment for container to be fully started
            sleep 2
            echo "✅ RabbitMQ server started successfully"
            echo "   Container: ${RABBITMQ_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
            echo "   Image: ${RABBITMQ_IMAGE}"
            echo "   AMQP Port: ${RABBITMQ_PORT}"
            echo "   Management UI Port: ${RABBITMQ_MGMT_PORT}"
        else
            echo "❌ ERROR: Failed to create RabbitMQ container"
            echo ""
            # Check if it's a port conflict
            if echo "${CONTAINER_ID}" | grep -q "port is already allocated"; then
                echo "   One or more ports (${RABBITMQ_PORT} or ${RABBITMQ_MGMT_PORT}) are already in use"
                echo "   Please stop the service using these ports or use different ports"
            elif echo "${CONTAINER_ID}" | grep -q "name is already in use"; then
                echo "   Container name '${RABBITMQ_CONTAINER_NAME}' is already in use"
                echo "   Please remove the existing container or use a different name"
            else
                echo "   Error details: ${CONTAINER_ID}"
            fi
            echo ""
            echo "Please check:"
            echo "  1. Docker is running and accessible"
            echo "  2. Ports ${RABBITMQ_PORT} and ${RABBITMQ_MGMT_PORT} are not already in use"
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
    echo "🔗 AMQP Connection String:"
    echo "   amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}"
    echo ""
    echo "🌐 Management UI:"
    echo "   http://localhost:${RABBITMQ_MGMT_PORT}"
    echo "   Username: ${RABBITMQ_USERNAME}"
    echo "   Password: ${RABBITMQ_PASSWORD}"
    echo ""
    echo "🔧 Spring Boot application configuration:"
    echo "   spring.rabbitmq.host=localhost"
    echo "   spring.rabbitmq.port=${RABBITMQ_PORT}"
    echo "   spring.rabbitmq.username=${RABBITMQ_USERNAME}"
    echo "   spring.rabbitmq.password=${RABBITMQ_PASSWORD}"
    echo ""
    echo "ℹ️  Note: To change username/password, modify the variables at the top of this script"
    echo "   or use environment variables in the docker run command."
    echo ""
}

# Function to stop RabbitMQ
stop_rabbitmq() {
    check_docker
    
    echo "🛑 Stopping RabbitMQ server..."
    echo ""
    
    # Check if RabbitMQ container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
        echo "ℹ️  RabbitMQ container '${RABBITMQ_CONTAINER_NAME}' does not exist"
        echo "   Nothing to stop."
        echo ""
        exit 0
    fi
    
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^${RABBITMQ_CONTAINER_NAME}$"; then
        CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
        echo "📦 Stopping RabbitMQ container '${RABBITMQ_CONTAINER_NAME}' (${CONTAINER_ID:0:12})..."
        docker stop ${RABBITMQ_CONTAINER_NAME} > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ RabbitMQ container stopped successfully"
        else
            echo "❌ ERROR: Failed to stop RabbitMQ container"
            exit 1
        fi
    else
        echo "ℹ️  RabbitMQ container '${RABBITMQ_CONTAINER_NAME}' is already stopped"
    fi
    
    # Remove the container
    echo "🗑️  Removing RabbitMQ container '${RABBITMQ_CONTAINER_NAME}'..."
    docker rm ${RABBITMQ_CONTAINER_NAME} > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ RabbitMQ container removed successfully"
    else
        echo "❌ ERROR: Failed to remove RabbitMQ container"
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ RabbitMQ server stopped and container removed"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to show RabbitMQ status
show_status() {
    check_docker
    
    echo "📊 RabbitMQ Service Status"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    STATUS=$(get_container_status)
    
    case "$STATUS" in
        "running")
            CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            CONTAINER_IMAGE=$(docker ps --format '{{.Image}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            RUNNING_FOR=$(docker ps --format '{{.RunningFor}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            STARTED_AT=$(docker inspect --format '{{.State.StartedAt}}' ${RABBITMQ_CONTAINER_NAME} 2>/dev/null | cut -d'T' -f1 2>/dev/null || echo "N/A")
            
            echo "✅ Status: RUNNING"
            echo ""
            echo "📦 Container Details:"
            echo "   Name: ${RABBITMQ_CONTAINER_NAME}"
            echo "   ID: ${CONTAINER_ID}"
            echo "   Image: ${CONTAINER_IMAGE}"
            echo "   AMQP Port: ${RABBITMQ_PORT}"
            echo "   Management UI Port: ${RABBITMQ_MGMT_PORT}"
            echo "   Running For: ${RUNNING_FOR}"
            if [ "$STARTED_AT" != "N/A" ]; then
                echo "   Started: ${STARTED_AT}"
            fi
            echo ""
            echo "🔗 Connection:"
            echo "   AMQP: amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}"
            echo "   Management UI: http://localhost:${RABBITMQ_MGMT_PORT}"
            ;;
        "stopped")
            CONTAINER_ID=$(docker ps -a --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            CONTAINER_IMAGE=$(docker ps -a --format '{{.Image}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
            
            echo "⏸️  Status: STOPPED"
            echo ""
            echo "📦 Container Details:"
            echo "   Name: ${RABBITMQ_CONTAINER_NAME}"
            echo "   ID: ${CONTAINER_ID}"
            echo "   Image: ${CONTAINER_IMAGE}"
            echo ""
            echo "💡 To start: ./rabbitmq.sh --start"
            ;;
        "not_exists")
            echo "❌ Status: NOT FOUND"
            echo ""
            echo "   RabbitMQ container '${RABBITMQ_CONTAINER_NAME}' does not exist."
            echo ""
            echo "💡 To create and start: ./rabbitmq.sh --start"
            ;;
    esac
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to restart RabbitMQ
restart_rabbitmq() {
    check_docker
    
    echo "🔄 Restarting RabbitMQ server..."
    echo ""
    
    STATUS=$(get_container_status)
    
    if [ "$STATUS" = "not_exists" ]; then
        echo "ℹ️  Container does not exist. Creating and starting..."
        echo ""
        start_rabbitmq
    elif [ "$STATUS" = "stopped" ]; then
        echo "ℹ️  Container is stopped. Starting..."
        echo ""
        start_rabbitmq
    else
        echo "📦 Stopping RabbitMQ container..."
        docker stop ${RABBITMQ_CONTAINER_NAME} > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Container stopped"
            echo ""
            echo "📦 Starting RabbitMQ container..."
            sleep 2
            docker start ${RABBITMQ_CONTAINER_NAME} > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                CONTAINER_ID=$(docker ps --format '{{.ID}}' --filter "name=${RABBITMQ_CONTAINER_NAME}")
                echo "✅ RabbitMQ server restarted successfully"
                echo "   Container: ${RABBITMQ_CONTAINER_NAME} (${CONTAINER_ID:0:12})"
                echo "   AMQP Port: ${RABBITMQ_PORT}"
                echo "   Management UI Port: ${RABBITMQ_MGMT_PORT}"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "📋 Connection Information"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                echo "🔗 AMQP Connection String:"
                echo "   amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}"
                echo ""
                echo "🌐 Management UI:"
                echo "   http://localhost:${RABBITMQ_MGMT_PORT}"
                echo ""
            else
                echo "❌ ERROR: Failed to restart RabbitMQ container"
                exit 1
            fi
        else
            echo "❌ ERROR: Failed to stop RabbitMQ container"
            exit 1
        fi
    fi
}

# Function to show usage
show_usage() {
    echo "RabbitMQ Service Management Script"
    echo ""
    echo "Usage:"
    echo "  ./rabbitmq.sh --start    Start RabbitMQ container"
    echo "  ./rabbitmq.sh --stop     Stop and remove RabbitMQ container"
    echo "  ./rabbitmq.sh --status   Show RabbitMQ container status"
    echo "  ./rabbitmq.sh --restart  Restart RabbitMQ container"
    echo ""
    echo "Configuration:"
    echo "  Container Name: ${RABBITMQ_CONTAINER_NAME}"
    echo "  AMQP Port: ${RABBITMQ_PORT}"
    echo "  Management UI Port: ${RABBITMQ_MGMT_PORT}"
    echo "  Image: ${RABBITMQ_IMAGE}"
    echo "  Username: ${RABBITMQ_USERNAME}"
    echo "  Password: ${RABBITMQ_PASSWORD}"
    echo ""
}

# Main script logic
case "$1" in
    --start)
        start_rabbitmq
        ;;
    --stop)
        stop_rabbitmq
        ;;
    --status)
        show_status
        ;;
    --restart)
        restart_rabbitmq
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

