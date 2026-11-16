// "On stage" ticket: the next show as a printed ticket with a rolling-digit countdown,
// an add-to-calendar file and the following dates. Used on the home and tour pages.
import gsap from 'gsap';
import { shows } from './data.js';

export const upcomingShows = () => shows.filter((s) => new Date(s.date + 'T23:59:00') > new Date());
export const fmtDay = (iso, o) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', o);

const digitCol = () => `<span class="roll"><span class="roll__col">${[...'0123456789'].map((d) => `<i>${d}</i>`).join('')}</span></span>`;
const unit = (k, label) => `<div class="cd__unit" data-u="${k}"><div class="cd__digits">${digitCol()}${digitCol()}</div><span>${label}</span></div>`;

function icsHref(s) {
  const d = s.date.replace(/-/g, '');
  const next = new Date(new Date(s.date + 'T12:00:00').getTime() + 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Robin Thicke//Live//EN', 'BEGIN:VEVENT', `UID:${d}-rt@robinthicke`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`, `SUMMARY:Robin Thicke — ${s.event}`, `LOCATION:${s.venue}, ${s.city}`, `URL:${s.url}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}

export function renderTicket(el, { reduced = false } = {}) {
  const [s, ...rest] = upcomingShows();
  if (!s) {
    el.innerHTML = `<div class="ticket ticket--empty"><div class="ticket__main"><p class="ticket__kicker">No public dates right now</p><h3 class="ticket__event">New shows land on Instagram first.</h3><button class="btn btn--gold" data-marvin="booking" type="button"><span>Book a private show</span><b>→</b></button></div></div>`;
    return { rest: [] };
  }
  const month = fmtDay(s.date, { month: 'short' }).toUpperCase();
  const dnum = fmtDay(s.date, { day: '2-digit' });
  const wk = fmtDay(s.date, { weekday: 'long' });
  const serial = s.date.replace(/-/g, '').slice(2) + '-' + s.city.slice(0, 3).toUpperCase();
  el.innerHTML = `
  <article class="ticket" data-tilt>
    <div class="ticket__main">
      <div class="ticket__photo" style="background-image:url(${s.img})"></div>
      <div class="ticket__body">
        <p class="ticket__kicker"><span class="dot"></span>Next show · Admit one</p>
        <h3 class="ticket__event">${s.event}</h3>
        <p class="ticket__where"><b>${s.city}</b> — ${s.venue}</p>
        <div class="cd" aria-label="Countdown">${unit('d', 'Days')}${unit('h', 'Hrs')}${unit('m', 'Min')}${unit('s', 'Sec')}</div>
        <p class="cd__label">${s.atLabel || 'to go'}</p>
        <div class="ticket__ctas">
          <a class="btn btn--gold" href="${s.url}" target="_blank" rel="noopener" data-magnetic data-cursor="Tickets"><span>Get tickets</span><b>↗</b></a>
          <a class="ticket__cal" href="${icsHref(s)}" download="robin-thicke-${s.date}.ics">+ Add to calendar</a>
        </div>
      </div>
    </div>
    <div class="ticket__stub" aria-hidden="true">
      <span class="ticket__month">${month}</span>
      <span class="ticket__day">${dnum}</span>
      <span class="ticket__wk">${wk}</span>
      <span class="ticket__code"></span>
      <span class="ticket__serial">№ ${serial}</span>
    </div>
    <span class="glare"></span>
  </article>`;

  // barcode
  const code = el.querySelector('.ticket__code');
  code.innerHTML = [...serial.repeat(3)].map((c, i) => `<i style="width:${1 + ((c.charCodeAt(0) + i) % 4)}px"></i>`).join('');

  const target = new Date(s.at || s.date + 'T20:00:00').getTime();
  const units = Object.fromEntries([...el.querySelectorAll('.cd__unit')].map((u) => [u.dataset.u, [...u.querySelectorAll('.roll__col')]]));
  const set = (cols, str) => cols.forEach((c, i) => {
    const v = +str[i];
    if (c._v === v) return;
    c._v = v;
    if (reduced) c.style.transform = `translateY(${-v * 10}%)`;
    else gsap.to(c, { yPercent: -v * 10, duration: 0.7, ease: 'expo.out' });
  });
  const tick = () => {
    let t = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(t / 86400); t %= 86400;
    set(units.d, String(Math.min(d, 99)).padStart(2, '0'));
    set(units.h, String(Math.floor(t / 3600)).padStart(2, '0'));
    set(units.m, String(Math.floor((t % 3600) / 60)).padStart(2, '0'));
    set(units.s, String(t % 60).padStart(2, '0'));
  };
  tick();
  setInterval(tick, 1000);
  return { show: s, rest };
}

export function showRow(s, i = 0) {
  return `<li class="gig"><a href="${s.url || '#'}" ${s.url ? 'target="_blank" rel="noopener"' : ''}>
    <span class="gig__n">${String(i + 2).padStart(2, '0')}</span>
    <span class="gig__date">${fmtDay(s.date, { month: 'short', day: '2-digit' })}<small>${fmtDay(s.date, { weekday: 'short', year: 'numeric' })}</small></span>
    <span class="gig__city">${s.city}<small>${s.venue}</small></span>
    <span class="gig__event">${s.event}</span>
    <span class="gig__btn">${s.status || 'Info'} ↗</span>
  </a></li>`;
}
