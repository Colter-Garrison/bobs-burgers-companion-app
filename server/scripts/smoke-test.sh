#!/usr/bin/env bash
# End-to-end manual verification of the backend, exercising every
# endpoint in sequence. Run this against a running `npm run dev` server
# (from server/) with: ./scripts/smoke-test.sh
#
# There's no automated test suite yet (that's a separate, later project
# priority), so this script is the closest thing to one for now — a
# readable, re-runnable record of the whole request lifecycle: register
# a user, log in as them, favorite something, list favorites, confirm a
# duplicate favorite is rejected, remove the favorite, delete the
# account, then confirm the old token no longer works.

set -euo pipefail

BASE_URL="http://localhost:3000"
# A fresh email every run (via timestamp) so re-running this script never
# collides with a previous run's leftover user.
EMAIL="smoketest+$(date +%s)@example.com"
PASSWORD="correct-horse-battery-staple"

echo "== Register =="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
	-H "Content-Type: application/json" \
	-d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

echo
echo "== Login =="
curl -s -X POST "$BASE_URL/auth/login" \
	-H "Content-Type: application/json" \
	-d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo

echo
echo "== Add a favorite (burger, itemId 1) =="
curl -s -X POST "$BASE_URL/favorites/burger" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d '{"itemId": 1}'
echo

echo
echo "== Fetch favorites =="
curl -s "$BASE_URL/favorites" -H "Authorization: Bearer $TOKEN"
echo

echo
echo "== Attempt duplicate favorite (expect 409) =="
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE_URL/favorites/burger" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d '{"itemId": 1}'

echo
echo "== Remove the favorite =="
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BASE_URL/favorites/burger/1" \
	-H "Authorization: Bearer $TOKEN"

echo
echo "== Delete profile =="
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BASE_URL/profile" \
	-H "Authorization: Bearer $TOKEN"

echo
echo "== Confirm old token no longer works (expect 401, user deleted) =="
curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/favorites" \
	-H "Authorization: Bearer $TOKEN"

echo
echo "All checks completed."
