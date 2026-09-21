# SPEC-002: Responsive Design & Accessibility Standards (WCAG 2.2 & Mobile Layout)

> **MANDATORY DESIGN & FRONTEND ENGINEERING SPECIFICATION:**  
> All UI components, page layouts, forms, media players, and navigation elements across UMANI (Web and native Capacitor apps) MUST comply with the standards documented here.

---

## 1. Skill Arsenal & Architectural Foundations

UMANI leverages a multi-layered skill arsenal to enforce professional visual design, responsive layout across all screen dimensions, and strict human accessibility:

1. **`antislop-layoutmobile` (Responsive & Continuous Viewport Layout):**
   - **Continuous Reflow:** Eliminates the "two-state layout" trap where tablet/small-laptop widths (600px–1024px) become an awkward stretched column or crammed grid. Defines deliberate multi-step reflow states.
   - **Intrinsic Fluidity:** Employs CSS Grid `minmax()`, `auto-fill`/`auto-fit`, Flexbox wrapping, and fluid typography via `clamp()`.
   - **Dynamic Viewport Units:** Uses `dvh` (Dynamic Viewport Height) instead of `100vh` to prevent mobile address bar jumping and overflow clipping.
   - **Zero Horizontal Overflow:** Enforces `min-width: 0` on flex/grid children and wraps long strings to guarantee zero sideways scrolling at 320px width.
   - **Mobile-First Touch Ergonomics:** Enforces 44×44px touch targets, thumb-zone placement, and safe-area padding (`env(safe-area-inset-*)`).

2. **`antislop-human` (Human Usability & Accessibility Engine):**
   - **Contrast Calculation:** Scripted and formulaic contrast verification (4.5:1 for normal text, 3:1 for large text $\ge 18\text{px}$, 3:1 for non-text UI components).
   - **Focus Indicator Integrity:** Visible `:focus-visible` ring on all interactive elements; prohibits `outline: none` without an accessible replacement.
   - **Keyboard Operability:** Logical DOM tab order matching visual flow; Enter/Space activation; modal dismiss via `Escape`.
   - **Multimodal State Feedback:** Never communicates status (success/error/warning) by color alone; always pairs with text, icons, or patterns.
   - **Text Resizing & Virtual Keyboard Safety:** Accommodates 200% text zoom without clipping; scrolls focused form fields above on-screen software keyboards.

3. **`refactoring-ui` (Visual Hierarchy & Systemic Design Tokens):**
   - **Grayscale-First Workflow:** Solves spacing, hierarchy, and contrast in grayscale before applying the organic *Terraced Light* color palette.
   - **Constrained Spacing Scale:** 4px, 8px, 16px, 24px, 32px, 48px, 64px scale.
   - **Reading Measure:** Constrains reading containers to 45–75 characters (`max-w-prose` ~65ch) and forms to 300–500px.
   - **Elevation Scale:** Two-layer elevation shadows (crisp dark contact shadow + soft ambient atmospheric spread).

4. **`web-design-guidelines` (Vercel Web Interface Guidelines):**
   - Semantic HTML5 prioritization (`<button>` for actions, `<a>` for routes, `<label>` bound to inputs).
   - ARIA requirements (`aria-label` on icon buttons, `aria-hidden="true"` on decorative icons, `aria-live="polite"` on toasts/badges).
   - Animation safeguards: `@media (prefers-reduced-motion: reduce)`, animating only GPU-composited `transform` and `opacity`.

---

## 2. WCAG 2.2 Level AA Compliance Checklist for UMANI

