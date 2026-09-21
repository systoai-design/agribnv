# Software Requirements Specification (SRS)
## UMANI: The Farmer-Centered Whole-Farm Agritourism Ecosystem ("UMA + ANI")

**Document Version:** 3.1  
**Status:** Approved Baseline (Core Architecture, 6-Pillar Ecosystem, Multi-User RBAC & Compliance Framework)  
**Target Platform:** Web (Desktop & Mobile Responsive) + Native Mobile (iOS & Android via Capacitor)  
**Reference Documents:** 
* **Absolute Source of Truth (Brand & Direction):** [`docs/brand/UMANI_Rebranding_and_Product_Direction.pdf`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/brand/UMANI_Rebranding_and_Product_Direction.pdf)
* [`docs/PRODUCT_VISION_V2.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/PRODUCT_VISION_V2.md)
* [`docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md)
* [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)
* [`docs/prd/`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/prd/)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional, technical, role-based access control, and compliance requirements for **UMANI**. Evolving from the legacy AgriBnV concept, UMANI establishes a **farmer-centered digital platform that brings the whole farm online**—unifying identity, short-form creator discovery, overnight accommodations, day experiences, seasonal events, direct farm produce commerce, and farm kitchen dining into one cohesive ecosystem.

### 1.2 Scope & Brand Meaning
* **UMA:** Farm / farmland / agricultural space.
* **ANI:** Harvest / what the farm produces.
* **Core Idea:** *"UMANI brings the whole farm online."*
* **Supporting Message:** *"Discover the farm. Follow the story. Experience more."*
* **Geographic & Timezone Scope:** UMANI operations, schedules, booking calendars, and real-time events are strictly anchored to the Philippines (`Asia/Manila` / Philippine Standard Time - PHT, UTC+8). All dates and operational turnover hours are calculated in PHT. Dynamic multi-timezone conversion is explicitly out of scope for the current baseline.

UMANI bridges the gap between agricultural producers and travelers/consumers across **six interconnected pillars**:
1. **Farm Profile (Digital Home):** The central aggregator of farm identity, terroir, farmer story, and certified practices.
2. **Farm Stay (Hospitality):** Overnight accommodations (kubos, eco-cottages, glamping) with atomic double-booking prevention.
3. **Farm Experiences (Hands-On Activities):** Guided tours, harvesting runs, planting workshops, and animal sessions.
4. **Events & Schedule (Seasonal Calendar):** Scheduled workshops, harvest festivals, and cohort activities.
5. **Farm Products (Direct Commerce):** Fresh harvests, seeds, artisanal processed goods (honey, tablea, coffee, oils).
6. **Farm Kitchen (Culinary Experience):** Farm-to-table dining, seasonal food menus, and advance food orders.

### 1.3 Definitions & Acronyms
* **Farm Feed:** Short-form video reels (9:16) and photo journals published directly by farmers to drive top-of-funnel discovery.
* **GiST:** Generalized Search Tree (PostgreSQL index used for atomic range exclusion on booking calendars).
* **FSD:** Feature-Sliced Design.
* **OOM:** Out Of Memory (mobile WebView crash condition caused by un-reclaimed video decoders).
* **RLS:** Row-Level Security (PostgreSQL / Supabase policy engine).
* **RBAC:** Role-Based Access Control (`guest`, `host`, `moderator`, `admin`).
* **Host/Farmer:** Verified agricultural producer managing a Farm Profile, listings, products, events, and creator content.
* **Guest/Consumer:** End user discovering farms, following creators, booking stays/events, dining, and buying goods.
* **Moderator:** Platform agent overseeing Trust & Safety, content reviews, and DMCA takedowns.
* **Admin:** System administrator managing platform operations, disputes, credential verification, and financial workflows.

### 1.4 Core Product Principles & The 5-Stage Funnel
1. **Unified Farm Profile Invariant:** All offerings (stays, tours, events, products, food menus, posts) orbit one central Farm Profile. Users explore a complete farm ecosystem rather than disparate product silos.
2. **Discovery Engine Role:** The Farm Feed is *not* social media for its own sake; it is the discovery engine that drives the 5-stage conversion funnel:
   $$\text{DISCOVER} \longrightarrow \text{EXPLORE} \longrightarrow \text{ENGAGE} \longrightarrow \text{EXPERIENCE} \longrightarrow \text{SUPPORT}$$
3. **Evaluation Benchmark:** Every screen and feature must answer: *“What can I discover, experience, and support in this farm?”*

### 1.5 Core Domain Entities
The platform models 11 core domain objects:
1. `Farmer / Host` (Producer credentials, bio, certifications)
2. `Farm` (Physical land, location coordinates, terroir, facilities)
3. `Farm Profile` (Aggregated public digital presence)
4. `Farm Stay` (Lodging units, room rates, calendar availability)
5. `Experience` (Hands-on activities, day tours, workshops)
6. `Event / Schedule` (Scheduled occurrences, harvest calendar, cohort ticketing)
7. `Product` (Harvest crops, seedlings, artisanal goods)
8. `Farm Kitchen / Menu Item` (Farm-to-table dishes, dining pre-orders)
9. `Post / Video` (Short-form creator content)
10. `Follower / User` (Audience follow graph and bookmarks)
11. `Inquiry / Order / Reservation` (Transactions and booking records)

---

### 1.6 User Roles, Personas & Permission Matrix

UMANI defines five distinct user types with strictly segregated permissions enforced at both the client UI layer and backend PostgreSQL Row-Level Security (RLS) policies:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       UMANI USER ROLE TAXONOMY                                         │
├───────────────────────────────────┬───────────────────────────────────┬────────────────────────────────┤
│       1. FARMER / HOST            │      2. AVERAGE USER / GUEST      │     3. MODERATOR (TRUST)       │
│ • Verified Agricultural Producer  │ • Urban Traveler & Eco-Tourist    │ • Content Takedown & Review    │
│ • Farm Profile & Offerings Owner  │ • Foodie & Farm Supporter         │ • Abuse & Safety Enforcement   │
│ • Creator & Media Publisher       │ • Buyer, Booker & Dining Guest    │ • Host Credential Audit        │
├───────────────────────────────────┴───────────────────────────────────┴────────────────────────────────┤
│       4. PLATFORM ADMIN (OPS)     │                    5. ANONYMOUS VISITOR (PUBLIC)                   │
│ • System Configuration & Financial Disputes │ • Unauthenticated Browser (Read-Only Public Exploration) │
│ • Role Assignment & Verification Badges     │ • Landing Page & Public Profiles (Auth Modal on Action)   │
└─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

