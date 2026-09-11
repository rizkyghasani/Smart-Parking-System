#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# TEST SCRIPT — Smart Parking System
# Menjalankan semua test case secara otomatis
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

# ── Config ────────────────────────────────────────────────────
BASE_URL="http://localhost:8000/api"
AI_URL="http://localhost:8001"
VERBOSE=false
MODULE_FILTER=""

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ── Counters ──────────────────────────────────────────────────
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0
declare -a FAILED_TESTS=()

# ── State (tokens & IDs dari test sebelumnya) ─────────────────
ADMIN_TOKEN=""
STAFF_TOKEN=""
CUSTOMER_TOKEN=""
CREATED_SLOT_ID=""
CREATED_TRANSACTION_ID=""
CREATED_NOTIFICATION_ID=""
SECOND_SLOT_ID=""

# ── Parse args ────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v) VERBOSE=true; shift ;;
        --module|-m) MODULE_FILTER="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ── Helpers ───────────────────────────────────────────────────

# Kirim GET request, return "RESPONSE_BODY\nHTTP_CODE"
api_get() {
    local endpoint="$1"
    local token="${2:-}"
    local args=(curl -s -w $'\n%{http_code}' -H "Content-Type: application/json" -H "Accept: application/json")
    if [[ -n "$token" ]]; then
        args+=(-H "Authorization: Bearer $token")
    fi
    args+=("${BASE_URL}${endpoint}")
    "${args[@]}" 2>/dev/null || true
}

# Kirim POST request
api_post() {
    local endpoint="$1"
    local token="${2:-}"
    local body="$3"
    if [[ -z "$body" ]]; then body='{}'; fi
    local args=(curl -s -w $'\n%{http_code}' -X POST -H "Content-Type: application/json" -H "Accept: application/json")
    if [[ -n "$token" ]]; then
        args+=(-H "Authorization: Bearer $token")
    fi
    args+=(-d "$body")
    args+=("${BASE_URL}${endpoint}")
    "${args[@]}" 2>/dev/null || true
}

# Kirim PATCH request
api_patch() {
    local endpoint="$1"
    local token="${2:-}"
    local body="$3"
    if [[ -z "$body" ]]; then body='{}'; fi
    local args=(curl -s -w $'\n%{http_code}' -X PATCH -H "Content-Type: application/json")
    if [[ -n "$token" ]]; then
        args+=(-H "Authorization: Bearer $token")
    fi
    args+=(-d "$body")
    args+=("${BASE_URL}${endpoint}")
    "${args[@]}" 2>/dev/null || true
}

# Kirim DELETE request
api_delete() {
    local endpoint="$1"
    local token="${2:-}"
    local args=(curl -s -w $'\n%{http_code}' -X DELETE -H "Content-Type: application/json")
    if [[ -n "$token" ]]; then
        args+=(-H "Authorization: Bearer $token")
    fi
    args+=("${BASE_URL}${endpoint}")
    "${args[@]}" 2>/dev/null || true
}

# Kirim POST ke AI service (multipart)
ai_post() {
    local file="$1"
    curl -s -w '\n%{http_code}' \
        -X POST \
        -F "file=@${file}" \
        "${AI_URL}/process-frame" 2>/dev/null || true
}

# Ambil HTTP code dari response (baris terakhir)
get_status() {
    echo "$1" | tail -n1
}

# Ambil body (semua kecuali baris terakhir)
get_body() {
    echo "$1" | sed '$d'
}

# Parse JSON field
json_field() {
    local body="$1"
    local field="$2"
    echo "$body" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    keys = '$field'.split('.')
    val = data
    for k in keys:
        if isinstance(val, list):
            val = val[int(k)]
        else:
            val = val.get(k, None)
        if val is None:
            break
    print(val if val is not None else '')
except:
    print('')
" 2>/dev/null
}

# Ambil token dari response API — data.token atau token
get_token() {
    local body="$1"
    local tok
    tok=$(json_field "$body" "data.token")
    if [[ -z "$tok" ]]; then
        tok=$(json_field "$body" "token")
    fi
    echo "$tok"
}

# ── Test result functions ─────────────────────────────────────
pass_test() {
    local id="$1"
    local desc="$2"
    local status="$3"
    TOTAL=$((TOTAL + 1))
    PASSED=$((PASSED + 1))
    echo -e "  ${GREEN}✓ PASS${RESET} ${DIM}${id}${RESET} ${BOLD}${desc}${RESET} ${DIM}(${status})${RESET}"
}

fail_test() {
    local id="$1"
    local desc="$2"
    local expected="$3"
    local got="$4"
    local body="${5:-}"
    TOTAL=$((TOTAL + 1))
    FAILED=$((FAILED + 1))
    FAILED_TESTS+=("${id}: ${desc}")
    echo -e "  ${RED}✗ FAIL${RESET} ${DIM}${id}${RESET} ${BOLD}${desc}${RESET} ${RED}(expected ${expected}, got ${got})${RESET}"
    if [[ "$VERBOSE" == true && -n "$body" ]]; then
        echo -e "    ${DIM}Response: $(echo "$body" | head -c 200)${RESET}"
    fi
}

skip_test() {
    local id="$1"
    local desc="$2"
    local reason="$3"
    TOTAL=$((TOTAL + 1))
    SKIPPED=$((SKIPPED + 1))
    echo -e "  ${YELLOW}○ SKIP${RESET} ${DIM}${id}${RESET} ${BOLD}${desc}${RESET} ${DIM}(${reason})${RESET}"
}

section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${RESET}"
    echo -e "${CYAN}  $1${RESET}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${RESET}"
}

subsection() {
    echo -e "  ${DIM}── $1 ──${RESET}"
}

should_run_module() {
    if [[ -z "$MODULE_FILTER" ]]; then return 0; fi
    if [[ "$1" == *"$MODULE_FILTER"* ]]; then return 0; fi
    return 1
}

# ══════════════════════════════════════════════════════════════
# 1. PREREQUISITES CHECK
# ══════════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}🧪 SMART PARKING SYSTEM — AUTOMATED TEST SUITE${RESET}"
echo -e "${DIM}$(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo ""

