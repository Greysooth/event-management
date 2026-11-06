/**
 * Events Catalog and Presentation Module
 * Manages the canonical event list, derived capacity computations,
 * DOM card rendering, hero spotlight display, and accessible detail modal interactions.
 */

import { getRegistrationsByEvent } from './storage.js';
import {
  renderSpotlightCountdownHTML,
  renderCardCountdownHTML,
  renderModalCountdownHTML
} from './countdown.js';

/**
 * Canonical Sample Events List (AGENTS.md Data Model)
 * Event: { id, title, category, date (ISO string), time, venue, image, shortDescription, description, capacity, featured }
 */
export const sampleEvents = [
  {
    id: 'evt-tech-01',
    title: 'Global AI & Cloud Architecture Summit 2026',
    category: 'Technology',
    date: '2026-11-25T09:00:00-08:00',
    time: '09:00 AM - 05:00 PM PST',
    venue: 'Grand Horizon Convention Center, San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Explore breakthroughs in generative AI, neural hardware, and scalable cloud architectures with industry pioneers.',
    description: 'Join over 500 technologists, machine learning engineers, and cloud architects for a full day of deep-dive keynotes, hands-on architectural workshops, and interactive panels. Discover cutting-edge LLM deployments, edge intelligence, and enterprise-scale AI security frameworks. Lunch and networking reception included.',
    capacity: 150,
    featured: true
  },
  {
    id: 'evt-tech-02',
    title: 'NextGen Web & Decentralized Systems Hackathon',
    category: 'Technology',
    date: '2026-12-10T10:00:00-06:00',
    time: '10:00 AM - 08:00 PM CST',
    venue: 'VentureHub Innovation Lab, Austin, TX',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Collaborate, build, and pitch progressive web applications and decentralized protocols in a 10-hour sprint.',
    description: 'A fast-paced collaborative hackathon bringing together frontend designers, fullstack engineers, and distributed systems enthusiasts. Mentors from leading tech firms will guide teams through real-world problem statements. Cash prizes, investor visibility, and API credits awarded to top 3 teams.',
    capacity: 80,
    featured: false
  },
  {
    id: 'evt-art-03',
    title: 'Echoes in Bloom: Indie & Electronic Music Night',
    category: 'Music & Arts',
    date: '2026-11-30T19:00:00-05:00',
    time: '07:00 PM - 11:30 PM EST',
    venue: 'Skyline Open-Air Amphitheater, Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'An immersive audiovisual concert featuring breakout indie bands, synth-wave artists, and kinetic light stages.',
    description: 'Experience mesmerizing soundscapes under the city skyline. Echoes in Bloom brings together emerging independent bands, kinetic projection mapping, and ambient synthesizer beatmakers for an unforgettable sensory evening. Gourmet artisan food trucks and craft beverage bars available all night.',
    capacity: 250,
    featured: true
  },
  {
    id: 'evt-art-04',
    title: 'Contemporary Canvas: Modern Art Gala & Auction',
    category: 'Music & Arts',
    date: '2026-12-18T18:00:00-06:00',
    time: '06:00 PM - 10:00 PM CST',
    venue: 'Lumina Center for Contemporary Arts, Chicago, IL',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Curated exhibition showcasing physical oil paintings, generative digital media, and interactive sculptures.',
    description: 'A sophisticated evening celebrating progressive visual art. Meet featured artists, sculptors, and creative directors. Includes an opening curator walk, live acoustic cello accompaniment, and an exclusive silent auction benefiting community youth arts education programs.',
    capacity: 120,
    featured: false
  },
  {
    id: 'evt-biz-05',
    title: 'Founders & Funders: Venture Growth Summit 2026',
    category: 'Business & Networking',
    date: '2026-12-03T08:30:00-05:00',
    time: '08:30 AM - 04:30 PM EST',
    venue: 'Beacon Financial Center, 32nd Floor, Boston, MA',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Direct networking, curated pitch sessions, and scale-up masterclasses with angel investors and VC partners.',
    description: 'High-impact networking designed for early-stage and seed founders looking to scale sustainably. Featuring structured 1-on-1 pitch speed meetings, valuation and term sheet breakdowns by leading VC partners, and peer roundtables on cross-border growth strategies.',
    capacity: 100,
    featured: true
  },
  {
    id: 'evt-biz-06',
    title: 'Women in Leadership & Tech Exchange',
    category: 'Business & Networking',
    date: '2026-12-15T17:30:00-08:00',
    time: '05:30 PM - 09:00 PM PST',
    venue: 'Metropolitan Business Guild, Seattle, WA',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Inspiring talks, small-group mentorship circles, and executive networking for aspiring and senior leaders.',
    description: 'Celebrate diversity and visionary leadership in modern business and engineering. The evening features an inspiring keynote on navigating executive transitions, followed by small-group mentorship circles focusing on negotiation, team scaling, and board readiness.',
    capacity: 90,
    featured: false
  },
  {
    id: 'evt-spt-07',
    title: 'Urban Twilight 10K & Half Marathon',
    category: 'Sports & Fitness',
    date: '2026-12-08T16:00:00-08:00',
    time: '04:00 PM - 08:00 PM PST',
    venue: 'Riverside Waterfront Promenade, Portland, OR',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Scenic sunset road race along the riverfront with chip timing, finisher medals, and post-race festival.',
    description: 'Lace up for an exhilarating sunset run! Whether targeting a personal record in the certified Half Marathon or completing your first 10K, enjoy scenic river views, live DJ cheer stations every 2 kilometers, medical hydration support, and commemorative technical running shirts.',
    capacity: 300,
    featured: false
  },
  {
    id: 'evt-spt-08',
    title: 'Mindful Flow: Sunrise Yoga & Wellness Retreat',
    category: 'Sports & Fitness',
    date: '2026-12-20T07:00:00-07:00',
    time: '07:00 AM - 12:00 PM MST',
    venue: 'Solarium Botanical Gardens, Denver, CO',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Rejuvenating morning of guided Vinyasa flow, breathwork meditation, and holistic nutrition workshops.',
    description: 'Escape the daily hustle inside the lush botanical glasshouse. Led by master yoga instructors and breathwork specialists, this half-day wellness immersion includes sound bath healing, posture alignment clinics, organic cold-pressed juices, and healthy botanical breakfast bowls.',
    capacity: 60,
    featured: false
  }
];

