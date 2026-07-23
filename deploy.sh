#!/usr/bin/env bash
# ==============================================================================
# BMSC Production Automated Deployment Script
# ==============================================================================
set -e

echo "🚀 Starting BMSC Production Deployment..."

# 1. Fetch latest changes from repository
echo "📥 Pulling latest code from git..."
git pull origin main || git pull

# 2. Install Root / Frontend Dependencies
echo "📦 Installing root/frontend dependencies..."
npm install

# 3. Build Frontend & Validate Build Artifacts
echo "🏗️ Building frontend SPA bundle..."
npm run build

# 4. Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# 5. Build Backend TypeScript
echo "⚙️ Compiling backend TypeScript..."
npm run build

# 6. Run Database Migrations & Generate Prisma Client
echo "🗄️ Running Prisma migrations & client generation..."
npx prisma generate
npx prisma migrate deploy

# Return to root directory
cd ..

# 7. Set Permissions on Uploads Directory
echo "🔒 Adjusting permissions for backend/uploads..."
if [ -d "backend/uploads" ]; then
    chmod 755 backend/uploads
    # Try setting ownership to www-data if running as root or with sudo capability
    chown -R www-data:www-data backend/uploads 2>/dev/null || true
fi

# 8. Restart Backend Service (PM2 or systemd)
echo "🔄 Restarting backend service..."
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
    pm2 save
elif command -v systemctl &> /dev/null && systemctl is-active --quiet bmsc-backend; then
    sudo systemctl restart bmsc-backend
else
    echo "⚠️ Note: Neither active PM2 nor systemd service detected automatically."
    echo "Please ensure the backend is running via PM2 ('pm2 start ecosystem.config.js --env production') or systemd ('sudo systemctl restart bmsc-backend')."
fi

echo "✅ BMSC Deployment Completed Successfully!"
echo "=============================================================================="
echo "ℹ️ ROLLBACK PROCEDURE:"
echo "If issues arise after deployment, roll back to the previous commit using:"
echo "  1. git reset --hard HEAD~1"
echo "  2. npm run build"
echo "  3. cd backend && npm run build && npx prisma generate && cd .."
echo "  4. pm2 restart bmsc-backend (or sudo systemctl restart bmsc-backend)"
echo "=============================================================================="
