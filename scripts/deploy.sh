#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Production Deployment Script - PharmaGen AI
# ==============================================================================

set -eo pipefail

echo "========================================="
echo " Starting PharmaGen AI EC2 Deployment"
echo "========================================="

# 1. Pull Latest Code
echo "[1/5] Pulling latest git repository updates..."
git pull origin main

# 2. Build Multi-Stage Docker Images
echo "[2/5] Building production Docker container images..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 3. Apply Alembic Database Migrations
echo "[3/5] Executing database schema migrations (Alembic)..."
docker-compose run --rm backend alembic upgrade head

# 4. Restart Services Zero-Downtime
echo "[4/5] Starting production containers..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# 5. Verify Health Checks
echo "[5/5] Performing system health check..."
sleep 15
HEALTH_STATUS=$(curl -s http://localhost/api/v1/monitoring/telemetry | grep -o "HEALTHY" || echo "UNHEALTHY")

if [ "$HEALTH_STATUS" == "HEALTHY" ]; then
    echo "========================================="
    echo " PharmaGen AI Deployed Successfully!"
    echo "========================================="
else
    echo "❌ Deployment Health Check Failed. Check container logs."
    docker-compose logs --tail=50
    exit 1
fi
