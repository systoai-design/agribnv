# UMANI Security Compliance Audit Checklist

Use this checklist during code reviews, PR audits, and architectural evaluations. Every item is mapped to its failure condition and remediation standard.

---

## Audit Checklist

| Layer | Check Item | Invariant / Requirement | Failure Condition |
| :--- | :--- | :--- | :--- |
| **Secrets** | Zero Hardcoded Keys | No API secrets, Supabase `service_role` keys, or database passwords in client files or Git. | Detected `sk_live_`, `service_role`, or plaintext connection strings in `src/` or VCS. |
| **Secrets** | `.gitignore` Hygiene | `.env`, `.env.local`, and key files must be ignored. | Missing `.env` entries in `.gitignore`. |
| **Database** | RLS Enabled Everywhere | Every table created in schema `public` must execute `ENABLE ROW LEVEL SECURITY`. | Any table without explicit RLS directive. |
| **Database** | Least Privilege Policies | Restrict SELECT, INSERT, UPDATE, DELETE to authenticated owners or authorized roles. | Permissive `USING (true)` on UPDATE or DELETE; untrusted INSERT. |
| **Database** | Definer Search Path | `SECURITY DEFINER` functions must define `SET search_path = public, pg_temp` or `SET search_path = ''`. | Function execution vulnerable to search path hijack (CWE-426). |
| **Database** | View Security Invoker | Views exposing user/relational data must declare `WITH (security_invoker = true)`. | View defaults to security definer, bypassing RLS of underlying tables. |
| **Database** | Privilege Minimization | Never grant `GRANT ALL ON ALL TABLES ... TO anon`. | Unauthenticated `anon` role receives administrative table privileges. |
| **Privacy** | PII Column Isolation | Guest and host phone numbers/emails must not be readable via public policies. | `public.profiles` policy allows public SELECT on `phone` column. |
| **Mobile** | Android Backup Restriction | `android:allowBackup` must be set to `false` or restrict sensitive data. | `android:allowBackup="true"` allows `adb backup` extraction of app tokens. |
| **Mobile** | Enforce HTTPS / TLS | Cleartext traffic disabled on Android and iOS ATS intact. | `usesCleartextTraffic="true"` or `NSAllowsArbitraryLoads=true`. |
| **Mobile** | iOS Usage Descriptions | Required keys (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`) must be present in `Info.plist`. | Missing description causes App Store rejection or SIGABRT crash. |
| **Web** | Content Security Policy | `index.html` declares CSP restricting script, style, and connect sources. | Missing CSP leaves app vulnerable to XSS and injection. |
| **Web** | Referrer Policy | `index.html` sets `referrer` to `strict-origin-when-cross-origin`. | Leaking query parameters and internal URLs to third parties. |
| **Web** | Sanitized HTML Rendering | `dangerouslySetInnerHTML` must pass through `DOMPurify.sanitize()`. | Unsanitized user HTML input rendered directly in DOM. |
| **Payment** | PCI DSS SAQ A Isolation | Raw card numbers, CVVs, and expiry dates must never be captured in custom React forms or stored in database. | Custom card form inputs found in React components. |
| **Payment** | Webhook HMAC Verification | Edge functions must verify HMAC-SHA256 signature on all payment gateway webhooks. | Unsigned webhooks accepted, allowing balance or booking spoofing. |
| **Supply Chain**| Vulnerability Management | Run `npm audit` and ensure zero Critical or High unpatched vulnerabilities. | Known exploitable CVEs in direct dependencies. |
