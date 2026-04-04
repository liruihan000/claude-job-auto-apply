#!/bin/bash
# Test: bootstrap.js outputs valid JSON with expected fields
# Run: bash evals/test-bootstrap.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT=$(node "$SCRIPT_DIR/scripts/bootstrap.js" 2>&1)

echo "=== Bootstrap Output ==="
echo "$OUTPUT"
echo ""

# Validate JSON
echo "$OUTPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Valid JSON')"

# Check required fields
echo "$OUTPUT" | python3 -c "
import json, sys
d = json.load(sys.stdin)
fields = ['ready', 'missing', 'created', 'warnings', 'config', 'playwright', 'templates', 'cron']
missing = [f for f in fields if f not in d]
if missing:
    print(f'❌ Missing fields: {missing}')
    sys.exit(1)
print('✅ All required fields present')

# Check config sub-fields
config = d['config']
for f in ['daily_target', 'job_search', 'automation']:
    if f not in config:
        print(f'⚠️  config.{f} missing (will use defaults)')

# Check playwright
pw = d['playwright']
print(f'   Playwright instances: {pw[\"count\"]}')
for inst in pw.get('instances', []):
    print(f'   - {inst[\"name\"]} → {inst[\"prefix\"]}')

# Check cron
cron = d['cron']
print(f'   Cron configured: {cron[\"configured\"]}')
print(f'   Xvfb available: {cron[\"has_xvfb\"]}')
print(f'   Display: {cron[\"has_display\"]}')

print()
print(f'Ready: {d[\"ready\"]}')
if not d['ready']:
    print(f'Missing: {d[\"missing\"]}')
"
