# 이동원 포트폴리오 웹사이트 — CLAUDE.md

## 프로젝트 개요

이동원의 PM 포트폴리오 웹사이트. 회사별 맞춤 포트폴리오 페이지를 HTML 단일 파일로 제작.

---

## 파일 구조

```
portfolio-dongwon/
├── CLAUDE.md                         ← 워크플로우 규칙 (이 파일)
├── chat-widget.js                    ← 챗봇 위젯 (공통)
├── images/                           ← 이미지 에셋
├── 이동원_포트폴리오_전체정리.md      ← 경력/성과 원본 (공통 — 항상 이 파일 기준)
├── 서비스분석/
│   ├── 미리디_서비스분석.md
│   └── [회사명]_서비스분석.md         ← PHASE 1 리서처 결과
├── 전략/
│   └── [회사명]_전략.md               ← PHASE 2 전략 수립 결과
├── miridih-portfolio-v3.html         ← 베이스 템플릿 (신규 작업 시 복사)
├── miridih/index.html                ← 미리디 완성본
├── daangn/index.html                 ← 당근마켓 완성본
├── [회사명]/index.html               ← 회사별 완성본
└── _archive/                         ← 구버전 보관
```

---

## 트리거: "[회사명] JD 줄게" 또는 "[회사명] 지원 검토해줘"

JD를 받으면 PHASE 1 시작. 포트폴리오 제작은 지원 결정 후에만 진행.

---

## 전체 워크플로우

### ━━ PHASE 1. 리서치 (JD 수령 후 병렬 실행) ━━
> 에이전트: **OpenClaw Gemini 2.5 Flash** (무료)
> 토큰 최적화: Gemini가 웹 검색 처리 → Claude 토큰 0 소비

**[병렬 1-A]** 서비스 구조 분석
```bash
openclaw agent --agent main -m \
  "[회사명] 서비스 구조 분석. 핵심 기능/사용자 세그먼트/수익모델/경쟁사/개선 기회 포함" --json
```
→ `서비스분석/[회사명]_서비스분석.md` 저장

**[병렬 1-B]** JD 분석 + 회사 최신 동향
```bash
openclaw agent --agent main -m \
  "[회사명] 최신 동향. 최근 6개월 주요 발표/전략 방향/채용 포커스/투자 현황. JD: [JD 텍스트]" --json
```
→ `서비스분석/[회사명]_JD분석.md` 저장

> 두 작업 동시 실행 후 완료 대기

---

### ━━ PHASE 2. 지원 적합도 평가 ━━
> 에이전트: **Claude Sonnet (나)**
> 토큰 최적화: 서비스분석/JD분석 핵심만 읽음

1. `이동원_포트폴리오_전체정리.md` 읽기
2. `서비스분석/[회사명]_서비스분석.md` + `[회사명]_JD분석.md` 읽기
3. 아래 리포트 작성 후 **사용자에게 보고**:

```
① 적합도 평가 (★★★★☆ 형식)
   - JD 요구사항 ↔ 이동원 경력 매칭
   - 강점 / 약점 / 보완 포인트

② 회사 방향 vs 이동원 강점
   - 회사가 지금 가려는 방향
   - 이동원이 기여할 수 있는 부분

③ 지원 권장 여부 + 이유
```

> ★ 여기서 멈추고 사용자 결정 대기
> "진행해" → PHASE 3 시작
> "그만" → 종료

---

### ━━ [지원 결정 후] PHASE 3. 포트폴리오 전략 수립 ━━
> 에이전트: **Claude Sonnet (나)**

```
① 강조 경험 TOP 3 (JD 기반 선별)
② 제안 방향 3~5개 (서비스 분석 기반)
③ 포트폴리오 구성 전략
   - 강조할 섹션 순서
   - 부각할 수치
   - 회사 브랜드 컬러/톤
```
→ `전략/[회사명]_전략.md` 저장
→ **전략 보고 후 승인 받고 PHASE 4 진행**

---

### ━━ PHASE 4. 콘텐츠 + 빌드 (병렬 실행) ━━
> 토큰 최적화: 각 에이전트에게 전략 요약만 전달 (전체 파일 X)

**[병렬 3-A]** 카피라이팅
> 에이전트: **copywriting 스킬** (`coreyhaines31/marketingskills@copywriting`)
- 헤드라인, 섹션 문구, 제안 스토리라인
- 입력: `전략/[회사명]_전략.md` 요약

**[병렬 3-B]** 레이아웃 설계
> 에이전트: **presentation-design 스킬** (`jwynia/agent-skills@presentation-design`)
- PPT형 섹션 구조, 정보 위계 설계
- 입력: 회사 브랜드 컬러 + 강조 섹션 목록

> 3-A, 3-B 완료 후 →

