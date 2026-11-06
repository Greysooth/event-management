/**
 * Registration & Form Validation Module (Phase 4)
 * Handles client-side registration persistence, accessible validation,
 * duplicate booking prevention, confirmation display, and "My Registrations" management.
 */

import {
  getRegistrations,
  saveRegistration,
  removeRegistration
} from './storage.js';

import { getEventById, closeEventModal } from './events.js';

let lastConfirmationTrigger = null;
let lastRegistrationsTrigger = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatEventDate(dateISO) {
  const [year, month, day] = dateISO.slice(0, 10).split('-').map(Number);
  const venueDate = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(venueDate);
}

function restoreModalFocus(trigger) {
  const focusIfAvailable = (element) => {
    if (!element || !element.isConnected || element.closest('[inert]')) return false;
    element.focus();
    return document.activeElement === element;
  };

  if (focusIfAvailable(trigger)) return;

  if (trigger?.closest('[inert]')) {
    focusIfAvailable(document.getElementById('menu-toggle'));
    return;
  }

  const eventId = trigger?.dataset?.eventId;
  if (eventId) {
    const detailsButton = [...document.querySelectorAll('.btn-event-details')]
      .find((button) => button.dataset.eventId === eventId);
    if (focusIfAvailable(detailsButton)) return;
  }

  focusIfAvailable(document.getElementById('open-my-registrations-btn')) ||
    focusIfAvailable(document.getElementById('menu-toggle'));
}

/**
 * Validates full name.
 * Rule: Required, 2-60 chars, letters, spaces, hyphens, periods, apostrophes only.
 * @param {string} name 
 * @returns {{ isValid: boolean, error: string }}
 */
