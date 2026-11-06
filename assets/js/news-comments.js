/* Giscus threads use the stable article URL, independent of cache/tracking queries. */
(() => {
  'use strict';
  function mount(section, id) {
    if (!section || !id || section.dataset.mounted) return;
    section.dataset.mounted = 'true';
    section.hidden = false;
    const articleURL = new URL(location.pathname, location.origin);
    articleURL.searchParams.set('id', id);
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    const settings = {
      repo: 'tlsrkswl/Dong-u-Shin-IDEALAB',
      'repo-id': 'R_kgDOVAp1aQ',
      category: 'Announcements',
      'category-id': 'DIC_kwDOVAp1ac4DKgEU',
      // A specific canonical URL keeps URL-based threads stable when ?v= changes.
      mapping: 'specific',
      term: articleURL.href,
      strict: '0',
      'reactions-enabled': '1',
      'emit-metadata': '0',
      'input-position': 'bottom',
      theme: 'light',
      lang: 'ko',
      loading: 'lazy'
    };
    for (const [key, value] of Object.entries(settings)) script.setAttribute('data-' + key, value);
    script.crossOrigin = 'anonymous';
    script.async = true;
    const status = section.querySelector('.comments-load-status');
    script.onerror = () => { status.textContent = '댓글을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.'; };
    const container = section.querySelector('.giscus');
    const observer = new MutationObserver(() => {
      const frame = container.querySelector('iframe.giscus-frame');
      if (!frame) return;
      frame.addEventListener('load', () => { status.hidden = true; }, {once:true});
      observer.disconnect();
    });
    observer.observe(container, {childList:true, subtree:true});
    container.append(script);
  }
  window.IDEALabComments = {mount};
})();
