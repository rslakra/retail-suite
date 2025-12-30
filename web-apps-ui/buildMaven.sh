#!/bin/bash
# Author: Rohtash Lakra
# Maven build script for Spring Boot application
# 
# This script builds the Maven/Java application.
# It automatically builds the frontend if needed before building.
# Maven will automatically copy src/main/resources/static/ to target/classes/static/
#
# Source common version function
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../version.sh"

# Source common frontend build function
source "${SCRIPT_DIR}/baseBuildMaven.sh"

echo
echo "${JAVA_HOME}"
echo

# Ensure frontend is built before Maven build
ensureFrontendBuilt

# Build Maven project
SNAPSHOT_VERSION=$(buildVersion SNAPSHOT)
RELEASE_VERSION=$(buildVersion)
#echo "RELEASE_VERSION: ${RELEASE_VERSION}, SNAPSHOT_VERSION: ${SNAPSHOT_VERSION}"
#mvn clean install -DskipTests=true -DprojectVersion=$RELEASE_VERSION
mvn clean install -Drevision=$SNAPSHOT_VERSION
mvn install -Drevision=$RELEASE_VERSION -DskipTests=true
#mvn clean install -DskipTests=true -DprojectVersion=$(./makeVersion.sh SNAPSHOT)
echo