| WCAG Criterion | Level | Specification Requirement | UMANI Implementation Standard |
| :--- | :---: | :--- | :--- |
| **1.4.3 Contrast (Minimum)** | AA | 4.5:1 for body text; 3:1 for large text ($\ge 18\text{px}$ or $14\text{px}$ bold). | All text in *Terraced Light* palette (Canopy Green, Sage, Linen, Terracotta) must pass formula check. Text over photos must use a dark gradient scrim (`from-black/80`). |
| **1.4.11 Non-Text Contrast** | AA | 3:1 contrast for interactive boundaries, icons, and focus rings. | Input borders, map pins, calendar date pills, and toggle switches must maintain $\ge 3:1$ against adjacent backgrounds. |
| **1.4.10 Reflow** | AA | Content reflows without 2D scrolling down to 320 CSS pixels. | Grid columns collapse to single column at $\le 640\text{px}$; no horizontal scrollbars on mobile viewports. |
| **1.4.4 Resize Text** | AA | Content resizes up to 200% without loss of content or function. | Font sizes set in `rem` or fluid `clamp()`; no fixed-height clipping wrappers (`overflow: hidden` on text containers). |
| **2.4.11 Focus Not Obscured (Min)** | AA | Focused item must not be entirely hidden by sticky/floating content. | Bottom navigation bar, sticky booking drawers, and headers must enforce `scroll-padding` and `scroll-margin` so focused elements are never covered. |
| **2.5.8 Target Size (Minimum)** | AA | Pointer targets must be at least 24×24 CSS pixels or have offset spacing. | Primary buttons: 44×44px (Apple HIG/Google M3); secondary badges/pills: min 24×24px with $\ge 8\text{px}$ padding hit box. |
| **2.5.7 Dragging Movements** | AA | Single-pointer alternatives provided for dragging interactions. | Map dragging includes +/- zoom buttons and list fallback; reel dragging includes tap controls and hotkeys. |
| **2.1.1 & 2.1.2 Keyboard Operability**| AA | All functionality operable via keyboard with no keyboard traps. | Full tab navigation; modals trap focus while open; `Escape` closes drawers, modals, and fullscreen video. |
| **2.3.3 Motion Animation** | AAA | Motion triggered by interaction can be disabled. | Autoplay reels, animated heart pops, and parallax banners must respect `@media (prefers-reduced-motion: reduce)`. |
| **3.3.7 Redundant Entry** | AA | Previously entered user info is auto-populated or available. | Guest details entered in Stage 1 auto-populate checkout forms and guest manifests. |
| **3.3.8 Accessible Authentication** | AA | No cognitive function tests; support password managers & copy-paste. | Allows clipboard paste on all auth fields; supports SMS OTP `autocomplete="one-time-code"`. |

---

## 3. Responsive Layout Architecture Across All Screen Dimensions

### 3.1 Fluid & Continuous Breakpoint Scale

