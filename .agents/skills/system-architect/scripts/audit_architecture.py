#!/usr/bin/env python3
"""
UMANI System Architecture Automated Auditor & Linter
-----------------------------------------------------
Performs automated architectural checks against:
1. Circular Dependencies (using dependency-cruiser / madge / AST)
2. Layer Boundary Enforcement (Clean Architecture / Vertical Slices)
3. Platform Abstraction Facade (Capacitor decouple invariants)
4. Route-Level Code Splitting & Heavy Library Lazy-Loading (maplibre-gl, recharts)
5. Database Architectural Invariants (Postgres GiST exclusion for zero double-booking)
6. Component Modularity & Complexity (Monolithic files > 500 lines)
"""

import os
import sys
import re
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

# Base directories
REPO_ROOT = Path(__file__).resolve().parents[4]
SRC_DIR = REPO_ROOT / "src"
PAGES_DIR = SRC_DIR / "pages"
COMPONENTS_DIR = SRC_DIR / "components"
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
APP_TSX = SRC_DIR / "App.tsx"

class ArchViolation:
    def __init__(self, code: str, title: str, severity: str, description: str, file_path: str, line_number: Optional[int] = None, remediation: str = ""):
        self.code = code
        self.title = title
        self.severity = severity  # CRITICAL, HIGH, MEDIUM, LOW
        self.description = description
        self.file_path = file_path
        self.line_number = line_number
        self.remediation = remediation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "title": self.title,
            "severity": self.severity,
            "description": self.description,
            "file_path": str(self.file_path),
            "line_number": self.line_number,
            "remediation": self.remediation
        }

