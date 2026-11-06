/**
 * Live Countdown Engine (Phase 5 Bonus)
 * Calculates authoritative venue-local remaining time down to the second
 * and updates countdown badges across the hero spotlight, featured cards,
 * and event detail modals.
 */

let tickerIntervalId = null;

/**
 * Calculates remaining days, hours, minutes, and seconds relative to now.
 * @param {string} targetDateISO - Authoritative ISO timestamp
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isPast: boolean, formatted: string }}
 */
export function calculateTimeRemaining(targetDateISO) {
  if (!targetDateISO) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, formatted: 'Date TBD' };
  }

  const targetTime = new Date(targetDateISO).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formatted: 'Happening Now'
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const formatted = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formatted
  };
}

/**
 * Renders the prominent structured countdown block for the hero spotlight.
 * @param {string} targetDateISO
 * @returns {string} HTML string
 */
export function renderSpotlightCountdownHTML(targetDateISO) {
  const remaining = calculateTimeRemaining(targetDateISO);

  if (remaining.isPast) {
    return `
      <div class="spotlight-countdown mono is-live" data-countdown-date="${targetDateISO}" aria-label="Event status">
        <span class="live-pulse-badge">
          <span class="live-dot" aria-hidden="true"></span>
          <span>LIVE NOW &bull; HAPPENING TODAY</span>
        </span>
      </div>
    `;
  }

  return `
    <div class="spotlight-countdown mono" data-countdown-date="${targetDateISO}" aria-label="Starts in ${remaining.formatted}">
      <span class="countdown-eyebrow">// COUNTDOWN TO KICKOFF</span>
      <div class="countdown-blocks">
        <div class="countdown-block">
          <span class="countdown-val" data-unit="days">${remaining.days}</span>
          <span class="countdown-unit">DAYS</span>
        </div>
        <span class="countdown-colon" aria-hidden="true">:</span>
        <div class="countdown-block">
          <span class="countdown-val" data-unit="hours">${String(remaining.hours).padStart(2, '0')}</span>
          <span class="countdown-unit">HOURS</span>
        </div>
        <span class="countdown-colon" aria-hidden="true">:</span>
        <div class="countdown-block">
          <span class="countdown-val" data-unit="minutes">${String(remaining.minutes).padStart(2, '0')}</span>
          <span class="countdown-unit">MINS</span>
        </div>
        <span class="countdown-colon" aria-hidden="true">:</span>
        <div class="countdown-block">
          <span class="countdown-val" data-unit="seconds">${String(remaining.seconds).padStart(2, '0')}</span>
          <span class="countdown-unit">SECS</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders an inline countdown chip for featured cards.
 * @param {string} targetDateISO
 * @returns {string} HTML string
 */
export function renderCardCountdownHTML(targetDateISO) {
  const remaining = calculateTimeRemaining(targetDateISO);
  const text = remaining.isPast ? 'Happening Now' : remaining.formatted;

  return `
    <div class="card-countdown mono" data-countdown-date="${targetDateISO}" aria-label="Starts in ${text}">
      <span class="countdown-icon" aria-hidden="true">⏱</span>
      <span class="countdown-text" data-unit="compact">${text}</span>
    </div>
  `;
}

/**
 * Renders a countdown banner row inside the event details modal.
 * @param {string} targetDateISO
 * @returns {string} HTML string
 */
export function renderModalCountdownHTML(targetDateISO) {
  const remaining = calculateTimeRemaining(targetDateISO);
  const text = remaining.isPast ? 'Happening Now' : remaining.formatted;

  return `
    <div class="modal-countdown-strip mono" data-countdown-date="${targetDateISO}">
      <span class="modal-countdown-label">
        <span aria-hidden="true">⏱</span> COUNTDOWN TO EVENT:
      </span>
      <span class="modal-countdown-timer" data-unit="compact">${text}</span>
    </div>
  `;
}

/**
 * Scans the DOM and updates all active countdown elements.
 */
export function updateAllCountdowns() {
  const elements = document.querySelectorAll('[data-countdown-date]');
  if (!elements || elements.length === 0) return;

  elements.forEach((el) => {
    const targetDateISO = el.dataset.countdownDate;
    if (!targetDateISO) return;

    const remaining = calculateTimeRemaining(targetDateISO);

    // Update compact chips and strips
    const compactEl = el.querySelector('[data-unit="compact"]');
    if (compactEl) {
      compactEl.textContent = remaining.isPast ? 'Happening Now' : remaining.formatted;
    }

    // Update structured spotlight blocks
    const daysEl = el.querySelector('[data-unit="days"]');
    const hoursEl = el.querySelector('[data-unit="hours"]');
    const minsEl = el.querySelector('[data-unit="minutes"]');
    const secsEl = el.querySelector('[data-unit="seconds"]');

    if (daysEl) daysEl.textContent = String(remaining.days);
    if (hoursEl) hoursEl.textContent = String(remaining.hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(remaining.minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(remaining.seconds).padStart(2, '0');

    if (remaining.isPast) {
      el.classList.add('is-live');
    } else {
      el.classList.remove('is-live');
    }
  });
}

/**
 * Starts the master 1-second countdown interval ticker.
 * @returns {number} Interval ID
 */
export function initCountdownEngine() {
  if (tickerIntervalId) {
    clearInterval(tickerIntervalId);
  }

  // Immediate sync
  updateAllCountdowns();

  // Master ticker
  tickerIntervalId = setInterval(updateAllCountdowns, 1000);
  return tickerIntervalId;
}

/**
 * Stops the countdown ticker interval (cleanup).
 */
export function stopCountdownEngine() {
  if (tickerIntervalId) {
    clearInterval(tickerIntervalId);
    tickerIntervalId = null;
  }
}