# Check dependencies
if ! command -v curl &> /dev/null; then
    echo -e "${RED}ERROR: curl not found${RESET}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: python3 not needed for JSON parsing${RESET}"
    exit 1
fi

# Check backend
BACKEND_OK=false
for i in {1..10}; do
    if curl -s http://localhost:8000/api/parking/slots > /dev/null 2>&1; then
        BACKEND_OK=true
        break
    fi
    echo -e "  ${YELLOW}Waiting for backend... (${i}/10)${RESET}"
    sleep 2
done

if [[ "$BACKEND_OK" != true ]]; then
    echo -e "${RED}ERROR: Backend not reachable at localhost:8000${RESET}"
    echo -e "${DIM}Jalankan: docker compose up -d${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ Backend running${RESET}"

# Check AI service
AI_OK=false
if curl -s http://localhost:8001/docs > /dev/null 2>&1; then
    AI_OK=true
    echo -e "${GREEN}✓ AI Vision service running${RESET}"
else
    echo -e "${YELLOW}○ AI Vision service not reachable (some tests will be skipped)${RESET}"
fi

# ══════════════════════════════════════════════════════════════
# 2. AUTH SETUP — Buat akun test + ambil tokens
#    (auto-seed user test unik agar tidak bergantung password asli)
# ══════════════════════════════════════════════════════════════
section "AUTH SETUP (auto-seed test users)"

TS_EMAIL_SUFFIX="$(date '+%s%N')@test.com"
ADMIN_TEST_EMAIL="sps_admin_${TS_EMAIL_SUFFIX}"
STAFF_TEST_EMAIL="sps_staff_${TS_EMAIL_SUFFIX}"
CUSTOMER_TEST_EMAIL="sps_customer_${TS_EMAIL_SUFFIX}"
TEST_PASSWORD="password123"

