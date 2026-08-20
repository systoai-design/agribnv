# Changelog / Development Log

This document serves as a reference for all the changes we have made to the Agribnv project, as well as features planned for the future.

## Completed Changes

### [2026-06-25]
- **Authentication**: Verified the addition of the "Forgot Password" feature.
  - Integrated Supabase's `resetPasswordForEmail` in `src/contexts/AuthContext.tsx`.
  - Added "Forgot password?" UI flow and state toggle in `src/pages/Auth.tsx` to handle sending reset links.
### [2026-08-20]
- **Supabase Integration & MCP Configuration**:
  - Configured [.mcp.json](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/.mcp.json) for Supabase MCP and PostgreSQL MCP integration.
  - Updated environment variables in [.env](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/.env) and [config.toml](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/supabase/config.toml) with project reference `zpyjixhgpftgxgtjfsca`.
  - Created [full_schema_sync.sql](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/supabase/full_schema_sync.sql) bundling all tables, enums, triggers, RLS policies, views, reviews, and storage policies.
  - Initialized `property-images` storage bucket on the remote Supabase project via Service Role.

### [2026-08-21]
- **iOS & Mobile Viewport / Input Auto-Zoom Fix**:
  - Configured viewport meta in `index.html` (`maximum-scale=1.0`) and added global 16px minimum font size for mobile input fields in `src/index.css` to prevent WKWebView/iOS auto-zoom.
- **Navigation & Category Filter Enhancements**:
  - Enhanced `FeaturedFarmsCarousel.tsx` with dedicated navigation controls (prev/next arrows) and pagination indicator dots.
  - Streamlined farmstay categories in `FarmstayCategories.tsx` and cleaned up Explore page navigation.
- **User Profile Data Collection & Auth Flow**:
  - Added `username` and `phone` support to database schema (`supabase/setup.sql` & migration `20260821000000_add_username_to_profiles.sql`).
  - Extended `Auth.tsx` signup form to collect username and contact number during onboarding.
  - Fixed profile display race condition in `AuthContext.tsx` via retry mechanism during initial sign-up.
  - Updated `Profile.tsx` with full editing support for full name, username, and contact number across Web, iOS, and Android Capacitor builds.

## Future Plans (TODO)
- *(Add future features, refactors, and planned changes here as they are decided)*

