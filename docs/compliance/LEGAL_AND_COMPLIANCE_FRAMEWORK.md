# Agribnv Legal, Compliance & Platform Governance Framework

> **CRITICAL REFERENCE FOR ALL DEVELOPERS AND AGENTS:**  
> This document establishes the mandatory legal, statutory, and regulatory compliance standards for Agribnv.  
> Whenever designing, modifying, or auditing features related to user authentication, personal profiles, booking checkouts, agricultural commerce, media uploads, or terms of use, you **MUST ALWAYS** comply with the invariants documented here.

> [!IMPORTANT]
> **DOCUMENT STATUS: PROPOSED DRAFT — UNDER ACTIVE LEGAL & STAKEHOLDER REVIEW**  
> The policies, statutory interpretations, and liability frameworks documented here represent the working engineering baseline and are currently under active review by legal counsel, executive leadership, and operations. Revisions may occur prior to final production sign-off.

---

## 1. Executive Summary & Legal Classification

Agribnv is an agritourism creator marketplace (*"bed & venture"*) operating primarily in the Philippines while serving both domestic and international travelers. The platform operates across four legal domains:
1. **Digital Matching Marketplace (Intermediary Platform):** Connects independent agricultural hosts with travelers. Agribnv is *not* a hotelier, tour operator, or agricultural employer.
2. **Personal Data Processing Entity:** Governed by the Philippine Data Privacy Act of 2012 (RA 10173) and international privacy frameworks (GDPR/CCPA for global travelers).
3. **Agritourism Venue Coordinator:** Governs stays and experiences on active, working agricultural lands with inherent physical and environmental hazards.
4. **Direct Agricultural Commerce Enabler:** Facilitates transactions for perishable harvests, crops, and artisanal food products.
5. **Creator Social Media Platform:** Hosts short-form user-generated video reels and photo posts with music, intellectual property, and publicity considerations.

---

## 2. Pillar 1: Data Privacy & Mobile Regulatory Compliance