**[순차 3-C]** HTML 빌드
> 에이전트: **frontend-slides + web-coder 스킬**
- `miridih-portfolio-v3.html` 복사 → `[회사명]/index.html`
- 카피(3-A) + 레이아웃(3-B) 합쳐서 구현
- Chart.js 수치 시각화 + SVG/CSS 다이어그램 필수

---

### ━━ PHASE 5. 검증 (병렬 실행) ━━

**[병렬 4-A]** 브라우저 테스트
```bash
open [회사명]/index.html
```

**[병렬 4-B]** 비판자 검증
> 에이전트: **Codex** (무료 한도) → 소진 시 **critic.sh (Groq)** fallback
- 채용담당자 관점: 설득력, 핵심 메시지 명확성
- 디자인 관점: 가독성, 구조, 시각적 완성도
- PM 전문성 관점: 제안 논리, 데이터 근거
- 입력: HTML 전체 X → 텍스트 핵심만 추출해서 전달

---

### ━━ PHASE 6. 챗봇 + 배포 ━━
> 에이전트: **Claude Sonnet (나)**

1. `proposals/[회사명].md` 생성 (제안 요약 3줄/건)
2. HTML에 `data-company="[회사명]"` 추가
3. chat-widget.js `WELCOME_CHIPS` 회사 맞춤 수정
4. git push

```bash
git add [회사명]/ 서비스분석/ 전략/ proposals/
git commit -m "feat([회사명]): 포트폴리오 완성" && git push
```

---

## 에이전트 역할 요약

| Phase | 에이전트 | 모델 | 비용 | 병렬 |
|---|---|---|---|---|
| 1-A 서비스분석 | OpenClaw | Gemini 2.5 Flash | 무료 | ✅ 1-B와 동시 |
| 1-B JD분석+동향 | OpenClaw | Gemini 2.5 Flash | 무료 | ✅ 1-A와 동시 |
| 2 적합도 평가 | Claude Sonnet (나) | Sonnet 4.6 | 유료 | ⏸ 사용자 결정 대기 |
| 3 포트폴리오 전략 | Claude Sonnet (나) | Sonnet 4.6 | 유료 | ⏸ 승인 후 진행 |
| 4-A 카피라이팅 | copywriting 스킬 | — | — | ✅ 4-B와 동시 |
| 4-B 레이아웃 | presentation-design 스킬 | — | — | ✅ 4-A와 동시 |
| 4-C HTML 빌드 | frontend-slides + web-coder | Sonnet 4.6 | 유료 | ⏸ 4-A,B 완료 후 |
| 5-A 브라우저 테스트 | — | — | 무료 | ✅ 5-B와 동시 |
| 5-B 비판자 검증 | Codex → Groq fallback | o3 → Llama | 무료 | ✅ 5-A와 동시 |
| 6 챗봇+배포 | Claude Sonnet (나) | Sonnet 4.6 | 유료 | — |

---

## 디자인 요구사항 (공통)

- **형식**: 프레젠테이션 형식 (섹션 = 슬라이드)
- **Chart.js 4.4.0**: 성과 수치 반드시 그래프
- **다이어그램**: 서비스 구조/제안 흐름은 SVG/CSS
- **색상**: 회사 브랜드 컬러 기반 (미리디: `#1a2744` / `#4A90D9` / `#7B5EA7`)
- **레이아웃**: 최대 960px, 섹션 패딩 80px, 보더라디우스 16px
- **폰트**: Pretendard (CDN)

## CSS 규칙

```css
/* 올바른 패턴 */
#root * { box-sizing: border-box; }
.component-class { /* 클래스 기반 스타일링 */ }

/* 금지 */
/* #root * { margin: 0; padding: 0; } */
/* #root button { background: none; } */
```

---

## 챗봇 위젯 설정 (회사별)

```html
<script
  src="../chat-widget.js?v=2.0.0"
  data-api="https://dongwon-chatbot.webn77.workers.dev"
  data-company="[회사명]"
  data-section-map='{"career":"#timeline","projects":"#cases"}'
></script>
```

| 항목 | 위치 | 내용 |
|---|---|---|
| `WELCOME_TEXT` | chat-widget.js 상단 | 회사명 언급 환영 메시지 |
| `WELCOME_CHIPS` | chat-widget.js 상단 | 회사 관련 빠른 질문 4개 |
| `data-company` | HTML script 태그 | proposals/[회사명].md 로드 |
| `data-section-map` | HTML script 태그 | 섹션 ID → 앵커 매핑 |

---

## 회사별 현황

| 회사 | 서비스분석 | 전략 | 포트폴리오 | 상태 |
|---|---|---|---|---|
| 미리디 | 서비스분석/미리디_서비스분석.md | — | miridih/index.html | 완료 |
| 당근마켓 | — | — | daangn/index.html | 초안 |

---

## GitHub Pages

- 레포: `webn77/portfolio-dongwon`
- URL: `webn77.github.io/portfolio-dongwon/[회사명]/`
