/**
 * Main Application Bootstrapper (Phase 4)
 * Coordinates theme, mobile navigation, event presentation, registration flow,
 * validation feedback, and persistent local storage management.
 */

import {
  getRegistrations,
  getStoredTheme,
  setStoredTheme
} from './storage.js';

import {
  getAllEventsWithCapacity,
  getEventById,
  renderEventsGrid,
  renderHeroSpotlight,
  openEventModal,
  closeEventModal
} from './events.js';

import {
  renderRegistrationFormHTML,
  handleRegistrationSubmit,
  openMyRegistrationsModal,
  closeMyRegistrationsModal,
  closeConfirmationModal,
  validateName,
  validateEmail,
  validatePhone
} from './registration.js';

import {
  initFilters,
  filterEvents,
  resetFilters,
  getCurrentFilterState,
  updateResultsCount
} from './filters.js';

import {
  initCountdownEngine,
  updateAllCountdowns
} from './countdown.js';

let currentSpotlightEvents = [];
let cardEntranceObserver = null;

/**
 * Initializes and manages Dark / Light color theme via data-theme attribute (DESIGN.md Section 7).
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  const storedTheme = getStoredTheme();
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = storedTheme ? storedTheme : (systemPrefersLight ? 'light' : 'dark');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      if (sunIcon) sunIcon.classList.remove('sr-only');
      if (moonIcon) moonIcon.classList.add('sr-only');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
      }
    } else {
      if (sunIcon) sunIcon.classList.add('sr-only');
      if (moonIcon) moonIcon.classList.remove('sr-only');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
      }
    }
  }

  // Apply initial theme
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      themeToggleBtn.classList.add('theme-toggle--rotating');
      setTimeout(() => themeToggleBtn.classList.remove('theme-toggle--rotating'), 400);
      applyTheme(newTheme);
      setStoredTheme(newTheme);
    });
  }
}

/**
 * Initializes mobile navigation hamburger menu drawer and accessibility.
 */
function initMobileNav() {
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');

  if (!menuToggle || !siteNav) return;

  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const focusableSelector = 'a[href], button:not([disabled])';

  function syncNavigationState() {
    if (mobileQuery.matches) {
      siteNav.inert = !siteNav.classList.contains('is-open');
    } else {
      siteNav.inert = false;
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function closeMenu(restoreFocus = false) {
    siteNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    syncNavigationState();
    if (restoreFocus) menuToggle.focus();
  }

  function openMenu() {
    siteNav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    syncNavigationState();
    siteNav.querySelector(focusableSelector)?.focus();
  }

  syncNavigationState();

  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  siteNav.addEventListener('click', (event) => {
    if (!mobileQuery.matches) return;
    if (event.target.closest('a')) closeMenu(true);
    else if (event.target.closest('button')) closeMenu();
  });

  siteNav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileQuery.matches && siteNav.classList.contains('is-open')) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== 'Tab' || !mobileQuery.matches || !siteNav.classList.contains('is-open')) return;
    const focusableItems = [...siteNav.querySelectorAll(focusableSelector)];
    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && (document.activeElement === firstItem || document.activeElement === siteNav)) {
      event.preventDefault();
      lastItem?.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem?.focus();
    }
  });

  mobileQuery.addEventListener('change', syncNavigationState);
}

/**
 * Updates the header badge counter displaying the number of active registrations.
 */
export function updateHeaderRegistrationCount() {
  const countEl = document.getElementById('header-reg-count');
  if (countEl) {
    const count = getRegistrations().length;
    countEl.textContent = String(count);
    countEl.setAttribute('aria-label', `${count} registered events`);
  }
}

/**
 * Initializes and populates events across Hero Spotlight, Featured Grid, and All Events Grid.
 */
