# data.json 스키마 정의
# STEP 4 Codex가 final-draft.md 기반으로 이 파일을 작성

## 필드 목록

```json
{
  "company":          "회사명 (한글)",
  "company_upper":    "COMPANY (영문 대문자 — APPLY 배지용)",
  "position":         "포지션명 (예: 시니어 PM 지원)",
  "brand_primary":    "#hex — 메인 컬러 (어두운 배경)",
  "brand_secondary":  "#hex — 보조 컬러 (버튼/링크)",
  "brand_accent":     "#hex — 강조 컬러 (그라디언트 끝)",
  "cover_badge":      "커버 뱃지 텍스트 (예: 미리디 시니어 프로덕트 매니저 지원)",
  "cover_title":      "커버 메인 타이틀 (HTML 허용, <br> 등)",
  "cover_desc":       "커버 설명 문장 (1~2문장)",
  "cover_note":       "커버 하단 작은 주석 (선택)",
  "cover_stats": [
    { "val": "15년",  "label": "프로덕트 경력" },
    { "val": "60억",  "label": "결제 매출 성장" }
  ],
  "cs_apply_points": {
    "1": "CS1 적용 포인트 (이 회사 맥락으로 작성)",
    "2": "CS2 적용 포인트",
    "3": "CS3 적용 포인트",
    "4": "CS4 적용 포인트",
    "5": "CS5 적용 포인트",
    "6": "CS6 적용 포인트",
    "7": "CS7 적용 포인트",
    "8": "CS8 적용 포인트",
    "9": "CS9 적용 포인트"
  },
  "why_section_html": "<!-- 왜 이 회사인가 섹션 HTML 전체 -->",
  "proposal_title":   "제안 섹션 타이틀",
  "proposal_sub":     "제안 섹션 서브 텍스트",
  "proposal_section_html": "<!-- 제안 섹션 HTML 전체 -->",
  "closing_quote":    "클로징 인용구",
  "closing_body":     "클로징 본문 (1~2문장)",
  "closing_sign":     "클로징 서명 (기본값: 이동원 드림)"
}
```

## 필드 우선순위

| 필드 | 소스 | 비고 |
|------|------|------|
| cs_apply_points | final-draft.md CS별 "이 회사에서의 의미" | STEP 3에서 작성됨 |
| why_section_html | final-draft.md S5 "왜 이 회사인가" | HTML 변환 필요 |
| proposal_* | final-draft.md PART 3 제안 섹션 | HTML 변환 필요 |
| cover_* | final-draft.md S1 표지 | 수치 임의 생성 금지 |
| brand_* | 서비스분석.md 브랜드 아이덴티티 | STEP 1/2에서 조사됨 |

## 빌드 명령

```bash
# STEP 4에서 Codex가 data.json 작성 후:
python3 ~/projects/hire/portfolio-dongwon/_template/build.py [회사명]/data.json

# 또는 hire_pipeline.sh STEP 4 자동 실행
```
