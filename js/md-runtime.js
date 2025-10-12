const BASE_CONTENT_DIR = '/out/www.zeiler.me';
const CONTENT_ROOT_ID = 'content-root';
const BREADCRUMB_CONTAINER_SELECTOR = '.breadcrumbs-list';

function isRelativePath(value) {
  return value && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(value.trim());
}

function resolveContentPath(baseDir, relativePath) {
  try {
    const base = baseDir.endsWith('/') ? baseDir : `${baseDir}/`;
    const resolved = new URL(relativePath, `http://local${base}`).pathname;
    return resolved;
  } catch {
    return relativePath;
  }
}

function convertContentPathToRoute(pathname) {
  if (!pathname.startsWith(BASE_CONTENT_DIR)) return null;
  let route = pathname.slice(BASE_CONTENT_DIR.length);
  if (!route) return '/';
  route = route.replace(/\.md$/i, '');
  if (!route.startsWith('/')) route = `/${route}`;
  return route || '/';
}

function adjustContentAssets(root, mdPath) {
  const lastSlash = mdPath.lastIndexOf('/');
  const baseDir = lastSlash === -1 ? '/' : mdPath.slice(0, lastSlash + 1);

  root.querySelectorAll('img[src], source[src], video[src], audio[src], track[src]').forEach(el => {
    const src = el.getAttribute('src');
    if (!src || !isRelativePath(src)) return;
    const resolved = resolveContentPath(baseDir, src);
    el.setAttribute('src', resolved);
  });

  root.querySelectorAll('[poster]').forEach(el => {
    const poster = el.getAttribute('poster');
    if (!poster || !isRelativePath(poster)) return;
    const resolved = resolveContentPath(baseDir, poster);
    el.setAttribute('poster', resolved);
  });

  root.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !isRelativePath(href)) return;
    const resolved = resolveContentPath(baseDir, href);
    const route = convertContentPathToRoute(resolved);
    if (route) {
      link.setAttribute('href', route);
    } else {
      link.setAttribute('href', resolved);
    }
  });
}

function mapUrlToMdPath(pathname) {
  let clean = pathname.replace(/\/+$/, '');
  if (clean === '' || clean === '/') return `${BASE_CONTENT_DIR}/index.md`;
  return `${BASE_CONTENT_DIR}${clean}.md`;
}

function formatBreadcrumbLabel(segment) {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase()) || segment || 'Unbenannt';
}

function renderBreadcrumbs(pathname, pageTitle) {
  const list = document.querySelector(BREADCRUMB_CONTAINER_SELECTOR);
  if (!list) return;

  const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/?$/, '');
  const segments = cleanPath.replace(/^\//, '').split('/').filter(Boolean);

  const crumbs = [];
  crumbs.push({ label: 'Startseite', href: '/', isLast: segments.length === 0 });

  let accumulated = '';
  segments.forEach((segment, index) => {
    accumulated += `/${segment}`;
    const isLast = index === segments.length - 1;
    crumbs.push({
      label: isLast && pageTitle ? pageTitle : formatBreadcrumbLabel(segment),
      href: isLast ? null : accumulated,
      isLast,
      segment,
    });
  });

  list.innerHTML = '';

  crumbs.forEach(crumb => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';

    if (crumb.href && !crumb.isLast) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.label;
      a.dataset.breadcrumbLink = 'true';
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = crumb.label;
      if (crumb.isLast) {
        span.setAttribute('aria-current', 'page');
        span.dataset.breadcrumbCurrent = 'true';
      }
      li.appendChild(span);
    }

    list.appendChild(li);
  });
}

function updateBreadcrumbCurrentLabel(label) {
  if (!label) return;
  const current = document.querySelector(`${BREADCRUMB_CONTAINER_SELECTOR} [data-breadcrumb-current]`);
  if (current) {
    current.textContent = label;
  }
}

function ensureLibraries() {
  if (window.marked && window.DOMPurify) return Promise.resolve(true);
  return new Promise(resolve => {
    const maxAttempts = 100;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.marked && window.DOMPurify) {
        clearInterval(timer);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        console.error('Markdown libraries failed to load.');
        resolve(false);
      }
    }, 25);
  });
}

async function loadAndRender(pathname) {
  const libsReady = await ensureLibraries();
  const mdPath = mapUrlToMdPath(pathname);
  const root = document.getElementById(CONTENT_ROOT_ID);
  if (!root) return;

  if (!libsReady || !(window.marked && window.DOMPurify)) {
    root.innerHTML = '<p>Der Inhalt konnte nicht geladen werden, da erforderliche Skripte fehlen.</p>';
    return;
  }

  try {
    root.innerHTML = '<p>Lade Inhalte …</p>';
    const res = await fetch(mdPath, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();

    const html = window.marked.parse(md, { mangle: false, headerIds: true });
    const safe = window.DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    root.innerHTML = safe;

    adjustContentAssets(root, mdPath);

    const h1 = root.querySelector('h1');
    if (h1 && h1.textContent) {
      const titleText = h1.textContent.trim();
      document.title = `${titleText} | ZEILER.me`;
      updateBreadcrumbCurrentLabel(titleText);
    }

    root.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          a.removeAttribute('target');
          a.removeAttribute('rel');
        } else {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      } catch {
        /* ignore malformed URLs */
      }
    });
  } catch (err) {
    if (pathname !== '/404') {
      navigate('/404');
    } else {
      const fallback = '<h1>Not Found</h1><p>The requested page could not be loaded.</p>';
      root.innerHTML = fallback;
      updateBreadcrumbCurrentLabel('Not Found');
    }
  }
}

export function navigate(pathname) {
  if (pathname !== window.location.pathname) {
    history.pushState({}, '', pathname);
  }
  document.dispatchEvent(new CustomEvent('app:navigate', { detail: { pathname } }));
  renderBreadcrumbs(pathname);
  loadAndRender(pathname);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDocumentClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || anchor.hasAttribute('download')) return;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(url.pathname);
  } catch {
    /* ignore */
  }
}

window.addEventListener('popstate', () => {
  const currentPath = window.location.pathname;
  document.dispatchEvent(new CustomEvent('app:navigate', { detail: { pathname: currentPath } }));
  renderBreadcrumbs(currentPath);
  loadAndRender(currentPath);
});
document.addEventListener('click', handleDocumentClick);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    document.dispatchEvent(new CustomEvent('app:navigate', { detail: { pathname: currentPath } }));
    renderBreadcrumbs(currentPath);
    loadAndRender(currentPath);
  });
} else {
  const currentPath = window.location.pathname;
  document.dispatchEvent(new CustomEvent('app:navigate', { detail: { pathname: currentPath } }));
  renderBreadcrumbs(currentPath);
  loadAndRender(currentPath);
}
