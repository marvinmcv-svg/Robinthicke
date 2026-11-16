# Robin Thicke — Official Site

A multi-page, image-led artist site with a WebGL hero, 30-second Spotify previews for every track, a live countdown ticket, and Marvin, an AI receptionist.

## Pages
| Path | What's there |
| --- | --- |
| `/` | Hero slideshow, new single, 3D discography ring, On Stage ticket + countdown, Prime Time (TV), real Instagram feed |
| `/music/` | Every album with its tracklist. ▶ plays a 30s preview in the site player; ↗ opens the track on Spotify |
| `/tour/` | Next show as a ticket (countdown, add-to-calendar), upcoming dates, past-show archive, booking |
| `/achievements/` | GRAMMY nominations, certifications, Billboard 200 peaks, songwriting credits |
| `/story/` | Bio, the pinned "eight frames" timeline, quote |

## Marvin, the AI receptionist
The chat in the bottom-right of every page (`src/marvin.js`, art in `src/marvin-art.js`).
- **Without setup** he answers from the site's own data: tour dates, songs (and plays their previews), bookings, merch, socials, achievements. Bookings end in a ready-to-send email draft to Roc Nation.
- **With Claude:** deploy to Vercel and set `ANTHROPIC_API_KEY` in the project's environment variables. `api/marvin.js` then answers free-form questions, grounded in `src/data.js`. If the key is missing or the API fails, the browser falls back to the local engine automatically.

## Stack
- [Vite](https://vitejs.dev) multi-page build, vanilla ES modules
- [Three.js](https://threejs.org) for the hero shader, [GSAP](https://gsap.com) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering)
- `@anthropic-ai/sdk` in the one serverless function (`api/marvin.js`)

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## Content
All copy, dates and links come from the artist's public channels and reference sources: robinthicke.com, the Linkfire link-in-bio, Instagram, Spotify, Bandsintown, the Roc Nation bio and Wikipedia.
- `src/data.js`: albums, shows (`shows` / `pastShows`), Instagram posts, achievements, TV
- `src/data/tracks.js`: track lists with Spotify track IDs and preview clips, read from Spotify's album embeds. Five albums have full lists; the rest open Spotify's own player.
- Instagram thumbnails load live from Instagram's official post embeds, so they're always the real posts. To add a post, append its shortcode to `posts`.
- `public/img/face.webp`: the nav logo thumbnail.

## Accessibility & performance
- Respects `prefers-reduced-motion`: no WebGL hero, no smooth scroll, no looping animations, no page curtain.
- YouTube, Spotify and Instagram embeds load only when needed.
- Marvin's code loads on first open.
