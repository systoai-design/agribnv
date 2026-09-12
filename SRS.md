# Software Requirements Specification (SRS)
## Agribnv v2: The Agritourism Platform for Farmers ("bed & venture")

**Document Version:** 2.3  
**Status:** Approved Baseline (Core Architecture & Modules 1–5); Section 6 (Legal, Compliance & Privacy) Under Active Review  
**Target Platform:** Web (Desktop & Mobile Responsive) + Native Mobile (iOS & Android via Capacitor)  
**Reference Documents:** 
* [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)
* [`docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/compliance/LEGAL_AND_COMPLIANCE_FRAMEWORK.md)
* [`docs/brainstorming/MULTI_AGENT_BRAINSTORM_SOCIAL_REVAMP.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/brainstorming/MULTI_AGENT_BRAINSTORM_SOCIAL_REVAMP.md)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional requirements for **Agribnv v2**. Agribnv is pivoting from a traditional transactional rental listing platform to a **social-first agritourism creator marketplace** ("bed & venture") that integrates social discovery, short-form video reels, and direct farmer commerce while retaining an atomic stay-and-experience booking engine.

### 1.2 Scope
Agribnv bridges the gap between rural agricultural producers and urban consumers/travelers across four interconnected pillars:
1. **Farmer Social Profiles:** Creator identity highlighting farmer background, crop specializations, and verified credentials with follow/follower mechanics.
2. **Social Discovery Feed & Short-Form Video (AgriReels):** Engaging visual content (stories, updates, 60s vertical video reels) that drives discovery and viral sharing.
3. **Direct Farm Commerce (Products):** Farm-to-consumer store for local harvests, honey, coffee, and specialty goods.
4. **Hospitality & Booking Engine (Stays & Experiences):** Day workshops and overnight accommodations with atomic double-booking prevention.

### 1.3 Definitions & Acronyms
* **AgriReels:** 9:16 vertical short-form video content showcasing farm activities, kubo stays, and harvesting.
* **GiST:** Generalized Search Tree (PostgreSQL index used for atomic range exclusion on booking calendars).
* **FSD:** Feature-Sliced Design.
* **OOM:** Out Of Memory (mobile WebView crash condition caused by un-reclaimed video decoders).
* **RLS:** Row-Level Security (PostgreSQL / Supabase policy engine).
* **Host/Farmer:** Verified producer eligible to list properties, products, and publish creator content.
* **Guest/Consumer:** End user browsing feeds, following farms, purchasing goods, and booking stays.

---

## 2. System Architecture & Platform Support

