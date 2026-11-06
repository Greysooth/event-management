# Implementation Plan: Responsive Event Management Website

## Status
- [x] Phase 0: Plan & Architecture Decisions Approved (Gate)
- [x] Phase 1: Foundation (Semantic scaffold, design tokens, storage adapter, base responsive layout)
- [x] Phase 2: Events Display (Hero spotlight, event cards, detail modal, responsive grid)
- [x] Phase 3: Search, Filters & Sorting (Real-time search, category pills, sort dropdown, empty state)
- [x] Phase 4: Registration, Form Validation & Local Storage Management (Full a11y, duplicate checks, derived capacity)
- [x] Phase 5: Bonus Features & Polish (Dark/Light mode switch, live countdown timers, micro-animations)
- [ ] Phase 6: Testing, Documentation & Vercel/GitHub Pages Deployment

---

## 1. Architecture, Scope & Design Direction

### 1.1 Architecture & Local-Only Demo Boundaries
- **Platform**: Pure client-side application built with semantic HTML5, modern CSS3, and Vanilla JavaScript (ES Modules).
- **Deployment Target**: Deployed to **Vercel** with complete **GitHub Pages** compatibility (using strictly repository-relative paths `./`).
- **Registration Persistence & Scope**:
  - Registrations and capacity are stored in the client browser's `localStorage` as requested in the course's **Bonus Challenge** ("Local Storage-based registration data management").
  - **Demo Limits**: Data is local to each visitor's browser and device. It is not shared across visitors and does not prevent concurrent overbooking across different machines. A subtle badge in the UI clearly indicates: `"Demo Mode: Registrations are saved locally on this browser"`.
  - **Storage Adapter**: The synchronous browser-storage adapter (`js/storage.js`) provides named functions for registration and theme persistence. A future network-backed implementation would require callers to adopt asynchronous handling.

### 1.2 Design Direction & Theme Tokens (Follows DESIGN.md)
- **Mood**: Playful + techy ("hackathon meets festival"): dark, glowing, neon-accented interface with rounded shapes, monospace details, and bouncy micro-interactions.
- **Personality Keywords**: energetic, curious, friendly, futuristic, a little cheeky.
- **Google Fonts**:
  1. **Headings**: `Space Grotesk` (600, 700) (`system-ui, sans-serif`)
  2. **Body**: `Inter` (400, 500, 600) (`system-ui, sans-serif`)
  3. **Labels, Dates, Tags & Countdowns**: `JetBrains Mono` (500) (`ui-monospace, monospace`)
- **Color Tokens (DESIGN.md Spec)**:
  - **Dark Theme (Default `:root`)**:
    - Page Background (`--bg`): `#0B0B1A`
    - Elevated Surface / Nav (`--bg-elevated`): `#13132B`
    - Cards / Modal / Inputs (`--surface`): `#1A1A38`
    - Card Hover Surface (`--surface-hover`): `#222247`
    - Borders & Dividers (`--border`): `#2E2E5C`
    - Primary Text (`--text`): `#F4F4FF`
    - Secondary Text (`--text-muted`): `#A3A3C8`
    - Primary Action (`--primary`): `#6D4AFF` (Electric violet) | Hover: `#8467FF`
    - Text on Primary (`--on-primary`): `#FFFFFF`
    - Accent Lime (`--accent-lime`): `#C6FF3D` | Text on Lime (`--on-lime`): `#0B0B1A`
    - Accent Pink (`--accent-pink`): `#FF4D9D`
    - Accent Cyan (`--accent-cyan`): `#22E1FF`
    - Success (`--success`): `#2EE59D`
    - Danger / Error (`--danger`): `#FF5C7A`
  - **Light Theme (`[data-theme="light"]`)**:
    - Page Background (`--bg`): `#F7F6FF`
    - Elevated Surface (`--bg-elevated`): `#FFFFFF`
    - Surface (`--surface`): `#FFFFFF`
    - Card Hover Surface (`--surface-hover`): `#F0EEFF`
    - Borders (`--border`): `#DAD6F5`
    - Primary Text (`--text`): `#14132B`
    - Secondary Text (`--text-muted`): `#5B5A7A`
    - Primary Action (`--primary`): `#5B35F2` | Hover: `#6D4AFF`
    - Success (`--success`): `#0FA86B`
    - Danger (`--danger`): `#D92D50`
  - **Gradients**:
    - `--gradient-brand`: `linear-gradient(135deg, #6D4AFF 0%, #FF4D9D 100%)`
    - `--gradient-tech`: `linear-gradient(135deg, #22E1FF 0%, #6D4AFF 100%)`
    - `--gradient-glow`: `radial-gradient(circle at 50% 0%, rgba(109,74,255,.35), transparent 60%)`
  - **Category Colors**:
    - Technology: `--cat-tech` | Music & Arts: `--cat-music` | Business & Networking: `--cat-business` | Sports & Fitness: `--cat-sports`
