/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  const ROOT = 'assets/tokens/';
  const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];
  let manifest = [];
  let catalog = [];

  const slug = (value) => String(value || 'unknown')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';

  function safe(value) {
    const path = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
    if (!path.startsWith(ROOT) || path.includes('..') || /[\u0000-\u001f]/.test(path)) return null;
    return path;
  }

  function pathsFromManifest(value) {
    const values = Array.isArray(value) ? value : (value?.tokens || value?.assets || value?.files || []);
    return values
      .map((entry) => typeof entry === 'string' ? entry : (entry?.path || entry?.src || entry?.url))
      .map(safe)
      .filter(Boolean);
  }

  function setManifest(...values) {
    manifest = [...new Set(values.flatMap(pathsFromManifest))];
    return manifest.slice();
  }

  function addManifest(value) {
    manifest = [...new Set([...manifest, ...pathsFromManifest(value)])];
    return manifest.slice();
  }

  function setCatalog(value) {
    catalog = Array.isArray(value) ? value : (value?.entries || []);
    return catalog.slice();
  }

  function fileSlug(path) {
    const file = String(path).split('/').pop() || '';
    return slug(file.replace(/\.[^.]+$/, ''));
  }

  function manifestMatches(monster) {
    const keys = new Set([
      slug(monster?.tokenKey || monster?.name),
      slug(monster?.name),
      ...(monster?.aliases || []).map(slug)
    ]);
    return manifest.filter((path) => {
      const base = fileSlug(path);
      return [...keys].some((key) => base === key || base.startsWith(`${key}-`) || key.startsWith(`${base}-`));
    });
  }

  function catalogCandidates(monster) {
    const key = slug(monster?.tokenKey || monster?.name);
    const name = slug(monster?.name);
    const entry = catalog.find((item) => item.slug === key || item.slug === name || slug(item.name) === name);
    return (entry?.runtimeCandidates || []).map(safe).filter(Boolean);
  }

  function generatedCandidates(monster) {
    const key = slug(monster?.tokenKey || monster?.name);
    const displayName = String(monster?.name || '').trim();
    const type = slug(monster?.type);
    const folders = ['', 'hostiles/', 'creatures/', displayName ? `${displayName}/` : ''];
    const candidates = [];
    for (const folder of folders) {
      for (const extension of IMAGE_EXTENSIONS) candidates.push(`${ROOT}${folder}${key}.${extension}`);
    }
    candidates.push(`${ROOT}placeholders/hostiles/${type}.png`);
    candidates.push(`${ROOT}placeholders/hostiles/default-hostile.png`);
    return candidates.map(safe).filter(Boolean);
  }

  function candidates(monster) {
    const provided = Array.isArray(monster?.tokenCandidates) ? monster.tokenCandidates : [];
    return [...new Set([
      ...manifestMatches(monster),
      ...provided,
      ...catalogCandidates(monster),
      ...generatedCandidates(monster)
    ].map(safe).filter(Boolean))];
  }

  function preferred(monster) {
    const exact = manifestMatches(monster)[0];
    if (exact) return exact;
    const typeFallback = safe(`${ROOT}placeholders/hostiles/${slug(monster?.type)}.png`);
    if (typeFallback && manifest.includes(typeFallback)) return typeFallback;
    const defaultFallback = `${ROOT}placeholders/hostiles/default-hostile.png`;
    return manifest.includes(defaultFallback) ? defaultFallback : (candidates(monster)[0] || null);
  }

  function deityCandidates(deity) {
    const key = slug(deity?.id || deity?.name);
    const generated = IMAGE_EXTENSIONS.map((extension) => `${ROOT}deities/${key}.${extension}`);
    return [...new Set([
      ...manifest.filter((path) => path.startsWith(`${ROOT}deities/`) && fileSlug(path) === key),
      ...generated
    ].map(safe).filter(Boolean))];
  }

  function bindImage(image, monster) {
    const list = candidates(monster);
    let index = 0;
    const next = () => {
      if (index < list.length) {
        image.src = list[index++];
      } else {
        image.onerror = null;
        image.dataset.tokenMissing = 'true';
      }
    };
    image.onerror = next;
    next();
    return image;
  }

  function resolve(monster, probe) {
    const list = candidates(monster);
    if (typeof probe !== 'function') return Promise.resolve(preferred(monster));
    return list.reduce(
      (promise, path) => promise.then((found) => found || Promise.resolve(probe(path)).then((ok) => ok ? path : null)),
      Promise.resolve(null)
    );
  }

  global.RandomEncounterTokens = {
    ROOT,
    slug,
    safe,
    setManifest,
    addManifest,
    setCatalog,
    candidates,
    preferred,
    deityCandidates,
    bindImage,
    resolve
  };
}(window));
