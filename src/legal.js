import { $, reveals } from './shell.js';
import { photoCredits } from './data/story.js';

const list = $('[data-photo-credits]');
if (list)
  list.innerHTML = photoCredits
    .map((c) => `<li><b>${c.chapter}</b> (${c.date}) — Photo by ${c.author}, <a href="${c.licenseUrl}" target="_blank" rel="noopener license">${c.license}</a>, via <a href="${c.source}" target="_blank" rel="noopener">Wikimedia Commons</a></li>`)
    .join('');

reveals();
