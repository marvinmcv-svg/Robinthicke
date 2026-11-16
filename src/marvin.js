// Marvin, the AI receptionist. Talks to /api/marvin (Claude) when the site is deployed
// with an API key; otherwise answers from the site's own data with a local intent engine.
import gsap from 'gsap';
import { marvinSVG } from './marvin-art.js';
import { shows, pastShows, albums, single, links, honours, grammys, tv } from './data.js';
import { tracklists } from './data/tracks.js';
import { fmtTime } from './player.js';

const BOOKING_EMAIL = 'RobinThickeInfo@rocnation.com';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const day = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const upcoming = () => shows.filter((s) => new Date(s.date + 'T23:59:00') > new Date());
const allTracks = Object.entries(tracklists).flatMap(([key, l]) => {
  const a = albums.find((x) => x.key === key);
  return l.tracks.map((t) => ({ ...t, album: a.title + (a.sub ? ` (${a.sub})` : ''), cover: a.cover }));
});
const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ */
/* Local brain                                                         */
/* ------------------------------------------------------------------ */
const chips = {
  start: ['Next show', 'Book Robin', 'New music', 'Play Blurred Lines', 'Merch'],
  after: ['Next show', 'Book Robin', 'Achievements', 'Instagram'],
};

function findTrack(text) {
  const n = ' ' + norm(text) + ' ';
  let best = null;
  for (const t of allTracks) {
    const name = norm(t.t.replace(/ - .*$/, ''));
    if (name.length > 2 && n.includes(' ' + name + ' ') && (!best || name.length > norm(best.t).length)) best = t;
  }
  return best;
}