#### 1.6.1 Farmer / Host (`host` role)
* **Definition:** Verified agricultural producers, landowners, cooperative managers, or farmstead hosts.
* **What They CAN Do:**
  * Create, edit, and manage their unified **Farm Profile** (story, bio, location/coordinates, terroir notes, "What We Grow" crops, livestock, certifications, facilities).
  * List, update, and manage **Farm Stays** (rooms, cottages, kubo huts, glamping, nightly pricing, minimum stays, availability calendar blocks).
  * Create and schedule **Farm Experiences** (hands-on activities, harvesting runs, planting workshops, guided tours).
  * Publish and manage **Events & Schedules** (seasonal festivals, masterclasses, ticket pricing, attendee capacity limits).
  * List and sell **Farm Products** (fresh crops, raw honey, roasted coffee, seeds, seedlings, artisanal goods, inventory counts).
  * Publish **Farm Kitchen Menus** (farm-to-table dishes, homegrown ingredients, dietary tags, advance meal notice).
  * Create and publish **Farm Feed Content** (60-second vertical AgriReels, photo journals, harvest updates).
  * Tag active stays, experiences, events, products, or kitchen dishes into their posts/reels.
  * Accept, decline, or adjust booking reservations, event RSVPs, and kitchen meal pre-orders.
  * Send direct 1-on-1 messages to inquiring travelers and booked guests.
  * Access the **Desktop Creator Studio** and view Host Performance Analytics (views, watch time, booking conversions, revenue).
  * Seamlessly toggle to `guest` view mode within the application to explore, follow, and book other farms without creating a second account.
* **What They CANNOT Do:**
  * Publish reels, posts, or listings on another farmer's profile or tag other farms' listings without authorization.
  * Modify or delete another host's stays, products, events, menus, or financial earnings records.
  * Bypass the PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) to force double-bookings.
  * Access administrative moderation panels, raw system audit logs, or private data of uninvolved users.
  * Falsify verified certifications or bypass automated/manual content moderation scans.

#### 1.6.2 Average User / Consumer (`guest` role)
* **Definition:** Travelers, foodies, eco-tourists, home cooks, local community members, and agricultural supporters.
* **What They CAN Do:**
  * Discover content in the **Farm Feed** across `"For You"` (algorithmic/proximity stream) and `"Following"` (chronological stream).
  * Browse the **Explore** directory with search filters (destination, dates, guest count, price range, subcategories) and interactive split-screen map.
  * View complete **Farm Profiles** across all 6 tabs (Feed, Stays, Experiences, Events, Products, Farm Kitchen).
  * Watch full-screen 9:16 AgriReels (mobile gesture snap or desktop 2-column theater mode).
  * **Engage socially:** Like posts/reels (with heart animation), post comments, bookmark/save items to Wishlists, and share links via Web Share API.
  * **Follow / Unfollow** specific farms to customize their personal feed.
  * **Book accommodations & experiences:** Select dates, calculate transparent costs, affirm the mandatory Agritourism Inherent Hazard Risk Waiver, and submit reservations.
  * **RSVP and buy event tickets** for upcoming workshops and harvest festivals.
  * **Order / Inquire about farm products** and submit 24-hour claims with photo proof for spoiled perishable harvests.
  * **Pre-order Farm Kitchen meals** prior to arrival.
  * Communicate with hosts via real-time 1-on-1 messaging with direct listing/order card attachments.
  * Manage personal account settings, view booking history, write verified stay reviews, export profile data, and perform self-serve account deletion.
  * Apply to elevate account to `host` via `/host/onboarding` if they manage agricultural land.
* **What They CANNOT Do:**
  * Publish short-form video reels or public photo posts to the public Farm Feed (reserved for verified hosts).
  * Create property listings, workshops, products, or kitchen menus.
  * View other users' private bookings, payment methods, or direct chat transcripts.
  * Book stays on blocked or already occupied dates (enforced by GiST locking).
  * Access Creator Studio or host revenue analytics.

#### 1.6.3 Content Moderator / Trust & Safety Officer (`moderator` role)
* **Definition:** Platform compliance and safety operators responsible for enforcing community standards, resolving user reports, and protecting platform integrity.
* **What They CAN Do:**
  * Access the internal **Moderation Queue** to review reported reels, posts, comments, messages, and profile content.
  * Temporarily hide, flag, or permanently delete content violating Community Guidelines (NSFW, hate speech, spam, abusive imagery).
  * Process copyright infringement and DMCA takedown requests submitted to `legal@agribnv.com` within 24 hours.
  * Audit and verify agricultural accreditation documents (e.g. Department of Agriculture or Department of Tourism certifications).
  * Issue official warnings, rate-limit comment frequency, or apply temporary posting suspensions to abusive accounts.
  * Add internal moderation notes and maintain immutable audit logs of moderation actions.
* **What They CANNOT Do:**
  * Alter application source code, deploy infrastructure migrations, or modify database schemas.
  * View unencrypted user passwords or raw credit card credentials.
  * Arbitrate or execute financial escrow payouts without Admin authorization.
  * Delete system audit logs or alter historical booking transaction records.

#### 1.6.4 Platform Administrator / Super Admin (`admin` role)
* **Definition:** Executive leadership, system operations, and financial managers overseeing platform governance.
* **What They CAN Do:**
  * Access the master **Admin Dashboard** with global platform metrics (Gross Merchandise Value, MAUs, conversion rates, regional heatmaps).
  * Assign and revoke user roles (`guest`, `host`, `moderator`, `admin`) via security definer RPC functions.
  * Review host onboarding applications and grant official "Verified Farmer" checkmark badges.
  * Arbitrate escalated disputes, process policy-mandated force majeure refunds (e.g. PAGASA Tropical Cyclone Signal No. 2+), and authorize commission payouts.
  * Configure global platform parameters (service fee percentages, product categories, geographic taxonomy, cancellation policy templates).
  * Supervise legal and regulatory compliance (Philippine DPA RA 10173 data erasure, 72-hour breach dispatch protocol via DPO).
* **What They CANNOT Do:**
  * Perform unlogged administrative actions (all admin RPC calls trigger immutable audit log entries).
  * Export or expose non-anonymized user personal data to unauthorized third parties in violation of RA 10173.

