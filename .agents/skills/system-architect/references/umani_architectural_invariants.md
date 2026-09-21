# UMANI Non-Negotiable Architectural Invariants

Every system architect and engineer contributing to UMANI must preserve these 7 foundational architectural invariants. These rules supersede temporary convenience.

---

## Invariant 1: Zero Double-Booking Concurrency (PostgreSQL GiST Constraint)

* **Requirement:** Accommodation calendars must guarantee zero double-booking under concurrent reservation requests.
* **Mechanism:** The database MUST enforce calendar concurrency through a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `bookings.daterange`:
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;

  ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    property_id WITH =,
    daterange WITH &&
  )
  WHERE (status IN ('confirmed', 'pending'));
  ```
* **Prohibition:** Application-level validation (`SELECT ... WHERE NOT EXISTS`) is insufficient due to race conditions. The GiST exclusion constraint must NEVER be disabled or bypassed.

---

## Invariant 2: Supabase Row-Level Security (RLS) Isolation

* **Requirement:** All database tables in schema `public` must have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
* **Client-Server Boundary:**
  - Client-side code operates strictly with the public `anon` or authenticated JWT user credentials.
  - The elevated `service_role` key must NEVER be bundled into frontend or mobile assets.
  - Elevated mutations (escrow release, administrative bans, tax withholding entries) must execute strictly within Supabase Edge Functions.

---

## Invariant 3: Capacitor Platform Adapter Facade

* **Requirement:** UMANI runs simultaneously as a progressive web app and native iOS/Android binaries via Capacitor.
* **Mechanism:**
  - Decouple all native hardware and OS interactions (Camera, Geolocation, Haptics, Push Notifications, App Tracking) behind an adapter facade in `core/platform/`.
  - Leaf UI components must call the platform facade, never `@capacitor/*` directly.
  - Every platform adapter must provide an automatic, graceful web fallback (e.g. standard HTML file input for camera, browser Geolocation API for GPS, silent no-op for haptics).

---

## Invariant 4: Server State Management via TanStack Query v5

* **Requirement:** Never use raw `useState` + `useEffect` fetch loops to retrieve or mutate server data.
* **Standard:**
  - Use structured Query Hooks and centralized Query Key factories (`src/hooks/`).
  - Configure appropriate `staleTime`, `gcTime`, and optimistic UI updates for booking creation and reviews.
  - Prevent duplicate network waterfall requests.

---

## Invariant 5: Token-Driven Design System

* **Requirement:** No hardcoded arbitrary hex codes (e.g. `#156530`, `#2a3b2c`) or random pixel dimensions.
* **Standard:**
  - Always consume semantic tokens defined in `tailwind.config.ts` and `src/index.css`:
    - `bg-primary`, `bg-background`, `text-foreground`, `border-border`.
    - Brand Earth palette: Canopy Green, Sage, Linen/Cream, Terracotta.

---

## Invariant 6: Route-Level Code Splitting & Bundle Budgeting

* **Requirement:** The initial JavaScript bundle must remain lean (< 150 KB gzip) to support travelers and rural farmers accessing UMANI on 3G/4G cellular connections.
* **Mechanism:**
  - Heavy route pages (Explore, PropertyDetails, HostDashboard, EditProperty) must be split using `React.lazy()` and `import()`.
  - Heavy third-party dependencies (`maplibre-gl`, `recharts`, `remotion`) must be isolated and dynamically imported only when required.

---

## Invariant 7: Perceived Performance & CLS-Free Skeleton Loaders

* **Requirement:** Zero Cumulative Layout Shift (CLS) on initial and asynchronous content loading.
* **Mechanism:**
  - Never display blank screens or blocking center spinners during asynchronous data retrieval.
  - Always render skeleton placeholders (`@/components/ui/skeleton`) matching the exact aspect ratio, card dimensions, and layout flow of the resolved UI.
