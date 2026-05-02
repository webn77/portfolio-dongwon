#!/usr/bin/env python3
"""
create-template.py — miridih-portfolio-v3.html → default-template.html 변환
실행: python3 create-template.py
"""

import re
from pathlib import Path

SRC  = Path(__file__).parent.parent / "miridih-portfolio-v3.html"
DEST = Path(__file__).parent / "default-template.html"

html = SRC.read_text(encoding="utf-8")

# ── 1. 단순 치환 ─────────────────────────────────────────────
replacements = [
    # <title>
    (r'이동원 포트폴리오 — 미리디 시니어 PM 지원', '이동원 포트폴리오 — {{POSITION}}'),
    # nav logo
    (r'이동원 · 미리디 PM 포트폴리오', '이동원 · {{COMPANY}} 포트폴리오'),
    # nav link text
    (r'왜 미리디</a>', '왜 {{COMPANY}}</a>'),
    (r'href="#why-mireedi"', 'href="#why-company"'),
    # cover badge
    (r'미리디 시니어 프로덕트 매니저 지원', '{{COVER_BADGE}}'),
    # section comment
    (r'<!-- WHY 미리디 -->', '<!-- WHY {{COMPANY}} -->'),
    # section id
    (r'id="why"', 'id="why-company"'),
    # apply badge label (case insensitive prefix)
    (r'MIRIDIH APPLY · 미리디 적용 포인트', '{{COMPANY_UPPER}} APPLY · {{COMPANY}} 적용 포인트'),
    # miridih link class
    (r'class="miridih-link"', 'class="company-link"'),
]

for old, new in replacements:
    html = html.replace(old, new)

# ── 2. CSS 브랜드 컬러 → CSS 변수화 ─────────────────────────
# :root 블록 안의 색상 변수를 placeholder로 교체
css_var_block = """\
  :root {
    --brand-primary:{{BRAND_PRIMARY}};
    --brand-secondary:{{BRAND_SECONDARY}};
    --brand-accent:{{BRAND_ACCENT}};
    --gradient:linear-gradient(135deg,var(--brand-primary) 0%,var(--brand-secondary) 60%,var(--brand-accent) 100%);
    --gray-900:#111827;--gray-700:#374151;--gray-600:#4B5563;--gray-500:#6B7280;--gray-300:#D1D5DB;--gray-100:#F3F4F6;
    --white:#FFFFFF;
    --radius:16px;
    --shadow:0 10px 30px -8px rgba(26,39,68,.12);
    /* aliases — 기존 코드 호환용 */
    --navy:var(--brand-primary);
    --blue:var(--brand-secondary);
    --purple:var(--brand-accent);
    --pink:var(--brand-accent);
  }"""

html = re.sub(
    r':root \{[^}]+\}',
    css_var_block,
    html,
    count=1
)

# ── 3. COVER 섹션 → placeholder 블록으로 교체 ────────────────
cover_placeholder = """\
<!-- COVER -->
<section id="cover">
  <div class="cover-inner">
    <div class="cover-badge">{{COVER_BADGE}}</div>
    <div class="cover-name">이동원</div>
    <div class="cover-title">{{COVER_TITLE}}</div>
    <div class="cover-desc">{{COVER_DESC}}</div>
    <div class="cover-stats">{{COVER_STATS}}</div>
    <div class="cover-note">{{COVER_NOTE}}</div>
  </div>
</section>"""

html = re.sub(
    r'<!-- COVER -->.*?</section>',
    cover_placeholder,
    html,
    count=1,
    flags=re.DOTALL
)

# ── 4. WHY 섹션 전체 → placeholder ──────────────────────────
why_placeholder = """\
<!-- WHY {{COMPANY}} -->
<section id="why-company" class="section">
  <div class="page">
    <!-- SECTION:why -->
    {{WHY_SECTION}}
    <!-- /SECTION:why -->
  </div>
</section>"""

html = re.sub(
    r'<!-- WHY \{\{COMPANY\}\} -->.*?</section>',
    why_placeholder,
    html,
    count=1,
    flags=re.DOTALL
)

# ── 5. CS apply point 텍스트 → placeholder ──────────────────
# "APPLY · ... 적용 포인트</div>" 바로 다음 줄 <p>...</p> 를 순서대로 치환
n = [0]
def replace_apply_next_p(m):
    n[0] += 1
    return m.group(1) + f'{{{{CS_APPLY_{n[0]}}}}}</p>'

html = re.sub(
    r'(APPLY · \{\{COMPANY\}\} 적용 포인트</div>\n\s*<p[^>]*>)[^<]+(</p>)',
    replace_apply_next_p,
    html
)

# ── 6. PROPOSAL 섹션 → placeholder ──────────────────────────
proposal_placeholder = """\
<!-- PROPOSAL -->
<section id="proposal" class="section">
  <div class="page">
    <span class="section-tag">PROPOSAL</span>
    <h2 class="section-title">{{PROPOSAL_TITLE}}</h2>
    <p class="section-sub">{{PROPOSAL_SUB}}</p>
    <!-- SECTION:proposal -->
    {{PROPOSAL_SECTION}}
    <!-- /SECTION:proposal -->
  </div>
</section>"""

html = re.sub(
    r'<!-- PROPOSAL -->.*?(?=<!-- (?:CLOSING|SERVICE|ANALYSIS))',
    proposal_placeholder + '\n\n',
    html,
    count=1,
    flags=re.DOTALL
)

# ── 7. CLOSING 섹션 → placeholder ────────────────────────────
closing_placeholder = """\
<!-- CLOSING -->
<section id="closing">
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="closing-inner">
    <p class="closing-quote">{{CLOSING_QUOTE}}</p>
    <p class="closing-body">{{CLOSING_BODY}}</p>
    <p class="closing-sign">{{CLOSING_SIGN}}</p>
  </div>
</section>"""

html = re.sub(
    r'<!-- CLOSING -->.*?</section>',
    closing_placeholder,
    html,
    count=1,
    flags=re.DOTALL
)

# ── 저장 ─────────────────────────────────────────────────────
DEST.parent.mkdir(exist_ok=True)
DEST.write_text(html, encoding="utf-8")
print(f"✅ 템플릿 생성 완료: {DEST}")
print(f"   원본: {SRC.stat().st_size // 1024}KB → 템플릿: {len(html) // 1024}KB")

# placeholder 목록 출력
placeholders = sorted(set(re.findall(r'\{\{(\w+)\}\}', html)))
print(f"\n📋 치환 필요 placeholder ({len(placeholders)}개):")
for p in placeholders:
    print(f"   {{{{ {p} }}}}")
