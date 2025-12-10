#!/bin/sh
set -e

# Use PORT environment variable (Cloud Run sets this, default to 8080)
PORT=${PORT:-8080}

# Replace port 8080 with actual PORT in nginx config
sed -i "s/listen 8080;/listen $PORT;/g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'

