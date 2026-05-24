# Deployment Guide

## Table of Contents
1. [Docker Compose (Self-Hosted)](#docker-compose-self-hosted)
2. [Railway](#railway)
3. [Render](#render)
4. [AWS ECS](#aws-ecs)
5. [Kubernetes](#kubernetes)
6. [Pre-Deployment Checklist](#pre-deployment-checklist)

---

## Docker Compose (Self-Hosted)

### Prerequisites
- Docker and Docker Compose installed
- VPS or local server with 2GB+ RAM

### Deployment Steps

1. **Clone/Download Code**
```bash
git clone <repo> guestcompass
cd guestcompass
```

2. **Create .env.production**
```bash
cp .env.example .env.production
# Edit with real credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_APP_URL (your domain)
```

3. **Start Production Stack**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

4. **Verify Deployment**
```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f worker

# Test endpoints
curl http://localhost:3000
curl http://localhost:3000/health/liveness
```

5. **Setup Reverse Proxy (Nginx)**

Create `/etc/nginx/sites-available/guestcompass`:

```nginx
upstream guestcompass {
  server localhost:3000;
}

server {
  listen 80;
  server_name your-domain.com;
  
  location / {
    proxy_pass http://guestcompass;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/guestcompass /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

6. **Setup SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Railway.app

### One-Click Deployment (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize and select this repository
5. Railway will auto-detect `docker-compose.yml`
6. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - etc.
7. Click "Deploy"

Railway will:
- Build Docker images
- Start app + worker + redis services
- Assign public domain
- Setup SSL automatically
- Monitor and auto-restart

Cost: ~$12/month (pay-as-you-go)

---

## Render.com

### Deployment Steps

1. Create account at https://render.com
2. Connect GitHub
3. Create 3 services:

#### Service 1: Web App
- Name: `guestcompass-app`
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Plan: Starter ($7/month)
- Add environment variables (from .env)

#### Service 2: Worker
- Name: `guestcompass-worker`
- Build command: `npm ci && npm run build:workers`
- Start command: `node dist-workers/scripts/startWorkers.js`
- Plan: Starter ($7/month)
- Same environment variables

#### Service 3: Redis
- Use Render's Redis service (add-on)
- Get connection string
- Update REDIS_URL in both services

4. Deploy all three services

---

## AWS ECS

### Prerequisites
- AWS Account
- ECR repositories created

### Build and Push Images

```bash
# Build app image
docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/guestcompass-app:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/guestcompass-app:latest

# Build worker image
docker build -f Dockerfile.worker -t 123456789.dkr.ecr.us-east-1.amazonaws.com/guestcompass-worker:latest .
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/guestcompass-worker:latest
```

### Create ECS Task Definition

See `k8s/ecs-task-definition.json` (to be created)

### Create ECS Service

- Cluster: `guestcompass`
- Service name: `guestcompass-app`
- Task definition: select above
- Replicas: 2
- Load balancer: ALB on port 80/443

---

## Kubernetes

### Prerequisites
- kubectl configured
- Helm installed (optional)

### Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

Monitor:
```bash
kubectl get pods -n guestcompass
kubectl logs -n guestcompass deployment/guestcompass-app
```

See `k8s/` directory for full manifests.

---

## Pre-Deployment Checklist

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_APP_URL (production domain)
- [ ] REDIS_URL (if not using provided Redis)
- [ ] WHATSAPP_WEBHOOK_VERIFY_TOKEN

### Database
- [ ] Supabase project created
- [ ] All migrations applied (00001, 00002, 00003)
- [ ] Service role key with database access

### Security
- [ ] SSL/TLS certificate installed
- [ ] Environment variables NOT in git
- [ ] Service role key never exposed publicly
- [ ] Rate limiting configured
- [ ] CORS rules set correctly

### Testing
- [ ] App loads on production domain
- [ ] Login/Auth works
- [ ] Can create campaigns
- [ ] Queue processes jobs
- [ ] Webhooks configured (if using real WhatsApp)
- [ ] Metrics endpoint accessible

### Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Logs aggregation enabled
- [ ] Alerts configured for:
  - App crashes
  - Worker failures
  - Redis disconnection
  - High error rate
- [ ] Uptime monitoring enabled

### Performance
- [ ] CDN configured for static assets
- [ ] Database connection pooling enabled
- [ ] Redis persistence checked
- [ ] Load testing completed

---

## Scaling Tips

### Horizontal Scaling (Multiple Workers)

If single worker can't keep up:

```bash
# In docker-compose.prod.yml, replicate worker service
worker-1:
  # ... config

worker-2:
  # ... config

worker-3:
  # ... config
```

Or in Kubernetes, increase replicas:
```bash
kubectl scale deployment guestcompass-worker --replicas=5 -n guestcompass
```

### Vertical Scaling (More Powerful VM)

If system has high CPU/memory usage:
- Increase BULLMQ_CONCURRENCY in worker
- Use larger Redis instance
- Add database read replicas

### Database Optimization

```sql
-- Archive old events
DELETE FROM message_events WHERE created_at < NOW() - INTERVAL 90 days;

-- Partition large tables by time
ALTER TABLE delivery_logs PARTITION BY RANGE (EXTRACT(YEAR_MONTH FROM created_at));
```

---

## Troubleshooting Deployment

### "Container exits immediately"
```bash
docker logs <container-id>
# Check for missing env vars or startup errors
```

### "Can't connect to Redis"
- Verify REDIS_URL format
- Check Redis is running: `redis-cli ping`
- Check firewall rules

### "Database connection timeout"
- Verify SUPABASE_SERVICE_ROLE_KEY
- Check Supabase project is running
- Test direct connection

### "High memory usage"
- Reduce BULLMQ_CONCURRENCY
- Implement job timeouts
- Monitor for memory leaks

---

## Next Steps

- [ ] Complete pre-deployment checklist
- [ ] Choose deployment platform
- [ ] Follow platform-specific guide
- [ ] Monitor production logs
- [ ] Setup alerts and monitoring