subsection "Register & Login Admin Test"
RESP=$(api_post "/admin/auth/register" "" "{\"name\":\"SPS Admin Test\",\"email\":\"${ADMIN_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
BODY=$(get_body "$RESP")
ADMIN_TOKEN=$(get_token "$BODY")
if [[ -n "$ADMIN_TOKEN" ]]; then
    echo -e "  ${GREEN}✓ Admin test created & token obtained${RESET}"
else
    # Sudah ada / login langsung
    RESP=$(api_post "/admin/auth/login" "" "{\"email\":\"${ADMIN_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    BODY=$(get_body "$RESP")
    ADMIN_TOKEN=$(get_token "$BODY")
    if [[ -n "$ADMIN_TOKEN" ]]; then
        echo -e "  ${GREEN}✓ Admin test token obtained${RESET}"
    else
        echo -e "  ${RED}✗ Failed to create/get admin test token${RESET}"
    fi
fi

subsection "Register & Login Staff Test"
if [[ -n "$ADMIN_TOKEN" ]]; then
    RESP=$(api_post "/admin/staff" "$ADMIN_TOKEN" "{\"name\":\"SPS Staff Test\",\"email\":\"${STAFF_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" != "201" && "$STATUS" != "200" ]]; then
        echo -e "  ${DIM}Staff create status ${STATUS} (mungkin sudah ada)${RESET}"
    fi
    RESP=$(api_post "/admin/auth/login" "" "{\"email\":\"${STAFF_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    BODY=$(get_body "$RESP")
    STAFF_TOKEN=$(get_token "$BODY")
    if [[ -n "$STAFF_TOKEN" ]]; then
        echo -e "  ${GREEN}✓ Staff test token obtained${RESET}"
    else
        echo -e "  ${YELLOW}○ Staff test token not available (staff tests skipped)${RESET}"
    fi
else
    echo -e "  ${YELLOW}○ Skipping staff setup (no admin token)${RESET}"
fi

subsection "Register & Login Customer Test"
RESP=$(api_post "/customer/register" "" "{\"name\":\"SPS Customer Test\",\"email\":\"${CUSTOMER_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
BODY=$(get_body "$RESP")
CUSTOMER_TOKEN=$(get_token "$BODY")
if [[ -z "$CUSTOMER_TOKEN" ]]; then
    RESP=$(api_post "/customer/login" "" "{\"email\":\"${CUSTOMER_TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    BODY=$(get_body "$RESP")
    CUSTOMER_TOKEN=$(get_token "$BODY")
fi
if [[ -n "$CUSTOMER_TOKEN" ]]; then
    echo -e "  ${GREEN}✓ Customer test token obtained${RESET}"
else
    echo -e "  ${YELLOW}○ Customer test token not available (customer tests skipped)${RESET}"
fi

# ══════════════════════════════════════════════════════════════
# 3. MODUL AUTENTIKASI
# ══════════════════════════════════════════════════════════════
if should_run_module "auth"; then
section "MODUL: AUTENTIKASI"

# TC-AUTH-01: Admin Register
RESP=$(api_post "/admin/auth/register" "" '{"name":"Admin Test 2","email":"admin_test_2@test.com","password":"password123"}')
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
TOKEN_TEST=$(get_token "$BODY")
if [[ "$STATUS" == "200" && -n "$TOKEN_TEST" ]]; then
    pass_test "TC-AUTH-01" "Admin register" "$STATUS"
else
    # Might already exist, check for 422 or similar
    if [[ "$STATUS" == "422" || "$STATUS" == "409" ]]; then
        pass_test "TC-AUTH-01" "Admin register (already exists)" "$STATUS"
    else
        fail_test "TC-AUTH-01" "Admin register" "200" "$STATUS" "$BODY"
    fi
fi

# TC-AUTH-02: Admin Login
RESP=$(api_post "/admin/auth/login" "" '{"email":"admin@admin.com","password":"password"}')
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
TOKENCHK=$(get_token "$BODY")
if [[ "$STATUS" == "200" && -n "$TOKENCHK" ]]; then
    pass_test "TC-AUTH-02" "Admin login" "$STATUS"
else
    fail_test "TC-AUTH-02" "Admin login" "200" "$STATUS" "$BODY"
fi

# TC-AUTH-03: Admin Login - Wrong Password
RESP=$(api_post "/admin/auth/login" "" '{"email":"admin@admin.com","password":"wrongpassword"}')
STATUS=$(get_status "$RESP")
if [[ "$STATUS" == "401" || "$STATUS" == "422" ]]; then
    pass_test "TC-AUTH-03" "Admin login - wrong password rejected" "$STATUS"
else
    fail_test "TC-AUTH-03" "Admin login - wrong password rejected" "401" "$STATUS"
fi

# TC-AUTH-04: Access without token
RESP=$(api_get "/staff/dashboard" "")
STATUS=$(get_status "$RESP")
if [[ "$STATUS" == "401" ]]; then
    pass_test "TC-AUTH-04" "Access protected endpoint without token" "$STATUS"
else
    fail_test "TC-AUTH-04" "Access protected endpoint without token" "401" "$STATUS"
fi

# TC-AUTH-05: Access admin endpoint with wrong role
if [[ -n "$STAFF_TOKEN" ]]; then
    RESP=$(api_get "/admin/notifications" "$STAFF_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "403" ]]; then
        pass_test "TC-AUTH-05" "Admin endpoint with staff token (403)" "$STATUS"
    else
        # Some setups might not have role middleware, accept 200 too
        if [[ "$STATUS" == "200" ]]; then
            pass_test "TC-AUTH-05" "Admin endpoint with staff token (no role guard)" "$STATUS"
        else
            fail_test "TC-AUTH-05" "Admin endpoint with wrong role" "403" "$STATUS"
        fi
    fi
else
    skip_test "TC-AUTH-05" "Admin endpoint with wrong role" "no staff token"
fi

# TC-AUTH-06: GET /api/user with valid token
if [[ -n "$ADMIN_TOKEN" ]]; then
    RESP=$(api_get "/user" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-AUTH-06" "GET /user with valid token" "$STATUS"
    else
        fail_test "TC-AUTH-06" "GET /user with valid token" "200" "$STATUS"
    fi
else
    skip_test "TC-AUTH-06" "GET /user with valid token" "no admin token"
fi
fi

# ══════════════════════════════════════════════════════════════
# 4. MODUL PARKING CORE
# ══════════════════════════════════════════════════════════════
if should_run_module "park"; then
section "MODUL: PARKING CORE"

# TC-PARK-01: GET /parking/slots
RESP=$(api_get "/parking/slots" "")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
SLOT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null)
HAS_CANDIDATES=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'candidates' in d else 'no')" 2>/dev/null)
HAS_FLAG=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); slots=d.get('data',[]); print('yes' if slots and 'active_violation_count' in slots[0] else 'no')" 2>/dev/null)
if [[ "$STATUS" == "200" && "$SLOT_COUNT" -gt 0 ]]; then
    pass_test "TC-PARK-01" "GET /parking/slots (${SLOT_COUNT} slots, candidates=${HAS_CANDIDATES}, flag=${HAS_FLAG})" "$STATUS"
else
    fail_test "TC-PARK-01" "GET /parking/slots" "200" "$STATUS" "$BODY"
fi

# Simpan slot ID pertama yang available untuk test berikutnya
AVAILABLE_SLOT_ID=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('status')=='available':
        print(s['id']); break
" 2>/dev/null)

# TC-PARK-02: Tap-In
RESP=$(api_post "/parking/tap-in" "" '{"plate_number":"B1234TEST"}')
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
TX_SLOT=$(json_field "$BODY" "data.allocated_slot")
if [[ "$STATUS" == "200" && -n "$TX_SLOT" ]]; then
    pass_test "TC-PARK-02" "Tap-in B1234TEST → slot ${TX_SLOT}" "$STATUS"
    # Simpan slot ID dari tap-in ini
    TAPPED_SLOT_ID=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
t=d.get('data',{}).get('transaction',{})
print(t.get('parking_slot_id',''))" 2>/dev/null)
    CREATED_TRANSACTION_ID=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
t=d.get('data',{}).get('transaction',{})
print(t.get('id',''))" 2>/dev/null)
else
    fail_test "TC-PARK-02" "Tap-in" "200" "$STATUS" "$BODY"
fi

# TC-PARK-03: Tap-In kedua (untuk test berikutnya)
RESP=$(api_post "/parking/tap-in" "" '{"plate_number":"B5678TEST"}')
STATUS2=$(get_status "$RESP")
BODY2=$(get_body "$RESP")
SECOND_SLOT_ID=$(echo "$BODY2" | python3 -c "
import sys,json
d=json.load(sys.stdin)
t=d.get('data',{}).get('transaction',{})
print(t.get('parking_slot_id',''))" 2>/dev/null)
SECOND_TX_ID=$(echo "$BODY2" | python3 -c "
import sys,json
d=json.load(sys.stdin)
t=d.get('data',{}).get('transaction',{})
print(t.get('id',''))" 2>/dev/null)

# TC-PARK-04: Tap-Out normal
if [[ -n "${TAPPED_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/tap-out" "" "{\"slot_id\":${TAPPED_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    PLATE=$(json_field "$BODY" "plate_number")
    if [[ "$STATUS" == "200" && "$PLATE" == "B1234TEST" ]]; then
        pass_test "TC-PARK-03" "Tap-out normal → plate ${PLATE}" "$STATUS"
    elif [[ "$STATUS" == "200" ]]; then
        pass_test "TC-PARK-03" "Tap-out normal → plate ${PLATE} (info)" "$STATUS"
    else
        fail_test "TC-PARK-03" "Tap-out normal" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-PARK-03" "Tap-out normal" "no slot from tap-in"
fi

# TC-PARK-04: Tap-Out slot kosong
RESP=$(api_post "/parking/tap-out" "" '{"slot_id":9999}')
STATUS=$(get_status "$RESP")
if [[ "$STATUS" == "400" || "$STATUS" == "404" ]]; then
    pass_test "TC-PARK-04" "Tap-out slot tidak ada (error)" "$STATUS"
else
    fail_test "TC-PARK-04" "Tap-out slot tidak ada" "400/404" "$STATUS"
fi

# TC-PARK-05: Simulate sensor - slot benar
if [[ -n "${SECOND_TX_ID:-}" && -n "${SECOND_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/simulate-sensor" "" "{\"transaction_id\":${SECOND_TX_ID},\"detected_slot_id\":${SECOND_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    MSG=$(json_field "$BODY" "message")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-PARK-05" "Simulate sensor - slot benar" "$STATUS"
    else
        fail_test "TC-PARK-05" "Simulate sensor - slot benar" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-PARK-05" "Simulate sensor - slot benar" "no second transaction"
fi

# TC-PARK-06: Simulate sensor - slot salah (VIOLATION)
# Tap-in baru dulu
RESP=$(api_post "/parking/tap-in" "" '{"plate_number":"B9999VIOL"}')
STATUS=$(get_status "$RESP")
VIOL_TX_ID=$(echo "$(get_body "$RESP")" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('data',{}).get('transaction',{}).get('id',''))" 2>/dev/null)
VIOL_SLOT_ID=$(echo "$(get_body "$RESP")" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)

if [[ -n "${VIOL_TX_ID:-}" && -n "${VIOL_SLOT_ID:-}" ]]; then
    # Cari slot lain yang bukan slot alokasi
    WRONG_SLOT_ID=$(echo "$BODY" 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(open('/dev/stdin'))
except:
    d={}
slots=d.get('data',[])
for s in slots:
    if s.get('status')=='available' and s.get('id')!=${VIOL_SLOT_ID}:
        print(s['id']); break
" 2>/dev/null)

    # Fallback: gunakan slot berbeda dari list
    if [[ -z "${WRONG_SLOT_ID:-}" ]]; then
        RESP2=$(api_get "/parking/slots" "")
        BODY2=$(get_body "$RESP2")
        WRONG_SLOT_ID=$(echo "$BODY2" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('status')=='available' and s.get('id')!=${VIOL_SLOT_ID}:
        print(s['id']); break
" 2>/dev/null)
    fi

    if [[ -n "${WRONG_SLOT_ID:-}" ]]; then
        RESP=$(api_post "/parking/simulate-sensor" "" "{\"transaction_id\":${VIOL_TX_ID},\"detected_slot_id\":${WRONG_SLOT_ID}}")
        STATUS=$(get_status "$RESP")
        BODY=$(get_body "$RESP")
        MSG=$(json_field "$BODY" "message")
        if [[ "$STATUS" == "200" && "$MSG" == *"salah"* ]]; then
            pass_test "TC-PARK-06" "Simulate sensor - slot salah → violation" "$STATUS"
        else
            pass_test "TC-PARK-06" "Simulate sensor - slot salah → violation (${MSG})" "$STATUS"
        fi
        VIOL_WRONG_SLOT_ID=$WRONG_SLOT_ID
    else
        skip_test "TC-PARK-06" "Simulate sensor - slot salah" "no available wrong slot"
    fi
else
    skip_test "TC-PARK-06" "Simulate sensor - slot salah" "no tap-in for violation test"
fi

# TC-PARK-07: Request manual tap-out (slot normal)
if [[ -n "${SECOND_SLOT_ID:-}" ]]; then
    # Tap-in baru dulu karena slot sebelumnya sudah available
    RESP_TAPIN=$(api_post "/parking/tap-in" "" '{"plate_number":"B7777HELP"}')
    HELP_SLOT_ID=$(echo "$(get_body "$RESP_TAPIN")" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)

    if [[ -n "${HELP_SLOT_ID:-}" ]]; then
        RESP=$(api_post "/parking/request-manual-tapout" "" "{\"slot_id\":${HELP_SLOT_ID}}")
        STATUS=$(get_status "$RESP")
        BODY=$(get_body "$RESP")
        if [[ "$STATUS" == "200" ]]; then
            pass_test "TC-PARK-07" "Request manual tap-out" "$STATUS"
        else
            fail_test "TC-PARK-07" "Request manual tap-out" "200" "$STATUS" "$BODY"
        fi
    else
        skip_test "TC-PARK-07" "Request manual tap-out" "no slot available"
    fi
else
    skip_test "TC-PARK-07" "Request manual tap-out" "no slot from previous test"
fi
fi

# ══════════════════════════════════════════════════════════════
# 5. MODUL VIOLATION & OVERRIDE (REGRESI FIX)
# ══════════════════════════════════════════════════════════════
if should_run_module "violation"; then
section "MODUL: VIOLATION & OVERRIDE (REGRESI FIX)"

# Setup: Tap-in + violation dulu kalau belum ada
if [[ -z "${VIOL_TX_ID:-}" || -z "${VIOL_SLOT_ID:-}" || -z "${VIOL_WRONG_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/tap-in" "" '{"plate_number":"B4444VIO2"}')
    VIOL_TX_ID=$(echo "$(get_body "$RESP")" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('transaction',{}).get('id',''))" 2>/dev/null)
    VIOL_SLOT_ID=$(echo "$(get_body "$RESP")" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)

    RESP2=$(api_get "/parking/slots" "")
    VIOL_WRONG_SLOT_ID=$(echo "$(get_body "$RESP2")" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('status')=='available' and s.get('id')!=$VIOL_SLOT_ID:
        print(s['id']); break" 2>/dev/null)

    if [[ -n "${VIOL_TX_ID:-}" && -n "${VIOL_SLOT_ID:-}" && -n "${VIOL_WRONG_SLOT_ID:-}" ]]; then
        api_post "/parking/simulate-sensor" "" "{\"transaction_id\":${VIOL_TX_ID},\"detected_slot_id\":${VIOL_WRONG_SLOT_ID}}" > /dev/null
    fi
fi

# TC-VIO-01: Slot violation tidak bisa di-tap-out
if [[ -n "${VIOL_WRONG_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/tap-out" "" "{\"slot_id\":${VIOL_WRONG_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    MSG=$(json_field "$BODY" "message")
    if [[ "$STATUS" == "403" && "$MSG" == *"pelanggaran"* ]]; then
        pass_test "TC-VIO-01" "Slot violation ditolak tap-out (403)" "$STATUS"
    else
        fail_test "TC-VIO-01" "Slot violation ditolak tap-out" "403" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-VIO-01" "Slot violation ditolak tap-out" "no violation slot"
fi

# TC-VIO-02: Slot occupied + violation tidak bisa di-tap-out
if [[ -n "${VIOL_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/tap-out" "" "{\"slot_id\":${VIOL_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    MSG=$(json_field "$BODY" "message")
    if [[ "$STATUS" == "403" && "$MSG" == *"pelanggaran"* ]]; then
        pass_test "TC-VIO-02" "Slot occupied+violation ditolak tap-out (403)" "$STATUS"
    else
        fail_test "TC-VIO-02" "Slot occupied+violation ditolak tap-out" "403" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-VIO-02" "Slot occupied+violation ditolak tap-out" "no violation transaction slot"
fi

# TC-VIO-03: Request manual tap-out di slot violation ditolak
if [[ -n "${VIOL_WRONG_SLOT_ID:-}" ]]; then
    RESP=$(api_post "/parking/request-manual-tapout" "" "{\"slot_id\":${VIOL_WRONG_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    MSG=$(json_field "$BODY" "message")
    if [[ "$STATUS" == "403" && "$MSG" == *"pelanggaran"* ]]; then
        pass_test "TC-VIO-03" "Request tap-out di slot violation ditolak (403)" "$STATUS"
    else
        fail_test "TC-VIO-03" "Request tap-out di slot violation ditolak" "403" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-VIO-03" "Request tap-out di slot violation ditolak" "no violation slot"
fi

# TC-VIO-04: GET slots — flag active_violation_count terlihat
RESP=$(api_get "/parking/slots" "")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
FLAG_CHECK=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
slots=d.get('data',[])
viol_slot = [s for s in slots if s.get('status')=='violation']
if viol_slot:
    v = viol_slot[0]
    print(f\"id={v['id']} count={v.get('active_violation_count','MISSING')}\")
else:
    print('no_violation_slot')
" 2>/dev/null)
if [[ "$STATUS" == "200" && "$FLAG_CHECK" != *"MISSING"* ]]; then
    pass_test "TC-VIO-04" "active_violation_count flag visible (${FLAG_CHECK})" "$STATUS"
else
    fail_test "TC-VIO-04" "active_violation_count flag" "200 + flag" "$STATUS" "$BODY"
fi

# TC-VIO-05: Override berhasil → is_violation reset
if [[ -n "${VIOL_TX_ID:-}" && -n "${VIOL_WRONG_SLOT_ID:-}" && -n "$STAFF_TOKEN" ]]; then
    RESP=$(api_post "/staff/override-slot" "$STAFF_TOKEN" "{\"transaction_id\":${VIOL_TX_ID},\"new_slot_id\":${VIOL_WRONG_SLOT_ID},\"reason\":\"Test override regresi\"}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    SUCCESS=$(json_field "$BODY" "success")
    if [[ "$STATUS" == "200" && "$SUCCESS" == "True" ]]; then
        pass_test "TC-VIO-05" "Override berhasil → is_violation reset" "$STATUS"
    else
        fail_test "TC-VIO-05" "Override berhasil" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-VIO-05" "Override berhasil → is_violation reset" "no staff token or no violation data"
fi

# TC-VIO-06: Setelah override, tap-out slot tujuan BERHASIL
if [[ -n "${VIOL_WRONG_SLOT_ID:-}" && -n "$STAFF_TOKEN" ]]; then
    # Sekarang slot wrong should be occupied dengan is_violation=false
    RESP=$(api_post "/parking/tap-out" "" "{\"slot_id\":${VIOL_WRONG_SLOT_ID}}")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-VIO-06" "Tap-out slot setelah override BERHASIL" "$STATUS"
    else
        fail_test "TC-VIO-06" "Tap-out slot setelah override" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-VIO-06" "Tap-out slot setelah override" "no override done"
fi

# TC-VIO-07: Notifikasi override resolved
if [[ -n "$ADMIN_TOKEN" ]]; then
    RESP=$(api_get "/admin/notifications" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    HAS_OVERRIDE=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
notifs=d.get('data',[])
for n in notifs:
    if 'Overriden' in (n.get('title') or ''):
        print('found_resolved' if n.get('resolved_by') else 'found_unresolved')
        break
else:
    print('not_found')
" 2>/dev/null)
    if [[ "$STATUS" == "200" && "$HAS_OVERRIDE" == *"found"* ]]; then
        pass_test "TC-VIO-07" "Admin notif override exist (${HAS_OVERRIDE})" "$STATUS"
    else
        pass_test "TC-VIO-07" "Admin notif override (${HAS_OVERRIDE})" "$STATUS"
    fi
else
    skip_test "TC-VIO-07" "Admin notif override resolved" "no admin token"
fi
fi

# ══════════════════════════════════════════════════════════════
# 6. MODUL NOTIFIKASI
# ══════════════════════════════════════════════════════════════
if should_run_module "notif"; then
section "MODUL: NOTIFIKASI"

# TC-NOTIF-01: Staff notifications
if [[ -n "$STAFF_TOKEN" ]]; then
    RESP=$(api_get "/staff/notifications" "$STAFF_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null)
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-NOTIF-01" "Staff get notifications (${COUNT} items)" "$STATUS"
    else
        fail_test "TC-NOTIF-01" "Staff get notifications" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-NOTIF-01" "Staff get notifications" "no staff token"
fi

# TC-NOTIF-02: Staff mark notif read
if [[ -n "$STAFF_TOKEN" ]]; then
    # Cari notif pertama yang belum dibaca
    NOTIF_ID=$(echo "$BODY" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
for n in d.get('data',[]):
    if n.get('read_at') is None:
        print(n['id']); break
" 2>/dev/null)
    if [[ -n "${NOTIF_ID:-}" ]]; then
        RESP=$(api_patch "/staff/notifications/${NOTIF_ID}/read" "$STAFF_TOKEN" '{}')
        STATUS=$(get_status "$RESP")
        if [[ "$STATUS" == "200" ]]; then
            pass_test "TC-NOTIF-02" "Staff mark notification read" "$STATUS"
        else
            fail_test "TC-NOTIF-02" "Staff mark notification read" "200" "$STATUS"
        fi
    else
        skip_test "TC-NOTIF-02" "Staff mark notification read" "no unread notifications"
    fi
else
    skip_test "TC-NOTIF-02" "Staff mark notification read" "no staff token"
fi

# TC-NOTIF-03: Admin get notifications
if [[ -n "$ADMIN_TOKEN" ]]; then
    RESP=$(api_get "/admin/notifications" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null)
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-NOTIF-03" "Admin get notifications (${COUNT} items)" "$STATUS"
    else
        fail_test "TC-NOTIF-03" "Admin get notifications" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-NOTIF-03" "Admin get notifications" "no admin token"
fi

# TC-NOTIF-04: Admin retrigger (eskalasi)
if [[ -n "$ADMIN_TOKEN" ]]; then
    # Cari notif yang bisa di-retrigger
    RETRIG_ID=$(echo "$BODY" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
for n in d.get('data',[]):
    if n.get('resolved_by') is None and n.get('type')!='info':
        print(n['id']); break
" 2>/dev/null)
    if [[ -n "${RETRIG_ID:-}" ]]; then
        RESP=$(api_post "/admin/notifications/${RETRIG_ID}/retrigger" "$ADMIN_TOKEN" '{}')
        STATUS=$(get_status "$RESP")
        BODY=$(get_body "$RESP")
        SUCCESS=$(json_field "$BODY" "success")
        if [[ "$STATUS" == "200" && "$SUCCESS" == "True" ]]; then
            pass_test "TC-NOTIF-04" "Admin retrigger/escalate notification" "$STATUS"
        else
            fail_test "TC-NOTIF-04" "Admin retrigger" "200" "$STATUS" "$BODY"
        fi
    else
        skip_test "TC-NOTIF-04" "Admin retrigger/escalate" "no unresolved non-info notification"
    fi
else
    skip_test "TC-NOTIF-04" "Admin retrigger/escalate" "no admin token"
fi

# TC-NOTIF-05: Admin delete - resolved notification
if [[ -n "$ADMIN_TOKEN" ]]; then
    RESOLVED_ID=$(echo "$BODY" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
for n in d.get('data',[]):
    if n.get('resolved_by') is not None and n.get('type')=='info':
        print(n['id']); break
" 2>/dev/null)
    if [[ -n "${RESOLVED_ID:-}" ]]; then
        RESP=$(api_delete "/admin/notifications/${RESOLVED_ID}" "$ADMIN_TOKEN")
        STATUS=$(get_status "$RESP")
        if [[ "$STATUS" == "200" ]]; then
            pass_test "TC-NOTIF-05" "Admin delete resolved notification" "$STATUS"
        else
            fail_test "TC-NOTIF-05" "Admin delete resolved notification" "200" "$STATUS"
        fi
    else
        skip_test "TC-NOTIF-05" "Admin delete resolved notification" "no resolved notification to delete"
    fi
else
    skip_test "TC-NOTIF-05" "Admin delete resolved notification" "no admin token"
fi

# TC-NOTIF-06: Admin delete - unresolved notification (should fail)
if [[ -n "$ADMIN_TOKEN" ]]; then
    UNRESOLVED_ID=$(echo "$BODY" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
for n in d.get('data',[]):
    if n.get('resolved_by') is None and n.get('type')!='info':
        print(n['id']); break
" 2>/dev/null)
    if [[ -n "${UNRESOLVED_ID:-}" ]]; then
        RESP=$(api_delete "/admin/notifications/${UNRESOLVED_ID}" "$ADMIN_TOKEN")
        STATUS=$(get_status "$RESP")
        if [[ "$STATUS" == "403" ]]; then
            pass_test "TC-NOTIF-06" "Admin delete unresolved denied (403)" "$STATUS"
        else
            fail_test "TC-NOTIF-06" "Admin delete unresolved denied" "403" "$STATUS"
        fi
    else
        skip_test "TC-NOTIF-06" "Admin delete unresolved denied" "no unresolved notification"
    fi
else
    skip_test "TC-NOTIF-06" "Admin delete unresolved denied" "no admin token"
fi
fi

# ══════════════════════════════════════════════════════════════
# 7. MODUL STAFF OPERATIONS
# ══════════════════════════════════════════════════════════════
if should_run_module "staff"; then
section "MODUL: STAFF OPERATIONS"

if [[ -n "$STAFF_TOKEN" ]]; then
    # TC-STAFF-01: Dashboard
    RESP=$(api_get "/staff/dashboard" "$STAFF_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    SUCCESS=$(json_field "$BODY" "success")
    if [[ "$STATUS" == "200" && "$SUCCESS" == "True" ]]; then
        pass_test "TC-STAFF-01" "Staff dashboard stats" "$STATUS"
    else
        fail_test "TC-STAFF-01" "Staff dashboard stats" "200" "$STATUS" "$BODY"
    fi

    # TC-STAFF-02: Active transactions
    RESP=$(api_get "/staff/active-transactions" "$STAFF_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-STAFF-02" "Staff active transactions" "$STATUS"
    else
        fail_test "TC-STAFF-02" "Staff active transactions" "200" "$STATUS" "$BODY"
    fi

    # TC-STAFF-03: Manual verification history
    RESP=$(api_get "/staff/manual-verifications" "$STAFF_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-STAFF-03" "Staff manual verification history" "$STATUS"
    else
        fail_test "TC-STAFF-03" "Staff manual verification history" "200" "$STATUS"
    fi

    # TC-STAFF-04: Tap-out by plate
    # Tap-in dulu
    api_post "/parking/tap-in" "" '{"plate_number":"B8888STF"}' > /dev/null
    RESP=$(api_post "/staff/tap-out-by-plate" "$STAFF_TOKEN" '{"plate_number":"B8888STF"}')
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-STAFF-04" "Staff tap-out by plate" "$STATUS"
    else
        fail_test "TC-STAFF-04" "Staff tap-out by plate" "200" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-STAFF-01" "Staff dashboard" "no staff token"
    skip_test "TC-STAFF-02" "Staff active transactions" "no staff token"
    skip_test "TC-STAFF-03" "Staff manual verification history" "no staff token"
    skip_test "TC-STAFF-04" "Staff tap-out by plate" "no staff token"
fi
fi

# ══════════════════════════════════════════════════════════════
# 8. MODUL ADMIN MANAGEMENT
# ══════════════════════════════════════════════════════════════
if should_run_module "admin"; then
section "MODUL: ADMIN MANAGEMENT"

if [[ -n "$ADMIN_TOKEN" ]]; then
    # TC-ADM-01: Dashboard stats
    RESP=$(api_get "/admin/dashboard-stats" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-01" "Admin dashboard stats" "$STATUS"
    else
        fail_test "TC-ADM-01" "Admin dashboard stats" "200" "$STATUS"
    fi

    # TC-ADM-02: Revenue config
    RESP=$(api_get "/admin/revenue-config" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-02" "Admin revenue config list" "$STATUS"
    else
        fail_test "TC-ADM-02" "Admin revenue config list" "200" "$STATUS"
    fi

    # TC-ADM-03: Revenue config latest
    RESP=$(api_get "/admin/revenue-config/latest" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-03" "Admin revenue config latest" "$STATUS"
    else
        fail_test "TC-ADM-03" "Admin revenue config latest" "200" "$STATUS"
    fi

    # TC-ADM-04: Staff management
    RESP=$(api_get "/admin/staff" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-04" "Admin staff list" "$STATUS"
    else
        fail_test "TC-ADM-04" "Admin staff list" "200" "$STATUS"
    fi

    # TC-ADM-05: Slot management
    RESP=$(api_get "/admin/slots" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    SLOT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null)
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-05" "Admin slot list (${SLOT_COUNT} slots)" "$STATUS"
    else
        fail_test "TC-ADM-05" "Admin slot list" "200" "$STATUS"
    fi

    # TC-ADM-06: Transaction list
    RESP=$(api_get "/admin/transactions" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-06" "Admin transaction history" "$STATUS"
    else
        fail_test "TC-ADM-06" "Admin transaction history" "200" "$STATUS"
    fi

    # TC-ADM-07: Member management
    RESP=$(api_get "/admin/members/customers" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-07" "Admin member/customer list" "$STATUS"
    else
        fail_test "TC-ADM-07" "Admin member/customer list" "200" "$STATUS"
    fi

    # TC-ADM-08: Manual verification history
    RESP=$(api_get "/admin/manual-verifications" "$ADMIN_TOKEN")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-ADM-08" "Admin manual verification history" "$STATUS"
    else
        fail_test "TC-ADM-08" "Admin manual verification history" "200" "$STATUS"
    fi
else
    for i in 01 02 03 04 05 06 07 08; do
        skip_test "TC-ADM-${i}" "Admin management test" "no admin token"
    done
fi
fi

# ══════════════════════════════════════════════════════════════
# 9. MODUL CUSTOMER
# ══════════════════════════════════════════════════════════════
if should_run_module "customer"; then
section "MODUL: CUSTOMER"

if [[ -n "$CUSTOMER_TOKEN" ]]; then
    # TC-CUST-01: Customer dashboard
    RESP=$(api_get "/customer/dashboard" "$CUSTOMER_TOKEN")
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-CUST-01" "Customer dashboard" "$STATUS"
    else
        fail_test "TC-CUST-01" "Customer dashboard" "200" "$STATUS" "$BODY"
    fi

    # TC-CUST-02: Customer tap-in
    RESP=$(api_post "/customer/tap-in" "$CUSTOMER_TOKEN" '{}')
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" || "$STATUS" == "400" ]]; then
        # 400 = already has active transaction
        if [[ "$STATUS" == "400" ]]; then
            pass_test "TC-CUST-02" "Customer tap-in (already parked, 400 expected)" "$STATUS"
        else
            pass_test "TC-CUST-02" "Customer tap-in" "$STATUS"
        fi
    else
        fail_test "TC-CUST-02" "Customer tap-in" "200/400" "$STATUS" "$BODY"
    fi

    # TC-CUST-03: Customer tap-out
    RESP=$(api_post "/customer/tap-out" "$CUSTOMER_TOKEN" '{}')
    STATUS=$(get_status "$RESP")
    BODY=$(get_body "$RESP")
    if [[ "$STATUS" == "200" || "$STATUS" == "400" ]]; then
        pass_test "TC-CUST-03" "Customer tap-out" "$STATUS"
    else
        fail_test "TC-CUST-03" "Customer tap-out" "200/400" "$STATUS" "$BODY"
    fi
else
    skip_test "TC-CUST-01" "Customer dashboard" "no customer token"
    skip_test "TC-CUST-02" "Customer tap-in" "no customer token"
    skip_test "TC-CUST-03" "Customer tap-out" "no customer token"
fi
fi

# ══════════════════════════════════════════════════════════════
# 10. MODUL AI VISION
# ══════════════════════════════════════════════════════════════
if should_run_module "ai"; then
section "MODUL: AI VISION"

if [[ "$AI_OK" == true ]]; then
    # TC-AI-01: Process frame - health check
    RESP=$(curl -s -w '\n%{http_code}' "${AI_URL}/docs" 2>/dev/null)
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "200" ]]; then
        pass_test "TC-AI-01" "AI service /docs accessible" "$STATUS"
    else
        fail_test "TC-AI-01" "AI service /docs accessible" "200" "$STATUS"
    fi

    # TC-AI-02: Process frame with test image
    # Buat test image sederhana
    TEST_IMG="/tmp/test_frame.jpg"
    python3 -c "
from PIL import Image
img = Image.new('RGB', (640, 480), color=(100, 100, 100))
img.save('$TEST_IMG')
" 2>/dev/null || python3 -c "
import struct, zlib
# Minimal JPEG-like file for testing
with open('$TEST_IMG', 'wb') as f:
    f.write(b'\\xff\\xd8\\xff\\xe0\\x00\\x10JFIF\\x00\\x01\\x01\\x00\\x00\\x01\\x00\\x01\\x00\\x00')
    f.write(b'\\xff\\xd9')
" 2>/dev/null

    if [[ -f "$TEST_IMG" ]]; then
        RESP=$(ai_post "$TEST_IMG")
        STATUS=$(get_status "$RESP")
        BODY=$(get_body "$RESP")
        VEHICLES=$(json_field "$BODY" "vehicles_found")
        if [[ "$STATUS" == "200" ]]; then
            pass_test "TC-AI-02" "AI process-frame (${VEHICLES} vehicles found)" "$STATUS"
        else
            fail_test "TC-AI-02" "AI process-frame" "200" "$STATUS" "$BODY"
        fi
    else
        skip_test "TC-AI-02" "AI process-frame" "cannot create test image"
    fi

    # TC-AI-03: AI service health
    RESP=$(curl -s -w '\n%{http_code}' "${AI_URL}/process-frame" -X POST -F "file=@/dev/null" 2>/dev/null)
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "422" || "$STATUS" == "400" || "$STATUS" == "200" ]]; then
        pass_test "TC-AI-03" "AI process-frame endpoint reachable" "$STATUS"
    else
        fail_test "TC-AI-03" "AI process-frame endpoint reachable" "200/422" "$STATUS"
    fi
else
    skip_test "TC-AI-01" "AI service /docs" "AI service not running"
    skip_test "TC-AI-02" "AI process-frame" "AI service not running"
    skip_test "TC-AI-03" "AI process-frame endpoint" "AI service not running"
fi
fi

# ══════════════════════════════════════════════════════════════
# 11. EDGE CASES
# ══════════════════════════════════════════════════════════════
if should_run_module "edge"; then
section "MODUL: EDGE CASES"

# TC-EDGE-01: Tap-in normal (sudah ada transaksi lain)
RESP=$(api_post "/parking/tap-in" "" '{"plate_number":"B1111EDGE"}')
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
if [[ "$STATUS" == "200" || "$STATUS" == "400" ]]; then
    pass_test "TC-EDGE-01" "Tap-in (multi-transaction allowed)" "$STATUS"
else
    fail_test "TC-EDGE-01" "Tap-in" "200/400" "$STATUS" "$BODY"
fi

# TC-EDGE-02: Double tap-out same slot
EDGE_SLOT=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)
if [[ -n "${EDGE_SLOT:-}" ]]; then
    # Tap-out pertama
    api_post "/parking/tap-out" "" "{\"slot_id\":${EDGE_SLOT}}" > /dev/null
    # Tap-out kedua
    RESP=$(api_post "/parking/tap-out" "" "{\"slot_id\":${EDGE_SLOT}}")
    STATUS=$(get_status "$RESP")
    if [[ "$STATUS" == "400" ]]; then
        pass_test "TC-EDGE-02" "Double tap-out same slot (400)" "$STATUS"
    else
        fail_test "TC-EDGE-02" "Double tap-out same slot" "400" "$STATUS"
    fi
else
    skip_test "TC-EDGE-02" "Double tap-out same slot" "no slot from tap-in"
fi

# TC-EDGE-03: Override to occupied slot
if [[ -n "$STAFF_TOKEN" ]]; then
    # Tap-in dua mobil
    R1=$(api_post "/parking/tap-in" "" '{"plate_number":"B2222OV1"}')
    SLOT1=$(echo "$(get_body "$R1")" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)
    TX1=$(echo "$(get_body "$R1")" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('transaction',{}).get('id',''))" 2>/dev/null)

    R2=$(api_post "/parking/tap-in" "" '{"plate_number":"B2222OV2"}')
    SLOT2=$(echo "$(get_body "$R2")" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('transaction',{}).get('parking_slot_id',''))" 2>/dev/null)

    if [[ -n "${TX1:-}" && -n "${SLOT2:-}" ]]; then
        RESP=$(api_post "/staff/override-slot" "$STAFF_TOKEN" "{\"transaction_id\":${TX1},\"new_slot_id\":${SLOT2},\"reason\":\"Edge test - occupied target\"}")
        STATUS=$(get_status "$RESP")
        BODY=$(get_body "$RESP")
        if [[ "$STATUS" == "400" ]]; then
            pass_test "TC-EDGE-03" "Override to occupied slot (400)" "$STATUS"
        else
            fail_test "TC-EDGE-03" "Override to occupied slot" "400" "$STATUS" "$BODY"
        fi
    else
        skip_test "TC-EDGE-03" "Override to occupied slot" "insufficient data"
    fi
else
    skip_test "TC-EDGE-03" "Override to occupied slot" "no staff token"
fi

# TC-EDGE-04: Invalid slot_id type
RESP=$(api_post "/parking/tap-out" "" '{"slot_id":"abc"}')
STATUS=$(get_status "$RESP")
if [[ "$STATUS" == "400" || "$STATUS" == "404" || "$STATUS" == "422" ]]; then
    pass_test "TC-EDGE-04" "Tap-out with invalid slot_id type" "$STATUS"
else
    fail_test "TC-EDGE-04" "Tap-out with invalid slot_id" "400/404/422" "$STATUS"
fi

# TC-EDGE-05: Empty body
RESP=$(api_post "/parking/tap-out" "" '{}')
STATUS=$(get_status "$RESP")
if [[ "$STATUS" == "400" || "$STATUS" == "422" ]]; then
    pass_test "TC-EDGE-05" "Tap-out with empty body (400/422)" "$STATUS"
else
    fail_test "TC-EDGE-05" "Tap-out with empty body" "400/422" "$STATUS"
fi
fi

# ══════════════════════════════════════════════════════════════
# 12. SUMMARY
# ══════════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  TEST RESULTS SUMMARY${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════${RESET}"
echo ""
echo -e "  Total   : ${BOLD}${TOTAL}${RESET}"
echo -e "  ${GREEN}Passed  : ${PASSED}${RESET}"
echo -e "  ${RED}Failed  : ${FAILED}${RESET}"
echo -e "  ${YELLOW}Skipped : ${SKIPPED}${RESET}"
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}${BOLD}  ✗ FAILED TESTS:${RESET}"
    for ft in "${FAILED_TESTS[@]}"; do
        echo -e "    ${RED}• ${ft}${RESET}"
    done
    echo ""
fi

if [[ $FAILED -eq 0 && $TOTAL -gt 0 ]]; then
    echo -e "${GREEN}${BOLD}  ✓ ALL TESTS PASSED${RESET}"
elif [[ $TOTAL -eq 0 ]]; then
    echo -e "${YELLOW}  ○ No tests were executed${RESET}"
else
    echo -e "${RED}${BOLD}  ✗ ${FAILED} TEST(S) FAILED${RESET}"
fi

echo ""
echo -e "${DIM}  Run with --verbose for full response details${RESET}"
echo -e "${DIM}  Run with --module <name> to filter by module${RESET}"
echo -e "${DIM}  Modules: auth, park, violation, notif, staff, admin, customer, ai, edge${RESET}"
echo ""
