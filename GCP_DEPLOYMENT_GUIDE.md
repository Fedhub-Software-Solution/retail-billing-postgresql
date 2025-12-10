# Google Cloud Platform Deployment Guide

This guide will help you deploy the Retail Billing System to Google Cloud Platform for production use.

## Prerequisites

1. Google Cloud Account with billing enabled
2. Google Cloud SDK (gcloud) installed
3. Docker installed (for containerization)
4. Domain name (optional, for custom domain)

## Architecture Overview

- **Frontend**: Cloud Run or Firebase Hosting
- **Backend**: Cloud Run (containerized)
- **Database**: Cloud SQL (PostgreSQL)
- **Storage**: Cloud Storage (for file uploads, if needed)

## Step 1: Initial GCP Setup

### 1.1 Create a New Project

**For Linux/Mac (Bash):**
```bash
# Login to GCP
gcloud auth login

# Create a new project
gcloud projects create retail-billing-system-fedhub --name="Retail Billing System"

# Set the project as default
gcloud config set project retail-billing-system-fedhub

# Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud beta billing projects link retail-billing-system-fedhub --billing-account=01DFF7-0BAF5F-4C45B0
```

**For Windows Command Prompt (CMD):**
```cmd
REM Login to GCP
gcloud auth login

REM Create a new project
gcloud projects create retail-billing-system-fedhub --name="Retail Billing System"

REM Set the project as default
gcloud config set project retail-billing-system-fedhub

REM Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud beta billing projects link retail-billing-system-fedhub --billing-account=01DFF7-0BAF5F-4C45B0
```

**For Windows PowerShell:**
```powershell
# Login to GCP
gcloud auth login

# Create a new project
gcloud projects create retail-billing-system-fedhub --name="Retail Billing System"

# Set the project as default
gcloud config set project retail-billing-system-fedhub

# Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud beta billing projects link retail-billing-system-fedhub --billing-account=01DFF7-0BAF5F-4C45B0
```

### 1.2 Enable Required APIs

**For Linux/Mac (Bash):**
```bash
# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com
```

**For Windows Command Prompt (CMD):**
```cmd
REM Option 1: Single line (recommended)
gcloud services enable cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com storage-api.googleapis.com

REM Option 2: Multi-line with caret (^)
gcloud services enable ^
  cloudbuild.googleapis.com ^
  run.googleapis.com ^
  sqladmin.googleapis.com ^
  secretmanager.googleapis.com ^
  storage-api.googleapis.com
```

**For Windows PowerShell:**
```powershell
# PowerShell supports backticks for line continuation
gcloud services enable `
  cloudbuild.googleapis.com `
  run.googleapis.com `
  sqladmin.googleapis.com `
  secretmanager.googleapis.com `
  storage-api.googleapis.com
```

## Step 2: Database Setup (Cloud SQL)

### 2.1 Create PostgreSQL Instance

**For Linux/Mac (Bash):**
```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create retail-billing-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-south1 \
  --root-password=FedHubRetail@009 \
  --storage-type=SSD \
  --storage-size=20GB \
  --backup-start-time=03:00
```

**For Windows Command Prompt (CMD):**
```cmd
REM Option 1: Single line (recommended)
gcloud sql instances create retail-billing-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=asia-south1 --root-password=FedHubRetail@009 --storage-type=SSD --storage-size=20GB --backup-start-time=03:00

REM Option 2: Multi-line with caret (^)
gcloud sql instances create retail-billing-db ^
  --database-version=POSTGRES_15 ^
  --tier=db-f1-micro ^
  --region=asia-south1 ^
  --root-password=FedHubRetail@009 ^
  --storage-type=SSD ^
  --storage-size=20GB ^
  --backup-start-time=03:00
```

**For Windows PowerShell:**
```powershell
# PowerShell supports backticks for line continuation
gcloud sql instances create retail-billing-db `
  --database-version=POSTGRES_15 `
  --tier=db-f1-micro `
  --region=asia-south1 `
  --root-password=YOUR_SECURE_ROOT_PASSWORD `
  --storage-type=SSD `
  --storage-size=20GB `
  --backup-start-time=03:00
```

**Note**: 
- Replace `YOUR_SECURE_ROOT_PASSWORD` with a strong password
- Adjust `tier` based on your needs (db-f1-micro is the smallest/cheapest)
- Adjust `region` to your preferred region
- For production, consider `db-n1-standard-1` or higher

### 2.2 Create Database and User

```bash
# Create database
gcloud sql databases create retail_billing --instance=retail-billing-db

# Create application user
gcloud sql users create app_user \
  --instance=retail-billing-db \
  --password=YOUR_APP_USER_PASSWORD
```

**For Windows Command Prompt (CMD):**
```cmd
REM Create database
gcloud sql databases create retail_billing --instance=retail-billing-db

REM Create application user (single line)
gcloud sql users create app_user --instance=retail-billing-db --password=FedHubRetail@009

REM Or multi-line with caret (^)
gcloud sql users create app_user ^
  --instance=retail-billing-db ^
  --password=YOUR_APP_USER_PASSWORD
```

**For Windows PowerShell:**
```powershell
# Create database
gcloud sql databases create retail_billing --instance=retail-billing-db

# Create application user
gcloud sql users create app_user `
  --instance=retail-billing-db `
  --password=YOUR_APP_USER_PASSWORD
```

### 2.3 Get Connection Details

The connection name is automatically generated by GCP in the format: `PROJECT_ID:REGION:INSTANCE_NAME`

**For Linux/Mac (Bash):**
```bash
# Get connection name
gcloud sql instances describe retail-billing-db --format="value(connectionName)"

# Save this connection name - you'll need it for the backend
# Example output: my-project-123:asia-south1:retail-billing-db
```

