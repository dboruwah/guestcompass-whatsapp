#!/usr/bin/env bash
set -euo pipefail

# Build workers and create Docker image
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT_DIR"

node scripts/buildWorkers.js
docker build -f Dockerfile.worker -t ghcr.io/yourorg/guestcompass-worker:latest .
echo "Built image ghcr.io/yourorg/guestcompass-worker:latest"
