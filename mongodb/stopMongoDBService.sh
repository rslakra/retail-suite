#!/bin/sh
# Author: Rohtash Lakra
clear
echo "Stopping RabbitMQ server..."
docker stop mongodb
docker rm mongodb
echo "RabbitMQ server stopped and removed"