**For Windows Command Prompt (CMD):**
```cmd
REM Get connection name
gcloud sql instances describe retail-billing-db --format="value(connectionName)"

REM Save this connection name - you'll need it for the backend
REM Example output: my-project-123:asia-south1:retail-billing-db
```

**For Windows PowerShell:**
```powershell
# Get connection name
gcloud sql instances describe retail-billing-db --format="value(connectionName)"

# Save this connection name - you'll need it for the backend
# Example output: my-project-123:asia-south1:retail-billing-db
```

**Note:** The connection name will be used in Step 4.2 when deploying the backend to Cloud Run. Copy the output and replace `PROJECT_ID:REGION:retail-billing-db` in the deployment command.

## Step 3: Environment Variables Setup

### 3.0 Generate JWT Secret (Required)

**JWT_SECRET is mandatory** for user authentication. The application uses JWT tokens for login and API security. You need to generate a secure random string.

**For Windows Command Prompt (CMD):**
```cmd
REM Option 1: Run PowerShell command from CMD (copy the output)
powershell -Command "$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create(); $bytes = New-Object byte[] 32; $rng.GetBytes($bytes); [Convert]::ToBase64String($bytes)"

REM This will output a random string like: "aB3dEf5gHiJkLmNoPqRsTuVwXyZ1234567890=="
REM Copy this string and use it as YOUR_JWT_SECRET

REM Option 2: Simpler PowerShell one-liner (alternative)
powershell -Command "-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})"

REM Option 3: Use Node.js (if installed - recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

REM Option 4: Use an online generator
REM Visit: https://www.grc.com/passwords.htm
REM Generate a 32-64 character random string
```

**For Windows PowerShell:**
```powershell
# Generate a secure random JWT secret (Base64 encoded)
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Or simpler one-liner (alphanumeric only)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or using Node.js (if installed)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**For Linux/Mac (Bash):**
```bash
# Generate a secure random JWT secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Note:** 
- Save the generated secret securely - you'll need it in the next step
- The default value in code (`your-super-secret-jwt-key-change-this-in-production`) is **NOT secure** for production
- Use a different secret for JWT_REFRESH_SECRET (generate another one)

### 3.1 Store Secrets in Secret Manager

**Note:** 
- **JWT_SECRET** and **DB_PASSWORD** are **MANDATORY**
- **Razorpay keys are OPTIONAL** - The application can work without Razorpay, but users will need to manually enter transaction IDs for payments. If you want automated payment processing (UPI/Card), you'll need Razorpay keys.

**For Linux/Mac (Bash):**
```bash
# Create mandatory secrets
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Create Razorpay secrets (OPTIONAL - skip if you don't have Razorpay account)
echo -n "YOUR_RAZORPAY_KEY_ID" | gcloud secrets create razorpay-key-id --data-file=-
echo -n "YOUR_RAZORPAY_KEY_SECRET" | gcloud secrets create razorpay-key-secret --data-file=-
```

**For Windows Command Prompt (CMD):**
```cmd
REM Create mandatory secrets
REM Create JWT secret
echo c1o0oIWDR0YBk+kWIXI3ulM6CfaiAatRiEUtYx/MNx8= > temp_jwt.txt
gcloud secrets create jwt-secret --data-file=temp_jwt.txt
del temp_jwt.txt

REM Create DB password secret
echo RetailBillingDBPassword > temp_db.txt
gcloud secrets create db-password --data-file=temp_db.txt
del temp_db.txt

REM Create Razorpay secrets (OPTIONAL - skip these if you don't have Razorpay account)
REM Create Razorpay Key ID secret
echo YOUR_RAZORPAY_KEY_ID > temp_keyid.txt
gcloud secrets create razorpay-key-id --data-file=temp_keyid.txt
del temp_keyid.txt

REM Create Razorpay Key Secret
echo YOUR_RAZORPAY_KEY_SECRET > temp_keysecret.txt
gcloud secrets create razorpay-key-secret --data-file=temp_keysecret.txt
del temp_keysecret.txt
```

**For Windows PowerShell:**
```powershell
# Create mandatory secrets
"YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
"YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Create Razorpay secrets (OPTIONAL - skip if you don't have Razorpay account)
"YOUR_RAZORPAY_KEY_ID" | gcloud secrets create razorpay-key-id --data-file=-
"YOUR_RAZORPAY_KEY_SECRET" | gcloud secrets create razorpay-key-secret --data-file=-
```

**If you don't have Razorpay keys:**
- Skip the Razorpay secret creation commands
- The application will still work - users can manually enter transaction IDs when completing sales
- To get Razorpay keys later: Sign up at https://razorpay.com and get your API keys from the dashboard

### 3.2 Grant Access to Secrets

**⚠️ MANDATORY: This step is REQUIRED if you're using Secret Manager!**

Without this, your backend won't be able to read secrets (JWT_SECRET, DB_PASSWORD, etc.) and will fail to start.

**What is a Service Account?**
A service account is a special Google account that represents your Cloud Run service (not a user). When you deploy to Cloud Run, GCP automatically creates a service account for your service. This service account needs permission to read secrets from Secret Manager.

**Important:** This step should be done AFTER you deploy your Cloud Run service (Step 4.2). The service account is created automatically when you deploy.

**Step 1: Get your service account email**

**For Linux/Mac (Bash):**
```bash
# Get the service account email for your Cloud Run service
# Replace PROJECT_ID with your actual project ID
gcloud run services describe retail-billing-backend \
  --platform managed \
  --region asia-south1 \
  --format="value(spec.template.spec.serviceAccountName)"

# If the above returns empty, use the default compute service account:
# Format: PROJECT_NUMBER-compute@developer.gserviceaccount.com
# Get your project number:
gcloud projects describe PROJECT_ID --format="value(projectNumber)"
# Then use: PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

**For Windows Command Prompt (CMD):**
```cmd
REM Get the service account email for your Cloud Run service
REM Replace PROJECT_ID with your actual project ID
gcloud run services describe retail-billing-backend --platform managed --region asia-south1 --format="value(spec.template.spec.serviceAccountName)"

