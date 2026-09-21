# PRD-001: Farm Feed & Short-Form Video (AgriReels)

**Feature Title:** Discovery Engine: The Farm Feed & AgriReels  
**Ecosystem Pillar:** Discovery Layer (Top-of-Funnel Conversion)  
**Priority:** P5 in Core Development Matrix  
**Document Status:** Approved Baseline (UMANI v3.0)  
**Owners:** Product Design & Full-Stack Engineering  

---

## 1. Executive Summary

### 1.1 Problem Statement
Agricultural tourism is inherently seasonal and deeply tied to real-time farm life: mangoes ripen in specific months, honey is harvested in windows, and farmers have stories that cannot be communicated through static real-estate listings. In legacy models, farms remain invisible outside peak travel seasons, and tourists lack an authentic window into farm operations before booking.

### 1.2 Proposed Solution
Implement **The Farm Feed**: a farmer-first short-form content experience (9:16 vertical video reels and rich photo journals) that acts as the primary **Discovery Engine** for UMANI. Farmers can record and post updates directly from their fields, seamlessly linking each piece of content to their Farm Profile, Stays, Experiences, Events, Products, or Farm Kitchen menus.

### 1.3 Success Criteria
* **Daily Active Discovery Time:** Average daily time spent browsing the app exceeds 6 minutes per active session.
* **Content-to-Ecosystem Conversion:** $\ge 18\%$ of all stay reservations, workshop bookings, and product orders originate from a tagged feed card or video reel.
* **Farmer Adoption:** $> 60\%$ of onboarded farmers post at least 2 updates or reels per month.
* **Scroll Performance:** Sustained 60 FPS vertical snap-scrolling on mid-tier mobile WebViews with zero Out-Of-Memory (OOM) crashes.

---

## 2. User Experience & Functionality

### 2.1 User Personas
* **Tatay Ramon (Host / Farmer in Guimaras):** Wants to quickly record a 30-second reel of the ripe Carabao mango harvest on his mobile phone to attract weekend day-tourists from nearby cities.
* **Maya (Urban Traveler & Foodie from Manila - Mobile):** Wants to browse authentic farm life during her commute, follow local honey and coffee producers, and tap directly on a video to book a weekend kubo stay.
* **Leo (Group Planner - Desktop Web):** Wants to research farm stays on a large monitor in Theater Mode, reviewing high-definition video footage alongside comments and host credentials before booking for a team offsite.

### 2.2 User Stories
* `As a farmer, I want to upload short video clips and harvest journals directly from my phone so that I can tell my farm's story without needing marketing agencies.`
* `As a traveler, I want to tap on a product or stay pill embedded within a farm reel so that I can instantly view pricing and check reservation availability.`
* `As a desktop user, I want to navigate reels with keyboard shortcuts and view synchronized booking details in a theater layout.`

### 2.3 Acceptance Criteria
* [ ] **AC-1 (Feed Navigation Streams):** Home feed provides a persistent switcher between `"For You"` (algorithmic & geographic discovery) and `"Following"` (chronological updates from followed farms).
* [ ] **AC-2 (Mobile Snap Experience):** Vertical video reels snap cleanly to $100\text{dvh}$ viewports with touch drag physics and instant auto-play on $\ge 50\%$ viewport visibility.
* [ ] **AC-3 (Memory Eviction & OOM Prevention):** Mobile WebView enforces a strict 3-slot window (`[Previous (unloaded), Active (playing), Next (preloading)]`). Scrolled-out video decoders are immediately paused, emptied, and reloaded to free GPU textures.
* [ ] **AC-4 (Tagged Offering Drawer):** Every feed card/reel supports a linked offering pill (`Stay`, `Experience`, `Event`, `Product`, or `Kitchen`). Tapping opens the interactive booking/inquiry sheet without terminating video playback.
* [ ] **AC-5 (Desktop Theater Mode & Hotkeys):** On screens $\ge 1024\text{px}$, `/reels` renders a 2-column theater view (9:16 ambient video canvas + 400px comment/booking panel) supporting `Space`/`K` (pause/play), `J`/`Down` (next), `Up`/`K` (prev), `M` (mute), `L` (like), `C` (comment), and `B` (book).
* [ ] **AC-6 (Creator Upload Studio & MVP Storage):** Mobile upload via `@capacitor/camera` and desktop drag-and-drop supporting MP4/MOV (max 60 seconds, max 50MB, client-side normalized to 1080p/720p H.264 + AAC FastStart with `moov` atom at front). Videos and photos are stored in public Supabase Object Storage buckets fronted by Supabase Smart CDN (Cloudflare Edge). Includes interactive frame scrubber for custom thumbnail selection.

