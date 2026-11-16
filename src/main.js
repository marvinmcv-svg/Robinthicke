import { $, $$, gsap, ScrollTrigger, lenis, reduced, fine, tilt, reveals, magnetic } from './shell.js';
import { single, albums, gallery, videos, heroSlides } from './data.js';
import { renderTicket, showRow } from './live.js';
import { initTV, initIG } from './widgets.js';

/* ------------------------------------------------------------------ */
/* Render data                                                         */
/* ------------------------------------------------------------------ */
$('.services').innerHTML = single.services
  .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name}<span>${s.name === 'Amazon Music' || s.name === 'Deezer' ? 'Play' : 'Stream'} ↗</span></a></li>`)
  .join('');

$('.ring__spin').innerHTML = albums
  .map((a, i) => `<div class="ring__item" data-i="${i}"><img src="${a.cover}" alt="${a.title} cover" draggable="false" /></div>`)
  .join('');

$('.cards').innerHTML = albums
  .map(
    (a) => `<a class="card" href="${a.url}" target="_blank" rel="noopener" data-cursor="Play">
      <div class="card__inner"><img src="${a.cover}" alt="${a.title}" loading="lazy" /><span class="card__shine"></span></div>
      <div class="card__meta"><h4>${a.title}${a.sub ? `<br/><small style="color:var(--mute)">${a.sub}</small>` : ''}</h4><span>${a.year}</span></div>
    </a>`
  )
  .join('');

$('.lens__grid').innerHTML = gallery
  .map((g, i) => `<button class="shot" data-i="${i}" data-caption="${g.caption}" data-cursor="View" aria-label="Open photo: ${g.caption}"><span class="mask"></span><img src="${g.src}" alt="${g.caption}" loading="lazy" /></button>`)
  .join('');

$('.videos__grid').innerHTML = videos
  .map(
    (v) => `<button class="vid js-video" data-video="${v.id}" data-cursor="Play">
      <img src="${v.thumb}" alt="" loading="lazy" />
      <span class="vid__play">▶</span>
      <span class="vid__txt"><small>${v.who}</small><b>${v.title}</b></span>
    </button>`
  )
  .join('') +
  `<a class="vid vid--cta" href="https://www.youtube.com/channel/UCFHZMfLTN8Zg2sUIrLJhRQQ?sub_confirmation=1" target="_blank" rel="noopener" data-cursor="Open">
    <span class="vid__txt"><small>2.09M subscribers</small><b>More on<br/>YouTube ↗</b></span>
  </a>`;


/* ------------------------------------------------------------------ */
/* Smooth scroll                                                       */
/* ------------------------------------------------------------------ */
lenis.stop();

/* ------------------------------------------------------------------ */
/* Split helpers                                                       */
/* ------------------------------------------------------------------ */
$$('.split').forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
});
// word split preserving <em>
$$('.words').forEach((el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return frag.append(' ');
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = w;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
});

/* ------------------------------------------------------------------ */
/* Hero WebGL                                                          */
/* ------------------------------------------------------------------ */
const heroState = { reveal: 0, scroll: 0, mix: 0 };
let gl = null;
// Three.js is code-split: it only downloads after first paint, never blocking the loader.
if (!reduced) {
  import('./hero-gl.js').then(({ initHeroGL }) => {
    gl = initHeroGL($('.hero__gl'), heroSlides, heroState);
    if (gl) startSlideshow();
  });
}

const slideNum = $('.hero__slide-num');
const slideCap = $('.hero__slide-cap');
const slideBars = $$('.hero__bars i');
let slide = 0;
let slideTimer;
function goToSlide(next) {
  if (!gl || !gl.canShow(next) || heroState.mix > 0) return;
  gl.setPair(slide, next);
  slideBars.forEach((b, i) => b.classList.toggle('is-on', i === next));
  gsap.fromTo([slideNum, slideCap], { yPercent: 0, opacity: 1 }, {
    yPercent: -100, opacity: 0, duration: 0.4, ease: 'expo.in',
    onComplete: () => {
      slideNum.textContent = String(next + 1).padStart(2, '0');
      slideCap.textContent = heroSlides[next].caption;
      gsap.fromTo([slideNum, slideCap], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out' });
    },
  });
  gsap.to(heroState, {
    mix: 1, duration: 1.8, ease: 'power2.inOut',
    onComplete: () => { slide = next; gl.setPair(next, next); heroState.mix = 0; },
  });
}
function startSlideshow() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goToSlide((slide + 1) % heroSlides.length), 6500);
}
$('.hero').addEventListener('click', (e) => {
  if (e.target.closest('a, button')) return;
  goToSlide((slide + 1) % heroSlides.length);
  startSlideshow();
});

/* ------------------------------------------------------------------ */
/* Loader -> intro                                                     */
/* ------------------------------------------------------------------ */
const imgs = ['/img/hero.webp', '/img/single.webp', ...albums.map((a) => a.cover)];
let loaded = 0;
const counter = { v: 0 };
const numEl = $('.loader__num');
const bar = $('.loader__bar i');
gsap.to('.loader__name span', { y: 0, duration: 1, stagger: 0.06, ease: 'expo.out', delay: 0.1 });

const preload = Promise.all(
  imgs.map(
    (src) =>
      new Promise((res) => {
        const i = new Image();
        i.onload = i.onerror = () => {
          loaded++;
          gsap.to(counter, { v: (loaded / imgs.length) * 100, duration: 0.6, ease: 'power2.out', onUpdate: () => { numEl.textContent = Math.round(counter.v); bar.style.transform = `scaleX(${counter.v / 100})`; } });
          res();
        };
        i.src = src;
      })
  )
);
const minTime = new Promise((r) => setTimeout(r, reduced ? 200 : 1100));
Promise.all([preload, minTime, document.fonts.ready]).then(intro);

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
  tl.to(counter, { v: 100, duration: 0.4, onUpdate: () => { numEl.textContent = Math.round(counter.v); bar.style.transform = `scaleX(${counter.v / 100})`; } })
    .to('.loader__name span', { y: '-105%', duration: 0.8, stagger: 0.04, ease: 'expo.in' }, '+=0.1')
    .to('.loader__count, .loader__bar', { opacity: 0, duration: 0.4 }, '<')
    .to('.loader__curtain', { scaleY: 0, duration: 1.2 }, '-=0.3')
    .add(() => {
      document.body.classList.remove('is-loading');
      $('.loader').style.display = 'none';
      lenis.start();
    })
    .from('.hero__fallback', { scale: 1.3, duration: 2, ease: 'expo.out' }, '-=1.1')
    .from('.hero__title .ch', { yPercent: 110, rotate: 8, duration: 1.4, stagger: 0.05, ease: 'expo.out' }, '-=1.6')
    .from('.hero__eyebrow span, .hero__lede, .hero__ctas > *, .nav > *, .marvin-fab', { y: 30, opacity: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, '-=1.1');
  tl.to(heroState, { reveal: 1, duration: 2.4, ease: 'expo.out' }, 2.0);
}

/* ------------------------------------------------------------------ */
/* Scroll animations                                                   */
/* ------------------------------------------------------------------ */
// hero parallax / gl scroll
gsap.to('.hero__content', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.hero__fallback', { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to(heroState, { scroll: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

// marquee skew by velocity
const skewTo = gsap.quickTo('.marquee__track', 'skewX', { duration: 0.4, ease: 'power3' });
lenis.on('scroll', ({ velocity }) => skewTo(gsap.utils.clamp(-12, 12, velocity * -0.6)));

// generic eyebrows / titles
$$('.display, .single__title, .eyebrow:not(.hero__eyebrow)').forEach((el) =>
  gsap.from(el, { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
);

// single: vinyl slides out of sleeve
gsap.fromTo('.record__vinyl', { x: '0%' }, { x: '24%', ease: 'none', scrollTrigger: { trigger: '.single', start: 'top 80%', end: 'center center', scrub: 1 } });
gsap.from('.record', { yPercent: 20, rotateX: 25, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.single', start: 'top 70%' } });
gsap.from('.services li', { y: 30, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.services', start: 'top 85%' } });
gsap.to('.record__vinyl', { rotate: '+=360', duration: 6, ease: 'none', repeat: -1, paused: reduced });

// word reveal
$$('.words').forEach((el) => {
  gsap.to($$('.w', el), { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
});

// gallery reveal + parallax
$$('.shot').forEach((s, i) => {
  gsap.to($('.mask', s), { scaleY: 0, duration: 1.4, ease: 'expo.inOut', delay: (i % 2) * 0.1, scrollTrigger: { trigger: s, start: 'top 85%' } });
  gsap.fromTo($('img', s), { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
});

// cards stagger
gsap.from('.card', { y: 100, rotateX: -30, opacity: 0, stagger: 0.07, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.cards', start: 'top 85%' } });
gsap.from('.vid', { y: 80, opacity: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.videos__grid', start: 'top 85%' } });

/* ------------------------------------------------------------------ */
/* 3D discography ring                                                 */
/* ------------------------------------------------------------------ */
(() => {
  const ring = $('.ring');
  const spin = $('.ring__spin');
  const items = $$('.ring__item');
  const n = items.length;
  const step = 360 / n;
  const place = () => {
    const w = spin.offsetWidth;
    const radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + w * 0.28;
    items.forEach((it, i) => (it.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
    spin.style.transformOrigin = `50% 50% 0`;
    return radius;
  };
  let radius = place();
  window.addEventListener('resize', () => (radius = place()));

  let rot = 0, vel = 0, dragging = false, lastX = 0, active = -1, moved = 0;
  const info = {
    year: $('.disco__year'), title: $('.disco__title'), label: $('.disco__label'), note: $('.disco__note'), play: $('.disco__play'),
  };
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    const a = albums[i];
    items.forEach((it, j) => it.classList.toggle('is-active', j === i));
    gsap.fromTo([info.year, info.title, info.label, info.note], { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.6, ease: 'expo.out' });
    info.year.textContent = a.date;
    info.title.textContent = a.title + (a.sub ? ` — ${a.sub}` : '');
    info.label.textContent = a.label;
    info.note.textContent = a.note || '';
    info.play.href = a.url;
  };

  ring.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; moved = 0; ring.setPointerCapture(e.pointerId); });
  ring.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    vel = dx * 0.25;
    rot += vel;
  });
  const end = () => (dragging = false);
  ring.addEventListener('pointerup', end);
  ring.addEventListener('pointercancel', end);
  ring.addEventListener('click', (e) => {
    if (moved > 6) return;
    const it = e.target.closest('.ring__item');
    if (!it) return;
    const i = +it.dataset.i;
    if (i === active) openAlbum(i);
    else {
      // rotate shortest way to item
      let target = -i * step;
      const cur = rot;
      target += Math.round((cur - target) / 360) * 360;
      gsap.to({ v: cur }, { v: target, duration: 1, ease: 'expo.out', onUpdate() { rot = this.targets()[0].v; } });
      vel = 0;
    }
  });

  let visible = false;
  ScrollTrigger.create({ trigger: ring, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });
  // scroll gives the ring a push
  lenis.on('scroll', ({ velocity }) => { if (visible && !dragging) vel += velocity * 0.008; });

  gsap.ticker.add(() => {
    if (!visible && !dragging) return; // no work while the ring is off screen
    if (!dragging) {
      vel *= 0.94;
      if (Math.abs(vel) < 0.02) {
        // snap to nearest
        const snap = Math.round(rot / step) * step;
        rot += (snap - rot) * 0.06 + (reduced ? 0 : 0);
      }
      rot += vel;
    }
    spin.style.transform = `translateZ(${-radius}px) rotateX(-6deg) rotateY(${rot}deg)`;
    const idx = ((Math.round(-rot / step) % n) + n) % n;
    setActive(idx);
  });
})();

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */
(() => {
  const lb = $('.lightbox');
  const img = $('img', lb);
  const cap = $('figcaption', lb);
  let idx = 0;
  const show = (i) => {
    idx = (i + gallery.length) % gallery.length;
    img.src = gallery[idx].src;
    img.alt = gallery[idx].caption;
    cap.textContent = gallery[idx].caption;
  };
  const open = (i) => { show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lenis.stop(); $('.lightbox__close').focus(); };
  const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lenis.start(); };
  $$('.shot').forEach((s) => s.addEventListener('click', () => open(+s.dataset.i)));
  $('.lightbox__close').addEventListener('click', close);
  $('.lightbox__prev').addEventListener('click', () => show(idx - 1));
  $('.lightbox__next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

/* ------------------------------------------------------------------ */
/* Video modal (YouTube facade — iframe only loads on click)           */
/* ------------------------------------------------------------------ */
(() => {
  const m = $('.vmodal');
  const frame = $('.vmodal__frame');
  const close = () => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); frame.innerHTML = ''; lenis.start(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.js-video');
    if (!b) return;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0" title="Music video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    lenis.stop();
    $('.vmodal__close').focus();
  });
  $('.vmodal__close').addEventListener('click', close);
  m.addEventListener('click', (e) => { if (e.target === m) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('is-open')) close(); });
})();

/* ------------------------------------------------------------------ */
/* Album drawer — listen inline, without leaving the site              */
/* ------------------------------------------------------------------ */
const drawer = $('.drawer');
function openAlbum(i) {
  const a = albums[i];
  const id = (a.url.match(/open\.spotify\.com\/album\/(\w+)/) || [])[1];
  $('.drawer__cover img').src = a.cover;
  $('.drawer__cover img').alt = a.title + ' cover';
  $('.drawer__year').textContent = a.date;
  $('.drawer__title').textContent = a.title + (a.sub ? ` — ${a.sub}` : '');
  $('.drawer__label').textContent = a.label;
  $('.drawer__note').textContent = a.note || '';
  $('.drawer__open').href = a.url;
  $('.drawer__open span').textContent = id ? 'Open in Spotify' : 'Listen everywhere';
  $('.drawer__embed').innerHTML = id
    ? `<iframe src="https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0" title="${a.title} on Spotify" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
    : '';
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  lenis.stop();
  gsap.fromTo('.drawer__panel > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.9, ease: 'expo.out', delay: 0.25 });
  $('.drawer__close').focus();
}
function closeAlbum() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => ($('.drawer__embed').innerHTML = ''), 600);
  lenis.start();
}
$('.drawer__close').addEventListener('click', closeAlbum);
$('.drawer__scrim').addEventListener('click', closeAlbum);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeAlbum(); });
$$('.card').forEach((c, i) =>
  c.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // keep "open in new tab"
    e.preventDefault();
    openAlbum(i);
  })
);
$('.disco__play').addEventListener('click', (e) => {
  if (e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  const i = albums.findIndex((a) => a.url === $('.disco__play').getAttribute('href'));
  openAlbum(i < 0 ? 0 : i);
});

/* ------------------------------------------------------------------ */
/* Now-playing dock — Spotify player, loaded only on first open        */
/* ------------------------------------------------------------------ */
(() => {
  const dock = $('.dock');
  const btn = $('.dock__btn');
  const embed = $('.dock__embed');
  btn.addEventListener('click', () => {
    const open = dock.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
    $('.dock__panel').setAttribute('aria-hidden', !open);
    if (open && !embed.firstChild) {
      embed.innerHTML = `<iframe src="https://open.spotify.com/embed/track/0gBpWtJ2q1aJ9i2ynzYd3X?utm_source=generator&theme=0" title="I Know What To Do on Spotify" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    }
  });
  ScrollTrigger.create({
    trigger: '.hero', start: 'bottom 80%',
    onEnter: () => dock.classList.add('is-visible'),
    onLeaveBack: () => { if (!dock.classList.contains('is-open')) dock.classList.remove('is-visible'); },
  });
})();

// store covers fan out as it scrolls in
gsap.fromTo('.store__covers img', { rotate: 0, xPercent: 0 }, {
  rotate: (i) => (i - 1) * 12, xPercent: (i) => (i - 1) * 55, ease: 'none',
  scrollTrigger: { trigger: '.store', start: 'top bottom', end: 'center center', scrub: 1 },
});

/* ------------------------------------------------------------------ */
/* On stage, prime time, Instagram                                     */
/* ------------------------------------------------------------------ */
const { rest } = renderTicket($('.stage__ticket'), { reduced });
$('.stage__next').innerHTML = rest.map((s, i) => showRow(s, i)).join('');
gsap.from('.stage .ticket', { y: 120, rotate: -4, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.stage', start: 'top 70%' } });
gsap.from('.stage .cd__unit', { y: 40, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.stage', start: 'top 60%' } });
gsap.fromTo('.stage__bg img', { yPercent: -12, scale: 1.15 }, { yPercent: 8, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.stage', start: 'top bottom', end: 'bottom top', scrub: true } });
gsap.to('.stage__word', { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '.stage', start: 'top bottom', end: 'bottom top', scrub: true } });
if (fine && !reduced) {
  const beam = $('.stage__beam');
  $('.stage').addEventListener('pointermove', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(beam, { '--bx': ((e.clientX - r.left) / r.width) * 100 + '%', '--by': ((e.clientY - r.top) / r.height) * 100 + '%', duration: 0.8, ease: 'power3', overwrite: true });
  });
}
initTV($('.tv__wrap'), { reduced });
gsap.from('.tv__set', { y: 80, rotateX: 12, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.tv', start: 'top 75%' } });
initIG($('.ig__track'));
gsap.from('.igp', { x: 120, opacity: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.ig', start: 'top 75%' } });

$$('[data-tilt]').forEach((el) => tilt(el, 12));
$$('.card').forEach((el) => tilt(el, 18));
magnetic();
reveals();
