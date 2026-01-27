#!/bin/bash

# Quick Deployment Check Script
# Run this before deploying to ensure everything is ready

echo "🔍 Checking deployment readiness..."
echo ""

# Check if Git is initialized
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check for required files
FILES=(
    "backend/package.json"
    "frontend/package.json"
    "admin/package.json"
    "backend/server.js"
    ".gitignore"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
    fi
done

# Check if .env files are in .gitignore
if grep -q ".env" .gitignore; then
    echo "✅ .env files in .gitignore"
else
    echo "⚠️  Warning: .env files should be in .gitignore"
fi

# Check for .env files in repo
if git ls-files | grep -q ".env$"; then
    echo "⚠️  Warning: .env files found in git repository!"
    echo "   Run: git rm --cached **/.env"
else
    echo "✅ No .env files in repository"
fi

# Check if example env files exist
if [ -f "backend/.env.example" ]; then
    echo "✅ Backend .env.example exists"
else
    echo "ℹ️  Consider creating backend/.env.example"
fi

if [ -f "frontend/.env.example" ]; then
    echo "✅ Frontend .env.example exists"
else
    echo "ℹ️  Consider creating frontend/.env.example"
fi

if [ -f "admin/.env.example" ]; then
    echo "✅ Admin .env.example exists"
else
    echo "ℹ️  Consider creating admin/.env.example"
fi

echo ""
echo "📝 Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Prepare for deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Follow DEPLOYMENT_GUIDE.md"
echo ""
