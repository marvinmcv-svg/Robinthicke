import { $, $$, gsap, ScrollTrigger, reduced, reveals } from './shell.js';
import { chapters } from './data/story.js';

const imgTag = (im, extra = '') =>
  `<img src="${im.src}" alt="${im.caption.replace(/"/g, '')}" style="object-position:${im.pos || '50% 50%'}" ${im.fallback ? `data-fallback="${im.fallback}"` : ''} loading="lazy" ${extra} />`;
const creditHTML = (c) => (c ? `Photo: ${c.author} · <a href="${c.licenseUrl}" target="_blank" rel="noopener license">${c.license}</a> · <a href="${c.source}" target="_blank" rel="noopener">Wikimedia Commons</a>` : '');

// Commons images load straight from Wikimedia; fall back to a local image if one is ever unavailable.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.fallback && img.src !== location.origin + img.dataset.fallback) img.src = img.dataset.fallback;
}, true);

/* Hero fan: two era photos from the chapters */
const fanSrc = [chapters.find((c) => c.year === '2007').img, chapters.find((c) => c.year === '2013').img];
$$('.shero__card img[data-era]').forEach((img) => {
  const im = fanSrc[+img.dataset.era];
  img.src = im.src;
  img.dataset.fallback = im.fallback;
  img.style.objectPosition = im.pos;
});
if (!reduced) {
  gsap.from('.shero__card', { y: 120, rotate: 0, opacity: 0, stagger: 0.12, duration: 1.6, ease: 'expo.out', delay: 0.5 });
  gsap.from('.shero__title > *, .shero__years, .shero__copy .phead__lede', { y: 60, opacity: 0, stagger: 0.08, duration: 1.4, ease: 'expo.out', delay: 0.3 });
  gsap.to('.shero__fan', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.shero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* Chapters */
$('.chap__imgs').innerHTML = chapters.map((c, i) => `<div class="chap__img${c.img.square ? ' is-square' : ''}" data-i="${i}">${imgTag(c.img, i < 2 ? 'loading="eager"' : '')}</div>`).join('');
$('.chap__dots').innerHTML = chapters.map((c) => `<li><span>${c.year}</span></li>`).join('');
$('.chap__list').innerHTML = chapters
  .map((c, i) => `<li class="chap__item" data-i="${i}">
      <span class="chap__n">${String(i + 1).padStart(2, '0')} / ${chapters.length}</span>
      <span class="chap__era">${c.era}</span>
      <h2 class="chap__title"><span class="chap__y">${c.year}</span>${c.title}</h2>
      <p class="chap__text">${c.text}</p>
      <figure class="chap__mobile">${imgTag(c.img)}<figcaption>${c.img.caption}${c.img.credit ? `<br/><small>${creditHTML(c.img.credit)}</small>` : ''}</figcaption></figure>
    </li>`)
  .join('');

const imgs = $$('.chap__img');
const dots = $$('.chap__dots li');
const items = $$('.chap__item');
const yearEl = $('.chap__year');
let active = -1;
function setActive(i) {
  if (i === active) return;
  const prev = active;
  active = i;
  const c = chapters[i];
  items.forEach((el, j) => el.classList.toggle('is-active', j === i));
  dots.forEach((el, j) => { el.classList.toggle('is-active', j === i); el.classList.toggle('is-past', j < i); });
  $('.chap__caption').textContent = c.img.caption;
  $('.chap__credit').innerHTML = creditHTML(c.img.credit);
  imgs.forEach((el, j) => el.classList.toggle('is-on', j === i));
  if (reduced) { yearEl.textContent = c.year; return; }
  const down = i > prev;
  gsap.fromTo(imgs[i], { clipPath: down ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.inOut', overwrite: true });
  gsap.fromTo($('img', imgs[i]), { scale: 1.25 }, { scale: 1.04, duration: 1.6, ease: 'expo.out', overwrite: true });
  gsap.to(yearEl, {
    yPercent: down ? -60 : 60, opacity: 0, duration: 0.3, ease: 'power2.in', overwrite: true,
    onComplete: () => { yearEl.textContent = c.year; gsap.fromTo(yearEl, { yPercent: down ? 60 : -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }); },
  });
}
items.forEach((el, i) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setActive(i) }));
setActive(0);
dots.forEach((d, i) => d.addEventListener('click', () => items[i].scrollIntoView({ behavior: 'smooth', block: 'center' })));

/* Quote */
$$('.words').forEach((el) => {
  const walk = (node) => [...node.childNodes].forEach((n) => {
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
  walk(el);
  gsap.to($$('.w', el), { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
});

gsap.from('.snext__card', { y: 60, opacity: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.snext', start: 'top 85%' } });
reveals();
