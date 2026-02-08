#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Stopping all containers..."
docker compose -f docker/docker-compose.yml stop
echo "All containers stopped"
