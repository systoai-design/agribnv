import os
import json

def analyze_test_coverage():
    print("========================================")
    print("🔍 UMANI QA AUDITOR: Test Coverage Scan")
    print("========================================")

    tests_dir = "src"
    e2e_dir = "e2e"

    unit_tests = 0
    e2e_tests = 0

    if os.path.exists(tests_dir):
        for root, _, files in os.walk(tests_dir):
            unit_tests += sum(1 for f in files if f.endswith(".test.ts") or f.endswith(".test.tsx"))
    
    if os.path.exists(e2e_dir):
        for root, _, files in os.walk(e2e_dir):
            e2e_tests += sum(1 for f in files if f.endswith(".spec.ts"))

    print(f"\n[+] Unit & Component Tests (Vitest): {unit_tests} files found.")
    print(f"[+] End-to-End Tests (Playwright): {e2e_tests} files found.")
    
    # Assess critical paths
    print("\n[!] Critical Path Analysis:")
    if e2e_tests == 0:
        print("  ❌ MISSING: Playwright E2E tests are not configured or missing.")
    else:
        print("  ✅ PASS: Playwright E2E directory present.")

    if unit_tests < 10:
        print("  ⚠️ WARNING: Low unit test coverage detected.")
    else:
        print("  ✅ PASS: Adequate baseline unit tests.")

    print("\n========================================")
    print("🎯 QA RECOMMENDATION: Ensure all 5 pillars of the Discovery Funnel are covered by E2E tests.")
    print("========================================\n")

if __name__ == "__main__":
    analyze_test_coverage()