### 2.4 Non-Goals
* **No Unbounded Social Network:** The Farm Feed is strictly an agricultural discovery engine, not a generic public video platform. Only verified hosts (`app_role = 'host'`) can publish reels; consumers can like, comment, bookmark, and share.
* **No In-App Live Streaming (v3.0):** Real-time live broadcasting is deferred to future milestones; v3.0 focuses on short-form asynchronous video and photo journals.

---

## 3. Discovery Architecture & Feed Algorithm

### 3.1 Ranking & Recommendation Signals
The `"For You"` discovery feed orders content based on a weighted multi-factor scoring function:
$$\text{Score} = (w_1 \cdot \text{Proximity}) + (w_2 \cdot \text{Recency}) + (w_3 \cdot \text{Engagement Rate}) + (w_4 \cdot \text{Seasonal Relevancy})$$
* **Proximity ($w_1 = 0.35$):** Farms located within the user's province or region (via GPS or selected region).
* **Recency ($w_2 = 0.25$):** Exponential decay with half-life of 48 hours for harvest updates.
* **Engagement Rate ($w_3 = 0.25$):** Like-to-view and comment-to-view ratios.
* **Seasonal Relevancy ($w_4 = 0.15$):** Boost for active harvest windows declared in the farm's seasonal calendar.

---

## 4. Technical Specifications

### 4.1 Data Model & Integration Points
* **Database Tables:** `public.farm_reels`, `public.farm_posts`, `public.post_likes`, `public.post_comments`, `public.farm_follows`.
* **Foreign Key Constraints:** Tagging references `properties.id`, `products.id`, `farm_events.id`, or `kitchen_menus.id`.
* **Realtime Broadcast:** Realtime subscriptions on `post_likes` and `post_comments` for live count updates.

### 4.2 Storage, Streaming & Security Architecture
* **Supabase Object Storage Streaming (MVP):**
  - Stored in a public `reels` bucket with aggressive caching headers (`Cache-Control: public, max-age=31536000, immutable`).
  - Served through Supabase Smart CDN with edge POPs in Manila and Singapore.
  - Video players utilize native HTTP Range Requests (`Content-Range`) for seekable progressive playback without upfront complete downloads.
* **Automated Pre-Flight Check:** Supabase Edge Function scans uploaded media for NSFW/harmful content prior to public status transition.
* **Modular Zero-Infrastructure Rate Limiting:**
  - Enforced via PostgreSQL `check_rate_limit()` RPC function and Edge Function middleware.
  - Quotas: Max 5 reels per host per 24-hour rolling window; max 30 comments per user per hour (burst: 5/min); max 60 likes per minute.
  - Exceeded quotas return `HTTP 429 Too Many Requests` with standard IETF headers (`Retry-After`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) and RFC 7807 JSON error body.
* **Content Takedown:** 1-tap "Report Content" trigger routing to `legal@agribnv.com` with a 24-hour SLA.

---

## 5. Risks & Phased Roadmap

### 5.1 Phased Rollout
* **Phase 1 (MVP Baseline):** Photo journals and reverse-chronological reels stream with Supabase Object Storage progressive streaming, Smart CDN caching, and basic tagging.
* **Phase 2 (Desktop Theater & Hotkeys):** 2-column theater view with ambient frosted-glass sampling and keyboard controls.
* **Phase 3 (Algorithmic Ranking & Transcoding):** Automated HLS transcoding pipeline (Cloudflare Stream or Mux via Supabase Database Webhooks) when creator volume exceeds 5,000 DAU.

### 5.2 Technical Risks & Mitigation
* **Risk (Mobile WebView Crashes from Video Decoders):** Mitigated by strict 3-slot virtualization and immediate decoder destruction on scroll-out.
* **Risk (Slow Rural Uploads):** Mitigated by client-side canvas thumbnail generation, client-side FastStart MP4 compression, and background chunked uploads via TUS protocol.
