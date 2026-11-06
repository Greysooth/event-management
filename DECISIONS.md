# Architectural Decisions Log

This document records architectural, data model, and implementation decisions for the Responsive Event Management Website in accordance with the project rules.

---

## ADR 01: Architecture & Deployment Strategy
- **Context**: The project problem statement requires a responsive event management website deployed to platforms such as Vercel. A bonus challenge awards points for "Local Storage-based registration data management". We evaluated whether to build a full backend on Render with a database versus a client-side architecture on Vercel with LocalStorage.
- **Decision**: Deploy frontend-only on Vercel (with full GitHub Pages compatibility). All registration persistence and theme preferences will use browser `localStorage` as targeted in the bonus challenge.
- **Demo Scope & Boundaries**:
  - Registration and capacity management is explicitly client-side demo behavior.
  - Data is stored per-device/browser using persistent `localStorage`; it is not authoritative across multiple concurrent visitors. If browser storage is unavailable, data falls back to memory for the current page load only.
  - A subtle UI banner/badge indicates: `"Demo Mode: Registrations are saved locally on this browser"`.
  - The storage module (`js/storage.js`) exposes a synchronous adapter. Replacing it with a network-backed API will require asynchronous handling in callers.
- **Consequences**: Zero cold starts (eliminating the 50-90s spin-up delay of Render free tier), zero maintenance overhead, 100% uptime for graders, and direct alignment with course bonus rubrics.

---

## ADR 02: Time Model, Timezones, and Authoritative Fields
- **Context**: The data model defines `date` as an ISO timestamp and `time` as a string. Because venues span multiple timezones (e.g. San Francisco PST, Chicago CST, Boston EST), displaying UTC timestamps formatted in the visitor's local timezone could conflict with the displayed event schedule.
- **Decision**:
  - The `date` field in `Event` is stored as an ISO 8601 string containing the venue's local timezone offset (e.g., `"2026-11-25T09:00:00-08:00"`).
  - `date` is the authoritative source of truth for chronological sorting and the dynamic countdown timer.
  - The venue's local timezone is authoritative for event scheduling. The `time` field represents the venue-local start and end times (e.g., `"09:00 AM - 05:00 PM PST"`).
  - Event cards and detail modals will explicitly display the venue timezone so visitors understand when the event occurs regardless of their current device timezone.
- **Consequences**: Eliminates time ambiguity and ensures countdown timers compute exact remaining milliseconds to the start instant.

---

## ADR 03: Derived Capacity & Event Versioning
- **Context**: The `Event` model specifies `capacity`. If capacity were stored as mutable state in `localStorage`, cache invalidation between hardcoded sample events and stored events would cause data divergence or stale overwrites.
- **Decision**:
  - `capacity` on `Event` represents the immutable total venue capacity (e.g., `150`).
  - Remaining available spots is always a derived value computed at runtime:
    $$\text{remainingSpots} = \text{event.capacity} - \text{registrations.filter}(r \implies r.\text{eventId} \equiv \text{event.id}).\text{length}$$
  - The sample events catalog is kept canonical in `js/events.js`. We do NOT serialize or mutate the static event list in `localStorage`.
  - Only user actions (`registrations` array and `theme` string) are stored in `localStorage`.
  - A schema version key (`APP_STORAGE_VERSION = "v1.0"`) is tracked. If the schema evolves, older versions can be safely migrated or reset without crashing.
- **Consequences**: Adding, canceling, or removing registrations immediately recalculates derived capacity accurately without data inconsistency.

---

## ADR 04: Registration ID Generation & Email Normalization
- **Context**: Unique IDs and duplicate registration prevention need consistent definitions.
- **Decision**:
  - **Registration ID**: Generated using timestamp and pseudo-random alphanumeric suffix:
    `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  - **Email Normalization**: Prior to comparison or persistence, email strings are sanitized via `email.trim().toLowerCase()`.
  - **Duplicate Registration Check**: An attendee cannot register twice for the same `eventId` using the same normalized email address.
  - **Cancellation Rule**: Users can cancel their registration from the "My Registrations" view. Deleting the registration from the stored array automatically restores the derived capacity.
- **Consequences**: Consistent, predictable duplicate prevention and idempotent cancellation flows.

---

## ADR 05: LocalStorage Resilience & Fallback Handling
- **Context**: `localStorage` may fail due to private browsing restrictions, disabled cookies, or quota limits (`QuotaExceededError`).
- **Decision**:
  - All storage reads and writes in `js/storage.js` are wrapped in `try...catch` blocks.
  - If `localStorage` is unavailable or throws an exception, the module gracefully falls back to an in-memory JavaScript `Map` cache.
  - If corrupted JSON is detected, the module removes the invalid key, returns that key's safe default, and logs a warning instead of breaking the UI.
- **Consequences**: The application will not throw unhandled exceptions or crash in restricted browser environments.

---

## ADR 06: Shift-Left Responsiveness and Accessibility Standards
- **Context**: Postponing responsiveness and accessibility to late polish phases risks messy retrofitting. The assignment rubric considers responsiveness and accessibility core requirements.
- **Decision**:
  - Mobile (375px), Tablet (768px), and Desktop (1280px) responsiveness is built into each component during its primary phase (Phases 1 through 4).
  - Accessibility requirements (semantic HTML5 tags `<header>`, `<nav>`, `<main>`, `<dialog>`, `<section>`, explicit `<label for="...">` associations, `alt` text on images, keyboard focus rings, and Escape key handling) are mandatory completion criteria for Phases 1–4.
  - Phase 5 is strictly reserved for bonus enhancements: dark/light theme toggle, real-time countdown interval timers, and micro-animations with `prefers-reduced-motion` support.
- **Consequences**: Ensures clean, robust code quality throughout development with zero console errors and accessible foundations from day one.

---

## ADR 07: Deployment URL Paths & Server Protocol
- **Context**: Deploying to GitHub Pages (`https://<user>.github.io/<repo>/`) or Vercel can cause asset 404 errors if absolute paths like `/css/style.css` are used. Additionally, ES Modules (`type="module"`) are blocked under the `file://` protocol by CORS policies.
- **Decision**:
  - All asset links in `index.html` and CSS must use repository-relative paths (`./css/style.css`, `./js/app.js`, `./assets/...`).
  - Case-sensitivity of all file names and directories is strictly preserved.
  - Development and manual testing must use a local HTTP server (`npx serve .`, `python -m http.server 8000`, or VS Code Live Server) rather than opening `index.html` directly from the filesystem.
