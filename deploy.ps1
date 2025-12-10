# GCP Deployment Script for Retail Billing System (PowerShell)
# This script automates the deployment process to Google Cloud Platform

param(
    [string]$ProjectId = $env:GCP_PROJECT_ID,
    [string]$Region = "asia-south1"
)

$ErrorActionPreference = "Stop"

# Configuration
if (-not $ProjectId) {
    Write-Host "❌ GCP_PROJECT_ID environment variable not set. Please set it or pass as parameter." -ForegroundColor Red
    exit 1
}

$DbInstanceName = "retail-billing-db"
$BackendService = "retail-billing-backend"
$FrontendService = "retail-billing-frontend"

Write-Host "🚀 Starting GCP Deployment" -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host "Region: $Region"
Write-Host ""

# Check if gcloud is installed
try {
    gcloud --version | Out-Null
} catch {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable `
  cloudbuild.googleapis.com `
  run.googleapis.com `
  sqladmin.googleapis.com `
  secretmanager.googleapis.com `
  storage-api.googleapis.com `
  containerregistry.googleapis.com

# Build and deploy backend
Write-Host "🏗️  Building backend Docker image..." -ForegroundColor Yellow
Set-Location backend
docker build -t "gcr.io/$ProjectId/$BackendService`:latest" .
docker push "gcr.io/$ProjectId/$BackendService`:latest"

Write-Host "🚀 Deploying backend to Cloud Run..." -ForegroundColor Yellow
# Get Cloud SQL connection name
$DbConnectionName = gcloud sql instances describe $DbInstanceName --format="value(connectionName)" 2>$null

if (-not $DbConnectionName) {
    Write-Host "❌ Database instance not found. Please create it first using the deployment guide." -ForegroundColor Red
    exit 1
}

gcloud run deploy $BackendService `
  --image "gcr.io/$ProjectId/$BackendService`:latest" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --add-cloudsql-instances $DbConnectionName `
  --set-env-vars "NODE_ENV=production,PORT=8080" `
  --set-secrets "JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest" `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300

# Get backend URL
$BackendUrl = gcloud run services describe $BackendService --platform managed --region $Region --format="value(status.url)"

Write-Host "✅ Backend deployed: $BackendUrl" -ForegroundColor Green

# Build and deploy frontend
Write-Host "🏗️  Building frontend Docker image..." -ForegroundColor Yellow
Set-Location ../frontend

docker build -t "gcr.io/$ProjectId/$FrontendService`:latest" --build-arg "VITE_API_URL=$BackendUrl" .
docker push "gcr.io/$ProjectId/$FrontendService`:latest"

Write-Host "🚀 Deploying frontend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $FrontendService `
  --image "gcr.io/$ProjectId/$FrontendService`:latest" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars "VITE_API_URL=$BackendUrl" `
  --memory 256Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10

# Get frontend URL
$FrontendUrl = gcloud run services describe $FrontendService --platform managed --region $Region --format="value(status.url)"

Write-Host "✅ Frontend deployed: $FrontendUrl" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL: $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update CORS settings in backend to allow $FrontendUrl"
Write-Host "2. Run database migrations"
Write-Host "3. Test the application"
Write-Host ""

