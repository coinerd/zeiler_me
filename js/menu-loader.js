const MENU_JSON_URL = '/out/menu.json';
const CONTENT_BASE_PATH = '/out/www.zeiler.me';

const fileExistenceCache = new Map();

function normalizeRelPath(relPath) {
  return relPath.replace(/\\/g, '/');
}

function buildContentUrl(relPath) {
  const normalized = normalizeRelPath(relPath).replace(/^\/+/, '');
  const prefix = CONTENT_BASE_PATH.endsWith('/') ? CONTENT_BASE_PATH.slice(0, -1) : CONTENT_BASE_PATH;
  return `${prefix}/${normalized}`;
}

function isMarkdownLikeResponse(res, requestedUrl) {
  const type = (res.headers.get('content-type') || '').toLowerCase();
  const markdownLike = /markdown|plain|text\/x-markdown|application\/octet-stream/.test(type);

  if (!markdownLike) {
    return false;
  }

  try {
    const expected = new URL(requestedUrl, window.location.origin);
    const actual = new URL(res.url, window.location.origin);
    if (actual.pathname !== expected.pathname) {
      return false;
    }
  } catch {
    /* ignore URL comparison errors */
  }

  return true;
}

async function fetchExists(url, method) {
  try {
    const res = await fetch(url, { method, cache: 'no-store' });

    if (res.status === 405 || res.status === 501) {
      return { unsupported: true, exists: false };
    }

    if (!res.ok) {
      return { unsupported: false, exists: false };
    }

    const exists = isMarkdownLikeResponse(res, url);

    if (method === 'GET' && res.body && typeof res.body.cancel === 'function') {
      try { await res.body.cancel(); } catch { /* ignore */ }
    }

    return { unsupported: false, exists };
  } catch {
    return { unsupported: false, exists: false };
  }
}

async function checkFileExists(relPath) {
  if (!relPath) return false;
  const normalized = normalizeRelPath(relPath);
  if (fileExistenceCache.has(normalized)) {
    return fileExistenceCache.get(normalized);
  }

  const lookup = (async () => {
    const url = buildContentUrl(normalized);
    let result = await fetchExists(url, 'HEAD');
    if (result.unsupported || !result.exists) {
      const fallbackResult = await fetchExists(url, 'GET');
      if (!fallbackResult.unsupported) {
        result = fallbackResult;
      }
    }
    return Boolean(result.exists);
  })();

  fileExistenceCache.set(normalized, lookup);
  return lookup;
}

async function cleanseMenuTree(node, isRoot = false) {
  if (!node || node.type !== 'dir') return null;

  const nextIndex = node.index && node.index.rel ? (await checkFileExists(node.index.rel) ? { ...node.index } : null) : node.index || null;

  const fileEntries = Array.isArray(node.files) ? node.files : [];
  const fileResults = await Promise.all(
    fileEntries.map(async file => ({
      file,
      exists: file.rel ? await checkFileExists(file.rel) : true,
    }))
  );

  const filteredFiles = fileResults.filter(entry => entry.exists).map(entry => ({ ...entry.file }));

  const dirEntries = Array.isArray(node.dirs) ? node.dirs : [];
  const filteredDirs = [];
  for (const dir of dirEntries) {
    const cleaned = await cleanseMenuTree(dir, false);
    if (cleaned) filteredDirs.push(cleaned);
  }

  if (!isRoot && !nextIndex && filteredFiles.length === 0 && filteredDirs.length === 0) {
    return null;
  }

  return {
    ...node,
    index: nextIndex,
    files: filteredFiles,
    dirs: filteredDirs,
  };
}

function formatDisplayTitle(title, fallback) {
  if (!title) return fallback;
  const parts = title.split(' - ');
  let candidate = parts[parts.length - 1].trim();
  if (!candidate) candidate = title.trim();
  if (!candidate) return fallback;
  return candidate;
}

function createElement(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    el.setAttribute(key, value);
  }
  return el;
}

function createLinkItem(node, label) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = node.route;
  a.textContent = label || formatDisplayTitle(node.title, node.name || 'Link');
  li.appendChild(a);
  return li;
}

function countEntries(dirNode) {
  const fileCount = (dirNode.files || []).filter(f => f.name !== 'index').length;
  const dirCount = (dirNode.dirs || []).length;
  return fileCount + dirCount + (dirNode.index ? 1 : 0);
}

