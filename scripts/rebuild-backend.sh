#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "Rebuilding backend container..."
docker compose -f docker/docker-compose.yml build backend
echo "Starting backend..."
docker compose -f docker/docker-compose.yml up -d backend
echo "Backend rebuilt and started successfully"
echo "Backend is available at http://localhost:5000"