- **Spacing, Radius & Shadows**:
  - Spacing (8px grid): `--space-1` (0.25rem) through `--space-9` (6rem)
  - Radius: `--radius-sm` (8px), `--radius-md` (14px), `--radius-lg` (22px), `--radius-pill` (999px)
  - Glows: `--glow-primary`, `--glow-lime`, `--shadow-sm`, `--shadow-md`
- **Motion**:
  - Springs: `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`
  - Durations: `--dur-fast: 150ms`, `--dur-base: 250ms`, `--dur-slow: 500ms`
  - Focus Ring: `2px solid var(--accent-cyan)` with `3px` offset

---

## 2. Section-by-Section Layout of `index.html` (Mobile 375px vs. Desktop 1280px)

### 2.1 Navigation & Header (`<header class="site-header">`)
- **Desktop (1280px)**:
  - Sticky navigation bar with blur backdrop.
  - Left: Brand logo with calendar-pulse icon (`EventPulse`) + demo mode badge.
  - Center: Semantic nav links (`#all-events`, `#featured`, `#categories`).
  - Right: "My Registrations" button (displaying dynamic registration count) and Dark/Light Mode toggle button (`☀️`/`🌙`).
- **Mobile (375px)**:
  - Compact header bar with brand logo, theme toggle button, and hamburger menu toggle button (`aria-expanded="false"`, `aria-label="Toggle navigation menu"`).
  - Off-canvas / collapsible sliding drawer containing navigation links and the "My Registrations" shortcut, with focus trapping and `Escape` key dismissal.

### 2.2 Hero Section (`<section id="hero" class="hero-section">`)
- **Desktop (1280px)**:
  - 2-column layout:
    - Left Column: Headline ("Discover & Experience Unforgettable Events"), subtext, primary CTA button ("Explore Events" smooth-scrolling to `#all-events`), secondary CTA ("My Registrations"), and quick stat counters.
    - Right Column: **Hero Spotlight Card** displaying the next upcoming featured event with live countdown timer pill (Days : Hours : Mins : Secs), event details, and an instant "Register Now" button.
- **Mobile (375px)**:
  - Stacked 1-column layout: Centered headline, full-width CTA buttons, and compact spotlight event card with countdown timer.

### 2.3 Controls Bar: Search, Category Filters & Sort (`<section id="controls" class="controls-section">`)
- **Desktop (1280px)**:
  - Unified horizontal bar:
    - Search input (`<input type="search" id="event-search">`) with clear ("×") button.
    - Category filter pills: `All`, `Technology`, `Music & Arts`, `Business & Networking`, `Sports & Fitness`.
    - Sort dropdown (`<select id="event-sort">`): "Date: Soonest First", "Capacity: Most Available", "Alphabetical (A-Z)".
- **Mobile (375px)**:
  - Full-width search bar at top.
  - Horizontally scrollable category pills container with touch snap scrolling (`overflow-x: auto; -webkit-overflow-scrolling: touch`).
  - Full-width sort dropdown below.

### 2.4 Featured Events Showcase (`<section id="featured" class="featured-section">`)
- **Desktop (1280px)**:
  - 3-column prominent grid featuring events with `featured: true`.
  - Cards show glowing borders, "Featured" badges, dynamic countdown timers, and capacity meters.
