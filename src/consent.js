// Cookie / embed consent. Only third-party embeds that load on their own (Instagram)
// wait for consent; players the visitor presses play on count as their choice.
const KEY = 'rt-consent';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, v); } catch {} };
const listeners = new Set();

export const consent = {
  get: read,
  embedsAllowed: () => read() === 'all',
  allowEmbeds() { write('all'); listeners.forEach((fn) => fn('all')); },
  onChange: (fn) => listeners.add(fn),
};

export function initConsentBanner() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="consent" role="dialog" aria-label="Cookie settings" aria-hidden="true">
      <p><b>Cookies &amp; embeds.</b> This site sets no tracking cookies. Instagram, Spotify and YouTube players come from those companies and may set their own cookies when they load. <a href="/legal/cookies/">Cookie Policy</a></p>
      <div class="consent__btns">
        <button type="button" class="consent__no">Essential only</button>
        <button type="button" class="consent__yes">Allow embeds</button>
      </div>
    </div>`
  );
  const el = document.querySelector('.consent');
  const show = () => { el.classList.add('is-on'); el.setAttribute('aria-hidden', 'false'); };
  const hide = () => { el.classList.remove('is-on'); el.setAttribute('aria-hidden', 'true'); };
  el.querySelector('.consent__yes').addEventListener('click', () => { consent.allowEmbeds(); hide(); });
  el.querySelector('.consent__no').addEventListener('click', () => { write('essential'); listeners.forEach((fn) => fn('essential')); hide(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-consent-open]')) show(); });
  if (!read()) setTimeout(show, document.body.classList.contains('is-loading') ? 3600 : 1200);
}