#### 1.6.5 Anonymous / Unauthenticated Visitor (`anon` role)
* **Definition:** Public web visitors or prospective users browsing without an active authenticated session.
* **What They CAN Do:**
  * View the public **Landing Page** and its 8 editorial sections.
  * Browse the public **Explore** grid, category filters, and MapLibre map.
  * View public **Farm Profiles**, farmer stories, and browse public stays, experiences, events, products, and kitchen menus.
  * Watch public AgriReels in read-only mode.
* **What They CANNOT Do:**
  * Like, comment, bookmark, or follow farms (action immediately triggers the Auth modal).
  * Submit booking reservations, RSVP to events, pre-order food, or purchase products.
  * Send direct messages to farmers.
  * Access any host, creator, moderator, or administrative portals.

---

### 1.6.6 Feature Permission & Access Control Matrix

| Feature / Action | Anonymous (`anon`) | Average User (`guest`) | Farmer / Host (`host`) | Moderator (`moderator`) | Super Admin (`admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Browse Landing Page & Public Explore** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **View Farm Profiles & Public Offerings** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Watch AgriReels (Read-Only)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Like, Comment, Follow & Bookmark** | ❌ Auth Required | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Book Stays & Experiences (GiST Locked)**| ❌ Auth Required | ✅ Allowed | ✅ Allowed (Guest Mode) | ❌ Restricted | ❌ Restricted |
| **RSVP / Buy Event Tickets** | ❌ Auth Required | ✅ Allowed | ✅ Allowed (Guest Mode) | ❌ Restricted | ❌ Restricted |
| **Buy Products & Pre-Order Kitchen Meals**| ❌ Auth Required | ✅ Allowed | ✅ Allowed (Guest Mode) | ❌ Restricted | ❌ Restricted |
| **Direct 1-on-1 Chat with Hosts** | ❌ Auth Required | ✅ Allowed | ✅ Allowed | ❌ Restricted | ❌ Restricted |
| **Create / Edit Own Farm Profile** | ❌ Blocked | ❌ Upgrade Req. | ✅ Allowed (Own Only) | ❌ Read Only | ✅ Full Edit |
| **List Stays, Experiences & Events** | ❌ Blocked | ❌ Upgrade Req. | ✅ Allowed (Own Only) | ❌ Read Only | ✅ Full Edit |
| **Publish Products & Kitchen Menus** | ❌ Blocked | ❌ Upgrade Req. | ✅ Allowed (Own Only) | ❌ Read Only | ✅ Full Edit |
| **Publish AgriReels & Photo Journals** | ❌ Blocked | ❌ Upgrade Req. | ✅ Allowed (Own Only) | ❌ Read Only | ✅ Full Edit |
| **Access Creator Studio & Host Analytics**| ❌ Blocked | ❌ Upgrade Req. | ✅ Allowed (Own Only) | ❌ Restricted | ✅ Full Access |
| **Review & Moderate Content Queue** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | ✅ Allowed |
| **Takedown Reported Posts / DMCA** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | ✅ Allowed |
| **Issue Verified Farmer Badges** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Audit Only | ✅ Allowed |
| **Arbitrate Disputes & Force Majeure** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Advisory Only | ✅ Allowed |
| **Assign User Roles & Manage RBAC** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed |
| **In-App Account Deletion (Self-Serve)**| ❌ N/A | ✅ Allowed (Own) | ✅ Allowed (Own) | ✅ Allowed (Own) | ✅ Full Wipe |

---

## 2. System Architecture & Platform Support

### 2.1 Cross-Platform Architecture: Web + Capacitor
The application is built on a single, responsive TypeScript codebase supporting **Desktop Web**, **Mobile Web**, and **Native Mobile (iOS & Android via Capacitor)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT PRESENTATION LAYER                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│             DESKTOP WEB              │       MOBILE (WEB & CAPACITOR)       │
│ • 3-Column Social & Video Layout     │ • Full-Bleed 9:16 Vertical Video     │
│ • Persistent Left Nav & Header       │ • Bottom Navigation Bar (5 Tabs)     │
│ • Split-Screen Map & Listing Grid    │ • Touch Gestures & Haptic Feedback   │
│ • Keyboard Shortcuts & Hover Tooltips│ • Capacitor Safe Area & Camera Bridge │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                       │
                                       ▼ (HTTPS / WSS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE BACKEND CLOUD                             │
├───────────────────┬───────────────────┬──────────────────┬──────────────────┤
│    POSTGRESQL     │   SUPABASE AUTH   │    REALTIME      │     STORAGE      │
│ • Relational DB   │ • JWT Sessions    │ • Live Chat      │ • Image CDN      │
│ • GiST Exclusion  │ • Multi-Role RBAC │ • Feed Broadcast │ • HLS Video CDN  │
│ • Strict RLS      │ • OAuth & Email   │ • Notifications  │ • Signed Uploads │
└───────────────────┴───────────────────┴──────────────────┴──────────────────┘
```

### 2.2 Device-Specific Invariants

#### A. Mobile Devices (iOS & Android via Capacitor & Mobile Web)
* **Touch-First Navigation:** Bottom navigation bar housing 5 primary tabs: `[ Home (Feed) | Explore (Farms/Map) | Reels | Inbox | Profile ]`.
* **Safe-Area Insets:** Dynamic binding of `--sat`, `--sab`, `--sar`, `--sal` via `capacitor-plugin-safe-area`.
* **Hardware Haptics:** Subtle haptic feedback (`Haptics.impact({ style: ImpactStyle.Light })`) on like, bookmark, and reservation actions.
* **WebView Video Memory Management (OOM Prevention):** HTML5 `<video>` decoders in mobile WebViews strictly enforce a **3-slot virtualization window** `[Previous (unloaded), Active (playing), Next (preloading)]`. Scrolled-out video elements immediately invoke `.pause()`, clear `.src = ""`, and call `.load()`.

#### B. Desktop Devices & Website Architecture (Chrome, Safari, Edge, Firefox)
* **Responsive Layout Breakpoints:**
  - **Mobile:** `< 768px` (Single column, bottom navigation bar, full-screen vertical swipe).
  - **Tablet:** `768px – 1024px` (Collapsible sidebar, dual-column cards).
  - **Desktop:** `1024px – 1440px` (3-column layout: 240px persistent left navigation, 640px center stream, 340px right contextual discovery rail).
  - **Wide Desktop:** `> 1440px` (Max container width 1440px centered, expanded right rail with active booking summary).
* **3-Column Canvas:**
  - **Left Navigation Rail:** Persistent sidebar with UMANI logo, tagline (*"Bring the whole farm online"*), primary routes (`Home`, `Explore`, `Farm Feed`, `Saved`, `Messages`), and Creator Studio toggle for verified hosts.
  - **Center Feed Stage:** 640px maximum width for optimal reading and media consumption with infinite scroll pagination.
  - **Right Contextual Rail:** Sticky widgets displaying: *"Recommended Farms to Follow"*, *"Seasonal Harvest Calendar"*, *"Local Farm Weather & Terroir"*, and trending agricultural topics.
* **Dual-Pane Explore View:** Split-screen interface on desktop: left-hand 55% scrollable grid of farm cards with category filters; right-hand 45% interactive MapLibre GL map with custom farm markers.

---

## 3. Functional Requirements

### 3.1 Module 1: Identity & Farm Profile Ecosystem (Priority 1)
* **REQ-PROF-1 (Unified Farm Profile Header):** Every farm shall have a public digital profile displaying:
  - Farm Name, Verified Farmer Badge, Avatar, and 16:5 Panoramic Cover Banner.
  - Farmer Bio, Agricultural Ethos, Location/Terroir, and Coordinates.
  - Follower Count, Following Count, and Total Likes Received.
  - "What We Grow & Produce" category badges (e.g., Heirloom Rice, Mangoes, Arabica Coffee, Raw Honey, Native Pigs).
  - Quick action buttons: `[ Follow / Unfollow ]`, `[ Message Farmer ]`, `[ Share Farm ]`.
* **REQ-PROF-2 (Tabbed Whole-Farm Layout):** Farm Profiles shall unify all 6 ecosystem offerings across structured tabs:
  1. **Feed (Reels & Posts):** Short-form video grid and photo journals of daily farm life.
  2. **Stays:** Overnight accommodations (kubos, cottages, glamping) with nightly rates and availability check.
  3. **Experiences:** Hands-on activities and guided tours with duration and pricing.
  4. **Events:** Seasonal workshops, harvest festivals, and upcoming scheduled events.
  5. **Products:** Direct farm produce, artisanal packaged goods, seeds, and seedlings.
  6. **Farm Kitchen:** Farm-to-table food menus, local specialties, and dining pre-order details.
* **REQ-PROF-3 (Follow & Bookmark Graph):** Authenticated users can follow/unfollow farms with instantaneous optimistic UI updates, streaming updates to their home feed.
* **REQ-PROF-4 (Desktop Website Profile View):** Parallax banner scrolling with sticky sub-navigation tab bar and floating "Visit / Inquire" summary card on the right rail.

### 3.2 Module 2: Home Screen & Discovery Feed (Priority 5)
* **REQ-FEED-1 (Dual-Mode Navigation):** The primary view supports seamless switching between:
  - **Feed Stream (Default):** Farmer-generated video reels and photo updates.
  - **Explore Stream:** Structured farm search, category carousels, filter sheets, and map view.
* **REQ-FEED-2 (Feed Streams):** Within the Feed tab, users can toggle between:
  - **"For You" (Discover):** Curated blend of trending reels, seasonal harvest updates, and featured nearby farms.
  - **"Following":** Reverse-chronological timeline exclusively from followed farms.
* **REQ-FEED-3 (Feed Card Anatomy & Discovery Linking):** Each feed card includes:
  - Farmer header with avatar, farm name, location, and timestamp.
  - Media container (4:5 / 1:1 photo carousel or auto-looping silent video).
  - Caption, agricultural hashtags, and **Tagged Offering Pill** (e.g., `🏡 Stay: Riverside Kubo - ₱1,800/night`, `🍯 Product: Wild Honey - ₱350`, `🍲 Kitchen: Native Chicken Tinola`).
  - Tapping the tagged offering pill routes directly to the specific offering within the Farm Profile.
  - Engagement controls: Like (with animated heart pop), Comment count, Share, and Save/Bookmark.

### 3.3 Module 3: Short-Form Video Engine (AgriReels)
* **REQ-REELS-1 (Mobile & Desktop Viewports):**
  - **Mobile:** Immersive 9:16 vertical viewport with vertical CSS snap-scrolling.
  - **Desktop (Theater Mode):** Split 2-column layout with 9:16 centered video stage against ambient frosted-glass background glow, alongside a 400px panel for caption, comments, and direct booking drawer.
* **REQ-REELS-2 (Interactive Video Overlay):**
  - Action rail: Farmer avatar with quick-follow `+`, Like button with counter, Comment trigger, Share trigger, and Mute/Unmute toggle.
  - Bottom info rail: Farmer handle, caption, background audio title, and **Sticky Commerce Card** (`[ Thumbnail | "Stay at this Kubo - ₱1,800/night" | Book Now ]`).
* **REQ-REELS-3 (Desktop Keyboard Shortcuts Matrix):** `Space`/`K` (Play/Pause), `ArrowDown`/`J` (Next), `ArrowUp` (Prev), `M` (Mute), `L` (Like), `C` (Comment), `B` (Book Stay), `Esc` (Close).

### 3.4 Module 4: Farm Stays & Experiences Booking Engine (Priority 2)
* **REQ-BOOK-1 (Zero Double-Booking Invariant & Connectivity):** The database enforces calendar concurrency through a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `bookings.daterange` anchored in Philippine Standard Time (PHT). All reservations require real-time online validation against the central database to guarantee atomic calendar locking. Offline walk-in booking resolution and asynchronous offline queues are explicitly out of scope for the platform; hosts must use the online interface to manage blocked dates.
* **REQ-BOOK-2 (Interactive Calendar):** Real-time availability calendar displaying blocked dates, active reservations, and price-per-night indicators.
* **REQ-BOOK-3 (Price Breakdown Calculation):** Automatic calculator computing:
  $$\text{Total} = (\text{Base Rate} \times \text{Nights}) + \text{Cleaning Fee} + \text{Service Fee} + \sum \text{Experience Add-ons}$$
* **REQ-BOOK-4 (Booking Drawer & Desktop Modal):** Accessible from Property Details, Feed cards, and Video Reel theater mode.

### 3.5 Module 5: Events & Seasonal Schedule Engine (Priority 3)
* **REQ-EVENT-1 (Event Listings):** Hosts can create scheduled events with Title, Category, Date, Time, Duration, Capacity Limit, and Ticket Price.
* **REQ-EVENT-2 (Seasonal Harvest Calendar):** Visual calendar on Farm Profiles indicating seasonal crop cycles (e.g., *"Mango Harvest Season: March – May"*).
* **REQ-EVENT-3 (Event Booking & RSVP):** Guests can reserve event slots with instant confirmation and automated calendar invites (`.ics`).

### 3.6 Module 6: Direct Farm Products & Farm Kitchen (Priority 4)
* **REQ-PROD-1 (Farm Products Catalog):** Categorized into *Fresh Harvests, Specialty Herbs, Seedlings, and Processed/Artisanal Goods* with 24-hour perishable claim protection.
* **REQ-KITCH-1 (Farm Kitchen Menu):** Hosts can publish their seasonal farm-to-table food menu with ingredient origin, dietary badges, and prices.
* **REQ-KITCH-2 (Advance Meal Orders):** Guests booking a stay or day visit can pre-order farm kitchen meals to allow hosts to harvest fresh ingredients in advance.

### 3.7 Module 7: Public Landing Page & Growth Architecture (Priority 6)
The public landing page (`/landing` or `/`) shall faithfully implement the 8-section layout and copy structure:
* **REQ-LAND-1 (Hero Section):** Headline: *"Bring the whole farm online."* Subhead: *"Discover farmers, farms, experiences, products, events, food, and stories—all in one place."* Dual CTAs: `[ Explore Farms ]` and `[ Join UMANI as a Farmer ]`.
* **REQ-LAND-2 (Philosophy Section):** Header: *"DISCOVER MORE THAN A FARM STAY"*. Copy highlighting that a farm is people, harvest, meals, stories, and experiences.
* **REQ-LAND-3 (Explore the Farm Section):** 6 interactive showcase cards covering Farms, Farm Stays, Experiences, Events, Products, and Farm Kitchen.
* **REQ-LAND-4 (Farm Feed Discovery Section):** Header: *"SEE FARM LIFE AS IT HAPPENS — The Farm Feed"*. Tagline: *"Scroll. Discover. Follow a farm."* with CTA `[ Explore the Farm Feed ]`.
* **REQ-LAND-5 (Multi-Value Section):** Header: *"ONE FARM. MANY POSSIBILITIES."* Verbs: **STAY**, **EXPERIENCE**, **EAT**, **SHOP**, **JOIN**, **FOLLOW**.
* **REQ-LAND-6 (Supply-Side Acquisition Section):** Header: *"FOR FARMERS — Your farm deserves more than a social media post."* CTA: `[ Become a UMANI Farmer ]`.
* **REQ-LAND-7 (Why UMANI Section):** 5 value pillars: **Farmer-First**, **Whole-Farm**, **Discovery-Driven**, **Community-Centered**, **More Ways to Earn**.
* **REQ-LAND-8 (Brand Manifesto & Dual Final CTA):** Manifesto: *"The farm is more than a destination. It is a livelihood, a story, food, culture, knowledge, experience, community, LIFE."* Dual CTAs: `[ Explore Farms ]` and `[ Join UMANI ]`.
* **REQ-LAND-9 (Structured Footer):** Navigation columns (Explore, For Farmers, Company) and sign-off (*"Discover the farm. Follow the story. Experience more."*).

### 3.8 Module 8: Realtime Messaging & Inquiries
* **REQ-MSG-1:** Direct 1-on-1 chat between guests and farmers using Supabase Realtime channels.
* **REQ-MSG-2:** Chat cards can embed a direct reference to a listing, booking reservation, product, or kitchen order.
* **REQ-MSG-3:** Push notifications for mobile (via Capacitor) and Web Push / browser toast notifications for desktop.

### 3.9 Module 9: Desktop Web Creator Studio & Host Management Portal
* **REQ-STUDIO-1:** Drag-and-drop media submission with canvas video thumbnail scrubber.
* **REQ-STUDIO-2:** Offering tagging interface (link stays, experiences, products, or kitchen dishes to posts/reels).
* **REQ-STUDIO-3:** Visual host analytics dashboard tracking views, watch time, profile visits, and conversion to bookings/orders.

### 3.10 Module 10: Authentication, Authorization & Multi-Role RBAC
* **REQ-AUTH-1 (Credential Policy):** NIST SP 800-63B / OWASP-aligned password policy (min 8 chars, 1 uppercase, 1 lowercase, 1 number).
* **REQ-AUTH-2 (Self-Serve Recovery):** Ephemeral single-use token recovery via `supabase.auth.resetPasswordForEmail()` with deep-link handling in Capacitor (`umani://auth/callback`).
* **REQ-AUTH-3 (Multi-Role RBAC Hierarchy & Persona Switcher):**
  - Database table `public.user_roles` maintains user assignments across `guest`, `host`, `moderator`, `admin`.
  - All route guards and UI state transitions are backed by PostgreSQL security definer functions (`public.has_role(user_id, role_name)`).
  - Hosts can switch between `guest` and `host` view mode dynamically via client state (`umani_viewMode`).
* **REQ-AUTH-4 (OAuth 2.1 with PKCE):** Social authentication (Google & Apple Sign-In) using PKCE.
* **REQ-AUTH-5 (1-Click Demo Sandbox):** Demo Guest and Demo Host buttons on `/auth` for instant reviewer access without email quotas.
* **REQ-AUTH-6 (Progressive Sign-Up Architecture & Statutory Data Minimization):**
  - In compliance with the Philippine Data Privacy Act of 2012 (RA 10173) and the SIM Registration Act (RA 11934), UMANI enforces a **Progressive Profiling Model** that strictly avoids collecting excessive data upfront:
  - **Stage 1: User Registration (Frictionless Entry):**
    - Credential: Valid Philippine Mobile Number (`+63 9xx xxx xxxx`) verified via SMS OTP (primary channel) OR Email Address with password / Social OAuth (Google/Apple).
    - Identity: Full Name or Preferred Display Name.
    - Role Intent: Explicit selection of primary role (`guest` for travelers/consumers or `host` for farm owners/managers).
    - Statutory Consent: Unbundled, affirmative checkboxes for [Terms of Service] and [Privacy Policy] (mandatory). Optional opt-in checkbox for seasonal harvest newsletters (default: unchecked).
  - **Stage 2: Guest Checkout Enrichment (Contextual Collection):**
    - Mobile phone number (if registered via email/OAuth) for SMS reservation dispatch and gate check-in.
    - Emergency Contact Name & Phone Number (mandatory under agritourism hazard and safety compliance).
    - Agritourism Inherent Hazard Assumption of Risk affirmative acceptance.
    - Guest Party Manifest (number of guests and names of traveling companions).
  - **Stage 3: Farmer / Host KYC & Accreditation (Before Publishing Listings/Commerce):**
    - Farm Registered Entity / Trade Name.
    - Farm Exact Geographic Address (Barangay, City/Municipality, Province, Zip Code, and GPS Coordinates).
    - Government-Issued ID of Primary Registrant (PhilSys National ID, Philippine Passport, Driver's License, or UMID).
    - Proof of Farm Operations (Department of Agriculture RSBSA Certificate, Land Title / Tax Declaration, Barangay Farming Certificate, or Department of Tourism Farm Tourism Camp Accreditation).
    - Settlement & Payout Account: GCash, Maya mobile wallet, or Philippine commercial bank account (account name must match verified government ID).

### 3.11 Module 11: Payment Gateway, Marketplace Escrow & Host Disbursements (Governed by docs/spec/SPEC-003)
* **REQ-PAY-1 (Tri-Rail Payment Gateway Architecture):**
  - All checkout transactions across UMANI (Farm Stays, Experiences, Events, Harvest Products, and Farm Kitchen) are processed through a Bangko Sentral ng Pilipinas (BSP) licensed Operator of Payment Systems (PayMongo / Xendit Philippines).
  - Checkout engine dynamically supports the three core Philippine payment rails:
    1. **Mobile e-Wallets (GCash & Maya):** Seamless redirect and mobile deep-linking to GCash and Maya authentication screens for instant mobile authorization.
    2. **Credit & Debit Cards (Visa, Mastercard, JCB):** Tokenized card processing with mandatory **3D Secure 2.0 (3DS / OTP)** verification to eliminate unauthorized card fraud and protect hosts from chargebacks.
    3. **Direct Online Banking & Bank Accounts (DOB & QR Ph):** Direct online banking rails for major Philippine commercial banks (BPI, UnionBank, BDO, Metrobank, LandBank) and interoperable **QR Ph** national standard scanning.
* **REQ-PAY-2 (Two-Stage Marketplace Escrow & Anti-Fraud Holding):**
  - To protect guests against deceptive listings and guarantee farmer fulfillment, UMANI operates an automated two-stage escrow lifecycle:
    - **Stage 1 (Immediate Capture & Escrow Lock):** Guest funds are captured immediately upon checkout and locked into a platform escrow ledger (`public.payments.status = 'held_in_escrow'`).
    - **Stage 2A (Stay & Experience Release Trigger):** For on-site stays, tours, and workshops, payout release is automatically scheduled for **twenty-four (24) hours post-check-in**. If a guest files a valid emergency dispute (e.g., host no-show, uninhabitable conditions) within this window, funds remain frozen pending mediation.
    - **Stage 2B (Harvest Produce Release Trigger):** For physical crop and artisanal goods orders, payout release is scheduled **twenty-four (24) hours after courier delivery confirmation**, harmonized with the statutory 24-hour perishable spoilage claim window.
* **REQ-PAY-3 (Automated Host Disbursements & Commission Deduction):**
  - UMANI automatically deducts the platform marketplace commission (**15%** for Stays and Experiences; **10%** for Direct Harvest Products) from gross booking revenue.
  - Net earnings are remitted directly to the host's verified payout channel (GCash wallet or Philippine Bank Account) via automated **InstaPay** (instant settlement for amounts $\le ₱50,000$) or **PESONet** batch clearing.
* **REQ-PAY-4 (Severe Weather Force Majeure & Automated Refunds):**
  - Automated refund pipeline connected to PAGASA severe weather protocols: when Tropical Cyclone Wind Signal No. 2+ is hoisted over the host farm or guest origin municipality, pending reservations qualify for **100% penalty-free refund** without cancellation deductions.
* **REQ-PAY-5 (Statutory Tax & Regulatory Compliance - BIR RR 16-2023 & RA 11976):**
  - Complies with **BIR Revenue Regulation No. 16-2023** governing Electronic Marketplace Operators, enforcing mandatory 1% withholding tax on 50% of gross remittances to online sellers/hosts (unless the host submits a sworn declaration of gross remittances $\le ₱500,000$ annually).
  - Conforms to the **Ease of Paying Taxes (EOPT) Act (RA 11976)** requiring immutable 5-year retention of financial accounting records (`payments`, `payouts`, `invoices`).
* **REQ-PAY-6 (Webhook Idempotency & Cryptographic Signature Verification):**
  - Payment status transitions are strictly event-driven via signed webhook endpoints (`/api/webhooks/paymongo`).
  - Mandatory **HMAC-SHA256** cryptographic signature validation; requests with missing/invalid signatures or timestamps older than 5 minutes (300s) are rejected immediately.
  - Handlers enforce database idempotency through unique `payment_intent_id` and PostgreSQL transaction locks to guarantee zero duplicate payout triggers.
* **REQ-PAY-7 (Idempotency Key Protocol for Mobile Resilience):**
  - All checkout sessions and payment authorizations must transmit a unique UUIDv4 `Idempotency-Key` header.
  - Prevents accidental duplicate charges during intermittent rural connectivity drops or user double-taps on mobile devices.
* **REQ-PAY-8 (PCI DSS SAQ A Tokenization Scope Minimization):**
  - Zero raw card numbers, CVVs, or expiration dates ever touch UMANI servers or Supabase databases.
  - Card entry is tokenized client-side exclusively via PayMongo Secure Elements, keeping UMANI in the minimal **PCI DSS SAQ A** compliance scope.
* **REQ-PAY-9 (Mobile Deep-Link Interception & Hybrid Reconciliation):**
  - Native Capacitor bridge intercepts `gcash://` custom URL schemes to open the native GCash application without WebView navigation crashes, returning via deep-link: `umani://checkout/callback?session_id=...`.
  - Employs a hybrid reconciliation model: webhooks act as the single source of truth, complemented by a client-side verification endpoint when the user returns to the app.

---

## 4. Security, Moderation & Access Control

### 4.1 Row-Level Security (RLS) Matrix Across All Roles

| Table | Anonymous (`anon`) | Guest (`guest`) | Host (`host`) | Moderator (`moderator`) | Admin (`admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `profiles` | SELECT | SELECT, UPDATE (Self) | SELECT, UPDATE (Self) | SELECT | SELECT, UPDATE, DELETE |
| `farm_profiles` | SELECT | SELECT | ALL (Owned Profile) | SELECT, UPDATE (Flags)| ALL |
| `properties` (Stays)| SELECT | SELECT | ALL (Owned Properties)| SELECT, UPDATE (Flags)| ALL |
| `farm_events` | SELECT | SELECT | ALL (Owned Events) | SELECT, UPDATE (Flags)| ALL |
| `products` | SELECT | SELECT | ALL (Owned Products) | SELECT, UPDATE (Flags)| ALL |
| `kitchen_menus` | SELECT | SELECT | ALL (Owned Menus) | SELECT, UPDATE (Flags)| ALL |
| `farm_posts` | SELECT | SELECT | ALL (Author Only) | SELECT, DELETE (Abuse)| ALL |
| `farm_reels` | SELECT | SELECT | ALL (Author Only) | SELECT, DELETE (Abuse)| ALL |
| `post_likes` | SELECT | ALL (Own Likes) | ALL (Own Likes) | SELECT | ALL |
| `post_comments` | SELECT | INSERT, DELETE (Own) | INSERT, DELETE (Own) | SELECT, DELETE (Abuse)| ALL |
| `farm_follows` | SELECT | ALL (Own Follows) | ALL (Own Follows) | SELECT | ALL |
| `bookings` | None | SELECT, INSERT (Own) | SELECT, UPDATE (Own Host)| SELECT (Audits) | ALL |
| `payments` | None | SELECT (Own Payments) | SELECT (Related Bookings)| None | ALL |
| `escrow_ledger` | None | None | SELECT (Own Earnings) | None | ALL |
| `payouts` | None | None | SELECT (Own Payouts) | None | ALL |
| `moderation_queue`| None | None | None | ALL | ALL |

### 4.2 Content Moderation & Abuse Prevention
* **SEC-MOD-1:** Media pre-flight scans for prohibited/NSFW content via Supabase Edge Function prior to publishing.
* **SEC-MOD-2:** 1-tap "Report Content" trigger on all posts, reels, and profiles routing directly to `moderator` triage queue.

### 4.3 Modular Zero-Infrastructure Rate Limiting Architecture
To protect UMANI from brute-force attacks, spam, denial-of-inventory hoarding, and scraping without incurring external infrastructure dependencies (such as external Redis or Upstash clusters), the platform implements an embedded PostgreSQL-native rate limiting engine callable via PostgREST and Edge Functions.

* **SEC-RATE-1 (Engine Architecture & Storage):**
  - **Storage:** A lean PostgreSQL unlogged table `public.rate_limits (key TEXT PRIMARY KEY, tokens NUMERIC NOT NULL, last_updated TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp())` with an index on `last_updated`.
  - **Atomic Evaluation:** PL/pgSQL function `public.check_rate_limit(p_key TEXT, p_limit INT, p_window_seconds INT, p_cost INT DEFAULT 1) RETURNS jsonb` evaluates remaining tokens using a sliding-window / token-bucket algorithm, atomic row-level locking (`FOR UPDATE`), and automatic token replenishment based on elapsed time.
  - **Periodic Pruning:** A lightweight scheduled job (via `pg_cron` or Edge Function cron) prunes inactive keys older than 24 hours to prevent table bloat.

* **SEC-RATE-2 (HTTP 429 Status Code & Standard RFC Headers):**
  - When a rate limit is exceeded, the server MUST reject the request with HTTP status `429 Too Many Requests`.
  - The response MUST include standard IETF draft rate-limiting headers:
    - `Retry-After: <seconds>` (number of seconds to wait before retrying)
    - `RateLimit-Limit: <quota>` (maximum permitted operations in window)
    - `RateLimit-Remaining: 0` (exhausted quota count)
    - `RateLimit-Reset: <seconds>` (seconds until the quota resets)
  - In PostgREST RPC endpoints, this is executed by calling `PERFORM set_config('response.headers', ...)` and raising `SQLSTATE 'PT429'`, causing PostgREST to automatically return HTTP 429 with the formatted headers.
  - In Supabase Edge Functions, a modular TypeScript middleware wrapper inspects client IP/User ID, calls `check_rate_limit`, and returns `new Response(..., { status: 429, headers: ... })` with an RFC 7807 Problem Details payload:
    ```json
    {
      "type": "https://umani.ph/errors/rate-limit-exceeded",
      "title": "Too Many Requests",
      "status": 429,
      "detail": "Rate limit exceeded for action 'create_comment'. Please retry in 45 seconds.",
      "retry_after": 45
    }
    ```

* **SEC-RATE-3 (Rate Limiting Domain Matrix):**
  1. **Authentication & Identity (Brute-Force & Toll Fraud Protection):**
     - `auth:login:{ip_or_email}`: 5 failed attempts per 15 minutes. Prevents credential stuffing.
     - `auth:signup:{ip}`: 3 registrations per IP per hour. Prevents Sybil bot creation.
     - `auth:password_reset:{email}`: 3 requests per email per hour. Prevents user inbox harassment.
     - `auth:otp_send:{phone}`: 3 requests per phone number per 15 minutes. Prevents SMS toll fraud / telecommunications bill exhaustion.
     - `auth:otp_verify:{phone}`: 5 incorrect verification attempts per OTP. Prevents brute-forcing shortcodes.
  2. **Social Engagement & Content Creation (Spam & Sybil Prevention):**
     - `reels:upload:{host_id}`: 5 video reels per host per 24-hour rolling window. Prevents storage exhaustion.
     - `feed:comment:{user_id}`: 30 comments per hour; burst limit of 5 comments per minute. Prevents troll flooding.
     - `feed:like_toggle:{user_id}`: 60 like actions per minute. Prevents engagement botting.
     - `messages:send:{user_id}`: 20 direct messages per hour to non-mutual contacts. Prevents unsolicited cold sales/phishing.
  3. **Commercial & Transactional Operations (Hoarding & Card Testing Protection):**
     - `booking:create:{user_id}`: 5 pending reservations per hour. Prevents calendar hoarding / malicious GiST exclusion locking.
     - `checkout:initiate:{user_id}`: 5 checkout sessions per 30 minutes. Prevents payment card testing attacks.
     - `promo:redeem:{user_id}`: 5 coupon redemption attempts per 15 minutes. Prevents voucher code enumeration.
     - `reviews:submit:{user_id}`: 1 review per completed stay; max 3 reviews submitted platform-wide per day.
  4. **Public Discovery & Scraping Prevention:**
     - `search:query:{ip_or_user}`: 60 search queries per minute. Protects PostGIS geospatial and full-text search CPU cycles.
     - `api:public_read:{ip}`: 120 requests per minute. Prevents commercial scraping of farm profiles and farmer contact details.

### 4.4 Supabase Free-Tier Governance
* **QUOTA-EMAIL-1:** Native Supabase Auth with mandatory client-side 60-second cooldown timer on password resets. Interception of `over_email_send_rate_limit` (HTTP 429) errors.
* **QUOTA-BOT-2:** Zero-cost abuse mitigation via Cloudflare Turnstile bot verification on `/auth`.

---

## 5. Non-Functional Requirements & Performance Budgets

* **NFR-VID-1 (MVP Video Storage & Progressive Streaming Architecture):**
  - **Storage Repository:** Supabase Object Storage serves as the primary media repository for the MVP, utilizing public buckets for reels and photos.
  - **Progressive Streaming & Range Requests:** Supabase Storage natively supports HTTP Range Requests (`Content-Range` header), allowing video players to stream, buffer, and scrub MP4 files progressively without requiring immediate complete file downloads.
  - **Edge Caching via Smart CDN:** All public media is served through Supabase Smart CDN (Cloudflare Edge network) with edge nodes in Manila and Singapore, configured with immutable caching headers (`Cache-Control: public, max-age=31536000, immutable`) to maximize cache hit rates and benefit from lower cached egress rates ($0.03/GB).
  - **Client-Side Upload Constraints:** To prevent uncompressed video from overwhelming Philippine mobile networks, uploads are restricted to:
    - Maximum duration: 60 seconds.
    - Maximum file size: 50MB for video reels; 5MB for photo uploads.
    - Container & Codec Normalization: Client-side compression to 1080p/720p H.264 video with AAC audio, formatted with FastStart (`moov` atom placed at the beginning of the file).
  - **Long-Term Scaling Horizon:** When platform concurrency exceeds 5,000 daily active creators, video ingestion will transition to dedicated HLS transcoding (Cloudflare Stream or Mux) via Supabase Database Webhooks, preserving Supabase Storage for high-resolution photo galleries and documents.
* **NFR-VID-2 (Prefetching & Caching):** Single-item forward pre-buffering capped at 3 seconds.
* **NFR-VID-3 (Offline & Poor Connectivity):** Low-resolution blurred thumbnail (LQIP) during initial media buffering.
* **NFR-PERF-1:** Initial page bundle size capped under **150 KB gzip** via route code-splitting (`React.lazy`).
* **NFR-PERF-2:** Virtualized video feeds maintain **60 FPS scroll performance** without memory accumulation.
* **NFR-A11Y-1 (WCAG 2.2 Level AA Compliance):** All UI components, booking drawers, forms, and media overlays shall comply with WCAG 2.2 Level AA standards (governed by [`docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/spec/SPEC-002-responsive-design-and-accessibility-standards.md)):
  - Minimum 4.5:1 text contrast (3:1 for large text $\ge 18\text{px}$) and 3:1 non-text UI contrast. Video captions feature an opaque gradient scrim (`bg-gradient-to-t from-black/80`).
  - Target size minimum of 24×24 CSS pixels for secondary pills/badges, and 44×44 CSS pixels for primary touch targets.
  - Zero obscured focus (SC 2.4.11): Sticky headers and mobile bottom navigation enforce `scroll-padding` so keyboard-focused elements are never occluded.
  - Responsive reflow down to 320 CSS pixels with zero horizontal scrolling (SC 1.4.10).
  - Respects `@media (prefers-reduced-motion: reduce)` by disabling autoplay reels and damping spring physics.
* **NFR-A11Y-2 (Continuous Responsive Layout & dvh Units):** Layouts must gracefully reflow across continuous screen widths (mobile $<640\text{px}$, tablet $640\text{px}-1024\text{px}$, desktop $1024\text{px}-1440\text{px}$, wide theater $>1440\text{px}$). Mobile viewports use dynamic units (`dvh`) and safe-area insets (`env(safe-area-inset-*)`) to prevent mobile browser chrome clipping.
* **NFR-SEO-1:** Dynamic OpenGraph & Twitter Card metadata for Farm Profiles (`/@farm_handle`) and Video Reels (`/reels/:id`).
* **NFR-SEO-2:** JSON-LD structured data conforming to Schema.org `LodgingBusiness`, `TouristAttraction`, `FoodEstablishment`, and `VideoObject`.

---

## 6. Legal, Compliance, Privacy & Platform Governance

*(Proposed Baseline — Under Active Legal & Stakeholder Review)*

* **COMP-DPA-1 (Philippine Data Privacy Act RA 10173):** Transparent "at-set-up" Privacy Notice, statutory Data Subject Rights (Access, Object, Erasure, Export), and 72-hour breach notification protocol via DPO (`privacy@agribnv.com`).
* **COMP-DPA-2 (In-App Account Deletion & BIR Tax Retention Harmonization):** Accessible, self-serve account deletion flow in `/profile/edit` compliant with Apple App Store Review Guideline 5.1.1(v) and RA 10173 Right to Erasure. To resolve statutory conflict with the Philippine **Ease of Paying Taxes (EOPT) Act (RA 11976)** requiring financial records to be retained for **5 years**, deletion does *not* cascade-delete financial transactions (`bookings`, `orders`, `invoices`). Instead, personal identifiers are permanently scrubbed and anonymized (`guest_id = NULL`, customer billing name masked to `'Deleted Guest'`, contact info purged) while preserving transaction totals and tax breakdown for statutory BIR audit compliance. Pending or active bookings must be completed or cancelled before deletion is executed.
* **TERMS-AGRI-1 (Intermediary Marketplace Protection):** UMANI operates as a matching marketplace and assumes no direct operational liability for physical on-farm incidents.
* **TERMS-AGRI-2 (Agritourism Inherent Hazard Assumption of Risk):** Mandatory affirmative check on booking checkout acknowledging working farm hazards (livestock, machinery, uneven terrain, tropical weather).
* **TERMS-COMM-1 (Direct Agricultural Commerce & Perishables):** Strict 24-hour spoilage/damage dispute window with photo evidence for fresh harvests. Processed foods warrant local FDA/sanitary compliance.
* **TERMS-UGC-1 (Creator UGC Licensing):** Farmers retain intellectual property while granting UMANI a non-exclusive license for platform discovery. 24-hour response window on DMCA/infringement reports (`legal@agribnv.com`).
* **TERMS-BOOK-1 (Cancellation Tiers & Severe Weather Force Majeure):** Standardized cancellation tiers (Flexible, Moderate, Strict) with automatic 100% refund protocol triggered under PAGASA Tropical Cyclone Warning Signal No. 2+ or municipal disaster declarations.