- **Mobile (375px)**:
  - Horizontal swipeable carousel with scroll snapping or compact stacked cards.

### 2.5 All Events Grid Section (`<section id="all-events" class="events-section">`)
- **Desktop (1280px)**:
  - 4-column CSS Grid at 1280px and wider, matching `DESIGN.md`; 3 columns from 1024px.
  - Cards display: image with category overlay, venue-local date chip, title, venue, 2-line short description, derived capacity meter, and action buttons ("Details" & "Register").
  - Empty state (`#empty-state`) displayed when search/filter yields 0 results, including a "Reset Filters" button.
- **Mobile (375px)**:
  - 1-column layout (`grid-template-columns: 1fr`).
  - Minimum 44px x 44px touch targets on buttons and interactive chips.
  - *(Tablet 768px: 2-column grid `repeat(2, 1fr)`)*.

### 2.6 Event Details & Registration Modal (`<dialog id="event-modal" class="modal">`)
- **Desktop (1280px)**:
  - Accessible native `<dialog>` element with backdrop blur.
  - Scrollable single-column layout: image, title and category, countdown, venue-local date/time, venue, description, capacity, and an inline registration option.
  - Selecting registration replaces the event actions with a form using explicit `<label>` elements, input validation states, and real-time error messages.
- **Mobile (375px)**:
  - Full-screen or bottom-sheet scrollable modal with sticky header close button ("✕").

### 2.7 Registration Confirmation Modal (`<dialog id="confirmation-modal" class="modal">`)
- Modal displaying animated success checkmark, attendee name, event title, venue-local schedule, unique Registration ID (`reg-...`), and "Done" / "View My Registrations" buttons.

### 2.8 "My Registrations" Drawer / Modal (`<dialog id="my-registrations-modal" class="modal">`) [Bonus]
- Displays all registrations stored in `localStorage` for the current user.
- Shows event title, date, venue, and a "Cancel Registration" button which removes the record and automatically restores the derived capacity.
- Empty state with "Browse Events" link when no registrations exist.

### 2.9 Footer (`<footer class="site-footer">`)
- **Desktop (1280px)**:
  - 4 columns: Brand statement + Demo disclaimer, Quick navigation links, Event categories, and Newsletter subscription mock input.
- **Mobile (375px)**:
  - Clean vertical stack with centered copyright notice and accessible links.
- **Newsletter Mock Behavior**: Accessible email input and "Subscribe" button; validates email and reports feedback in a polite status region without reloading.

---

## 3. Sample Events & Time Model

### 3.1 Time Model & Timezone Authority
- **Authoritative Date**: The `date` field is an ISO 8601 string containing the **venue's local timezone offset** (e.g. `2026-11-25T09:00:00-08:00`). This is the authoritative timestamp for countdown timers and sorting.
- **Authoritative Display Time**: The `time` field explicitly indicates the venue's local timezone (e.g., `"09:00 AM - 05:00 PM PST"`). Event cards and modals explicitly display this timezone so visitors in other timezones are not misled.
- **Derived Capacity Rule**: The `capacity` attribute represents the static total capacity of the venue. The remaining available spots is always derived:
  $$\text{remainingSpots} = \text{event.capacity} - \text{registrations.filter}(r \implies r.\text{eventId} \equiv \text{event.id}).\text{length}$$

### 3.2 Canonical Sample Events (8 Events Across 4 Categories)

#### Event 1 (Category: Technology | Featured)
```json
{
  "id": "evt-tech-01",
  "title": "Global AI & Cloud Architecture Summit 2026",
  "category": "Technology",
  "date": "2026-11-25T09:00:00-08:00",
  "time": "09:00 AM - 05:00 PM PST",
  "venue": "Grand Horizon Convention Center, San Francisco, CA",
  "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Explore breakthroughs in generative AI, neural hardware, and scalable cloud architectures with industry pioneers.",
  "description": "Join over 500 technologists, machine learning engineers, and cloud architects for a full day of deep-dive keynotes, hands-on architectural workshops, and interactive panels. Discover cutting-edge LLM deployments, edge intelligence, and enterprise-scale AI security frameworks. Lunch and networking reception included.",
  "capacity": 150,
  "featured": true
}
```

