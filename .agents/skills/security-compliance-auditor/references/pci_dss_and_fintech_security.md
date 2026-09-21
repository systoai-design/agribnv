# PCI DSS SAQ A & FinTech Security Architecture

This document governs payment processing, escrow management, webhook security, and regulatory compliance for UMANI's financial infrastructure as established in `SPEC-003`.

---

## 1. PCI DSS v4.0 Scope Minimization (SAQ A)

### 1.1 The SAQ A Invariant
* **Core Rule:** UMANI qualifies for **PCI DSS Self-Assessment Questionnaire A (SAQ A)**, the lowest compliance burden, by entirely outsourcing the handling of cardholder data to a PCI DSS Level 1 certified payment processor (PayMongo / Xendit Philippines).
* **Strict Prohibitions:**
  1. No server or database managed by UMANI or Supabase may ever receive, process, store, or transmit raw Cardholder Data (CHD), Primary Account Numbers (PAN), CVV/CVC codes, or PIN blocks.
  2. No custom React form input elements (e.g. `<input name="card_number">`) may be rendered directly in UMANI's DOM.
* **Approved Method:** Card input fields MUST be served strictly inside hosted payment iframes or Elements provided directly by the PSP's JavaScript SDK. The payment processor returns an opaque token or payment method ID (`pm_...`) directly to the client.

### 1.2 Frontend Tokenization Flow
```
[Guest Browser / App]
      │
      ├─ 1. Interacts with PSP Hosted Form / Element (PayMongo / Xendit)
      │      └── Returns payment_method_id ("pm_12345")
      │
      └─ 2. Sends ONLY payment_method_id + booking_id to UMANI Backend
             └── UMANI initiates server-side payment authorization with PSP
```

---

## 2. Webhook Security & HMAC Verification

### 2.1 Webhook Authenticity & Tamper Prevention
* Payment completion notifications arrive asynchronously from PayMongo/Xendit to Supabase Edge Functions (`/api/webhooks/paymongo`, `/api/webhooks/xendit`).
* **Mandatory HMAC Validation:** Every incoming webhook MUST be cryptographically verified before any booking or escrow state change:
  ```typescript
  // Edge Function Webhook Signature Verification
  import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

  const signatureHeader = req.headers.get("paymongo-signature");
  const rawBody = await req.text();
  const secretKey = Deno.env.get("PAYMONGO_WEBHOOK_SIGNING_SECRET");

  // Verify HMAC-SHA256 signature against raw request body
  const isValid = verifySignature(rawBody, signatureHeader, secretKey);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }
  ```
* **Failure Condition:** Accepting webhooks without HMAC verification allows attackers to spoof payment completion calls, obtaining free bookings or triggering fraudulent host payouts.

### 2.2 Idempotency & Replay Attack Protection
* Webhooks can be resent by payment gateways due to network timeouts.
* **Database Invariant:**
  * Record incoming webhook `event_id` in a dedicated `processed_webhook_events` table with a `PRIMARY KEY` or `UNIQUE` constraint.
  * If the `event_id` is already present, return HTTP 200 OK immediately and abort execution without re-crediting the escrow ledger.

---

## 3. Two-Stage Escrow Ledger Integrity

### 3.1 Immutable Ledger Invariant
* Escrow transactions (`escrow_ledger`, `payouts`) are append-only.
* Never execute `UPDATE` or `DELETE` on financial transaction records. Corrections must be handled via offset adjustments (credit/debit pairs) to maintain an auditable ledger compliant with BIR tax retention (RA 11976).

### 3.2 Automated Host Payout Window
* Guest funds are held in escrow until check-in + 24 hours.
* If a force majeure event (PAGASA Signal No. 2+) or valid dispute is lodged within the 24-hour window, the escrow release is automatically frozen.

---

## 4. BIR RR 16-2023 Withholding Compliance

### 4.1 Marketplace Withholding Obligations
* As an electronic marketplace operator in the Philippines, UMANI is legally required to withhold 1% on 50% of gross remittances (effectively 0.5% of gross) to local merchant hosts, unless the host submits an annual sworn declaration of gross remittances below ₱500,000.
* **Data Invariant:**
  * Host payout computation must store:
    - Gross booking amount
    - Platform service fee
    - Withholding tax amount (BIR Form 2307 ledger reference)
    - Net payout remittance amount
