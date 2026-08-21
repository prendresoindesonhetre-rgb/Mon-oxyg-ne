(() => {
  'use strict';

  // v38 : aucune rotation ni verrouillage artificiel.
  // Le navigateur conserve l'orientation réelle de l'appareil et le CSS
  // réorganise l'interface automatiquement en portrait ou en paysage.
  function refreshViewport() {
    window.dispatchEvent(new Event('resize'));
  }

  window.addEventListener('load', refreshViewport);
  window.addEventListener('pageshow', refreshViewport);
  window.addEventListener('orientationchange', () => {
    setTimeout(refreshViewport, 60);
    setTimeout(refreshViewport, 260);
  });
})();
