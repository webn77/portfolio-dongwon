# portfolio-dongwon — 회사별 맞춤 포트폴리오
# v2.0 | 2026-04-13

## 역할
회사별 HTML 포트폴리오 단일 파일 관리. 정식 실행은 hire_pipeline.sh.

## 최우선 원칙
1. 경력 원본: `이동원_포트폴리오_전체정리.md` 항상 이 파일 기준.
2. 신규 포트폴리오: `miridih/index.html` 복사 후 수정.
3. 챗봇 위젯: `data-company` + `proposals/[회사명].md` 필수.

## 금지
- HTML 파일 전체 읽기 (줄 번호 범위만)
- `proposals/` 없이 챗봇 위젯 설정

## 파일 구조

```
portfolio-dongwon/
├── 이동원_포트폴리오_전체정리.md   ← 경력/성과 원본 (단일 소스)
├── chat-widget.js                  ← 챗봇 위젯 (공통)
├── miridih-portfolio-v3.html       ← 베이스 템플릿
├── [회사명]/index.html             ← 회사별 완성본
├── 서비스분석/[회사명]_*.md       ← 파이프라인 리서치 결과
├── 전략/[회사명]_전략.md          ← 파이프라인 전략 결과
├── proposals/[회사명].md           ← 챗봇 제안 요약 (3줄/건)
└── _archive/                       ← 구버전 보관
```

## 챗봇 위젯 설정

```html
<script
  src="../chat-widget.js?v=2.0.0"
  data-api="https://dongwon-chatbot.webn77.workers.dev"
  data-company="[회사명]"
  data-section-map='{"career":"#timeline","projects":"#cases"}'
></script>
```

chat-widget.js 상단 `WELCOME_TEXT` / `WELCOME_CHIPS` 회사명 맞춤 수정 필수.

## 디자인 공통 규칙

- Chart.js 4.4.0: 성과 수치 그래프 필수
- 다이어그램: SVG/CSS
- 폰트: Pretendard (CDN) | 최대 960px | 섹션 패딩 80px

## 회사별 현황

| 회사 | 포트폴리오 | 상태 |
|---|---|---|
| 미리디 | miridih/index.html | 완료 |
| 당근마켓 | daangn/index.html | 초안 |
| 인터엑스 | interx/index.html | 🟡 PHASE 4 진행 중 |

> 인터엑스 재개 시: `~/obsidian-vault/03_Projects/hire/채용지원/인터엑스-portfolio.md` 참조

## 배포

```bash
git add [회사명]/ proposals/
git commit -m "feat([회사명]): 포트폴리오 완성" && git push
# Netlify 자동 배포 → https://2dwtech.netlify.app/for/[회사명]-[랜덤6자]/
```
