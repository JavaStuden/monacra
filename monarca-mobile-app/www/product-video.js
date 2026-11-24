/* Optional product clips. Uploaded media only; never an external embed or checkout action. */
(() => {
  'use strict';
  const M = window.Monarca;
  if (!M) return;
  const valid = /^https:\/\/itsmonarca\.com\/api\/v1\/product-videos\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.mp4$/;
  const closed = new Set(), positions = new Map();
  let active = null, queued = false, observer;
  const english = () => window.MonarcaI18n?.language() === 'en';
  const label = (ar, en) => english() ? en : ar;
  const automatic = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;
  const stop = video => { if (video) { video.pause(); video.removeAttribute('src'); video.load(); } };
  function pauseOrPlay() {
    if (!active?.video) return;
    if (document.hidden || document.querySelector('.pd-video-large') || !automatic()) active.video.pause();
    else active.video.play()?.catch(() => {}); // iOS low-power mode can require a user gesture.
  }
  function sync() {
    queued = false;
    if (active && !active.host.isConnected) { stop(active.video); active = null; }
    const id = Number(/^product\/(\d+)$/.exec(M.ui.route || '')?.[1]);
    const product = M.products.find(p => p.id === id && !p.catalogUnavailable);
    const stage = document.querySelector('.pd-stage');
    if (!stage || !product || !valid.test(product.videoUrl || '')) return;
    if (stage.querySelector('.pd-video-widget')) { pauseOrPlay(); return; }
    const host = document.createElement('aside');
    host.className = 'pd-video-widget';
    host.setAttribute('aria-label', label('فيديو المنتج', 'Product video'));
    stage.append(host);
    active = { host, video: null };
    if (closed.has(id)) {
      const reopen = document.createElement('button'); reopen.type = 'button'; reopen.className = 'pd-video-reopen';
      reopen.textContent = label('▶ فيديو', '▶ Video');
      reopen.onclick = event => { event.stopPropagation(); closed.delete(id); host.remove(); schedule(); };
      host.append(reopen); return;
    }
    const video = document.createElement('video');
    video.src = product.videoUrl; video.muted = true; video.defaultMuted = true;
    video.loop = true; video.playsInline = true; video.preload = 'metadata';
    video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    if (product.imageUrl) video.poster = product.imageUrl;
    video.onloadedmetadata = () => { const at = positions.get(id); if (at && at < video.duration) video.currentTime = at; pauseOrPlay(); };
    video.ontimeupdate = () => positions.set(id, video.currentTime);
    host.append(video); active.video = video;
    const open = document.createElement('button'); open.type = 'button'; open.className = 'pd-video-open';
    open.textContent = label('▶ مشاهدة الفيديو', '▶ Watch video');
    open.onclick = event => {
      event.stopPropagation(); video.pause();
      const title = label('فيديو المنتج', 'Product video');
      M.sheet(title, `<video class="pd-video-large" src="${M.esc(product.videoUrl)}" controls autoplay playsinline preload="metadata" aria-label="${title}"></video>`);
      document.querySelector('.pd-video-large')?.play()?.catch(() => {});
    };
    const close = document.createElement('button'); close.type = 'button'; close.className = 'pd-video-close';
    close.textContent = '×'; close.setAttribute('aria-label', label('إغلاق الفيديو', 'Close video'));
    close.onclick = event => { event.stopPropagation(); closed.add(id); stop(video); host.remove(); schedule(); };
    video.onerror = () => { open.textContent = label('تعذّر تشغيل الفيديو', 'Video unavailable'); };
    host.append(open, close); pauseOrPlay();
  }
  function schedule() { if (!queued) { queued = true; setTimeout(sync, 0); } }
  observer = new MutationObserver(records => {
    if (records.some(r => !r.target.closest?.('.pd-video-widget'))) schedule();
  });
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
  observer.observe(document.getElementById('overlay-root'), { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('.pd-video-large').forEach(v => v.pause());
    pauseOrPlay();
  });
  window.addEventListener('pagehide', () => { active?.video?.pause(); document.querySelectorAll('.pd-video-large').forEach(v => v.pause()); });
  schedule();
})();
