#!/bin/bash

# GCP Deployment Script for Retail Billing System
# This script automates the deployment process to Google Cloud Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-asia-south1}"
DB_INSTANCE_NAME="retail-billing-db"
BACKEND_SERVICE="retail-billing-backend"
FRONTEND_SERVICE="retail-billing-frontend"

echo -e "${GREEN}🚀 Starting GCP Deployment${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}📋 Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  containerregistry.googleapis.com

# Build and deploy backend
echo -e "${YELLOW}🏗️  Building backend Docker image...${NC}"
cd backend
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest

echo -e "${YELLOW}🚀 Deploying backend to Cloud Run...${NC}"
# Get Cloud SQL connection name
DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(connectionName)" 2>/dev/null || echo "")

if [ -z "$DB_CONNECTION_NAME" ]; then
    echo -e "${RED}❌ Database instance not found. Please create it first using the deployment guide.${NC}"
    exit 1
fi

gcloud run deploy $BACKEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances $DB_CONNECTION_NAME \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format="value(status.url)")

echo -e "${GREEN}✅ Backend deployed: $BACKEND_URL${NC}"

# Build and deploy frontend
echo -e "${YELLOW}🏗️  Building frontend Docker image...${NC}"
cd ../frontend

# Update environment variable for build
export VITE_API_URL=$BACKEND_URL

docker build -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest --build-arg VITE_API_URL=$BACKEND_URL .
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest

echo -e "${YELLOW}🚀 Deploying frontend to Cloud Run...${NC}"
gcloud run deploy $FRONTEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL=$BACKEND_URL \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format="value(status.url)")

echo -e "${GREEN}✅ Frontend deployed: $FRONTEND_URL${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update CORS settings in backend to allow $FRONTEND_URL"
echo "2. Run database migrations"
echo "3. Test the application"
echo ""

