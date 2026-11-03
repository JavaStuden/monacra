/* Monarca v4.7.9 · Responsive Controller, Dynamic Orientation/Foldable Adaptation & Multi-Language Sync */
(() => {
  'use strict';

  function init() {
    const stage = document.querySelector('.stage');
    const simBar = document.getElementById('device-sim-bar');
    const simBtns = document.querySelectorAll('.sim-btn');

    // 1. Detect Native App Platform (Capacitor / Mobile Webview / Real Tablet)
    const isNative = !!(
      window.Capacitor?.isNativePlatform?.() ||
      (window.Capacitor?.getPlatform && window.Capacitor.getPlatform() !== 'web') ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && !window.location.port)
    );
    if (isNative) {
      document.body.classList.add('is-native-app');
      const platform = window.Capacitor?.getPlatform?.();
      if (platform === 'android') document.body.classList.add('is-native-android');
      if (platform === 'ios') document.body.classList.add('is-native-ios');
      if (simBar) simBar.style.display = 'none';
    }

    // 2. Device Viewport Mode Switcher (Desktop / Tablet / Mobile)
    let currentMode = null;
    let isDispatchingResize = false;
    let userLockedSimMode = false;

    function setDeviceMode(mode, { persist = false } = {}) {
      if (!stage || !mode) return;
      const modeClass = 'mode-' + mode;
      if (currentMode === mode && stage.classList.contains(modeClass)) {
        return;
      }
      currentMode = mode;
      stage.classList.remove('mode-desktop', 'mode-tablet', 'mode-mobile');
      stage.classList.add(modeClass);
      simBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sim === mode);
      });
      if (persist) {
        try {
          localStorage.setItem('monarca-device-mode', mode);
        } catch (_) {}
      }
      if (!isDispatchingResize) {
        isDispatchingResize = true;
        try {
          window.dispatchEvent(new Event('resize'));
        } finally {
          isDispatchingResize = false;
        }
      }
    }

    function detectResponsiveMode() {
      const width = window.innerWidth || document.documentElement.clientWidth || 375;
      if (isNative) {
        // Real Phone / Foldable / Tablet / iPad: always adapt to physical viewport width
        if (width >= 1024) {
          setDeviceMode('desktop');
        } else if (width >= 768) {
          setDeviceMode('tablet');
        } else {
          setDeviceMode('mobile');
        }
        return;
      }

      // Web browser: if user manually clicked simulator bar on desktop, honor their choice
      if (userLockedSimMode && width >= 768) {
        return;
      }

      if (width >= 1024) {
        let savedMode = 'desktop';
        try {
          savedMode = localStorage.getItem('monarca-device-mode') || 'desktop';
        } catch (_) {}
        setDeviceMode(savedMode);
      } else if (width >= 768) {
        setDeviceMode('tablet');
      } else {
        setDeviceMode('mobile');
      }
    }

    simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.sim;
        if (mode) {
          userLockedSimMode = true;
          setDeviceMode(mode, { persist: true });
        }
      });
    });

    // Initial screen layout detection
    detectResponsiveMode();

    // Dynamically re-evaluate when rotating device (Portrait <-> Landscape) or unfolding foldables
    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (isDispatchingResize) return;
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        detectResponsiveMode();
      });
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(detectResponsiveMode, 120);
      setTimeout(detectResponsiveMode, 320);
    });

    // 3. Language Switcher Synchronization
    function syncLangButtons(lang) {
      document.querySelectorAll('.lang-opt').forEach(btn => {
        const val = btn.dataset.langVal || btn.dataset.val;
        btn.classList.toggle('active', val === lang);
      });
      document.querySelectorAll('.header-lang-compact').forEach(btn => {
        const isAr = lang === 'ar';
        btn.dataset.val = isAr ? 'en' : 'ar';
        btn.innerHTML = `<span>${isAr ? 'EN' : 'عربي'}</span>`;
        btn.title = isAr ? 'Switch to English' : 'التبديل إلى العربية';
      });
    }

    function switchLanguage(lang) {
      if (!['ar', 'en'].includes(lang)) return;
      if (!window.MonarcaI18n) return;

      const current = window.MonarcaI18n.language();
      if (current === lang) return;

      window.MonarcaI18n.setLanguage(lang);
      syncLangButtons(lang);

      if (window.Monarca?.render) {
        window.Monarca.render(true);
      }
      const overlays = document.getElementById('overlay-root');
      if (overlays) overlays.innerHTML = '';
      const appEl = document.getElementById('app');
      if (appEl) appEl.inert = false;
      const bNav = document.getElementById('bottom-nav');
      if (bNav) bNav.inert = false;

      const msg = lang === 'en' ? 'Language changed to English' : 'تم تغيير اللغة إلى العربية';
      if (window.Monarca?.toast) {
        window.Monarca.toast(msg);
      }
    }

    // Bind click events on all language switcher options (both in simulator bar and store headers)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang-val], [data-action="quick-lang"]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const targetLang = btn.dataset.langVal || btn.dataset.val;
        if (targetLang) {
          switchLanguage(targetLang);
        }
      }
    });

    // Listen to internal language change events
    window.addEventListener('monarca:languagechange', (e) => {
      const lang = e.detail?.language || window.MonarcaI18n?.language() || 'ar';
      syncLangButtons(lang);
    });

    // Initial button sync
    setTimeout(() => {
      const curLang = window.MonarcaI18n?.language() || 'ar';
      syncLangButtons(curLang);
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();