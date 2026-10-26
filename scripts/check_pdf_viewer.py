"""Browser smoke test for the document-only PDF preview.

Requires Playwright's Python package and Chromium; no production dependency.
Run from any directory with: python3 scripts/check_pdf_viewer.py
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import shutil
import threading
from urllib.parse import quote

from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            # Closing a PDF tab legitimately cancels an in-flight download.
            pass


def check():
    study = json.loads((BASE / 'content/projects.json').read_text())[0]
    document = study['documents'][0]
    browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
    if not browser_path:
        raise RuntimeError('Chromium is required; set CHROMIUM_PATH if it is not on PATH.')
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(BASE)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=browser_path, headless=True, args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1440, 'height': 1050})
            errors = []
            requests = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: requests.append(request.url))
            page.goto(base + 'study.html?id=' + study['id'])
            page.locator('.study-pdf-open').wait_for()
            assert not any('pdf.min.mjs' in url or document['url'] in url for url in requests)
            page.locator('.study-pdf-open').click()
            viewer = page.frame_locator('#study-pdf-frame')
            first = viewer.locator('.pdf-page[data-page="1"]')
            first.locator('canvas').wait_for(timeout=30000)
            viewer.locator('.pdf-page[data-page="1"][data-rendered="true"]').wait_for(timeout=30000)
            assert viewer.locator('body').get_attribute('data-page-count') == str(document['pages'])
            assert viewer.locator('button, input, select').count() == 0
            assert not any(frame.url.startswith('chrome-extension:') for frame in page.frames)
            text = first.locator('.textLayer').inner_text()
            assert len(text) > 20 and any('\uac00' <= char <= '\ud7a3' for char in text)
            colors = first.locator('canvas').evaluate('''canvas => {
                const ctx = canvas.getContext('2d');
                const colors = new Set();
                for (let y=0; y<canvas.height; y+=30) {
                    for (let x=0; x<canvas.width; x+=30) {
                        colors.add(Array.from(ctx.getImageData(x,y,1,1).data).join(','));
                    }
                }
                return colors.size;
            }''')
            assert colors > 20, 'The PDF page was not visibly rendered.'
            print('PASS: document-only view renders real PDF content with selectable Korean text')
            for number in range(1, document['pages'] + 1):
                target = viewer.locator(f'.pdf-page[data-page="{number}"]')
                target.scroll_into_view_if_needed()
                viewer.locator(f'.pdf-page[data-page="{number}"][data-rendered="true"]').wait_for(timeout=30000)
            assert viewer.locator('[data-render-error]').count() == 0
            assert viewer.locator('canvas').count() <= 7
            first.scroll_into_view_if_needed()
            viewer.locator('.pdf-page[data-page="1"][data-rendered="true"]').wait_for(timeout=30000)
            print(f'PASS: all {document["pages"]} pages render; cache releases distant pages and restores them on return')
            assert page.locator('#study-pdf-external').get_attribute('href') == document['url']
            response = page.request.get(base + document['url'])
            assert response.status == 200 and response.body() == (BASE / document['url']).read_bytes()
            with page.expect_popup() as popup:
                page.locator('#study-pdf-external').click()
            popup.value.wait_for_load_state('domcontentloaded')
            assert popup.value.url == base + document['url']
            popup.value.close()
            for width in [1440, 900, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 900})
                first.scroll_into_view_if_needed()
                page.wait_for_timeout(250)
                assert viewer.locator('body').evaluate('() => document.documentElement.scrollWidth <= innerWidth')
                assert first.locator('canvas').is_visible()
            page.locator('.study-pdf-close').click()
            page.wait_for_function('document.querySelector("#study-pdf-frame").getAttribute("src") === null')
            assert page.locator('#study-pdf-frame').get_attribute('src') is None
            assert page.locator('#study-pdf-dialog').evaluate('(dialog) => !dialog.open')
            page.locator('.study-pdf-open').click()
            viewer.locator('.pdf-page[data-page="1"][data-rendered="true"]').wait_for(timeout=30000)
            page.locator('.study-pdf-close').focus()
            page.keyboard.press('Escape')
            assert page.locator('#study-pdf-dialog').evaluate('(dialog) => !dialog.open')
            assert not errors, errors
            print('PASS: original-PDF new tab, responsive layout, close, reopen and Escape')
            invalid = browser.new_page()
            network = []
            invalid.on('request', lambda request: network.append(request.url))
            invalid.goto(base + 'pdf-viewer.html?file=' + quote('https://example.invalid/document.pdf', safe=''))
            invalid.wait_for_function('document.querySelector("#viewer-status").textContent.includes("could not be loaded")')
            assert not any(url.startswith('https://example.invalid/') for url in network)
            print('PASS: preview rejects external document paths')
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


if __name__ == '__main__':
    check()