function createListForDir(dirNode, depth = 0, options = {}) {
  const { includeNested = true } = options;
  const ul = document.createElement('ul');
  ul.classList.add('link-list');

  if (dirNode.index) {
    ul.appendChild(createLinkItem(dirNode.index, 'Übersicht'));
  }

  if (dirNode.files) {
    dirNode.files
      .filter(file => file.name !== 'index')
      .forEach(fileNode => {
        ul.appendChild(createLinkItem(fileNode));
      });
  }

  if (dirNode.dirs) {
    dirNode.dirs.forEach(childDir => {
      const li = document.createElement('li');
      const titleLink = document.createElement('a');
      titleLink.href = childDir.route;
      titleLink.textContent = formatDisplayTitle(childDir.title, childDir.name || 'Sektion');
      li.appendChild(titleLink);

      if (
        includeNested &&
        (
          (childDir.files && childDir.files.length) ||
          (childDir.dirs && childDir.dirs.length) ||
          childDir.index
        )
      ) {
        const nested = createListForDir(childDir, depth + 1, options);
        nested.classList.add('nested-list');
        if (depth >= 1) {
          nested.classList.add('nested-list--inner');
        }
        li.appendChild(nested);
      }

      ul.appendChild(li);
    });
  }

  if (depth === 0 && countEntries(dirNode) > 12) {
    ul.classList.add('link-list--columns');
  }

  return ul;
}

function buildSidebarSubmenu(category) {
  const list = document.createElement('ul');
  list.className = 'sidebar-submenu-list link-list';

  if (category.overview) {
    list.appendChild(createLinkItem(category.overview, 'Übersicht'));
  }

  if (category.dir) {
    const directFiles = (category.dir.files || []).filter(file => file.name !== 'index');
    directFiles.forEach(fileNode => {
      list.appendChild(createLinkItem(fileNode));
    });

    (category.dir.dirs || []).forEach(subdir => {
      const li = document.createElement('li');
      const button = createElement('button', 'sidebar-link sidebar-link--tertiary', {
        type: 'button',
        'data-subtoggle': subdir.route,
        'aria-expanded': 'false',
      });
      button.textContent = formatDisplayTitle(subdir.title, subdir.name || 'Bereich');
      li.appendChild(button);

      if (countEntries(subdir) > 0) {
        const nested = createListForDir(subdir);
        nested.classList.add('sidebar-submenu-nested');
        nested.classList.remove('link-list--columns');
        nested.classList.remove('link-list');
        nested.setAttribute('data-parent-route', subdir.route);
        li.appendChild(nested);
      }

      list.appendChild(li);
    });
  }

  if (!list.children.length) {
    return null;
  }

  return list;
}

