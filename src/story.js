import { $, $$, gsap, reveals } from './shell.js';
import { timeline } from './data.js';

$('.timeline__track').innerHTML = timeline
  .map((t) => `<article class="frame"><div class="frame__img"><img src="${t.img}" alt="" loading="lazy" /><span class="frame__year">${t.year}</span></div><h3>${t.title}</h3><p>${t.text}</p></article>`)
  .join('');

// word-by-word quote reveal
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

// horizontal pinned timeline on desktop, stacked on mobile
const track = $('.timeline__track');
const mm = gsap.matchMedia();
mm.add('(min-width: 961px)', () => {
  const dist = () => track.scrollWidth - window.innerWidth;
  const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
  $$('.frame').forEach((f) => {
    gsap.fromTo($('img', f), { scale: 1.35, xPercent: -8 }, { scale: 1.15, xPercent: 8, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
  });
});
mm.add('(max-width: 960px)', () => {
  track.style.width = 'auto';
  track.style.flexDirection = 'column';
  $$('.frame').forEach((f) => { f.style.width = '100%'; gsap.from(f, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 85%' } }); });
});
gsap.from('.story-bio p, .story-bio figure', { y: 50, opacity: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', delay: 0.4 });
reveals();
