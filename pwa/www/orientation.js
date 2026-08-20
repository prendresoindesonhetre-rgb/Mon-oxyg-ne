(() => {
  const standalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  async function forceLandscape() {
    if (!standalone()) return;
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        await screen.orientation.lock('landscape');
      }
    } catch (_) {
      // iOS peut refuser l'API : landscape-force.css garde alors
      // exactement la mise en page paysage en secours.
    }
  }

  window.addEventListener('load', forceLandscape);
  window.addEventListener('pageshow', forceLandscape);
  document.addEventListener('pointerdown', forceLandscape, { once: true, passive: true });
})();
