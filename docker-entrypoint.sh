#!/bin/sh
set -e

if [ "$WORKER_MODE" = "1" ]; then
  # Start a minimal HTTP health server on port 3000 for Railway healthcheck
  node -e "const h=require('http');h.createServer((q,r)=>{r.end('ok')}).listen(3000,()=>console.log('Health server on 3000'))" &
  exec node dist-workers/scripts/startWorkers.js
else
  exec node server.js
fi
