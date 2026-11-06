# DESIGN.md

Design spec for the Event Management Website.
**All UI work must follow this file and use only the tokens defined here.**
If a new token is needed, add it here first and log it in `DECISIONS.md`.

---

## 1. Design direction

**Mood:** Playful + techy. Think "hackathon meets festival": a dark, glowing,
neon-accented interface with rounded shapes, monospace details, and bouncy
micro-interactions.

**Personality keywords:** energetic, curious, friendly, futuristic, a little cheeky.

**Do**
- Dark-first look with glowing gradient accents
- Big, bold headlines; monospace for dates, tags, and small labels
- Chunky rounded cards, pill buttons, floating blobs and gradient orbs
- Springy hover and entrance motion

**Don't**
- Flat grey corporate look, sharp corners, or tiny text
- More than two accent colors in the same component
- Heavy animation that hurts readability or performance

---

## 2. Color tokens

### Dark theme (default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0B1A` | Page background |
| `--bg-elevated` | `#13132B` | Sections, navbar |
| `--surface` | `#1A1A38` | Cards, modal, inputs |
| `--surface-hover` | `#222247` | Card/hover surface |
| `--border` | `#2E2E5C` | Borders, dividers |
| `--text` | `#F4F4FF` | Primary text |
| `--text-muted` | `#A3A3C8` | Secondary text |
| `--primary` | `#6D4AFF` | Main buttons, links (electric violet) |
| `--primary-hover` | `#8467FF` | Primary hover |
| `--accent-lime` | `#C6FF3D` | Highlights, CTAs, "featured" badge |
| `--accent-pink` | `#FF4D9D` | Playful accents, hearts, alerts of delight |
| `--accent-cyan` | `#22E1FF` | Info, links on hover, tech glow |
| `--success` | `#2EE59D` | Valid input, confirmation |
| `--danger` | `#FF5C7A` | Errors |
| `--on-primary` | `#FFFFFF` | Text on `--primary` |
| `--on-lime` | `#0B0B1A` | Text on `--accent-lime` |

### Light theme (`[data-theme="light"]`)

| Token | Value |
|---|---|
| `--bg` | `#F7F6FF` |
| `--bg-elevated` | `#FFFFFF` |
| `--surface` | `#FFFFFF` |
| `--surface-hover` | `#F0EEFF` |
| `--border` | `#DAD6F5` |
| `--text` | `#14132B` |
| `--text-muted` | `#5B5A7A` |
| `--primary` | `#5B35F2` |
| `--primary-hover` | `#6D4AFF` |
| `--success` | `#0FA86B` |
| `--danger` | `#D92D50` |

Accents (`lime`, `pink`, `cyan`) stay the same in both themes. In light mode, use
lime only as a background with `--on-lime` text, never as text on white.

### Gradients

```css
--gradient-brand: linear-gradient(135deg, #6D4AFF 0%, #FF4D9D 100%);
--gradient-tech:  linear-gradient(135deg, #22E1FF 0%, #6D4AFF 100%);
--gradient-glow:  radial-gradient(circle at 50% 0%, rgba(109,74,255,.35), transparent 60%);
```

Use `--gradient-brand` for hero headline highlights and primary CTAs, `--gradient-tech`
for decorative orbs and borders, `--gradient-glow` behind the hero.

### Category colors (event badges)

| Category | Color |
|---|---|
| Technology | `--cat-tech` |
| Music & Arts | `--cat-music` |
| Business & Networking | `--cat-business` |
| Sports & Fitness | `--cat-sports` |

Badge style: tinted background (color at 15% opacity), 1px border in the color, text in the color.

---

## 3. Typography

Load from Google Fonts (justify in `DECISIONS.md`; always include fallbacks).

| Role | Font | Fallback |
|---|---|---|
| Headings | **Space Grotesk** (600, 700) | `system-ui, sans-serif` |
| Body | **Inter** (400, 500, 600) | `system-ui, sans-serif` |
| Labels, dates, tags, countdown | **JetBrains Mono** (500) | `ui-monospace, monospace` |

### Fluid type scale

