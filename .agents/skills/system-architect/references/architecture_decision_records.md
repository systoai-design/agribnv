# Architecture Decision Records (ADR) Guide

An **Architecture Decision Record (ADR)** is a short text document that captures an important architectural decision, along with its context and consequences.

---

## 1. Why Use ADRs?

1. **Institutional Memory:** Explains the *why* behind critical engineering choices, preventing teams from repeatedly relitigating settled decisions or accidentally removing essential constraints.
2. **Onboarding & Alignment:** Provides new engineers and agents with an immediate historical record of how the platform evolved.
3. **Trade-Off Transparency:** Forces explicit documentation of trade-offs, risks, and negative consequences rather than pretending solutions are free of compromise.

---

## 2. ADR Lifecycle & Statuses

```
   ┌──────────┐
   │ Proposed │
   └────┬─────┘
        │
        ├───> [ Rejected ]
        │
   ┌────▼─────┐
   │ Accepted │
   └────┬─────┘
        │
        ├───> [ Deprecated ]
        │
   ┌────▼──────────────┐
   │   Superseded by   │
   │      ADR-XXXX     │
   └───────────────────┘
```

* **Proposed:** Under active RFC review by the System Architect and engineering team.
* **Accepted:** Formally approved; the decision is now an active architectural requirement.
* **Rejected:** The proposed decision was evaluated and not adopted. Context is preserved so future teams know why.
* **Deprecated:** The decision is no longer recommended for new features.
* **Superseded:** A newer decision replaces this one (link to the new ADR).

---

## 3. Standard ADR Anatomy (Michael Nygard / SEI Format)

Every ADR in `docs/adr/` follows this standard markdown format:

```markdown
# 0001. [Title of Architectural Decision]

Date: YYYY-MM-DD

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context & Problem Statement
What problem are we trying to solve? What technical, regulatory, or business forces are driving this decision?
- Technical context:
- Business drivers:
- Key quality attributes (e.g. latency, consistency, offline capability):

## Considered Options
1. **Option A:** [Description, pros, cons]
2. **Option B:** [Description, pros, cons]
3. **Option C:** [Description, pros, cons]

## Decision Outcome
Chosen option: **[Option Name]**, because:
- [Clear justification 1]
- [Clear justification 2]

## Positive Consequences
- [Expected benefit, capability unlocked, performance gain]

## Negative Consequences & Trade-offs
- [Technical debt incurred, complexity added, operational burden]
- [Mitigation strategy for negative consequences]

## Compliance & Architectural Invariants
- Invariants preserved or introduced:
- Regulatory impact (DPA, PCI DSS, BIR):

## Verification & Validation Plan
- How do automated tools enforce this decision? (e.g. dependency-cruiser rule, unit test, CI script)
```

---

## 4. Scaffolding New ADRs

To create a new ADR, run:
```bash
python3 .agents/skills/system-architect/scripts/create_adr.py "Short Descriptive Title"
```
This automatically assigns the next sequential four-digit number (e.g. `docs/adr/0001-use-tanstack-query-v5.md`).
