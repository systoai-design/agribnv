# OWASP Web & Mobile Security Standards for UMANI

This document synthesizes the OWASP Top 10 Web Application Security Risks, OWASP API Security Top 10, and the OWASP Mobile Application Security Verification Standard (MASVS) specifically tailored to UMANI's React/Vite/Capacitor stack.

---

## 1. OWASP MASVS (Mobile Application Security Verification Standard)

Capacitor packages a web application inside a native WebView wrapper on iOS and Android. This hybrid nature introduces specific threat surfaces across both web and native domains.

### 1.1 MASVS-STORAGE (Data Storage & Privacy)
* **Local Storage & Session Tokens:** Standard `localStorage` is accessible to scripts within the WebView. For high-security environments, session tokens and private keys should be backed by native secure storage (iOS Keychain / Android Keystore) via Capacitor Secure Storage plugins.
* **Android Backup Extraction (`MASVS-STORAGE-2`):**
  * `AndroidManifest.xml` must set `android:allowBackup="false"` or specify `android:dataExtractionRules` to prevent `adb backup` extractions of application sandbox databases and tokens.
* **Sensitive Data in Logs (`MASVS-STORAGE-3`):**
  * Strip `console.log` statements outputting auth tokens, passwords, or guest PII in production builds.

### 1.2 MASVS-NETWORK (Network Communication)
* **Cleartext Traffic (`MASVS-NETWORK-1`):**
  * All communications must be forced to HTTPS / TLS 1.3.
  * In Android: `android:usesCleartextTraffic="false"`.
  * In iOS: Do not declare `NSAllowsArbitraryLoads = true` in `Info.plist`.
* **Capacitor Configuration:** Ensure `capacitor.config.ts` does not contain `server: { cleartext: true }` in production builds.

### 1.3 MASVS-PLATFORM (Platform Interaction & Permissions)
* **Principle of Least Privilege:**
  * Only request permissions strictly necessary for app features (Camera for harvest photos/reels, Geolocation for nearby farm discovery).
* **Mandatory iOS Usage Descriptions:**
  * iOS requires explicit, user-friendly justification strings in `Info.plist`:
    * `NSCameraUsageDescription`: Reason for accessing device camera.
    * `NSLocationWhenInUseUsageDescription`: Reason for accessing GPS.
    * `NSPhotoLibraryUsageDescription`: Reason for selecting photos.
  * Missing keys cause immediate App Store rejections or SIGABRT crashes on permission request.
* **Deep Link Verification:**
  * Validate deep links (`com.agribnv.app://` or Universal Links) to prevent intent injection or parameter tampering.

---

## 2. OWASP Top 10 (Web Application Security)

### 2.1 A01: Broken Access Control
* Client-side route guards (e.g. `ProtectedRoute.tsx`) are UX conveniences only. The true authorization boundary is ALWAYS the database Row Level Security policies and Edge Function JWT verification.
* Never trust client-sent user IDs or roles (`role === 'host'`); always evaluate `auth.uid()` and server-side roles in the database.

### 2.2 A02: Cryptographic Failures
* Ensure all data in transit uses TLS 1.3.
* Never store sensitive keys or tokens in public Git repositories.
* Use Web Crypto API or server-side crypto for cryptographic operations.

### 2.3 A03: Injection & Cross-Site Scripting (XSS)
* React protects against XSS by escaping string variables in JSX expressions `{value}`.
* **Dangerous Vectors:**
  * `dangerouslySetInnerHTML`: If used to render user descriptions or blog content, input MUST BE sanitized using `DOMPurify.sanitize(dirtyHtml)`.
  * Dynamic script execution (`eval()`, `new Function()`, `setTimeout(string)`).
  * Direct URL assignment in links: `<a href={userProvidedUrl}>` can trigger `javascript:` pseudo-protocol attacks. Always validate that URLs begin with `https://` or relative paths `/`.

### 2.4 A05: Security Misconfiguration & HTTP Headers
* **Content Security Policy (CSP):**
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://*.supabase.co https://*.basemaps.cartocdn.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cartocdn.com;
  ">
  ```
* **Referrer-Policy:** Set `<meta name="referrer" content="strict-origin-when-cross-origin">` to prevent leaking query parameters or paths to external CDNs.
* **Reverse Tabnabbing:** Every `<a target="_blank">` link must declare `rel="noopener noreferrer"`.