Rather than designing for isolated phone models, UMANI uses a continuous 4-tier reflow model:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTINUOUS VIEWPORT REFLOW MATRIX                         │
├────────────────────┬────────────────────┬────────────────────┬─────────────────────────┤
│ 1. MOBILE NARROW   │ 2. MOBILE & TABLET │ 3. DESKTOP CANVAS  │ 4. WIDE THEATER         │
│ (< 640px)          │ (640px – 1024px)   │ (1024px – 1440px)  │ (> 1440px)              │
├────────────────────┼────────────────────┼────────────────────┼─────────────────────────┤
│ • 1 Column Stack   │ • 2 Column Grid    │ • 3 Column Canvas  │ • Centered 1440px Max   │
│ • Bottom 5-Tab Nav │ • Collapsible Rail │ • Persistent Nav   │ • Expanded Side Rails   │
│ • Fullscreen 9:16  │ • Split Cards      │ • 640px Center Stg │ • High-Res Gallery Grid │
│ • Touch Ergonomics │ • Adaptive Tables  │ • Right Widget Rail│ • Ambient Theater Glow  │
└────────────────────┴────────────────────┴────────────────────┴─────────────────────────┘
```

### 3.2 Dynamic Viewport Height & Mobile Chrome Protection
* **Unit Standard:** Use `dvh` for full-screen mobile surfaces (AgriReels vertical video viewport, full-height slide-over drawers).
* **Safe-Area Insets:** Hardware notches, dynamic islands, and home indicator bars are handled dynamically:
  ```css
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  ```
* **Virtual Keyboard Clearance:** Inputs at the lower half of the screen must incorporate `scroll-into-view` with bottom offset padding so the native mobile keyboard never occludes active form fields.

### 3.3 Touch Targets & Ergonomic Thumb Zones
* **Primary Actions (Floating CTAs, Book Now, Add to Cart):** Minimum 44×44 CSS pixels. Positioned within the natural "Thumb Zone" (lower 40% of the mobile viewport).
* **Secondary Actions (Tags, Share, Heart Like):** Minimum 32×32 CSS pixels with transparent hit-box padding extending to 44×44px.
* **Touch Feedback:** Instant visual feedback (`:active` scale or subtle opacity shift) and light native haptics (`Haptics.impact({ style: ImpactStyle.Light })`).

---

## 4. Color, Contrast & Typography Rules (*Terraced Light* System)

### 4.1 Contrast Standards for Natural Palettes
* **Backgrounds:** Pure white (`#FFFFFF`) or Warm Linen (`#FAF8F5`).
* **Headings & Body Copy:** Forest Deep (`#14281D` — Contrast ratio: 15.8:1 on Linen, exceeds WCAG AAA) or Bark Gray (`#2C2A29` — Contrast ratio: 12.4:1).
* **Muted / Metadata Labels:** Slate Bark (`#5A5551` — Contrast ratio: 5.2:1, passes WCAG AA).
* **Prohibited Anti-Pattern:** Never render light Sage (`#A3B19B`) or muted Terracotta as body text on Linen; Sage and Terracotta are reserved for backgrounds, filled buttons, or bold accent badges with dark contrasting labels.

### 4.2 Video Reel Text Scrim
* Text overlays on short-form video reels (farmer name, caption, commerce pill) must sit over an absolute gradient scrim:
  ```css
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
  ```
  This guarantees $\ge 4.5:1$ text contrast regardless of whether the video frame behind it is dark soil, green canopy, or bright tropical sky.

### 4.3 Typography Scale & Fluid Clamping
* **Headings:**
  * Hero $H_1$: `clamp(2rem, 5vw + 1rem, 3.5rem)` (`leading-tight`, `font-bold`, `text-wrap: balance`).
  * Section $H_2$: `clamp(1.5rem, 3vw + 0.5rem, 2.25rem)` (`leading-tight`).
  * Component $H_3$: `1.25rem` to `1.5rem`.
* **Body:** `1rem` ($16\text{px}$) base, `leading-relaxed` ($1.625$), `max-w-prose` ($65\text{ch}$).
* **Numbers & Pricing:** Always render with `font-variant-numeric: tabular-nums` to prevent layout jitter in pricing calculators and countdown clocks.

---

## 5. Focus & Keyboard Navigation Specifications

1. **Focus Ring Standard:**
   ```css
   :focus-visible {
     outline: 2px solid #1E4D2B; /* Canopy Green */
     outline-offset: 2px;
   }
   ```
2. **Sticky Element Focus Margin:**
   * Any page with a sticky header or sticky bottom nav must declare:
     ```css
     html {
       scroll-padding-top: 4.5rem; /* Header height */
       scroll-padding-bottom: 5rem; /* Mobile bottom nav height */
     }
     ```
   * This guarantees compliance with **WCAG 2.2 SC 2.4.11 (Focus Not Obscured)**.
3. **Modal & Drawer Focus Traps:**
   * When opening the Booking Drawer, Reels Theater modal, or Auth dialog, focus must be trapped inside the active container. Pressing `Escape` must close the dialog and return focus to the trigger element.

---

## 6. Motion & Cognitive Accessibility

1. **Reduced Motion Implementation:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
     video[autoplay] {
       autoplay: false;
     }
   }
   ```
2. **Video Reel Motion Rule:** When `prefers-reduced-motion: reduce` is detected, AgriReels shall not auto-play; instead, they display the video thumbnail with a prominent, keyboard-accessible "Play Video" button.
