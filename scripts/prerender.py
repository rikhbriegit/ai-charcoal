#!/usr/bin/env python
"""
Prerender the SPA to static HTML for SEO / social crawlers.

Renders the production page in headless Chromium (so all React/framer-motion
content is materialised into the HTML), then writes it over dist/index.html.
Crawlers that don't run JS (Facebook/WhatsApp/Bing) now see full content +
meta tags; real users still get the SPA (React hydrates on load).

Run AFTER `npm run build` and while the production server is up:
    NODE_ENV=production node dist/server.cjs   # (in another shell)
    python scripts/prerender.py
"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3001"
# (url-suffix, output-file). One localized static page per language.
# English is primary → dist/index.html (site root / x-default). Every other
# Middle-East language gets its own path: /ar/ (Gulf), /fa/ (Iran), /tr/ (Turkey),
# /id/ (local). The SPA reads ?lang= to pick the language while rendering; the
# server then serves each file at its matching /<lang>/ path (see server.ts).
TARGETS = [
    ("/?lang=en", "dist/index.html"),
    ("/?lang=ar", "dist/ar/index.html"),
    ("/?lang=fa", "dist/fa/index.html"),
    ("/?lang=tr", "dist/tr/index.html"),
    ("/?lang=id", "dist/id/index.html"),
]


def render(page, url):
    # Fresh storage each target so a previous language never leaks into the next.
    try:
        page.goto(BASE + "/", wait_until="domcontentloaded", timeout=45000)
        page.evaluate("try { localStorage.clear() } catch (e) {}")
    except Exception:
        pass
    page.goto(BASE + url, wait_until="networkidle", timeout=45000)
    page.wait_for_timeout(1200)
    # Scroll through the page so `whileInView` sections reveal (opacity 0 -> 1).
    height = page.evaluate("document.body.scrollHeight")
    y = 0
    while y < height:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(220)
        y += 700
        height = page.evaluate("document.body.scrollHeight")
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    return page.content()


def main():
    import os
    ok = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1366, "height": 900})
        for url, out in TARGETS:
            try:
                html = render(page, url)
            except Exception as e:
                print(f"  ! {url}: {repr(e)[:160]}", file=sys.stderr)
                continue
            if '<div id="root"></div>' in html or len(html) < 5000:
                print(f"  ! {url}: root empty / html too small — skipped", file=sys.stderr)
                continue
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  OK {url} -> {out}  ({len(html)//1024} KB)")
            ok += 1
        browser.close()
    if ok == 0:
        print("PRERENDER FAILED: nothing written", file=sys.stderr)
        sys.exit(1)
    print(f"Prerendered {ok}/{len(TARGETS)} pages.")


if __name__ == "__main__":
    main()
