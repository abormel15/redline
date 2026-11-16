/* iPad edition bootstrap.
   1. Ask the browser to keep this app's storage (home-screen web apps get it; harmless elsewhere).
   2. Safe areas: as a home-screen app the page runs under the iPad status bar (clock, battery) and above the home indicator.
      iPadOS reports env(safe-area-inset-*) as 0 in that mode, so the top row of tools ended up under the status bar. When the app
      is installed and the insets read 0, use the iPad's real sizes (24pt status bar, 20pt home indicator) instead. */
(() => {
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}
  try { if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', () => { window.__rdUpdated = true; }); } catch (e) {}
  // Safari page zoom: a pinch that starts on a bar, panel or the rail used to zoom the whole interface (the sheet already handles
  // its own pinch and prevents the default there). Block it everywhere; the sheet's handlers still run.
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(t, e => { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1 && !(e.target.closest && e.target.closest('#stage'))) e.preventDefault(); }, { passive: false });
  const root = document.documentElement;
  const installed = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches; } catch (e) { return false; } };
  const measure = () => { const p = document.createElement('div'); p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'; document.body.appendChild(p); const cs = getComputedStyle(p), r = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 }; p.remove(); return r; };
  const safeArea = force => {
    const on = force != null ? force : installed(); const env = measure();
    const top = on && env.top < 10 ? 24 : env.top, bottom = on && env.bottom < 5 ? 20 : env.bottom;
    root.style.setProperty('--sat', top + 'px'); root.style.setProperty('--sab', bottom + 'px');
    return { on, env, top, bottom }; };
  window.__rdSafeArea = safeArea;
  if (installed()) root.setAttribute('data-installed', '');
  const run = () => { try { safeArea(); } catch (e) {} };
  if (document.body) run(); else document.addEventListener('DOMContentLoaded', run);
  let t = 0; const later = () => { clearTimeout(t); t = setTimeout(run, 120); };
  window.addEventListener('resize', later); window.addEventListener('orientationchange', later);
})();
