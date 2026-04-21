#!/usr/bin/env bash
# Generate TypeScript types from FastAPI's OpenAPI schema.
#
# Usage: ./scripts/generate-types.sh
#
# Prerequisites:
#   - uv (Python package manager)
#   - npx (Node.js package runner)
#
# Output: frontend/src/types/api.ts

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
OUTPUT_FILE="$ROOT_DIR/frontend/src/types/api.ts"
TMP_FILE=$(mktemp /tmp/openapi-XXXXXX.json)

echo "Extracting OpenAPI schema from FastAPI..."
cd "$BACKEND_DIR"
uv run python -c "
from app.main import app
import json
print(json.dumps(app.openapi()))
" > "$TMP_FILE"

echo "Generating TypeScript types..."
cd "$ROOT_DIR"
npx openapi-typescript "$TMP_FILE" -o "$OUTPUT_FILE"

rm -f "$TMP_FILE"
echo "Types generated at: $OUTPUT_FILE"
