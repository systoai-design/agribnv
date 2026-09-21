# Clean Architecture & Vertical Slice Design for UMANI

This document establishes the code organization, boundary enforcement, and decomposition patterns for UMANI.

---

## 1. Clean Architecture & The Dependency Rule

### 1.1 The Golden Invariant
* **The Dependency Rule:** Source code dependencies must point ONLY inward toward higher-level policies and domain entities.
  - Nothing in an inner circle can know anything about something in an outer circle.
  - UI components in `src/components/ui/` must NEVER depend on specific pages, domain controllers, or database schemas.
  - Domain models must never import from database client drivers or platform bridge libraries.

```
       ┌───────────────────────────────┐
       │   Frameworks & Drivers        │  (Vite, Capacitor, Supabase JS, React DOM)
       │  ┌─────────────────────────┐  │
       │  │   Interface Adapters    │  │  (Platform Adapters, Query Hooks, REST Clients)
       │  │  ┌───────────────────┐  │  │
       │  │  │ Application Rules │  │  │  (Use Cases: Booking Engine, Escrow Lock)
       │  │  │  ┌─────────────┐  │  │  │
       │  │  │  │   Entities  │  │  │  │  (Farm, Stay, Experience, Order, Review)
       │  │  │  └─────────────┘  │  │  │
       │  │  └───────────────────┘  │  │
       │  └─────────────────────────┘  │
       └───────────────────────────────┘
                     ───> Inward Flow of Control
```

---

## 2. Vertical Slice Architecture (Feature-Sliced Design)

Traditional layered architectures slice horizontally (all controllers in one folder, all models in another, all views in another). When a feature changes, developers must touch every layer.

In **Vertical Slice Architecture**, the codebase is organized around business features and domain capabilities.

### 2.1 Directory Structure Hierarchy
```
src/
├── core/                   # Platform abstractions, native bridge adapters, routing guards
│   ├── platform/           # Capacitor facade (Camera, Geolocation, Haptics with Web fallback)
│   ├── storage/            # Secure key-value storage facade
│   └── routing/            # Role-based route guards
├── domain/                 # Core domain models, invariants, and business logic
│   ├── booking/            # Date range logic, cancellation fee calculations
│   └── pricing/            # Commission, taxes, 1% withholding formulas
├── features/               # Vertical slices by capability
│   ├── auth/               # Sign-in, SMS OTP, phone registration
│   ├── farm-profile/       # Unified farm home, terroir, story
│   ├── stays/              # Kubo/cottage booking, calendar GiST integration
│   ├── experiences/        # Harvesting workshops, cohorts, tour bookings
│   ├── feed/               # AgriReels, farm post feeds, video player
│   └── payment/            # Checkout form, escrow status, payment method selection
├── components/
│   ├── ui/                 # Design system primitives (Button, Dialog, Skeleton, Input)
│   └── layout/             # Shell, Header, Navigation, Footer
├── hooks/                  # TanStack Query hooks & factories
└── types/                  # Database schemas and DTOs
```

---

## 3. Modular Decomposition Rules

1. **Keep Leaf UI Components Lean (< 250 LOC):**
   - Presentational components should focus strictly on layout, accessibility, and styling tokens.
   - Extract data fetching into custom TanStack Query hooks.
   - Extract business calculation routines into pure functions in `domain/`.
2. **Prevent Monolithic Page Accumulation:**
   - Any file exceeding 500 lines of code is a candidate for vertical decomposition.
   - When a page contains multiple sections (e.g. `PropertyDetails.tsx` containing Image Gallery, Host Bio, Booking Widget, Amenities Grid, Map, and Reviews), each section must be an independent subcomponent in a feature subfolder.
3. **Circular Dependency Prohibition:**
   - Every module must exist in a Directed Acyclic Graph (DAG).
   - If Module A needs Module B, and Module B needs Module A, extract the shared dependency to a lower-level module (e.g. `src/constants/` or `src/types/`).