function localReply(text, ctx) {
  const n = norm(text);
  const has = (...w) => w.some((x) => new RegExp(`\\b${x}`).test(n));

  // booking flow in progress
  if (ctx.booking) return bookingStep(text, ctx);

  if (has('hi', 'hey', 'hello', 'yo', 'sup', 'good (morning|evening|afternoon)') && n.split(' ').length < 5)
    return { text: 'Hey, welcome in. I’m Marvin — I run the front desk for Robin. Tour dates, music, bookings, merch: what can I get you?', chips: chips.start };

  if (has('book', 'hire', 'private', 'wedding', 'corporate', 'perform at', 'event', 'gig', 'fee', 'price', 'cost', 'quote')) {
    ctx.booking = { step: 'name' };
    return { text: `Love that. Bookings go through Robin’s team at Roc Nation. I’ll take the details and hand you a ready-to-send email.<br><br>First — what’s your name?`, chips: ['Cancel'] };
  }

  const track = findTrack(text);
  if (track && (has('play', 'listen', 'hear', 'preview', 'song', 'track') || n.length < 30))
    return {
      text: `“${esc(track.t)}” — from <i>${esc(track.album)}</i>${track.f ? `, with ${esc(track.f)}` : ''}. ${fmtTime(track.d)} long. Here’s the 30-second preview:`,
      actions: [{ label: '▶ Play preview', play: track }, { label: 'Open on Spotify ↗', href: `https://open.spotify.com/track/${track.id}` }],
      chips: chips.after,
    };

  if (has('past', 'previous', 'last show', 'played'))
    return { text: 'Recent stages: ' + pastShows.slice(0, 5).map((s) => `${esc(s.event)} — ${esc(s.city)} (${day(s.date)})`).join('; ') + '.', actions: [{ label: 'Full show archive', href: '/tour/#archive' }], chips: chips.after };
  if (has('tour', 'show', 'concert', 'live', 'ticket', 'next', 'date', 'vegas', 'new year', 'perform', 'see him', 'cathedral')) {
    const up = upcoming();
    if (!up.length) return { text: 'No public dates on the books right now — new ones are announced on Instagram first. Want me to take a private booking instead?', chips: ['Book Robin', 'Instagram'] };
    const [nx, ...rest] = up;
    const days = Math.ceil((new Date(nx.date + 'T12:00:00') - Date.now()) / 864e5);
    return {
      text: `Next up: <b>${esc(nx.event)}</b> — ${esc(nx.venue)}, ${esc(nx.city)} on <b>${day(nx.date)}</b>${days > 0 ? ` (that’s ${days} day${days === 1 ? '' : 's'} away)` : ''}.` +
        (rest.length ? `<br><br>After that: ${rest.map((s) => `${esc(s.event)} in ${esc(s.city)}, ${day(s.date)}`).join('; ')}.` : ''),
      actions: [{ label: 'Get tickets ↗', href: nx.url }, { label: 'All tour dates', href: '/tour/' }],
      chips: ['Book Robin', 'Past shows', 'New music'],
    };
  }

  if (has('new', 'latest', 'single', 'ikwtd', 'i know what', 'dreamdoll'))
    return {
      text: `The latest is <b>“${single.title}” (${single.short})</b> with ${single.feat}. It’s on every platform, and the video’s on YouTube.`,
      actions: [{ label: 'Spotify ↗', href: single.services[0].url }, { label: 'Watch the video ↗', href: `https://www.youtube.com/watch?v=${single.youtubeId}` }],
      chips: ['Play Blurred Lines', 'Albums', 'Next show'],
    };
  if (has('album', 'discograph', 'record', 'music', 'songs', 'spotify', 'stream', 'listen', 'vinyl'))
    return {
      text: `Nine records deep. Most recent: <i>${esc(albums[0].title)} — ${esc(albums[0].sub)}</i> (2023) and <i>${esc(albums[1].title)}</i> (2021). <i>Blurred Lines</i> went No. 1 on the Billboard 200. Every track on the Music page has a preview you can play right there.`,
      actions: [{ label: 'Browse the records', href: '/music/' }, { label: 'Spotify ↗', href: links.spotify }],
      chips: ['Play Lost Without U', 'Play Lola Mia', 'Next show'],
    };
  if (has('grammy', 'award', 'achiev', 'diamond', 'chart', 'record', 'billboard', 'number one', 'no 1'))
    return {
      text: `Highlights: five-time GRAMMY® nominee (${grammys.map((g) => g.cat).join(', ')} at the 56th GRAMMYs), “Blurred Lines” went RIAA Diamond and spent 12 weeks at No. 1, and he won ${honours[3].big} Billboard Music Awards in 2014.`,
      actions: [{ label: 'See all achievements', href: '/achievements/' }],
      chips: chips.after,
    };
  if (has('masked', 'name that tune', 'tv', 'television', 'fox', 'show on'))
    return { text: tv.map((s) => `<b>${esc(s.title)}</b> — ${esc(s.role)}, ${esc(s.since)}. ${esc(s.text)}`).join('<br><br>'), chips: chips.after };
  if (has('merch', 'store', 'shop', 'shirt', 'tee', 'hoodie', 'buy'))
    return { text: 'Official store has vinyl, apparel and collectibles, shipped worldwide.', actions: [{ label: 'Open the store ↗', href: links.store }], chips: chips.after };
  if (has('instagram', 'insta', 'ig', 'social', 'tiktok', 'follow', 'youtube', 'facebook'))
    return { text: 'Robin posts most on Instagram (@robinthicke) — tour clips, family, studio. Also on TikTok (@thicketok) and YouTube.', actions: [{ label: 'Instagram ↗', href: links.instagram }, { label: 'TikTok ↗', href: links.tiktok }, { label: 'YouTube ↗', href: links.youtube }], chips: chips.after };
  if (has('who', 'about', 'bio', 'born', 'age', 'story', 'father', 'dad', 'family', 'piano'))
    return { text: 'Robin Alan Thicke, born in Los Angeles in 1977 — son of Alan Thicke and Gloria Loring. Taught himself piano at 12, was writing for R&B acts at 16, and had songs on 20+ gold and platinum albums before he stepped out as an artist.', actions: [{ label: 'Read the story', href: '/story/' }], chips: chips.after };
  if (has('press', 'interview', 'media', 'manager', 'management', 'contact', 'email', 'label'))
    return { text: `For press, management and bookings, the address is <a href="mailto:${BOOKING_EMAIL}">${BOOKING_EMAIL}</a> (Roc Nation). Want me to draft the email for you?`, chips: ['Book Robin', 'Next show'] };
  if (has('thank', 'thanks', 'cheers', 'appreciate'))
    return { text: 'Anytime. I’ll be right here at the desk.', chips: chips.after };
  if (has('marvin', 'are you', 'robot', 'ai\\b', 'real'))
    return { text: 'I’m Marvin, the site’s AI receptionist — not Robin, and not a person. I know the dates, the records and how to reach the team.', chips: chips.start };
  if (has('cancel'))
    return { text: 'No problem. Anything else?', chips: chips.start };

  return { text: 'I might not have that one at the desk. I can help with <b>tour dates</b>, <b>bookings</b>, <b>music and previews</b>, <b>achievements</b>, <b>merch</b> and <b>socials</b>.', chips: chips.start };
}

function bookingStep(text, ctx) {
  const b = ctx.booking;
  if (/^\s*cancel\s*$/i.test(text)) { ctx.booking = null; return { text: 'Cancelled — nothing sent. Anything else?', chips: chips.start }; }
  if (b.step === 'name') { b.name = text.trim().slice(0, 80); b.step = 'email'; return { text: `Nice to meet you, ${esc(b.name)}. Best email for the team to reply to?`, chips: ['Cancel'] }; }
  if (b.step === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) return { text: 'That doesn’t look like an email — try again?', chips: ['Cancel'] };
    b.email = text.trim(); b.step = 'event';
    return { text: 'What’s the event? Type, date, city and rough audience size is perfect.', chips: ['Cancel'] };
  }
  if (b.step === 'event') {
    b.event = text.trim().slice(0, 800); ctx.booking = null;
    const subject = `Booking inquiry — ${b.name}`;
    const body = `Hi team,\n\nI'd like to inquire about booking Robin Thicke.\n\nName: ${b.name}\nEmail: ${b.email}\nEvent: ${b.event}\n\n(Sent via Marvin on the official site)`;
    return {
      text: `Got it. Here’s your inquiry, ready to send to <b>${BOOKING_EMAIL}</b>:<blockquote>${esc(b.event)}</blockquote>Hit send and the team will come back to you at ${esc(b.email)}.`,
      actions: [{ label: 'Open email draft ✉', href: `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` }],
      chips: ['Next show', 'New music'],
    };
  }
}

