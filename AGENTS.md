# Agent Operating Guidelines: Agribnv

> **CRITICAL INSTRUCTION FOR ALL AGENTS:**  
> 1. Before designing, refactoring, or implementing any features in this repository, you **MUST ALWAYS read and align with [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)**.  
> 2. Whenever touching user data, authentication, checkout, waivers, agricultural products, or creator content, you **MUST ALWAYS comply with [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)**.  
> This file contains the official business strategy, pitch deck requirements, product pillars, and legal/statutory compliance rules for Agribnv.

---

## 1. Project Context & Vision

Agribnv is undergoing a comprehensive revamp from the ground up:
* **The Pivot:** Shifting from a transactional rental listing clone (Airbnb-style) to a **social-first agritourism creator marketplace** ("bed & venture") that retains complete booking and hospitality capabilities.
* **Core Brand Identity:**
  * **Tagline:** *"Your Farm. Your Story. Your Market."*
  * **Subtitle:** *"bed & venture"*
  * **Visual Direction:** The *Terraced Light* design philosophy (earth-rooted, editorial typography, natural organic palette: Canopy Green, Sage, Linen/Cream, Terracotta).
* **The 4 Product Pillars:**
  1. **Farm Profile (Identity):** Farm story, farmer bio, location, "what you grow", certifications.
  2. **Products (Commerce):** Direct farm offerings (crops, honey, coffee, seeds, artisanal goods).
  3. **Experiences & Stays (Hospitality):** Day tours, harvesting workshops, and overnight kubo/cottage stays.
  4. **Social & Marketing (Discovery):** Farmer updates, seasonal stories, follower feeds, and community sharing.

---

## 2. Mandatory Architectural & Legal Invariants

Whenever you write code, respect these non-negotiable engineering and legal rules:

### A. Preserving Core Infrastructure
1. **Zero Double-Booking Invariant:** The database enforces calendar concurrency through a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `bookings.daterange`. **Do not bypass or disable this constraint.**
2. **Supabase Row-Level Security (RLS):** All tables must maintain strict RLS policies separating public read access from authenticated host/guest mutations.
3. **Capacitor Mobile Bridge:** Agribnv runs as both a web app and a native iOS/Android app via Capacitor. Always decouple platform-specific code (safe areas, haptics, camera) behind a clean adapter facade in `core/platform`. Never break native mobile builds in `/ios` and `/android`.

### B. Clean Architecture & Code Quality
1. **Vertical Slices / Feature-Sliced Structure:** Organize new code by domain and feature (`core/`, `domain/`, `entities/`, `features/`, `shared/`) rather than creating monolithic files.
2. **Deconstruct God Components:** The legacy monoliths (e.g., [`PropertyDetails.tsx`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/src/pages/PropertyDetails.tsx)) must be decomposed into isolated, testable widgets and domain calculators.
3. **Server State with TanStack Query v5:** Never use raw `useState` + `useEffect` fetch loops. Use structured Query Hooks and centralized Query Key factories.
4. **Token-Driven Design System:** Never hardcode random hex colors or ad-hoc margins. Use the semantic tokens defined in [`tailwind.config.ts`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/tailwind.config.ts) and [`src/index.css`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/src/index.css).
5. **Route-Level Code Splitting:** Heavy libraries (`maplibre-gl`, `recharts`) and route pages must be lazy-loaded using `React.lazy()` to maintain an initial bundle under 150 KB gzip.
6. **Perceived Performance & Skeleton Loaders:** Never present jarring blank states or full-page blocking spinners for asynchronous content loading (feed items, reels, property cards, farm profiles). Always utilize skeleton loaders (via [`Skeleton`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/src/components/ui/skeleton.tsx) from `@/components/ui/skeleton`) designed to mirror the exact geometry, aspect ratios, and layout flow of incoming data to eliminate Cumulative Layout Shift (CLS) and ensure a polished user experience.

### C. Mandatory Legal, Compliance & Privacy Invariants
*(Proposed Baseline — Under Active Legal & Stakeholder Review)*
*(These rules serve as our working implementation baseline pending final legal sign-off)*
1. **Philippine Data Privacy Act (RA 10173) & NPC Compliance:** Enforce data minimization. Support statutory Data Subject Rights (access, erasure, export). Mandatory 72-hour breach notification protocol via DPO (`privacy@agribnv.com`).
2. **In-App Account Deletion (Apple Guideline 5.1.1(v)):** User settings (`/profile/edit`) must provide an accessible, functional self-serve account deletion flow that cascades to `auth.users` and personal profile data. Never force users to email support to delete an account.
3. **Agritourism Inherent Hazard Assumption of Risk:** Booking flows must mandate guest acknowledgement of inherent working farm hazards (livestock, machinery, terrain, weather). Agribnv maintains intermediary marketplace liability protection.
4. **Direct Agricultural Commerce & Perishables Policy:** Farm product checkout enforces a strict 24-hour spoilage/damage claim window with photo proof for fresh harvests. Processed foods warrant local FDA/sanitary compliance.
5. **Creator UGC Rights & Copyright Takedown:** Creators retain copyright while granting Agribnv a non-exclusive distribution license. Maintain a 24-hour response window on verified infringement reports (`legal@agribnv.com`).
6. **PAGASA Severe Weather Force Majeure:** Penalty-free cancellation and 100% refund protocol automatically triggers under PAGASA Tropical Cyclone Warning Signal No. 2+ or municipal natural disaster declarations.

---

## 3. Project Documentation Structure

* **Product Strategy & Vision:** [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)
* **Legal & Compliance Framework:** [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)
* **Software Requirements Specification:** [`SRS.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/SRS.md)
* **Product Requirements Documents (PRDs):** [`docs/prd/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/prd/)
* **Technical Specifications:** [`docs/spec/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/spec/)
* **Database Migrations:** [`supabase/migrations/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/supabase/migrations/)
