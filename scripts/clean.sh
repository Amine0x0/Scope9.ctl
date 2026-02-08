#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
set -e

docker compose -f docker/docker-compose.yml down --volumes --remove-orphans
docker rmi docker-backend docker-frontend 2>/dev/null || true
rm -rf Scope9.Backend/bin Scope9.Backend/obj
rm -rf Scope9.Core/bin Scope9.Core/obj
docker system prune -f
