(() => {
  try {
    const theme = localStorage.getItem('wm-theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.dataset.theme = theme;
    }
  } catch {
    // System preference remains the safe fallback when storage is unavailable.
  }
})();
