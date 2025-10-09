#!/bin/bash

# 🚀 Auto-Deploy Script for Nikhil's Portfolio
# This script automates GitHub and Vercel deployment

set -e  # Exit on any error

echo "🎨 Portfolio Auto-Deploy Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Get GitHub username
echo -e "${BLUE}📝 Step 1: GitHub Setup${NC}"
read -p "Enter your GitHub username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Step 2: Create repository on GitHub (via web)
echo -e "\n${BLUE}📝 Step 2: Create GitHub Repository${NC}"
echo "Opening GitHub to create repository..."
echo ""
echo -e "${YELLOW}Please:${NC}"
echo "1. Click 'Create repository' button"
echo "2. Repository name: ${GREEN}nikhil-portfolio${NC}"
echo "3. Keep it Public"
echo "4. DON'T initialize with README"
echo "5. Click 'Create repository'"
echo ""

# Open GitHub new repo page
open "https://github.com/new" 2>/dev/null || xdg-open "https://github.com/new" 2>/dev/null || echo "Please visit: https://github.com/new"

read -p "Press ENTER after creating the repository..."

# Step 3: Push to GitHub
echo -e "\n${BLUE}📝 Step 3: Pushing Code to GitHub${NC}"

# Remove existing remote if any
git remote remove origin 2>/dev/null || true

# Add new remote
git remote add origin "https://github.com/$GITHUB_USER/nikhil-portfolio.git"

# Push code
echo "Pushing code to GitHub..."
git branch -M main
git push -u origin main

echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"

# Step 4: Deploy to Vercel
echo -e "\n${BLUE}📝 Step 4: Deploying to Vercel${NC}"
echo "Opening Vercel deployment page..."
echo ""
echo -e "${YELLOW}Please:${NC}"
echo "1. Sign in with GitHub"
echo "2. Click 'Import' next to nikhil-portfolio"
echo "3. Click 'Deploy'"
echo ""

# Open Vercel new project page
sleep 2
open "https://vercel.com/new" 2>/dev/null || xdg-open "https://vercel.com/new" 2>/dev/null || echo "Please visit: https://vercel.com/new"

echo ""
echo -e "${GREEN}🎉 Deployment process started!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Wait for Vercel to build (2-3 minutes)"
echo "2. Get your live URL from Vercel dashboard"
echo "3. (Optional) Add RESEND_API_KEY in Vercel Settings → Environment Variables"
echo ""
echo -e "${GREEN}✨ Your portfolio will be live soon!${NC}"
echo ""
