/**
 * Event Filters, Search & Sorting Module (Phase 3)
 * Provides real-time debounced text search, category filtering,
 * multi-criteria sorting, and dynamic result state tracking.
 */

// Filter state store
let currentFilterState = {
  category: 'all',
  searchQuery: '',
  sortBy: 'date-asc'
};

let filterChangeCallback = null;
let debounceTimeoutId = null;

/**
 * Filters and sorts an array of event objects based on criteria.
 * @param {Array<Object>} events
 * @param {Object} [options]
 * @param {string} [options.category='all']
 * @param {string} [options.searchQuery='']
 * @param {string} [options.sortBy='date-asc']
 * @returns {Array<Object>} Filtered and sorted events
 */
export function filterEvents(events = [], { category = 'all', searchQuery = '', sortBy = 'date-asc' } = {}) {
  if (!Array.isArray(events)) return [];

  const query = (searchQuery || '').trim().toLowerCase();
  const targetCategory = (category || 'all').trim().toLowerCase();

  const filtered = events.filter((event) => {
    // 1. Category match
    if (targetCategory !== 'all') {
      const eventCategory = (event.category || '').toLowerCase();
      if (eventCategory !== targetCategory) {
        return false;
      }
    }

    // 2. Search query match
    if (query) {
      const title = (event.title || '').toLowerCase();
      const venue = (event.venue || '').toLowerCase();
      const shortDesc = (event.shortDescription || '').toLowerCase();
      const fullDesc = (event.description || '').toLowerCase();
      const eventCategory = (event.category || '').toLowerCase();

      const matches =
        title.includes(query) ||
        venue.includes(query) ||
        shortDesc.includes(query) ||
        fullDesc.includes(query) ||
        eventCategory.includes(query);

      if (!matches) {
        return false;
      }
    }

    return true;
  });

  // 3. Sorting
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();

      case 'capacity-desc': {
        const spotsA = a.derivedCapacity ? a.derivedCapacity.remainingSpots : a.capacity;
        const spotsB = b.derivedCapacity ? b.derivedCapacity.remainingSpots : b.capacity;
        return spotsB - spotsA;
      }

      case 'capacity-asc': {
        const spotsA = a.derivedCapacity ? a.derivedCapacity.remainingSpots : a.capacity;
        const spotsB = b.derivedCapacity ? b.derivedCapacity.remainingSpots : b.capacity;
        return spotsA - spotsB;
      }

      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '');

      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '');

      case 'date-asc':
      default:
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });
}

/**
 * Returns a copy of the current filter and sort state.
 * @returns {{ category: string, searchQuery: string, sortBy: string }}
 */
export function getCurrentFilterState() {
  return { ...currentFilterState };
}

/**
 * Updates the results count badge / label with accessible copy.
 * @param {number} count 
 * @param {number} [total]
 */
export function updateResultsCount(count, total) {
  const countEl = document.getElementById('filter-results-count');
  if (!countEl) return;

  const countText = `${count} event${count === 1 ? '' : 's'} found`;
  countEl.textContent = countText;
  countEl.setAttribute('aria-label', total !== undefined ? `${count} of ${total} events found` : countText);
}

/**
 * Resets all filter controls to their default initial state.
 * Clears search, selects "All" category, resets sort to date-asc,
 * and notifies listener callback.
 */
export function resetFilters() {
  currentFilterState = {
    category: 'all',
    searchQuery: '',
    sortBy: 'date-asc'
  };

  const searchInput = document.getElementById('event-search');
  const clearBtn = document.getElementById('search-clear-btn');
  const sortSelect = document.getElementById('event-sort');
  const pills = document.querySelectorAll('.filter-pill');

  if (searchInput) {
    searchInput.value = '';
  }
  if (clearBtn) {
    clearBtn.classList.add('hidden');
  }
  if (sortSelect) {
    sortSelect.value = 'date-asc';
  }

  pills.forEach((pill) => {
    const isAll = (pill.dataset.category || '').toLowerCase() === 'all';
    pill.classList.toggle('is-active', isAll);
    pill.setAttribute('aria-pressed', isAll ? 'true' : 'false');
  });

  if (typeof filterChangeCallback === 'function') {
    filterChangeCallback(getCurrentFilterState());
  }
}

/**
 * Initializes interactive search, category filter pills, and sort controls.
 * @param {Function} onFilterChange Callback invoked when filters change: (state) => void
 */
export function initFilters(onFilterChange) {
  filterChangeCallback = onFilterChange;

  const searchInput = document.getElementById('event-search');
  const clearBtn = document.getElementById('search-clear-btn');
  const sortSelect = document.getElementById('event-sort');
  const pillsContainer = document.getElementById('filter-pills');

  // 1. Debounced Search Input
  if (searchInput) {
    const triggerSearchChange = () => {
      const val = searchInput.value;
      currentFilterState.searchQuery = val;

      if (clearBtn) {
        if (val.trim()) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      }

      if (typeof filterChangeCallback === 'function') {
        filterChangeCallback(getCurrentFilterState());
      }
    };

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeoutId);
      debounceTimeoutId = setTimeout(triggerSearchChange, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearTimeout(debounceTimeoutId);
        searchInput.value = '';
        triggerSearchChange();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounceTimeoutId);
        triggerSearchChange();
      }
    });
  }

  // 2. Clear Search Button
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      clearTimeout(debounceTimeoutId);
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      searchInput.focus();
      currentFilterState.searchQuery = '';
      if (typeof filterChangeCallback === 'function') {
        filterChangeCallback(getCurrentFilterState());
      }
    });
  }

  // 3. Category Filter Pills (Event delegation)
  if (pillsContainer) {
    pillsContainer.addEventListener('click', (e) => {
      const pillBtn = e.target.closest('.filter-pill');
      if (!pillBtn) return;

      const category = pillBtn.dataset.category || 'all';
      currentFilterState.category = category;

      const pills = pillsContainer.querySelectorAll('.filter-pill');
      pills.forEach((btn) => {
        const isActive = btn === pillBtn;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (typeof filterChangeCallback === 'function') {
        filterChangeCallback(getCurrentFilterState());
      }
    });
  }

  // 4. Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilterState.sortBy = sortSelect.value;
      if (typeof filterChangeCallback === 'function') {
        filterChangeCallback(getCurrentFilterState());
      }
    });
  }
}
