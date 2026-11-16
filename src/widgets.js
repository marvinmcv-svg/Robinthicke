// Home-page widgets: the TV "channel" set and the real Instagram feed.
import gsap from 'gsap';
import { tv, posts, links } from './data.js';
import { consent } from './consent.js';

/* ------------------------------------------------------------------ */
/* Prime time — a two-channel set with static between channels         */
/* ------------------------------------------------------------------ */
const art = {
  // an original masquerade mask
  0: `<svg viewBox="0 0 200 110" class="tv__art"><path d="M100 38c-14-22-46-30-78-18-8 3-12 10-10 18 4 30 26 52 54 52 18 0 28-12 34-26 6 14 16 26 34 26 28 0 50-22 54-52 2-8-2-15-10-18-32-12-64-4-78 18z" fill="currentColor"/><ellipse cx="62" cy="52" rx="20" ry="13" fill="#0b0a09"/><ellipse cx="138" cy="52" rx="20" ry="13" fill="#0b0a09"/><path d="M14 30 4 6M186 30l10-24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  // a run of piano keys
  1: `<svg viewBox="0 0 210 110" class="tv__art">${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 15}" y="0" width="14" height="110" rx="2" fill="currentColor"/>`).join('')}${[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => `<rect x="${i * 15 + 9.5}" y="0" width="10" height="66" rx="1.5" fill="#0b0a09"/>`).join('')}</svg>`,
};

export function initTV(root, { reduced }) {
  if (!root) return;
  root.innerHTML = `
    <div class="tv__guide" role="tablist" aria-label="TV shows">
      ${tv.map((s, i) => `<button class="tv__ch" role="tab" aria-selected="${i === 0}" data-i="${i}"><span class="tv__num">CH ${s.ch}</span><span class="tv__name">${s.title}</span><span class="tv__role">${s.role} · ${s.since}</span><i class="tv__timer"></i></button>`).join('')}
    </div>
    <div class="tv__set">
      <div class="tv__screen">
        <canvas class="tv__static" aria-hidden="true"></canvas>
        <div class="tv__content" aria-live="polite"></div>
        <span class="tv__onair"><i></i>On air</span>
        <span class="tv__bug"></span>
      </div>
    </div>`;
  const content = root.querySelector('.tv__content');
  const bug = root.querySelector('.tv__bug');
  const tabs = [...root.querySelectorAll('.tv__ch')];
  const canvas = root.querySelector('.tv__static');
  const ctx = canvas.getContext('2d');
  let cur = -1, timer, noiseUntil = 0;

  const paint = (i) => {
    const s = tv[i];
    content.innerHTML = `${art[i]}<p class="tv__kick">${s.net} · ${s.seasons}</p><h3 class="tv__title">${s.title}</h3><p class="tv__text">${s.text}</p><p class="tv__meta"><span>${s.role}</span><span>${s.since}</span></p>`;
    bug.textContent = `${s.net} · CH ${s.ch}`;
  };
  const noise = () => {
    if (performance.now() > noiseUntil) { canvas.style.opacity = 0; return; }
    const w = (canvas.width = 160), h = (canvas.height = 100);
    const img = ctx.createImageData(w, h);
    for (let p = 0; p < img.data.length; p += 4) { const v = Math.random() * 255; img.data[p] = img.data[p + 1] = img.data[p + 2] = v; img.data[p + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    canvas.style.opacity = 1;
    requestAnimationFrame(noise);
  };
  const go = (i, user) => {
    if (i === cur) return;
    cur = i;
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.classList.toggle('is-on', j === i); });
    if (!reduced) { noiseUntil = performance.now() + 260; noise(); }
    setTimeout(() => {
      paint(i);
      if (!reduced) gsap.from(content.children, { y: 24, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' });
    }, reduced ? 0 : 200);
    clearTimeout(timer);
    if (!user && !reduced) timer = setTimeout(() => go((cur + 1) % tv.length), 7000);
    root.classList.toggle('is-auto', !user && !reduced);
  };
  tabs.forEach((t) => t.addEventListener('click', () => go(+t.dataset.i, true)));
  go(0);
}

/* ------------------------------------------------------------------ */
/* Instagram — real posts, thumbnails straight from Instagram          */
/* ------------------------------------------------------------------ */
const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function initIG(track) {
  if (!track) return;
  track.innerHTML = posts
    .map(
      (p) => `<a class="igp" href="https://www.instagram.com/p/${p.code}/" target="_blank" rel="noopener" data-cursor="Open">
      <div class="igp__media">
        <p class="igp__ph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor"/></svg>@robinthicke</p>
        <iframe data-src="https://www.instagram.com/p/${p.code}/embed/" title="Instagram post: ${p.text.replace(/"/g, '')}" tabindex="-1" scrolling="no" loading="lazy" aria-hidden="true"></iframe>
        ${p.video ? '<span class="igp__reel">▶ Reel</span>' : ''}
      </div>
      <div class="igp__meta"><time datetime="${p.date}">${shortDate(p.date)}</time><span>${p.stat}</span></div>
      <p class="igp__cap">${p.text}</p>
    </a>`
    )
    .join('') +
    `<a class="igp igp--more" href="${links.instagram}" target="_blank" rel="noopener"><span>More on<br/>Instagram ↗</span></a>`;

  // Load the embeds only with consent, and only when the feed is about to be seen.
  const load = () => track.querySelectorAll('iframe[data-src]').forEach((f, i) => setTimeout(() => {
    if (f.src) return;
    f.addEventListener('load', () => f.closest('.igp').classList.add('is-loaded'), { once: true });
    f.src = f.dataset.src;
  }, i * 150));
  let near = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    near = true;
    if (consent.embedsAllowed()) load();
  }, { rootMargin: '600px' });
  io.observe(track);
  consent.onChange((v) => { if (v === 'all' && near) load(); });
  const gate = track.closest('.ig')?.querySelector('.ig__gate');
  if (gate) {
    const sync = () => (gate.hidden = consent.embedsAllowed());
    sync();
    consent.onChange(sync);
    gate.querySelector('button').addEventListener('click', () => { consent.allowEmbeds(); near = true; load(); });
  }

  // drag to scroll on desktop
  let down = false, sx = 0, sl = 0, moved = 0;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; });
  window.addEventListener('pointermove', (e) => { if (!down) return; moved += Math.abs(e.movementX); track.scrollLeft = sl - (e.clientX - sx); });
  window.addEventListener('pointerup', () => (down = false));
  track.addEventListener('click', (e) => { if (moved > 8) { e.preventDefault(); moved = 0; } }, true);
}
