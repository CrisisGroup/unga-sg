/* Narrative controller. The renderer receives semantic scene IDs, not scroll pixels. */
(() => {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  const steps = [...section.querySelectorAll('[data-step]')];
  if (!steps.length) return;
  let active = -1;
  let pending = false;

  function update() {
    pending = false;
    const trigger = window.innerHeight * 0.6;
    let next = 0;
    steps.forEach((step, index) => {
      if (step.querySelector('.step__copy').getBoundingClientRect().top <= trigger) next = index;
    });
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
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  update();
})();