export function validateName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your full name.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Name cannot exceed 60 characters.' };
  }
  const nameRegex = /^[\p{L}\p{M}\s.'’\-]+$/u;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, periods, and apostrophes.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates email address and checks for duplicate registrations for the same event.
 * Rule: Standard RFC-compliant email, trimmed and lowercased.
 * @param {string} email 
 * @param {string|null} eventId 
 * @returns {{ isValid: boolean, error: string }}
 */
export function validateEmail(email, eventId = null) {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  // Duplicate registration check
  if (eventId) {
    const existing = getRegistrations();
    const isDuplicate = existing.some(
      (reg) => reg.eventId === eventId && (reg.email || '').trim().toLowerCase() === trimmed
    );
    if (isDuplicate) {
      return { isValid: false, error: 'You are already registered for this event with this email address.' };
    }
  }

  return { isValid: true, error: '' };
}

/**
 * Validates phone number.
 * Rule: Must contain 10-15 digits after removing non-numeric characters.
 * @param {string} phone 
 * @returns {{ isValid: boolean, error: string }}
 */
export function validatePhone(phone) {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const generalRegex = /^\+?[0-9\s().-]{10,20}$/;
  if (!generalRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid phone number (10 to 15 digits).' };
  }
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number must contain between 10 and 15 digits.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates the full registration form.
 * @param {{ name: string, email: string, phone: string, eventId: string }} formData 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateForm({ name, email, phone, eventId }) {
  const errors = {};

  const nameVal = validateName(name);
  if (!nameVal.isValid) errors.name = nameVal.error;

  const emailVal = validateEmail(email, eventId);
  if (!emailVal.isValid) errors.email = emailVal.error;

  const phoneVal = validatePhone(phone);
  if (!phoneVal.isValid) errors.phone = phoneVal.error;

  // Capacity verification
  if (eventId) {
    const event = getEventById(eventId);
    if (!event) {
      errors.general = 'Event not found.';
    } else if (event.derivedCapacity.isSoldOut) {
      errors.general = 'Sorry, this event is completely sold out.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generates and returns HTML for the embedded registration form.
 * @param {string} eventId 
 * @returns {string} HTML string
 */
export function renderRegistrationFormHTML(eventId) {
  return `
    <form id="event-registration-form" class="registration-form" novalidate data-event-id="${eventId}">
      <h3 class="registration-form-title">Attendee Registration</h3>
      <p class="registration-form-desc">Complete the details below to save your registration in this browser.</p>

      <div class="form-group" id="group-name">
        <label for="reg-name" class="form-label">Full Name <span class="required" aria-hidden="true">*</span></label>
        <input
          type="text"
          id="reg-name"
          name="name"
          class="form-input"
          placeholder="e.g. Alex Morgan"
          autocomplete="name"
          required
          aria-required="true"
          aria-describedby="err-name"
        >
        <span class="form-error" id="err-name" role="alert" aria-live="polite"></span>
      </div>

      <div class="form-group" id="group-email">
        <label for="reg-email" class="form-label">Email Address <span class="required" aria-hidden="true">*</span></label>
        <input
          type="email"
          id="reg-email"
          name="email"
          class="form-input"
          placeholder="e.g. alex@example.com"
          autocomplete="email"
          required
          aria-required="true"
          aria-describedby="err-email"
        >
        <span class="form-error" id="err-email" role="alert" aria-live="polite"></span>
      </div>

      <div class="form-group" id="group-phone">
        <label for="reg-phone" class="form-label">Phone Number <span class="required" aria-hidden="true">*</span></label>
        <input
          type="tel"
          id="reg-phone"
          name="phone"
          class="form-input"
          placeholder="e.g. +1 (555) 234-5678"
          autocomplete="tel"
          required
          aria-required="true"
          aria-describedby="err-phone"
        >
        <span class="form-error" id="err-phone" role="alert" aria-live="polite"></span>
      </div>

      <div class="form-general-error" id="err-general" role="alert" aria-live="polite"></div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="btn-cancel-reg-form">Back</button>
        <button type="submit" class="btn btn-primary" id="btn-submit-registration">
          Confirm Registration
        </button>
      </div>
    </form>
  `;
}

/**
 * Displays live validation errors on form input elements.
 * @param {HTMLFormElement} form 
 * @param {Object} errors 
 */
function applyFormErrors(form, errors) {
  ['name', 'email', 'phone'].forEach((field) => {
    const input = form.querySelector(`[name="${field}"]`);
    const errorEl = form.querySelector(`#err-${field}`);
    if (!input || !errorEl) return;

    if (errors[field]) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = errors[field];
      input.closest('.form-group')?.classList.add('shake');
      setTimeout(() => input.closest('.form-group')?.classList.remove('shake'), 350);
    } else if (input.value.trim()) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
    } else {
      input.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    }
  });

  const generalErrorEl = form.querySelector('#err-general');
  if (generalErrorEl) {
    generalErrorEl.textContent = errors.general || '';
  }
}

/**
 * Handles form submission, validation, storage, and confirmation modal trigger.
 * @param {Event} e 
 * @param {HTMLFormElement} form 
 * @param {Function} onSuccessCallback 
 */
export function handleRegistrationSubmit(e, form, onSuccessCallback) {
  e.preventDefault();
  const eventId = form.dataset.eventId;
  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  const phoneInput = form.querySelector('[name="phone"]');

  const formData = {
    name: nameInput?.value || '',
    email: emailInput?.value || '',
    phone: phoneInput?.value || '',
    eventId
  };

  const validation = validateForm(formData);
  applyFormErrors(form, validation.errors);

  if (!validation.isValid) {
    // Focus the first invalid input
    const firstInvalid = form.querySelector('.is-invalid');
    firstInvalid?.focus();
    return;
  }

  // Create official Registration record (AGENTS.md Data Model)
  const registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventId,
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    registeredAt: new Date().toISOString()
  };

  saveRegistration(registration);

  const event = getEventById(eventId);
  closeEventModal();
  showConfirmationModal(registration, event, onSuccessCallback);

  if (typeof onSuccessCallback === 'function') {
    onSuccessCallback(registration, event);
  }
}

/**
 * Opens and renders the Confirmation Modal dialog.
 * @param {Object} registration 
 * @param {Object} event 
 * @param {Function} onUpdateCallback
 */
export function showConfirmationModal(registration, event, onUpdateCallback) {
  const modal = document.getElementById('confirmation-modal');
  const content = document.getElementById('confirmation-content');
  if (!modal || !content || modal.open) return;

  lastConfirmationTrigger = document.activeElement;
  const eventDate = event ? formatEventDate(event.date) : '';

  content.innerHTML = `
    <div class="confirmation-panel">
      <!-- Animated Checkmark SVG -->
      <div class="confirmation-icon-wrap" aria-hidden="true">
        <svg class="confirmation-check" viewBox="0 0 52 52">
          <circle class="confirmation-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="confirmation-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h2 id="confirmation-title" class="confirmation-title">You're in, ${escapeHTML(registration.name)}!</h2>
      <p class="confirmation-subtext">Your registration has been saved in this browser.</p>

      <div class="confirmation-card">
        <div class="confirmation-card__title">${escapeHTML(event ? event.title : 'Event Reservation')}</div>
        <div class="confirmation-card__meta mono">
          <span>${escapeHTML(eventDate)}${event?.time ? ` · ${escapeHTML(event.time)}` : ''}</span>
          <span>${escapeHTML(event ? event.venue : '')}</span>
        </div>
        <div class="confirmation-card__id mono">
          Registration ID: <strong>${escapeHTML(registration.id)}</strong>
        </div>
      </div>

      <div class="confirmation-actions">
        <button type="button" class="btn btn-secondary" id="btn-view-bookings-from-confirm">
          My Registrations
        </button>
        <button type="button" class="btn btn-primary" id="btn-done-confirmation">
          Done
        </button>
      </div>
    </div>
  `;

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }

  const doneBtn = document.getElementById('btn-done-confirmation');
  const viewBookingsBtn = document.getElementById('btn-view-bookings-from-confirm');

  doneBtn?.focus();

  doneBtn?.addEventListener('click', closeConfirmationModal);
  viewBookingsBtn?.addEventListener('click', () => {
    closeConfirmationModal();
    openMyRegistrationsModal(onUpdateCallback);
  });
}

/**
 * Closes confirmation modal.
 */
export function closeConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }
  restoreModalFocus(lastConfirmationTrigger);
  lastConfirmationTrigger = null;
}

