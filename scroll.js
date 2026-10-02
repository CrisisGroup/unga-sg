/* One graphic, driven by the position of the narrative steps. */
(() => {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  const figure = section.querySelector('.scrolly__graphic');
  const steps = [...section.querySelectorAll('[data-step]')];
  if (!figure || !steps.length) return;
  const title = section.querySelector('#graphic-title');
  const svgTitle = section.querySelector('#graphic-svg-title');
  const caption = section.querySelector('[data-graphic-caption]');
  const count = section.querySelector('[data-graphic-count]');
  const mobile = window.matchMedia('(max-width: 700px)');
  let active = -1;
  let pending = false;

  function update() {
    pending = false;
    // On mobile, the narrative is below a compact sticky graphic.
    const trigger = window.innerHeight * (mobile.matches ? 0.78 : 0.55);
    let next = 0;
    steps.forEach((step, index) => {
      const copy = step.querySelector('.step__copy') || step;
      if (copy.getBoundingClientRect().top <= trigger) next = index;
    });
    if (next === active) return;
    active = next;
    const step = steps[active];
    figure.dataset.state = step.dataset.step;
    title.textContent = step.dataset.title;
    svgTitle.textContent = `Placeholder graphic: ${step.dataset.title.toLowerCase()}`;
    caption.textContent = step.dataset.caption;
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    steps.forEach((item, index) => item.classList.toggle('is-active', index === active));
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
