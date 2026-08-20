const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

const slides = [
  {
    kicker: 'RESPIRER EN CONSCIENCE',
    title: 'Mon Oxygène',
    body: `
      <p><strong>Respirer est un besoin vital.<br>Mais lorsqu’on y met de la conscience et du sens, chaque souffle devient un retour à soi.</strong></p>
      <p>Mon Oxygène est une application de respiration guidée pensée comme un espace intérieur.</p>
      <p>Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.</p>`
  },
  {
    kicker: 'RETROUVER SA MARGE DE CHOIX',
    title: 'Ce que l’on ne contrôle pas',
    body: `
      <p>Nous ne contrôlons pas ce qui nous entoure.</p>
      <p>Mais nous pouvons contrôler deux choses :<br>nos actions… et nos réactions.</p>
      <p class="quote"><strong>On ne respire pas pour changer le monde,</strong><br><strong>mais pour retrouver un peu plus de liberté dans la manière d’y répondre.</strong></p>`
  },
  {
    kicker: 'CRÉER UN ESPACE INTÉRIEUR',
    title: 'La respiration crée un espace de retour à soi',
    body: `
      <p>Respirer ne cherche pas à effacer ce que l’on ressent.</p>
      <p>C’est une façon de revenir doucement à soi, de prendre un peu de recul, et de laisser les choses se poser.</p>
      <p>Cela permet d’accueillir ce qui est là, sans se juger, et de lui redonner sa juste place.</p>
      <p><strong>Dans les moments d’inconfort, la respiration devient un chemin simple pour revenir à soi et retrouver un peu de sécurité intérieure.</strong></p>`
  },
  {
    kicker: 'LAISSER LE SOUFFLE CIRCULER',
    title: 'Inspire & Expire',
    body: `
      <div class="two-cols">
        <div class="mini-card">
          <h3>À l’inspiration</h3>
          <p>Inspire doucement par le nez. Laisse le ventre se gonfler naturellement.</p>
          <p>Si cela t’aide, tu peux imaginer que tu inspires une <strong>lumière douce</strong>, qui vient apporter un peu d’espace, de chaleur ou de calme à l’intérieur de toi.</p>
        </div>
        <div class="mini-card">
          <h3>À l’expiration</h3>
          <p>Expire doucement par la bouche. Le ventre redescend sans effort.</p>
          <p>Tu peux imaginer que ton expiration emporte <strong>ce dont tu ne souhaites plus t’encombrer</strong>, sans chercher à faire disparaître ce que tu ressens.</p>
        </div>
      </div>
      <p class="quote"><strong>Inspire ce qui te fait du bien.</strong><br><strong>Expire ce qui ne te convient plus.</strong><br><br>Le plus important n’est pas l’amplitude, mais le confort. Reste à l’écoute de ce qui te semble juste.</p>`
  },
  {
    kicker: 'ÉCOUTER SON BESOIN DU MOMENT',
    title: 'Choisir son juste rythme',
    body: `
      <div class="rhythm-grid">
        <div class="rhythm-card"><h3>Retrouver l’équilibre</h3><b>5 / 5</b><p>Un rythme simple et régulier pour revenir à soi.</p></div>
        <div class="rhythm-card"><h3>Ralentir</h3><b>4 / 6 ou 3 / 5</b><p>Pour accompagner le calme et relâcher progressivement.</p></div>
        <div class="rhythm-card"><h3>Dynamiser</h3><b>6 / 4 ou 5 / 3</b><p>Pour soutenir l’énergie et la mise en mouvement.</p></div>
      </div>
      <p><strong>Il n’existe pas de bon rythme universel.</strong><br><strong>Il y a seulement celui dans lequel ta respiration reste fluide et confortable.</strong></p>`
  },
  {
    kicker: 'D’UN OUTIL VERS UNE RESSOURCE',
    title: 'Avec le temps',
    body: `
      <p>Pratiquer régulièrement ne sert pas seulement à se détendre sur le moment.</p>
      <p>Avec le temps, on apprend à mieux se connaître. À reconnaître plus tôt ce qui se passe en soi. Et à créer plus facilement un espace avant d’agir ou de réagir.</p>
      <p>Petit à petit, la respiration devient un repère naturel. Un espace intérieur que tu sauras retrouver facilement.</p>
      <p>Une manière de <strong>prendre soin de son Hêtre</strong> : revenir à soi avec douceur, s’écouter, et accueillir ce qui est là.</p>
      <p><strong>La respiration ne change pas forcément ce qui se passe autour de nous. Mais elle peut changer la manière dont nous le traversons et le percevons.</strong></p>
      <p class="quote">Pour cela, tu n’as rien à réussir, rien à forcer. Laisse simplement faire, de la manière la plus juste et la plus confortable pour toi, en faisant confiance à tes ressentis.</p>`
  }
];