REM If the above returns empty, use the default compute service account
REM Get your project number:
gcloud projects describe retail-billing-system-fedhub --format="value(projectNumber)"
REM Then use: PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

**For Windows PowerShell:**
```powershell
# Get the service account email for your Cloud Run service
gcloud run services describe retail-billing-backend `
  --platform managed `
  --region asia-south1 `
  --format="value(spec.template.spec.serviceAccountName)"

# If empty, get project number and use default:
$projectNumber = gcloud projects describe PROJECT_ID --format="value(projectNumber)"
# Use: $projectNumber-compute@developer.gserviceaccount.com
```

**Step 2: Grant access to secrets**

**For Linux/Mac (Bash):**
```bash
# Grant access to JWT secret
# Replace YOUR_SERVICE_ACCOUNT_EMAIL with the email from Step 1
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Grant access to DB password secret
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# If you created Razorpay secrets, grant access to them too:
gcloud secrets add-iam-policy-binding razorpay-key-id \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding razorpay-key-secret \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

**For Windows Command Prompt (CMD):**
```cmd
REM Grant access to JWT secret
REM Replace YOUR_SERVICE_ACCOUNT_EMAIL with the email from Step 1
REM Your service account email is: 481465107240-compute@developer.gserviceaccount.com
gcloud secrets add-iam-policy-binding jwt-secret --member="serviceAccount:481465107240-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

REM Grant access to DB password secret
REM Note: If you created the secret with a different name (like RetailBillingDBPassword), use that name instead
gcloud secrets add-iam-policy-binding db-password --member="serviceAccount:481465107240-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

REM If you created the secret as "RetailBillingDBPassword" instead of "db-password", grant access to that:
gcloud secrets add-iam-policy-binding RetailBillingDBPassword --member="serviceAccount:481465107240-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

REM If you created Razorpay secrets, grant access to them too:
gcloud secrets add-iam-policy-binding razorpay-key-id --member="serviceAccount:481465107240-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding razorpay-key-secret --member="serviceAccount:481465107240-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

**For Windows PowerShell:**
```powershell
# Grant access to secrets
# Replace YOUR_SERVICE_ACCOUNT_EMAIL with the email from Step 1
gcloud secrets add-iam-policy-binding jwt-secret `
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

# If you created Razorpay secrets:
gcloud secrets add-iam-policy-binding razorpay-key-id `
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding razorpay-key-secret `
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" `
  --role="roles/secretmanager.secretAccessor"
```

**Quick Reference:**
- **Default Cloud Run service account format:** `PROJECT_NUMBER-compute@developer.gserviceaccount.com`
- **Example:** If your project number is `123456789012`, the service account would be: `123456789012-compute@developer.gserviceaccount.com`
- **Note:** You can also find this in the Cloud Console under Cloud Run → Service Details → Security tab

## Step 4: Backend Deployment

### 4.1 Build and Push Docker Image

**Important: Authenticate Docker with GCP first!**

Before pushing to Google Container Registry, you need to authenticate Docker:

**For Windows Command Prompt (CMD):**
```cmd
REM Authenticate Docker with Google Cloud
gcloud auth configure-docker gcr.io

REM Or for Artifact Registry (newer):
gcloud auth configure-docker us-central1-docker.pkg.dev
```

**For Windows PowerShell:**
```powershell
# Authenticate Docker with Google Cloud
gcloud auth configure-docker gcr.io

# Or for Artifact Registry (newer):
gcloud auth configure-docker us-central1-docker.pkg.dev
```

**For Linux/Mac (Bash):**
```bash
# Authenticate Docker with Google Cloud
gcloud auth configure-docker gcr.io

# Or for Artifact Registry (newer):
gcloud auth configure-docker us-central1-docker.pkg.dev
```

**Then build and push:**

**For Linux/Mac (Bash):**
```bash
# Navigate to backend directory
cd backend

# Build Docker image
docker build -t gcr.io/PROJECT_ID/retail-billing-backend:latest .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/retail-billing-backend:latest
```

**For Windows Command Prompt (CMD):**
```cmd
REM Navigate to backend directory
cd backend

REM Build Docker image
docker build -t gcr.io/retail-billing-system-fedhub/retail-billing-backend:latest .

REM Push to Google Container Registry
docker push gcr.io/retail-billing-system-fedhub/retail-billing-backend:latest
```

**For Windows PowerShell:**
```powershell
# Step 1: Authenticate Docker with Google Cloud (REQUIRED FIRST!)
gcloud auth configure-docker gcr.io

# Step 2: Navigate to backend directory
cd backend

# Step 3: Build Docker image
docker build -t gcr.io/PROJECT_ID/retail-billing-backend:latest .

# Step 4: Push to Google Container Registry
docker push gcr.io/PROJECT_ID/retail-billing-backend:latest
```

### 4.2 Deploy to Cloud Run

**For Linux/Mac (Bash):**
```bash
# Navigate to backend directory (if not already there)
cd backend

# Deploy backend to Cloud Run
# If you have Razorpay keys, include them in --set-secrets
# If you don't have Razorpay keys, remove RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from --set-secrets

# With Razorpay (if you created Razorpay secrets):
# Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend \
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db \
  --set-env-vars NODE_ENV=production \
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest,RAZORPAY_KEY_ID=razorpay-key-id:latest,RAZORPAY_KEY_SECRET=razorpay-key-secret:latest \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

# Without Razorpay (if you skipped Razorpay secrets):
# Note: PORT is automatically set by Cloud Run - do NOT set it manually
# IMPORTANT: Set CLOUD_SQL_CONNECTION_NAME to match the --add-cloudsql-instances value
gcloud run deploy retail-billing-backend \
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db \
  --set-env-vars NODE_ENV=production,CLOUD_SQL_CONNECTION_NAME=PROJECT_ID:REGION:retail-billing-db,DB_NAME=retail_billing,DB_USER=app_user \
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

