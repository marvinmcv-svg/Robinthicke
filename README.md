# Robin Thicke — Official Site

A single-page, image-led artist site: a WebGL hero, a 3D discography ring, a pinned horizontal timeline, a parallax photo gallery with a lightbox, and video, live and Instagram sections.

## Stack
- [Vite](https://vitejs.dev) with vanilla ES modules
- [Three.js](https://threejs.org): the hero shader (an RGB-split lens that follows the cursor, plus "blurred lines" scan slices)
- [GSAP](https://gsap.com) and ScrollTrigger: all reveals, the pinned timeline, scrubbed parallax and counters
- [Lenis](https://lenis.darkroom.engineering): smooth scrolling

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## Content
All copy, links, dates and imagery were gathered from the artist's public channels: robinthicke.com, the Linkfire link-in-bio, the Instagram profile, the Roc Nation bio and Wikipedia/Wikimedia. Content lives in `src/data.js`, and images are in `public/img/`.
To add tour dates, append to `shows`. To add records, append to `albums`.

## Accessibility & performance
- Respects `prefers-reduced-motion`: the WebGL hero, smooth scrolling and looping animations are turned off.
- YouTube players are click-to-load facades, so no third-party iframes load until a video is played.
- Images are WebP at 2000px or smaller and load lazily below the fold.
