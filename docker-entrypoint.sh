#!/bin/sh
set -e

echo "ENTRYPOINT: WORKER_MODE=${WORKER_MODE:-unset}"

if [ "$WORKER_MODE" = "1" ]; then
  echo "ENTRYPOINT: Starting in WORKER mode..."
  exec node dist-workers/scripts/startWorkers.js
else
  echo "ENTRYPOINT: Starting in APP mode..."
  exec node server.js
fi