const state = {
  screen: 'install',
  slide: 0,
  config: {
    durationMin: 5,
    inhaleSec: 5,
    exhaleSec: 5,
    startWithInhale: true
  },
  session: null,
  deferredInstall: null,
  wakeLock: null
};

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  state.deferredInstall = event;
  if (state.screen === 'install') renderInstall();
});

window.addEventListener('appinstalled', () => {
  state.deferredInstall = null;
  showToast('Mon Oxygène est installé sur ton appareil.');
});

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function render() {
  cancelSessionFrame();
  if (state.screen === 'install') renderInstall();
  else if (state.screen === 'intro') renderIntro();
  else if (state.screen === 'settings') renderSettings();
  else if (state.screen === 'session') renderSession();
}

function renderInstall() {
  let tip = 'Tu peux aussi ouvrir Mon Oxygène directement dans ton navigateur.';
  if (isIOS && !isStandalone()) {
    tip = 'Sur iPhone : ouvre ce lien dans Safari, touche le bouton Partager, puis « Ajouter à l’écran d’accueil ».';
  } else if (!state.deferredInstall && !isStandalone()) {
    tip = 'Sur Android : ouvre le menu du navigateur puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».';
  }

  app.innerHTML = `
    <section class="screen settings-bg install-shell">
      <div class="install-panel">
        <div class="install-kicker">PRENDRE UN TEMPS POUR SOI</div>
        <h1 class="install-title">Mon Oxygène</h1>
        <p class="install-copy">Un espace de respiration guidée que tu peux installer simplement sur ton téléphone, puis retrouver comme une application.</p>
        <div class="install-actions">
          <button class="primary" id="installBtn">Installer Mon Oxygène</button>
          <button class="secondary" id="openBtn">Ouvrir l’application</button>
        </div>
        <div class="install-tip">${tip}</div>
      </div>
    </section>`;

  document.getElementById('openBtn').addEventListener('click', () => {
    state.screen = 'intro';
    render();
  });
  document.getElementById('installBtn').addEventListener('click', installApp);
}

async function installApp() {
  if (isStandalone()) {
    state.screen = 'intro';
    render();
    return;
  }
  if (state.deferredInstall) {
    const prompt = state.deferredInstall;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') {
      state.deferredInstall = null;
      showToast('Installation lancée.');
    }
    return;
  }
  if (isIOS) {
    showToast('Safari → Partager → Ajouter à l’écran d’accueil');
  } else {
    showToast('Menu du navigateur → Installer l’application');
  }
}

function renderIntro() {
  const slide = slides[state.slide];
  const last = state.slide === slides.length - 1;
  app.innerHTML = `
    <section class="screen settings-bg intro-shell">
      <div class="intro-panel">
        <div class="intro-copy">
          <div class="kicker">${slide.kicker}</div>
          <h1 class="slide-title">${slide.title}</h1>
          <div class="slide-body">${slide.body}</div>
        </div>
        <div class="intro-nav">
          <button class="nav-btn" id="prevSlide" ${state.slide === 0 ? 'disabled style="opacity:.35"' : ''}>Précédent</button>
          <div class="slide-dots">${slides.map((_, i) => `<span class="dot ${i === state.slide ? 'active' : ''}"></span>`).join('')}</div>
          <button class="nav-btn next" id="nextSlide">${last ? 'Configurer' : 'Suivant'}</button>
        </div>
      </div>
    </section>`;

  document.getElementById('prevSlide').addEventListener('click', () => {
    if (state.slide > 0) { state.slide--; renderIntro(); }
  });
  document.getElementById('nextSlide').addEventListener('click', () => {
    if (last) {
      localStorage.setItem('mon-oxygene-intro-seen', '1');
      state.screen = 'settings';
      render();
    } else {
      state.slide++;
      renderIntro();
    }
  });
}