### 2.1 Cross-Platform Strategy: Web + Capacitor
The application runs as a unified TypeScript codebase with responsive layouts designed specifically for both **Desktop Web** and **Mobile App (iOS & Android via Capacitor)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT PRESENTATION LAYER                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│             DESKTOP WEB              │       MOBILE (WEB & CAPACITOR)       │
│ • 3-Column Social & Video Layout     │ • Full-Bleed 9:16 Vertical Video     │
│ • Persistent Left Nav & Search Hero  │ • Bottom Navigation Bar (5 Tabs)     │
│ • Split-Screen Map & Listing Grid    │ • Touch Gestures & Haptic Feedback   │
│ • Keyboard Shortcuts & Hover Popovers│ • Capacitor Safe Area & Push Bridge  │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                       │
                                       ▼ (HTTPS / WSS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE BACKEND CLOUD                             │
├───────────────────┬───────────────────┬──────────────────┬──────────────────┤
│    POSTGRESQL     │   SUPABASE AUTH   │    REALTIME      │     STORAGE      │
│ • Relational DB   │ • JWT Sessions    │ • Live Chat      │ • Image CDN      │
│ • GiST Exclusion  │ • Role RBAC       │ • Feed Broadcast │ • HLS Video CDN  │
│ • Strict RLS      │ • OAuth & Email   │ • Notifications  │ • Signed Uploads │
└───────────────────┴───────────────────┴──────────────────┴──────────────────┘
```

### 2.2 Device-Specific Architectural Invariants

#### A. Mobile Devices (iOS & Android via Capacitor)
* **Touch-First Navigation:** Bottom navigation bar housing 5 primary tabs: `[ Home (Feed) | Explore (Map/Search) | Reels | Inbox | Profile ]`.
* **Safe-Area Insets:** Must dynamically bind `--sat`, `--sab`, `--sar`, `--sal` via `capacitor-plugin-safe-area`.
* **Hardware Haptics:** Subtle haptic feedback (`Haptics.impact({ style: ImpactStyle.Light })`) on like, bookmark, and booking taps.
* **WebView Video Memory Management (OOM Prevention):** HTML5 `<video>` decoders in mobile WebViews must strictly enforce a **3-slot virtualization window** `[Previous (unloaded), Active (playing), Next (preloading)]`. Scrolled-out video elements must immediately invoke `.pause()`, clear `.src = ""`, and call `.load()` to prevent memory accumulation.

### 2.2 Device-Specific Architectural Invariants

#### A. Mobile Devices (iOS & Android via Capacitor & Mobile Web)
* **Touch-First Navigation:** Bottom navigation bar housing 5 primary tabs: `[ Home (Feed) | Explore (Map/Search) | Reels | Inbox | Profile ]`.
* **Safe-Area Insets:** Must dynamically bind `--sat`, `--sab`, `--sar`, `--sal` via `capacitor-plugin-safe-area`.
* **Hardware Haptics:** Subtle haptic feedback (`Haptics.impact({ style: ImpactStyle.Light })`) on like, bookmark, and booking taps.
* **WebView Video Memory Management (OOM Prevention):** HTML5 `<video>` decoders in mobile WebViews must strictly enforce a **3-slot virtualization window** `[Previous (unloaded), Active (playing), Next (preloading)]`. Scrolled-out video elements must immediately invoke `.pause()`, clear `.src = ""`, and call `.load()` to prevent memory accumulation.

#### B. Desktop Devices & Website Architecture (Evergreen Browsers: Chrome, Safari, Edge, Firefox)
* **Responsive Layout Breakpoints:**
  - **Mobile:** `< 768px` (Single column, bottom navigation bar, full-screen vertical swipe).
  - **Tablet:** `768px – 1024px` (Collapsible icon-only sidebar, dual-column cards).
  - **Desktop:** `1024px – 1440px` (Full 3-column layout: 240px persistent left navigation, 640px center stream, 340px right discovery rail).
  - **Wide Desktop:** `> 1440px` (Max container width 1440px centered, expanded right rail with active farm booking summary).
* **3-Column Website Canvas:**
  - **Left Navigation Rail:** Persistent sidebar with Agribnv logo, brand tagline (*"bed & venture"*), primary routes (`Home`, `Explore`, `AgriReels`, `Saved Stays`, `Direct Messages`), and quick Creator Studio switch for verified hosts.
  - **Center Feed Stage:** 640px maximum width for optimal reading and media consumption with infinite scroll pagination.
  - **Right Contextual Rail:** Sticky widgets displaying: *"Recommended Farms to Follow"*, *"Seasonal Harvest Calendar"* (e.g. Carabao Mangoes in Guimaras, Arabica Coffee in Benguet), *"Local Farm Weather & Terroir"*, and community trending hashtags.
* **Desktop Video Playback Architecture:**
  - Centered 9:16 framed player with ambient frosted-glass background glow (dynamically sampling edge video colors).
  - Web Audio API integration with custom desktop volume slider, time scrubber, and Picture-in-Picture (PiP) trigger.
  - Mouse-wheel and trackpad vertical snap with debounce to prevent skipped frames.
* **Dual-Pane Explore View:** On desktop web, the `Explore` tab switches to a split-screen interface: left-hand 55% scrollable grid of property cards with filters; right-hand 45% interactive MapLibre GL map with custom farm pins and live cluster markers.

---

## 3. Functional Requirements

### 3.1 Module 1: Identity & Farmer Creator Profiles
* **REQ-PROF-1 (Creator Profile Header):** Every farm/farmer shall have a public creator profile displaying:
  - Farm Name, Verified Farmer Badge, Avatar, and Cover Banner.
  - Farmer Bio, Agricultural Philosophy, and Terroir/Location.
  - Follower Count, Following Count, and Total Likes Received.
  - "What We Grow" category badges (e.g. Heirloom Rice, Mangoes, Arabica Coffee, Bees).
  - Quick action buttons: `[ Follow / Unfollow ]`, `[ Message ]`, `[ Share Profile ]`.
* **REQ-PROF-2 (Tabbed Profile Layout):** Profiles shall feature 4 structured tabs:
  1. **Reels:** Grid of short-form video thumbnails with view counts (4 columns on desktop, 3 columns on mobile).
  2. **Posts:** Chronological photo journals, harvest announcements, and seasonal updates.
  3. **Stays & Experiences:** Available kubo huts, cottages, and day workshops with pricing pills.
  4. **Farm Shop:** Direct agricultural products available for order or inquiry.
* **REQ-PROF-3 (Follow System):**
  - Guests can follow/unfollow farms with instantaneous optimistic UI updates.
  - Following updates create real-time entries in the user's personal activity feed.
* **REQ-PROF-4 (Desktop Website Profile View):**
  - High-resolution 16:5 panoramic cover banner with parallax scroll effect.
  - Sticky sub-navigation bar pinning profile tabs when scrolling down long lists of stays or products.
  - Hover previews on Reels thumbnails: hovering for $>300\text{ms}$ initiates a silent video snippet loop.
  - Quick "Book a Stay" floating sticky card pinned on the right side of the screen during profile navigation.

### 3.2 Module 2: Home Screen & Social Discovery Feed
* **REQ-FEED-1 (Dual-Mode Home Navigation):** The primary Home view shall feature a persistent segment controller:
  - **Feed Tab (Default):** Displays the community social feed.
  - **Explore Tab:** Displays search filters, category carousels, property grid, and map view.
* **REQ-FEED-2 (Feed Streams):** Within the Feed tab, users can toggle between:
  - **"For You" (Discover):** Curated blend of trending reels, popular harvest stories, and featured nearby farms.
  - **"Following":** Reverse-chronological timeline exclusively from followed farms.
* **REQ-FEED-3 (Feed Card Anatomy):** Each feed item shall support:
  - Author header with farm avatar, name, location, and timestamp.
  - Rich media carousel (photos or embedded auto-looping silent video).
  - Post caption, crop hashtags, and linked tagged stay or product pill.
  - Social interactions: Like button (with heart-pop animation), Comment count, Share button, and Save/Bookmark button.
* **REQ-FEED-4 (Desktop Website Feed Enhancements):**
  - Centered 640px feed container avoiding excessive horizontal line stretch.
  - Inline video cards feature hover-to-play with desktop volume and full-screen controls.
  - Right-hand contextual rail displaying suggested farms and current harvest alerts.
  - Quick-comment popover allowing guests to reply inline without opening a separate modal.

### 3.3 Module 3: Short-Form Video Engine (AgriReels)
* **REQ-REELS-1 (Full-Screen & Theater Viewports):**
  - **Mobile:** Immersive 9:16 vertical full-screen viewport with snap-scrolling (`snap-y snap-mandatory`).
  - **Desktop Website (Theater Mode):** Split 2-column theater layout:
    - *Left Video Canvas:* 9:16 aspect-ratio video frame (max-height 85vh) centered against an ambient frosted-glass background.
    - *Right Interaction Panel:* 400px fixed width panel containing the host header, full caption, music metadata, scrollable real-time comment list, and sticky booking card.
* **REQ-REELS-2 (Interactive Video Overlay):**
  - Right-aligned action rail (mobile) or integrated panel (desktop): Farmer avatar with quick-follow `+`, Like button with counter, Comment trigger, Share trigger, and Mute/Unmute toggle.
  - Bottom info rail: Farmer handle, video caption, background audio title, and **Sticky Commerce Card** (`"Stay at this Kubo - ₱1,800/night"` or `"Buy Organic Wild Honey - ₱350"`).
  - Tapping the commerce card opens the instant booking or product drawer without terminating video playback.
* **REQ-REELS-3 (Playback Controls & Auto-Play):**
  - Videos shall auto-play when $>50\%$ visible in viewport.
  - Audio starts muted by default; clicking anywhere on the video toggles pause/play, while tapping the sound icon toggles global audio un-mute.
  - Desktop scrubber bar provides interactive timeline scrubbing with hover timestamp preview.
  - Picture-in-Picture (PiP) support allowing travelers to browse the rest of the site while continuing to watch a reel.
* **REQ-REELS-4 (Desktop Keyboard Shortcuts Matrix):**
  - When viewing AgriReels on desktop, the application shall support the following hotkeys (ignored when focused on text inputs):
    - `Space` / `K`: Toggle Play / Pause.
    - `ArrowDown` / `J`: Advance to Next Reel.
    - `ArrowUp`: Return to Previous Reel.
    - `M`: Toggle Audio Mute / Unmute.
    - `L`: Like / Unlike the active Reel (with heart animation).
    - `C`: Focus the comment input box.
    - `B`: Open the instant booking modal for the tagged farm stay.
    - `Esc`: Close theater mode or modal.
* **REQ-REELS-5 (Creator Upload Studio):**
  - Cross-platform media submission: Mobile Camera/Roll via `@capacitor/camera` and Desktop Web via drag-and-drop HTML5 File API.
  - Maximum video duration: **60 seconds**; maximum upload size: **30 MB**.
  - Interactive thumbnail selector allowing creators to scrub through video frames and select an optimal cover photo.
  - Host can attach a caption, crop category tags, and link 1 stay or 1 product to the reel.

### 3.4 Module 4: Stays & Experiences Booking Engine (Retained Core)
* **REQ-BOOK-1 (Zero Double-Booking Guarantee):** The database enforces a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `daterange(check_in, check_out, '[)')` for active bookings (`pending`, `confirmed`).
* **REQ-BOOK-2 (Interactive Availability Calendar):** Real-time month calendar displaying blocked dates, active reservations, and price-per-night indicators. Desktop displays a dual-month side-by-side calendar picker.
* **REQ-BOOK-3 (Price Breakdown Calculation):** Automatic calculator computing:
  $$\text{Total} = (\text{Base Rate} \times \text{Nights}) + \text{Cleaning Fee} + \text{Service Fee} + \sum \text{Experience Add-ons}$$
* **REQ-BOOK-4 (Booking Drawer & Desktop Modal):** Accessible directly from Property Details, Feed cards, and Video Reel theater mode.

### 3.5 Module 5: Direct Farm Products Catalog
* **REQ-PROD-1:** Product catalog categorized into *Fresh Harvests, Specialty Herbs, Seedlings, and Processed/Artisanal Goods*.
* **REQ-PROD-2:** Each product card lists name, seasonal harvest window, price, stock status, and farm origin.
* **REQ-PROD-3:** Guests can add items to an inquiry cart or initiate direct checkout messaging with the host. Desktop supports a multi-item slide-over shopping cart.

### 3.6 Module 6: Realtime Messaging & Community
* **REQ-MSG-1:** Direct 1-on-1 chat between guests and farmers using Supabase Realtime channels.
* **REQ-MSG-2:** Chat cards can embed a direct reference to a listing, booking reservation, or farm product.
* **REQ-MSG-3:** Push notifications for mobile (via Capacitor) and Web Push / browser toast notifications for desktop.

### 3.7 Module 7: Desktop Web Creator Studio & Host Management Portal
* **REQ-STUDIO-1 (Drag-and-Drop Media Pipeline):** Verified hosts accessing Agribnv via desktop web can drag and drop high-resolution footage directly into the browser with client-side canvas frame preview generation.
* **REQ-STUDIO-2 (Direct Tagging Interface):** Searchable dropdown allowing creators to link their active property or crop products with instant live card preview.
* **REQ-STUDIO-3 (Desktop Host Analytics):** Visual dashboard tracking video impressions, unique viewers, average watch percentage, and reel-to-booking conversion rates.

### 3.8 Module 8: Authentication, Authorization & Identity Management (Core Security)
* **REQ-AUTH-1 (Credential Authentication & Standardized Password Policy):**
  - Registration (`/auth`) and password updates (`/change-password`) shall enforce a unified, NIST SP 800-63B / OWASP-aligned policy:
    - Minimum length: **8 characters**.
    - Complexity requirements: At least 1 uppercase letter (`[A-Z]`), 1 lowercase letter (`[a-z]`), and 1 number (`[0-9]`).
    - Whitespace normalization to prevent inadvertent copy-paste lockouts.
* **REQ-AUTH-2 (Self-Serve Password Reset & Recovery Lifecycle):**
  - Users can initiate self-serve password recovery via `supabase.auth.resetPasswordForEmail()`.
  - Recovery emails shall deliver an ephemeral, single-use token redirecting to `/change-password`.
  - Capacitor native apps shall register and listen for deep-link URI callbacks (`agribnv://auth/callback#access_token=...`) to route mobile users directly into the password update screen.
* **REQ-AUTH-3 (Role-Based Access Control & Dual Persona Engine):**
  - System enforces a decoupled persona model (`guest` vs. `host`) backed by `public.user_roles`:
    - Default registration automatically provisions the `guest` role via database trigger (`handle_new_user()`).
    - Prospective farm hosts can elevate their account to `host` via `becomeHost()` or by selecting host onboarding during registration.
    - Active view mode (`agribnv_viewMode`) stored in local client state, enabling verified hosts to seamlessly toggle between traveling (`guest`) and hosting (`host`) personas.
    - All route gating (`RoleRoute`) must be strictly reinforced by backend PostgreSQL RLS security definer functions (`public.has_role()`).
* **REQ-AUTH-4 (OAuth 2.1 Social Authentication with PKCE):**
  - Social authentication (Google & Apple Sign-In) shall adhere strictly to OAuth 2.1 specifications with mandatory Proof Key for Code Exchange (PKCE).
  - Mobile authentication via Capacitor shall use secure in-app browser sessions with deep-link redirects rather than embedded WebViews to comply with provider security policies and prevent credential hijacking.
* **REQ-AUTH-5 (Session Lifecycle & Token Hygiene):**
  - Ephemeral, short-lived JWT access tokens (~15–60 minutes) coupled with auto-rotating refresh tokens stored in secure browser storage (`localStorage` on Web, Keychain/Keystore on Native).
  - Explicit sign-out (`signOut()`) immediately revokes local session tokens and notifies the Supabase Auth server to invalidate the refresh token family.
* **REQ-AUTH-6 (1-Click Demo Sandbox Access):**
  - For staging and product review, `/auth` retains 1-click demo buttons (`Demo Guest` and `Demo Host`) that instantly authenticate pre-seeded test accounts without requiring external inbox verification.

---

## 4. Security, Moderation & Access Control Requirements

### 4.1 Row-Level Security (RLS) Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Public | Auth User (`auth.uid() = id`) | Auth User (`auth.uid() = id`) | Admin Only |
| `farm_posts` | Public | Hosts Only (`has_role(auth.uid(), 'host')`) | Post Author (`author_id = auth.uid()`) | Post Author or Admin |
| `farm_reels` | Public | Hosts Only (`has_role(auth.uid(), 'host')`) | Reel Author (`author_id = auth.uid()`) | Reel Author or Admin |
| `post_likes` | Public | Authenticated (`auth.uid() = user_id`) | N/A | Like Owner (`auth.uid() = user_id`) |
| `post_comments` | Public | Authenticated (`auth.uid() = user_id`) | Comment Author | Comment Author or Admin |
| `farm_follows` | Public | Authenticated (`auth.uid() = follower_id`) | N/A | Follower (`auth.uid() = follower_id`) |
| `bookings` | Guest & Host | Authenticated Guest | Host (Accept/Decline) or Guest (Cancel) | Admin Only |

### 4.2 Content Moderation & Abuse Prevention
* **SEC-MOD-1 (Automated Pre-Flight Check):** Video uploads and image uploads are scanned for prohibited/NSFW content via Supabase Edge Function prior to publishing.
* **SEC-MOD-2 (Rate Limiting):** Max 5 video reels per host per 24-hour rolling window; max 30 comments per user per hour to prevent spam.
* **SEC-MOD-3 (Reporting Mechanism):** All posts, reels, and profiles include a 1-tap "Report Content" action flagging inappropriate items to administrators.

### 4.3 Industry Authentication Standards & OWASP Compliance
* **SEC-AUTH-1 (OWASP A07 - Anti-Enumeration & Uniform Feedback):**
  - All authentication and password recovery endpoints shall return uniform, ambiguous feedback (e.g., *"Invalid login credentials"* or *"If an account exists with this email, instructions have been sent"*).
  - Explicitly eliminates user enumeration, account discovery, and response timing discrepancy attacks.
* **SEC-AUTH-2 (OWASP A01 - Broken Access Control & Zero-Trust Defense):**
  - Client-side route guards (`RoleRoute`, conditional UI rendering) are classified strictly as UX conveniences and are **never** treated as security boundaries.
  - 100% of data reads, mutations, and status transitions are governed strictly by PostgreSQL Row-Level Security (RLS) policies evaluated inside the database engine using `auth.uid()`.
* **SEC-AUTH-3 (Brute-Force & Credential-Stuffing Mitigation):**
  - Integration with Cloudflare Turnstile bot verification on public `/auth` endpoints.
  - Supabase Auth exponential backoff and IP-level throttling to defeat automated dictionary attacks and password spraying.
* **SEC-AUTH-4 (Secrets Isolation & Key Hygiene):**
  - The elevated Supabase `service_role` key must **never** be packaged into client-side web bundles, environment files exposed to Vite, or native mobile binaries.
  - Client applications are strictly restricted to the public `anon` publishable key.
* **SEC-AUTH-5 (Session Fixation & CSRF Resistance):**
  - Sessions must regenerate identifiers upon privilege change (e.g. guest elevating to host).
  - PKCE code verifiers and state parameters are randomized per transaction to neutralize cross-site request forgery during OAuth callbacks.

### 4.4 Infrastructure Quota Governance & Cost Engineering (Supabase Free Tier)
* **QUOTA-EMAIL-1 (Supabase Native Auth Email & Rate-Cap Governance):**
  - **Native Built-in Adoption:** The platform relies strictly on Supabase's native built-in email service for account confirmations, password recovery, and email change verification without requiring external third-party SMTP providers.
  - **Free-Tier Rate Limits:** Supabase Auth imposes an hourly rate limit (up to 30 emails/hour, with burst throttling) on the free tier to protect mail reputation and avoid abuse.
  - **Defensive Client-Side UX Governance:**
    - *Cooldown Timers & Debouncing:* Password reset forms must enforce a mandatory client-side 60-second cooldown timer before permitting a resend attempt, preventing users from rapid-clicking and exhausting project email allowances.
    - *Graceful Rate-Limit Recovery:* If Supabase returns an `over_email_send_rate_limit` (HTTP 429) error, the application shall intercept this code and render an informative notification (*"Email limit reached. Please check your inbox or try again in a few minutes"*), avoiding raw errors or repeated failed submissions.
    - *Preserving Email Quotas via 1-Click Demo Accounts:* Automated testing, QA, and stakeholder demos shall mandate the use of the pre-seeded `Demo Guest` and `Demo Host` accounts ([`REQ-AUTH-6`](#req-auth-6-1-click-demo-sandbox-access)) which bypass email dispatch, preserving native quotas strictly for real users.
* **QUOTA-MAU-2 (Active User Headroom & Monitoring):**
  - The Supabase Free Tier provides up to **50,000 Monthly Active Users (MAU)** with unlimited logins and JWT verifications.
  - Application telemetry and monthly audits shall monitor MAU growth, alerting project maintainers when active identities reach 80% capacity (40,000 MAUs) to plan scaling.
* **QUOTA-BOT-3 (Zero-Cost Abuse Mitigation):**
  - Bot protection shall utilize **Cloudflare Turnstile**, which offers a completely free, privacy-focused CAPTCHA alternative with no request volume limits on its free tier.
  - Turnstile protects free-tier email quotas and database connection pools from being consumed by malicious automated scripts.

---

## 5. Non-Functional Requirements & Performance Budgets

### 5.1 Video Streaming & Bandwidth Optimization
* **NFR-VID-1 (Streaming Protocol):** Video reels shall be transcoded into adaptive bitrate HLS streams (`.m3u8`) with fallback MP4 for low-end devices.
* **NFR-VID-2 (Prefetching & Caching):** Only the immediately following video (1 item ahead) may be pre-buffered. Buffer size capped at 3 seconds of forward playback.
* **NFR-VID-3 (Offline & Poor Connectivity):** In low-signal rural areas (common in Philippine farmsteads), videos shall display an instant low-resolution blurred thumbnail (LQIP) while the HLS stream negotiates the lowest bitrate.

### 5.2 Application Performance & Bundle Budget
* **NFR-PERF-1:** Initial page bundle size shall not exceed **150 KB gzip** by lazy-loading heavy libraries (`maplibre-gl`, `recharts`, video controls).
* **NFR-PERF-2:** Virtualized video feeds must sustain a consistent **60 FPS scroll performance** on standard mobile devices without UI jank.

### 5.3 Accessibility (a11y)
* **NFR-A11Y-1:** All video players must support closed captions (VTT subtitles) and full screen reader accessibility (`aria-label` on like, comment, and volume controls).
* **NFR-A11Y-2:** Video auto-play must respect the user's device preference for `prefers-reduced-motion`.

### 5.4 Web SEO, OpenGraph Metadata & Deep-Linking
* **NFR-SEO-1 (Social Graph Previews):** Every public route on the website shall emit rich OpenGraph and Twitter Card metadata:
  - Farm Profile (`/@farm_handle`): Dynamic `og:image` featuring farm banner, title with verified badge, and location.
  - Video Reel (`/reels/:id`): Embedded `og:video` and `twitter:player` allowing direct inline video previews when shared across messaging platforms (iMessage, WhatsApp, Telegram) and social networks.
* **NFR-SEO-2 (Search Engine Indexing & Structured Data):** 
  - Farm stays and experiences shall provide JSON-LD structured data conforming to Schema.org `LodgingBusiness` and `TouristAttraction`.
  - AgriReels shall provide `VideoObject` structured markup (name, description, thumbnailUrl, uploadDate, duration) to enable rich snippets in Google Video search results.
* **NFR-SEO-3 (Cross-Browser Standards Compliance):**
  - Full functional and visual parity across Google Chrome, Apple Safari (macOS & iOS), Mozilla Firefox, and Microsoft Edge.
  - Support native Web Share API on compatible browsers with automatic fallback to clipboard URL copying on desktop browsers without native share dialogs.

---

## 6. Legal, Compliance, Privacy & Platform Governance Requirements
*(Proposed Baseline — Under Active Legal & Stakeholder Review)*

> [!NOTE]
> The specifications, statutory interpretations, and liability terms outlined in this section represent the proposed functional architecture and are currently **under active legal and operational review** pending final sign-off.

### 6.1 Regulatory Compliance & Data Privacy (Philippine DPA 2012 & Global Standards)
* **COMP-DPA-1 (Philippine Republic Act No. 10173 & NPC Compliance):**
  - The platform shall strictly comply with the Philippine Data Privacy Act of 2012 (RA 10173) and National Privacy Commission (NPC) circulars.
  - Transparent "at-set-up" Privacy Notice displayed before account registration on `/auth` and on mobile app first launch.
  - Implementation of statutory Data Subject Rights: Right to be Informed, Right to Access, Right to Object, Right to Erasure/Blocking, Right to Damages, and Right to Data Portability via structured profile export.
* **COMP-DPA-2 (In-App Account & Personal Data Deletion — Apple Guideline 5.1.1(v)):**
  - Mobile apps (iOS & Android via Capacitor) and web apps must provide a visible, self-serve "Delete Account" action within user profile settings (`/profile/edit`).
  - Initiating deletion must cascade-remove user credentials from Supabase Auth (`auth.users`), anonymize or purge public profile records (`public.profiles`), and delete personal contact data.
  - Retain only legally mandated transaction records (booking fiscal logs) with all PII scrubbed.
* **COMP-DPA-3 (Breach Management & Data Protection Officer Governance):**
  - Protocol to detect, contain, and report any personal data breach to the National Privacy Commission and affected data subjects within **72 hours** of confirmation.
  - Designated Data Protection Officer (DPO) contact (`privacy@agribnv.com`) published in the Privacy Policy.
* **COMP-DPA-4 (Hardware Sensor & Location Permissions):**
  - Explicit runtime permission requests for GPS/Geolocation (`@capacitor/geolocation`) and Camera/Photos (`@capacitor/camera`).
  - Denying location permissions must gracefully degrade to manual search and text filtering without blocking access to core features.

### 6.2 Terms of Service & Agritourism Inherent Risk Waiver
* **TERMS-AGRI-1 (Intermediary Marketplace Limitation of Liability):**
  - Terms of Service must clearly establish Agribnv as an intermediary marketplace platform connecting Guests with independent Farmer Hosts, not a tour operator, hotelier, transportation provider, or agricultural employer.
  - Agribnv assumes no direct operational liability for physical site safety, transport delays, or on-farm incidents.
* **TERMS-AGRI-2 (Inherent Agricultural Hazard Assumption of Risk & Liability Waiver):**
  - Prior to booking any farm stay or agricultural workshop, Guests must check a mandatory acknowledgement and waiver of inherent risks associated with active working farms:
    - Uneven, unpaved terrain, mud, slippery trails, and open bodies of water (irrigation canals, fishponds).
    - Unpredictable behavior of farm livestock, guard animals, bees, and native wildlife.
    - Active agricultural machinery (tractors, tillers, harvesters) and seasonal agrochemical applications.
    - Exposure to tropical weather and natural elements.
  - Guests voluntarily assume all inherent risks of visiting agricultural properties and agree to hold hosts and Agribnv harmless for ordinary injuries not arising from gross negligence or willful misconduct.
* **TERMS-AGRI-3 (Host Verification & Local Agritourism Accreditation):**
  - Farm Hosts warrant that properties comply with local municipal zoning laws, sanitation codes, and where applicable, Department of Tourism (DOT) / Department of Agriculture (DA) Agritourism Farm Site guidelines.
  - Hosts must display visible on-site safety signage, emergency contact information, and designate restricted hazard zones.
* **TERMS-AGRI-4 (Guest Code of Conduct & House Rules):**
  - Guests must respect farm operational boundaries, follow host instructions regarding animal interaction and crop harvesting, refrain from trespassing into private residential zones, and observe strict no-littering and biosecurity policies.

### 6.3 Agricultural Direct Commerce Terms (Farm Shop & Harvests)
* **TERMS-COMM-1 (Perishable Goods & Seasonal Crop Realities):**
  - Terms governing the direct purchase of fresh agricultural produce, honey, seeds, and processed goods:
    - Products are subject to natural weather variations, crop yield unpredictability, and seasonal availability.
    - Perishable harvests are non-returnable once dispatched, except for damaged in transit, spoilage, or substantial non-conformity reported within **24 hours** of delivery with photographic evidence.
* **TERMS-COMM-2 (Food Safety & Producer Warranties):**
  - Hosts selling artisanal, canned, or processed agricultural foods warrant compliance with Philippine Food and Drug Administration (FDA) and local health sanitation guidelines.

### 6.4 Creator Content, Music & Intellectual Property (AgriReels & Posts)
* **TERMS-UGC-1 (Creator Content Ownership & Platform License):**
  - Creators and farmers retain intellectual property ownership of all videos, photographs, and harvest journals published to AgriReels and Posts.
  - By publishing, creators grant Agribnv a worldwide, non-exclusive, royalty-free, transferable license to host, display, cache, distribute, and feature their content for platform discovery and marketing.
* **TERMS-UGC-2 (Right of Publicity & Farm Privacy):**
  - Creators warrant that all recognizable individuals appearing in video reels have granted explicit consent to be filmed, and that filming does not infringe upon neighboring landowner privacy.
* **TERMS-UGC-3 (DMCA & Copyright Takedown Procedure):**
  - Formal notice-and-takedown mechanism enabling copyright holders to report infringing media or unauthorized audio tracks to `legal@agribnv.com`. Infringing content must be disabled within 24 hours of verified notice.

### 6.5 Booking Cancellation, Refunds & Force Majeure
* **TERMS-BOOK-1 (Standardized Cancellation Tiers):**
  - Properties must declare one of three standardized cancellation policies clearly displayed prior to reservation confirmation:
    1. *Flexible:* Full refund if cancelled $>48$ hours prior to scheduled check-in time.
    2. *Moderate:* Full refund if cancelled $>5$ days prior to scheduled check-in time; 50% refund thereafter.
    3. *Strict:* Full refund if cancelled $>14$ days prior; 50% refund if cancelled $>7$ days prior; no refund within 7 days.
  - Agribnv service fees are refunded on qualifying full cancellations.
* **TERMS-BOOK-2 (Tropical Weather & Philippine Force Majeure Protocol):**
  - In the event of official Philippine PAGASA Tropical Cyclone Warning Signals (Signal No. 2 or above), severe volcanic activity, or official government travel bans affecting the host municipality, guests and hosts are entitled to penalty-free cancellation or rescheduling with full refund.

### 6.6 Compliance Gap Analysis & Tentative Implementation Roadmap
The following compliance features have been identified during architecture audits as **Missing** or **Partially Implemented**, and are prioritized for implementation to satisfy statutory, app store, and legal standards:

| Requirement ID | Compliance Domain | Current Status | Tentative Implementation Plan | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **GAP-COMP-1** | **In-App Account Deletion** | **Missing** | Implement a self-serve "Delete Account" flow in `/profile/edit` with 2-step confirmation, cascading to `auth.users` and personal records to fulfill Apple Guideline 5.1.1(v) and DPA erasure rights. | **P0 (App Store Blocker)** |
| **GAP-COMP-2** | **Agritourism Risk & Booking Consent** | **Partially Implemented** | Update the booking drawer/modal on `PropertyDetails.tsx` to require an explicit affirmative acknowledgement of the Agritourism Inherent Risk Waiver and property cancellation tier prior to reservation submission. | **P0 (Lawsuit Shield)** |
| **GAP-COMP-3** | **Cookie & Local Storage Banner** | **Missing** | Deploy a non-intrusive `CookieConsentBanner` disclosing essential functional storage (`sidebar:state`, `agribnv_viewMode`, auth JWT) with an "Accept" trigger and Privacy link. | **P1 (Regulatory)** |
| **GAP-COMP-4** | **Centralized Refund & Cancellation Disclosure** | **Partially Implemented** | Formalize a dedicated `/cancellation-policy` or expanded section in `/terms` explaining cancellation tiers, 24-hr perishable crop disputes, and PAGASA typhoon signal exemptions, linked in the global `Footer`. | **P1 (Transparency)** |
| **GAP-COMP-5** | **Third-Party Embed Transparency** | **Optimization Pending** | Explicitly declare Google Fonts and CARTO CDN data processing in the Privacy Policy, with a technical task to self-host Google Fonts locally in `index.html` to eliminate external IP leakage. | **P2 (Hardening)** |

