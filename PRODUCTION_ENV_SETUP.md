# Production Environment Variables Setup

This document lists all environment variables needed for production deployment on Google Cloud Platform.

## Backend Environment Variables

### Required Variables

| Variable | Description | Example | Storage |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode | `production` | Env Var |
| `PORT` | Server port | `8080` | Env Var |
| `DB_NAME` | Database name | `retail_billing` | Env Var |
| `DB_USER` | Database user | `app_user` | Secret Manager |
| `DB_PASSWORD` | Database password | `secure_password` | Secret Manager |
| `CLOUD_SQL_CONNECTION_NAME` | Cloud SQL connection | `project:region:instance` | Env Var |
| `JWT_SECRET` | JWT signing secret | `random_string` | Secret Manager |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `random_string` | Secret Manager |
| `CORS_ORIGIN` | Allowed frontend URLs | `https://app.example.com` | Env Var |

### Optional Variables

| Variable | Description | Example | Storage |
|----------|-------------|---------|---------|
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_live_xxxxx` | Secret Manager |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `secret_xxxxx` | Secret Manager |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | Env Var |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | Env Var |

## Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend-xxx.run.app` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key | `rzp_live_xxxxx` |

## Setting Up Secrets in GCP

### Using gcloud CLI

```bash
# Create secrets
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-
echo -n "your-razorpay-key-id" | gcloud secrets create razorpay-key-id --data-file=-
echo -n "your-razorpay-secret" | gcloud secrets create razorpay-key-secret --data-file=-

# Update existing secret
echo -n "new-value" | gcloud secrets versions add jwt-secret --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Using Cloud Console

1. Go to **Secret Manager** in GCP Console
2. Click **Create Secret**
3. Enter secret name and value
4. Click **Create**
5. Grant access to Cloud Run service account

## Cloud Run Environment Variables

### Backend Service

```bash
gcloud run services update retail-billing-backend \
  --set-env-vars \
    NODE_ENV=production,\
    PORT=8080,\
    DB_NAME=retail_billing,\
    DB_USER=app_user,\
    CLOUD_SQL_CONNECTION_NAME=PROJECT_ID:REGION:INSTANCE_NAME,\
    CORS_ORIGIN=https://YOUR_FRONTEND_URL \
  --set-secrets \
    JWT_SECRET=jwt-secret:latest,\
    DB_PASSWORD=db-password:latest,\
    RAZORPAY_KEY_ID=razorpay-key-id:latest,\
    RAZORPAY_KEY_SECRET=razorpay-key-secret:latest
```

### Frontend Service

```bash
gcloud run services update retail-billing-frontend \
  --set-env-vars \
    VITE_API_URL=https://YOUR_BACKEND_URL,\
    VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Secret Manager** for all sensitive data
3. **Rotate secrets** regularly
4. **Use least privilege** for IAM roles
5. **Enable audit logging** for secret access
6. **Use different secrets** for different environments

## Generating Secure Secrets

```bash
# Generate JWT secret (32 characters)
openssl rand -base64 32

# Generate database password (16 characters)
openssl rand -base64 16

# Generate refresh secret (32 characters)
openssl rand -base64 32
```

## Verification

After setting up environment variables:

1. Check Cloud Run service configuration
2. View service logs for any errors
3. Test API endpoints
4. Verify database connection
5. Test authentication flow

## Troubleshooting

### Secret Access Errors
- Verify service account has `roles/secretmanager.secretAccessor`
- Check secret name matches exactly
- Ensure secret version exists

### Database Connection Errors
- Verify `CLOUD_SQL_CONNECTION_NAME` format: `PROJECT_ID:REGION:INSTANCE_NAME`
- Check Cloud SQL instance is running
- Verify database user has correct permissions

### CORS Errors
- Update `CORS_ORIGIN` with exact frontend URL
- Include protocol (https://)
- No trailing slashes