**For Windows Command Prompt (CMD):**
```cmd
REM Navigate to backend directory
cd backend

REM Deploy backend to Cloud Run
REM If you have Razorpay keys, use the first command
REM If you don't have Razorpay keys, use the second command (without Razorpay secrets)

REM With Razorpay (single line):
REM Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend --image gcr.io/PROJECT_ID/retail-billing-backend:latest --platform managed --region asia-south1 --allow-unauthenticated --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db --set-env-vars NODE_ENV=production --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest,RAZORPAY_KEY_ID=razorpay-key-id:latest,RAZORPAY_KEY_SECRET=razorpay-key-secret:latest --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300

REM Without Razorpay (single line - if you skipped Razorpay secrets):
REM Note: PORT is automatically set by Cloud Run - do NOT set it manually
REM IMPORTANT: Set CLOUD_SQL_CONNECTION_NAME to match the --add-cloudsql-instances value
gcloud run deploy retail-billing-backend --image gcr.io/retail-billing-system-fedhub/retail-billing-backend:latest --platform managed --region asia-south1 --allow-unauthenticated --add-cloudsql-instances retail-billing-system-fedhub:asia-south1:retail-billing-db --set-env-vars NODE_ENV=production,CLOUD_SQL_CONNECTION_NAME=retail-billing-system-fedhub:asia-south1:retail-billing-db,DB_NAME=retail_billing,DB_USER=app_user --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300

REM Or multi-line with caret (^) - With Razorpay:
REM Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend ^
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest ^
  --platform managed ^
  --region asia-south1 ^
  --allow-unauthenticated ^
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db ^
  --set-env-vars NODE_ENV=production ^
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest,RAZORPAY_KEY_ID=razorpay-key-id:latest,RAZORPAY_KEY_SECRET=razorpay-key-secret:latest ^
  --memory 512Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10 ^
  --timeout 300

REM Or multi-line without Razorpay:
REM Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend ^
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest ^
  --platform managed ^
  --region asia-south1 ^
  --allow-unauthenticated ^
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db ^
  --set-env-vars NODE_ENV=production ^
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest ^
  --memory 512Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10 ^
  --timeout 300
```

**For Windows PowerShell:**
```powershell
# Navigate to backend directory (if not already there)
cd backend

# Deploy backend to Cloud Run
# If you have Razorpay keys, use the first command
# If you don't have Razorpay keys, use the second command (without Razorpay secrets)

# With Razorpay:
# Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend `
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db `
  --set-env-vars NODE_ENV=production `
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest,RAZORPAY_KEY_ID=razorpay-key-id:latest,RAZORPAY_KEY_SECRET=razorpay-key-secret:latest `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300

# Without Razorpay (if you skipped Razorpay secrets):
# Note: PORT is automatically set by Cloud Run - do NOT set it manually
gcloud run deploy retail-billing-backend `
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db `
  --set-env-vars NODE_ENV=production `
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300
```

**Note**: Replace `PROJECT_ID` and `REGION` with your actual values.

### 4.3 Get Backend URL

**For Linux/Mac (Bash):**
```bash
# Get the service URL
gcloud run services describe retail-billing-backend \
  --platform managed \
  --region asia-south1 \
  --format="value(status.url)"
```

**For Windows Command Prompt (CMD):**
```cmd
REM Get the service URL (single line)
gcloud run services describe retail-billing-backend --platform managed --region asia-south1 --format="value(status.url)"

REM Or multi-line with caret (^)
gcloud run services describe retail-billing-backend ^
  --platform managed ^
  --region asia-south1 ^
  --format="value(status.url)"
```

**Note:** You may see two URLs after deployment:
- Default format: `https://retail-billing-backend-xxxxx-el.a.run.app`
- Regional format: `https://retail-billing-backend-xxxxx.asia-south1.run.app`

**Both URLs work!** Use whichever one is returned by the command above, or test both. The default format (`-el.a.run.app`) is typically recommended.

**For Windows PowerShell:**
```powershell
# Get the service URL
gcloud run services describe retail-billing-backend `
  --platform managed `
  --region asia-south1 `
  --format="value(status.url)"
```

## Step 5: Frontend Deployment

### 5.1 Build Frontend

**For Linux/Mac (Bash):**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

**For Windows Command Prompt (CMD):**
```cmd
REM Navigate to frontend directory
cd frontend

REM Install dependencies
npm install

REM Build for production
npm run build
```

**For Windows PowerShell:**
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 5.2 Deploy to Cloud Run (Option 1 - Recommended)

**For Linux/Mac (Bash):**
```bash
# Step 1: Get your backend URL (if you haven't already)
BACKEND_URL=$(gcloud run services describe retail-billing-backend --platform managed --region asia-south1 --format="value(status.url)")

# Step 2: Build frontend Docker image with VITE_API_URL as build argument
# IMPORTANT: VITE_API_URL must be set at BUILD time, not runtime!
docker build --build-arg VITE_API_URL=${BACKEND_URL}/api/v1 -t gcr.io/PROJECT_ID/retail-billing-frontend:latest .

# Step 3: Push to Google Container Registry
docker push gcr.io/PROJECT_ID/retail-billing-frontend:latest

# Step 4: Deploy to Cloud Run (no VITE_API_URL needed - it's baked into the build)
gcloud run deploy retail-billing-frontend \
  --image gcr.io/PROJECT_ID/retail-billing-frontend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