#### Event 2 (Category: Technology)
```json
{
  "id": "evt-tech-02",
  "title": "NextGen Web & Decentralized Systems Hackathon",
  "category": "Technology",
  "date": "2026-12-10T10:00:00-06:00",
  "time": "10:00 AM - 08:00 PM CST",
  "venue": "VentureHub Innovation Lab, Austin, TX",
  "image": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Collaborate, build, and pitch progressive web applications and decentralized protocols in a 10-hour sprint.",
  "description": "A fast-paced collaborative hackathon bringing together frontend designers, fullstack engineers, and distributed systems enthusiasts. Mentors from leading tech firms will guide teams through real-world problem statements. Cash prizes, investor visibility, and API credits awarded to top 3 teams.",
  "capacity": 80,
  "featured": false
}
```

#### Event 3 (Category: Music & Arts | Featured)
```json
{
  "id": "evt-art-03",
  "title": "Echoes in Bloom: Indie & Electronic Music Night",
  "category": "Music & Arts",
  "date": "2026-11-30T19:00:00-05:00",
  "time": "07:00 PM - 11:30 PM EST",
  "venue": "Skyline Open-Air Amphitheater, Brooklyn, NY",
  "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "An immersive audiovisual concert featuring breakout indie bands, synth-wave artists, and kinetic light stages.",
  "description": "Experience mesmerizing soundscapes under the city skyline. Echoes in Bloom brings together emerging independent bands, kinetic projection mapping, and ambient synthesizer beatmakers for an unforgettable sensory evening. Gourmet artisan food trucks and craft beverage bars available all night.",
  "capacity": 250,
  "featured": true
}
```

#### Event 4 (Category: Music & Arts)
```json
{
  "id": "evt-art-04",
  "title": "Contemporary Canvas: Modern Art Gala & Auction",
  "category": "Music & Arts",
  "date": "2026-12-18T18:00:00-06:00",
  "time": "06:00 PM - 10:00 PM CST",
  "venue": "Lumina Center for Contemporary Arts, Chicago, IL",
  "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Curated exhibition showcasing physical oil paintings, generative digital media, and interactive sculptures.",
  "description": "A sophisticated evening celebrating progressive visual art. Meet featured artists, sculptors, and creative directors. Includes an opening curator walk, live acoustic cello accompaniment, and an exclusive silent auction benefiting community youth arts education programs.",
  "capacity": 120,
  "featured": false
}
```

#### Event 5 (Category: Business & Networking | Featured)
```json
{
  "id": "evt-biz-05",
  "title": "Founders & Funders: Venture Growth Summit 2026",
  "category": "Business & Networking",
  "date": "2026-12-03T08:30:00-05:00",
  "time": "08:30 AM - 04:30 PM EST",
  "venue": "Beacon Financial Center, 32nd Floor, Boston, MA",
  "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Direct networking, curated pitch sessions, and scale-up masterclasses with angel investors and VC partners.",
  "description": "High-impact networking designed for early-stage and seed founders looking to scale sustainably. Featuring structured 1-on-1 pitch speed meetings, valuation and term sheet breakdowns by leading VC partners, and peer roundtables on cross-border growth strategies.",
  "capacity": 100,
  "featured": true
}
```

#### Event 6 (Category: Business & Networking)
```json
{
  "id": "evt-biz-06",
  "title": "Women in Leadership & Tech Exchange",
  "category": "Business & Networking",
  "date": "2026-12-15T17:30:00-08:00",
  "time": "05:30 PM - 09:00 PM PST",
  "venue": "Metropolitan Business Guild, Seattle, WA",
  "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Inspiring talks, small-group mentorship circles, and executive networking for aspiring and senior leaders.",
  "description": "Celebrate diversity and visionary leadership in modern business and engineering. The evening features an inspiring keynote on navigating executive transitions, followed by small-group mentorship circles focusing on negotiation, team scaling, and board readiness.",
  "capacity": 90,
  "featured": false
}
```

