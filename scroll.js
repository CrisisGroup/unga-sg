/* Narrative controller. The renderer receives semantic scene IDs, not scroll pixels. */
(() => {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  const steps = [...section.querySelectorAll('[data-step]')];
  if (!steps.length) return;
  const portrait = window.matchMedia('(orientation: portrait)');
  const legendDock = document.createElement('aside');
  legendDock.className = 'map-legend-dock';
  legendDock.setAttribute('aria-label', 'Current map colour key');
  legendDock.hidden = true;
  section.append(legendDock);
  let legendTopic;
  let active = -1;
  let pending = false;

  function updateLegend(step) {
    if (legendTopic !== step.dataset.step) {
      legendTopic = step.dataset.step;
      const legend = step.querySelector('.step__legend');
      legendDock.replaceChildren();
      if (legend) {
        const title = document.createElement('div');
        title.className = 'map-legend-dock__title';
        const topic = steps.find(item => item.dataset.step === legendTopic);
        title.textContent = topic.querySelector('h2').textContent;
        legendDock.append(title, legend.cloneNode(true));
      }
      legendDock.dataset.theme = step.dataset.theme;
      legendDock.dataset.topic = legendTopic;
    }
    // The dock belongs to the pinned map, never the introduction or conclusion.
    const bounds = section.getBoundingClientRect();
    legendDock.hidden = !portrait.matches || !legendDock.childElementCount ||
      bounds.top > 0 || bounds.bottom < window.innerHeight;
  }

  function update() {
    pending = false;
    const trigger = window.innerHeight * 0.6;
    let next = 0;
    steps.forEach((step, index) => {
      if (step.querySelector('.step__copy').getBoundingClientRect().top <= trigger) next = index;
    });
    updateLegend(steps[next]);
    if (next === active) return;
    active = next;
    const step = steps[active];
    section.dataset.activeStep = step.dataset.step;
    steps.forEach((item, index) => item.classList.toggle('is-active', index === active));
    section.dispatchEvent(new CustomEvent('story:stepchange', {
      detail: { id: step.dataset.step, theme: step.dataset.theme, index: active, total: steps.length }
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
  new ResizeObserver(() => {
    if (!legendDock.hidden) {
      section.style.setProperty('--map-legend-height', `${legendDock.offsetHeight}px`);
    }
  }).observe(legendDock);
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  update();
})();
