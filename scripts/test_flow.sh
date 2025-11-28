#!/usr/bin/env bash
set -euo pipefail

# Script to test user flow, PIX keys and transactions against the local API.
# Requires: curl, jq, python3 (for URL encoding)

BASE_URL=${BASE_URL:-http://localhost:3000}

echo "Using base URL: $BASE_URL"

function ensure_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 not found. Please install it to run this script." >&2
    exit 2
  fi
}

ensure_cmd curl
ensure_cmd jq
ensure_cmd python3

echo "\n1) Create a user (Alice) with two PIX keys..."
create_resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users" \
  -H 'Content-Type: application/json' \
  -d @- <<'JSON'
{
  "name": "Alice Example",
  "email": "alice@example.com",
  "password": "secret123",
  "pixKeys": [
    { "type": "EMAIL", "key": "alice@example.com" },
    { "type": "CPF", "key": "12345678900" }
  ]
}
JSON
)

http_code=$(echo "$create_resp" | tail -n1)
body=$(echo "$create_resp" | sed '$d')
echo "Status: $http_code"
echo "$body" | jq .

user_id=$(echo "$body" | jq -r '.id')
if [[ "$user_id" == "null" || -z "$user_id" ]]; then
  echo "Failed to create user; aborting." >&2
  exit 3
fi
echo "Created user id: $user_id"

echo "\n2) Lookup user by PIX key (alice@example.com)..."
encoded_key=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.stdin.read().strip()))" <<< 'alice@example.com')
curl -s "$BASE_URL/users/pix/$encoded_key" | jq .

echo "\n3) Add another PIX key to user..."
curl -s -X POST "$BASE_URL/users/$user_id/pix" -H 'Content-Type: application/json' -d '{"type":"PHONE","key":"+5511999000111"}' | jq .

echo "\n4) Get user by id to verify PIX keys..."
curl -s "$BASE_URL/users/$user_id" | jq .

echo "\n5) Create a CREDIT transaction for the user..."
tx_payload=$(jq -n --arg type "CREDIT" --arg date "2025-11-27T12:00:00Z" --arg details "Salary" --arg category "OTHER" --arg amount "1500.5" --argjson userId "$user_id" '{type:$type, date:$date, amount:($amount|tonumber), details:$details, userId:$userId, category:$category}')
tx_resp=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/transactions" -H 'Content-Type: application/json' -d "$tx_payload")
tx_code=$(echo "$tx_resp" | tail -n1)
tx_body=$(echo "$tx_resp" | sed '$d')
echo "Status: $tx_code"
echo "$tx_body" | jq .

tx_id=$(echo "$tx_body" | jq -r '.id')
echo "Created transaction id: $tx_id"

echo "\n6) Get transactions for user..."
curl -s "$BASE_URL/transactions/user/$user_id" | jq .

echo "\n7) Update the transaction (change details and amount)..."
update_payload=$(jq -n --arg details "Partial bonus" --arg amount "1750.75" '{details:$details, amount:($amount|tonumber)}')
curl -s -X PUT "$BASE_URL/transactions/$tx_id" -H 'Content-Type: application/json' -d "$update_payload" | jq .

echo "\n8) Delete the transaction..."
curl -s -X DELETE "$BASE_URL/transactions/$tx_id" | jq .

echo "\n9) Remove PIX key from user..."
encoded_remove=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.stdin.read().strip()))" <<< '+5511999000111')
curl -s -X DELETE "$BASE_URL/users/$user_id/pix/$encoded_remove" | jq .

echo "\n10) Cleanup: delete user..."
curl -s -X DELETE "$BASE_URL/users/$user_id" | jq .

echo "\nTest flow finished."