### 2.1 Philippine Data Privacy Act of 2012 (Republic Act No. 10173) & NPC
* **Governing Body:** National Privacy Commission (NPC) of the Philippines.
* **Core Principles:**
  * **Transparency:** Clear "at-set-up" Privacy Notice displayed *prior* to account registration (`/auth`) and on initial mobile app onboarding.
  * **Legitimate Purpose & Proportionality:** Collect only the minimum data necessary for core features. Never collect excessive telemetry without explicit opt-in.
  * **Statutory Data Minimization & Progressive Profiling:**
    * *Initial Sign-Up:* Collect only the minimum necessary credentials: Valid Philippine Mobile Number (`+63 9xx xxx xxxx`) verified via SMS OTP (or Email + Password / Social OAuth), Full Name, Role Selection (`guest` or `host`), and affirmative consent.
    * *Checkout Enrichment:* Defer collection of guest emergency contact information (name, phone number) and party manifest until checkout, justified strictly by farm safety and agritourism hazard compliance.
    * *Host KYC & Accreditation:* Defer collection of government-issued IDs (PhilSys, Passport, Driver's License, UMID), farm titles/RSBSA certs, and banking payout details until the host actively submits a Farm Profile for verification.
* **Statutory Data Subject Rights (Must Be Supported in Code):**
  1. *Right to be Informed:* Transparent explanation of data collected and intended use.
  2. *Right to Access:* Users can view their stored profile, booking history, and reviews.
  3. *Right to Object:* Users can opt out of non-essential marketing, newsletters, or profiling.
  4. *Right to Erasure or Blocking (Right to be Forgotten):* Self-serve deletion of personal profiles and authentication accounts.
  5. *Right to Damages:* Indemnification for verified damages due to inaccurate or unlawfully obtained data.
  6. *Right to Data Portability:* Ability to export profile data in standard format (JSON/CSV).
* **Breach Notification Protocol:**
  * In the event of a verified personal data breach involving sensitive information, the designated Data Protection Officer (DPO) must formally notify the National Privacy Commission and affected users within **72 hours** of breach confirmation.
  * Official DPO contact address: `privacy@agribnv.com`.

### 2.2 Mobile App Store Compliance & BIR Tax Retention Harmonization
* **Apple App Store Review Guideline 5.1.1(v) & RA 10173 Erasure:**
  * Any application allowing users to create an account must also provide a visible, easily discoverable method to **initiate deletion of that account directly within the mobile application**.
  * Deactivation is **not sufficient**. The deletion mechanism must permanently purge or anonymize personal data from `auth.users` and `public.profiles`.
  * *Implementation Rule:* The settings page (`/profile/edit`) must feature a permanent "Delete Account" flow with two-step confirmation.
* **Reconciliation with Philippine Tax Law (RA 11976 - Ease of Paying Taxes Act):**
  * Under the **Ease of Paying Taxes (EOPT) Act (Republic Act No. 11976)**, the Philippine Bureau of Internal Revenue (BIR) mandates that books of accounts and commercial records must be preserved for **five (5) years**.
  * Complete cascade deletion of financial transaction rows (`bookings`, `orders`, `invoices`) would violate statutory tax laws.
  * *Statutory Solution (Anonymization over Cascade Delete):* When an account is deleted, the backend purges `auth.users` and `public.profiles`, but retains historical financial rows with `guest_id = NULL`, customer name masked to `'Deleted Guest'`, and all personal contact numbers/emails erased. Deletion is blocked if there are active, future, or disputed pending bookings.

### 2.3 Mobile Hardware & Sensor Permissions
* **Camera & Photo Roll (`@capacitor/camera`):** Requested just-in-time when a user uploads a farm profile photo, post image, or AgriReel video.
* **Geolocation (`@capacitor/geolocation`):** Requested just-in-time on the Explore/Map page to calculate distance to nearby farms. If denied, the application must gracefully fall back to manual province/search text filtering without disabling map interactivity.

---

## 3. Pillar 2: Agritourism Inherent Hazards & Liability Waivers

### 3.1 Intermediary Marketplace Status
Agribnv is an online platform connecting independent Farm Hosts with Guests. Agribnv:
* Does not own, operate, manage, or control listed farm properties.
* Does not inspect individual kubo huts, cottages, or workshop tools for structural defects.
* Acts purely as a technical communications and booking facilitator.

### 3.2 Inherent Agricultural Risk Doctrine
Working agricultural properties are fundamentally distinct from urban commercial hotels. They contain unavoidable, inherent hazards integral to farming operations:
* **Terrain & Water Hazards:** Unpaved trails, steep terraces, mud, irrigation ditches, fishponds, and slippery riverbanks.
* **Animal Behavior:** Unpredictable behavior of livestock (carabaos, cattle, goats), poultry, guard dogs, native insects, and apiaries (honeybees).
* **Heavy Machinery & Farming Activities:** Active operation of tractors, power tillers, irrigation pumps, crop harvesters, and seasonal application of fertilizers/agrochemicals.
* **Weather & Environmental Elements:** Heat, sudden tropical rainstorms, falling branches, and natural outdoor conditions.

### 3.3 Mandatory Booking Waiver & Assumption of Risk
* **Pre-Booking Gate:** Every booking flow must require the Guest to acknowledge the Agritourism Inherent Risk Waiver before payment/reservation confirmation:
  > *"I understand that [Farm Name] is an active agricultural property. I voluntarily assume all inherent risks of visiting a working farm (including natural terrain, farm animals, and agricultural equipment) and agree to hold the host and Agribnv harmless for ordinary accidents not arising from gross negligence."*
* **Host Verification & Local Accreditation:** Hosts must warrant compliance with local municipal permits, sanitary codes, and where applicable, accreditation guidelines from the Philippine Department of Tourism (DOT) and Department of Agriculture (DA).

---

## 4. Pillar 3: Direct Agricultural Commerce & Food Safety

### 4.1 Perishable Goods & Natural Harvest Realities
* **Seasonal Variations:** Crops, honey, and fresh harvests are living products subject to weather, seasonality, and natural physical variation.
* **Non-Returnable Policy:** Perishable agricultural produce cannot be returned once delivered.
* **24-Hour Damage Claim Window:** Guests reporting spoiled, damaged, or unfulfilled farm produce must submit photographic proof within **24 hours** of delivery to qualify for refunds or re-delivery.

### 4.2 Food Safety & Sanitary Standards
* Hosts selling processed agricultural goods (e.g., bottled honey, fruit preserves, roasted coffee beans, artisanal cacao) warrant compliance with Philippine Food and Drug Administration (FDA) safety guidelines and local municipal sanitary health permits.

---

## 5. Pillar 4: Creator Media, Music & Intellectual Property (AgriReels)

### 5.1 Content Ownership & Platform Distribution License
* **Creator Ownership:** Farmers and creators retain complete copyright over their videos, photos, harvest journals, and text captions.
* **License Grant to Agribnv:** By publishing content to AgriReels or farm feeds, creators grant Agribnv a worldwide, royalty-free, non-exclusive, transferable license to host, transcode, display, and feature the media across the web, mobile apps, and marketing channels.

### 5.2 Right of Publicity & Farm Privacy
* Creators warrant that all recognizable workers, family members, or guests appearing in video reels have given explicit consent to be filmed.
* Content must respect neighboring farm property lines and avoid disclosing sensitive private residential locations without authorization.

### 5.3 Notice-and-Takedown (DMCA / Philippine IP Code)
* Infringing audio tracks, unauthorized videos, or copyrighted materials are subject to immediate takedown upon receipt of a verified claim sent to `legal@agribnv.com`. Infringing content must be disabled within **24 hours**.

---

## 6. Pillar 5: Cancellations, Refunds & Philippine Force Majeure

### 6.1 Standardized Cancellation Tiers
Hosts must select one of three transparent policies for stay bookings:
1. **Flexible:** Full refund if cancelled $>48$ hours before check-in.
2. **Moderate:** Full refund if cancelled $>5$ days before check-in; 50% refund thereafter.
3. **Strict:** Full refund if cancelled $>14$ days before check-in; 50% refund if cancelled $>7$ days before check-in; no refund within 7 days.

### 6.2 Philippine Tropical Weather & Calamity Protocol (Force Majeure)
* **PAGASA Severe Weather Exemption:** In the event that the Philippine Atmospheric, Geophysical and Astronomical Services Administration (PAGASA) raises **Tropical Cyclone Wind Signal No. 2 or higher** over the host farm's municipality or the guest's departure point on the dates of travel:
  * Both Guest and Host are entitled to cancel or reschedule without financial penalty.
  * Agribnv service fees and accommodation charges are 100% refundable.
* **Volcanic & Natural Calamity Exemption:** Extends to active volcanic eruptions, earthquakes, or municipal state of calamity declarations that render access roads impassable.

---

## 7. Mandatory Developer Compliance Checklist

Before committing code or submitting PRs for authentication, profile, booking, or media features, verify compliance against this matrix:

| Feature Area | Required Compliance Mechanism | Failure Condition |
| :--- | :--- | :--- |
| **User Sign-Up (`/auth`)** | Checkbox/Notice linking to Terms of Use & Privacy Policy before submit. | Submitting without active consent link. |
| **Profile Settings (`/profile/edit`)** | Self-serve "Delete Account" button with 2-step confirmation. | Forcing user to email support to delete account (Apple Guideline 5.1.1 rejection). |
| **Stay Checkout** | Mandatory Agritourism Inherent Hazard waiver acknowledgement. | Allowing booking without assuming farm risks. |
| **Product Checkout** | 24-hour perishable reporting policy displayed at order review. | Missing perishable return disclaimer. |
| **Reels Upload Studio** | Content ownership agreement and community safety guideline confirmation. | Uploading without acknowledging IP terms. |
| **Camera / Geolocation** | Decoupled platform bridge with graceful degradation on permission denial. | Blank screen or crash when user denies GPS permission. |

---

## 8. Implementation Gap Analysis & Priority Action Items (Tentative Roadmap)

The following items represent concrete legal and compliance features that are currently **Missing** or **Partially Implemented** in the codebase. These must be addressed as tentative deliverables prior to commercial launch:

### Item 1: In-App Self-Serve Account Deletion & Tax Anonymization
* **Status:** **MISSING** (Priority: **P0 — App Store Blocker**)
* **Current State:** [`EditProfile.tsx`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/pages/EditProfile.tsx) only allows updating name, bio, phone, and avatar. No delete flow exists.
* **Risk:** Rejection under Apple App Store Review Guideline 5.1.1(v) and non-compliance with the Philippine Data Privacy Act (Right to Erasure), coupled with risk of violating the BIR 5-year financial record retention rule under RA 11976 if records are hard-deleted.
* **Tentative Action:**
  1. Add a "Danger Zone" section to `/profile/edit`.
  2. Implement an AlertDialog confirmation modal (*"Are you sure? This will permanently delete your account and profile data"*).
  3. Wire up an account deletion Supabase Edge Function:
     - Verify no pending, active, or disputed future bookings exist (block deletion if true).
     - Safely delete the user's `auth.users` record and cascade to `public.profiles`.
     - Anonymize historical transaction records in `bookings` and `orders` (`guest_id = NULL`, customer billing name masked to `'Deleted Guest'`, contact details purged) to comply with RA 11976.

### Item 2: Booking Form Consent, Agritourism Liability Waiver & Emergency Contact
* **Status:** **PARTIALLY IMPLEMENTED** (Priority: **P0 — Lawsuit Liability Shield**)
* **Current State:** The sign-up form on `/auth` contains Terms/Privacy links, but the reservation button on [`PropertyDetails.tsx`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/pages/PropertyDetails.tsx#L1125-L1133) directly triggers `handleBooking` without any legal affirmation or emergency contact capture.
* **Risk:** Platform exposure to guest slip-and-fall, animal injury, or equipment accident lawsuits due to lack of an explicit, timestamped assumption-of-risk record and missing emergency contact.
* **Tentative Action:**
  1. Mandate Guest Emergency Contact capture (Contact Name, Relationship, Philippine Mobile Number) in the checkout flow.
  2. Place an explicit consent checkbox or clear notice above the "Reserve" button:
     > *"By reserving, you agree to the [Cancellation Policy], the [Agritourism Inherent Risk Waiver], and [Terms of Use]."*
  3. Add a clickable modal displaying the full working farm hazard waiver before final booking confirmation.

### Item 3: Cookie & Local Storage Consent Banner
* **Status:** **MISSING** (Priority: **P1 — Regulatory Transparency**)
* **Current State:** [`Privacy.tsx`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/pages/Privacy.tsx#L66-L74) describes cookie usage, but no UI banner exists to inform visitors upon first landing.
* **Risk:** Failing international transparency expectations (ePrivacy / GDPR for European tourists) and Philippine NPC transparency guidelines.
* **Tentative Action:**
  1. Build a lightweight `CookieConsentBanner` component pinned to the bottom of the viewport.
  2. Explain that UMANI uses strictly functional storage (`sb-*-auth-token`, `sidebar:state`, `agribnv_viewMode`) with an "Accept" button that stores an `agribnv_cookie_consent=true` flag.

### Item 4: Centralized Refund & Cancellation Policy Page
* **Status:** **PARTIALLY IMPLEMENTED** (Priority: **P1 — Consumer Transparency**)
* **Current State:** Cancellation tiers are configured in [`src/types/database.ts`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/types/database.ts#L261-L270) and shown on property cards, but no central page explains rules, service fee refunds, or 24-hr perishable produce claims.
* **Risk:** Consumer protection complaints, chargebacks, and host/guest payment friction.
* **Tentative Action:**
  1. Create a dedicated `/cancellation-policy` route or an expanded, prominent section in `/terms`.
  2. Add a direct link in [`Footer.tsx`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/components/layout/Footer.tsx).
  3. Clearly document:
     - The 3 tier rules (Flexible, Moderate, Strict).
     - The 24-hour photo proof window for spoiled/damaged fresh harvests.
     - The PAGASA Tropical Cyclone Signal No. 2+ full-refund protocol.

### Item 5: Third-Party Embed Transparency & Google Fonts Hardening
* **Status:** **OPTIMIZATION PENDING** (Priority: **P2 — Privacy Hardening**)
* **Current State:** `index.html` loads Google Fonts directly from `fonts.googleapis.com`. `PropertyMap.tsx` fetches map vector tiles from CARTO CDN.
* **Risk:** Transmission of visitor IP addresses to external third parties without disclosure.
* **Tentative Action:**
  1. Disclose CARTO and Google as third-party infrastructure providers in the Privacy Policy.
  2. Self-host Google Fonts (`Poppins`, `Playfair Display`) locally as WOFF2 assets to eliminate external font requests.

### Item 6: Payment Gateway, PCI DSS SAQ A & BIR RR 16-2023 Withholding Compliance
* **Status:** **SPECIFIED IN SPEC-003** (Priority: **P0 — Financial & Regulatory Invariant**)
* **Governing Regulations:** Bangko Sentral ng Pilipinas (BSP Circular No. 1048), PCI Security Standards Council (PCI DSS v4.0), and Bureau of Internal Revenue (BIR RR No. 16-2023).
* **Legal Invariants:**
  1. **BSP-Licensed Aggregator:** All merchant checkout flows operate strictly via licensed BSP Operators of Payment Systems (PayMongo / Xendit Philippines).
  2. **PCI DSS SAQ A Scope Minimization:** UMANI servers and Supabase databases strictly maintain zero exposure to cardholder data (PAN, CVV, PIN). Card tokenization occurs client-side via gateway SDK elements.
  3. **BIR RR 16-2023 Marketplace Withholding:** UMANI acts as a withholding agent on remittances to hosts (1% on 50% of gross remittance, unless annual gross remittance is under ₱500,000 as sworn by the host).
  4. **Ease of Paying Taxes (RA 11976):** Transaction ledgers (`payments`, `escrow_ledger`, `payouts`) are immutable and preserved for 5 years.