#### Event 7 (Category: Sports & Fitness)
```json
{
  "id": "evt-spt-07",
  "title": "Urban Twilight 10K & Half Marathon",
  "category": "Sports & Fitness",
  "date": "2026-12-08T16:00:00-08:00",
  "time": "04:00 PM - 08:00 PM PST",
  "venue": "Riverside Waterfront Promenade, Portland, OR",
  "image": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Scenic sunset road race along the riverfront with chip timing, finisher medals, and post-race festival.",
  "description": "Lace up for an exhilarating sunset run! Whether targeting a personal record in the certified Half Marathon or completing your first 10K, enjoy scenic river views, live DJ cheer stations every 2 kilometers, medical hydration support, and commemorative technical running shirts.",
  "capacity": 300,
  "featured": false
}
```

#### Event 8 (Category: Sports & Fitness)
```json
{
  "id": "evt-spt-08",
  "title": "Mindful Flow: Sunrise Yoga & Wellness Retreat",
  "category": "Sports & Fitness",
  "date": "2026-12-20T07:00:00-07:00",
  "time": "07:00 AM - 12:00 PM MST",
  "venue": "Solarium Botanical Gardens, Denver, CO",
  "image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
  "shortDescription": "Rejuvenating morning of guided Vinyasa flow, breathwork meditation, and holistic nutrition workshops.",
  "description": "Escape the daily hustle inside the lush botanical glasshouse. Led by master yoga instructors and breathwork specialists, this half-day wellness immersion includes sound bath healing, posture alignment clinics, organic cold-pressed juices, and healthy botanical breakfast bowls.",
  "capacity": 60,
  "featured": false
}
```

---

## 4. Form Validation & Data Model Behaviors

### 4.1 Registration Data Model
From `AGENTS.md`:
```javascript
Registration: { id, eventId, name, email, phone, registeredAt }
```

### 4.2 Field Validation Rules

| Field | Requirement | Format / Regex | Validation Criteria | Error Message |
| :--- | :--- | :--- | :--- | :--- |
| **Full Name (`name`)** | Mandatory | `^[a-zA-Z\s.'-]{2,60}$` | • Trimmed length: 2 to 60 characters.<br>• Letters, spaces, hyphens, periods, apostrophes only.<br>• Rejects numbers or special symbols. | • Missing: `"Please enter your full name."`<br>• Too short: `"Name must be at least 2 characters."`<br>• Invalid chars: `"Name can only contain letters, spaces, hyphens, and apostrophes."` |
| **Email (`email`)** | Mandatory | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | • Standard RFC-compliant email structure.<br>• Trimmed and normalized to lowercase.<br>• Must contain `@` and valid domain with dot. | • Missing: `"Email address is required."`<br>• Invalid: `"Please enter a valid email address (e.g. name@example.com)."` |
| **Phone (`phone`)** | Mandatory | `^\+?[0-9\s().-]{10,20}$` (Digits only check: `^\d{10,15}$`) | • Must contain between 10 and 15 digits after stripping formatting characters (`+`, `-`, `(`, `)`, spaces). | • Missing: `"Phone number is required."`<br>• Invalid: `"Please enter a valid phone number (10 to 15 digits)."` |