function renderSettings() {
  const c = state.config;
  app.innerHTML = `
    <section class="screen settings-bg settings-shell">
      <div class="settings-logo brand">Mon Oxygène</div>
      <div class="settings-panel">
        <h1 class="settings-title">Mon Oxygène</h1>
        <p class="settings-sub">Choisis un rythme dans lequel ta respiration reste douce, fluide et confortable.</p>

        ${settingRow('Durée de la séance', 'Prends le temps qui te semble juste.', 'durationMin', c.durationMin, 'min')}
        ${settingRow('Inspiration', 'Dynamiser.', 'inhaleSec', c.inhaleSec, 's')}
        ${settingRow('Expiration', 'Récupérer.', 'exhaleSec', c.exhaleSec, 's')}

        <div class="setting-row">
          <div class="setting-label"><strong>Commencer par</strong><span>Choisis la première phase.</span></div>
          <div class="start-toggle">
            <button class="pill-choice ${c.startWithInhale ? 'active' : ''}" data-start="inhale">Inspire</button>
            <button class="pill-choice ${!c.startWithInhale ? 'active' : ''}" data-start="exhale">Expire</button>
          </div>
        </div>

        <div class="preset-title">Rythmes proposés</div>
        <div class="preset-grid">
          <button class="preset" data-preset="5,5"><strong>Équilibre</strong><span>5 s / 5 s</span></button>
          <button class="preset" data-preset="4,6"><strong>Ralentir</strong><span>4 s / 6 s</span></button>
          <button class="preset" data-preset="6,4"><strong>Dynamiser</strong><span>6 s / 4 s</span></button>
        </div>

        <div class="settings-bottom">
          <p class="safety"><strong>Écoute ton corps.</strong> La respiration doit toujours rester confortable. En cas de vertige, gêne, essoufflement ou malaise, arrête l’exercice et reprends simplement ta respiration naturelle.</p>
          <button class="start-session" id="startSession">Commencer ma séance</button>
        </div>
      </div>
    </section>`;

  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.step;
    const delta = Number(button.dataset.delta);
    const limits = key === 'durationMin' ? [1, 20] : [2, 10];
    state.config[key] = Math.max(limits[0], Math.min(limits[1], state.config[key] + delta));
    renderSettings();
  }));
  document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => {
    state.config.startWithInhale = button.dataset.start === 'inhale';
    renderSettings();
  }));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const [inhale, exhale] = button.dataset.preset.split(',').map(Number);
    state.config.inhaleSec = inhale;
    state.config.exhaleSec = exhale;
    renderSettings();
  }));
  document.getElementById('startSession').addEventListener('click', startSession);
}

function settingRow(title, subtitle, key, value, unit) {
  return `
    <div class="setting-row">
      <div class="setting-label"><strong>${title}</strong><span>${subtitle}</span></div>
      <div class="stepper">
        <button aria-label="Diminuer" data-step="${key}" data-delta="-1">−</button>
        <div class="stepper-value">${value} ${unit}</div>
        <button aria-label="Augmenter" data-step="${key}" data-delta="1">+</button>
      </div>
    </div>`;
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) state.wakeLock = await navigator.wakeLock.request('screen');
  } catch (_) {}
}

function startSession() {
  state.session = {
    startedAt: performance.now(),
    pausedTotal: 0,
    pausedAt: 0,
    paused: false,
    frame: 0
  };
  state.screen = 'session';
  requestWakeLock();
  renderSession();
}

