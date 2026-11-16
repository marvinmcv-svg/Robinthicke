// Shared chrome for every page: nav (with face logo), menu, footer, smooth scroll,
// cursor, magnetic buttons, tilt, page transitions, the preview player and Marvin.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { links } from './data.js';
import { initPlayer } from './player.js';
import { initConsentBanner } from './consent.js';

gsap.registerPlugin(ScrollTrigger);

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export { gsap, ScrollTrigger };

export const pages = [
  { href: '/', label: 'Home' },
  { href: '/music/', label: 'Music' },
  { href: '/tour/', label: 'Tour' },
  { href: '/achievements/', label: 'Achievements' },
  { href: '/story/', label: 'Story' },
];

const here = location.pathname.replace(/index\.html$/, '');
const isHere = (href) => (href === '/' ? here === '/' : here.startsWith(href));

/* ------------------------------------------------------------------ */
/* Chrome markup                                                       */
/* ------------------------------------------------------------------ */
document.body.insertAdjacentHTML(
  'afterbegin',
  `<div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
  <div class="progress" aria-hidden="true"><i></i></div>
  <div class="curtain" aria-hidden="true"><span class="curtain__face"><img src="/img/face.webp" alt="" /></span></div>
  <header class="nav">
    <a href="/" class="nav__logo" data-magnetic aria-label="Robin Thicke — home">
      <span class="nav__face"><img src="/img/face.webp" alt="" width="40" height="40" /></span>
      <span class="nav__mark">RT<em>.</em></span>
    </a>
    <nav class="nav__links" aria-label="Primary">
      ${pages.slice(1).map((p) => `<a href="${p.href}"${isHere(p.href) ? ' aria-current="page"' : ''}>${p.label}</a>`).join('')}
      <a href="${links.store}" target="_blank" rel="noopener">Store ↗</a>
    </nav>
    <button class="nav__cta" type="button" data-marvin data-magnetic><span class="dot"></span>Ask Marvin</button>
    <button class="nav__burger" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>
  </header>
  <div class="menu" aria-hidden="true">
    <ul>
      ${pages.map((p, i) => `<li><a href="${p.href}"${isHere(p.href) ? ' aria-current="page"' : ''}><small>0${i + 1}</small>${p.label}</a></li>`).join('')}
      <li><a href="${links.store}" target="_blank" rel="noopener"><small>06</small>Store ↗</a></li>
    </ul>
    <p class="menu__foot"><a href="${links.booking}">Booking — RobinThickeInfo@rocnation.com</a></p>
  </div>`
);

const footer = $('footer[data-footer]');
if (footer) {
  footer.className = 'footer';
  footer.id = 'contact';
  footer.innerHTML = `
    <div class="wrap footer__top">
      <div>
        <p class="eyebrow">Booking inquiries</p>
        <a class="footer__mail" href="${links.booking}" data-cursor="Email">RobinThickeInfo<br />@rocnation.com</a>
        <button class="link-arrow footer__marvin" type="button" data-marvin="booking">Or let Marvin take the details →</button>
      </div>
      <div class="footer__cols">
        <div>
          <p class="eyebrow">Site</p>
          ${pages.map((p) => `<a href="${p.href}">${p.label}</a>`).join('')}
        </div>
        <div>
          <p class="eyebrow">Listen</p>
          <a href="${links.spotify}" target="_blank" rel="noopener">Spotify</a>
          <a href="${links.applemusic}" target="_blank" rel="noopener">Apple Music</a>
          <a href="${links.youtube}" target="_blank" rel="noopener">YouTube</a>
          <a href="${links.linkinbio}" target="_blank" rel="noopener">All links</a>
        </div>
        <div>
          <p class="eyebrow">Follow</p>
          <a href="${links.instagram}" target="_blank" rel="noopener">Instagram</a>
          <a href="${links.tiktok}" target="_blank" rel="noopener">TikTok</a>
          <a href="${links.facebook}" target="_blank" rel="noopener">Facebook</a>
          <a href="${links.store}" target="_blank" rel="noopener">Store</a>
        </div>
      </div>
    </div>
    <div class="footer__word" aria-hidden="true"><span>ROBIN</span><span class="serif">Thicke</span></div>
    <div class="wrap footer__bottom">
      <span>© ${new Date().getFullYear()} Robin Thicke</span>
      <span class="footer__dedic">Miss u Pops &amp; Andre Harrell ♥</span>
      <a href="#top" class="link-arrow">Back to top ↑</a>
    </div>
    <nav class="wrap footer__legal" aria-label="Legal">
      <a href="/legal/terms/">Terms of Use</a><a href="/legal/privacy/">Privacy</a><a href="/legal/cookies/">Cookies</a><a href="/legal/accessibility/">Accessibility</a><a href="/legal/credits/">Credits &amp; copyright</a><button type="button" data-consent-open>Cookie settings</button>
      <span>Marvin is an AI assistant, not Robin Thicke. Tickets and merchandise are sold by third parties.</span>
    </nav>`;
}

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                       */
/* ------------------------------------------------------------------ */
export const lenis = new Lenis({ lerp: 0.09, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  e.preventDefault();
  closeMenu();
  lenis.scrollTo(id === '#top' || id === '#' ? 0 : id, { offset: 0, duration: 1.6 });
});

