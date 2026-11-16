import { $, $$, gsap, reveals } from './shell.js';
import { honours, grammys, albums, credits } from './data.js';

$('.honours').innerHTML = honours
  .map((h) => {
    const n = parseInt(h.big, 10);
    const big = Number.isNaN(n) ? h.big : `<span data-count="${n}" data-suffix="${h.big.replace(/^\d+/, '')}">0</span>`;
    return `<article class="hon"><span class="hon__big">${big}</span><span class="hon__label">${h.label}</span><p>${h.text}</p></article>`;
  })
  .join('');

$('.noms').innerHTML = grammys
  .map((g) => `<li class="nom"><span class="nom__yr">${g.year}</span><span class="nom__cat">${g.cat}<span class="nom__work">${g.work}</span></span><span class="nom__tag">Nominee</span></li>`)
  .join('');

// Billboard 200 peaks, earliest first. Bar length maps peak 1 → full, 200 → empty on a log scale.
const peaked = albums.filter((a) => a.peak).sort((a, b) => a.year - b.year);
$('.peaks').innerHTML = peaked
  .map((a) => {
    const w = 1 - Math.log(a.peak) / Math.log(200);
    return `<li class="peak${a.peak === 1 ? ' peak--top' : ''}"><img src="${a.cover}" alt="" loading="lazy" /><span class="peak__t">${a.title}<small>${a.year}</small></span><span class="peak__bar"><i style="transform:scaleX(${w.toFixed(3)})"></i></span><span class="peak__n">#${a.peak}</span></li>`;
  })
  .join('');

$('.credits').innerHTML = credits
  .map((c) => `<article class="credit"><small>${c.role}</small><b>${c.song}</b><span>${c.artist}</span></article>`)
  .join('');

gsap.from('.hon', { y: 60, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out', delay: 0.3 });
gsap.from('.nom', { x: -40, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.noms', start: 'top 85%' } });
$$('.peak__bar i').forEach((bar) => gsap.from(bar, { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: bar, start: 'top 92%' } }));
gsap.from('.credit', { y: 40, opacity: 0, stagger: 0.05, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.credits', start: 'top 85%' } });
reveals();
