# PRD-006: Public Landing Page & Audience Growth

**Feature Title:** Public Landing Page, Conversion Funnels & Growth Mechanics  
**Ecosystem Pillar:** Growth, Brand Presentation & Audience Building  
**Priority:** P6 (Audience Retention & Discovery Launchpad)  
**Document Status:** Approved Baseline (UMANI v3.0)  
**Owners:** Product Design & Growth Engineering  

---

## 1. Executive Summary

### 1.1 Problem Statement
First impressions dictate adoption for two distinct user groups: travelers seeking unique agricultural experiences, and farmers deciding whether to bring their life's work onto a new digital platform. A generic landing page creates confusion and fails to communicate the rich, whole-farm philosophy of UMANI.

### 1.2 Proposed Solution
Implement the official **UMANI Public Landing Page**, structured across 8 editorial sections with dual conversion paths (`[ Explore Farms ]` for consumers and `[ Join UMANI as a Farmer ]` for hosts), paired with robust social audience growth tools (Follow, Save/Bookmark, and Native Share mechanics).

### 1.3 Success Criteria
* **Hero Conversion Rate:** $\ge 12\%$ click-through rate on primary CTAs (`Explore Farms` and `Join UMANI as a Farmer`).
* **Lighthouse Performance Score:** $\ge 95$ on desktop and $\ge 90$ on mobile with First Contentful Paint (FCP) $< 1.2\text{s}$.
* **Viral Referral Ratio:** $> 15\%$ of new visitors arrive via shared farm profile links or video reel deep-links.

---

## 2. User Experience & Functionality

### 2.1 User Personas
* **Julia (Curious First-Time Visitor):** Lands on the website from social media and wants to instantly understand what UMANI is, browse nearby farms, and watch farm reels without creating an account first.
* **Farmer Joel (Prospective Host in Tagaytay):** Lands on the website and needs to see that UMANI is built for *his entire farm* (not just Airbnb-style beds), motivating him to onboard his farm profile, stays, harvest products, and dining menu.

### 2.2 User Stories
* `As a visitor, I want an engaging, beautiful landing page that introduces the UMANI philosophy and showcases all 6 farm pillars so that I understand what I can experience.`
* `As a prospective farmer, I want a dedicated "For Farmers" value proposition so that I understand how UMANI helps me generate income beyond traditional harvest sales.`
* `As an engaged user, I want to easily share farm stories and reels to WhatsApp, Instagram, or Facebook via the Web Share API.`

### 2.3 Acceptance Criteria & 8-Section Layout Specification
* [ ] **AC-1 (Section 1: Hero):**
  - Brand header: **UMANI** (*UMA + ANI*).
  - Headline: *"Bring the whole farm online."*
  - Subhead: *"Discover farmers, farms, experiences, products, events, food, and stories—all in one place."*
  - Dual CTAs: `[ Explore Farms ]` and `[ Join UMANI as a Farmer ]`.
  - Supporting narrative: *"From the farm to your screen, and eventually to your table, your next experience, or your next adventure."*
* [ ] **AC-2 (Section 2: Philosophy):**
  - Headline: *"DISCOVER MORE THAN A FARM STAY"*
  - Content: Editorial typography highlighting that a farm is the people, the seasonal harvest, the farm-fresh meals, the land stories, and experiences. *"UMANI brings it all together."*
* [ ] **AC-3 (Section 3: Explore the Farm):**
  - Interactive 6-card grid showcasing:
    1. 🌾 **Farms:** Meet the farmers behind the land.
    2. 🌾 **Farm Stays:** Stay closer to nature.
    3. 🌾 **Experiences:** Hands-on planting, harvesting, and workshops.
    4. 🌾 **Events:** Seasonal activities and harvest periods.
    5. 🌾 **Products:** Fresh crops and locally made products.
    6. 🌾 **Farm Kitchen:** Farm-to-table meals and specialties.
* [ ] **AC-4 (Section 4: The Farm Feed):**
  - Headline: *"SEE FARM LIFE AS IT HAPPENS — The Farm Feed"*
  - Value points: Watch harvest, meet animals, follow the farmer's journey.
  - Tagline: *"Scroll. Discover. Follow a farm."* with CTA `[ Explore the Farm Feed ]`.
* [ ] **AC-5 (Section 5: Multi-Value Proposition):**
  - Headline: *"ONE FARM. MANY POSSIBILITIES."*
  - 6 actionable user verbs: **STAY**, **EXPERIENCE**, **EAT**, **SHOP**, **JOIN**, **FOLLOW**.
* [ ] **AC-6 (Section 6: For Farmers Supply Pitch):**
  - Headline: *"FOR FARMERS — Your farm deserves more than a social media post."*
  - Checklist: Create profile, share story, post videos, promote experiences, list stays, announce events, showcase products, offer kitchen dining.
  - Tagline: *"Your farm. Your story. Your offerings."* with CTA `[ Become a UMANI Farmer ]`.
* [ ] **AC-7 (Section 7: Why UMANI):**
  - 5 core differentiators: **Farmer-First**, **Whole-Farm**, **Discovery-Driven**, **Community-Centered**, **More Ways to Earn**.
* [ ] **AC-8 (Section 8: Brand Manifesto & Dual Final CTA):**
  - Manifesto: *"The farm is more than a destination. It is a livelihood, story, food, culture, knowledge, experience, community, LIFE. UMANI brings it all together."*
  - Dual CTAs: `[ Explore Farms ]` and `[ Join UMANI ]`.
* [ ] **AC-9 (Section 9: Structured Footer):**
  - Logo and *"Bring the whole farm online."*
  - Navigation links categorized under: **Explore** (Farms, Experiences, Events, Products, Farm Kitchen, Farm Feed), **For Farmers** (Join UMANI), **Company** (About UMANI, Contact).
  - Sign-off: *"Discover the farm. Follow the story. Experience more."*

### 2.4 Non-Goals
* **No Blocking Paywalls or Mandatory Login:** The landing page and exploration flows remain completely open and accessible without forcing registration before browsing.

---

## 3. Technical Specifications

### 3.1 Performance & Assets
* **Image Optimization:** Modern WebP/AVIF formats with responsive `srcset` and layout-stable skeleton placeholders to achieve Cumulative Layout Shift (CLS) $< 0.05$.
* **Web Share API Integration:** Native mobile share sheet via `@capacitor/share` and navigator `share()` on modern desktop browsers with clipboard URL fallback.
* **SEO & JSON-LD:** Structured schema markup for `WebSite`, `Organization`, and `SiteNavigationElement`.

---

## 4. Risks & Phased Roadmap

### 4.1 Phased Rollout
* **Phase 1:** Landing page layout and responsive editorial styling.
* **Phase 2:** Live dynamic counters (active farms, registered hosts, upcoming harvest events).
* **Phase 3:** Farmer onboarding interactive preview tool.
