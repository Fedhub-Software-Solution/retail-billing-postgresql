# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### GCP Setup
- [ ] Google Cloud account created with billing enabled
- [ ] Google Cloud SDK (gcloud) installed and configured
- [ ] Docker installed and running
- [ ] GCP project created
- [ ] Required APIs enabled (Cloud Run, Cloud SQL, Secret Manager, etc.)

### Database Setup
- [ ] Cloud SQL PostgreSQL instance created
- [ ] Database created (`retail_billing`)
- [ ] Application user created with appropriate permissions
- [ ] Root password securely stored
- [ ] Connection name noted

### Secrets Management
- [ ] JWT secret created in Secret Manager
- [ ] Database password stored in Secret Manager
- [ ] Razorpay credentials stored (if using payment gateway)
- [ ] All secrets have proper IAM permissions

### Code Preparation
- [ ] All environment variables documented
- [ ] CORS origins configured
- [ ] Database connection configured for Cloud SQL
- [ ] Error handling tested
- [ ] Logging configured

## Deployment

### Backend Deployment
- [ ] Docker image built successfully
- [ ] Image pushed to Container Registry
- [ ] Cloud Run service deployed
- [ ] Environment variables set
- [ ] Secrets configured
- [ ] Cloud SQL connection configured
- [ ] Health check endpoint working
- [ ] Service URL obtained

### Frontend Deployment
- [ ] Frontend built with production API URL
- [ ] Docker image built successfully
- [ ] Image pushed to Container Registry
- [ ] Cloud Run service deployed
- [ ] Environment variables set
- [ ] Service URL obtained

### Database Migration
- [ ] Schema migration run successfully
- [ ] Settings migration run successfully
- [ ] Initial data seeded (if needed)
- [ ] Database connection verified

## Post-Deployment

### Configuration
- [ ] CORS settings updated with frontend URL
- [ ] Environment variables verified
- [ ] SSL certificates active (if using custom domain)
- [ ] Custom domain configured (if applicable)

### Testing
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] API endpoints accessible
- [ ] Database operations working
- [ ] Payment gateway working (if configured)

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Secrets not exposed in logs
- [ ] IAM roles properly configured
- [ ] Firewall rules configured

### Monitoring
- [ ] Cloud Logging enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Alerts configured for critical errors
- [ ] Backup schedule configured

### Documentation
- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created
- [ ] Team access configured

## Performance Optimization

- [ ] Appropriate instance sizes selected
- [ ] Auto-scaling configured
- [ ] CDN configured (if needed)
- [ ] Database indexes optimized
- [ ] Query performance tested

## Cost Management

- [ ] Budget alerts configured
- [ ] Resource usage monitored
- [ ] Unnecessary resources removed
- [ ] Cost optimization reviewed

## Backup & Recovery

- [ ] Automated backups enabled
- [ ] Backup retention policy set
- [ ] Recovery procedure documented
- [ ] Backup restoration tested

## Final Verification

- [ ] All features working in production
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Team trained on production system
- [ ] Support procedures in place

## Rollback Plan

- [ ] Previous version tagged
- [ ] Rollback procedure documented
- [ ] Database rollback script ready
- [ ] Team notified of rollback process

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Status**: _______________