function renderSession() {
  const c = state.config;
  app.innerHTML = `
    <section class="screen curve-bg session">
      <div class="session-brand brand">Mon Oxygène</div>
      <div class="session-controls">
        <button class="remote" id="pauseBtn" aria-label="Pause">
          <svg id="pauseIcon" viewBox="0 0 40 40"><rect x="8" y="5" width="8" height="30" rx="3"></rect><rect x="24" y="5" width="8" height="30" rx="3"></rect></svg>
        </button>
        <button class="remote" id="stopBtn" aria-label="Stop">
          <svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="4"></rect></svg>
        </button>
      </div>

      <div class="phase-wrap">
        <div class="phase-title" id="phaseTitle">Inspirez</div>
        <div class="phase-guide" id="phaseGuide"></div>
        <div class="phase-count" id="phaseCount"></div>
      </div>

      <div class="wave-stage" id="waveStage">
        <svg id="waveSvg" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#48d3dc"></stop>
              <stop offset="52%" stop-color="#69beeb"></stop>
              <stop offset="100%" stop-color="#9e80e2"></stop>
            </linearGradient>
          </defs>
          <path class="wave-glow" id="waveGlow"></path>
          <path class="wave-line" id="waveLine"></path>
        </svg>
        <img src="./assets/lotus.png" class="flower" id="flower" alt="">
      </div>

      <div class="progress-zone">
        <div class="progress-left">
          <div class="rhythm-label">Inspire ${c.inhaleSec} s&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;Expire ${c.exhaleSec} s</div>
          <div class="progress-track">
            <div class="progress-fill-shadow" id="progressShadow"></div>
            <div class="progress-fill" id="progressFill"></div>
            <div class="progress-marker" id="progressMarker"></div>
          </div>
        </div>
        <div class="time-pill" id="timePill">${c.durationMin}:00</div>
      </div>
    </section>`;

  document.getElementById('pauseBtn').addEventListener('click', togglePause);
  document.getElementById('stopBtn').addEventListener('click', stopSession);
  tickSession(performance.now());
}

function cancelSessionFrame() {
  if (state.session?.frame) cancelAnimationFrame(state.session.frame);
  if (state.session) state.session.frame = 0;
}

function stopSession() {
  cancelSessionFrame();
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
  state.session = null;
  state.screen = 'settings';
  render();
}

function togglePause() {
  const s = state.session;
  if (!s) return;
  const now = performance.now();
  if (!s.paused) {
    s.paused = true;
    s.pausedAt = now;
  } else {
    s.paused = false;
    s.pausedTotal += now - s.pausedAt;
    s.pausedAt = 0;
  }
  updatePauseIcon();
}

function updatePauseIcon() {
  const icon = document.getElementById('pauseIcon');
  if (!icon || !state.session) return;
  icon.innerHTML = state.session.paused
    ? '<path d="M11 6 L32 20 L11 34 Z"></path>'
    : '<rect x="8" y="5" width="8" height="30" rx="3"></rect><rect x="24" y="5" width="8" height="30" rx="3"></rect>';
}

function elapsedSeconds(now) {
  const s = state.session;
  if (!s) return 0;
  const effectiveNow = s.paused ? s.pausedAt : now;
  return Math.max(0, (effectiveNow - s.startedAt - s.pausedTotal) / 1000);
}

function cyclePosition(t) {
  const c = state.config;
  const cycle = c.inhaleSec + c.exhaleSec;
  return ((t % cycle) + cycle) % cycle;
}

function isInhaleAt(t) {
  const c = state.config;
  const m = cyclePosition(t);
  if (c.startWithInhale) return m < c.inhaleSec;
  return !(m < c.exhaleSec);
}

function phaseRemaining(t) {
  const c = state.config;
  const cycle = c.inhaleSec + c.exhaleSec;
  const m = cyclePosition(t);
  if (c.startWithInhale) return m < c.inhaleSec ? c.inhaleSec - m : cycle - m;
  return m < c.exhaleSec ? c.exhaleSec - m : cycle - m;
}

function waveAt(t) {
  const c = state.config;
  const cycle = c.inhaleSec + c.exhaleSec;
  const m = cyclePosition(t);
  if (c.startWithInhale) {
    if (m < c.inhaleSec) return -Math.cos(Math.PI * (m / c.inhaleSec));
    return Math.cos(Math.PI * ((m - c.inhaleSec) / c.exhaleSec));
  }
  if (m < c.exhaleSec) return Math.cos(Math.PI * (m / c.exhaleSec));
  return -Math.cos(Math.PI * ((m - c.exhaleSec) / c.inhaleSec));
}

