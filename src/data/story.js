// Story chapters. Era photos are freely licensed images from Wikimedia Commons,
// shown with the photographer and license they require (also listed on /legal/credits/).
const commons = (file, w = 1000) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${w}`;
const page = (file) => `https://commons.wikimedia.org/wiki/File:${file}`;
const cc = { 'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/', 'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/', 'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/', 'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/' };
const photo = (file, author, license, date, fallback) => ({ src: commons(file), fallback, credit: { author, license, licenseUrl: cc[license], source: page(file), date } });

export const chapters = [
  {
    year: '1977', era: 'Roots', title: 'Born into the business',
    text: 'Robin Alan Thicke is born in Los Angeles to two working actors, Alan Thicke and Gloria Loring. Music is in the house before he can read it.',
    img: { src: '/img/wiki-2024.webp', pos: '50% 30%', caption: 'Robin in 2024. Born and raised in LA.' },
  },
  {
    year: '1989', era: 'The piano', title: 'Teaches himself the keys',
    text: 'At twelve he sits down at the piano and teaches himself. By sixteen he is writing and producing for R&B acts, first through Brian McKnight.',
    img: { src: '/img/press-2.webp', pos: '45% 40%', caption: 'The self-taught kid, grown up. Press photo.' },
  },
  {
    year: '1998', era: 'Behind the board', title: 'The songwriter in the room',
    text: 'Before he is 21, his songs are on more than twenty gold and platinum albums — for Brandy, Christina Aguilera, Usher, Jennifer Hudson and, later, Michael Jackson.',
    img: { src: '/img/press-1.webp', pos: '50% 25%', caption: 'Writer, producer, then the voice. Photo: Matthew Takes.' },
  },
  {
    year: '2002', era: 'Debut', title: 'A Beautiful World',
    text: 'Interscope releases his first album. It barely charts — No. 152 — but it plants the falsetto, the strings and the soul that everything after grows from.',
    img: { src: '/img/albums/abw.webp', pos: '50% 50%', caption: 'A Beautiful World (2002).', square: true },
  },
  {
    year: '2007', era: 'Breakthrough', title: 'The Evolution',
    text: 'Signed to Pharrell’s Star Trak, he releases The Evolution of Robin Thicke. “Lost Without U” spends eleven weeks at No. 1 on Billboard’s R&B chart. The album debuts at No. 5.',
    img: { ...photo('Robin_Thicke_Live_3.jpg', 'Ambism', 'CC BY 2.0', 'March 2007', '/img/albums/evolution.webp'), pos: '50% 35%', caption: 'On stage, March 2007.' },
  },
  {
    year: '2008', era: 'Arrival', title: 'Something Else',
    text: 'The follow-up debuts at No. 3 on the Billboard 200. He tours as a headliner and becomes a fixture of grown-up R&B.',
    img: { ...photo('Robin_Thicke.jpg', 'Michelle Uthoff-Campbell', 'CC BY-SA 2.0', 'August 2008', '/img/albums/something.webp'), pos: '50% 35%', caption: 'August 2008.' },
  },
  {
    year: '2009', era: 'Live', title: 'Sex Therapy',
    text: 'A fourth album, a top-ten debut, and nights on the road that sharpen him into a front man.',
    img: { ...photo('Robin_Thicke_Live.jpg', 'Ambism', 'CC BY 2.0', 'September 2009', '/img/albums/sextherapy.webp'), pos: '50% 35%', caption: 'Live, September 2009.' },
  },
  {
    year: '2012', era: 'Love After War', title: 'Steady hands',
    text: 'Between records, still touring, still writing. The next one is about to change everything.',
    img: { ...photo('Robin_Thicke_2012.jpg', 'cbgrfx123', 'CC BY-SA 2.0', 'January 2012', '/img/albums/law.webp'), pos: '50% 30%', caption: 'January 2012.' },
  },
  {
    year: '2013', era: 'Diamond', title: 'Blurred Lines',
    text: 'The single tops the Hot 100 for twelve weeks, hits No. 1 in fourteen countries and goes Diamond. The album debuts at No. 1. Three GRAMMY nominations follow.',
    img: { ...photo('Robin_Thicke_performing.jpg', 'Melissa Rose', 'CC BY 2.0', 'December 2013', '/img/albums/blurred.webp'), pos: '50% 30%', caption: 'Performing, December 2013.' },
  },
  {
    year: '2014', era: 'Paula', title: 'Festival stages',
    text: 'A seventh album, Paula, debuts top ten. He plays the big festival stages, including New Orleans Jazz Fest.',
    img: { ...photo('Robin_Thicke_at_New_Orleans_Jazz_Fest_2014.jpg', 'kowarski', 'CC BY 2.0', 'April 2014', '/img/albums/paula.webp'), pos: '50% 25%', caption: 'New Orleans Jazz Fest, April 2014.' },
  },
  {
    year: '2019', era: 'Prime time', title: 'The Masked Singer',
    text: 'He joins FOX’s The Masked Singer as a panelist, guessing the voices behind the masks every season since the first.',
    img: { ...photo('Robin_Thicke_2019_by_Glenn_Francis.jpg', 'Glenn Francis (Toglenn)', 'CC BY-SA 4.0', 'July 2019', '/img/press-1.webp'), pos: '50% 20%', caption: 'July 2019.' },
  },
  {
    year: '2021', era: 'Renewal', title: 'On Earth, and in Heaven',
    text: '“The sunshine coming out after the rain.” Written after loss, the album brings two Adult R&B No. 1s and a reunion with Pharrell on “Take Me Higher”.',
    img: { src: '/img/albums/oeaih.webp', pos: '50% 50%', caption: 'On Earth, and in Heaven (2021).', square: true },
  },
  {
    year: '2026', era: 'Now', title: 'Band leader',
    text: 'Twenty years after The Evolution, he takes over as band leader on Name That Tune, back at the piano every week — and the new single “I Know What To Do” is out now.',
    img: { src: '/img/hero.webp', pos: '55% 30%', caption: 'Mirrors — the IKWTD era.' },
  },
];

export const photoCredits = chapters.filter((c) => c.img.credit).map((c) => ({ chapter: `${c.year} — ${c.title}`, ...c.img.credit }));