### 4.3 Data Model Behaviors & Resilience
1. **Registration ID Generation**: Generated via `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.
2. **Email Normalization & Duplicate Prevention**: Emails are sanitized via `email.trim().toLowerCase()`. Submissions check if `registrations.some(r => r.eventId === eventId && r.email === normalizedEmail)`. If duplicate, prevents submission with: `"You are already registered for this event with this email address."`
3. **Derived Capacity & Sold Out State**:
   - If `derivedSpots <= 0`, the registration button is disabled with text `"Sold Out"`.
   - Submissions verify available spots before saving.
4. **Registration Cancellation**:
   - Users can cancel their registration from "My Registrations".
   - Removing the registration from `localStorage` immediately restores the derived capacity in the event grid and modals.
5. **Storage Resilience & Fallback**:
   - Wrapped in `try...catch`. If `localStorage` is disabled, throws a quota error, or contains corrupt JSON, falls back to an in-memory dictionary so the application never crashes.

---

## 5. Per-Phase Task Breakdown (Shift-Left Responsiveness & Accessibility)

### Phase 0: Plan & Architecture Approval Gate
- **Deliverables**: Finalized [PLAN.md](./PLAN.md) and fully documented [DECISIONS.md](./DECISIONS.md) logging all 12 ADRs.
- **Gate**: All requirements, boundaries, and data models validated before touching any code.

### Phase 1: Foundation (Semantic Scaffold, Design Tokens, Storage Adapter, Base Responsive Layout)
- **Goal**: Establish accessible HTML5 foundation, CSS design tokens (light & dark mode), base responsive grid layout, and resilient storage adapter.
- **Files Touched**:
  - `index.html`:
    - Repository-relative links (`./css/style.css`, `./css/responsive.css`).
    - Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dialog>`.
    - Skip-to-content link (`<a href="#all-events" class="skip-link">Skip to content</a>`).
  - `css/style.css`:
    - Modern CSS reset, focus-visible indicators (`outline: 2px solid var(--accent-cyan)`), typography, CSS custom properties (`:root` and `[data-theme="light"]`).
  - `css/responsive.css`:
    - Mobile-first breakpoints: Mobile (375px), Tablet (768px), Desktop (1280px).
  - `js/storage.js`:
    - Named exports:
      - `getRegistrations()`: Returns registrations array from `localStorage` (with fallback).
      - `saveRegistration(registration)`: Persists new registration.
      - `removeRegistration(registrationId)`: Deletes registration and updates storage.
      - `getRegistrationsByEvent(eventId)`: Filters registrations for a specific event.
      - `getStoredTheme()`: Returns stored theme string (`'light'` or `'dark'`).
      - `setStoredTheme(theme)`: Saves theme string.

### Phase 2: Events Display (Hero Spotlight, Event Cards, Detail Modal, Responsive Grid)
- **Goal**: Render canonical sample events into responsive cards, hero spotlight, and detail modal with built-in accessibility.
- **Files Touched**:
  - `js/events.js`:
    - Named exports:
      - `sampleEvents`: Canonical array of 8 events matching data model.
      - `getAllEventsWithCapacity()`: Merges sample events with current derived capacities.
      - `getEventById(id)`: Returns single event with derived capacity.
      - `renderEventCard(event)`: Creates card DOM element with accessible `alt` text and ARIA tags.
      - `renderEventsGrid(events, container)`: Populates grid container.
      - `renderHeroSpotlight(event, container, featuredEvents, activeIndex)`: Populates hero section with a featured event and carousel controls.
      - `openEventModal(eventId)`: Opens native `<dialog>` with focus trapping.
      - `closeEventModal()`: Closes modal and returns focus to triggering element.
  - `css/style.css`:
    - Card layouts, aspect-ratio image containers, badges, accessible capacity meters, `<dialog>` styling and `::backdrop` blur.
  - `css/responsive.css`:
    - 1-column on mobile (375px), 2-column on tablet (768px), 3 columns from 1024px, and 4 columns for the all-events grid at 1280px and wider. Modal responsive sheet behavior.
  - `js/app.js`:
    - Initialize page, load events, bind event delegation for modal triggers.

### Phase 3: Search, Filters & Sorting
- **Goal**: Implement real-time search, category pill filter buttons, sort ordering, and accessible empty state.
- **Files Touched**:
  - `js/filters.js`:
    - Named exports:
      - `initFilters(onFilterChangeCallback)`: Binds search input, category pills, and sort dropdown.
      - `filterEvents(events, { category, searchQuery, sortBy })`: Filters and sorts events array.
      - `resetFilters()`: Resets all filter controls to default.
  - `index.html`:
    - Search input with `<label>`, category pill buttons (`role="group"`), sort `<select>`, empty state `#empty-state`.
  - `css/style.css`:
    - Filter pill active states, search bar clear button, empty state card.
  - `css/responsive.css`:
    - Category pills horizontal scrolling on mobile with touch snap.
  - `js/app.js`:
    - Debounced search listener, filter event binding.

