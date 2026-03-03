#!/bin/bash

#############################################
# PoolCalc - Rsync Deployment Script
# Server: srv1280063.hstgr.cloud (72.61.195.195)
# URL: https://futronix.co.za/poolcalc
# Port: 3006
# Database: Supabase (cloud)
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_IP="72.61.195.195"
VPS_USER="root"
SSH_KEY="~/.ssh/srv1280063.hstgr.cloud"
VPS_APP_DIR="/var/www/futronix.co.za"
DOMAIN="futronix.co.za"
SUBPATH="/poolcalc"
APP_PORT=3006
PM2_NAME="poolcalc"

# SSH command
SSH_CMD="ssh -i ${SSH_KEY} ${VPS_USER}@${VPS_IP}"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}PoolCalc - Rsync Deployment${NC}"
echo -e "${BLUE}Server: srv1280063.hstgr.cloud${NC}"
echo -e "${BLUE}IP: ${VPS_IP}${NC}"
echo -e "${BLUE}URL: https://${DOMAIN}${SUBPATH}${NC}"
echo -e "${BLUE}Port: ${APP_PORT}${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check SSH key
if [ ! -f ~/.ssh/srv1280063.hstgr.cloud ]; then
    echo -e "${RED}Error: SSH key not found at ~/.ssh/srv1280063.hstgr.cloud${NC}"
    exit 1
fi

# Step 1: Test SSH connection
echo -e "\n${YELLOW}[1/7] Testing SSH connection...${NC}"
if ! ${SSH_CMD} "echo 'Connected'" 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to VPS${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"

# Step 2: Bump version
echo -e "\n${YELLOW}[2/7] Bumping version...${NC}"
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${BLUE}v${CURRENT_VERSION}${NC}"

IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
CURRENT_YYMM="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"
NEW_YYMM=$(date +"%y%m")

if [ "$CURRENT_YYMM" == "$NEW_YYMM" ]; then
    NEW_PATCH=$((PATCH + 1))
else
    NEW_PATCH=1
fi

NEW_VERSION="${MAJOR}.${NEW_YYMM}.${NEW_PATCH}"
npm version ${NEW_VERSION} --no-git-tag-version
echo -e "New version: ${GREEN}v${NEW_VERSION}${NC}"
echo -e "${GREEN}✓ Version bumped${NC}"

# Step 3: Git commit and push
echo -e "\n${YELLOW}[3/7] Committing and pushing...${NC}"
git add .
git commit -m "$(cat <<EOF
Release v${NEW_VERSION}

Deploy to ${DOMAIN}${SUBPATH}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)" || echo -e "${YELLOW}No changes to commit${NC}"
git push origin main 2>/dev/null && echo -e "${GREEN}✓ Pushed to GitHub${NC}" || echo -e "${YELLOW}⚠ Git push failed, continuing deploy...${NC}"

# Step 4: Rsync to VPS (NEVER deletes uploads)
echo -e "\n${YELLOW}[4/7] Syncing files to VPS...${NC}"
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.claude' \
    --exclude 'public/uploads' \
    --exclude 'uploads' \
    --exclude 'backups' \
    --exclude 'public-root' \
    -e "ssh -i ~/.ssh/srv1280063.hstgr.cloud" \
    ./ ${VPS_USER}@${VPS_IP}:${VPS_APP_DIR}/
echo -e "${GREEN}✓ Files synced (uploads preserved)${NC}"

# Step 5: Install dependencies
echo -e "\n${YELLOW}[5/7] Installing dependencies...${NC}"
${SSH_CMD} "cd ${VPS_APP_DIR} && npm install"
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 6: Build
echo -e "\n${YELLOW}[6/7] Building application...${NC}"
${SSH_CMD} "cd ${VPS_APP_DIR} && npm run build"
echo -e "${GREEN}✓ Build complete${NC}"

# Step 7: Restart PM2
echo -e "\n${YELLOW}[7/7] Restarting PM2...${NC}"
PM2_EXISTS=$(${SSH_CMD} "pm2 describe ${PM2_NAME} 2>/dev/null" && echo "yes" || echo "no")
if [ "$PM2_EXISTS" == "no" ]; then
    echo -e "${YELLOW}Creating new PM2 process...${NC}"
    ${SSH_CMD} "cd ${VPS_APP_DIR} && PORT=${APP_PORT} pm2 start npm --name ${PM2_NAME} -- start"
else
    ${SSH_CMD} "cd ${VPS_APP_DIR} && PORT=${APP_PORT} pm2 restart ${PM2_NAME} --update-env"
fi
${SSH_CMD} "pm2 save"
echo -e "${GREEN}✓ PM2 restarted${NC}"

# Health check
echo -e "\n${YELLOW}Running health check...${NC}"
sleep 5
HEALTH=$(${SSH_CMD} "curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT}${SUBPATH}" 2>/dev/null || echo "failed")
if [[ "$HEALTH" == "200" ]]; then
    echo -e "${GREEN}✓ Health check passed (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠ Health check: HTTP ${HEALTH}${NC}"
    echo -e "${YELLOW}  Check logs: ${SSH_CMD} 'pm2 logs ${PM2_NAME} --lines 50'${NC}"
fi

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}✓ PoolCalc Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "Version: ${GREEN}v${NEW_VERSION}${NC}"
echo -e "URL: ${BLUE}https://${DOMAIN}${SUBPATH}${NC}"
echo -e "\nCommands:"
echo -e "  Logs:    ${SSH_CMD} 'pm2 logs ${PM2_NAME}'"
echo -e "  Status:  ${SSH_CMD} 'pm2 status'"
echo -e "  Restart: ${SSH_CMD} 'pm2 restart ${PM2_NAME}'"