function mergeCategories(dirNode, overviewMap) {
  const categories = new Map();

  if (dirNode.files) {
    dirNode.files.forEach(file => {
      const key = file.name;
      categories.set(key, {
        title: formatDisplayTitle(file.title, file.name),
        overview: file,
        dir: null,
      });
    });
  }

  if (dirNode.dirs) {
    dirNode.dirs.forEach(subDir => {
      const key = subDir.slug || subDir.name || subDir.route;
      const existing = categories.get(key) || {
        title: formatDisplayTitle(subDir.title, subDir.name),
        overview: null,
        dir: null,
      };
      if (!existing.title) {
        existing.title = formatDisplayTitle(subDir.title, subDir.name);
      }
      existing.dir = subDir;
      categories.set(key, existing);
    });
  }

  if (dirNode.name && overviewMap.has(dirNode.name)) {
    const overview = overviewMap.get(dirNode.name);
    const key = dirNode.name;
    const existing = categories.get(key) || {
      title: formatDisplayTitle(overview.title, overview.name),
      overview: null,
      dir: dirNode,
    };
    if (!existing.title) {
      existing.title = formatDisplayTitle(overview.title, overview.name);
    }
    existing.overview = overview;
    categories.set(key, existing);
    overviewMap.delete(dirNode.name);
  }

  return Array.from(categories.entries()).map(([key, value]) => ({
    id: key,
    ...value,
  })).sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

async function loadMenu() {
  const response = await fetch(MENU_JSON_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch menu data (${response.status})`);
  return response.json();
}

function buildMegaMenu(tree) {
  const nav = document.querySelector('.main-nav');
  const navTop = document.querySelector('.main-nav .nav-top');
  if (!nav || !navTop) return;

  const panelsRoot = document.createDocumentFragment();

  navTop.innerHTML = '';

  const startLi = document.createElement('li');
  const startLink = createElement('a', 'top-link', {
    href: '/',
    role: 'menuitem',
    'aria-label': 'Zur Startseite wechseln',
  });
  startLink.textContent = 'Startseite';
  startLi.appendChild(startLink);
  navTop.appendChild(startLi);

  const overviewMap = new Map();
  if (Array.isArray(tree.files)) {
    tree.files.forEach(file => {
      overviewMap.set(file.name, file);
    });
  }

  const topDirectories = Array.isArray(tree.dirs) ? tree.dirs.slice() : [];

  topDirectories.forEach((dirNode, index) => {
    const panelId = `panel-${dirNode.slug || dirNode.name || index}`;

    const li = document.createElement('li');
    li.classList.add('top-has-panel');
    const button = createElement('button', 'top-link', {
      role: 'menuitem',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'data-panel': panelId,
      'aria-label': `${formatDisplayTitle(dirNode.title, dirNode.name)} Menü öffnen`,
    });
    button.innerHTML = `${formatDisplayTitle(dirNode.title, dirNode.name)} <i aria-hidden="true" class="fas fa-chevron-down"></i>`;
    li.appendChild(button);
    navTop.appendChild(li);

    const megaPanel = createElement('div', 'mega-panel', {
      id: panelId,
      role: 'region',
      'aria-hidden': 'true',
      'aria-label': `${formatDisplayTitle(dirNode.title, dirNode.name)} Menübereich`,
    });

    const panelContainer = createElement('div', 'panel-container');
    const sidebar = createElement('div', 'panel-sidebar', { role: 'presentation' });
    const sidebarHeading = document.createElement('h3');
    sidebarHeading.textContent = 'Kategorien';
    sidebar.appendChild(sidebarHeading);

    const sidebarList = createElement('ul', 'sidebar-nav', { role: 'menu' });

    const categories = mergeCategories(dirNode, overviewMap);

    categories.forEach((category, catIndex) => {
      const contentId = `${panelId}-${category.id}`;
      const sidebarItem = document.createElement('li');

      const buttonAttrs = {
        role: 'menuitem',
        'data-content': contentId,
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
      };

      const sidebarButton = createElement('button', 'sidebar-link', buttonAttrs);
      sidebarButton.textContent = category.title;

      sidebarItem.appendChild(sidebarButton);
      sidebarList.appendChild(sidebarItem);

      const submenuContent = buildSidebarSubmenu(category);
      if (submenuContent) {
        const submenuWrapper = createElement('div', 'sidebar-submenu', {
          'data-content': contentId,
        });
        submenuWrapper.appendChild(submenuContent);
        sidebarItem.appendChild(submenuWrapper);
      }

      if (catIndex === 0) {
        sidebarButton.classList.add('active');
        sidebarButton.setAttribute('aria-expanded', 'true');
        const submenu = sidebarItem.querySelector('.sidebar-submenu');
        if (submenu) submenu.classList.add('active');
      }
    });

    if (categories.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'Keine Inhalte verfügbar';
      sidebarList.appendChild(emptyItem);
    }

    sidebar.appendChild(sidebarList);
    panelContainer.appendChild(sidebar);
    megaPanel.appendChild(panelContainer);
    panelsRoot.appendChild(megaPanel);
  });

  // Append panels after nav container
  nav.querySelectorAll('.mega-panel').forEach(panel => panel.remove());
  nav.appendChild(panelsRoot);

  // Add remaining top-level files as simple links (if any)
  const remainingTopLinks = [];
  overviewMap.forEach(file => remainingTopLinks.push(file));
  remainingTopLinks.sort((a, b) => a.title.localeCompare(b.title, 'de'));
  remainingTopLinks.forEach(file => {
    const li = document.createElement('li');
    const link = createElement('a', 'top-link', {
      href: file.route,
      role: 'menuitem',
      'aria-label': formatDisplayTitle(file.title, file.name),
    });
    link.textContent = formatDisplayTitle(file.title, file.name);
    li.appendChild(link);
    navTop.appendChild(li);
  });
}

const menuTree = await loadMenu();
const sanitizedTree = await cleanseMenuTree(menuTree, true);

if (sanitizedTree) {
  buildMegaMenu(sanitizedTree);
  document.dispatchEvent(new CustomEvent('menu:ready'));
} else {
  console.warn('Menu data could not be built because no valid content was found.');
}
