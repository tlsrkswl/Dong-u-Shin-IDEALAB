// A document-only preview. Original PDF controls remain available in a new tab.
const status = document.querySelector('#viewer-status');
const pages = document.querySelector('#pdf-pages');
const file = new URLSearchParams(location.search).get('file');
const vendor = new URL('../vendor/pdfjs/', import.meta.url);
const states = [];
const near = new Set();
const queue = [];
let rendering = false;
let documentProxy;

function reportError() {
  status.classList.remove('sr-only');
  status.textContent = 'The preview could not be loaded. Open the PDF in a new tab using the link above.';
}

function trimCache() {
  const cached = states.filter(state => state.canvas && !state.rendering);
  const distant = cached.filter(state => !near.has(state)).sort((a, b) =>
    Math.abs(b.element.getBoundingClientRect().top - innerHeight / 2) -
    Math.abs(a.element.getBoundingClientRect().top - innerHeight / 2));
  while (cached.length > 6 && distant.length) {
    const state = distant.shift();
    state.canvas.width = 0;
    state.canvas.height = 0;
    state.canvas.remove();
    state.textLayer?.remove();
    state.canvas = null;
    state.textLayer = null;
    state.width = 0;
    delete state.element.dataset.rendered;
    cached.pop();
  }
}

function enqueue(state) {
  if (!state.queued) {
    state.queued = true;
    queue.push(state);
  }
  void renderQueue();
}

async function renderQueue() {
  if (rendering) return;
  rendering = true;
  try {
    while (queue.length) {
      const state = queue.shift();
      state.queued = false;
      if (!near.has(state)) continue;
      const width = Math.round(state.element.clientWidth);
      if (!width || state.width === width) continue;
      state.rendering = true;
      try {
        const page = await documentProxy.getPage(state.number);
        const viewport = page.getViewport({ scale: width / state.baseWidth });
        const outputScale = Math.min(devicePixelRatio || 1, 2, 2000 / viewport.width);
        state.canvas?.remove();
        state.textLayer?.remove();
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width * outputScale);
        canvas.height = Math.ceil(viewport.height * outputScale);
        canvas.setAttribute('aria-hidden', 'true');
        state.element.style.setProperty('--scale-factor', viewport.scale);
        state.element.style.setProperty('--user-unit', page.userUnit);
        state.element.append(canvas);
        state.canvas = canvas;
        await page.render({
          canvas,
          viewport,
          transform: [outputScale, 0, 0, outputScale, 0, 0],
        }).promise;
        const textLayer = document.createElement('div');
        textLayer.className = 'textLayer';
        state.element.append(textLayer);
        state.textLayer = textLayer;
        await new state.TextLayer({
          textContentSource: page.streamTextContent(),
          container: textLayer,
          viewport,
        }).render();
        state.width = width;
        state.element.dataset.rendered = 'true';
        status.textContent = `Presentation loaded: ${documentProxy.numPages} pages.`;
        status.classList.add('sr-only');
      } catch (error) {
        console.error('PDF page preview failed', error);
        state.element.dataset.renderError = 'true';
        reportError();
      } finally {
        state.rendering = false;
      }
      if (Math.round(state.element.clientWidth) !== width && near.has(state)) enqueue(state);
      trimCache();
    }
  } finally {
    rendering = false;
  }
}

try {
  if (!/^assets\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.pdf$/.test(file || '')) {
    throw new Error('Invalid presentation path');
  }
  const { getDocument, GlobalWorkerOptions, TextLayer } = await import('../vendor/pdfjs/pdf.min.mjs');
  GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', vendor).href;
  const loadingTask = getDocument({
    url: new URL(file, document.baseURI).href,
    cMapUrl: new URL('cmaps/', vendor).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('standard_fonts/', vendor).href,
    wasmUrl: new URL('wasm/', vendor).href,
    iccUrl: new URL('iccs/', vendor).href,
  });
  documentProxy = await loadingTask.promise;
  document.body.dataset.pageCount = documentProxy.numPages;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states[Number(entry.target.dataset.page) - 1];
      if (entry.isIntersecting) {
        near.add(state);
        enqueue(state);
      } else {
        near.delete(state);
      }
    }
    trimCache();
  }, { rootMargin: '700px 0px' });
  for (let number = 1; number <= documentProxy.numPages; number++) {
    const page = await documentProxy.getPage(number);
    const viewport = page.getViewport({ scale: 1 });
    const element = document.createElement('figure');
    element.className = 'pdf-page';
    element.dataset.page = number;
    element.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
    const caption = document.createElement('figcaption');
    caption.className = 'sr-only';
    caption.textContent = `Page ${number} of ${documentProxy.numPages}`;
    element.append(caption);
    states.push({ number, element, baseWidth: viewport.width, TextLayer });
    pages.append(element);
    observer.observe(element);
  }
  let resizeTimer;
  let previousWidth = Math.round(pages.clientWidth);
  new ResizeObserver(() => {
    const width = Math.round(pages.clientWidth);
    if (width === previousWidth) return;
    previousWidth = width;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => near.forEach(enqueue), 120);
  }).observe(pages);
  addEventListener('pagehide', () => {
    observer.disconnect();
    clearTimeout(resizeTimer);
    void loadingTask.destroy();
  }, { once: true });
} catch (error) {
  console.error('PDF preview failed', error);
  reportError();
}
