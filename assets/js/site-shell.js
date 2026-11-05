/* Shared navigation for the portfolio and its standalone demos. */
(() => {
  'use strict';
  const header = document.querySelector('.unified-header');
  if (!header) return;
  const toggle = header.querySelector('.unified-menu-toggle');
  const nav = header.querySelector('#primary-nav');
  const mobile = matchMedia('(max-width: 980px)');
  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (nav.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
  mobile.addEventListener('change', close);
  // The comparison canvas fills the viewport below the shared header.
  if (document.body.dataset.unified === 'compare') {
    const updateHeight = () => document.body.style.setProperty('--shell-height', `${header.offsetHeight}px`);
    updateHeight();
    new ResizeObserver(updateHeight).observe(header);
  }
})();
