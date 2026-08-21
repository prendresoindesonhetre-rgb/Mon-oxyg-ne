(function () {
  var root = document.documentElement;
  var modern = false;
  try {
    modern = !!(
      window.CSS &&
      CSS.supports &&
      CSS.supports('display', 'grid') &&
      CSS.supports('width', 'min(10px, 20px)') &&
      CSS.supports('font-size', 'clamp(10px, 2vw, 20px)')
    );
  } catch (e) {
    modern = false;
  }
  if (!modern) {
    root.className = (root.className ? root.className + ' ' : '') + 'legacy-browser';
  }
})();