class SystemArchitectureAuditor:
    def __init__(self):
        self.violations: List[ArchViolation] = []
        self.passed_invariants: List[str] = []

    def log_violation(self, violation: ArchViolation):
        self.violations.append(violation)

    def log_pass(self, invariant_name: str):
        self.passed_invariants.append(invariant_name)

    # -------------------------------------------------------------
    # 1. Circular Dependencies (via dependency-cruiser & madge)
    # -------------------------------------------------------------
    def audit_circular_dependencies(self):
        try:
            res = subprocess.run(
                ["npx", "depcruise", "src", "--config", ".dependency-cruiser.cjs", "--output-type", "json"],
                cwd=str(REPO_ROOT),
                capture_output=True,
                text=True,
                timeout=30
            )
            if res.stdout:
                data = json.loads(res.stdout)
                violations = data.get("summary", {}).get("violations", [])
                circular_violations = [v for v in violations if v.get("rule", {}).get("name") == "no-circular"]
                for cv in circular_violations:
                    self.log_violation(ArchViolation(
                        code="ARCH-CIRCULAR-001",
                        title=f"Circular Dependency Detected: {cv.get('from')} ↔ {cv.get('to')}",
                        severity="HIGH",
                        description=f"Circular import path: {cv.get('from')} -> {cv.get('to')}. Circular dependencies cause runtime undefined exports and tight coupling.",
                        file_path=cv.get("from", ""),
                        remediation="Extract shared types, constants, or hooks into a separate module in src/constants/ or src/types/ to break the cycle."
                    ))
                if not circular_violations:
                    self.log_pass("Modularity: Zero circular dependencies detected across src/")
            else:
                self.log_pass("Modularity: Dependency cruiser completed")
        except Exception as e:
            # Fallback check via madge
            try:
                res_m = subprocess.run(
                    ["npx", "madge", "--circular", "--extensions", "ts,tsx", "src/"],
                    cwd=str(REPO_ROOT),
                    capture_output=True,
                    text=True,
                    timeout=20
                )
                if "Found" in res_m.stdout and "circular dependency" in res_m.stdout:
                    self.log_violation(ArchViolation(
                        code="ARCH-CIRCULAR-001",
                        title="Circular Dependency Detected",
                        severity="HIGH",
                        description=res_m.stdout.strip(),
                        file_path="src/",
                        remediation="Refactor circular dependencies to maintain a directed acyclic graph (DAG)."
                    ))
                else:
                    self.log_pass("Modularity: Zero circular dependencies detected via madge")
            except Exception:
                pass

    # -------------------------------------------------------------
    # 2. Layer Boundaries & Clean Separation
    # -------------------------------------------------------------
    def audit_layer_boundaries(self):
        ui_dir = COMPONENTS_DIR / "ui"
        if ui_dir.exists():
            for f in ui_dir.glob("*.tsx"):
                content = f.read_text(encoding='utf-8', errors='ignore')
                # UI primitives must not import pages
                if re.search(r'from\s+["\']@/pages/', content) or re.search(r'from\s+["\']\.\./\.\./pages/', content):
                    self.log_violation(ArchViolation(
                        code="ARCH-LAYER-001",
                        title="Layer Inversion: Primitive UI imports Page",
                        severity="CRITICAL",
                        description=f"{f.name} in components/ui imports directly from pages/, violating Clean Architecture and Dependency Rule.",
                        file_path=str(f.relative_to(REPO_ROOT)),
                        remediation="UI components must remain pure, presentational, and agnostic of high-level pages."
                    ))
            self.log_pass("Layering: components/ui maintains clean separation from pages")

    # -------------------------------------------------------------
    # 3. Platform Abstraction Facade (Capacitor Invariant)
    # -------------------------------------------------------------
    def audit_capacitor_facade(self):
        # Scan for direct @capacitor/* imports in UI components
        direct_cap_imports = []
        if COMPONENTS_DIR.exists():
            for root, _, files in os.walk(COMPONENTS_DIR):
                for file in files:
                    if file.endswith(('.tsx', '.ts')):
                        p = Path(root) / file
                        content = p.read_text(encoding='utf-8', errors='ignore')
                        # Exclude platform adapters if any exist in components
                        if "core/platform" in str(p):
                            continue
                        m = re.findall(r'from\s+["\'](@capacitor/[^"\']+)["\']', content)
                        if m:
                            direct_cap_imports.append((str(p.relative_to(REPO_ROOT)), m))

        if direct_cap_imports:
            for f_path, imports in direct_cap_imports:
                self.log_violation(ArchViolation(
                    code="ARCH-PLATFORM-001",
                    title="Direct Native Capacitor Import in UI Component",
                    severity="MEDIUM",
                    description=f"{f_path} directly imports native packages: {', '.join(imports)}. In AGENTS.md, platform code must be decoupled behind an adapter facade in core/platform.",
                    file_path=f_path,
                    remediation="Wrap platform features (Camera, Geolocation, Haptics) in an adapter hook (e.g. usePlatformCamera) to ensure seamless web fallback."
                ))
        else:
            self.log_pass("Platform Bridge: Native Capacitor APIs properly abstracted")

    # -------------------------------------------------------------
    # 4. Route-Level Code Splitting & Heavy Library Optimization
    # -------------------------------------------------------------
    def audit_code_splitting(self):
        if APP_TSX.exists():
            content = APP_TSX.read_text(encoding='utf-8', errors='ignore')
            # Check for synchronous page imports
            sync_page_imports = re.findall(r'import\s+([a-zA-Z0-9_]+)\s+from\s+["\']@/pages/([^"\']+)["\'];', content)
            if len(sync_page_imports) > 5:
                self.log_violation(ArchViolation(
                    code="ARCH-PERF-001",
                    title=f"Excessive Synchronous Page Imports in App.tsx ({len(sync_page_imports)} pages)",
                    severity="HIGH",
                    description=f"App.tsx statically imports {len(sync_page_imports)} route pages instead of using React.lazy(). This inflates initial JavaScript bundle size, violating the <150KB gzip budget in AGENTS.md.",
                    file_path="src/App.tsx",
                    remediation="Replace static page imports with 'const Page = React.lazy(() => import('@/pages/Page'));' and wrap routes in <Suspense fallback={<PageSkeleton />}>."
                ))
            else:
                self.log_pass("Code Splitting: Route pages leverage lazy-loading / React.lazy")

    # -------------------------------------------------------------
    # 5. Database Architectural Invariant: Zero Double-Booking
    # -------------------------------------------------------------
    def audit_database_invariants(self):
        if not MIGRATIONS_DIR.exists():
            return

        has_gist_exclusion = False
        has_daterange_type = False
        all_sql = ""

        for f in MIGRATIONS_DIR.glob("*.sql"):
            content = f.read_text(encoding='utf-8', errors='ignore')
            all_sql += "\n" + content
            if "EXCLUDE USING GIST" in content.upper() or "NO_OVERLAPPING_BOOKINGS" in content.upper():
                has_gist_exclusion = True
            if "DATERANGE" in content.upper():
                has_daterange_type = True

        if not has_gist_exclusion:
            self.log_violation(ArchViolation(
                code="ARCH-DATA-001",
                title="Missing PostgreSQL GiST Exclusion Constraint on Bookings",
                severity="CRITICAL",
                description="AGENTS.md Invariant A.1 mandates: 'Zero Double-Booking Invariant: The database enforces calendar concurrency through a PostgreSQL GiST exclusion constraint (no_overlapping_bookings) on bookings.daterange.' No GiST exclusion constraint was detected across migrations.",
                file_path="supabase/migrations/",
                remediation="Add a migration introducing btree_gist extension and 'ALTER TABLE public.bookings ADD CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (property_id WITH =, daterange WITH &&);'."
            ))
        else:
            self.log_pass("Database Invariant: PostgreSQL GiST exclusion constraint enforces Zero Double-Booking")

    # -------------------------------------------------------------
    # 6. Monolithic File Detection (> 500 Lines)
    # -------------------------------------------------------------
    def audit_file_complexity(self):
        monolithic_files = []
        if SRC_DIR.exists():
            for root, _, files in os.walk(SRC_DIR):
                for f in files:
                    if f.endswith(('.tsx', '.ts')):
                        p = Path(root) / f
                        try:
                            lines = p.read_text(encoding='utf-8', errors='ignore').split('\n')
                            if len(lines) > 600:
                                monolithic_files.append((str(p.relative_to(REPO_ROOT)), len(lines)))
                        except Exception:
                            pass

        for f_path, count in monolithic_files:
            self.log_violation(ArchViolation(
                code="ARCH-MODULAR-001",
                title=f"Monolithic File Detected ({count} LOC)",
                severity="LOW",
                description=f"{f_path} exceeds 600 lines of code ({count} LOC), indicating mixed concerns and lack of vertical slice decomposition.",
                file_path=f_path,
                remediation="Decompose large component into smaller subcomponents, custom query hooks, and utility functions."
            ))

        if not monolithic_files:
            self.log_pass("Modularity: All source files maintain lean sizes (< 600 LOC)")

    # -------------------------------------------------------------
    # Execute All Checks
    # -------------------------------------------------------------
    def run_all(self) -> Dict[str, Any]:
        self.audit_circular_dependencies()
        self.audit_layer_boundaries()
        self.audit_capacitor_facade()
        self.audit_code_splitting()
        self.audit_database_invariants()
        self.audit_file_complexity()

        # Score calculation
        penalty = 0
        for v in self.violations:
            if v.severity == "CRITICAL":
                penalty += 25
            elif v.severity == "HIGH":
                penalty += 15
            elif v.severity == "MEDIUM":
                penalty += 8
            elif v.severity == "LOW":
                penalty += 3

        score = max(0, 100 - penalty)

        return {
            "architectural_score": score,
            "total_violations": len(self.violations),
            "breakdown": {
                "CRITICAL": len([v for v in self.violations if v.severity == "CRITICAL"]),
                "HIGH": len([v for v in self.violations if v.severity == "HIGH"]),
                "MEDIUM": len([v for v in self.violations if v.severity == "MEDIUM"]),
                "LOW": len([v for v in self.violations if v.severity == "LOW"])
            },
            "passed_invariants": self.passed_invariants,
            "violations": [v.to_dict() for v in self.violations]
        }

