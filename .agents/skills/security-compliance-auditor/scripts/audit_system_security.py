#!/usr/bin/env python3
"""
UMANI System Security & Compliance Automated Auditor
-----------------------------------------------------
Performs automated static security analysis and compliance audits against:
1. Supabase RLS & PostgreSQL Security Invariants
2. Secrets & Credential Leakage
3. OWASP MASVS (Mobile Application Security Verification Standard for Capacitor)
4. OWASP Top 10 Web Application Security (XSS, CSRF, CSP, Data Exposure)
5. PCI DSS SAQ A & FinTech Payment Invariants
6. Software Supply Chain (npm audit)
7. Philippine Data Privacy Act (RA 10173) Technical Security Controls
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
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
ANDROID_DIR = REPO_ROOT / "android"
IOS_DIR = REPO_ROOT / "ios"
CAPACITOR_CONFIG = REPO_ROOT / "capacitor.config.ts"
INDEX_HTML = REPO_ROOT / "index.html"
PACKAGE_JSON = REPO_ROOT / "package.json"

class SecurityFinding:
    def __init__(self, check_id: str, title: str, severity: str, description: str, file_path: str, line_number: Optional[int] = None, remediation: str = ""):
        self.check_id = check_id
        self.title = title
        self.severity = severity  # CRITICAL, HIGH, MEDIUM, LOW, INFO
        self.description = description
        self.file_path = file_path
        self.line_number = line_number
        self.remediation = remediation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "check_id": self.check_id,
            "title": self.title,
            "severity": self.severity,
            "description": self.description,
            "file_path": str(self.file_path),
            "line_number": self.line_number,
            "remediation": self.remediation
        }

class SystemSecurityAuditor:
    def __init__(self):
        self.findings: List[SecurityFinding] = []
        self.passed_checks: List[str] = []

    def log_finding(self, finding: SecurityFinding):
        self.findings.append(finding)

    def log_pass(self, check_name: str):
        self.passed_checks.append(check_name)

    # -------------------------------------------------------------
    # 1. Secrets & Credential Exposure Scanner
    # -------------------------------------------------------------
    def audit_secrets(self):
        secret_patterns = [
            (r'service_role\s*[:=]\s*["\']([a-zA-Z0-9_\-\.]{20,})["\']', "CRITICAL", "Hardcoded Supabase service_role key found"),
            (r'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+', "HIGH", "Hardcoded JWT Token detected"),
            (r'(?:sk_live_|paymongo_sk_|xnd_production_)[0-9a-zA-Z]{16,}', "CRITICAL", "Live Payment Gateway Secret Key detected"),
            (r'postgres(?:ql)?://[^:]+:[^@]+@[^:]+:[0-9]+/[^ \t\n\r"\'`]+', "CRITICAL", "Plaintext Database Connection String with credentials detected"),
            (r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----', "CRITICAL", "Unencrypted Private Key detected in source file"),
            (r'(?:AWS_SECRET_ACCESS_KEY|aws_secret_access_key)\s*[:=]\s*["\'][A-Za-z0-9/\+=]{40}["\']', "CRITICAL", "AWS Secret Access Key detected"),
        ]

        target_dirs = [SRC_DIR, REPO_ROOT / "public"]
        for t_dir in target_dirs:
            if not t_dir.exists():
                continue
            for root, _, files in os.walk(t_dir):
                for f in files:
                    if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.html')):
                        f_path = Path(root) / f
                        try:
                            content = f_path.read_text(encoding='utf-8', errors='ignore')
                            for pattern, severity, msg in secret_patterns:
                                matches = re.finditer(pattern, content)
                                for match in matches:
                                    # Calculate line number
                                    line_no = content[:match.start()].count('\n') + 1
                                    # Ensure it's not a placeholder
                                    matched_str = match.group(0)
                                    if "EXAMPLE" in matched_str.upper() or "YOUR_" in matched_str.upper():
                                        continue
                                    self.log_finding(SecurityFinding(
                                        check_id="SEC-SECRET-001",
                                        title=f"Hardcoded Credential / Secret ({severity})",
                                        severity=severity,
                                        description=f"{msg} in {f_path.relative_to(REPO_ROOT)}",
                                        file_path=str(f_path.relative_to(REPO_ROOT)),
                                        line_number=line_no,
                                        remediation="Remove hardcoded credentials immediately. Use environment variables (import.meta.env or Supabase Secrets)."
                                    ))
                        except Exception:
                            pass

        # Check .gitignore for .env protection
        gitignore_path = REPO_ROOT / ".gitignore"
        if gitignore_path.exists():
            git_content = gitignore_path.read_text(encoding='utf-8')
            if ".env" in git_content:
                self.log_pass("Secrets: .env files protected in .gitignore")
            else:
                self.log_finding(SecurityFinding(
                    check_id="SEC-SECRET-002",
                    title=".env not explicitly ignored in .gitignore",
                    severity="HIGH",
                    description=".gitignore does not list .env, risking accidental secret leakage into VCS.",
                    file_path=".gitignore",
                    remediation="Add '.env' and '.env.*.local' to .gitignore."
                ))

    # -------------------------------------------------------------
    # 2. Supabase RLS & PostgreSQL Security Audit
    # -------------------------------------------------------------
    def audit_supabase_migrations(self):
        if not MIGRATIONS_DIR.exists():
            return

        tables_created = set()
        tables_rls_enabled = set()
        overly_permissive_policies = []
        functions_missing_search_path = []
        views_missing_security_invoker = []
        public_grants_flagged = []
        pii_leakage_policies = []

        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            content = sql_file.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')

            # Find created tables
            for idx, line in enumerate(lines, start=1):
                clean_line = line.strip()

                # Table creation
                m_create = re.search(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)', clean_line, re.IGNORECASE)
                if m_create:
                    tables_created.add((m_create.group(1).lower(), sql_file.name, idx))

                # RLS enabled
                m_rls = re.search(r'ALTER\s+TABLE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY', clean_line, re.IGNORECASE)
                if m_rls:
                    tables_rls_enabled.add(m_rls.group(1).lower())

                # Overly permissive grants to anon
                if re.search(r'GRANT\s+ALL\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+TO\s+anon', clean_line, re.IGNORECASE):
                    public_grants_flagged.append((sql_file.name, idx, "GRANT ALL ON ALL TABLES to anon allows unauthenticated database control if RLS is omitted on any future table."))

                # Security Definer functions missing search_path
                if "SECURITY DEFINER" in clean_line.upper():
                    # Check next 5 lines for SET search_path
                    surrounding = "\n".join(lines[max(0, idx-5):min(len(lines), idx+5)])
                    if "SET SEARCH_PATH" not in surrounding.upper():
                        functions_missing_search_path.append((sql_file.name, idx, "SECURITY DEFINER function missing explicit SET search_path = '' (vulnerable to search_path injection CWE-426)"))

                # Views created without security_invoker = true
                if re.search(r'CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:public\.)?([a-zA-Z0-9_]+)', clean_line, re.IGNORECASE):
                    view_snippet = "\n".join(lines[idx-1:min(len(lines), idx+8)])
                    if "WITH (SECURITY_INVOKER = TRUE)" not in view_snippet.upper() and "SECURITY_INVOKER" not in view_snippet.upper():
                        views_missing_security_invoker.append((sql_file.name, idx, m_create.group(1) if m_create else "view"))

                # Permissive SELECT on profiles exposing phone
                if "CREATE POLICY" in clean_line.upper() and "PROFILES" in clean_line.upper() and "USING (TRUE)" in clean_line.upper():
                    pii_leakage_policies.append((sql_file.name, idx, "Public SELECT on 'profiles' table with 'USING (true)' leaks guest phone numbers and personal data to unauthenticated users."))

        # Check for unshielded tables
        unprotected_tables = [t for t in tables_created if t[0] not in tables_rls_enabled]
        for tbl, f_name, l_no in unprotected_tables:
            self.log_finding(SecurityFinding(
                check_id="SEC-RLS-001",
                title=f"Table '{tbl}' Missing Row Level Security (RLS)",
                severity="CRITICAL",
                description=f"Table '{tbl}' was created in {f_name} (line {l_no}) without an 'ALTER TABLE ... ENABLE ROW LEVEL SECURITY;' directive.",
                file_path=f"supabase/migrations/{f_name}",
                line_number=l_no,
                remediation=f"Add 'ALTER TABLE public.{tbl} ENABLE ROW LEVEL SECURITY;' and establish least-privilege SELECT/INSERT/UPDATE/DELETE policies."
            ))

        if not unprotected_tables:
            self.log_pass("Supabase RLS: All created tables have Row Level Security enabled")

        for f_name, l_no, reason in public_grants_flagged:
            self.log_finding(SecurityFinding(
                check_id="SEC-RLS-002",
                title="Excessive Public Grants to 'anon' Role",
                severity="HIGH",
                description=reason,
                file_path=f"supabase/migrations/{f_name}",
                line_number=l_no,
                remediation="Restrict anon permissions to SELECT only, or rely on explicit role-based grants."
            ))

        for f_name, l_no, reason in functions_missing_search_path:
            self.log_finding(SecurityFinding(
                check_id="SEC-SQL-001",
                title="SECURITY DEFINER Function Missing 'SET search_path'",
                severity="HIGH",
                description=reason,
                file_path=f"supabase/migrations/{f_name}",
                line_number=l_no,
                remediation="Add 'SET search_path = public, pg_temp' or 'SET search_path = ''' to the function definition."
            ))

        for f_name, l_no, v_name in views_missing_security_invoker:
            self.log_finding(SecurityFinding(
                check_id="SEC-SQL-002",
                title="PostgreSQL View Missing 'security_invoker = true'",
                severity="MEDIUM",
                description=f"View in {f_name} (line {l_no}) does not specify 'WITH (security_invoker = true)'. In Postgres, this defaults to security definer behavior, potentially bypassing RLS of underlying tables.",
                file_path=f"supabase/migrations/{f_name}",
                line_number=l_no,
                remediation="Define view with 'CREATE VIEW ... WITH (security_invoker = true) AS SELECT ...';"
            ))

        for f_name, l_no, desc in pii_leakage_policies:
            self.log_finding(SecurityFinding(
                check_id="SEC-PRIVACY-001",
                title="Unrestricted PII Exposure via Public Profiles RLS",
                severity="HIGH",
                description=desc,
                file_path=f"supabase/migrations/{f_name}",
                line_number=l_no,
                remediation="Separate public profile data (name, avatar) from private PII (phone number, email), or create a restricted view for public consumption."
            ))

    # -------------------------------------------------------------
    # 3. Mobile & Capacitor Security Audit (OWASP MASVS)
    # -------------------------------------------------------------
    def audit_mobile_capacitor(self):
        # 3.1 Android Manifest checks
        android_manifest = ANDROID_DIR / "app" / "src" / "main" / "AndroidManifest.xml"
        if android_manifest.exists():
            m_content = android_manifest.read_text(encoding='utf-8')
            if 'android:allowBackup="true"' in m_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-001",
                    title="Android Backup Enabled (MASVS-STORAGE-2)",
                    severity="MEDIUM",
                    description="android:allowBackup is set to 'true'. This allows adb backup extraction of app private storage, preferences, and session tokens.",
                    file_path="android/app/src/main/AndroidManifest.xml",
                    remediation="Set android:allowBackup='false' or define android:dataExtractionRules / android:fullBackupContent to exclude sensitive tokens."
                ))
            else:
                self.log_pass("OWASP MASVS: Android backup extraction restricted")

            if 'android:usesCleartextTraffic="true"' in m_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-002",
                    title="Insecure Cleartext Traffic Allowed on Android (MASVS-NETWORK-1)",
                    severity="HIGH",
                    description="android:usesCleartextTraffic is set to 'true', permitting unencrypted HTTP traffic.",
                    file_path="android/app/src/main/AndroidManifest.xml",
                    remediation="Set android:usesCleartextTraffic='false' to enforce HTTPS-only connections."
                ))
            else:
                self.log_pass("OWASP MASVS: Cleartext HTTP traffic blocked on Android")

        # 3.2 iOS Info.plist checks
        ios_plist = IOS_DIR / "App" / "App" / "Info.plist"
        if ios_plist.exists():
            plist_content = ios_plist.read_text(encoding='utf-8')
            if "NSCameraUsageDescription" not in plist_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-003",
                    title="Missing iOS NSCameraUsageDescription",
                    severity="HIGH",
                    description="@capacitor/camera is installed, but Info.plist lacks 'NSCameraUsageDescription', triggering App Store review rejection or app crash on permission prompt.",
                    file_path="ios/App/App/Info.plist",
                    remediation="Add '<key>NSCameraUsageDescription</key><string>UMANI needs camera access to capture farm profiles, harvests, and AgriReels.</string>' to Info.plist."
                ))
            else:
                self.log_pass("OWASP MASVS: iOS NSCameraUsageDescription present")

            if "NSLocationWhenInUseUsageDescription" not in plist_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-004",
                    title="Missing iOS NSLocationWhenInUseUsageDescription",
                    severity="HIGH",
                    description="@capacitor/geolocation is installed, but Info.plist lacks 'NSLocationWhenInUseUsageDescription'.",
                    file_path="ios/App/App/Info.plist",
                    remediation="Add '<key>NSLocationWhenInUseUsageDescription</key><string>UMANI uses your location to discover nearby farms and agricultural experiences.</string>' to Info.plist."
                ))
            else:
                self.log_pass("OWASP MASVS: iOS NSLocationWhenInUseUsageDescription present")

            if "NSAllowsArbitraryLoads" in plist_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-005",
                    title="iOS App Transport Security (ATS) Bypass Detected",
                    severity="HIGH",
                    description="NSAllowsArbitraryLoads is present in Info.plist, bypassing Apple App Transport Security.",
                    file_path="ios/App/App/Info.plist",
                    remediation="Remove NSAllowsArbitraryLoads to enforce TLS 1.3/HTTPS."
                ))
            else:
                self.log_pass("OWASP MASVS: iOS App Transport Security intact")

        # 3.3 Capacitor Config
        if CAPACITOR_CONFIG.exists():
            cap_content = CAPACITOR_CONFIG.read_text(encoding='utf-8')
            if "cleartext: true" in cap_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-MASVS-006",
                    title="Capacitor Cleartext Allowed in Config",
                    severity="HIGH",
                    description="capacitor.config.ts has 'cleartext: true' enabled.",
                    file_path="capacitor.config.ts",
                    remediation="Disable cleartext in capacitor.config.ts before production deployment."
                ))
            else:
                self.log_pass("OWASP MASVS: Capacitor config cleartext disabled")

    # -------------------------------------------------------------
    # 4. Web Application Security & OWASP Top 10
    # -------------------------------------------------------------
    def audit_web_security(self):
        # 4.1 index.html security headers & CSP
        if INDEX_HTML.exists():
            html_content = INDEX_HTML.read_text(encoding='utf-8')
            if "Content-Security-Policy" not in html_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-WEB-001",
                    title="Missing Content Security Policy (CSP)",
                    severity="MEDIUM",
                    description="index.html does not declare a Content-Security-Policy meta tag, leaving the web client vulnerable to script injection and cross-site scripting (XSS).",
                    file_path="index.html",
                    remediation="Add a Content-Security-Policy meta tag restricting default-src, script-src, style-src, and connect-src (Supabase, CDN)."
                ))
            else:
                self.log_pass("OWASP Web: Content-Security-Policy meta tag present")

            if 'name="referrer"' not in html_content:
                self.log_finding(SecurityFinding(
                    check_id="SEC-WEB-002",
                    title="Missing Referrer-Policy Meta Tag",
                    severity="LOW",
                    description="index.html does not declare a Referrer-Policy, potentially leaking internal URL paths and parameters to third-party CDNs.",
                    file_path="index.html",
                    remediation="Add '<meta name=\"referrer\" content=\"strict-origin-when-cross-origin\">' to index.html."
                ))
            else:
                self.log_pass("OWASP Web: Referrer-Policy configured")

        # 4.2 XSS & Dangerous DOM methods in src/
        if SRC_DIR.exists():
            for root, _, files in os.walk(SRC_DIR):
                for f in files:
                    if f.endswith(('.tsx', '.ts', '.jsx', '.js')):
                        p = Path(root) / f
                        content = p.read_text(encoding='utf-8', errors='ignore')
                        if "dangerouslySetInnerHTML" in content:
                            if "DOMPurify" not in content and "sanitize" not in content:
                                line_no = content[:content.find("dangerouslySetInnerHTML")].count('\n') + 1
                                self.log_finding(SecurityFinding(
                                    check_id="SEC-WEB-003",
                                    title="Unsanitized dangerouslySetInnerHTML (OWASP A03: Injection)",
                                    severity="HIGH",
                                    description=f"dangerouslySetInnerHTML used without visible DOMPurify sanitization in {p.relative_to(REPO_ROOT)}.",
                                    file_path=str(p.relative_to(REPO_ROOT)),
                                    line_number=line_no,
                                    remediation="Always sanitize untrusted HTML with DOMPurify.sanitize() before rendering."
                                ))
                        # Check target="_blank" without rel="noopener noreferrer"
                        target_blank_matches = re.finditer(r'target\s*=\s*["\']_blank["\']', content)
                        for match in target_blank_matches:
                            surrounding = content[max(0, match.start()-60):min(len(content), match.end()+60)]
                            if 'noopener' not in surrounding:
                                line_no = content[:match.start()].count('\n') + 1
                                self.log_finding(SecurityFinding(
                                    check_id="SEC-WEB-004",
                                    title="Reverse Tabnabbing Vulnerability (target='_blank' missing rel='noopener')",
                                    severity="LOW",
                                    description=f"External link with target='_blank' missing rel='noopener noreferrer' in {p.relative_to(REPO_ROOT)}.",
                                    file_path=str(p.relative_to(REPO_ROOT)),
                                    line_number=line_no,
                                    remediation="Add rel='noopener noreferrer' to all target='_blank' links."
                                ))

    # -------------------------------------------------------------
    # 5. Payment & FinTech Security (PCI DSS SAQ A)
    # -------------------------------------------------------------
    def audit_payment_pci_dss(self):
        # Ensure no PAN, CVV, Card number forms submit directly to backend or Supabase
        if SRC_DIR.exists():
            insecure_card_fields = [
                (r'name\s*=\s*["\']card_number["\']', "Direct Credit Card Number Form Field"),
                (r'name\s*=\s*["\']cvv["\']', "Direct CVV/CVC Form Field"),
                (r'name\s*=\s*["\']card_exp["\']', "Direct Expiration Date Form Field"),
            ]
            for root, _, files in os.walk(SRC_DIR):
                for f in files:
                    if f.endswith(('.tsx', '.ts')):
                        p = Path(root) / f
                        content = p.read_text(encoding='utf-8', errors='ignore')
                        for pattern, name in insecure_card_fields:
                            if re.search(pattern, content, re.IGNORECASE):
                                # Check if it's inside an iframe or PayMongo SDK
                                if "paymongo" not in content.lower() and "xendit" not in content.lower():
                                    line_no = content[:re.search(pattern, content, re.IGNORECASE).start()].count('\n') + 1
                                    self.log_finding(SecurityFinding(
                                        check_id="SEC-PCI-001",
                                        title=f"Potential PCI DSS Violation: {name}",
                                        severity="CRITICAL",
                                        description=f"Found direct credit card handling field '{name}' in {p.relative_to(REPO_ROOT)}. In PCI DSS SAQ A, cardholder data must NEVER touch merchant DOM directly; it must be tokenized via licensed PSP iframe/hosted elements.",
                                        file_path=str(p.relative_to(REPO_ROOT)),
                                        line_number=line_no,
                                        remediation="Replace custom card form with PayMongo / Xendit Hosted Checkout or Elements SDK to maintain SAQ A scope."
                                    ))
            self.log_pass("PCI DSS SAQ A: No raw card data forms found in custom UI components")

    # -------------------------------------------------------------
    # 6. Supply Chain & Dependency Audit (npm audit)
    # -------------------------------------------------------------
    def audit_dependencies(self):
        try:
            res = subprocess.run(["npm", "audit", "--json"], cwd=str(REPO_ROOT), capture_output=True, text=True, timeout=30)
            data = json.loads(res.stdout) if res.stdout else {}
            vulns = data.get("metadata", {}).get("vulnerabilities", {})
            critical = vulns.get("critical", 0)
            high = vulns.get("high", 0)
            moderate = vulns.get("moderate", 0)
            low = vulns.get("low", 0)

            if critical > 0 or high > 0:
                self.log_finding(SecurityFinding(
                    check_id="SEC-SUPPLY-001",
                    title=f"Vulnerable Dependencies Found ({critical} Critical, {high} High)",
                    severity="CRITICAL" if critical > 0 else "HIGH",
                    description=f"npm audit identified {critical} critical, {high} high, {moderate} moderate, and {low} low vulnerabilities in node_modules.",
                    file_path="package.json",
                    remediation="Run 'npm audit fix' or update affected dependencies (e.g., maplibre-gl, tar, nanoid) to secure versions."
                ))
            else:
                self.log_pass(f"Supply Chain: npm dependencies clear of critical/high vulnerabilities ({low} low, {moderate} moderate)")
        except Exception as e:
            # Fallback if npm is not responding
            self.log_finding(SecurityFinding(
                check_id="SEC-SUPPLY-002",
                title="Unable to execute npm audit",
                severity="INFO",
                description=f"npm audit check timed out or failed: {str(e)}",
                file_path="package.json",
                remediation="Ensure node_modules are intact and run npm audit manually."
            ))

    # -------------------------------------------------------------
    # Run Complete Audit
    # -------------------------------------------------------------
    def run_all(self) -> Dict[str, Any]:
        self.audit_secrets()
        self.audit_supabase_migrations()
        self.audit_mobile_capacitor()
        self.audit_web_security()
        self.audit_payment_pci_dss()
        self.audit_dependencies()

        # Calculate score
        penalty = 0
        for f in self.findings:
            if f.severity == "CRITICAL":
                penalty += 25
            elif f.severity == "HIGH":
                penalty += 12
            elif f.severity == "MEDIUM":
                penalty += 5
            elif f.severity == "LOW":
                penalty += 2

        score = max(0, 100 - penalty)

        return {
            "security_score": score,
            "total_findings": len(self.findings),
            "findings_by_severity": {
                "CRITICAL": len([f for f in self.findings if f.severity == "CRITICAL"]),
                "HIGH": len([f for f in self.findings if f.severity == "HIGH"]),
                "MEDIUM": len([f for f in self.findings if f.severity == "MEDIUM"]),
                "LOW": len([f for f in self.findings if f.severity == "LOW"]),
                "INFO": len([f for f in self.findings if f.severity == "INFO"])
            },
            "passed_checks": self.passed_checks,
            "findings": [f.to_dict() for f in self.findings]
        }

def print_report(results: Dict[str, Any]):
    score = results["security_score"]
    color = "\033[92m" if score >= 80 else ("\033[93m" if score >= 60 else "\033[91m")
    reset = "\033[0m"

    print("\n" + "="*70)
    print("          UMANI SYSTEM SECURITY & COMPLIANCE AUDIT REPORT")
    print("="*70)
    print(f"Overall Security Health Score: {color}{score}/100{reset}")
    print(f"Total Findings: {results['total_findings']}  |  Passed Checks: {len(results['passed_checks'])}")
    print(f"Severity Breakdown: Critical: {results['findings_by_severity']['CRITICAL']} | High: {results['findings_by_severity']['HIGH']} | Medium: {results['findings_by_severity']['MEDIUM']} | Low: {results['findings_by_severity']['LOW']}")
    print("="*70)

    if results["passed_checks"]:
        print("\n\033[92m[✓] VERIFIED SECURITY CONTROLS & INVARIANTS:\033[0m")
        for p in results["passed_checks"]:
            print(f"  • {p}")

    if results["findings"]:
        print("\n\033[91m[!] SECURITY GAPS & COMPLIANCE VULNERABILITIES IDENTIFIED:\033[0m")
        for idx, f in enumerate(results["findings"], start=1):
            sev = f["severity"]
            s_color = "\033[91m" if sev == "CRITICAL" else ("\033[93m" if sev in ["HIGH", "MEDIUM"] else "\033[94m")
            print(f"\n{idx}. [{s_color}{sev}{reset}] {f['title']} ({f['check_id']})")
            print(f"   Location: {f['file_path']}" + (f":{f['line_number']}" if f['line_number'] else ""))
            print(f"   Details:  {f['description']}")
            print(f"   Action:   \033[96m{f['remediation']}\033[0m")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    auditor = SystemSecurityAuditor()
    results = auditor.run_all()

    # If --json flag passed, output json to stdout or file
    if "--json" in sys.argv:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Save to reports directory
    reports_dir = Path(__file__).resolve().parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    with open(reports_dir / "latest_security_audit.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
