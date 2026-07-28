# Validation Report

## Completed checks

- Required root structure present.
- Exactly 10 JavaScript files present in `js/`.
- All browser JavaScript files passed `node --check` syntax validation.
- `service-worker.js` passed syntax validation.
- `backend/Code.gs` passed JavaScript parser validation after temporary `.js` copying.
- Every JavaScript-referenced HTML element ID exists in `superbot.html`.
- Every stylesheet and script referenced by `superbot.html` exists.
- Every service-worker cache path exists.
- No API key or populated project token was included.
- ZIP integrity passed `unzip -t`.
- Compressed ZIP size exceeds the requested 10,000 KB threshold.

## Core runtime test results

12 of 12 tests passed:

1. Corpus record count is 16,264.
2. Calculator operator precedence.
3. Calculator function handling.
4. JSON validation and formatting.
5. Text statistics.
6. SHA-256 known-value test.
7. Local memory save and retrieval.
8. Reusable skill save.
9. Corpus retrieval.
10. Offline response is explicitly labeled as retrieval, not a model substitute.
11. Backend request timestamp uses Unix seconds.
12. Backend configuration gate recognizes repository/token settings.

## Tests not completed in this build environment

- Live Apps Script health/chat calls: the isolated build container could not resolve `script.google.com` through DNS.
- Full visual browser smoke test: the installed headless Chromium process did not complete even for a minimal local HTML test in this container, so browser behavior was validated by static reference checks and core runtime execution instead.
- Apps Script editor execution: `runSuperbotSelfTests()` must be run inside the deployed Apps Script project.
- Provider-backed image and 3D jobs: these require valid backend provider credentials and configuration.


## GitHub Corpus Split Validation

- Original corpus records preserved: **16,264**
- Part 1 records: **5,506**
- Part 2 records: **5,612**
- Part 3 records: **5,146**
- All three parts load sequentially into the original global corpus array.
- HTML and service-worker references were updated to the three-part load order.
- Every corpus part is below 23,000 KB.
