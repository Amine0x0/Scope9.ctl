#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Restarting all containers..."
docker compose -f docker/docker-compose.yml restart
echo "All containers restarted successfully"
echo "Frontend: http://localhost:80"
echo "Backend: http://localhost:5000"
