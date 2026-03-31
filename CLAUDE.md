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
│   └── [회사명]_서비스분석.md         ← OpenClaw 리서처 결과 저장
├── miridih-portfolio-v3.html         ← 베이스 템플릿 (신규 작업 시 복사)
├── miridih/
│   └── index.html                    ← 미리디 완성본 (GitHub Pages 배포)
├── daangn/
│   └── index.html                    ← 당근마켓 완성본
├── [회사명]/
│   └── index.html                    ← 회사별 완성본
└── _archive/                         ← 구버전 보관
    ├── miridih-index-old.html
    ├── miridih-portfolio-v2.html
    ├── miridih-portfolio.html
    ├── daangn-portfolio.html
    └── 미리디_포트폴리오_통합본.md
```

---

## 콘텐츠 원본 (작업 전 반드시 읽기)

- **경력/성과**: `이동원_포트폴리오_전체정리.md`
- **서비스 분석**: `서비스분석/[회사명]_서비스분석.md`

---

## 새 회사 포트폴리오 워크플로우

### STEP 1. 서비스 분석 (OpenClaw 리서처)
```bash
openclaw agent --agent main -m "[회사명] 서비스 구조 분석. 핵심 기능/사용자 세그먼트/수익모델/경쟁사/개선 기회 포함" --json
```
→ 결과를 `서비스분석/[회사명]_서비스분석.md` 저장

### STEP 2. 전략 매칭 (Claude Sonnet)
1. `이동원_포트폴리오_전체정리.md` 읽기
2. `서비스분석/[회사명]_서비스분석.md` 읽기
3. 이동원 경력에서 해당 회사 도메인과 맞는 경험 추출
4. 제안 3~5개 초안 작성 (미리디처럼 구체적인 제품 개선 제안)

### STEP 3. HTML 빌드 (web-coder 스킬)
- `miridih-portfolio-v3.html` 복사 → `[회사명]/index.html`
- 아래 디자인 요구사항 적용

---

## 디자인 요구사항 (모든 포트폴리오 공통)

### 형식
- **프레젠테이션 형식**: 섹션이 슬라이드처럼 명확히 구분
- **Chart.js**: 성과 수치 반드시 그래프로 시각화
- **다이어그램**: 서비스 구조, 제안 흐름, 아키텍처는 SVG/CSS 다이어그램으로

### 색상
- 기본: 회사 브랜드 컬러 기반으로 조정
- 미리디 기본값: `--navy: #1a2744` / `--blue: #4A90D9` / `--purple: #7B5EA7`

### 레이아웃
- 최대 너비: `960px` (`.page`)
- 섹션 패딩: `80px 0`
- 기본 보더 라디우스: `16px`
- 폰트: Pretendard (CDN)
- Chart.js: 4.4.0 (CDN)

---

## CSS 규칙

```css
/* 올바른 패턴 */
#root * { box-sizing: border-box; }
.component-class { /* 클래스 기반 스타일링 */ }

/* 금지 */
/* #root * { margin: 0; padding: 0; } — ID+유니버설 리셋 금지 */
/* #root button { background: none; } — ID+element 리셋 금지 */
```

---

## 회사별 현황

| 회사 | 서비스분석 | 포트폴리오 | 상태 |
|---|---|---|---|
| 미리디 | 서비스분석/미리디_서비스분석.md | miridih/index.html | 완료 |
| 당근마켓 | - | daangn/index.html | 초안 |

---

## 챗봇 위젯 설정 (회사별 필수)

`chat-widget.js`는 공통 파일. HTML에서 `<script>` 태그 속성으로 회사별 설정 주입.

### HTML 삽입 방법
```html
<script
  src="../chat-widget.js?v=2.0.0"
  data-api="https://[cloudflare-tunnel-url]"
  data-section-map='{"hero":"헤드라인 섹션","proposal":"제안 섹션"}'
></script>
```

### 회사별 커스터마이징 항목
| 항목 | 위치 | 내용 |
|---|---|---|
| `WELCOME_TEXT` | chat-widget.js 상단 | 회사명 언급한 환영 메시지 |
| `WELCOME_CHIPS` | chat-widget.js 상단 | 해당 회사 관련 빠른 질문 4개 |
| `data-section-map` | HTML script 태그 | 포트폴리오 섹션 ID → 설명 매핑 |
| `data-api` | HTML script 태그 | Cloudflare 터널 URL (공통 사용 가능) |

### WELCOME_CHIPS 예시
```js
// 미리디
['미리디 제안이 뭐예요?', '결제 경력이 얼마나 돼요?', '가장 큰 성과는?', 'AI 활용 경험 있나요?']

// 새 회사 (회사 도메인에 맞게 교체)
['[회사명] 관련 경험은?', '핵심 성과가 뭐예요?', '어떤 제안을 하셨나요?', 'PM 철학이 뭔가요?']
```

> 신규 회사 포트폴리오 작업 시 chat-widget.js의 WELCOME_TEXT, WELCOME_CHIPS 수정 후
> HTML에 data-section-map 추가할 것.

---

## Git 워크플로우

### 회사별 폴더 단위 커밋
```bash
# 특정 회사만 커밋
git add miridih/ && git commit -m "feat(miridih): [변경내용]" && git push

# 공통 파일 커밋
git add chat-widget.js && git commit -m "fix(widget): [변경내용]" && git push

# 새 회사 추가
git add [회사명]/ 서비스분석/[회사명]_서비스분석.md
git commit -m "feat([회사명]): 포트폴리오 초안" && git push
```

### .gitignore 추가 필요
```
.DS_Store
```

---

## 작업 규칙

1. **베이스**: 신규 작업은 항상 `miridih-portfolio-v3.html` 복사
2. **단일 파일**: 외부 파일 추가 없이 한 HTML에서 해결
3. **캐시 무효화**: JS/CSS 변경 시 `?v=버전` 쿼리 추가
4. **확인**: 수정 완료 시 `open [파일]` 으로 브라우저 확인

---

## GitHub Pages 배포

- 레포: `webn77/portfolio-dongwon`
- 미리디: `webn77.github.io/portfolio-dongwon/miridih/`
- 신규 회사: `webn77.github.io/portfolio-dongwon/[회사명]/`
