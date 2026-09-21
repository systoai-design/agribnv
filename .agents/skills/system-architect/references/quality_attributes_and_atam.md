# Quality Attributes & Architecture Tradeoff Analysis (ATAM)

The **Architecture Tradeoff Analysis Method (ATAM)**, developed by the Software Engineering Institute (SEI) at Carnegie Mellon University, is a rigorous methodology for evaluating software architectures based on quality attribute goals.

---

## 1. Quality Attributes (Non-Functional Requirements)

Architecture is fundamentally about managing trade-offs between competing quality attributes:

1. **Performance (Latency & Throughput):**
   - *Requirement:* Feed reels and public farm listings must render first meaningful paint in < 1.2s on 4G connections.
   - *Architectural Tactic:* Route-level code splitting, lazy component hydration, WebP/AVIF media transcoding, prefetching hero images.
2. **Availability & Resilience (Fault Tolerance):**
   - *Requirement:* UMANI must remain navigable and functional during sporadic rural cellular disconnects.
   - *Architectural Tactic:* Stale-While-Revalidate caching via TanStack Query, offline state persistence, optimistic UI updates.
3. **Data Consistency (ACID & Concurrency):**
   - *Requirement:* Zero double-booking across farm accommodations.
   - *Architectural Tactic:* PostgreSQL GiST exclusion constraints (`no_overlapping_bookings`) and row-level locking over optimistic application checks.
4. **Modifiability & Maintainability:**
   - *Requirement:* New modules (e.g. Farm Kitchen, Harvest Events) can be added without refactoring core booking logic.
   - *Architectural Tactic:* Vertical Slice Architecture, Feature-Sliced Design, loose coupling via Domain Events.
5. **Security & Regulatory Compliance:**
   - *Requirement:* Zero card data exposure (PCI DSS SAQ A) and strict data minimization (RA 10173).
   - *Architectural Tactic:* Outsource card capture to licensed PSP iframes (PayMongo/Xendit) and enforce database Row Level Security.

---

## 2. The ATAM Quality Attribute Scenario Format

When evaluating architectural decisions, specify quality requirements using concrete scenarios:

| Element | Description | UMANI Example (Booking Concurrency) |
| :--- | :--- | :--- |
| **Source** | The entity that generates the stimulus. | Two independent travelers on mobile phones. |
| **Stimulus** | The condition or request arriving at the system. | Simultaneous booking requests for the same kubo cottage and dates. |
| **Environment** | The operational condition of the system. | Normal production load during peak holiday harvest season. |
| **Artifact** | The architectural component stimulated. | Supabase PostgreSQL `bookings` table. |
| **Response** | The measurable behavior of the system. | One transaction commits; the second fails gracefully with an overlapping date error. |
| **Response Measure** | The quantitative benchmark. | Zero duplicate bookings; error returned to second guest in < 250ms. |

---

## 3. Trade-off Analysis Matrix

When making architectural choices, map the competing attributes:

```
                  ┌──────────────────────────────┐
                  │    Decision: GiST Exclusion  │
                  │     Constraint in Database   │
                  └──────────────┬───────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
   [+] Quality Gained                          [-] Trade-off Incurred
• Absolute Concurrency Safety               • Higher insertion overhead
• Guaranteed Zero Double-Booking             • Requires PostgreSQL btree_gist extension
• Database-enforced invariant               • Rejection handling required in client UI
```

---

## 4. Architectural Reviews & Gates

Before releasing major features, the System Architect reviews the implementation against the ATAM criteria:
1. **Sensitivity Points:** Architectural choices where a small change dramatically affects a quality attribute.
2. **Trade-off Points:** Architectural choices where improving one quality attribute degrades another.
3. **Architectural Risks:** Decisions that may lead to unintended consequences (e.g., circular dependencies or unindexed foreign keys in RLS).
