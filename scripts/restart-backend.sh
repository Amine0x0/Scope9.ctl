#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Restarting backend container..."
docker compose -f docker/docker-compose.yml restart backend
echo "Backend restarted successfully"
echo "Backend is available at http://localhost:5000"