/* ------------------------------------------------------------------ */
/* UI                                                                  */
/* ------------------------------------------------------------------ */
export function initMarvin({ player, lenis }) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="marvin" role="dialog" aria-label="Marvin, AI receptionist" aria-hidden="true" data-lenis-prevent>
      <header class="marvin__head">
        <div class="marvin__portrait">${marvinSVG('panel')}</div>
        <div><b>Marvin</b><small><span class="marvin__live"></span>AI receptionist · Robin Thicke HQ</small></div>
        <button class="marvin__close" type="button" aria-label="Close chat">✕</button>
      </header>
      <div class="marvin__log" aria-live="polite"></div>
      <div class="marvin__chips"></div>
      <form class="marvin__form"><input name="q" autocomplete="off" placeholder="Ask about dates, bookings, songs…" aria-label="Message Marvin" maxlength="600" /><button type="submit" aria-label="Send">↑</button></form>
      <p class="marvin__fine">Marvin is an AI and can make mistakes. Bookings are confirmed by Robin’s team only.</p>
    </div>`
  );
  const el = document.querySelector('.marvin');
  const log = el.querySelector('.marvin__log');
  const chipBox = el.querySelector('.marvin__chips');
  const form = el.querySelector('form');
  const input = form.q;
  const ctx = { booking: null };
  const history = [];
  let remote = true;

  const scroll = () => (log.scrollTop = log.scrollHeight);
  function bubble(who, html) {
    const b = document.createElement('div');
    b.className = `msg msg--${who}`;
    b.innerHTML = html;
    log.append(b);
    gsap.from(b, { y: 14, opacity: 0, duration: 0.5, ease: 'expo.out' });
    scroll();
    return b;
  }
  function renderReply(r) {
    const b = bubble('m', r.text);
    if (r.actions?.length) {
      const row = document.createElement('div');
      row.className = 'msg__actions';
      r.actions.forEach((a) => {
        const x = document.createElement(a.href ? 'a' : 'button');
        x.textContent = a.label;
        if (a.href) { x.href = a.href; if (/^https?:/.test(a.href)) { x.target = '_blank'; x.rel = 'noopener'; } }
        else x.addEventListener('click', () => player.play([a.play]));
        row.append(x);
      });
      b.append(row);
    }
    setChips(r.chips || chips.after);
    scroll();
  }
  function setChips(list) {
    chipBox.innerHTML = list.map((c) => `<button type="button">${esc(c)}</button>`).join('');
  }
  chipBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) send(b.textContent); });

  async function think(text) {
    el.classList.add('is-typing');
    const dots = bubble('m msg--dots', '<i></i><i></i><i></i>');
    let reply;
    // Bookings and track previews stay local so the email draft and the player work the same everywhere.
    if (remote && !ctx.booking && !/\b(book|hire|private|wedding|corporate)\b/i.test(text) && !findTrack(text)) {
      try {
        const r = await fetch('/api/marvin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) });
        if (!r.ok) throw new Error(r.status);
        const j = await r.json();
        if (j.reply) reply = { text: esc(j.reply).replace(/\n/g, '<br>'), chips: chips.after };
      } catch { remote = false; }
    }
    if (!reply) { await new Promise((r) => setTimeout(r, 450 + Math.random() * 400)); reply = localReply(text, ctx); }
    dots.remove();
    el.classList.remove('is-typing');
    history.push({ role: 'assistant', content: reply.text.replace(/<[^>]+>/g, '') });
    renderReply(reply);
  }
  function send(text) {
    text = text.trim();
    if (!text) return;
    bubble('u', esc(text));
    history.push({ role: 'user', content: text });
    input.value = '';
    think(text);
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });

  let greeted = false;
  const api = {
    open(intent) {
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('marvin-open');
      if (!greeted) {
        greeted = true;
        const up = upcoming()[0];
        renderReply({ text: `Hey — I’m <b>Marvin</b>, Robin’s AI receptionist. ${up ? `Robin’s next on stage <b>${day(up.date)}</b> in ${esc(up.city)}. ` : ''}What can I help with?`, chips: chips.start });
      }
      if (intent === 'booking') send('I want to book Robin');
      else if (intent === 'tour') send('When is the next show?');
      setTimeout(() => input.focus({ preventScroll: true }), 300);
    },
    close() {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('marvin-open');
    },
  };
  el.querySelector('.marvin__close').addEventListener('click', api.close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('is-open')) api.close(); });
  return api;
}
