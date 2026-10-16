import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = str(BASE_DIR / "src" / "data" / "extracted")

with open(os.path.join(OUTPUT_DIR, "qualifications.json"), "r", encoding="utf-8") as f:
    quals = json.load(f)

with open(os.path.join(OUTPUT_DIR, "competencies.json"), "r", encoding="utf-8") as f:
    comps = json.load(f)

with open(os.path.join(OUTPUT_DIR, "modules.json"), "r", encoding="utf-8") as f:
    mods = json.load(f)

# Build search index
search_index = []
for q in quals:
    title = q.get("title") or ""
    code = q.get("code") or ""
    desc = q.get("description") or ""
    sector = q.get("sector") or ""
    occ = q.get("proposed_occupation") or ""
    
    # Simple tokens for indexing
    raw_text = f"{title} {code} {sector} {occ} {desc[:200]}"
    
    search_index.append({
        "id": q["id"],
        "title": title,
        "code": code,
        "sector": sector,
        "level": q.get("level"),
        "raw_level": q.get("raw_level"),
        "awarding_body": q.get("awarding_body"),
        "valid_till": q.get("valid_till"),
        "version": q.get("version"),
        "hours": q.get("max_notational_hours") or q.get("min_notational_hours"),
        "desc_snippet": desc[:160] + ("..." if len(desc) > 160 else "") if desc else "",
        "source_file": q["source"]["source_file"],
        "source_row": q["source"].get("row_index") or q["source"].get("pages_inspected"),
        "verification_status": q.get("verification_status", "unverified"),
        "review_flags": q.get("review_flags", [])
    })

with open(os.path.join(OUTPUT_DIR, "qualifications_index.json"), "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False)

# Copy to public
with open(os.path.join(str(BASE_DIR / "public" / "data" / "qualifications_index.json")), "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False)

print(f"Generated search index with {len(search_index)} items. Size: {os.path.getsize(os.path.join(OUTPUT_DIR, 'qualifications_index.json')) / 1024:.1f} KB")