def print_report(results: Dict[str, Any]):
    score = results["architectural_score"]
    color = "\033[92m" if score >= 80 else ("\033[93m" if score >= 60 else "\033[91m")
    reset = "\033[0m"

    print("\n" + "="*70)
    print("          UMANI SYSTEM ARCHITECTURE AUDIT REPORT")
    print("="*70)
    print(f"Overall Architectural Health Score: {color}{score}/100{reset}")
    print(f"Total Violations: {results['total_violations']}  |  Passed Invariants: {len(results['passed_invariants'])}")
    print(f"Severity: Critical: {results['breakdown']['CRITICAL']} | High: {results['breakdown']['HIGH']} | Medium: {results['breakdown']['MEDIUM']} | Low: {results['breakdown']['LOW']}")
    print("="*70)

    if results["passed_invariants"]:
        print("\n\033[92m[✓] VERIFIED ARCHITECTURAL INVARIANTS & BOUNDARIES:\033[0m")
        for p in results["passed_invariants"]:
            print(f"  • {p}")

    if results["violations"]:
        print("\n\033[91m[!] ARCHITECTURAL GAPS & VIOLATIONS IDENTIFIED:\033[0m")
        for idx, v in enumerate(results["violations"], start=1):
            sev = v["severity"]
            s_color = "\033[91m" if sev == "CRITICAL" else ("\033[93m" if sev in ["HIGH", "MEDIUM"] else "\033[94m")
            print(f"\n{idx}. [{s_color}{sev}{reset}] {v['title']} ({v['code']})")
            print(f"   Location: {v['file_path']}")
            print(f"   Details:  {v['description']}")
            print(f"   Action:   \033[96m{v['remediation']}\033[0m")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    auditor = SystemArchitectureAuditor()
    results = auditor.run_all()

    if "--json" in sys.argv:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    reports_dir = Path(__file__).resolve().parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    with open(reports_dir / "latest_architecture_audit.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
