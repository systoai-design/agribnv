# Agent Operating Guidelines: UMANI

> **CRITICAL INSTRUCTION FOR ALL AGENTS:**  
> 1. **ABSOLUTE SOURCE OF TRUTH (BRAND & PRODUCT DIRECTION):** You **MUST ALWAYS** refer to the official rebrand PDF: [`docs/brand/UMANI_Rebranding_and_Product_Direction.pdf`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/brand/UMANI_Rebranding_and_Product_Direction.pdf). While technical requirements in `SRS.md` or PRDs may evolve with implementation details, **this specific PDF is the SOLE ABSOLUTE TRUTH** for UMANI's mission (*"Bring the whole farm online"*), the 6 ecosystem pillars, the discovery engine funnel, and farmer-centered philosophy. Never contradict or dilute it. (Note: Landing page drafts/specs are working documents and are not an absolute source of truth).  
> 2. Before designing, refactoring, or implementing any features in this repository, align with [`docs/PRODUCT_VISION_V2.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/PRODUCT_VISION_V2.md) and [`docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md).  
> 3. Whenever touching user data, authentication, checkout, waivers, agricultural products, or creator content, you **MUST ALWAYS comply with [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)**.  
> 4. Refer to the master **[`SRS.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/SRS.md)** and modular PRDs in **[`docs/prd/`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/prd/)** for detailed functional and technical requirements.

---

## 1. Project Context & Vision

UMANI (*UMA* + *ANI*) is a comprehensive agritourism and farmer-centered digital platform:
* **The Mission:** *"UMANI brings the whole farm online."*
* **Core Brand Identity:**
  * **Brand Name:** **UMANI** (*UMA* = Farm/Farmland + *ANI* = Harvest/Produce)
  * **Supporting Tagline:** *"Discover the farm. Follow the story. Experience more."*
  * **Visual Direction:** The *Terraced Light* design philosophy (earth-rooted, editorial typography, natural organic palette: Canopy Green, Sage, Linen/Cream, Terracotta).
* **The 6 Product Pillars:**
  1. **Farm Profile (Digital Home):** The central anchor for farm story, bio, location, terroir, crops/livestock, certifications, and facilities.
  2. **Farm Stay (Hospitality):** Overnight accommodations (kubos, cottages, glamping) with calendar availability and GiST locking.
  3. **Farm Experiences (Hands-On Activities):** Guided tours, harvesting workshops, planting sessions, and masterclasses.
  4. **Events & Schedule (Seasonal Calendar):** Seasonal activities, harvest periods, workshops, and scheduled cohort visits.
  5. **Farm Products (Commerce):** Direct farm offerings (crops, honey, coffee, seeds, artisanal goods).
  6. **Farm Kitchen (Culinary Experience):** Farm-to-table dining, local specialties, seasonal menus, and advance food orders.
* **Discovery Engine (The Farm Feed):**
  * Short-form farmer video reels and photo updates connecting content directly to Farm Profiles, bookings, and products.
  * 5-Stage Funnel: `DISCOVER → EXPLORE → ENGAGE → EXPERIENCE → SUPPORT`.

---

## 2. Mandatory Architectural & Legal Invariants

Whenever you write code, respect these non-negotiable engineering and legal rules:

### A. Preserving Core Infrastructure
1. **Zero Double-Booking Invariant:** The database enforces calendar concurrency through a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `bookings.daterange`. **Do not bypass or disable this constraint.**
2. **Supabase Row-Level Security (RLS):** All tables must maintain strict RLS policies separating public read access from authenticated host/guest mutations.
3. **Capacitor Mobile Bridge:** UMANI runs as both a web app and a native iOS/Android app via Capacitor. Always decouple platform-specific code (safe areas, haptics, camera) behind a clean adapter facade in `core/platform`. Never break native mobile builds in `/ios` and `/android`.

### B. Clean Architecture & Code Quality
1. **Vertical Slices / Feature-Sliced Structure:** Organize new code by domain and feature (`core/`, `domain/`, `entities/`, `features/`, `shared/`) rather than creating monolithic files.
2. **Unified Farm Profile Architecture:** All offerings (stays, experiences, events, products, kitchen menus, posts) must connect back to one unified Farm Profile. Avoid creating disjointed silos.
3. **Server State with TanStack Query v5:** Never use raw `useState` + `useEffect` fetch loops. Use structured Query Hooks and centralized Query Key factories.
4. **Token-Driven Design System:** Never hardcode random hex colors or ad-hoc margins. Use the semantic tokens defined in [`tailwind.config.ts`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/tailwind.config.ts) and [`src/index.css`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/index.css).
5. **Route-Level Code Splitting:** Heavy libraries (`maplibre-gl`, `recharts`) and route pages must be lazy-loaded using `React.lazy()` to maintain an initial bundle under 150 KB gzip.
6. **Perceived Performance & Skeleton Loaders:** Never present jarring blank states or full-page blocking spinners for asynchronous content loading (feed items, reels, property cards, farm profiles). Always utilize skeleton loaders (via [`Skeleton`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/src/components/ui/skeleton.tsx) from `@/components/ui/skeleton`) designed to mirror the exact geometry, aspect ratios, and layout flow of incoming data to eliminate Cumulative Layout Shift (CLS).

### C. Mandatory Legal, Compliance & Privacy Invariants
*(Proposed Baseline — Under Active Legal & Stakeholder Review)*
1. **Philippine Data Privacy Act (RA 10173) & NPC Compliance:** Enforce data minimization. Support statutory Data Subject Rights (access, erasure, export). Mandatory 72-hour breach notification protocol via DPO (`privacy@agribnv.com`).
2. **In-App Account Deletion (Apple Guideline 5.1.1(v)):** User settings (`/profile/edit`) must provide an accessible, functional self-serve account deletion flow that cascades to `auth.users` and personal profile data. Never force users to email support to delete an account.
3. **Agritourism Inherent Hazard Assumption of Risk:** Booking flows must mandate guest acknowledgement of inherent working farm hazards (livestock, machinery, terrain, weather). UMANI maintains intermediary marketplace liability protection.
4. **Direct Agricultural Commerce & Perishables Policy:** Farm product checkout enforces a strict 24-hour spoilage/damage claim window with photo proof for fresh harvests. Processed foods warrant local FDA/sanitary compliance.
5. **Creator UGC Rights & Copyright Takedown:** Creators retain copyright while granting UMANI a non-exclusive distribution license. Maintain a 24-hour response window on verified infringement reports (`legal@agribnv.com`).
6. **PAGASA Severe Weather Force Majeure:** Penalty-free cancellation and 100% refund protocol automatically triggers under PAGASA Tropical Cyclone Warning Signal No. 2+ or municipal natural disaster declarations.

---

## 3. Project Documentation Structure

* **Product Strategy & Vision:** [`docs/PRODUCT_VISION_V2.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/PRODUCT_VISION_V2.md)
* **Legal & Compliance Framework:** [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)
* **Software Requirements Specification:** [`SRS.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/SRS.md)
* **Product Requirements Documents (PRDs):** [`docs/prd/`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/prd/)
* **Technical Specifications:** [`docs/spec/`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/spec/)
* **Database Migrations:** [`supabase/migrations/`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/supabase/migrations/)