```css
--fs-xs:   0.75rem;
--fs-sm:   0.875rem;
--fs-base: 1rem;
--fs-md:   clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
--fs-lg:   clamp(1.375rem, 1.1rem + 1vw, 1.75rem);
--fs-xl:   clamp(1.75rem, 1.3rem + 2vw, 2.5rem);
--fs-2xl:  clamp(2.25rem, 1.5rem + 3.5vw, 4rem);
--fs-hero: clamp(2.75rem, 1.5rem + 6vw, 5.5rem);
```

- Headings: line-height 1.1 to 1.2, letter-spacing `-0.02em`
- Body: line-height 1.6, max line width 65ch
- Mono labels: uppercase, `letter-spacing: 0.08em`, `--fs-xs` or `--fs-sm`

---

## 4. Spacing, radius, shadows

**Spacing (8px grid)**
```css
--space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
--space-5: 1.5rem;   --space-6: 2rem;    --space-7: 3rem;    --space-8: 4rem;
--space-9: 6rem;
```
Section vertical padding: `--space-8` on mobile, `--space-9` on desktop.
Container: max-width `1200px`, horizontal padding `--space-4` (mobile) / `--space-6` (desktop).

**Radius**
```css
--radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 22px;  --radius-pill: 999px;
```
Cards and modal: `--radius-lg`. Inputs and buttons: `--radius-pill` or `--radius-md`. Badges: `--radius-pill`.

**Shadows and glow**
```css
--shadow-sm:  0 2px 8px rgba(0,0,0,.25);
--shadow-md:  0 10px 30px rgba(0,0,0,.35);
--glow-primary: 0 0 0 1px rgba(109,74,255,.5), 0 10px 40px rgba(109,74,255,.35);
--glow-lime:    0 0 0 1px rgba(198,255,61,.5), 0 8px 30px rgba(198,255,61,.25);
```
In light theme, use softer shadows (`rgba(20,19,43,.08 to .15)`).

---

## 5. Motion

```css
--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* playful overshoot */
--dur-fast: 150ms;  --dur-base: 250ms;  --dur-slow: 500ms;
```

| Interaction | Behavior |
|---|---|
| Buttons | Hover: lift `translateY(-2px)` plus glow. Active: `scale(0.97)`. Use `--ease-spring`. |
| Cards | Hover: lift 6px, border turns `--primary`, image scales to 1.06 (image container `overflow: hidden`). |
| Section entrance | Fade up (`opacity 0 to 1`, `translateY(24px to 0)`) via IntersectionObserver, staggered 80ms per card. |
| Modal | Backdrop fades in with `backdrop-filter: blur(8px)`; panel scales from 0.95 to 1 with `--ease-spring`. |
| Theme toggle | Icon rotates 180deg; colors cross-fade over `--dur-base`. |
| Hero decoration | Slow floating gradient orbs (`@keyframes float`, 8 to 12s, infinite, alternate). |
| Form success | Animated checkmark draw plus confetti-style burst (CSS only). |
| Countdown | Mono digits; the changing digit does a quick flip or fade. |

**Required:** wrap decorative and looping animation in
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

---

## 6. Layout and breakpoints

Mobile-first. Breakpoints (in `css/responsive.css` only): `480px`, `768px`, `1024px`, `1280px`.

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navbar | Logo + hamburger menu | Logo + inline links | Logo + links + theme toggle + CTA |
| Event grid | 1 column | 2 columns | 3 columns (4 at 1280+) |
| Hero | Stacked, centered | Stacked | Two columns: text left, decorative visual right |
| Modal | Full-screen sheet | Centered, 600px | Centered, 720px |
| Footer | Stacked | 2 columns | 4 columns |

Touch targets are at least 44x44px. Gap between cards: `--space-5`.

---

## 7. Components

### Navbar
Sticky, `--bg-elevated` at 80% opacity with `backdrop-filter: blur(12px)`, 1px bottom border.
Logo: Space Grotesk bold with a gradient dot or glyph. Active link has a pill highlight.
Theme toggle: icon button (sun/moon).

### Hero
- Mono eyebrow pill: `// upcoming events` (uppercase, `--accent-lime`)
- Headline (`--fs-hero`) with one key word in `--gradient-brand` text
- Subtext in `--text-muted`, max 55ch
- Two CTAs: primary "Explore Events", secondary outline "How it works"
- Search bar (pill, glowing focus ring) under the CTAs
- Background: `--gradient-glow`, subtle grid pattern, 2 to 3 floating orbs
- Stats strip (e.g. `120+ events / 5k+ attendees`) in mono