**For Windows Command Prompt (CMD):**
```cmd
REM Step 1: Get your backend URL (if you haven't already)
gcloud run services describe retail-billing-backend --platform managed --region asia-south1 --format="value(status.url)"

REM Step 2: Build frontend Docker image with VITE_API_URL as build argument
REM IMPORTANT: VITE_API_URL must be set at BUILD time, not runtime!
REM Replace https://retail-billing-backend-xxxxx-xx.a.run.app with YOUR actual backend URL
docker build --build-arg VITE_API_URL=https://retail-billing-backend-481465107240.asia-south1.run.app/api/v1 -t gcr.io/retail-billing-system-fedhub/retail-billing-frontend:latest .

REM Step 3: Push to Google Container Registry
docker push gcr.io/retail-billing-system-fedhub/retail-billing-frontend:latest

REM Step 4: Deploy to Cloud Run (no VITE_API_URL needed - it's baked into the build)
gcloud run deploy retail-billing-frontend --image gcr.io/retail-billing-system-fedhub/retail-billing-frontend:latest --platform managed --region asia-south1 --allow-unauthenticated --memory 256Mi --cpu 1 --min-instances 0 --max-instances 10

REM Or multi-line with caret (^)
gcloud run deploy retail-billing-frontend ^
  --image gcr.io/PROJECT_ID/retail-billing-frontend:latest ^
  --platform managed ^
  --region asia-south1 ^
  --allow-unauthenticated ^
  --memory 256Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10
```

**For Windows PowerShell:**
```powershell
# Step 1: Get your backend URL (if you haven't already)
$backendUrl = gcloud run services describe retail-billing-backend --platform managed --region asia-south1 --format="value(status.url)"
Write-Host "Backend URL: $backendUrl"

# Step 2: Build frontend Docker image with VITE_API_URL as build argument
# IMPORTANT: VITE_API_URL must be set at BUILD time, not runtime!
docker build --build-arg VITE_API_URL="$backendUrl/api/v1" -t gcr.io/PROJECT_ID/retail-billing-frontend:latest .

# Step 3: Push to Google Container Registry
docker push gcr.io/PROJECT_ID/retail-billing-frontend:latest

# Step 4: Deploy to Cloud Run (no VITE_API_URL needed - it's baked into the build)
gcloud run deploy retail-billing-frontend `
  --image gcr.io/PROJECT_ID/retail-billing-frontend:latest `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --memory 256Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10
```

### 5.3 Deploy to Firebase Hosting (Option 2 - Alternative)

**For Linux/Mac (Bash):**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**For Windows Command Prompt (CMD):**
```cmd
REM Install Firebase CLI
npm install -g firebase-tools

REM Login to Firebase
firebase login

REM Initialize Firebase (if not already done)
firebase init hosting

REM Deploy
firebase deploy --only hosting
```

**For Windows PowerShell:**
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Step 6: Database Migration

### 6.1 Run Migrations

**For Linux/Mac (Bash):**
```bash
# Step 1: Authenticate with Google Cloud (REQUIRED FIRST!)
gcloud auth application-default login

# Step 2: Connect to Cloud SQL using Cloud SQL Proxy (v2.8.0+ syntax)
cloud-sql-proxy PROJECT_ID:REGION:retail-billing-db

# Or specify a custom port
cloud-sql-proxy --address 127.0.0.1 --port 5432 PROJECT_ID:REGION:retail-billing-db

# Keep this terminal open! The proxy will listen on localhost:5432

# Step 3: In another terminal, run migrations
cd backend
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=retail_billing
export DB_USER=app_user
export DB_PASSWORD=YourDBPassword
npm run migrate

# Option 2: Using gcloud beta (supports IPv6)
gcloud beta sql connect retail-billing-db --user=postgres

# Then run SQL files manually
\i src/database/schema.sql
\i src/database/migrations/001_add_comprehensive_settings.sql
```

**For Windows Command Prompt (CMD):**
```cmd
REM Step 1: Authenticate with Google Cloud (REQUIRED FIRST!)
REM If browser authentication succeeds but command fails, try these steps:

REM Option A: Revoke and re-authenticate (clears any cached issues)
gcloud auth application-default revoke
gcloud auth application-default login

REM Option B: If browser opens but you need to ensure all scopes are granted:
REM 1. Make sure you click "Allow" on ALL permission prompts in the browser
REM 2. Wait for the browser to show "Authentication successful" or similar
REM 3. Don't close the browser tab until you see success message
REM 4. Then check if command prompt shows success

REM Option C: Use --no-browser for manual control
REM 1. Run: gcloud auth application-default login --no-browser
REM 2. Copy the URL shown
REM 3. Open URL in browser
REM 4. Complete authentication and grant ALL permissions
REM 5. Copy the ENTIRE redirect URL (with code= parameter) from browser
REM 6. Paste it back into terminal

REM Option D: Verify authentication worked
gcloud auth application-default print-access-token
REM If this returns a token, authentication succeeded!

REM Step 2: Start Cloud SQL Proxy (v2.8.0+ syntax)
REM If port 5432 is in use or blocked, use a different port (like 5433)
REM The instance connection name is a positional argument, not a flag

REM Option A: Use default port (random, check output for actual port)
cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db

REM Option B: Use a different port if 5432 is blocked (recommended)
cloud-sql-proxy.x64.exe --address 127.0.0.1 --port 5433 retail-billing-system-fedhub:asia-south1:retail-billing-db

REM Note: If you get "bind: access forbidden" error, port 5432 might be:
REM - Already in use by local PostgreSQL
REM - Reserved by Windows
REM - Blocked by firewall
REM Solution: Use port 5433, 5434, or any other available port

REM Keep this terminal open! The proxy will listen on localhost:5432

REM Step 3: In another terminal, run migrations
REM IMPORTANT: Use the same port you specified in Step 2!
REM If you used port 5433, change DB_PORT to 5433
cd backend
set DB_HOST=localhost
set DB_PORT=5433
set DB_NAME=retail_billing
set DB_USER=postgres
set DB_PASSWORD=FedHubRetail@009
npm run migrate

REM Option 2: Using gcloud beta (supports IPv6)
gcloud beta sql connect retail-billing-db --user=postgres

REM Then run SQL files manually (in psql prompt)
\i src/database/schema.sql
\i src/database/migrations/001_add_comprehensive_settings.sql
```

