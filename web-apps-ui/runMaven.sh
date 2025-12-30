#!/bin/bash
# Author: Rohtash Lakra
# Maven run script for Spring Boot application
# 
# This script runs the Maven/Spring Boot application.
# It automatically builds the frontend if needed before running.
# Maven will automatically copy src/main/resources/static/ to target/classes/static/
#
clear
#set -euo pipefail
#IFS=$'\n\t'
# Source common version function
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../version.sh"

# Source common frontend build function
source "${SCRIPT_DIR}/baseBuildMaven.sh"

echo
echo "${JAVA_HOME}"
echo

# Ensure frontend is built before Maven run
ensureFrontendBuilt

# Run Spring Boot application
SNAPSHOT_VERSION=$(buildVersion SNAPSHOT)
RELEASE_VERSION=$(buildVersion)
#java -jar target/liquibase-service-$RELEASE_VERSION.jar
#mvn clean package -DskipTests
mvn clean spring-boot:run -Drevision=$RELEASE_VERSION
echo
