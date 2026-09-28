# Pending Action: GitHub Organization & Repository Transfer

> **Status:** Pending discussion with boss / stakeholder.

### Details & Recommendations
- **Goal:** Create a dedicated GitHub Organization (e.g. `umani-app` or `umani-ph`) for UMANI product code instead of hosting on personal/collaborator accounts.
- **Why:**
  1. Grants 100% full ownership & admin control to the UMANI team.
  2. Allows fine-grained team member and contractor access control.
  3. Provides official brand URL namespace (`github.com/umani-app/agribnv`).
  4. Keeps CI/CD secrets (Supabase, Vercel) centralized.
- **Next Steps (When Ready):**
  1. Log in to primary GitHub account -> Create Organization (Free Plan).
  2. Create repository `agribnv` under the new Organization.
  3. Update local remote URL: `git remote set-url origin git@github.com:umani-app/agribnv.git`.
  4. Push all branches (`revamp/v2`, `main`).
