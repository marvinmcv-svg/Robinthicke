import { $, gsap, reduced, tilt, reveals, magnetic } from './shell.js';
import { pastShows } from './data.js';
import { renderTicket, showRow, fmtDay } from './live.js';
import { marvinSVG } from './marvin-art.js';

const { rest } = renderTicket($('.tour__ticket'), { reduced });
$('.gigs').innerHTML = rest.length ? rest.map((s, i) => showRow(s, i)).join('') : '<li class="gig"><p style="padding:1rem 0;color:var(--mute)">That’s everything announced so far.</p></li>';
$('.tour__ticket [data-tilt]') && tilt($('.tour__ticket [data-tilt]'), 8);

const byYear = pastShows.reduce((m, s) => ((m[s.date.slice(0, 4)] ||= []).push(s), m), {});
$('.archives').innerHTML = Object.keys(byYear)
  .sort((a, b) => b - a)
  .map((y) => `<div class="archive"><span class="archive__year">${y}</span><ul>${byYear[y]
    .map((s) => `<li><time datetime="${s.date}">${fmtDay(s.date, { month: 'short', day: 'numeric' })}</time><b>${s.event}</b><span>${s.venue} · ${s.city}</span></li>`)
    .join('')}</ul></div>`)
  .join('');

$('.booking__face').innerHTML = marvinSVG('book');

gsap.from('.tour__ticket .ticket', { y: 100, rotate: -3, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.5 });
gsap.from('.archive li', { y: 30, opacity: 0, stagger: 0.05, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.archives', start: 'top 85%' } });
reveals();
magnetic();
