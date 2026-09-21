#!/usr/bin/env python3
"""
UMANI Architecture Decision Record (ADR) Scaffolder
---------------------------------------------------
Generates a structured Architecture Decision Record compliant with the
Michael Nygard / SEI standard format in docs/adr/.

Usage:
  python3 create_adr.py "Use TanStack Query v5 for Server State"
"""

import sys
import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
ADR_DIR = REPO_ROOT / "docs" / "adr"

TEMPLATE = """# {number}. {title}

Date: {date}

## Status
{status} (Proposed / Accepted / Deprecated / Superseded by ADR-XXX)

## Context & Problem Statement
What is the context of this architectural decision? What forces and constraints are at play?
- Business context:
- Technical constraints:
- Non-functional requirements (performance, scalability, reliability):

## Considered Options
1. Option 1: [Name]
2. Option 2: [Name]
3. Option 3: [Name]

## Decision Outcome
Chosen option: **"{title}"**, because:
- [Justification 1]
- [Justification 2]

## Positive Consequences
- [Positive consequence 1]
- [Positive consequence 2]

## Negative Consequences & Trade-offs
- [Trade-off / drawback 1]
- [Mitigation strategy]

## Compliance & Architectural Invariants
- Invariants preserved:
- Impact on existing systems:

## Verification & Validation
- How this decision is enforced (e.g. dependency-cruiser rule, unit test, CI check):
"""

def get_next_adr_number(adr_dir: Path) -> int:
    if not adr_dir.exists():
        return 1
    existing = list(adr_dir.glob("[0-9][0-9][0-9][0-9]-*.md"))
    if not existing:
        return 1
    numbers = []
    for f in existing:
        m = re.match(r'^(\d{4})-', f.name)
        if m:
            numbers.append(int(m.group(1)))
    return max(numbers, default=0) + 1

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 create_adr.py \"Title of Architectural Decision\"")
        sys.exit(1)

    title = sys.argv[1].strip()
    ADR_DIR.mkdir(parents=True, exist_ok=True)

    num = get_next_adr_number(ADR_DIR)
    num_str = f"{num:04d}"
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    filename = f"{num_str}-{slug}.md"
    target_file = ADR_DIR / filename

    content = TEMPLATE.format(
        number=num_str,
        title=title,
        date=datetime.now().strftime("%Y-%m-%d"),
        status="Proposed"
    )

    target_file.write_text(content, encoding="utf-8")
    print(f"Created new ADR: {target_file.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    main()
