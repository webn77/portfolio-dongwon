#!/usr/bin/env python3
"""
build.py — data.json + default-template.html → index.html
사용법:
  python3 _template/build.py miridih/data.json        # miridih/index.html 생성
  python3 _template/build.py interx/data.json         # interx/index.html 생성
  python3 _template/build.py 신규회사/data.json        # 신규회사/index.html 생성
"""

import json, re, sys
from pathlib import Path

TEMPLATE = Path(__file__).parent / "default-template.html"

def build(data_path: str):
    data_file = Path(data_path)
    out_dir   = data_file.parent
    out_file  = out_dir / "index.html"

    data = json.loads(data_file.read_text(encoding="utf-8"))
    html = TEMPLATE.read_text(encoding="utf-8")

    # ── 단순 치환 ────────────────────────────────────────────
    simple = {
        "COMPANY":        data.get("company", ""),
        "COMPANY_UPPER":  data.get("company_upper", data.get("company", "").upper()),
        "POSITION":       data.get("position", ""),
        "BRAND_PRIMARY":  data.get("brand_primary",   "#1a2744"),
        "BRAND_SECONDARY":data.get("brand_secondary", "#4A90D9"),
        "BRAND_ACCENT":   data.get("brand_accent",    "#7B5EA7"),
        "COVER_BADGE":    data.get("cover_badge",  ""),
        "COVER_TITLE":    data.get("cover_title",  ""),
        "COVER_DESC":     data.get("cover_desc",   ""),
        "COVER_NOTE":     data.get("cover_note",   ""),
        "PROPOSAL_TITLE": data.get("proposal_title", "제안"),
        "PROPOSAL_SUB":   data.get("proposal_sub",   ""),
        "CLOSING_QUOTE":  data.get("closing_quote",  ""),
        "CLOSING_BODY":   data.get("closing_body",   ""),
        "CLOSING_SIGN":   data.get("closing_sign",   "이동원 드림"),
    }
    for key, val in simple.items():
        html = html.replace(f"{{{{{key}}}}}", val)

    # ── COVER_STATS (배열 → HTML) ────────────────────────────
    stats = data.get("cover_stats", [])
    stats_html = "".join(
        f'<div class="cover-stat"><div class="cover-stat-val">{s["val"]}</div>'
        f'<div class="cover-stat-label">{s["label"]}</div></div>'
        for s in stats
    )
    html = html.replace("{{COVER_STATS}}", stats_html)

    # ── CS apply points ──────────────────────────────────────
    apply_points = data.get("cs_apply_points", {})  # {"1": "...", "2": "..."}
    for i, text in apply_points.items():
        html = html.replace(f"{{{{CS_APPLY_{i}}}}}", text)
    # 미입력 apply point는 빈 문자열로
    html = re.sub(r'\{\{CS_APPLY_\d+\}\}', '', html)

    # ── WHY 섹션 (HTML 블록) ─────────────────────────────────
    why_html = data.get("why_section_html", "")
    html = html.replace("{{WHY_SECTION}}", why_html)

    # ── PROPOSAL 섹션 (HTML 블록) ────────────────────────────
    proposal_html = data.get("proposal_section_html", "")
    html = html.replace("{{PROPOSAL_SECTION}}", proposal_html)

    # ── 잔여 placeholder 경고 ────────────────────────────────
    remaining = re.findall(r'\{\{(\w+)\}\}', html)
    if remaining:
        print(f"⚠️  미치환 placeholder: {set(remaining)}")

    out_file.write_text(html, encoding="utf-8")
    print(f"✅ {out_file} 생성 완료 ({len(html)//1024}KB)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python3 _template/build.py <company>/data.json")
        sys.exit(1)
    build(sys.argv[1])
