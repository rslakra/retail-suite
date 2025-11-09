#!/bin/sh
# Author: Rohtash Lakra
clear
echo "Stopping RabbitMQ server..."
docker stop rabbitmq
docker rm rabbitmq
echo "RabbitMQ server stopped and removed"
