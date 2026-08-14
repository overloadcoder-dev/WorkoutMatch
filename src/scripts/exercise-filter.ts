const FILTER_KEYS = [
  'equipment',
  'muscle',
  'pattern',
  'difficulty',
  'position',
  'impact',
  'noise',
  'space',
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

const MAX_QUERY_LENGTH = 700;
const MAX_SEARCH_LENGTH = 64;
const MAX_FILTER_VALUE_LENGTH = 32;

const normalizeSearch = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');

const form = document.querySelector<HTMLFormElement>('#exercise-filter-form');
const searchInput =
  document.querySelector<HTMLInputElement>('#exercise-search');
const cards = Array.from(
  document.querySelectorAll<HTMLElement>('[data-exercise-card]'),
);
const countNode = document.querySelector<HTMLElement>('[data-exercise-count]');
const emptyState = document.querySelector<HTMLElement>('[data-exercise-empty]');
const results = document.querySelector<HTMLElement>('#exercise-results');
const copyButton = document.querySelector<HTMLButtonElement>(
  '[data-copy-filter-link]',
);
const copyStatus = document.querySelector<HTMLElement>(
  '[data-copy-filter-status]',
);
const emptyClearButton =
  document.querySelector<HTMLButtonElement>('[data-empty-clear]');

if (form && searchInput && countNode && emptyState && results) {
  const selectFor = (key: FilterKey): HTMLSelectElement | null =>
    form.querySelector<HTMLSelectElement>(`select[name="${key}"]`);

  const allowedValues = new Map<FilterKey, ReadonlySet<string>>(
    FILTER_KEYS.map((key) => {
      const values = Array.from(selectFor(key)?.options ?? [])
        .map((option) => option.value)
        .filter(Boolean);
      return [key, new Set(values)] as const;
    }),
  );

  const shareableSearchCorpus = cards
    .map((card) => normalizeSearch(card.dataset.search ?? ''))
    .filter(Boolean);

  const isShareableSearch = (value: string): boolean => {
    const normalized = normalizeSearch(value);
    return (
      normalized.length > 0 &&
      normalized.length <= MAX_SEARCH_LENGTH &&
      /^[a-z0-9 '-]+$/i.test(value) &&
      shareableSearchCorpus.some((entry) => entry.includes(normalized))
    );
  };

  const restoreFromUrl = (): void => {
    searchInput.value = '';
    FILTER_KEYS.forEach((key) => {
      const select = selectFor(key);
      if (select) select.value = '';
    });

    if (window.location.search.length > MAX_QUERY_LENGTH) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') ?? '';
    if (query.length <= MAX_SEARCH_LENGTH && isShareableSearch(query)) {
      searchInput.value = query;
    }

    FILTER_KEYS.forEach((key) => {
      const raw = params.get(key) ?? '';
      if (
        raw.length > 0 &&
        raw.length <= MAX_FILTER_VALUE_LENGTH &&
        allowedValues.get(key)?.has(raw)
      ) {
        const select = selectFor(key);
        if (select) select.value = raw;
      }
    });
  };

  const syncUrl = (): void => {
    const url = new URL(window.location.href);
    url.search = '';

    const query = searchInput.value.trim();
    if (isShareableSearch(query)) url.searchParams.set('q', query);

    FILTER_KEYS.forEach((key) => {
      const value = selectFor(key)?.value ?? '';
      if (allowedValues.get(key)?.has(value)) url.searchParams.set(key, value);
    });

    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  const cardMatches = (
    card: HTMLElement,
    key: FilterKey,
    selected: string,
  ): boolean => {
    if (!selected) return true;
    return (card.dataset[key] ?? '').split(' ').includes(selected);
  };

  const applyFilters = (updateUrl = true): void => {
    const query = normalizeSearch(searchInput.value);
    const selected = Object.fromEntries(
      FILTER_KEYS.map((key) => [key, selectFor(key)?.value ?? '']),
    ) as Record<FilterKey, string>;

    let visibleCount = 0;
    cards.forEach((card) => {
      const matchesSearch =
        !query || normalizeSearch(card.dataset.search ?? '').includes(query);
      const matchesFilters = FILTER_KEYS.every((key) =>
        cardMatches(card, key, selected[key]),
      );
      const matches = matchesSearch && matchesFilters;
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    countNode.textContent = `${visibleCount} ${visibleCount === 1 ? 'exercise' : 'exercises'}`;
    emptyState.hidden = visibleCount !== 0;
    results.hidden = visibleCount === 0;
    if (updateUrl) syncUrl();
  };

  const clearFilters = (): void => {
    form.reset();
    queueMicrotask(() => {
      applyFilters();
      searchInput.focus();
    });
  };

  restoreFromUrl();
  applyFilters();

  searchInput.addEventListener('input', () => applyFilters());
  FILTER_KEYS.forEach((key) => {
    selectFor(key)?.addEventListener('change', () => applyFilters());
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });

  form.addEventListener('reset', () => {
    queueMicrotask(() => applyFilters());
  });

  emptyClearButton?.addEventListener('click', clearFilters);

  copyButton?.addEventListener('click', async () => {
    syncUrl();
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (copyStatus) {
        copyStatus.textContent = isShareableSearch(searchInput.value)
          ? 'Filtered library link copied.'
          : 'Filtered library link copied. Unrecognized free-text searches stay on this device.';
      }
    } catch {
      if (copyStatus) {
        copyStatus.textContent =
          'Copy is unavailable. You can copy the current address from your browser.';
      }
    }
    if (copyStatus) copyStatus.hidden = false;
  });

  window.addEventListener('popstate', () => {
    restoreFromUrl();
    applyFilters(false);
  });
}
