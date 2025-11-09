#!/bin/sh
# Author: Rohtash Lakra
clear
echo "Starting RabbitMQ server..."
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management
echo "RabbitMQ server started on port 5672 and management UI started on port 15672"
echo "You can access the management UI at http://localhost:15672"
echo "The default username is 'guest' and the default password is 'guest'"
echo "You can change the username and password in the docker run command by adding the -u and -p flags: -u <username> -p <password>"