### Phase 4: Registration, Form Validation & Local Storage Management
- **Goal**: Handle participant registration, validation error display, duplicate checks, derived capacity updates, and confirmation dialog.
- **Files Touched**:
  - `js/registration.js`:
    - Named exports:
      - `validateName(name)`: Validates name against regex and length.
      - `validateEmail(email, eventId)`: Validates email and checks for a duplicate registration for that event.
      - `validatePhone(phone)`: Validates phone digit count.
      - `validateForm(formData)`: Returns `{ isValid, errors }`.
      - `handleRegistrationSubmit(e, form, onSuccessCallback)`: Processes registration, saves to storage, and notifies the app.
      - `showConfirmationModal(registration, event, onUpdateCallback)`: Displays confirmation and carries the update callback into "My Registrations".
      - `renderMyRegistrationsList(container, onCancelCallback)`: Populates "My Registrations" with event dates, venues, and cancel buttons.
      - `cancelUserRegistration(registrationId, onUpdateCallback)`: Cancels registration, updates storage, and restores derived capacity.
  - `index.html`:
    - Registration form with explicit `<label for="...">`, error spans (`aria-describedby`, `role="alert"`), `<dialog id="confirmation-modal">`, `<dialog id="my-registrations-modal">`.
  - `css/style.css`:
    - Valid/invalid input borders, accessible error message styling, confirmation animation container.
  - `css/responsive.css`:
    - Form layout sizing, minimum 44px tap targets.
  - `js/app.js`:
    - Form submission listeners, cancel registration triggers.

### Phase 5: Bonus Features & Polish (Dark/Light Mode, Countdown Timers, Micro-Animations)
- **Goal**: Implement all bonus challenges and visual micro-interactions.
- **Files Touched**:
  - `js/app.js`:
    - Theme controller reads the stored preference or system preference, toggles `data-theme`, and persists changes.
    - Mobile navigation manages `aria-expanded`, keyboard focus, and Escape dismissal.
    - Newsletter mock validates the email and reports feedback in an accessible status region.
  - `js/countdown.js`:
    - `calculateTimeRemaining(targetDateISO)`: Calculates time to event start and handles invalid/missing dates.
    - `renderSpotlightCountdownHTML(targetDateISO)`, `renderCardCountdownHTML(targetDateISO)`, and `renderModalCountdownHTML(targetDateISO)`: Render countdowns with timer semantics.
    - `initCountdownEngine()`, `updateAllCountdowns()`, and `stopCountdownEngine()`: Start, update, and stop the shared one-second ticker.
  - `js/events.js`:
    - Mounts the spotlight, featured-card, and modal countdowns and renders accessible capacity meters from derived registration counts.
  - `css/style.css`:
    - `[data-theme="light"]` custom property overrides.
    - Keyframe animations: `@keyframes modalFadeIn`, checkmark bounce, pulse on live badges.
    - `@media (prefers-reduced-motion: reduce)`: Disables non-essential animations.
  - `css/responsive.css`:
    - Touch polish, safe area padding (`env(safe-area-inset-bottom)`).

### Phase 6: Testing, Documentation & Deployment
- **Goal**: Execute comprehensive manual test checklist, verify zero console errors, complete README, and verify deployment.
- **Files Touched**:
  - `README.md`: Project documentation, feature summary, tech stack, data models, local setup instructions (`npx serve .`), deployment links, and bonus challenge coverage.
  - `PLAN.md`: Complete all checklist items.

---

## 6. Comprehensive Manual Test Checklist

### 6.1 Responsiveness & Viewports
- [ ] **Mobile (375px)**:
  - Header displays logo, theme switch, and hamburger button.
  - Mobile drawer opens cleanly on hamburger click, sets `aria-expanded="true"`, and closes on Escape, a navigation link, or the menu toggle.
  - Category filter pills scroll smoothly horizontally without viewport overflow.
  - All Events grid renders cleanly in 1 column (`1fr`).
  - All interactive buttons, inputs, filter pills, and the search clear control meet the 44px touch target guideline.
