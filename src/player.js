// 30-second Spotify preview player. One <audio> element for the whole site,
// a floating "now previewing" bar, and a queue so album previews play through.
const PREVIEW = 'https://p.scdn.co/mp3-preview/';
export const trackUrl = (id) => `https://open.spotify.com/track/${id}`;
export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function initPlayer() {
  const audio = new Audio();
  audio.preload = 'none';
  let queue = [];
  let idx = -1;
  const listeners = new Set();

  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="pbar" aria-live="polite" aria-hidden="true">
      <img class="pbar__cover" alt="" />
      <div class="pbar__txt"><small>Previewing · 30s clip</small><b class="pbar__title"></b><span class="pbar__by"></span></div>
      <button class="pbar__btn pbar__toggle" type="button" aria-label="Pause"><svg viewBox="0 0 36 36" class="pbar__ring"><circle cx="18" cy="18" r="16" /><circle class="pbar__arc" cx="18" cy="18" r="16" /></svg><i class="pbar__icon"></i></button>
      <button class="pbar__btn pbar__next" type="button" aria-label="Next preview">⏭</button>
      <a class="pbar__open" target="_blank" rel="noopener">Full song on Spotify ↗</a>
      <button class="pbar__close" type="button" aria-label="Close player">✕</button>
    </div>`
  );
  const bar = document.querySelector('.pbar');
  const q = (s) => bar.querySelector(s);
  const arc = q('.pbar__arc');

  const emit = () => listeners.forEach((fn) => fn(state()));
  const state = () => ({ track: queue[idx], playing: !audio.paused, progress: audio.duration ? audio.currentTime / audio.duration : 0 });

  function load(i) {
    idx = i;
    const t = queue[idx];
    if (!t) return;
    audio.src = PREVIEW + t.p;
    audio.play().catch(() => {});
    q('.pbar__cover').src = t.cover || '/img/single.webp';
    q('.pbar__title').textContent = t.t;
    q('.pbar__by').textContent = 'Robin Thicke' + (t.f ? ` · feat. ${t.f}` : '') + (t.album ? ` — ${t.album}` : '');
    q('.pbar__open').href = trackUrl(t.id);
    q('.pbar__next').hidden = idx >= queue.length - 1;
    bar.classList.add('is-on');
    bar.classList.remove('is-error');
    bar.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-pbar');
    emit();
  }

  audio.addEventListener('timeupdate', () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    arc.style.strokeDashoffset = 100.5 * (1 - p);
    emit();
  });
  audio.addEventListener('play', () => { bar.classList.add('is-playing'); q('.pbar__toggle').setAttribute('aria-label', 'Pause'); emit(); });
  audio.addEventListener('pause', () => { bar.classList.remove('is-playing'); q('.pbar__toggle').setAttribute('aria-label', 'Play'); emit(); });
  audio.addEventListener('ended', () => (idx < queue.length - 1 ? load(idx + 1) : emit()));
  audio.addEventListener('error', () => { bar.classList.add('is-error'); q('.pbar__by').textContent = 'Preview unavailable here — open it on Spotify'; emit(); });

  q('.pbar__toggle').addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  q('.pbar__next').addEventListener('click', () => load(idx + 1));
  q('.pbar__close').addEventListener('click', () => {
    audio.pause();
    bar.classList.remove('is-on');
    bar.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-pbar');
    idx = -1;
    emit();
  });

  return {
    /** Play `tracks[start]` and queue the rest. Clicking the current track toggles pause. */
    play(tracks, start = 0) {
      const t = tracks[start];
      if (queue[idx] && t && queue[idx].id === t.id) return audio.paused ? audio.play().catch(() => {}) : audio.pause();
      queue = tracks;
      load(start);
    },
    pause: () => audio.pause(),
    on: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    state,
  };
}