export function initEventsDisplay() {
  const allEvents = getAllEventsWithCapacity();

  // 1. Hero spotlight (upcoming featured events)
  const spotlightContainer = document.getElementById('hero-spotlight');
  const featuredEvents = allEvents
    .filter((event) => event.featured)
    .sort((first, second) => new Date(first.date) - new Date(second.date));
  const upcomingFeaturedEvents = featuredEvents.filter((event) => new Date(event.date).getTime() >= Date.now());
  currentSpotlightEvents = upcomingFeaturedEvents.length ? upcomingFeaturedEvents : featuredEvents;
  const spotlightEvent = currentSpotlightEvents[0] || allEvents[0];
  if (spotlightContainer && spotlightEvent) {
    if (currentSpotlightEvents.length === 0) currentSpotlightEvents = [spotlightEvent];
    renderHeroSpotlight(spotlightEvent, spotlightContainer, currentSpotlightEvents, 0);
    spotlightContainer.setAttribute('aria-label', 'Featured event spotlight');
    if (spotlightContainer.dataset.navigationBound !== 'true') {
      spotlightContainer.dataset.navigationBound = 'true';
      spotlightContainer.addEventListener('click', (event) => {
        const control = event.target.closest('[data-spotlight-action], [data-spotlight-index]');
        if (!control || currentSpotlightEvents.length === 0) return;

        const currentIndex = Number(spotlightContainer.dataset.activeSpotlightIndex) || 0;
        const nextIndex = control.hasAttribute('data-spotlight-index')
          ? Number(control.dataset.spotlightIndex)
          : (currentIndex + (control.dataset.spotlightAction === 'next' ? 1 : -1) + currentSpotlightEvents.length) % currentSpotlightEvents.length;
        const boundedIndex = Math.max(0, Math.min(nextIndex, currentSpotlightEvents.length - 1));

        renderHeroSpotlight(currentSpotlightEvents[boundedIndex], spotlightContainer, currentSpotlightEvents, boundedIndex);
        const spotlightStatus = document.getElementById('spotlight-status');
        if (spotlightStatus) {
          spotlightStatus.textContent = `Featured event ${boundedIndex + 1} of ${currentSpotlightEvents.length}: ${currentSpotlightEvents[boundedIndex].title}`;
        }
        updateAllCountdowns();
        if (control.hasAttribute('data-spotlight-index')) {
          spotlightContainer.querySelector(`[data-spotlight-index="${boundedIndex}"]`)?.focus();
        } else {
          spotlightContainer.querySelector(`[data-spotlight-action="${control.dataset.spotlightAction}"]`)?.focus();
        }
      });
    }
  }

  // 2. Featured Events Section
  const featuredContainer = document.getElementById('featured-grid');
  if (featuredContainer) {
    renderEventsGrid(featuredEvents, featuredContainer);
  }

  // 3. All Events Section (delegated to search, filter & sort manager)
  renderFilteredEvents();
  updateAllCountdowns();
}

/**
 * Observes event cards and applies a staggered entrance animation.
 * Respects prefers-reduced-motion.
 */
export function initCardEntranceAnimation() {
  cardEntranceObserver?.disconnect();
  cardEntranceObserver = null;

  const cards = document.querySelectorAll('.event-card:not(.is-visible)');
  if (!cards || cards.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  cardEntranceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card) => cardEntranceObserver.observe(card));
}

/**
 * Applies active search query, category filter pill, and sorting criteria to the All Events catalog.
 * Renders filtered cards or empty state, and updates counters.
 */
export function renderFilteredEvents() {
  const allEvents = getAllEventsWithCapacity();
  const filterState = getCurrentFilterState();
  const filteredEvents = filterEvents(allEvents, filterState);

  const allEventsContainer = document.getElementById('events-grid');
  const emptyStateEl = document.getElementById('empty-state');
  const eventsCountLabel = document.getElementById('events-count-label');

  if (allEventsContainer) {
    if (filteredEvents.length === 0) {
      allEventsContainer.innerHTML = '';
      if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    } else {
      if (emptyStateEl) emptyStateEl.classList.add('hidden');
      renderEventsGrid(filteredEvents, allEventsContainer);
      initCardEntranceAnimation();
      updateAllCountdowns();
    }
  }

  updateResultsCount(filteredEvents.length, allEvents.length);

  if (eventsCountLabel) {
    const activeCat = filterState.category === 'all' ? 'All Categories' : filterState.category;
    const queryNotice = filterState.searchQuery ? ` matching "${filterState.searchQuery}"` : '';
    eventsCountLabel.textContent = `Showing ${filteredEvents.length} of ${allEvents.length} events (${activeCat}${queryNotice})`;
  }
}

/**
 * Mounts the registration form inside the event details modal.
 * @param {string} eventId 
 */
