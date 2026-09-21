# WF-002: Public Landing Page Wireframe & Content Specification

**Document ID:** WF-002  
**Category:** UX/UI Wireframe Layout, Copy Inventory & Component Architecture  
**Target Milestone:** UMANI v3.0 Baseline  
**Governing Documents:** [`SRS.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/SRS.md), [`docs/prd/PRD-006-landing-page-and-growth.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/prd/PRD-006-landing-page-and-growth.md), [`docs/PRODUCT_VISION_V2.md`](file:///home/zeto/Desktop/UMANI%20%28AgriBNV%29/docs/PRODUCT_VISION_V2.md)  

---

## 1. Landing Page Architecture Overview

The UMANI landing page is designed around the *Terraced Light* design philosophy (earth-rooted natural organic tones: Canopy Green, Sage, Warm Linen/Cream, and Terracotta). It transitions the brand from a transactional booking portal to a farmer-centered agritourism ecosystem with dual conversion paths for **travelers/consumers** and **farmers/hosts**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [NAVBAR]  UMANI (UMA + ANI)            [Explore] [Feed] [About]  [Become a Host] [Login]│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. HERO SECTION                                                                         │
│    "Bring the whole farm online."                                                       │
│    "Discover farmers, farms, experiences, products, events, food, and stories..."       │
│    [ Explore Farms ]                       [ Join UMANI as a Farmer ]                   │
│    "From the farm to your screen, and eventually to your table..."                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BRAND PHILOSOPHY                                                                     │
│    "DISCOVER MORE THAN A FARM STAY"                                                     │
│    "A farm is more than a place to sleep... UMANI brings it all together."              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. THE 6 ECOSYSTEM PILLARS ("EXPLORE THE FARM")                                         │
│    🌾 Farms  🌾 Farm Stays  🌾 Experiences  🌾 Events  🌾 Products  🌾 Farm Kitchen      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. DISCOVERY ENGINE ("SEE FARM LIFE AS IT HAPPENS")                                     │
│    "The Farm Feed — What if you could experience farm life before you even visit?"      │
│    "Scroll. Discover. Follow a farm." -> [ Explore the Farm Feed ]                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. MULTI-VALUE CAPABILITIES ("ONE FARM. MANY POSSIBILITIES.")                           │
│    STAY • EXPERIENCE • EAT • SHOP • JOIN • FOLLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. SUPPLY-SIDE EMPOWERMENT ("FOR FARMERS")                                              │
│    "Your farm deserves more than a social media post."                                  │
│    "Your farm. Your story. Your offerings." -> [ Become a UMANI Farmer ]                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 7. VALUE PROPOSITIONS ("WHY UMANI?")                                                    │
│    • Farmer-First  • Whole-Farm  • Discovery-Driven  • Community  • More Ways to Earn   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 8. MANIFESTO & DUAL FINAL CTA                                                           │
│    "THE FARM IS MORE THAN A DESTINATION."                                               │
│    "It is a livelihood. It is a story. It is food, culture, knowledge, LIFE."          │
│    [ Explore Farms ]                                  [ Join UMANI ]                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 9. STRUCTURED FOOTER                                                                    │
│    UMANI (UMA + ANI) — "Bring the whole farm online."                                   │
│    [Explore: Farms, Stays, Experiences, Events, Products, Kitchen, Feed]                │
│    [For Farmers: Join UMANI]  [Company: About, Contact]                                 │
│    "Discover the farm. Follow the story. Experience more."                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Section Blueprint & Copy Inventory

### Section 1: Hero Block
* **Headline:** `Bring the whole farm online.`
* **Sub-Headline:** `Discover farmers, farms, experiences, products, events, food, and stories—all in one place.`
* **Primary Conversion Actions:**
  * Primary Button (Linen on Forest Green): `[ Explore Farms ]` $\longrightarrow$ routes to `/explore`
  * Secondary Button (Outlined / Frosted Glass): `[ Join UMANI as a Farmer ]` $\longrightarrow$ routes to `/host/onboarding`
* **Narrative Footnote:** `From the farm to your screen, and eventually to your table, your next experience, or your next adventure.`
* **Visual Treatment:** High-resolution organic panoramic video loop/carousel of working Philippine farms (rice terraces, mango groves, beekeeping) with soft ambient warm gradient overlay.

---

### Section 2: Philosophy ("Discover More Than a Farm Stay")
* **Section Eyebrow:** `OUR PHILOSOPHY`
* **Headline (Editorial Display):** `DISCOVER MORE THAN A FARM STAY`
* **Narrative Rhythm:**
  * *"A farm is more than a place to sleep."*
  * *"It's the people who grow your food."*
  * *"The harvest that changes with the seasons."*
  * *"The meals made from what the farm produces."*
  * *"The stories behind the land."*
  * *"The experiences waiting to be discovered."*
  * **"UMANI brings it all together."**
* **Visual Treatment:** Clean editorial typography with generous whitespace, subtle sage borders, and staggered fade-in animations on viewport intersection.

---

### Section 3: Ecosystem Showcase ("Explore the Farm")
* **Headline:** `EXPLORE THE FARM`
* **Sub-Headline:** `Six ways to discover and experience working agricultural life.`
* **6-Card Interactive Grid:**
  1. 🌾 **Farms:** *"Meet the farmers behind the land and discover what makes every farm different."*
  2. 🌾 **Farm Stays:** *"Stay closer to nature and experience life on the farm."*
  3. 🌾 **Experiences:** *"Get your hands dirty. Plant, harvest, explore, learn, and experience nature firsthand."*
  4. 🌾 **Events:** *"Discover what's happening on farms—from harvests and workshops to seasonal activities."*
  5. 🌾 **Products:** *"Discover fresh and locally made products directly from farms."*
  6. 🌾 **Farm Kitchen:** *"Taste what the farm has to offer through farm-to-table meals and local specialties."*
* **Interaction:** Hovering on any card elevates the container with a soft drop shadow, displays a subtle terracotta accent indicator, and links to the relevant filtered explore view.

---

### Section 4: Discovery Engine ("See Farm Life As It Happens")
* **Headline:** `SEE FARM LIFE AS IT HAPPENS`
* **Sub-Header (Display Serif):** `The Farm Feed`
* **Lead Copy:** `What if you could experience farm life before you even visit? Farmers can share short videos and stories directly from their farms.`
* **Bullet Points:**
  * `• See what's growing.`
  * `• Watch the harvest.`
  * `• Meet the animals.`
  * `• Follow the farmer's journey.`
  * `• Discover what's happening today.`
* **Anchor Tagline:** `Scroll. Discover. Follow a farm.`
* **Action Trigger:** `[ Explore the Farm Feed ]` $\longrightarrow$ routes to `/feed`
* **Visual Treatment:** Mockup of 3 staggered 9:16 mobile phone viewports displaying active AgriReels with ambient color halos, auto-playing looping video snippets.

---

### Section 5: Multi-Value Matrix ("One Farm. Many Possibilities.")
* **Headline:** `ONE FARM. MANY POSSIBILITIES.`
* **Sub-Headline:** `A farmer's story doesn't end with the harvest. Through UMANI, one farm can become a place to:`
* **6 Action Pillars:**
  * **STAY:** `Spend a night surrounded by nature.`
  * **EXPERIENCE:** `Learn and participate in real agricultural activities.`
  * **EAT:** `Taste food prepared from the farm and its community.`
  * **SHOP:** `Discover products grown or made by the farmer.`
  * **JOIN:** `Attend events and seasonal activities.`
  * **FOLLOW:** `Stay connected with the farm even after you leave.`
* **Layout:** 3x2 grid of modern minimalist cards styled in warm natural tones with micro-icon accents.

---

### Section 6: Supply Acquisition ("For Farmers")
* **Eyebrow:** `FOR FARMERS`
* **Headline:** `Your farm deserves more than a social media post.`
* **Sub-Headline:** `UMANI gives farmers one digital space to showcase their entire farm.`
* **Feature Capability Checklist:**
  * `✓ Create your farm profile.`
  * `✓ Share your story.`
  * `✓ Post videos.`
  * `✓ Promote your experiences.`
  * `✓ List your stays.`
  * `✓ Announce events.`
  * `✓ Showcase your products.`
  * `✓ Offer food through your farm kitchen.`
* **Closing Tagline:** `Your farm. Your story. Your offerings.`
* **CTA Button:** `[ Become a UMANI Farmer ]` $\longrightarrow$ routes to `/host/onboarding`
* **Visual Treatment:** Split 50/50 desktop banner featuring a verified farmer portrait with an overlay of the Farm Profile dashboard metrics.

---

### Section 7: Value Pillars ("Why UMANI?")
* **Headline:** `WHY UMANI?`
* **5 Pillars (Horizontal Cards or Accordion):**
  1. **FARMER-FIRST:** `Built around the farmer.`
  2. **WHOLE-FARM:** `Showcase everything your farm has to offer in one place.`
  3. **DISCOVERY-DRIVEN:** `Help people discover farms through stories, videos, experiences, and products.`
  4. **COMMUNITY-CENTERED:** `Create stronger connections between farmers, visitors, and local communities.`
  5. **MORE WAYS TO EARN:** `Help farmers create opportunities beyond the traditional sale of agricultural harvest.`

---

### Section 8: Brand Manifesto & Dual Final CTA
* **Manifesto Rhythm:**
  * *"THE FARM IS MORE THAN A DESTINATION."*
  * *"It is a livelihood."*
  * *"It is a story."*
  * *"It is food."*
  * *"It is culture."*
  * *"It is knowledge."*
  * *"It is an experience."*
  * *"It is a community."*
  * *"It is LIFE."*
  * **"UMANI brings it all together."**
* **Action Trigger:** `[ Discover UMANI ]` $\longrightarrow$ scrolls to explore section.
* **Dual Conversion Action Block:**
  * **Visitor Funnel:**
    * Headline: `Ready to discover what's growing?`
    * Subtext: `Explore farms, meet farmers, and find your next experience.`
    * CTA: `[ Explore Farms ]` $\longrightarrow$ `/explore`
  * **Farmer Funnel:**
    * Headline: `Are you a farmer?`
    * Subtext: `Bring your farm online and let more people discover what you do.`
    * CTA: `[ Join UMANI ]` $\longrightarrow$ `/host/onboarding`

---

### Section 9: Structured Global Footer
* **Brand Header:** **UMANI** (*UMA + ANI*)
* **Tagline:** `Bring the whole farm online.`
* **Navigation Links:**
  * **Explore:** `Farms`, `Experiences`, `Events`, `Products`, `Farm Kitchen`, `Farm Feed`
  * **For Farmers:** `Join UMANI`
  * **Company:** `About UMANI`, `Contact`
* **Brand Sign-Off:** `Discover the farm. Follow the story. Experience more.`
* **Legal & Copyright:** `© 2026 UMANI. All rights reserved. Philippine DPA (RA 10173) Compliant.`