/**
 * Renders the attendee's active registrations inside the "My Registrations" dialog.
 * @param {HTMLElement} container 
 * @param {Function} onCancelCallback 
 */
export function renderMyRegistrationsList(container, onCancelCallback) {
  if (!container) return;
  const registrations = getRegistrations();

  if (registrations.length === 0) {
    container.innerHTML = `
      <div class="my-registrations-empty">
        <span class="my-registrations-empty__icon" aria-hidden="true">🎟️</span>
        <h3 class="my-registrations-empty__title">No registrations yet</h3>
        <p class="my-registrations-empty__text">
          Explore upcoming events and save a place at something you love.
        </p>
        <button type="button" class="btn btn-primary" id="btn-empty-browse-events">Browse events</button>
      </div>
    `;

    document.getElementById('btn-empty-browse-events')?.addEventListener('click', () => {
      closeMyRegistrationsModal();
      window.location.hash = '#all-events';
    });
    return;
  }

  let listHTML = `
    <div class="my-registrations-list">
  `;

  registrations.forEach((reg) => {
    const event = getEventById(reg.eventId);
    const eventTitle = event ? event.title : 'Event';
    const eventVenue = event ? event.venue : 'Venue';
    const eventTime = event ? event.time : '';
    const eventSchedule = event?.date
      ? `${formatEventDate(event.date)}${eventTime ? ` · ${eventTime}` : ''}`
      : eventTime;
    const regDate = new Date(reg.registeredAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    listHTML += `
      <div class="my-reg-item" id="reg-item-${escapeHTML(reg.id)}">
        <div class="my-reg-item__main">
          <div class="my-reg-item__title">${escapeHTML(eventTitle)}</div>
          <div class="my-reg-item__meta mono">
            <span>📅 ${escapeHTML(eventSchedule)}</span>
            <span>📍 ${escapeHTML(eventVenue)}</span>
          </div>
          <div class="my-reg-item__sub mono">
            ID: ${escapeHTML(reg.id)} &bull; Booked on ${regDate}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-cancel-reg"
          data-registration-id="${escapeHTML(reg.id)}"
          aria-label="Cancel registration for ${escapeHTML(eventTitle)}"
        >
          Cancel
        </button>
      </div>
    `;
  });

  listHTML += `</div>`;
  container.innerHTML = listHTML;

  // Bind cancel buttons
  container.querySelectorAll('.btn-cancel-reg').forEach((btn) => {
    btn.addEventListener('click', () => {
      const regId = btn.dataset.registrationId;
      cancelUserRegistration(regId, onCancelCallback);
    });
  });
}

/**
 * Cancels a user registration, releases derived capacity, and re-renders UI.
 * @param {string} registrationId 
 * @param {Function} onUpdateCallback 
 */
export function cancelUserRegistration(registrationId, onUpdateCallback) {
  if (!confirm('Are you sure you want to cancel this event registration?')) {
    return;
  }

  removeRegistration(registrationId);

  const container = document.getElementById('my-registrations-content');
  if (container) {
    renderMyRegistrationsList(container, onUpdateCallback);
  }

  if (typeof onUpdateCallback === 'function') {
    onUpdateCallback();
  }
}

/**
 * Opens the "My Registrations" modal dialog.
 * @param {Function} onUpdateCallback 
 */
export function openMyRegistrationsModal(onUpdateCallback) {
  const modal = document.getElementById('my-registrations-modal');
  const content = document.getElementById('my-registrations-content');
  if (!modal || !content || modal.open) return;

  lastRegistrationsTrigger = document.activeElement;

  content.innerHTML = `
    <div class="modal-header">
      <h2 id="my-registrations-title" class="modal-title">My Registered Events</h2>
      <button type="button" class="btn-modal-close" id="my-regs-close-btn" aria-label="Close dialog">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="my-regs-body" class="my-registrations-body">
      <!-- Populated via renderMyRegistrationsList -->
    </div>
  `;

  const bodyContainer = document.getElementById('my-regs-body');
  renderMyRegistrationsList(bodyContainer, onUpdateCallback);

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }

  const closeBtn = document.getElementById('my-regs-close-btn');
  closeBtn?.focus();
  closeBtn?.addEventListener('click', closeMyRegistrationsModal);

  if (modal.dataset.cancelHandlerBound !== 'true') {
    modal.dataset.cancelHandlerBound = 'true';
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeMyRegistrationsModal();
    });
  }
}

/**
 * Closes "My Registrations" modal dialog and returns focus.
 */
export function closeMyRegistrationsModal() {
  const modal = document.getElementById('my-registrations-modal');
  if (modal) {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }
  restoreModalFocus(lastRegistrationsTrigger);
  lastRegistrationsTrigger = null;
}