**For Windows PowerShell:**
```powershell
# Step 1: Authenticate with Google Cloud (REQUIRED FIRST!)
# This sets up Application Default Credentials for Cloud SQL Proxy
gcloud auth application-default login

# Step 2: Download Cloud SQL Proxy (if not already downloaded)
Invoke-WebRequest -Uri "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe" -OutFile "cloud-sql-proxy.x64.exe"

# Step 3: Start Cloud SQL Proxy (v2.8.0+ syntax - keep this terminal open)
.\cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db

# Or specify a custom port
.\cloud-sql-proxy.x64.exe --address 127.0.0.1 --port 5432 retail-billing-system-fedhub:asia-south1:retail-billing-db

# Step 4: In another terminal, run migrations
cd backend
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="retail_billing"
$env:DB_USER="app_user"
$env:DB_PASSWORD="RetailBillingDBPassword"
npm run migrate
```

### 6.2 Seed Initial Data

**Important:** Make sure Cloud SQL Proxy is still running in another terminal before seeding!

**For Linux/Mac (Bash):**
```bash
# Make sure environment variables are set
export DB_HOST=localhost
export DB_PORT=5433  # Use the port from Cloud SQL Proxy
export DB_NAME=retail_billing
export DB_USER=postgres  # Or app_user if you prefer
export DB_PASSWORD=YourDBPassword

# Run seed script
cd backend
npm run seed
```

**For Windows Command Prompt (CMD):**
```cmd
REM Make sure Cloud SQL Proxy is running in another terminal!
REM Set environment variables
set DB_HOST=localhost
set DB_PORT=5433
set DB_NAME=retail_billing
set DB_USER=postgres
set DB_PASSWORD=FedHubRetail@009

REM Run seed script
cd backend
npm run seed
```

**For Windows PowerShell:**
```powershell
# Make sure Cloud SQL Proxy is running in another terminal!
# Set environment variables
$env:DB_HOST="localhost"
$env:DB_PORT="5433"
$env:DB_NAME="retail_billing"
$env:DB_USER="postgres"
$env:DB_PASSWORD="FedHubRetail@009"

# Run seed script
cd backend
npm run seed
```

**Troubleshooting:**
- If you get "connection timeout" error, make sure Cloud SQL Proxy is still running
- Check that you're using the correct port (5433 if you used that, or check proxy output)
- Verify the password matches what you set when creating the user
- Try using `postgres` user instead of `app_user` for seeding

## Step 7: Configure CORS

The backend already uses the `CORS_ORIGIN` environment variable for CORS configuration. You need to:

1. **Get your Frontend Cloud Run URL** (after deploying frontend in Step 5)

**For Linux/Mac (Bash):**
```bash
# Get the frontend service URL
gcloud run services describe retail-billing-frontend \
  --platform managed \
  --region asia-south1 \
  --format="value(status.url)"
```

**For Windows Command Prompt (CMD):**
```cmd
REM Get the frontend service URL (single line)
gcloud run services describe retail-billing-frontend --platform managed --region asia-south1 --format="value(status.url)"
```

**For Windows PowerShell:**
```powershell
# Get the frontend service URL
gcloud run services describe retail-billing-frontend `
  --platform managed `
  --region asia-south1 `
  --format="value(status.url)"
```

**Example output:** `https://retail-billing-frontend-xxxxx-xx.a.run.app`

2. **Update Backend Deployment with CORS_ORIGIN**

Re-deploy your backend with the `CORS_ORIGIN` environment variable set to your frontend URL:

**For Linux/Mac (Bash):**
```bash
# Navigate to backend directory (optional, but recommended for consistency)
cd backend

# Re-deploy backend with CORS_ORIGIN
# IMPORTANT: Set CLOUD_SQL_CONNECTION_NAME to match the --add-cloudsql-instances value
gcloud run deploy retail-billing-backend \
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db \
  --set-env-vars NODE_ENV=production,CORS_ORIGIN=https://retail-billing-frontend-xxxxx-xx.a.run.app,CLOUD_SQL_CONNECTION_NAME=PROJECT_ID:REGION:retail-billing-db,DB_NAME=retail_billing,DB_USER=app_user \
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

**For Windows Command Prompt (CMD):**
```cmd
REM Navigate to backend directory (optional, but recommended for consistency)
cd backend

REM Replace https://retail-billing-frontend-xxxxx-xx.a.run.app with YOUR actual frontend URL
REM IMPORTANT: Set CLOUD_SQL_CONNECTION_NAME to match the --add-cloudsql-instances value
gcloud run deploy retail-billing-backend --image gcr.io/retail-billing-system-fedhub/retail-billing-backend:latest --platform managed --region asia-south1 --allow-unauthenticated --add-cloudsql-instances retail-billing-system-fedhub:asia-south1:retail-billing-db --set-env-vars NODE_ENV=production,CORS_ORIGIN=https://retail-billing-frontend-wtsvhyfmxa-el.a.run.app,CLOUD_SQL_CONNECTION_NAME=retail-billing-system-fedhub:asia-south1:retail-billing-db,DB_NAME=retail_billing,DB_USER=app_user --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300
```

**For Windows PowerShell:**
```powershell
# Navigate to backend directory (optional, but recommended for consistency)
cd backend

# Replace https://retail-billing-frontend-xxxxx-xx.a.run.app with YOUR actual frontend URL
gcloud run deploy retail-billing-backend `
  --image gcr.io/PROJECT_ID/retail-billing-backend:latest `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --add-cloudsql-instances PROJECT_ID:REGION:retail-billing-db `
  --set-env-vars NODE_ENV=production,CORS_ORIGIN=https://retail-billing-frontend-xxxxx-xx.a.run.app `
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300
```

**Note:** 
- Replace `https://retail-billing-frontend-xxxxx-xx.a.run.app` with your actual frontend URL from step 1
- If you have multiple frontend URLs (e.g., custom domain), separate them with commas: `CORS_ORIGIN=https://frontend1.com,https://frontend2.com`
- No code changes needed - the backend already reads from `CORS_ORIGIN` environment variable

