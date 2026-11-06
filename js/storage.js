/**
 * Synchronous storage adapter for registrations and theme preferences.
 * Falls back to memory for this page load when browser storage is unavailable.
 */

const APP_STORAGE_VERSION = 'v1.0';
const STORAGE_KEYS = {
  VERSION: 'eventpulse_storage_version',
  REGISTRATIONS: 'eventpulse_registrations_v1',
  THEME: 'eventpulse_theme_v1'
};

const memoryStore = new Map();
let localStorageAvailable = isLocalStorageAvailable();

function isLocalStorageAvailable() {
  try {
    const testKey = '__eventpulse_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function initializeStorageVersion() {
  if (!localStorageAvailable) return;

  try {
    const storedVersion = window.localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion && storedVersion !== APP_STORAGE_VERSION) {
      window.localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
      window.localStorage.removeItem(STORAGE_KEYS.THEME);
    }
    window.localStorage.setItem(STORAGE_KEYS.VERSION, APP_STORAGE_VERSION);
  } catch {
    localStorageAvailable = false;
  }
}

initializeStorageVersion();

function isRegistrationRecord(registration) {
  if (!registration || typeof registration !== 'object' || Array.isArray(registration)) return false;

  const stringFields = ['id', 'eventId', 'name', 'email', 'phone', 'registeredAt'];
  if (!stringFields.every((field) => typeof registration[field] === 'string' && registration[field].trim())) {
    return false;
  }

  const isIsoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i
    .test(registration.registeredAt);
  return isIsoTimestamp && Number.isFinite(Date.parse(registration.registeredAt));
}

function normalizeRegistration(registration) {
  return {
    id: registration.id,
    eventId: registration.eventId,
    name: registration.name,
    email: registration.email,
    phone: registration.phone,
    registeredAt: registration.registeredAt
  };
}

function useMemoryFallback(error) {
  localStorageAvailable = false;
  console.warn('[Storage] Browser storage is unavailable; using in-memory data for this page load.', error);
}

function readStorage(key, defaultValue) {
  if (!localStorageAvailable) {
    return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    if (error instanceof SyntaxError) {
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        useMemoryFallback(removeError);
      }
      console.warn(`[Storage] Cleared corrupted data for "${key}".`, error);
      return defaultValue;
    }

    useMemoryFallback(error);
    return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
  }
}

function writeStorage(key, value) {
  if (!localStorageAvailable) {
    memoryStore.set(key, value);
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    memoryStore.set(key, value);
    useMemoryFallback(error);
  }
}

/** Returns all registrations in the required Registration data shape. */
export function getRegistrations() {
  const registrations = readStorage(STORAGE_KEYS.REGISTRATIONS, []);
  if (!Array.isArray(registrations)) {
    writeStorage(STORAGE_KEYS.REGISTRATIONS, []);
    return [];
  }

  const normalized = registrations.filter(isRegistrationRecord).map(normalizeRegistration);
  if (normalized.length !== registrations.length || normalized.some((item, index) => (
    JSON.stringify(item) !== JSON.stringify(registrations[index])
  ))) {
    writeStorage(STORAGE_KEYS.REGISTRATIONS, normalized);
  }
  return normalized;
}

/** Saves a registration and returns the updated collection. */
export function saveRegistration(registration) {
  if (!isRegistrationRecord(registration)) {
    throw new TypeError('Registration must match the required Registration data model.');
  }

  const updated = [...getRegistrations(), normalizeRegistration(registration)];
  writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);
  return updated;
}

/** Removes a registration by ID and returns the updated collection. */
export function removeRegistration(registrationId) {
  const updated = getRegistrations().filter((registration) => registration.id !== registrationId);
  writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);
  return updated;
}

/** Returns registrations associated with an event ID. */
export function getRegistrationsByEvent(eventId) {
  return getRegistrations().filter((registration) => registration.eventId === eventId);
}

/** Returns the saved theme, or null when no valid preference exists. */
export function getStoredTheme() {
  const theme = readStorage(STORAGE_KEYS.THEME, null);
  return theme === 'light' || theme === 'dark' ? theme : null;
}

/** Saves a valid theme preference. */
export function setStoredTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    writeStorage(STORAGE_KEYS.THEME, theme);
  }
}