- [ ] **Tablet (768px)**:
  - Events grid renders in 2 columns (`repeat(2, 1fr)`).
  - Search and filter controls fit comfortably across the width.
- [ ] **Desktop (1280px)**:
  - Full sticky navigation header with visible links and registrations badge.
  - Hero section displays 2 columns (intro copy left, spotlight card right).
  - All-events grid displays 4 columns; featured grid displays 3 columns.

### 6.2 Search, Filtering & Sorting
- [x] **Category Filter**: Clicking each category button filters the cards to that category only; clicking "All" shows all 8 events.
- [x] **Search Input**: Real-time search filters by title, venue, or short description (case-insensitive).
- [x] **Combined Filtering**: Filtering by "Technology" and searching "Cloud" displays only "Global AI & Cloud Architecture Summit".
- [x] **Empty State**: Entering a query with no matches displays `#empty-state`; clicking "Reset Filters" clears input and restores full catalog.
- [x] **Sort Dropdown**: Sorting by "Date: Soonest First" orders events chronologically; "Capacity: Most Available" orders by derived spots remaining.

### 6.3 Event Details Modal & Live Countdown Timers [Bonus]
- [x] **Detail Modal**:
  - Clicking "Details" opens the native `<dialog>` showing image, title, category, venue-local date/time with timezone, description, and derived capacity.
  - `Escape` key closes the dialog; focus returns to the triggering button.
- [x] **Countdown Timer**:
  - Hero spotlight timer decrements seconds live in real time.
  - Featured cards display live countdowns.

### 6.4 Registration Form, Validation & Duplicate Handling
- [x] **Empty Form**: Submitting empty form highlights fields in red with specific error messages.
- [x] **Name Field**: "A" fails (min 2 chars); numbers fail; "Jane Doe" passes.
- [x] **Email Field**: "user@domain" fails without TLD; "jane@example.com" passes.
- [x] **Phone Field**: "123" fails (must have 10-15 digits); "+1 (555) 234-5678" passes.
- [x] **Duplicate Check**: Submitting a registration with an email already registered for that event displays duplicate error message.
- [x] **Derived Capacity & Sold Out**:
  - Submitting registration decrements remaining spots immediately in the grid and modal.
  - If capacity reaches 0, button turns disabled with "Sold Out" text.

### 6.5 Confirmation Modal & "My Registrations" [Bonus]
- [x] **Confirmation**: Successful registration displays confirmation modal with checkmark animation, attendee name, event details, and unique `reg-...` ID.
- [x] **My Registrations Drawer**:
  - Displays registered events stored in `localStorage`.
  - Clicking "Cancel Registration" removes the record from `localStorage` and instantly restores derived capacity in the event grid.
- [x] **Demo Mode Banner**: Subtle banner visible reminding the user that registrations are stored locally in the browser.

### 6.6 Dark / Light Mode [Bonus]
- [x] **Theme Toggle**: Clicking toggle switches color theme with smooth transitions.
- [x] **Persistence**: Refreshing the page preserves the selected theme from `localStorage`.
- [x] **System Default**: If no stored preference, respects `prefers-color-scheme`.

### 6.7 Accessibility & Code Quality
- [x] Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<dialog>`, `<footer>`).
- [x] All images have descriptive `alt` text.
- [x] All inputs have associated `<label>` tags and `aria-describedby` for error states.
- [x] Visible focus rings on all interactive elements via `:focus-visible`.
- [x] Reduced motion: `prefers-reduced-motion` suppresses transitions and keyframe animations.
- [x] Zero global variables; all JS modules use small functions and named exports.
- [x] Browser console has 0 errors or uncaught exceptions across all user flows.

### 6.8 Deployment & URL Pathing Verification
- [ ] All paths in HTML/CSS/JS are repository-relative (`./css/style.css`, `./js/app.js`, etc.).
- [ ] Local testing conducted via HTTP server (`npx serve .` or `python -m http.server 8000`) with zero CORS errors on ES modules.
- [ ] Production deployment on Vercel loads all assets and modules with zero 404s.