- **Consequences**: Zero broken links on GitHub Pages subpaths or Vercel custom domains; reliable ES module loading.

---

## ADR 08: Modal Dialogs & Mobile Navigation
- **Context**: Detail modals and registration forms require proper focus management and accessibility.
- **Decision**:
  - Use the native HTML5 `<dialog>` element (`event-modal`, `confirmation-modal`, `my-registrations-modal`).
  - Native `.showModal()` provides automatic backdrop rendering, focus trapping, and `Escape` key dismissal.
  - Mobile hamburger menu toggles `aria-expanded`, removes the closed menu from sequential keyboard navigation, traps Tab focus while open, and closes on Escape. Opening moves focus into the menu; Escape returns focus to the toggle.
- **Consequences**: Lightweight, semantic, zero external UI library dependencies.

---

## ADR 09: Secondary UI Interactions (Newsletter)
- **Context**: The footer includes a newsletter input that was previously unspecified.
- **Decision**:
  - The newsletter subscription is defined as an accessible interactive mock.
  - On submit, it validates the email format. If valid, it displays an accessible transient notification ("Thank you for subscribing to event alerts!") and clears the input without reloading the page.
- **Consequences**: Eliminates dead buttons and ensures every interactive control provides clear user feedback.

---

## ADR 10: Design Category Labels Match the Event Model
- **Context**: The visual design category list used labels that differed from the required `Event.category` values, which could lead to inconsistent filters and badges.
- **Decision**: Use `Technology`, `Music & Arts`, `Business & Networking`, and `Sports & Fitness` in the design category palette and visible category labels. Existing accent tokens are mapped to these categories without changing the event data model.
- **Consequences**: Design labels, event records, and future filter controls share the same category names.

---

## ADR 10: Adoption of DESIGN.md Specification
- **Context**: `DESIGN.md` defines the strict visual and design token specification for the event management platform ("hackathon meets festival": dark, glowing, neon-accented interface with rounded shapes and monospace details).
- **Decision**:
  - Adopt all tokens from `DESIGN.md` as the single source of truth for styling.
  - **Theme Strategy**: Dark-first by default on `:root` (`--bg: #0B0B1A`). Light theme is activated via `[data-theme="light"]` on the root `<html>` element.
  - **Typography**: Google Fonts loaded are **Space Grotesk** (600, 700) for headings, **Inter** (400, 500, 600) for body, and **JetBrains Mono** (500) for dates, countdowns, badges, and metadata labels.
  - **Focus States**: High-contrast outline `2px solid var(--accent-cyan)` with `3px` offset.
  - **Token Compliance**: All UI work uses only tokens defined in `DESIGN.md`.
- **Consequences**: Consistent, vibrant, high-impact aesthetic meeting all accessibility and contrast requirements.

---

## ADR 11: Editorial Patterns & UI Inspiration from design-refs
- **Context**: The user provided screenshots in `design-refs` featuring a high-end editorial gallery/event aesthetic (`NM ART & DESIGN`).
- **Decision**:
  - **Hero Feature Showcase**: Implement a segmented progress/pagination dash indicator under the hero spotlight (from `Screenshot 183901` and `183945`), allowing quick visual jumping across featured highlights with arrow navigation (`← →`).
  - **Event Card Framing**: Fixed 16:10 aspect ratio with overlaid date chips in mono and category tags, paired with clean typography hierarchy (artist/organizer, venue, short summary, spots counter in mono).
  - **Modal / Registration Drawer Architecture**: Inspired by `Screenshot 183913`, the registration modal features a top "Event Summary Strip" (mini thumbnail, event title, venue, and date badge) directly above the form fields, giving users clear context of what they are registering for.
  - **Form Input Styling**: Clean, high-legibility input rows with clear focus glow, validation feedback, and full-width primary CTA button.
- **Consequences**: Elevated UI/UX that blends the playful neon tech aesthetic of `DESIGN.md` with the refined editorial structure of the design references.
