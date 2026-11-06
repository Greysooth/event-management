# EventPulse — Modern Responsive Event Management Platform

A modern, high-energy, and fully responsive event discovery and registration web application built with **HTML5**, **CSS3**, and **Vanilla JavaScript (ES Modules)**.

![Design System](https://img.shields.io/badge/Design%20Spec-DESIGN.md-6D4AFF?style=flat-square)
![Accessibility](https://img.shields.io/badge/A11y-WCAG%20AA%20Compliant-2EE59D?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Vanilla%20ESM-22E1FF?style=flat-square)
![Storage](https://img.shields.io/badge/Storage-Versioned%20LocalStorage-FF4D9D?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-C6FF3D?style=flat-square)

---

## 🌐 Live Demo & Repository

- **GitHub Repository**: [https://github.com/Greysooth/event-management](https://github.com/Greysooth/event-management)
- **Live Deployment**: Deployable with zero configuration on [Vercel](https://vercel.com/) or GitHub Pages.

---

## 🎯 Project Overview & Problem Statement

Develop a modern, visually appealing, and fully responsive event management website that allows users to explore upcoming events, view detailed event information, and register for their preferred events. The website provides an engaging user experience with a clean interface, intuitive navigation, and interactive components.

The platform follows a dark-first, glowing, neon-accented aesthetic (**"hackathon meets festival"**) guided by `DESIGN.md` and curated editorial patterns (`design-refs`). It is fully responsive across mobile phones (375px), tablets (768px), laptops (1024px), and wide desktop displays (1280px+).

---

## ✨ Key Features & Highlights

### 1. Hero Showcase & Interactive Featured Spotlight
- **Headline & Eyebrow**: Bold typography (`Space Grotesk`) with brand gradient text highlights (`--gradient-brand`), monospace eyebrow pill (`// UPCOMING EVENTS`), and live platform stats strip.
- **Hero Spotlight Card**: Showcases the next upcoming premier event with full details, venue-local schedule, derived capacity progress meter, and a primary registration CTA.
- **Segmented Slide Navigation**: Interactive segmented slider progress dashes and previous/next controls allowing users to cycle through featured events with keyboard and screen reader support (`role="group"`, `aria-pressed`).
- **Floating Ambient Orbs**: Subtle background gradient orbs animated with smooth floating motion (`@keyframes floatOrb`).

### 2. Live Countdown Engine (Bonus Feature ⏱)
- **Authoritative Time Calculation**: Computes venue-local remaining time down to the second against authoritative ISO 8601 strings with timezone offsets.
- **Structured Spotlight Countdown**: Live ticking countdown blocks displaying `DAYS : HOURS : MINS : SECS` with monospace typography (`JetBrains Mono`).
- **Featured Card Countdown Chips**: Compact countdown chips (`⏱ 18d 23h 37m 24s`) on all featured highlights cards.
- **Modal Countdown Banner**: Dedicated kickoff timer strip embedded in the event detail modal dialog.
- **Real-Time State Transitions**: Automatically transitions from countdown to `"LIVE NOW • HAPPENING TODAY"` with a pulsing beacon indicator when the event starts.
- **Master Single Interval**: A centralized 1-second interval scans active countdown components, eliminating memory leaks or timer desynchronization.

### 3. Real-Time Search, Filtering & Multi-Criteria Sorting
- **Debounced Text Search**: 250ms debounced search filtering by `title`, `venue`, `shortDescription`, `description`, and `category`.
- **Search Clear Action**: Instant clear button (`×`) appears when query is entered; keyboard accessible with `Escape` to clear.
- **Category Filter Pills**: Interactive filter pills for `All Events`, `Technology`, `Music & Arts`, `Business & Networking`, and `Sports & Fitness`. Each category pill features distinct glowing dot tokens (`--cat-tech`, `--cat-music`, `--cat-business`, `--cat-sports`).
- **Mobile Touch Snap**: Horizontal scrolling track with touch snapping (`scroll-snap-type: x mandatory`) on mobile viewports.
- **Multi-Criteria Sorting**:
  - `Date: Soonest first` (default)
  - `Date: Furthest first`
  - `Capacity: Most spots left` (dynamic derived capacity)
  - `Capacity: Fewest spots left`
  - `Alphabetical (A - Z)`
  - `Alphabetical (Z - A)`
- **Dynamic Result Counter**: Monospace live announcement chip (`8 EVENTS FOUND`) with `aria-live="polite"`.
- **Accessible Empty State**: Playful empty state illustration (`⚡`) when no events match the search/filter criteria, complete with a `"Clear filters"` button that restores default views and restores focus.

### 4. Event Detail Modal Dialog
- **Native Semantic `<dialog>`**: Built using HTML5 `<dialog>` with focus trapping, `Escape` key dismissal, backdrop blur click dismissal, and focus restoration to the triggering button.
- **Event Summary Strip**: Clean editorial breakdown including category badge, high-resolution header image, venue-local schedule, full description, and derived capacity breakdown.
- **Spring Entrance Motion**: Modal smoothly animates in with spring scale easing (`--ease-spring`).

### 5. Participant Registration & Live Validation
- **Accessible Form Structure**: Explicit `<label for="...">` associations, `aria-required`, and live error notification containers (`role="alert"`).
- **Client-Side Form Validation**:
  - **Full Name**: Validated via regex `^[a-zA-Z\s.'-]{2,60}$` (minimum 2 chars, letters and formatting characters only; rejects numbers and special symbols).
  - **Email Address**: RFC-compliant structure validation; normalized to lowercase.
  - **Phone Number**: Strips formatting characters and validates 10 to 15 digits (`^\d{10,15}$`).
- **Duplicate Registration Prevention**: Prevents multiple registrations for the same event using the same email address.
- **Derived Capacity & Sold Out State**:
  - Dynamically calculates remaining spots:
    $$\text{remaining} = \text{event.capacity} - \text{registrations.filter}(r \implies r.\text{eventId} \equiv \text{event.id}).\text{length}$$
  - Graphically illustrated with animated capacity meters (`.capacity-meter__bar`).
  - When derived capacity hits 0, registration buttons automatically disable and display `"Sold Out"`.
- **Interactive Validation Feedback**: Inputs shake on invalid submission (`@keyframes formShake`) and display field-specific helper text.

### 6. Confirmation Modal & "My Registrations" Management (Bonus Feature 💾)
- **Animated Confirmation**: Successful submission opens a confirmation dialog with an animated SVG checkmark draw, attendee name, event details, and a unique registration ID (`reg-...`).
- **"My Registrations" Modal**: Displays all registered events saved in `localStorage`.
- **Registration Cancellation**: Users can cancel any of their registrations directly from the drawer; cancelling automatically restores the derived capacity across cards, modals, and spotlight in real time.
- **Header Registration Counter**: Real-time registration count badge in the header navigation bar.
- **Storage Resilience**: Schema-versioned (`v1.0`), automatic corrupted JSON recovery, and in-memory fallback if `localStorage` is disabled or blocked.

### 7. Dark / Light Mode Switcher (Bonus Feature ☀️/🌙)
- **Design Token System**: Dark theme on `:root` and Light theme via `[data-theme="light"]` attribute on `<html>`.
- **Spring Rotating Icon**: Theme button features an animated 180° rotation on toggle.
- **Persistent Preference**: Stores user preference in `localStorage`; defaults to system `prefers-color-scheme` on first visit.
- **High Contrast Assurance**: All text, badges, and meters meet or exceed WCAG AA 4.5:1 contrast requirements in both themes.

### 8. Micro-Animations & Accessibility Polish
- **Card Entrance Stagger**: Smooth fade-up animation staggered by 60ms using `IntersectionObserver`.
- **Button & Card Motion**: Buttons lift `-2px` with overshoot spring (`--ease-spring`); cards lift `6px` with subtle border glow and image scale.
- **Reduced Motion Support**: Fully respects `@media (prefers-reduced-motion: reduce)` by disabling non-essential motion.

---

## 📐 Data Models

All application records conform strictly to the project data model defined in `AGENTS.md` and `PLAN.md`:

### Event Model
```typescript
interface Event {
  id: string;               // e.g. "evt-tech-01"
  title: string;            // Event title
  category: string;         // "Technology" | "Music & Arts" | "Business & Networking" | "Sports & Fitness"
  date: string;             // ISO 8601 string with venue timezone offset (e.g. "2026-11-25T09:00:00-08:00")
  time: string;             // Display time with timezone code (e.g. "09:00 AM - 05:00 PM PST")
  venue: string;            // Venue name and location
  image: string;            // High-resolution image URL (Unsplash)
  shortDescription: string; // 2-line summary for cards
  description: string;      // Full event overview for modal
  capacity: number;         // Static venue capacity
  featured: boolean;        // Whether the event is featured in spotlight & showcase
}
```

### Registration Model
```typescript
interface Registration {
  id: string;               // Unique ID, e.g. "reg-1730912400000-a1b2c"
  eventId: string;          // Foreign key matching Event.id
  name: string;             // Trimmed attendee name
  email: string;            // Normalized lowercase email
  phone: string;            // Standardized phone number
  registeredAt: string;     // ISO 8601 creation timestamp
}
```

---

## 📂 Project Architecture & File Structure

```
web_design_event_management/
├── index.html              # Semantic HTML5 scaffold with accessible dialogs and landmarks
├── css/
│   ├── style.css           # DESIGN.md design tokens, typography, component styling, animations
│   └── responsive.css      # Mobile-first media queries (480px, 768px, 1024px, 1280px)
├── js/
│   ├── app.js              # Application bootstrapper, theme controller, and UI event binding
│   ├── events.js           # Event catalog, derived capacity calculator, card & modal rendering
│   ├── filters.js          # Debounced search, category filtering, multi-criteria sorting
│   ├── countdown.js        # Live countdown engine and structured countdown HTML generators
│   ├── registration.js     # Field validation, duplicate check, and confirmation flow
│   └── storage.js          # Resilient LocalStorage adapter with schema versioning & fallback
├── design-refs/            # Visual reference screenshots demonstrating editorial layout patterns
├── AGENTS.md               # Project rules, data model constraints, and definition of done
├── DESIGN.md               # Strict design specification: tokens, typography, colors, and motion
├── DECISIONS.md            # Architectural Decision Records (ADRs 01 through 12)
├── PLAN.md                 # 6-Phase implementation plan and comprehensive verification checklist
└── README.md               # Project documentation and submission overview
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<dialog>`, `<footer>`), ARIA attributes, skip-to-content link |
| **Styles** | CSS3 | Custom Properties (CSS variables), Fluid Typography (`clamp()`), CSS Grid & Flexbox, Keyframe Animations |
| **Scripts** | JavaScript (ES6+ Modules) | Modular Vanilla JS without external dependencies, strict typing validations, native DOM APIs |
| **Typography** | Google Fonts | **Space Grotesk** (Headings), **Inter** (Body), **JetBrains Mono** (Badges, Dates, Timers) |
| **Storage** | Web Storage API | `localStorage` with versioning (`v1.0`), JSON schema normalization, and in-memory fallback |
| **Version Control** | Git & GitHub | Feature branching workflow, clean commit history, descriptive PRs |

---

## 🚀 Getting Started & Local Setup

The project uses native browser ES Modules, which require serving over HTTP/HTTPS rather than opening directly from the local file system (`file://`).

### Option 1: Using Node.js / NPX (Recommended)
```bash
# Clone the repository
git clone https://github.com/Greysooth/event-management.git
cd event-management

# Start a local static server
npx serve .
# Or using http-server:
# npx http-server . -p 8000
```
Open your browser at `http://localhost:3000` (or the URL shown in terminal).

### Option 2: Using Python
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

### Option 3: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🚢 Deployment Guide (Vercel)

This project contains only static files and can be deployed instantly to Vercel:

1. Push all commits to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import the `event-management` repository.
4. Keep the default settings (Framework Preset: **Other**, Build Command: empty, Output Directory: `./`).
5. Click **"Deploy"**. Vercel will provide a live production URL in seconds.

---

## 🧪 Testing & Quality Assurance

Comprehensive automated and manual checks were conducted across all phases:

- [x] **Browser Compatibility**: Verified in Chromium (Chrome/Edge), Firefox, and WebKit (Safari).
- [x] **Responsive Viewports**: Tested at **375px** (Mobile), **768px** (Tablet), **1024px** (Laptop), and **1280px+** (Wide Desktop).
- [x] **Accessibility (a11y)**:
  - Minimum touch targets of 44px × 44px on all interactive controls.
  - Visible focus rings (`2px solid var(--accent-cyan); outline-offset: 3px`) on all `:focus-visible` elements.
  - Full keyboard operability (Tab order, Enter/Space activation, Escape to close modals/menus).
  - Screen reader announcements using `aria-live="polite"` and `role="alert"`.
- [x] **Validation Edge Cases**:
  - Empty field submission prevented.
  - Sub-character and special symbol names rejected.
  - Incomplete and non-RFC email formats rejected.
  - Non-10-to-15 digit phone numbers rejected.
  - Duplicate email registrations on the same event rejected.
- [x] **Console Cleanliness**: Zero console warnings or uncaught exceptions across all application flows.

---

## 📋 Evaluation Criteria Mapping

| Evaluation Criterion | Implementation Details |
| :--- | :--- |
| **Creativity & Design** | "Hackathon meets festival" dark aesthetic, neon accents, floating gradient orbs, editorial segmented spotlight navigation, custom countdown chips. |
| **UI / UX** | Intuitive navigation, debounced search, responsive pill filters, animated modal dialogs, inline error feedback with shake motion, dynamic live counters. |
| **Functionality** | Full event exploration, dynamic derived capacity calculation, client-side validation, duplicate email prevention, registration cancellation with capacity restoration. |
| **Responsiveness** | Mobile-first CSS media queries, horizontal touch-snap pill scrolling, adaptive 1/2/3/4-column grids, bottom-sheet responsive modals. |
| **Code Quality** | Modular Vanilla JavaScript (ESM), strict data validation, zero global variables, comprehensive ADRs in `DECISIONS.md`. |
| **Documentation** | Thorough `README.md`, detailed `PLAN.md`, architectural decisions in `DECISIONS.md`, and strict tokens in `DESIGN.md`. |
| **Bonus Challenges** | Dark/Light theme switch, live real-time countdown timers, CSS spring micro-interactions, versioned LocalStorage data management. |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
