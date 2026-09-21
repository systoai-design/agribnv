import os
import re

def audit_migrations():
    print("========================================")
    print("🔍 UMANI DBA AUDITOR: Schema & Migrations Scan")
    print("========================================")

    migrations_dir = "supabase/migrations"
    if not os.path.exists(migrations_dir):
        print(f"❌ Error: Migrations directory '{migrations_dir}' not found.")
        return

    rls_missing = 0
    select_star_count = 0
    gist_found = False

    sql_files = [f for f in os.listdir(migrations_dir) if f.endswith(".sql")]
    
    for filename in sql_files:
        filepath = os.path.join(migrations_dir, filename)
        with open(filepath, "r", encoding="utf-8") as file:
            content = file.read().lower()
            
            # Check for SELECT *
            if re.search(r"select\s+\*", content):
                select_star_count += 1
                
            # Check for GiST booking constraint
            if "gist" in content and "daterange" in content:
                gist_found = True

            # Crude check: if CREATE TABLE exists, check if ENABLE ROW LEVEL SECURITY exists
            # Note: This is a static heuristic.
            create_table_matches = len(re.findall(r"create\s+table", content))
            rls_matches = len(re.findall(r"enable\s+row\s+level\s+security", content))
            
            if create_table_matches > rls_matches:
                rls_missing += (create_table_matches - rls_matches)

    print(f"\n[+] Scanned {len(sql_files)} SQL migration files.")
    
    print("\n[!] Structural Analysis:")
    if select_star_count > 0:
        print(f"  ⚠️ WARNING: Found {select_star_count} instances of 'SELECT *'. Avoid this in production views/functions to reduce memory I/O.")
    else:
        print("  ✅ PASS: No 'SELECT *' anti-patterns found.")

    if rls_missing > 0:
        print(f"  ⚠️ WARNING: Potentially missing ENABLE ROW LEVEL SECURITY on {rls_missing} tables.")
    else:
        print("  ✅ PASS: RLS appears to be enabled across created tables.")

    if gist_found:
        print("  ✅ PASS: GiST exclusion constraints for calendar concurrency detected.")
    else:
        print("  ❌ CRITICAL: Missing GiST exclusion constraint (no_overlapping_bookings) for calendar concurrency.")

    print("\n========================================")
    print("🎯 DBA RECOMMENDATION: Always verify performance with EXPLAIN ANALYZE in production.")
    print("========================================\n")

if __name__ == "__main__":
    audit_migrations()
