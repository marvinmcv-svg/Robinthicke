import { $, $$, gsap, reduced, player, reveals, magnetic } from './shell.js';
import { albums, single } from './data.js';
import { tracklists } from './data/tracks.js';
import { fmtTime, trackUrl } from './player.js';

const withMeta = (a) => (tracklists[a.key]?.tracks || []).map((t) => ({ ...t, album: a.title, cover: a.cover }));

/* Singles */
const blurredLines = withMeta(albums.find((a) => a.key === 'blurred'))[0];
$('.singles').innerHTML = `
  <article class="sgl">
    <img src="${single.cover}" alt="${single.title} cover" />
    <div><h3>${single.title}</h3><p>Robin Thicke × ${single.feat} · ${single.short}</p>
      <div class="sgl__links">${single.services.slice(0, 4).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name} ↗</a>`).join('')}<a href="https://www.youtube.com/watch?v=${single.youtubeId}" target="_blank" rel="noopener">Video ↗</a></div>
    </div>
  </article>
  <article class="sgl">
    <img src="/img/yt-brown.webp" alt="Brown Liquor video still" style="object-position:center" />
    <div><h3>Brown Liquor</h3><p>Robin Thicke &amp; Yo Gotti</p>
      <div class="sgl__links"><a href="https://www.youtube.com/watch?v=pVshjFv1e44" target="_blank" rel="noopener">Watch the video ↗</a></div>
    </div>
  </article>
  <article class="sgl">
    <img src="/img/albums/blurred.webp" alt="Blurred Lines cover" />
    <div><h3>Blurred Lines</h3><p>feat. T.I. &amp; Pharrell · Diamond · 12 weeks at No. 1</p>
      <div class="sgl__links"><button type="button" class="js-bl">▶ Preview</button><a href="${trackUrl(blurredLines.id)}" target="_blank" rel="noopener">Spotify ↗</a></div>
    </div>
  </article>`;
$('.js-bl').addEventListener('click', () => player.play([blurredLines]));

/* Albums */
const spotifyAlbumId = (a) => tracklists[a.key]?.spotifyId || (a.url.match(/open\.spotify\.com\/album\/(\w+)/) || [])[1];
$('.recs').innerHTML = albums
  .map((a, i) => {
    const tracks = tracklists[a.key]?.tracks;
    const sp = spotifyAlbumId(a);
    const mins = tracks ? Math.round(tracks.reduce((n, t) => n + t.d, 0) / 60) : 0;
    return `<article class="rec" id="${a.key}">
      <button class="rec__row" type="button" aria-expanded="false" aria-controls="p-${a.key}">
        <span class="rec__cover"><img src="${a.cover}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" /></span>
        <span>
          <span class="rec__year">${a.date}</span>
          <span class="rec__title">${a.title}${a.sub ? `<small>${a.sub}</small>` : ''}</span>
          <span class="rec__chips">
            ${a.peak ? `<span class="chip${a.peak === 1 ? ' chip--gold' : ''}">#${a.peak} Billboard 200</span>` : ''}
            ${tracks ? `<span class="chip">${tracks.length} tracks · ${mins} min</span>` : ''}
            <span class="chip">${a.label}</span>
          </span>
        </span>
        <span class="rec__toggle" aria-hidden="true">+</span>
      </button>
      <div class="rec__panel" id="p-${a.key}"><div class="rec__inner"><div class="rec__body">
        <div class="rec__side">
          ${a.note ? `<p>${a.note}</p>` : ''}
          ${tracks ? `<button class="rec__playall" type="button" data-key="${a.key}">▶ Play previews</button>` : ''}
          ${sp ? `<a class="rec__sp" href="https://open.spotify.com/album/${sp}" target="_blank" rel="noopener">Full album on Spotify ↗</a>` : ''}
        </div>
        ${tracks
          ? `<ol class="trks">${tracks.map((t, n) => `<li class="trk" data-id="${t.id}">
              <button class="trk__play" type="button" data-key="${a.key}" data-n="${n + 1}" aria-label="Preview ${t.t.replace(/"/g, '')}"></button>
              <span class="trk__t"><b>${t.t}</b>${t.e ? '<span class="trk__e" title="Explicit">E</span>' : ''}${t.f ? `<small>feat. ${t.f}</small>` : ''}</span>
              <span class="trk__d">${fmtTime(t.d)}</span>
              <a class="trk__sp" href="${trackUrl(t.id)}" target="_blank" rel="noopener" aria-label="Open ${t.t.replace(/"/g, '')} on Spotify">Spotify ↗</a>
              <span class="trk__bar"><i></i></span>
            </li>`).join('')}</ol>`
          : `<div class="rec__embed" data-sp="${sp}"></div>`}
      </div></div></div>
    </article>`;
  })
  .join('');

function toggle(rec, open = !rec.classList.contains('is-open')) {
  rec.classList.toggle('is-open', open);
  $('.rec__row', rec).setAttribute('aria-expanded', open);
  const embed = $('.rec__embed', rec);
  if (open && embed && !embed.firstChild && embed.dataset.sp)
    embed.innerHTML = `<iframe src="https://open.spotify.com/embed/album/${embed.dataset.sp}?utm_source=generator&theme=0" title="Album on Spotify — tap any track for a preview" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
  if (open && !reduced) gsap.from($$('.trk, .rec__side > *, .rec__embed', rec), { y: 16, opacity: 0, stagger: 0.025, duration: 0.7, ease: 'expo.out', delay: 0.1 });
}
$$('.rec').forEach((rec) => $('.rec__row', rec).addEventListener('click', () => toggle(rec)));
const deep = location.hash && $(`.rec${location.hash}`);
toggle(deep || $('.rec'), true);

document.addEventListener('click', (e) => {
  const b = e.target.closest('.trk__play, .rec__playall');
  if (!b) return;
  const a = albums.find((x) => x.key === b.dataset.key);
  player.play(withMeta(a), b.classList.contains('trk__play') ? +b.dataset.n - 1 : 0);
});

// Reflect the player in the track rows
player.on(({ track, playing, progress }) => {
  $$('.trk').forEach((row) => {
    const on = !!track && row.dataset.id === track.id;
    row.classList.toggle('is-current', on);
    row.classList.toggle('is-playing', on && playing);
    if (on) $('.trk__bar i', row).style.transform = `scaleX(${progress})`;
  });
});

gsap.from('.rec', { y: 60, opacity: 0, stagger: 0.06, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.recs', start: 'top 85%' } });
gsap.from('.sgl', { y: 60, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.singles', start: 'top 88%' } });
reveals();
magnetic();
