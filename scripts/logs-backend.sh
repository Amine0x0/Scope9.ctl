#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Backend logs (Ctrl+C to exit)..."
docker compose -f docker/docker-compose.yml logs -f backend
