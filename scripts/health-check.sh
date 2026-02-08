#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Checking backend health..."
RESPONSE=$(curl -s http://localhost:5000/api/stat)

if [ $? -eq 0 ]; then
    echo "Backend is responding"
    echo "Backend statistics:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "Backend is not responding"
    echo "Make sure containers are running: ./scripts/start.sh"
fi
