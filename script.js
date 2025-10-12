// Mega Menu Navigation System
class MegaMenuNav {
  constructor() {
    this.topButtons = document.querySelectorAll('.top-link[data-panel]');
    this.panels = document.querySelectorAll('.mega-panel');
    this.sidebarButtons = document.querySelectorAll('.sidebar-link[data-content]');
    this.mobileToggle = document.querySelector('.mobile-menu-toggle');
    this.navTop = document.querySelector('.nav-top');
    this.nav = document.querySelector('.main-nav');
    this.navContainer = document.querySelector('.main-nav .nav-container');
    this.currentOpenPanel = null;
    this.handleResize = this.handleResize.bind(this);

    this.init();
  }

  init() {
    // Bind top navigation buttons
    this.topButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel(button);
      });
    });

    // Bind sidebar navigation buttons
    this.sidebarButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchContent(button);
      });
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.main-nav')) {
        this.closeAllPanels();
      }
    });

    // Close panel on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPanels();
      }
    });

    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    if (this.nav) {
      this.nav.addEventListener('click', (e) => {
        const toggle = e.target.closest('.sidebar-link--tertiary[data-subtoggle]');
        if (toggle) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleTertiary(toggle);
          return;
        }

        const anchor = e.target.closest('a[href]');
        if (anchor) {
          if (this.isDesktop() && this.currentOpenPanel) {
            this.prepareForNavigation();
          }
          this.closeAllPanels();
          this.collapseMobileMenu();
        }
      });
    }

    document.addEventListener('app:navigate', () => {
      if (this.isDesktop() && this.currentOpenPanel) {
        this.prepareForNavigation();
      }
      this.closeAllPanels();
      this.collapseMobileMenu();
    });

    // Respond to layout changes
    window.addEventListener('resize', this.handleResize);
  }

  togglePanel(button) {
    const panelId = button.getAttribute('data-panel');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const isOpen = panel.getAttribute('aria-hidden') === 'false';

    this.closeAllPanels();

    if (!isOpen) {
      this.openPanel(button, panel);
    } else {
      button.setAttribute('aria-expanded', 'false');
    }
  }

  openPanel(button, panel) {
    button.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    this.currentOpenPanel = panel;

    if (this.isDesktop()) {
      const applied = this.updateDesktopOffsets();
      if (applied) {
        document.body.classList.add('mega-menu-open');
      } else {
        document.body.classList.remove('mega-menu-open');
        this.resetDesktopOffsets();
      }
    } else {
      document.body.classList.remove('mega-menu-open');
      this.resetDesktopOffsets();
    }

    const firstSidebarButton = panel.querySelector('.sidebar-link[data-content]');
    if (firstSidebarButton && !panel.querySelector('.sidebar-link.active')) {
      firstSidebarButton.classList.add('active');
      const contentId = firstSidebarButton.getAttribute('data-content');
      const contentSection = document.getElementById(contentId);
      if (contentSection) {
        contentSection.classList.add('active');
      }
      firstSidebarButton.setAttribute('aria-expanded', 'true');
      const firstSubmenu = panel.querySelector(`.sidebar-submenu[data-content="${contentId}"]`);
      if (firstSubmenu) firstSubmenu.classList.add('active');
    }
  }

  closeAllPanels() {
    this.panels.forEach(panel => {
      panel.setAttribute('aria-hidden', 'true');
      panel.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.hasAttribute('aria-expanded')) {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    this.topButtons.forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.sidebar-submenu').forEach(sub => sub.classList.remove('active'));
    document.querySelectorAll('.sidebar-submenu-nested').forEach(list => {
      list.classList.remove('active');
      const parentToggle = list.previousElementSibling;
      if (parentToggle && parentToggle.classList.contains('sidebar-link--tertiary')) {
        parentToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.body.classList.remove('mega-menu-open');
    this.resetDesktopOffsets();
    this.currentOpenPanel = null;
  }

  collapseMobileMenu() {
    if (!this.navTop || !this.mobileToggle) return;
    if (this.navTop.classList.contains('active')) {
      this.navTop.classList.remove('active');
      const icon = this.mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  }

  switchContent(button) {
    const contentId = button.getAttribute('data-content');
    const panel = button.closest('.mega-panel');
    if (!panel || !contentId) return;

    panel.querySelectorAll('.sidebar-link').forEach(btn => {
      btn.classList.remove('active');
      if (btn.hasAttribute('aria-expanded')) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    button.classList.add('active');
    if (button.hasAttribute('aria-expanded')) {
      button.setAttribute('aria-expanded', 'true');
    }

    panel.querySelectorAll('.sidebar-submenu').forEach(sub => sub.classList.remove('active'));
    const targetSubmenu = panel.querySelector(`.sidebar-submenu[data-content="${contentId}"]`);
    if (targetSubmenu) targetSubmenu.classList.add('active');

    panel.querySelectorAll('.sidebar-submenu-nested').forEach(list => {
      list.classList.remove('active');
      const toggle = list.previousElementSibling;
      if (toggle && toggle.classList.contains('sidebar-link--tertiary')) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  toggleTertiary(toggle) {
    const panel = toggle.closest('.mega-panel');
    if (!panel) return;

    const nested = toggle.nextElementSibling;
    if (!nested || !nested.classList.contains('sidebar-submenu-nested')) return;

    const isActive = nested.classList.contains('active');

    panel.querySelectorAll('.sidebar-submenu-nested').forEach(list => {
      if (list === nested) return;
      list.classList.remove('active');
      const btn = list.previousElementSibling;
      if (btn && btn.classList.contains('sidebar-link--tertiary')) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    if (isActive) {
      nested.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nested.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  isDesktop() {
    return window.matchMedia('(min-width: 1200px)').matches;
  }

  updateDesktopOffsets() {
    if (!this.nav) return false;

    const docEl = document.documentElement;
    const navRect = this.nav.getBoundingClientRect();
    const containerRect = this.navContainer ? this.navContainer.getBoundingClientRect() : navRect;
    const computedWidth = parseFloat(getComputedStyle(docEl).getPropertyValue('--menu-sidebar-width')) || 340;
    const gap = 24;
    const minContentWidth = 720;
    const maxSidebarWidth = window.innerWidth - minContentWidth - gap - containerRect.left;

    if (maxSidebarWidth < 220) {
      return false;
    }

    const sidebarWidth = Math.min(computedWidth, maxSidebarWidth);
    const topOffset = Math.max(0, navRect.bottom);
    const panelRight = containerRect.left + sidebarWidth;
    const contentShift = panelRight + gap;
    const availableWidthFinal = Math.max(
      minContentWidth,
      Math.min(1480, window.innerWidth - contentShift - gap)
    );

    const paddingPx = Math.max(16, Math.min(32, Math.round(availableWidthFinal * 0.04)));

    docEl.style.setProperty('--menu-top-offset', `${topOffset}px`);
    docEl.style.setProperty('--menu-sidebar-left', `${Math.max(0, containerRect.left)}px`);
    docEl.style.setProperty('--menu-sidebar-width', `${sidebarWidth}px`);
    docEl.style.setProperty('--menu-content-shift', `${contentShift}px`);
    docEl.style.setProperty('--menu-content-width', `${availableWidthFinal}px`);
    docEl.style.setProperty('--menu-content-min-width', `${minContentWidth}px`);
    docEl.style.setProperty('--content-padding-x', `${paddingPx}px`);

    return true;
  }

  resetDesktopOffsets() {
    const docEl = document.documentElement;
    docEl.style.setProperty('--menu-top-offset', '0px');
    docEl.style.setProperty('--menu-sidebar-left', '0px');
    docEl.style.setProperty('--menu-sidebar-width', '340px');
    requestAnimationFrame(() => {
      docEl.style.setProperty('--menu-content-shift', '0px');
      docEl.style.setProperty('--menu-content-width', '100vw');
      docEl.style.setProperty('--menu-content-min-width', '720px');
      if (this.isDesktop()) {
        docEl.style.setProperty('--content-padding-x', '2rem');
      } else {
        docEl.style.removeProperty('--content-padding-x');
      }
    });
  }

  handleResize() {
    if (this.currentOpenPanel) {
      if (this.isDesktop()) {
        const applied = this.updateDesktopOffsets();
        if (!applied) {
          document.body.classList.remove('mega-menu-open');
          this.resetDesktopOffsets();
        } else {
          document.body.classList.add('mega-menu-open');
        }
      } else {
        document.body.classList.remove('mega-menu-open');
        this.resetDesktopOffsets();
      }
    } else if (!this.isDesktop()) {
      document.body.classList.remove('mega-menu-open');
      this.resetDesktopOffsets();
    }
  }

  toggleMobileMenu() {
    if (!this.navTop) return;

    this.navTop.classList.toggle('active');

    const icon = this.mobileToggle ? this.mobileToggle.querySelector('i') : null;
    if (icon) {
      if (this.navTop.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  }

  prepareForNavigation() {
    const docEl = document.documentElement;
    docEl.classList.add('mega-menu-closing');

    requestAnimationFrame(() => {
      docEl.style.setProperty('--menu-content-shift', '0px');
      docEl.style.setProperty('--menu-content-width', '100vw');
      docEl.style.setProperty('--menu-content-min-width', '720px');
      if (this.isDesktop()) {
        docEl.style.setProperty('--content-padding-x', '2rem');
      } else {
        docEl.style.removeProperty('--content-padding-x');
      }
      document.body.classList.remove('mega-menu-open');
    });

    clearTimeout(this.closingTimer);
    this.closingTimer = setTimeout(() => {
      docEl.classList.remove('mega-menu-closing');
    }, 400);
  }
}

let megaMenuInstance = null;

function initializeMegaMenu() {
  if (megaMenuInstance) return;
  const hasPanels = document.querySelector('.top-link[data-panel]');
  if (!hasPanels) return;
  try {
    megaMenuInstance = new MegaMenuNav();
    console.log('✓ ZEILER.me Mega Menu initialized successfully');
  } catch (error) {
    console.error('Error initializing mega menu:', error);
  }
}

document.addEventListener('menu:ready', initializeMegaMenu);

document.addEventListener('DOMContentLoaded', () => {
  initializeMegaMenu();
  if (!megaMenuInstance) {
    const onceHandler = () => {
      initializeMegaMenu();
      document.removeEventListener('menu:ready', onceHandler);
    };
    document.addEventListener('menu:ready', onceHandler);
  }
});

// Prevent memory leaks
window.addEventListener('beforeunload', () => {
  // Cleanup if needed
});
