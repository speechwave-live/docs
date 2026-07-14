// Speechwave codebase explainer — interactive stepper and collapsible
// sections. Ported from the retired docs/explainer/index.html. No-ops on
// pages with no .stepper or .collapsible elements, so it's safe to load
// site-wide.

function initSteppers() {
  document.querySelectorAll('.stepper').forEach(stepper => {
    const steps = stepper.querySelectorAll('.stepper-step');
    const dotsEl = stepper.querySelector('.stepper-dots');
    const counter = stepper.querySelector('.step-counter');
    const btnPrev = stepper.querySelector('.btn-prev');
    const btnNext = stepper.querySelector('.btn-next');
    let current = 0;

    steps.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'stepper-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(dot);
    });

    function goTo(n) {
      steps[current].classList.remove('active');
      current = Math.max(0, Math.min(n, steps.length - 1));
      steps[current].classList.add('active');
      dotsEl.querySelectorAll('.stepper-dot').forEach((d, i) => {
        d.classList.toggle('done', i < current);
        d.classList.toggle('active', i === current);
      });
      counter.textContent = `Step ${current + 1} of ${steps.length}`;
      btnPrev.disabled = current === 0;
      btnNext.textContent = current === steps.length - 1 ? '✓ Done' : 'Next →';
    }

    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => { if (current < steps.length - 1) goTo(current + 1); });
    goTo(0);
  });

  document.addEventListener('keydown', e => {
    const active = document.querySelector('.stepper');
    if (!active) return;
    if (e.key === 'ArrowRight') active.querySelector('.btn-next').click();
    if (e.key === 'ArrowLeft') active.querySelector('.btn-prev').click();
  });
}

function initCollapsibles() {
  document.querySelectorAll('.collapsible').forEach(el => {
    const trigger = el.querySelector('.collapsible-trigger');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      el.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(el.classList.contains('open')));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSteppers();
  initCollapsibles();
});
