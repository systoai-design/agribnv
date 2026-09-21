# UMANI QA & Testing Standards

This document serves as the absolute truth for testing standards within the UMANI platform.

## 1. Testing Pyramid & Tools
*   **Unit Tests (Vitest)**: Used for isolated functions, utility methods, and complex state hooks (`useQuery`).
*   **Component Tests (Vitest / React Testing Library)**: Used for isolated UI rendering.
*   **End-to-End Tests (Playwright)**: Simulates complete user journeys. Crucial for Checkout, Booking, and Auth flows.

## 2. Test Environments
*   **Capacitor (Mobile)**: Since Capacitor is a webview wrapper, the core logic should be fully tested using Playwright running in a Chromium browser.
*   **Native Features**: Any feature utilizing `@capacitor/camera` or `@capacitor/geolocation` MUST have its hardware calls mocked during Playwright E2E tests to prevent CI failures.

## 3. Playwright Best Practices
1. **Use `data-testid`**: Do not select by brittle CSS classes. Always use `data-testid` attributes or semantic accessible roles (`getByRole('button', { name: 'Submit' })`).
2. **Wait for State, Not Time**: Never use hardcoded `page.waitForTimeout()`. Rely on Playwright's auto-waiting capabilities or `waitForSelector`.
3. **Mocking External APIs**: Third-party APIs (e.g., PayMongo/Xendit) must be intercepted and mocked using `page.route()`.

## 4. Greybox Testing (GiST Exclusion)
When testing booking overlap functionality, tests should attempt to insert overlapping date ranges into the UI and verify that the application properly surfaces the Database-level GiST exclusion constraint error (`no_overlapping_bookings`) to the user as a friendly error message.
