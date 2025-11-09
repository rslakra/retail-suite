#!/bin/sh
# Script to insert a sample customer into the customer-service
# Usage: ./insertCustomer.sh [URL_BASE]
# Example: ./insertCustomer.sh http://localhost:9000

URL_BASE=${1:-http://localhost:9000}
curl -i -H "Content-Type: application/json" ${URL_BASE}/customers -d @customer-service/src/test/resources/customers.json