/* ------------------------------------------------------------------ */
/* Page transitions                                                    */
/* ------------------------------------------------------------------ */
const curtain = $('.curtain');
const enter = () => {
  if (reduced) return gsap.set(curtain, { autoAlpha: 0 });
  gsap.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.05, onComplete: () => gsap.set(curtain, { autoAlpha: 0 }) });
};
if (document.body.classList.contains('is-loading')) gsap.set(curtain, { autoAlpha: 0 });
else enter();
window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { autoAlpha: 0 }); });

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname || !url.pathname.endsWith('/')) return;
  e.preventDefault();
  closeMenu();
  if (reduced) return (location.href = url.href);
  gsap.set(curtain, { autoAlpha: 1 });
  gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.in', onComplete: () => (location.href = url.href) });
});

/* ------------------------------------------------------------------ */
/* Nav / progress / menu                                               */
/* ------------------------------------------------------------------ */
gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
let lastY = 0;
lenis.on('scroll', ({ scroll }) => {
  $('.nav').classList.toggle('is-hidden', scroll > lastY && scroll > 200 && !document.body.classList.contains('menu-open'));
  $('.nav').classList.toggle('is-solid', scroll > 80);
  lastY = scroll;
});

function closeMenu() {
  document.body.classList.remove('menu-open');
  $('.nav__burger').setAttribute('aria-expanded', 'false');
  $('.menu').setAttribute('aria-hidden', 'true');
}
$('.nav__burger').addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  $('.nav__burger').setAttribute('aria-expanded', open);
  $('.menu').setAttribute('aria-hidden', !open);
  if (open) gsap.from('.menu li', { y: 80, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', delay: 0.2 });
});

/* ------------------------------------------------------------------ */
/* Shared reveals                                                      */
/* ------------------------------------------------------------------ */
export function reveals(root = document) {
  $$('[data-reveal]', root).forEach((el) =>
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
  );
  $$('[data-count]', root).forEach((el) => {
    const end = +el.dataset.count;
    const suf = el.dataset.suffix || '';
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: end > 1000 ? 2.4 : 1.8, ease: 'expo.out', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('en-US') + suf) }),
    });
  });
  if (footer) gsap.from('.footer__word span', { yPercent: 100, opacity: 0, stagger: 0.12, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 95%' } });
}

/* ------------------------------------------------------------------ */
/* Tilt, cursor, magnetic                                              */
/* ------------------------------------------------------------------ */
export function tilt(el, max = 14) {
  if (!fine || reduced) return;
  const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3' });
  const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3' });
  gsap.set(el, { transformPerspective: 1000 });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    rx((0.5 - y) * max);
    ry((x - 0.5) * max);
    el.style.setProperty('--gx', x * 100 + '%');
    el.style.setProperty('--gy', y * 100 + '%');
    el.style.setProperty('--sx', 100 - x * 100 + '%');
  });
  el.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

export function magnetic(root = document) {
  if (!fine) return;
  $$('[data-magnetic]', root).forEach((el) => {
    if (el._mag) return;
    el._mag = true;
    const mx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const my = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.35);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
}

if (fine) {
  const cur = $('.cursor');
  const label = $('.cursor__label');
  const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
  const cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button');
    cur.classList.toggle('is-label', !!t?.dataset?.cursor);
    cur.classList.toggle('is-hover', !!t && !t.dataset.cursor);
    label.textContent = t?.dataset?.cursor || '';
  });
}

/* ------------------------------------------------------------------ */
/* Player + Marvin (Marvin's code loads on first open)                 */
/* ------------------------------------------------------------------ */
export const player = initPlayer();

document.body.insertAdjacentHTML(
  'beforeend',
  `<button class="marvin-fab" type="button" data-marvin aria-label="Chat with Marvin, the AI receptionist">
    <span class="marvin-fab__face"></span>
    <span class="marvin-fab__txt"><small>AI receptionist</small>Ask Marvin</span>
  </button>`
);
import('./marvin-art.js').then(({ marvinSVG }) => ($('.marvin-fab__face').innerHTML = marvinSVG('fab')));
let marvin;
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-marvin]');
  if (!t) return;
  e.preventDefault();
  closeMenu();
  marvin ||= (await import('./marvin.js')).initMarvin({ player, lenis });
  marvin.open(t.dataset.marvin || '');
});
setTimeout(() => $('.marvin-fab').classList.add('is-in'), document.body.classList.contains('is-loading') ? 3200 : 900);

initConsentBanner();
window.addEventListener('load', () => ScrollTrigger.refresh());
magnetic();