### Event card
- Image on top (aspect-ratio 16/10, `object-fit: cover`)
- Date chip overlaid top-left on the image: mono, `--surface` with blur, e.g. `NOV 14`
- Category badge top-right
- Title (`--fs-md`, 600), venue with pin icon, short description (2-line clamp)
- Footer row: "X spots left" in mono plus "View details" button
- "Featured" cards get a `--gradient-brand` 1px border and a lime star badge
- Hover behavior as in section 5

### Filters
Horizontal scrollable pill row on mobile (scroll-snap). Active pill: filled `--primary`;
inactive: outline. Include an "All" pill and a result count in mono (`8 events found`).

### Buttons
| Type | Style |
|---|---|
| Primary | `--primary` bg, `--on-primary` text, pill, `--glow-primary` on hover |
| Accent | `--accent-lime` bg, `--on-lime` text, pill, `--glow-lime` on hover |
| Secondary | Transparent, 1.5px `--border`, text `--text`, hover border `--primary` |
| Ghost / icon | No border, hover `--surface-hover` |

Min height 44px, padding `0.75rem 1.5rem`, font-weight 600. Disabled: 50% opacity, no hover effects.

### Inputs
Surface background, 1.5px `--border`, `--radius-md`, 48px height, floating or top labels
(labels are required). Focus: border `--primary` plus 3px ring `rgba(109,74,255,.35)`.
Valid: `--success` border plus check icon. Invalid: `--danger` border, shake animation
(once, 300ms), error text under the field in `--fs-sm` with `aria-live="polite"`.

### Modal (event details + registration)
Large image header, title, mono meta row (date, time, venue, capacity), description, live
countdown, then the registration form. Close button top-right; Esc and backdrop click close.
Focus is trapped and restored on close. `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.

### Confirmation state
Replace the form with an animated success panel: checkmark, "You're in, {name}!",
summary of the event, and a "Done" button. Optional lime/pink confetti burst.

### Empty and loading states
- No results: playful illustration or emoji, "No events match that. Try another filter.", a "Clear filters" button
- Loading: shimmer skeleton cards that match the real card layout

### Footer
`--bg-elevated`, brand blurb, quick links, social icons, mono copyright line.

### Theme toggle
Toggles `data-theme="light|dark"` on `<html>`, persisted via `storage.js`.
Default to the user's `prefers-color-scheme` on first visit.

---

## 8. Iconography and imagery

- Icons: one consistent set (e.g. Lucide or Phosphor via CDN or inline SVG), 20 to 24px, 1.75px stroke
- Event images: Unsplash or similar placeholders, cropped 16:10, with `alt` text; add `loading="lazy"`
- Use emoji sparingly for playful touches (empty states, confirmation)

---

## 9. Accessibility checklist

- [ ] Text contrast is at least 4.5:1 (3:1 for large text); never use `--accent-lime` as text on a light background
- [ ] Every interactive element has a visible `:focus-visible` outline (`2px solid var(--accent-cyan)`, offset 3px)
- [ ] All inputs have labels; errors are announced (`aria-live`)
- [ ] Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`
- [ ] Images have meaningful `alt`; decorative elements use `aria-hidden="true"`
- [ ] Fully keyboard operable (nav, filters, modal, form)
- [ ] `prefers-reduced-motion` respected
- [ ] Information is never conveyed by color alone (add icons or text)

---

## 10. CSS organization (`css/style.css`)

1. `:root` tokens (dark) and `[data-theme="light"]` overrides
2. Reset and base elements
3. Typography utilities
4. Layout (container, grid, section)
5. Components (navbar, hero, card, filters, buttons, inputs, modal, footer)
6. Animations and keyframes
7. Utilities (`.sr-only`, `.visually-hidden`, `.mono`)

Media queries live in `css/responsive.css`. Use BEM-lite class names in kebab-case
(`event-card`, `event-card__title`, `event-card--featured`).

---

## 11. Definition of done (UI)

- Matches this spec at 375px, 768px, and 1280px
- Both themes look intentional (no unreadable text, no missing tokens)
- Every interactive element has hover, focus, active, and disabled states
- No layout shift on image load (fixed aspect ratios)
- Lighthouse accessibility score of 90 or higher
