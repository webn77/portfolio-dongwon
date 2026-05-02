#!/bin/bash
# 재시작 시 cloudflared 퀵터널 URL을 config.json에 반영 후 Netlify 배포
# LaunchAgent: com.dongwon.cloudflared-quick.plist 의존 (cloudflared 시작 후 실행)

LOG="/tmp/cf-quick2.log"
CONFIG_DIR="$HOME/projects/hire/portfolio-dongwon/miridih"

# cloudflared가 URL을 할당할 때까지 대기 (최대 30초)
for i in $(seq 1 30); do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" 2>/dev/null | grep -v 'api\.trycloudflare\.com' | tail -1)
  if [ -n "$URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$URL" ]; then
  echo "[update-tunnel-url] URL 파싱 실패 — 종료" >&2
  exit 1
fi

echo "[update-tunnel-url] 새 URL: $URL"

# config.json 업데이트
cat > "$CONFIG_DIR/config.json" <<EOF
{
  "api_url": "$URL"
}
EOF

# Netlify 배포
cd "$CONFIG_DIR" && netlify deploy --prod --dir . --message "tunnel url: $URL" > /tmp/netlify-deploy.log 2>&1
echo "[update-tunnel-url] Netlify 배포 완료"
