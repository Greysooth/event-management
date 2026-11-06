/**
 * Main Application Bootstrapper (Phase 1 Baseline)
 * Initializes theme, mobile navigation, and global header registration counts.
 */

import {
  getRegistrations,
  getStoredTheme,
  setStoredTheme
} from './storage.js';

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
    if (mobileQuery.matches && event.target.closest('a, button')) closeMenu(true);
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
    status.textContent = '✓ Thank you for subscribing to event updates!';
    form.reset();

    setTimeout(() => {
      status.textContent = '';
    }, 4000);
  });
}

// Bootstrap Phase 1 foundation on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  updateHeaderRegistrationCount();
  initNewsletter();
});
