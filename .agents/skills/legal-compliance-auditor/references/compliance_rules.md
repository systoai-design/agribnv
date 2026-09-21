# Legal and Compliance Framework Rules

This document outlines the legal invariants for UMANI as extracted from `docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`. These rules represent the mandatory engineering baseline.

## 1. Data Privacy & Mobile Regulatory Compliance (RA 10173 & App Store Guidelines)

- **Transparency:** Clear privacy notice required at-set-up (prior to registration on `/auth` and initial mobile app onboarding).
- **Data Minimization:**
  - *Sign-up:* Only collect Mobile Number (OTP verified), Full Name, Role, and consent.
  - *Checkout:* Defer collection of guest emergency contact until checkout.
  - *Host KYC:* Defer collection of IDs, certificates, and bank details until Host submits a Farm Profile.
- **Account Deletion (Apple Guideline 5.1.1(v) & RA 10173 Right to Erasure):**
  - Mobile apps and web settings (`/profile/edit`) must have an in-app "Delete Account" flow.
  - Permanent deletion from `auth.users` and `public.profiles`.
- **Tax Record Retention (RA 11976):**
  - Do NOT cascade delete financial transaction rows (`bookings`, `orders`, `invoices`).
  - Anonymize records: `guest_id = NULL`, name masked to 'Deleted Guest', and contact info erased.
  - Deletion must be blocked if there are active, future, or disputed pending bookings.
- **Permissions:** Request Camera and Geolocation just-in-time, with graceful degradation if denied.

## 2. Agritourism Inherent Hazards & Liability Waivers

- **Booking Waiver & Assumption of Risk:**
  - Every booking flow MUST require the Guest to acknowledge an Agritourism Inherent Risk Waiver before payment/reservation confirmation.
  - Must include capturing Guest Emergency Contact information.

## 3. Direct Agricultural Commerce & Food Safety

- **Perishable Goods Policy:**
  - Fresh harvests and perishable goods are non-returnable.
  - A strict 24-hour damage/spoilage claim window with photographic proof is required.

## 4. Creator Media, Music & Intellectual Property

- **Rights & Ownership:** Creators retain copyright, but grant UMANI a distribution license.
- **Takedown (DMCA/IP Code):** Must support a 24-hour takedown response for verified infringement.
- **Consent:** Creators warrant they have consent from individuals appearing in videos.

## 5. Cancellations, Refunds & Force Majeure

- **Cancellation Tiers:** Hosts choose from Flexible, Moderate, or Strict policies.
- **PAGASA Severe Weather:** Automatic penalty-free cancellation and 100% refund if Tropical Cyclone Wind Signal No. 2 or higher is declared in the guest's departure or host's arrival municipality.

## 6. Payment Gateway & Tax Withholding (PCI DSS & BIR RR 16-2023)

- **PCI DSS SAQ A:** Servers and databases maintain zero exposure to cardholder data. Tokenization occurs client-side.
- **BIR RR 16-2023:** Marketplace acts as a withholding agent on host remittances.
- **BSP Circular 1048:** Checkout must operate via BSP-licensed Operators of Payment Systems.
