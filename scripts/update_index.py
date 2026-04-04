#!/usr/bin/env python3
"""
update_index.py
Scans project entry files and rewrites function/route line-number tables
in docs_canonical/REPO_MAP.md. Run after any significant refactor.

CONFIGURATION: TARGET_FILES below is configured for Project6_PMS.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # project root

# ── CONFIGURE FOR THIS PROJECT ─────────────────────────────────────────────
# Add or remove entries. Each tuple: (filepath_relative_to_ROOT, file_type)
TARGET_FILES = [
    ("mother/src/App.tsx", "tsx"),
    ("mother/server.js",  "js_express"),
    ("child/src/App.tsx",  "tsx"),
    ("child/server.js",   "js_express"),
]
# ───────────────────────────────────────────────────────────────────────────

def scan_tsx_ts(filepath: Path) -> list[tuple[str, int]]:
    """Top-level handler/fetcher/action functions."""
    results = []
    # Match: function Name(...) or const handleName = (...)
    pattern = re.compile(
        r'^\s{0,4}(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(fetch\w+|handle\w+|load\w+|on[A-Z]\w+|get[A-Z]\w+|set[A-Z]\w+)\s*=)'
    )
    for i, line in enumerate(filepath.read_text(encoding="utf-8").splitlines(), 1):
        m = pattern.match(line)
        if m:
            name = m.group(1) or m.group(2)
            if name:
                results.append((name, i))
    return results

def scan_js_express(filepath: Path) -> list[tuple[str, str, int]]:
    """Express app.get/post/... → (method:route, handler_fn, line)."""
    results = []
    for i, line in enumerate(filepath.read_text(encoding="utf-8").splitlines(), 1):
        # Match: app.get('/api/fleet', (req, res) => {
        m = re.match(r"(?:app|router)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)", line)
        if m:
            results.append((f"{m.group(1).upper()} {m.group(2)}", i))
    return results

SCANNERS = {
    "tsx":        scan_tsx_ts,
    "js_express": scan_js_express,
}

def build_fn_table(entries: list[tuple[str, int]]) -> str:
    rows = ["| Handler / Function | Line |", "|--------------------|------|"]
    for name, line in entries:
        rows.append(f"| `{name}` | {line} |")
    return "\n".join(rows)

def build_route_table(entries: list[tuple[str, int]]) -> str:
    rows = ["| Route / Method | Handler Function | Line |", "|----------------|-----------------|------|"]
    for route_with_method, line in entries:
        method, route = route_with_method.split(" ", 1)
        # We don't easily have the function name for simple Express routes without more complex parsing,
        # so we'll use a placeholder or the method itself for now.
        rows.append(f"| `{method} {route}` | → | {line} |")
    return "\n".join(rows)

def update_repo_map():
    repo_map = ROOT / "docs_canonical" / "REPO_MAP.md"
    if not repo_map.exists():
        print("REPO_MAP.md not found — create it first per CANONICAL_INSTRUCTIONS.md")
        return

    content = repo_map.read_text(encoding="utf-8")

    for rel_path, file_type in TARGET_FILES:
        filepath = ROOT / rel_path
        if not filepath.exists():
            print(f"WARNING: {rel_path} not found — skipping")
            continue

        scanner = SCANNERS.get(file_type)
        if not scanner:
            print(f"WARNING: unknown file_type '{file_type}' for {rel_path} — skipping")
            continue

        entries = scanner(filepath)
        line_count = len(filepath.read_text(encoding="utf-8").splitlines())
        filename = filepath.name

        is_route_file = file_type == "js_express"
        table = build_route_table(entries) if is_route_file else build_fn_table(entries)
        kind  = "Route Map" if is_route_file else "Function Map"

        header = f"## {rel_path} {kind} (~{line_count} lines)"
        block  = f"{header}\n{table}\n"

        # Match from "## path/to/file Map" until the next "## " or end of file
        pattern = rf"## {re.escape(rel_path)} {kind}[^\n]*\n.*?(?=\n## |\Z)"
        new_content = re.sub(pattern, block, content, flags=re.DOTALL)

        if new_content == content:
            # Fallback: Match by filename only
            pattern = rf"## {re.escape(filename)} {kind}[^\n]*\n.*?(?=\n## |\Z)"
            new_content = re.sub(pattern, block, content, flags=re.DOTALL)
            
            if new_content == content:
                print(f"NOTE: No existing section for '{rel_path} {kind}' in REPO_MAP.md — appending")
                content = content.rstrip() + f"\n\n{block}"
            else:
                 content = new_content
        else:
            content = new_content

        print(f"{filename}: {len(entries)} entries updated in REPO_MAP.md")

    repo_map.write_text(content, encoding="utf-8")
    print("REPO_MAP.md update complete.")

if __name__ == "__main__":
    update_repo_map()
