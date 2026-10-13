/* Narrative controller. The renderer receives semantic scene IDs, not scroll pixels. */
(() => {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  const steps = [...section.querySelectorAll('[data-step]')];
  if (!steps.length) return;
  const stepAnchors = steps.map(step => step.querySelector('.step__copy') || step);
  const topics = new Map();
  steps.forEach(step => {
    if (!topics.has(step.dataset.step)) topics.set(step.dataset.step, step);
  });
  const backdrop = section.querySelector('.map-backdrop');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let backdropPlaying = false;
  const portrait = window.matchMedia('(orientation: portrait)');
  const legendDock = document.createElement('aside');
  legendDock.className = 'map-legend-dock';
  legendDock.setAttribute('aria-label', 'Current map colour key');
  legendDock.hidden = true;
  section.append(legendDock);
  let legendStep;
  let active = -1;
  let pending = false;

  function updateLegend(step, bounds) {
    if (legendStep !== step) {
      legendStep = step;
      const topic = topics.get(step.dataset.step);
      const legend = step.querySelector('.step__legend') || topic.querySelector('.step__legend');
      legendDock.replaceChildren();
      if (legend) {
        const title = document.createElement('div');
        title.className = 'map-legend-dock__title';
        title.textContent = topic.querySelector('h2').textContent;
        legendDock.append(title, legend.cloneNode(true));
      }
      legendDock.dataset.theme = step.dataset.theme;
      legendDock.dataset.topic = step.dataset.step;
    }
    // The dock belongs to the pinned map, never the introduction or conclusion.
    legendDock.hidden = !portrait.matches || !legendDock.childElementCount ||
      step.dataset.blank === 'true' || bounds.top > 0 || bounds.bottom < window.innerHeight;
  }

  function updateBackdrop(step, bounds) {
    if (!backdrop) return;
    const shouldPlay = step.dataset.theme === 'reform' && !reducedMotion.matches &&
      !document.hidden && bounds.top < window.innerHeight && bounds.bottom > 0;
    if (shouldPlay === backdropPlaying) return;
    backdropPlaying = shouldPlay;
    if (shouldPlay) {
      const sources = backdrop.querySelectorAll('source[data-src]');
      if (sources.length) {
        sources.forEach(source => {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
        });
        backdrop.load();
      }
      // Autoplay can be disabled by the browser; the poster remains available.
      backdrop.play().catch(() => {});
    } else {
      backdrop.pause();
    }
  }

  function update() {
    pending = false;
    const trigger = window.innerHeight * 0.6;
    let next = 0;
    stepAnchors.forEach((anchor, index) => {
      if (anchor.getBoundingClientRect().top <= trigger) next = index;
    });
    const bounds = section.getBoundingClientRect();
    updateLegend(steps[next], bounds);
    updateBackdrop(steps[next], bounds);
    if (next === active) return;
    active = next;
    const step = steps[active];
    section.dataset.activeStep = step.dataset.step;
    steps.forEach((item, index) => item.classList.toggle('is-active', index === active));
    section.dispatchEvent(new CustomEvent('story:stepchange', {
      detail: { id: step.dataset.step, part: Number(step.dataset.part || 1), theme: step.dataset.theme, index: active, total: steps.length }
    }));
  }

  function scheduleUpdate() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }

  section.classList.add('is-enhanced');
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  portrait.addEventListener('change', scheduleUpdate);
  reducedMotion.addEventListener('change', scheduleUpdate);
  document.addEventListener('visibilitychange', scheduleUpdate);
  new ResizeObserver(() => {
    if (!legendDock.hidden) {
      section.style.setProperty('--map-legend-height', `${legendDock.offsetHeight}px`);
    }
  }).observe(legendDock);
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  update();
})();