// Track element that had focus before opening modal to restore on close
let lastFocusedElement = null;

/**
 * Returns badge class and label corresponding to event category.
 * @param {string} category
 * @returns {{ className: string, label: string }}
 */
function getCategoryBadgeMeta(category) {
  switch (category) {
    case 'Technology':
      return { className: 'badge-tech', label: 'Technology' };
    case 'Music & Arts':
      return { className: 'badge-music', label: 'Music & Arts' };
    case 'Business & Networking':
      return { className: 'badge-business', label: 'Business & Networking' };
    case 'Sports & Fitness':
      return { className: 'badge-sports', label: 'Sports & Fitness' };
    default:
      return { className: 'badge-tech', label: category };
  }
}

/**
 * Formats ISO date string into short uppercase month and day (e.g. "NOV 25").
 * @param {string} dateISO
 * @returns {string}
 */
function formatShortDate(dateISO) {
  const date = getVenueDate(dateISO);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
    .format(date)
    .toUpperCase();
  const day = date.getUTCDate();
  return `${month} ${day}`;
}

function getVenueDate(dateISO) {
  const [year, month, day] = dateISO.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/**
 * Formats ISO date string into full readable date (e.g. "Wednesday, November 25, 2026").
 * @param {string} dateISO
 * @returns {string}
 */
function formatFullDate(dateISO) {
  const date = getVenueDate(dateISO);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

/**
 * Computes runtime derived capacity for an event based on stored registrations.
 * @param {Object} event
 * @returns {Object} Event augmented with derivedCapacity { total, registered, remaining, isSoldOut, isLow }
 */
export function getEventWithDerivedCapacity(event) {
  const registeredCount = getRegistrationsByEvent(event.id).length;
  const remaining = Math.max(0, event.capacity - registeredCount);
  const isSoldOut = remaining === 0;
  const isLow = remaining > 0 && remaining <= Math.ceil(event.capacity * 0.15);

  return {
    ...event,
    derivedCapacity: {
      total: event.capacity,
      registered: registeredCount,
      remaining,
      isSoldOut,
      isLow
    }
  };
}

/**
 * Returns all sample events merged with runtime derived capacity.
 * @returns {Array<Object>}
 */
export function getAllEventsWithCapacity() {
  return sampleEvents.map(getEventWithDerivedCapacity);
}

/**
 * Retrieves a single event by ID with derived capacity.
 * @param {string} id
 * @returns {Object|null}
 */
export function getEventById(id) {
  const event = sampleEvents.find((evt) => evt.id === id);
  return event ? getEventWithDerivedCapacity(event) : null;
}

function renderCapacityMeterHTML(capacity) {
  const total = Number(capacity.total);
  if (!Number.isFinite(total) || total <= 0) return '';

  const registered = Math.min(total, Math.max(0, Number(capacity.registered) || 0));
  const remaining = Math.max(0, total - registered);

  return `
    <progress
      class="event-card__capacity"
      max="${total}"
      value="${registered}"
      aria-label="Seats reserved"
      aria-valuetext="${registered} of ${total} seats reserved; ${remaining} remaining"
    ></progress>
  `;
}

/**
 * Creates and returns an HTML article element representing an event card.
 * @param {Object} event - Event with derivedCapacity
 * @returns {HTMLElement}
 */
export function renderEventCard(event) {
  const card = document.createElement('article');
  card.className = `event-card ${event.featured ? 'event-card--featured' : ''}`;
  card.id = `card-${event.id}`;
  card.setAttribute('aria-labelledby', `card-title-${event.id}`);

  const categoryMeta = getCategoryBadgeMeta(event.category);
  const shortDate = formatShortDate(event.date);
  const capacity = event.derivedCapacity || {
    total: event.capacity,
    registered: 0,
    remaining: event.capacity,
    isSoldOut: false,
    isLow: false
  };

  let spotsClass = '';
  let spotsText = `${capacity.remaining} spots left`;
  if (capacity.isSoldOut) {
    spotsClass = 'is-sold-out';
    spotsText = 'Sold Out';
  } else if (capacity.isLow) {
    spotsClass = 'is-low';
    spotsText = `${capacity.remaining} spots left (Filling fast!)`;
  }

  card.innerHTML = `
    <div class="event-card__image-wrap">
      <img
        src="${event.image}"
        alt="${event.title} event scene"
        class="event-card__image"
        loading="lazy"
        width="400"
        height="250"
      >
      <time class="event-card__date-chip" datetime="${event.date}" aria-label="${formatFullDate(event.date)}">${shortDate}</time>
      <span class="event-card__badge ${categoryMeta.className}">${categoryMeta.label}</span>
      ${event.featured ? '<span class="event-card__badge event-card__featured-badge badge-featured">★ Featured</span>' : ''}
    </div>
    <div class="event-card__body">
      <div class="event-card__venue" title="${event.venue}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${event.venue}</span>
      </div>
      ${event.featured ? renderCardCountdownHTML(event.date) : ''}
      <h3 id="card-title-${event.id}" class="event-card__title">${event.title}</h3>
      <p class="event-card__desc">${event.shortDescription}</p>
      ${renderCapacityMeterHTML(capacity)}
      <div class="event-card__footer">
        <span class="event-card__spots ${spotsClass}">${spotsText}</span>
        <div class="event-card__actions">
          <button
            type="button"
            class="btn btn-secondary btn-event-details"
            data-event-id="${event.id}"
            aria-label="View details for ${event.title}"
          >
            Details
          </button>
          <button
            type="button"
            class="btn btn-primary btn-event-register"
            data-event-id="${event.id}"
            ${capacity.isSoldOut ? 'disabled aria-disabled="true"' : ''}
            aria-label="Register for ${event.title}"
          >
            ${capacity.isSoldOut ? 'Sold Out' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

/**
 * Populates a container element with an array of event cards.
 * @param {Array<Object>} events
 * @param {HTMLElement} container
 */
export function renderEventsGrid(events, container) {
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  events.forEach((event) => {
    fragment.appendChild(renderEventCard(event));
  });

  container.appendChild(fragment);
}

/**
 * Renders the prominent Hero Spotlight card in the hero section.
 * @param {Object} event
 * @param {HTMLElement} container
 * @param {Array<Object>} featuredEvents
 * @param {number} activeIndex
 */
export function renderHeroSpotlight(event, container, featuredEvents = [event], activeIndex = 0) {
  if (!container || !event) return;

  const categoryMeta = getCategoryBadgeMeta(event.category);
  const shortDate = formatShortDate(event.date);
  const capacity = event.derivedCapacity || {
    total: event.capacity,
    registered: 0,
    remaining: event.capacity,
    isSoldOut: false
  };
  const safeFeaturedEvents = featuredEvents.length ? featuredEvents : [event];

  container.dataset.activeSpotlightIndex = String(activeIndex);
  container.innerHTML = `
    <article class="event-card event-card--featured spotlight-card" aria-labelledby="spotlight-title">
      <div class="event-card__image-wrap spotlight-card__image-wrap">
        <img
          src="${event.image}"
          alt="${event.title} event scene"
          class="event-card__image"
          loading="eager"
          width="600"
          height="338"
        >
        <time class="event-card__date-chip" datetime="${event.date}" aria-label="${formatFullDate(event.date)}">${shortDate}</time>
        <span class="event-card__badge ${categoryMeta.className}">${categoryMeta.label}</span>
        <span class="event-card__badge event-card__featured-badge badge-featured"><span aria-hidden="true">★</span> Featured pick</span>
      </div>
      <div class="event-card__body">
        <div class="event-card__venue" title="${event.venue}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${event.venue}</span>
        </div>
        <h2 id="spotlight-title" class="event-card__title spotlight-card__title">${event.title}</h2>
        <p class="event-card__desc spotlight-card__description">${event.shortDescription}</p>
        ${renderSpotlightCountdownHTML(event.date)}
        ${renderCapacityMeterHTML(capacity)}
        <div class="spotlight-navigation" role="group" aria-label="Featured event navigation">
          <button type="button" class="slider-arrow-btn" data-spotlight-action="previous" aria-label="Previous featured event">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
          </button>
          <div class="slider-segments" role="group" aria-label="Choose a featured event">
            ${safeFeaturedEvents.map((featuredEvent, index) => `
              <button type="button" class="slider-segment ${index === activeIndex ? 'is-active' : ''}" data-spotlight-index="${index}" aria-label="Show featured event ${index + 1}: ${featuredEvent.title}" aria-pressed="${index === activeIndex}"></button>
            `).join('')}
          </div>
          <button type="button" class="slider-arrow-btn" data-spotlight-action="next" aria-label="Next featured event">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </div>
        <div class="event-card__footer spotlight-card__footer">
          <span class="event-card__spots ${capacity.isSoldOut ? 'is-sold-out' : ''}">
            ${capacity.isSoldOut ? 'Sold Out' : `${capacity.remaining} spots available`}
          </span>
          <div class="event-card__actions">
            <button type="button" class="btn btn-secondary btn-event-details" data-event-id="${event.id}" aria-label="View full details for ${event.title}">Details</button>
            <button type="button" class="btn btn-accent btn-event-register" data-event-id="${event.id}" ${capacity.isSoldOut ? 'disabled aria-disabled="true"' : ''} aria-label="Register for ${event.title}">
              ${capacity.isSoldOut ? 'Sold Out' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
export function openEventModal(eventId) {
  const event = getEventById(eventId);
  if (!event) return;

  const modal = document.getElementById('event-modal');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalContent || modal.open) return;

  lastFocusedElement = document.activeElement;

  const categoryMeta = getCategoryBadgeMeta(event.category);
  const fullDate = formatFullDate(event.date);
  const capacity = event.derivedCapacity;

  modalContent.innerHTML = `
    <header class="modal-header">
      <div class="modal-header-content">
        <span class="event-card__badge ${categoryMeta.className} modal-category-badge">${categoryMeta.label}</span>
        <h2 id="modal-event-title" class="modal-title">${event.title}</h2>
      </div>
      <button type="button" class="btn-modal-close" id="modal-close-btn" aria-label="Close event details">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>

    <div class="event-detail-image-wrap">
      <img src="${event.image}" alt="${event.title} event scene" class="event-detail-image" width="800" height="500">
    </div>

    <div class="modal-content-body">
      ${renderModalCountdownHTML(event.date)}
      <dl class="event-detail-meta">
        <div class="event-detail-meta__item">
          <dt>Date</dt>
          <dd>${fullDate}</dd>
        </div>
        <div class="event-detail-meta__item">
          <dt>Time</dt>
          <dd>${event.time}</dd>
        </div>
        <div class="event-detail-meta__item event-detail-meta__item--venue">
          <dt>Venue</dt>
          <dd>${event.venue}</dd>
        </div>
      </dl>

      <section class="modal-description-section" aria-labelledby="modal-description-title">
        <h3 id="modal-description-title" class="modal-section-title">About this event</h3>
        <p class="modal-description">${event.description}</p>
      </section>

      <dl class="modal-capacity-grid">
        <div class="modal-capacity-item">
          <dt class="modal-meta-label">Venue capacity</dt>
          <dd class="modal-meta-value">${capacity.total} seats</dd>
        </div>
        <div class="modal-capacity-item">
          <dt class="modal-meta-label">Spots remaining</dt>
          <dd class="modal-meta-value modal-capacity-remaining ${capacity.isSoldOut ? 'is-sold-out' : 'is-available'}">
            ${capacity.isSoldOut ? 'Sold out' : `${capacity.remaining} available`}
          </dd>
        </div>
      </dl>

      <div id="modal-registration-container" class="modal-registration-actions">
        <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Close</button>
        <button type="button" class="btn btn-primary" id="modal-register-action-btn" data-event-id="${event.id}" ${capacity.isSoldOut ? 'disabled aria-disabled="true"' : ''}>
          ${capacity.isSoldOut ? 'Sold out' : 'Register for this event'}
        </button>
      </div>
    </div>
  `;

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }

  const closeButton = document.getElementById('modal-close-btn');
  closeButton?.focus();
  closeButton?.addEventListener('click', closeEventModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeEventModal);
}
export function closeEventModal() {
  const modal = document.getElementById('event-modal');
  if (modal) {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}