function breathEase(t) {
  const c = state.config;
  const m = cyclePosition(t);
  let q;
  if (c.startWithInhale) {
    q = m < c.inhaleSec ? m / c.inhaleSec : 1 - (m - c.inhaleSec) / c.exhaleSec;
  } else {
    q = m < c.exhaleSec ? 1 - m / c.exhaleSec : (m - c.exhaleSec) / c.inhaleSec;
  }
  q = Math.max(0, Math.min(1, q));
  return 0.5 - 0.5 * Math.cos(Math.PI * q);
}

function guidanceAt(t, inhale) {
  const c = state.config;
  const cycle = c.inhaleSec + c.exhaleSec;
  const cycleIndex = Math.floor(t / cycle);
  if (cycleIndex >= 4) return '';
  const visual = cycleIndex % 2 === 1;
  if (visual) return inhale
    ? 'Imagine une lumière douce qui entre avec ton souffle'
    : "Laisse partir ce dont tu ne souhaites plus t'encombrer";
  return inhale
    ? 'Par le nez  •  le ventre se gonfle'
    : 'Par la bouche  •  le ventre se dégonfle';
}

function buildWavePath(elapsed) {
  const c = state.config;
  const cycle = c.inhaleSec + c.exhaleSec;
  const visibleSpan = cycle * 4.35;
  const mid = 250;
  const amp = 190.5;
  const points = 280;
  let d = '';
  for (let i = 0; i <= points; i++) {
    const x = i / points * 1000;
    const t = elapsed + (i / points - 0.5) * visibleSpan;
    const y = mid - amp * waveAt(t);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d;
}

function tickSession(now) {
  const s = state.session;
  if (!s || state.screen !== 'session') return;

  const c = state.config;
  const elapsed = elapsedSeconds(now);
  const total = c.durationMin * 60;
  const remain = Math.max(0, total - elapsed);

  if (remain <= 0) {
    stopSession();
    showToast('Séance terminée.');
    return;
  }

  const inhale = isInhaleAt(elapsed);
  const phaseTitle = document.getElementById('phaseTitle');
  const phaseGuide = document.getElementById('phaseGuide');
  const phaseCount = document.getElementById('phaseCount');
  if (phaseTitle) phaseTitle.textContent = inhale ? 'Inspirez' : 'Expirez';
  if (phaseGuide) phaseGuide.textContent = guidanceAt(elapsed, inhale);
  if (phaseCount) phaseCount.textContent = `${phaseRemaining(elapsed).toFixed(1)} s`;

  const path = buildWavePath(elapsed);
  document.getElementById('waveLine')?.setAttribute('d', path);
  document.getElementById('waveGlow')?.setAttribute('d', path);

  const flower = document.getElementById('flower');
  if (flower) {
    const y = 250 - 190.5 * waveAt(elapsed);
    const scale = 0.70 + 0.48 * breathEase(elapsed);
    flower.style.left = '50%';
    flower.style.top = `${y / 5}%`;
    flower.style.transform = `translate(-50%,-50%) scale(${scale.toFixed(4)})`;
  }

  const progress = Math.max(0, Math.min(1, elapsed / total));
  const pct = `${(progress * 100).toFixed(3)}%`;
  const progressFill = document.getElementById('progressFill');
  const progressShadow = document.getElementById('progressShadow');
  const progressMarker = document.getElementById('progressMarker');
  if (progressFill) progressFill.style.width = pct;
  if (progressShadow) progressShadow.style.width = pct;
  if (progressMarker) progressMarker.style.left = pct;

  const sec = Math.ceil(remain);
  const minutes = Math.floor(sec / 60);
  const seconds = String(sec % 60).padStart(2, '0');
  const timePill = document.getElementById('timePill');
  if (timePill) timePill.textContent = `${minutes}:${seconds}`;

  updatePauseIcon();
  s.frame = requestAnimationFrame(tickSession);
}

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && state.screen === 'session' && !state.wakeLock) await requestWakeLock();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

if (isStandalone()) {
  state.screen = localStorage.getItem('mon-oxygene-intro-seen') ? 'settings' : 'intro';
} else {
  state.screen = 'install';
}
render();
