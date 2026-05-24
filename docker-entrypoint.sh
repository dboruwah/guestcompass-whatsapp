#!/bin/sh
set -e

if [ "$WORKER_MODE" = "1" ]; then
  exec node dist-workers/scripts/startWorkers.js
else
  exec node server.js
fi
