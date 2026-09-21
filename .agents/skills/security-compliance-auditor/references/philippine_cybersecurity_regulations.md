# Philippine Cybersecurity & Data Protection Regulations

This document sets forth the statutory cybersecurity requirements, data protection mandates, and incident response obligations governing UMANI under Philippine Law.

---

## 1. Philippine Data Privacy Act of 2012 (RA 10173) & NPC Circular 16-01

The National Privacy Commission (NPC) enforces mandatory organizational, physical, and technical security measures for personal information controllers and processors.

### 1.1 Technical Security Measures (NPC Circular 16-01, Section 27)
1. **Encryption Standards:**
   * Sensitive Personal Information (passwords, government IDs, phone numbers, payment tokens) MUST be encrypted:
     * In transit: TLS 1.3 / TLS 1.2 minimum. Unencrypted HTTP is prohibited.
     * At rest: Advanced Encryption Standard (AES-256) minimum on database volumes and storage buckets.
2. **Access Control & Multi-Factor Authentication (MFA):**
   * Access to production databases and Supabase dashboards must require Multi-Factor Authentication (TOTP or Hardware Security Key).
   * Host and guest role privileges must follow the Principle of Least Privilege via Row Level Security (RLS).
3. **Audit Logging & Tamper Resistance:**
   * Technical logs of authentication attempts, profile edits, admin actions, and financial transactions must be retained for at least one (1) year.
   * Access logs must record: user ID, timestamp, IP address, and operation performed.

### 1.2 Statutory 72-Hour Breach Notification Protocol (NPC Circular 16-03)
* In the event of a security incident involving unauthorized acquisition, alteration, or exposure of sensitive personal information:
  1. **Triage & Containment:** Immediate incident response team activation to isolate the affected vector.
  2. **Notification Mandate:** If the breach involves sensitive personal information or poses high risk to data subjects, the Data Protection Officer (DPO) MUST formally notify the National Privacy Commission and affected users within **72 hours** of confirmation.
  3. **Official DPO Channel:** `privacy@agribnv.com`.

---

## 2. Cybercrime Prevention Act of 2012 (RA 10175)

* Prohibits illegal access, data interference, system interference, misuse of devices, and computer-related fraud.
* **Platform Invariant:**
  * Implement rate limiting on sensitive API endpoints (e.g. login OTP, reservation creation, password reset) to prevent automated credential stuffing and brute-force attacks.
  * Sanitize and validate all user inputs to prevent unauthorized database access or injection.

---

## 3. BSP Circular No. 1048 (Payment Systems Framework)

* Governs Operators of Payment Systems (OPS) and digital merchants facilitating retail electronic transactions in the Philippines.
* **Requirements for UMANI:**
  1. Operate exclusively through BSP-registered and licensed Payment Systems Operators (PayMongo / Xendit).
  2. Maintain immutable transaction trails and dual-stage escrow confirmation to protect both agricultural merchants and retail consumers from settlement default.
  3. Ensure dispute resolution and automated refund mechanisms for severe force majeure cancellations (PAGASA Tropical Cyclone Signal No. 2+).
