"""Check shared navigation, responsive layouts and graph explanation colors.

Requires Playwright and Chromium, as does check_pdf_viewer.py.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import shutil
import threading

from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]
PAGES = [
    ('index.html', '.home-focus-card'),
    ('about.html', '.education-card'),
    ('research.html', '.work-card'),
    ('publications.html', '.pub-item'),
    ('news.html', '.news-clickable'),
    ('cv.html', '.cv-section'),
    ('study.html?id=drone-graphrag', '.study-pdf-row'),
    ('award.html?id=ksee-2025-best-presentation', '.award-certificate'),
    ('post.html', '#post-head h2'),
    ('demos/graphrag/index.html', '#presentTitle'),
    ('demos/rag-comparison/index.html', '#svgV'),
]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass


def check():
    browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
    if not browser_path:
        raise RuntimeError('Chromium is required; set CHROMIUM_PATH if it is not on PATH.')
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(BASE)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=browser_path, args=['--no-sandbox'])
            errors = []
            for path, ready in PAGES:
                page = browser.new_page(viewport={'width': 1440, 'height': 1000})
                page.on('pageerror', lambda error, path=path: errors.append((path, str(error))))
                page.goto(origin + path, wait_until='domcontentloaded')
                page.wait_for_selector(ready)
                assert page.locator('.unified-header').count() == 1, path
                assert page.locator('.unified-nav>a').count() == 6, path
                assert page.locator('.unified-demo-links a').count() == 2, path
                assert page.locator('.unified-nav a[aria-current="page"]').count() == 1, path
                for width in (1440, 1024, 980, 740, 390, 320):
                    page.set_viewport_size({'width': width, 'height': 1000})
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (path, width)
                page.set_viewport_size({'width': 390, 'height': 844})
                toggle = page.locator('.unified-menu-toggle')
                toggle.click()
                assert toggle.get_attribute('aria-expanded') == 'true', path
                page.locator('.unified-demos summary').click()
                assert page.locator('.unified-demo-links').is_visible(), path
                page.keyboard.press('Escape')
                assert page.locator('.unified-demos').get_attribute('open') is None, path
                page.keyboard.press('Escape')
                assert toggle.get_attribute('aria-expanded') == 'false', path
                toggle.click()
                page.locator('.unified-demos summary').click()
                page.set_viewport_size({'width': 1440, 'height': 1000})
                page.wait_for_function('!document.querySelector(".unified-demos").open')
                if path == 'cv.html':
                    page.evaluate('window.__printed=false; window.print=()=>window.__printed=true')
                    page.locator('#print-cv').click()
                    assert page.evaluate('window.__printed')
                    page.emulate_media(media='print')
                    assert not page.locator('.unified-header').is_visible()
                    assert not page.locator('.inner-actions').is_visible()
                if path.startswith('study.html'):
                    assert page.locator('.study-pdf-row').count() == 3
                page.close()
            print('PASS: all portfolio and demo pages fit six screen widths; shared menus, Escape, resize and CV print work')

            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            page.on('pageerror', lambda error: errors.append(('graph', str(error))))
            page.goto(origin + 'demos/graphrag/index.html', wait_until='domcontentloaded')
            page.wait_for_function('!!window.__v5test')
            assert page.locator('#speed').input_value() == '320'
            assert page.locator('#runAll').get_attribute('aria-pressed') == 'true'
            page.locator('#runAll').click()
            page.evaluate('window.__v5test.advance(30)')
            assert page.locator('.g-node.new .node-core').count() > 0
            assert page.locator('.g-node.new .node-core').evaluate_all('nodes=>nodes.every(n=>n.getAttribute("fill")==="#7054a2")')
            accents = page.evaluate('''() => {
                const style = selector => getComputedStyle(document.querySelector(selector));
                return [style('.present-steps .is-here').color, style('.present-number').color,
                    style('#runAll').backgroundColor, style('[data-graph-legend=evidence] .dot').backgroundColor,
                    style('.evidence-halo').stroke, style('#scrub').accentColor,
                    style('.node-label.focused-label').fill, style('.tlhead strong').color,
                    style('.phase-chip.current').color];
            }''')
            assert len(set(accents)) == 1, accents
            page.locator('#detailedMode').click()
            assert page.locator('#detailedMode').get_attribute('aria-pressed') == 'true'
            page.locator('#presentationMode').click()
            page.evaluate('window.__v5test.setMode("leiden"); window.__v5test.advance(window.__v5test.state().max)')
            assert page.locator('.phase-chip.current').evaluate('e=>getComputedStyle(e).color') == 'rgb(112, 84, 162)'
            assert page.locator('.phase-chip.current').evaluate('e=>getComputedStyle(e,"::before").backgroundColor') == 'rgb(112, 84, 162)'
            assert page.locator('[data-graph-legend=node] span').inner_text() == 'Community membership'
            assert not page.locator('[data-graph-legend=evidence]').is_visible()
            assert page.evaluate('''() => {
                const background = document.querySelector('[data-graph-legend=node] .dot').style.background;
                return [...document.querySelectorAll('.node-core')].every(node => {
                    const sample = document.createElement('span');
                    sample.style.color = node.getAttribute('fill');
                    return background.includes(sample.style.color);
                });
            }''')
            page.close()
            print('PASS: graph evidence, explanation, controls and legend colors agree; community swatch follows rendered node colors')

            page = browser.new_page(color_scheme='dark')
            page.on('pageerror', lambda error: errors.append(('comparison', str(error))))
            page.goto(origin + 'demos/rag-comparison/index.html', wait_until='domcontentloaded')
            page.wait_for_function('!!window.__demo')
            assert page.locator('.panel').first.evaluate('e=>getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)'
            page.locator('.unified-demos summary').focus()
            page.keyboard.press('Space')
            assert page.locator('.unified-demos').get_attribute('open') is not None
            assert page.locator('#btnPlay').get_attribute('aria-label') == '일시정지'
            page.keyboard.press('Escape')
            page.locator('#tab1').click()
            assert page.locator('#tab1').get_attribute('aria-selected') == 'true'
            page.locator('#btnPlay').click()
            assert page.locator('#btnPlay').get_attribute('aria-label') == '재생'
            page.close()
            assert not errors, errors
            browser.close()
            print('PASS: comparison playback and scenarios work; keyboard menu does not intercept playback; light theme is consistent')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    check()