function showRegistrationFormInModal(eventId) {
  const container = document.getElementById('modal-registration-container');
  if (!container) return;

  container.innerHTML = renderRegistrationFormHTML(eventId);
  const form = container.querySelector('#event-registration-form');
  const nameInput = container.querySelector('#reg-name');
  nameInput?.focus();

  // Bind live input validation on blur & input
  if (form) {
    const bindLiveValidation = (input, validator) => {
      const fieldName = input.name;
      const errorEl = form.querySelector(`#err-${fieldName}`);
      const check = () => {
        const val = input.value;
        const res = validator(val, eventId);
        if (!res.isValid) {
          input.classList.add('is-invalid');
          input.classList.remove('is-valid');
          input.setAttribute('aria-invalid', 'true');
          if (errorEl) errorEl.textContent = res.error;
        } else if (val.trim()) {
          input.classList.remove('is-invalid');
          input.classList.add('is-valid');
          input.setAttribute('aria-invalid', 'false');
          if (errorEl) errorEl.textContent = '';
        } else {
          input.classList.remove('is-invalid', 'is-valid');
          input.removeAttribute('aria-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      };

      input.addEventListener('blur', check);
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          check();
        }
      });
    };

    const nameIn = form.querySelector('[name="name"]');
    const emailIn = form.querySelector('[name="email"]');
    const phoneIn = form.querySelector('[name="phone"]');

    if (nameIn) bindLiveValidation(nameIn, validateName);
    if (emailIn) bindLiveValidation(emailIn, validateEmail);
    if (phoneIn) bindLiveValidation(phoneIn, validatePhone);

    // Form submit listener
    form.addEventListener('submit', (e) => {
      handleRegistrationSubmit(e, form, () => {
        updateHeaderRegistrationCount();
        initEventsDisplay();
      });
    });

    // Cancel / Back button inside form
    const cancelRegBtn = form.querySelector('#btn-cancel-reg-form');
    cancelRegBtn?.addEventListener('click', () => {
      const event = getEventById(eventId);
      const isSoldOut = event?.derivedCapacity.isSoldOut;
      container.innerHTML = `
        <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Close</button>
        <button type="button" class="btn btn-primary" id="modal-register-action-btn" data-event-id="${eventId}" ${isSoldOut ? 'disabled aria-disabled="true"' : ''}>
          ${isSoldOut ? 'Sold out' : 'Register for this event'}
        </button>
      `;
      document.getElementById('modal-cancel-btn')?.addEventListener('click', closeEventModal);
      const registerAction = document.getElementById('modal-register-action-btn');
      registerAction?.addEventListener('click', () => {
        showRegistrationFormInModal(eventId);
      });
      (registerAction?.disabled ? document.getElementById('modal-cancel-btn') : registerAction)?.focus();
    });
  }
}

/**
 * Binds event delegation for opening, registering, and closing dialogs.
 */
function initModalListeners() {
  const eventModal = document.getElementById('event-modal');
  const confirmationModal = document.getElementById('confirmation-modal');

  eventModal?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeEventModal();
  });

  confirmationModal?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeConfirmationModal();
  });

  // Delegated click handling for "Details" and "Register" buttons
  document.addEventListener('click', (e) => {
    // 1. Open Event Details
    const detailsBtn = e.target.closest('.btn-event-details');
    if (detailsBtn) {
      const eventId = detailsBtn.dataset.eventId;
      if (eventId) {
        openEventModal(eventId);
      }
      return;
    }

    // 2. Direct Register button click on cards
    const registerBtn = e.target.closest('.btn-event-register');
    if (registerBtn) {
      const eventId = registerBtn.dataset.eventId;
      if (eventId) {
        openEventModal(eventId);
        showRegistrationFormInModal(eventId);
      }
      return;
    }

    // 3. Register button inside modal details view
    const modalRegisterBtn = e.target.closest('#modal-register-action-btn');
    if (modalRegisterBtn) {
      const eventId = modalRegisterBtn.dataset.eventId;
      if (eventId) {
        showRegistrationFormInModal(eventId);
      }
      return;
    }
  });

  // Header "My Registrations" button click
  const openMyRegsBtn = document.getElementById('open-my-registrations-btn');
  if (openMyRegsBtn) {
    openMyRegsBtn.addEventListener('click', () => {
      openMyRegistrationsModal(() => {
        updateHeaderRegistrationCount();
        initEventsDisplay();
      });
    });
  }

  // Backdrop click dismisses modal dialogs
  [eventModal, document.getElementById('my-registrations-modal'), confirmationModal].forEach((dlg) => {
    if (!dlg) return;
    dlg.addEventListener('click', (e) => {
      if (!dlg.open) return;
      const rect = dlg.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!isInDialog) {
        if (dlg === eventModal) closeEventModal();
        if (dlg.id === 'my-registrations-modal') closeMyRegistrationsModal();
        if (dlg === confirmationModal) closeConfirmationModal();
      }
    });
  });
}

/**
 * Handles the newsletter mock submission.
 */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const status = document.getElementById('newsletter-status');

  if (!form || !input || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      status.classList.remove('is-success');
      status.classList.add('is-error');
      status.textContent = 'Please enter a valid email address.';
      return;
    }

    status.classList.remove('is-error');
    status.classList.add('is-success');
    status.textContent = '✓ Thanks for trying the newsletter signup demo.';
    form.reset();

    setTimeout(() => {
      status.textContent = '';
    }, 4000);
  });
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  updateHeaderRegistrationCount();
  initEventsDisplay();
  initModalListeners();
  initNewsletter();

  // Initialize search, category filters, and sort controls
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetFilters();
      document.getElementById('event-search')?.focus();
    });
  }

  initFilters(() => {
    renderFilteredEvents();
  });

  // Start live countdown engine & card animations (Phase 5)
  initCountdownEngine();
  initCardEntranceAnimation();
});
