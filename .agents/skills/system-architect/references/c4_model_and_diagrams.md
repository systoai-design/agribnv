# The C4 Model & Mermaid Architecture Diagrams

The **C4 Model** (created by Simon Brown) is an industry-standard, lightweight hierarchical framework for describing software architecture at different levels of abstraction: **Context**, **Containers**, **Components**, and **Code**.

---

## 1. Level 1: System Context Diagram

The System Context diagram is a bird's-eye view showing how the software system fits into the broader world, including users and external systems.

### UMANI System Context (Mermaid)
```mermaid
flowchart TD
    Guest["Traveler / Guest (Web & Mobile)"]
    Host["Farm Host / Farmer (Web & Mobile)"]
    Admin["UMANI Operations & DPO"]

    UMANI["UMANI Platform\n(Agritourism & Farm Commerce Engine)"]

    PSP["BSP-Licensed Payment Gateway\n(PayMongo / Xendit Philippines)"]
    PAGASA["PAGASA Severe Weather API\n(Force Majeure Weather Feed)"]
    Maps["Mapping CDN & Geocoding\n(MapLibre / CARTO)"]
    SMS["Telco SMS Gateway\n(OTP & Dispatch Alerts)"]

    Guest -->|"Discovers farms, books stays, buys produce"| UMANI
    Host -->|"Manages farm profile, availability, inventory"| UMANI
    Admin -->|"Compliance audits, dispute moderation"| UMANI

    UMANI -->|"Tokenized payments & escrow release"| PSP
    UMANI -->|"Fetches tropical cyclone wind signals"| PAGASA
    UMANI -->|"Renders vector map tiles"| Maps
    UMANI -->|"Sends booking & verification SMS"| SMS
```

---

## 2. Level 2: Container Diagram

A Container diagram zooms into the software system, showing the high-level technical building blocks (web frontend, mobile container, serverless functions, database) and how they communicate.

### UMANI Containers (Mermaid)
```mermaid
flowchart TD
    subgraph ClientLayer["Client Tier (Hybrid Web & Mobile)"]
        WebApp["Web Application\n(React 18, Vite, Tailwind CSS)"]
        MobileApp["Native Mobile Shell\n(iOS & Android via Capacitor 8)"]
    end

    subgraph BaaSLayer["Backend-as-a-Service Tier (Supabase)"]
        Kong["API Gateway (Kong)\nTLS 1.3 Termination, Auth Routing"]
        Postgres[("PostgreSQL 15 Database\n- GiST Calendar Constraints\n- Row Level Security (RLS)\n- Escrow & Transaction Ledgers")]
        EdgeFunctions["Edge Functions (Deno / TS)\n- Webhook HMAC Validation\n- Pagasa Signal Poller\n- Account Deletion & Tax Masking"]
        Storage["Storage Buckets\n- Public (Reels, Photos)\n- Private (Waivers, Permits)"]
        AuthService["GoTrue Auth Service\nJWT, SMS OTP, Phone Auth"]
    end

    subgraph ExternalServices["External Payment & Geo Infrastructure"]
        PSP["PayMongo / Xendit (Escrow & Webhooks)"]
        CARTO["CARTO Map Vector Tiles"]
    end

    WebApp -->|"HTTPS / REST / WebSocket"| Kong
    MobileApp -->|"Capacitor Bridge -> WebApp"| WebApp
    MobileApp -->|"Native Plugins (Camera, Haptics)"| MobileApp

    Kong --> AuthService
    Kong --> Postgres
    Kong --> EdgeFunctions
    Kong --> Storage

    EdgeFunctions -->|"Signed HMAC Webhooks"| PSP
    EdgeFunctions -->|"Service Role mutations"| Postgres
    WebApp -->|"Vector tiles"| CARTO
```

---

## 3. Level 3: Component Diagram (Farm Booking & Escrow Flow)

Component diagrams zoom into an individual container (e.g. Booking Engine & Database) to illustrate internal feature modules, controllers, repositories, and state machines.

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Traveler
    participant UI as PropertyDetails.tsx
    participant Platform as usePlatformCamera (Core)
    participant Hook as useBookings (Query)
    participant DB as PostgreSQL (bookings)
    participant Edge as Edge Function (Payment Webhook)
    participant PSP as PayMongo / Xendit

    Guest->>UI: Select dates (Check-in, Check-out)
    UI->>Hook: handleReservationSubmit()
    Hook->>DB: INSERT INTO bookings (daterange, status='pending')
    Note over DB: PostgreSQL GiST constraint checks overlapping ranges!
    DB-->>Hook: 201 Created (booking_id)

    UI->>PSP: Mount PayMongo Hosted Elements (Tokenize Card/GCash)
    Guest->>PSP: Authorize Payment (3D Secure 2.0 / OTP)
    PSP-->>UI: Return payment_method_id ("pm_xyz")

    PSP->>Edge: Signed Webhook: payment.paid (HMAC-SHA256)
    Note over Edge: Verify HMAC Signature Header
    Note over Edge: Check processed_webhook_events for Idempotency
    Edge->>DB: UPDATE bookings SET status='confirmed'
    Edge->>DB: INSERT INTO payments (status='held_in_escrow')
    Edge-->>PSP: 200 OK
```

---

## 4. Level 4: Code Diagram (UML / Interface Structure)

Optional level representing fine-grained class structures, adapter interfaces, and entity relationships. In UMANI, code diagrams are typically used to document Platform Adapter Facades (`core/platform`) and TanStack Query key factories.