## Step 8: Custom Domain Setup (Optional)

### 8.1 Map Custom Domain to Cloud Run

**For Linux/Mac (Bash):**
```bash
# Add domain mapping
gcloud run domain-mappings create \
  --service retail-billing-frontend \
  --domain yourdomain.com \
  --region asia-south1
```

**For Windows Command Prompt (CMD):**
```cmd
REM Add domain mapping (single line)
gcloud run domain-mappings create --service retail-billing-frontend --domain yourdomain.com --region asia-south1

REM Or multi-line with caret (^)
gcloud run domain-mappings create ^
  --service retail-billing-frontend ^
  --domain yourdomain.com ^
  --region asia-south1
```

**For Windows PowerShell:**
```powershell
# Add domain mapping
gcloud run domain-mappings create `
  --service retail-billing-frontend `
  --domain yourdomain.com `
  --region asia-south1
```

### 8.2 SSL Certificate

Cloud Run automatically provisions SSL certificates for custom domains.

## Step 9: Monitoring and Logging

### 9.1 Enable Logging

Logs are automatically sent to Cloud Logging. View them:

**For Linux/Mac (Bash):**
```bash
# View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-backend" --limit 50

# View frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-frontend" --limit 50
```

**For Windows Command Prompt (CMD):**
```cmd
REM View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-backend" --limit 50

REM View frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-frontend" --limit 50
```

**For Windows PowerShell:**
```powershell
# View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-backend" --limit 50

# View frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retail-billing-frontend" --limit 50
```

### 9.2 Set Up Monitoring

**For Linux/Mac (Bash):**
```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com
```

**For Windows Command Prompt (CMD):**
```cmd
REM Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com
```

**For Windows PowerShell:**
```powershell
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com
```

## Step 10: Security Best Practices

### 10.1 Update Environment Variables

Ensure all sensitive data is in Secret Manager, not in environment variables.

### 10.2 Set Up IAM (OPTIONAL - Advanced)

**⚠️ IMPORTANT: This step is OPTIONAL!**

When you deploy to Cloud Run with `--add-cloudsql-instances`, GCP **automatically** grants the necessary Cloud SQL permissions to the default compute service account. You don't need to create a custom service account unless you want more granular control.

**When you might want this:**
- You want to use a custom service account instead of the default one
- You need more granular IAM control
- You're following strict security policies that require custom service accounts

**If you skip this step:** Your application will work fine using the default compute service account.

**If you want to use a custom service account:**

**For Linux/Mac (Bash):**
```bash
# Create service account for backend
gcloud iam service-accounts create retail-billing-backend-sa \
  --display-name="Retail Billing Backend Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Then update your Cloud Run deployment to use this service account:
# Add --service-account=retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com to your deploy command
```

**For Windows Command Prompt (CMD):**
```cmd
REM Create service account for backend (single line)
gcloud iam service-accounts create retail-billing-backend-sa --display-name="Retail Billing Backend Service Account"

REM Or multi-line with caret (^)
gcloud iam service-accounts create retail-billing-backend-sa ^
  --display-name="Retail Billing Backend Service Account"

REM Grant necessary permissions (single line)
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudsql.client"

REM Or multi-line with caret (^)
gcloud projects add-iam-policy-binding PROJECT_ID ^
  --member="serviceAccount:retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com" ^
  --role="roles/cloudsql.client"

REM Then update your Cloud Run deployment to use this service account:
REM Add --service-account=retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com to your deploy command
```

**For Windows PowerShell:**
```powershell
# Create service account for backend
gcloud iam service-accounts create retail-billing-backend-sa `
  --display-name="Retail Billing Backend Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/cloudsql.client"

# Then update your Cloud Run deployment to use this service account:
# Add --service-account=retail-billing-backend-sa@PROJECT_ID.iam.gserviceaccount.com to your deploy command
```

### 10.3 Enable Security Features

- Enable Cloud Armor for DDoS protection
- Set up Cloud IAP (Identity-Aware Proxy) if needed
- Configure firewall rules

## Step 11: Cost Optimization

### 11.1 Set Up Budget Alerts

**Note:** Budget alerts require a YAML configuration file. The command-line approach with multiple `--threshold-rule` flags doesn't work reliably.

**Step 1: Create a budget configuration file**

Create a file named `budget-config.yaml` in your project root:

```yaml
displayName: "Retail Billing Budget"
budgetFilter:
  projects:
    - projects/PROJECT_NUMBER
amount:
  specifiedAmount:
    currencyCode: "USD"
    units: "20"
thresholdRules:
  - thresholdPercent: 0.5
    spendBasis: CURRENT_SPEND
  - thresholdPercent: 0.9
    spendBasis: CURRENT_SPEND
  - thresholdPercent: 1.0
    spendBasis: CURRENT_SPEND
```

**Important:** Replace `PROJECT_NUMBER` with your actual project number. Get it with:
```cmd
gcloud projects describe retail-billing-system-fedhub --format="value(projectNumber)"
```

**Step 2: Create the budget**

**For Linux/Mac (Bash):**
```bash
# Get your project number first
PROJECT_NUMBER=$(gcloud projects describe retail-billing-system-fedhub --format="value(projectNumber)")

# Create budget using YAML file
gcloud billing budgets create \
  --billing-account=01DFF7-0BAF5F-4C45B0 \
  --budget-file=budget-config.yaml
```

