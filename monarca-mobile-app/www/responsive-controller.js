/* Monarca v4.7.2 · Responsive Controller & Multi-Language Synchronization */
(() => {
  'use strict';

  function init() {
    const stage = document.querySelector('.stage');
    const simBar = document.getElementById('device-sim-bar');
    const simBtns = document.querySelectorAll('.sim-btn');

    // 1. Detect Native App Platform (Capacitor / Mobile Webview / Real Tablet)
    const isNative = !!(
      window.Capacitor?.isNativePlatform?.() ||
      window.Capacitor?.getPlatform?.() !== 'web' ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost'
    );
    if (isNative) {
      document.body.classList.add('is-native-app');
      const platform = window.Capacitor?.getPlatform?.();
      if (platform === 'android') document.body.classList.add('is-native-android');
      if (platform === 'ios') document.body.classList.add('is-native-ios');
      if (simBar) simBar.style.display = 'none';
    }

    // 2. Device Viewport Mode Switcher (Desktop / Tablet / Mobile)
    function setDeviceMode(mode) {
      if (!stage) return;
      stage.classList.remove('mode-desktop', 'mode-tablet', 'mode-mobile');
      stage.classList.add('mode-' + mode);
      simBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sim === mode);
      });
      try {
        localStorage.setItem('monarca-device-mode', mode);
      } catch (_) {}
      window.dispatchEvent(new Event('resize'));
    }

    simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.sim;
        if (mode) setDeviceMode(mode);
      });
    });

    // Auto-detect screen layout on startup
    if (isNative) {
      // In native app, automatically select Tablet or Mobile based on physical screen width
      if (window.innerWidth >= 1024) {
        setDeviceMode('desktop');
      } else if (window.innerWidth >= 768) {
        setDeviceMode('tablet');
      } else {
        setDeviceMode('mobile');
      }
    } else {
      // In web browser: wide screens (>= 1024px) default to desktop mode or saved choice
      if (window.innerWidth >= 1024) {
        let savedMode = 'desktop';
        try {
          savedMode = localStorage.getItem('monarca-device-mode') || 'desktop';
        } catch (_) {}
        setDeviceMode(savedMode);
      } else if (window.innerWidth >= 768) {
        setDeviceMode('tablet');
      } else {
        setDeviceMode('mobile');
      }
    }

    // 2. Language Switcher Synchronization
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
