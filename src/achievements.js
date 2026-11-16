import { $, $$, gsap, reduced, tilt, reveals } from './shell.js';
import { honours, grammys, albums, credits } from './data.js';

/* The wall: each honour as a framed record, tinted by what it is */
const wallArt = [
  { tone: 'gram' },
  { tone: 'diamond', cover: '/img/albums/blurred.webp' },
  { tone: 'platinum', cover: '/img/albums/blurred.webp' },
  { tone: 'gold', cover: '/img/albums/blurred.webp' },
  { tone: 'gold', cover: '/img/albums/evolution.webp' },
  { tone: 'platinum', cover: '/img/albums/abw.webp' },
];
const gramophone = `<svg viewBox="0 0 120 120" class="plq__horn" aria-hidden="true"><path d="M60 98v10M44 110h32" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="88" r="10" fill="none" stroke="currentColor" stroke-width="4"/><path d="M60 78 C58 60 46 46 22 34 C20 22 30 12 42 14 C58 30 70 46 66 78" fill="currentColor" opacity=".9"/></svg>`;
$('.wall').innerHTML = honours
  .map((h, i) => {
    const a = wallArt[i];
    const n = parseInt(h.big, 10);
    const big = Number.isNaN(n) ? h.big : `<span data-count="${n}" data-suffix="${h.big.replace(/^\d+/, '')}">0</span>`;
    return `<article class="plq plq--${a.tone}">
      <div class="plq__frame" data-tilt>
        ${a.cover ? `<div class="plq__disc"><span class="plq__label"><img src="${a.cover}" alt="" loading="lazy" /></span></div>` : gramophone}
        <span class="glare"></span>
      </div>
      <div class="plq__card"><span class="plq__big">${big}</span><b>${h.label}</b><p>${h.text}</p></div>
    </article>`;
  })
  .join('');

/* GRAMMY envelopes */
$('.envs').innerHTML = grammys
  .map((g, i) => `<li class="env" style="--d:${i}">
    <div class="env__flap" aria-hidden="true"></div>
    <span class="env__seal" aria-hidden="true">RT</span>
    <p class="env__cat">${g.cat}</p>
    <p class="env__work">${g.work}</p>
    <span class="env__tag">Nominee · ${g.year}</span>
  </li>`)
  .join('');

/* Skyline of Billboard 200 peaks: column height = 1 − log(peak)/log(200) */
const peaked = albums.filter((a) => a.peak).sort((a, b) => a.year - b.year);
$('.skyline').innerHTML =
  `<div class="skyline__axis"><span>#1</span><span>#10</span><span>#100</span></div>` +
  peaked
    .map((a) => {
      const h = Math.max(0.06, 1 - Math.log(a.peak) / Math.log(200));
      return `<div class="sky${a.peak === 1 ? ' sky--top' : ''}" style="--h:${h.toFixed(3)}">
        <div class="sky__col"><img src="${a.cover}" alt="" loading="lazy" /><b>#${a.peak}</b></div>
        <span class="sky__name">${a.title}<small>${a.year}</small></span>
      </div>`;
    })
    .join('');

/* Liner notes */
$('.liner__list').innerHTML = credits
  .map((c, i) => `<li><span class="liner__n">${String(i + 1).padStart(2, '0')}</span><span class="liner__song">“${c.song}”</span><span class="liner__artist">${c.artist}</span><span class="liner__role">${c.role}</span></li>`)
  .join('');

/* Motion */
$$('[data-tilt]').forEach((el) => tilt(el, 10));
if (!reduced) {
  gsap.from('.plaque', { y: 80, rotate: 3, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.4 });
  gsap.to('.plaque__disc', { rotate: 360, duration: 24, ease: 'none', repeat: -1 });
  gsap.from('.plq', { y: 70, opacity: 0, stagger: 0.08, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.wall', start: 'top 82%' } });
  gsap.from('.env', { y: 80, rotate: (i) => (i - 1) * 4, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.envs', start: 'top 85%' } });
  gsap.from('.sky__col', { scaleY: 0, transformOrigin: 'bottom', stagger: 0.08, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.skyline', start: 'top 80%' } });
  gsap.from('.liner__list li', { x: 40, opacity: 0, stagger: 0.05, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.liner__list', start: 'top 85%' } });
}
reveals();
