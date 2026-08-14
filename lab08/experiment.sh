#!/usr/bin/env bash

set -u -o pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
TOXIPROXY_PROXY=${TOXIPROXY_PROXY:-pricing}

temporary_directory=$(mktemp -d)
cleanup_started=false

inject_latency() {
  # TODO: add the pricing_latency downstream latency toxic here.
  :
}

remove_latency() {
  # TODO: remove the pricing_latency toxic here.
  :
}

cleanup() {
  if [[ "$cleanup_started" == true ]]; then
    return
  fi
  cleanup_started=true
  remove_latency >/dev/null 2>&1 || true
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

body_matches() {
  local body_path=$1
  local expected=$2

  jq --exit-status --compact-output ". == $expected" "$body_path" \
    >/dev/null 2>&1
}

request_checkout() {
  local label=$1
  local body_path="$temporary_directory/${label}.json"
  local result

  if ! result=$(curl \
    --noproxy '*' \
    --silent \
    --show-error \
    --max-time 6 \
    --output "$body_path" \
    --write-out '%{http_code} %{time_total} %{content_type}' \
    "$BASE_URL/checkout"); then
    fail "$label checkout request did not complete"
  fi

  read -r checkout_status checkout_time checkout_content_type <<< "$result"
  printf '%-14s HTTP %s in %ss: %s\n' \
    "$label" "$checkout_status" "$checkout_time" "$(<"$body_path")"
}

request_checkout baseline
[[ "$checkout_status" == "200" ]] || fail "baseline checkout did not return HTTP 200"
[[ "${checkout_content_type%%;*}" == "application/json" ]] || \
  fail "baseline checkout did not return JSON"
body_matches "$temporary_directory/baseline.json" \
  '{"total":25,"status":"ok"}' || fail "baseline checkout body was unexpected"

inject_latency || fail "could not add pricing_latency"

request_checkout delayed
[[ "$checkout_status" == "503" ]] || fail "delayed checkout did not return HTTP 503"
[[ "${checkout_content_type%%;*}" == "application/json" ]] || \
  fail "delayed checkout did not return JSON"
body_matches "$temporary_directory/delayed.json" \
  '{"error":"pricing_unavailable"}' || fail "delayed checkout body was unexpected"
node -e 'process.exit(Number(process.argv[1]) < 1.5 ? 0 : 1)' \
  "$checkout_time" || fail "delayed checkout took 1.5 seconds or longer"

remove_latency || fail "could not remove pricing_latency"

request_checkout recovered
[[ "$checkout_status" == "200" ]] || fail "checkout did not recover after cleanup"
[[ "${checkout_content_type%%;*}" == "application/json" ]] || \
  fail "recovered checkout did not return JSON"
body_matches "$temporary_directory/recovered.json" \
  '{"total":25,"status":"ok"}' || fail "recovered checkout body was unexpected"

printf 'PASS: the bounded dependency experiment completed and cleaned up.\n'
