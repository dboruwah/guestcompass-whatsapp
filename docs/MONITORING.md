# Monitoring & Observability Guide

## Overview

The GuestCompass platform provides multiple layers of monitoring:

1. **Metrics** - Prometheus format at `/api/metrics`
2. **Health Checks** - Liveness/readiness at `/health/*`
3. **Queue Dashboard** - Bull Board for visual monitoring
4. **Analytics** - Campaign performance tracking
5. **Logs** - Structured logging and aggregation
6. **Alerts** - Automated alerts for issues

---

## 1. Prometheus Metrics

### Available Metrics

```
# Counter metrics (cumulative)
gc_jobs_processed_total      # Total jobs processed
gc_jobs_failed_total         # Total jobs failed

# Gauge metrics (current value)
gc_queue_length              # Jobs waiting/delayed/active
gc_dlq_length                # Dead-letter queue size

# Histogram metrics (distributions)
process_*                    # Node.js process metrics
nodejs_*                     # Node.js runtime metrics
```

### Scrape Configuration (Prometheus)

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'guestcompass'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

### Query Examples

```promql
# Jobs per second
rate(gc_jobs_processed_total[1m])

# Failure rate
rate(gc_jobs_failed_total[1m]) / rate(gc_jobs_processed_total[1m])

# Current queue size
gc_queue_length

# Alert: high DLQ
gc_dlq_length > 100
```

---

## 2. Health Checks

### Liveness Check

```bash
curl http://localhost:3000/health/liveness
# Returns: 200 OK (always - app is running)
```

### Readiness Check

```bash
curl http://localhost:3000/health/ready
# Returns: 200 OK (Redis + Supabase healthy)
#          500 Error (dependencies unhealthy)
```

### Kubernetes Health Configuration

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 3. Bull Board - Visual Queue Monitoring

### Installation & Setup

```bash
npm install @bull-board/express @bull-board/ui
```

### Integration (Production App)

See `src/pages/api/bull-board/index.ts`

Access at: `http://localhost:3000/bull-board`

### What You'll See

- **Active Jobs** - Currently being processed
- **Waiting Jobs** - Queued, awaiting processing
- **Delayed Jobs** - Scheduled for future execution
- **Completed Jobs** - Successfully finished
- **Failed Jobs** - Errors during processing
- **Dead Letter Queue** - Permanently failed

### Features

- Real-time job updates
- Job replay capability
- Retry configuration
- Job data inspection

---

## 4. Campaign Analytics API

### Endpoint: `/api/campaigns/:id/analytics`

Returns:

```json
{
  "campaign_id": "campaign-123",
  "summary": {
    "total_recipients": 1000,
    "sent": 950,
    "delivered": 920,
    "read": 750,
    "replied": 45,
    "failed": 30,
    "pending": 50
  },
  "rates": {
    "delivery_rate": 96.8,
    "read_rate": 81.5,
    "reply_rate": 4.9,
    "failure_rate": 3.2
  },
  "timeline": [...],
  "top_responses": [...],
  "response_time_stats": {
    "avg_minutes": 12.5,
    "median_minutes": 8,
    "p95_minutes": 45
  }
}
```

---

## 5. Structured Logging

### Log Levels

```typescript
console.log()   // INFO
console.warn()  // WARNING
console.error() // ERROR
```

### Structured Log Format

Add JSON logging for better aggregation:

```typescript
const logEvent = (level: string, message: string, context: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }))
}
```

### Log Aggregation (ELK Stack Example)

```yaml
# Stack: Elasticsearch + Logstash + Kibana

logstash.conf:
  input:
    http {
      port => 5000
      codec => json
    }
  
  output:
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "guestcompass-%{+YYYY.MM.dd}"
    }
```

---

## 6. Alerting

### Recommended Alerts

```yaml
alerts:
  - name: HighQueueLength
    condition: gc_queue_length > 1000
    duration: 5m
    action: Page on-call engineer
  
  - name: HighFailureRate
    condition: rate(gc_jobs_failed_total[5m]) / rate(gc_jobs_processed_total[5m]) > 0.1
    duration: 10m
    action: Send Slack notification
  
  - name: WorkerDown
    condition: up{job="guestcompass-worker"} == 0
    duration: 1m
    action: Auto-restart, then page
  
  - name: DatabaseDown
    condition: pg_up{database="guestcompass"} == 0
    duration: 1m
    action: Critical - page immediately
  
  - name: RedisDown
    condition: redis_up == 0
    duration: 30s
    action: Critical - page immediately
  
  - name: HighErrorRate
    condition: rate(errors_total[5m]) > 100
    duration: 2m
    action: Notify team
```

### Setup with Alertmanager

```yaml
# alertmanager.yml
route:
  receiver: 'pagerduty'
  routes:
    - match:
        severity: critical
      receiver: 'critical'

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: YOUR_SERVICE_KEY
  
  - name: 'critical'
    slack_configs:
      - api_url: YOUR_SLACK_WEBHOOK
        channel: '#critical-alerts'
```

---

## 7. Example: Complete Monitoring Stack

### Docker Compose Setup

```yaml
version: '3.8'
services:
  app:
    image: guestcompass-app:latest
    ports:
      - "3000:3000"
  
  worker:
    image: guestcompass-worker:latest
  
  redis:
    image: redis:7-alpine
  
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
  
  loki:
    image: grafana/loki:latest
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
```

Start:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Loki: http://localhost:3100

---

## 8. Dashboards

### Grafana Dashboard: Queue Health

1. New Dashboard
2. Add Panels:
   - Queue Length (gauge)
   - Jobs/sec (graph)
   - Failure Rate (graph)
   - DLQ Size (gauge)
   - Worker Count (stat)

### Grafana Dashboard: Campaign Performance

1. New Dashboard
2. Add Panels:
   - Delivery Rate by Campaign
   - Response Time Distribution
   - Top Performing Campaigns
   - Geographic Distribution

---

## 9. Debugging

### Common Issues & Solutions

#### High Queue Length
```promql
# Check if workers are processing
rate(gc_jobs_processed_total[1m])

# Check for stuck jobs
gc_queue_length > 100 AND rate(gc_jobs_processed_total[1m]) < 10
```

**Solution:**
- Check worker logs: `docker logs guestcompass-worker`
- Check worker concurrency: increase BULLMQ_CONCURRENCY
- Check job complexity: some jobs taking too long?

#### High Failure Rate
```promql
# Get failure rate
rate(gc_jobs_failed_total[5m]) / rate(gc_jobs_processed_total[5m])
```

**Solution:**
- Check error logs
- Review Bull Board for failed job details
- Check rate limiting settings
- Check database connectivity

#### Worker Not Processing
```bash
# Check if worker process is running
docker ps | grep worker

# Check Redis connectivity
redis-cli ping

# Check worker logs
docker logs guestcompass-worker
```

**Solution:**
- Restart worker
- Verify REDIS_URL
- Check permissions

---

## 10. SLA & Performance Targets

| Metric | Target | Alert If |
|--------|--------|----------|
| Job Processing Latency | < 5s | > 10s |
| Queue Depth | < 100 | > 500 |
| Failure Rate | < 1% | > 5% |
| Delivery Success Rate | > 95% | < 90% |
| Worker Availability | 99.9% | Down |
| API Response Time | < 200ms | > 500ms |

---

## Next Steps

1. ✅ Set up Prometheus scraping
2. ✅ Configure Grafana dashboards
3. ✅ Setup Alertmanager integrations
4. ✅ Configure log aggregation
5. ✅ Define alerting rules
6. ✅ Run load tests
7. ✅ Monitor production 24/7
