#!/bin/bash

# Deployment Script for MVP Task Tracker

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Build Docker images
echo "🏗️ Building Docker images..."
docker-compose build

# 3. Stop current containers
echo "🛑 Stopping current containers..."
docker-compose down

# 4. Start new containers
echo "▶️ Starting new containers..."
docker-compose up -d

# 5. Run database migrations
echo "🔄 Running database migrations..."
docker-compose exec api npx prisma migrate deploy

echo "✅ Deployment completed successfully!"
