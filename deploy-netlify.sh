#!/bin/bash
# deploy-netlify.sh — 회사별 포트폴리오 Netlify 배포
# 사용법: bash deploy-netlify.sh [회사명]
# 예: bash deploy-netlify.sh miridih
#     bash deploy-netlify.sh interx
#     bash deploy-netlify.sh all

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$HOME/projects/hire/_pipeline/state"

# 사이트 ID 매핑 (netlify init 후 채워넣기)
declare -A SITE_IDS=(
  ["miridih"]="9bcee2d3-1c46-426b-8b39-ee26212814b6"
  ["interx"]="7681bc97-25cf-4967-9d29-554a5b9a7a44"
)

# 폴더명 → 회사명(한글) 매핑
declare -A COMPANY_NAMES=(
  ["miridih"]="미리디"
  ["interx"]="인터엑스"
)

# Netlify URL 매핑
declare -A NETLIFY_URLS=(
  ["miridih"]="https://dongwon-miridih.netlify.app"
  ["interx"]="https://dongwon-interx.netlify.app"
)

# state JSON에 portfolio_url 업데이트
update_state_url() {
  local company="$1"
  local url="${NETLIFY_URLS[$company]}"
  local name="${COMPANY_NAMES[$company]}"
  local state_file="$STATE_DIR/${name}.json"

  if [ -z "$name" ] || [ -z "$url" ]; then return; fi
  if [ ! -f "$state_file" ]; then
    echo "[WARN] state 파일 없음: $state_file"
    return
  fi

  python3 -c "
import json
f = '$state_file'
d = json.load(open(f))
d['portfolio_url'] = '$url'
json.dump(d, open(f, 'w'), ensure_ascii=False, indent=2)
print('[INFO] portfolio_url 업데이트: $url')
"
}

deploy_company() {
  local company="$1"
  local folder="$SCRIPT_DIR/$company"

  if [ ! -d "$folder" ]; then
    echo "[ERROR] 폴더 없음: $folder"
    return 1
  fi

  if [ ! -f "$folder/index.html" ]; then
    echo "[SKIP] index.html 없음: $company (아직 미생성)"
    return 0
  fi

  echo ""
  echo "=== [$company] 배포 시작 ==="

  cd "$folder"

  # site-id가 설정된 경우 --site 옵션 추가
  local site_flag=""
  if [ -n "${SITE_IDS[$company]}" ]; then
    site_flag="--site ${SITE_IDS[$company]}"
  fi

  netlify deploy --prod --dir . $site_flag

  echo "=== [$company] 배포 완료 ==="
  update_state_url "$company"
}

# 인자 처리
COMPANY="${1:-}"

if [ -z "$COMPANY" ]; then
  echo "사용법: bash deploy-netlify.sh [회사명|all]"
  echo "회사 목록: miridih, interx"
  exit 1
fi

if [ "$COMPANY" = "all" ]; then
  for c in "${!SITE_IDS[@]}"; do
    deploy_company "$c"
  done
else
  deploy_company "$COMPANY"
fi