**For Windows Command Prompt (CMD):**
```cmd
REM Step 1: Get your project number
gcloud projects describe retail-billing-system-fedhub --format="value(projectNumber)"

REM Step 2: Edit budget-config.yaml and replace PROJECT_NUMBER with the number from Step 1

REM Step 3: Create budget using YAML file (single line)
gcloud billing budgets create --billing-account=01DFF7-0BAF5F-4C45B0 --budget-file=budget-config.yaml

REM Or multi-line with caret (^)
gcloud billing budgets create ^
  --billing-account=01DFF7-0BAF5F-4C45B0 ^
  --budget-file=budget-config.yaml
```

**For Windows PowerShell:**
```powershell
# Step 1: Get your project number
$projectNumber = gcloud projects describe retail-billing-system-fedhub --format="value(projectNumber)"
Write-Host "Your project number is: $projectNumber"
Write-Host "Update budget-config.yaml and replace PROJECT_NUMBER with: $projectNumber"

# Step 2: Create budget using YAML file
gcloud billing budgets create `
  --billing-account=01DFF7-0BAF5F-4C45B0 `
  --budget-file=budget-config.yaml
```

**Alternative: Create budget via Cloud Console (Easier)**

If the YAML approach is too complex, you can create budgets via the web console:

1. Go to: https://console.cloud.google.com/billing/budgets
2. Click "Create Budget"
3. Select your billing account
4. Set budget amount (e.g., $20)
5. Add alert thresholds (50%, 90%, 100%)
6. Configure notification channels (email)
7. Click "Create Budget"

**Note:** Budget alerts are optional but recommended to avoid surprise charges.

### 11.2 Optimize Resources

- Use appropriate instance sizes
- Set min-instances to 0 for cost savings (with cold start trade-off)
- Use Cloud SQL with appropriate tier

## Step 12: Backup and Disaster Recovery

### 12.1 Enable Automated Backups

Cloud SQL automatically backs up your database. Configure backup retention:

**For Linux/Mac (Bash):**
```bash
gcloud sql instances patch retail-billing-db \
  --backup-start-time=03:00 \
  --backup-retention-count=7
```

**For Windows Command Prompt (CMD):**
```cmd
REM Configure backup retention (single line)
gcloud sql instances patch retail-billing-db --backup-start-time=03:00 --backup-retention-count=7

REM Or multi-line with caret (^)
gcloud sql instances patch retail-billing-db ^
  --backup-start-time=03:00 ^
  --backup-retention-count=7
```

**For Windows PowerShell:**
```powershell
gcloud sql instances patch retail-billing-db `
  --backup-start-time=03:00 `
  --backup-retention-count=7
```

### 12.2 Export Database

**For Linux/Mac (Bash):**
```bash
# Export database for manual backup
gcloud sql export sql retail-billing-db gs://BUCKET_NAME/backup-$(date +%Y%m%d).sql \
  --database=retail_billing
```

**For Windows Command Prompt (CMD):**
```cmd
REM Export database for manual backup (using date format)
REM Note: Replace YYYYMMDD with actual date or use PowerShell for date formatting
gcloud sql export sql retail-billing-db gs://BUCKET_NAME/backup-YYYYMMDD.sql --database=retail_billing

REM Example with specific date:
gcloud sql export sql retail-billing-db gs://BUCKET_NAME/backup-20240115.sql --database=retail_billing
```

**For Windows PowerShell:**
```powershell
# Export database for manual backup (with date formatting)
$date = Get-Date -Format "yyyyMMdd"
gcloud sql export sql retail-billing-db "gs://BUCKET_NAME/backup-$date.sql" --database=retail_billing
```

## Step 13: Testing Production Deployment

### 13.1 Test Endpoints

**For Linux/Mac (Bash):**
```bash
# Test backend health
curl https://YOUR_BACKEND_URL/health

# Test frontend
curl https://YOUR_FRONTEND_URL
```

**For Windows Command Prompt (CMD):**
```cmd
REM Test backend health (using curl if available, or PowerShell)
curl https://YOUR_BACKEND_URL/health

REM Test frontend
curl https://YOUR_FRONTEND_URL

REM Note: If curl is not available, use PowerShell's Invoke-WebRequest
```

**For Windows PowerShell:**
```powershell
# Test backend health
Invoke-WebRequest -Uri https://YOUR_BACKEND_URL/health

# Test frontend
Invoke-WebRequest -Uri https://YOUR_FRONTEND_URL

# Or use curl alias (if available)
curl https://YOUR_BACKEND_URL/health
curl https://YOUR_FRONTEND_URL
```

### 13.2 Verify Database Connection

Check Cloud Run logs to ensure database connection is working.

## Step 14: Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] SSL certificates active
- [ ] Monitoring and logging enabled
- [ ] Backups configured
- [ ] Security settings reviewed
- [ ] Performance tested
- [ ] Error handling verified
- [ ] Documentation updated

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Cloud SQL instance is running
   - Check connection name format
   - Verify service account has Cloud SQL Client role

2. **CORS Errors**
   - Update allowed origins in backend
   - Verify frontend URL is correct

3. **Secret Access Errors**
   - Grant Secret Manager access to service account
   - Verify secret names match

4. **Build Failures**
   - Check Dockerfile syntax
   - Verify all dependencies are in package.json
   - Check build logs in Cloud Build

## Support and Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

## Estimated Costs (Monthly)

- Cloud Run (Backend): ~$10-50 (depending on traffic)
- Cloud Run (Frontend): ~$5-20
- Cloud SQL (db-f1-micro): ~$7-10
- Cloud Storage: ~$1-5
- **Total**: ~$25-85/month (varies with usage)

For production with higher traffic, consider:
- Cloud SQL (db-n1-standard-1): ~$50-100/month
- Higher Cloud Run instances: ~$50-200/month

## Next Steps

1. Set up CI/CD pipeline using Cloud Build
2. Configure custom domain with SSL
3. Set up monitoring alerts
4. Implement automated backups
5. Configure CDN for static assets
6. Set up staging environment

