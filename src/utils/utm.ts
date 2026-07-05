// First-touch UTM capture (SPEC §4). Records the FIRST visit's campaign params +
// referrer in a 90-day cookie, so a lead submitted later still carries the original
// acquisition source (first-touch, not last-touch). Runs on the public marketing site.
const KEY = "ft_utm";
const MAX_AGE = 90 * 24 * 60 * 60; // 90 days

function readCookie(name: string): string {
  try {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
}

/** Capture once, on first visit only — never overwrites an existing first-touch. */
export function captureFirstTouchUtm(): void {
  try {
    if (readCookie(KEY)) return; // already have a first touch
    const p = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((k) => {
      const v = p.get(k);
      if (v) data[k] = v.slice(0, 200);
    });
    data.ref = (document.referrer || "").slice(0, 300);
    data.landing = window.location.pathname.slice(0, 200);
    data.ts = new Date().toISOString();
    const value = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${KEY}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  } catch {
    /* cookies disabled — no-op */
  }
}

/** The captured first-touch payload as a JSON string (empty if none). */
export function getFirstTouchUtm(): string {
  return readCookie(KEY);
}
