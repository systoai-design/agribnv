# 0001. Establish System Architecture Governance and Invariant Linter

Date: 2026-09-19

## Status
Accepted

## Context & Problem Statement
UMANI is a hybrid web and native mobile application (Capacitor 8) built on top of React 18, Vite, and Supabase (PostgreSQL 15). As the platform expands across 6 ecosystem pillars (Stays, Experiences, Events, Products, Kitchen, and Feed), architectural entropy risks introducing circular dependencies, leaky platform abstractions, monolithic component bloat, and database double-booking race conditions.

To ensure long-term maintainability, high modularity, and adherence to non-negotiable architectural invariants:
- We need automated tooling to detect architectural violations before they merge.
- We need a standardized decision-capturing framework (ADRs).
- We need formal C4 modeling and ATAM trade-off analysis for system changes.

## Considered Options
1. **Option 1: Manual Code Reviews Only** (Prone to human error, missed circular imports, and inconsistent governance).
2. **Option 2: ESLint Alone** (Handles AST code smells, but lacks whole-graph dependency path analysis and database invariant checks).
3. **Option 3: Multi-Tool Architectural Governance (dependency-cruiser + madge + custom Python invariant linter + ADRs)** (Chosen).

## Decision Outcome
Chosen option: **"Multi-Tool Architectural Governance"**, because:
- `dependency-cruiser` enforces module boundaries (e.g. UI components cannot import pages) and fails CI on circular dependencies.
- `madge` provides rapid CLI circular dependency graph visualization.
- Custom `audit_architecture.py` validates repository-specific invariants (e.g. PostgreSQL GiST exclusion on `bookings.daterange`, Capacitor platform facades in `core/platform`).
- Standardized ADR repository in `docs/adr/` preserves decision rationale and trade-offs.

## Positive Consequences
- Immediate automated detection of import cycles (e.g. `Footer.tsx` ↔ `InspirationGallery.tsx`).
- Guaranteed protection of database concurrency invariants.
- Clear structural boundaries separating presentation, domain, and platform infrastructure.

## Negative Consequences & Trade-offs
- Slight overhead in CI build times (~2 seconds for dependency cruise).
- Developers must respect layer rules and extract shared types/constants when import cycles arise.

## Compliance & Architectural Invariants
- Enforces AGENTS.md Invariant 1 (Zero Double-Booking GiST exclusion).
- Enforces AGENTS.md Invariant 2 (Capacitor Platform Adapter Facade).
- Enforces Clean Architecture Dependency Rule.

## Verification & Validation
- Automated check: `npm run arch:audit` (runs `audit_architecture.py`).
- Dependency check: `npm run arch:cruise` (runs `depcruise src --config .dependency-cruiser.cjs`).
- Circular check: `npm run arch:circular` (runs `madge --circular ...`).

