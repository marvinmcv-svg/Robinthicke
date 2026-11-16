// Marvin — the site's AI receptionist. An original illustrated character:
// silver-screen pompadour, three-day stubble, open collar, a gold-tipped headset mic.
export function marvinSVG(id = 'm') {
  return `<svg class="marvin-svg" viewBox="0 0 120 120" role="img" aria-label="Marvin, the AI receptionist">
  <defs>
    <radialGradient id="mbg-${id}" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#f0c98a"/><stop offset=".55" stop-color="#d9a35b"/><stop offset="1" stop-color="#7a5225"/></radialGradient>
    <linearGradient id="mhair-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3427"/><stop offset="1" stop-color="#241812"/></linearGradient>
    <clipPath id="mclip-${id}"><circle cx="60" cy="60" r="60"/></clipPath>
  </defs>
  <g clip-path="url(#mclip-${id})">
    <circle cx="60" cy="60" r="60" fill="url(#mbg-${id})"/>
    <g class="m-body">
      <path d="M10 124 C14 98 36 88 60 88 C84 88 106 98 110 124 Z" fill="#1b1714"/>
      <path d="M47 88 L60 108 L73 88 L67 87 L60 98 L53 87 Z" fill="#f2ece2"/>
      <path d="M53 88 L60 100 L67 88 Z" fill="#c98d6a"/>
      <path d="M44 90 L56 112 L50 120 L36 96 Z M76 90 L64 112 L70 120 L84 96 Z" fill="#100d0b" opacity=".85"/>
      <circle cx="82" cy="104" r="3.4" fill="#f0c98a"/>
    </g>
    <g class="m-head">
      <rect x="50" y="68" width="20" height="24" rx="7" fill="#d29a77"/>
      <ellipse cx="38.5" cy="54" rx="4.2" ry="6.4" fill="#e3aa85"/>
      <ellipse cx="81.5" cy="54" rx="4.2" ry="6.4" fill="#e3aa85"/>
      <path d="M38 45 C38 29 48 23 60 23 C72 23 82 29 82 45 L81.4 58 C80 70 72 80 60 80 C48 80 40 70 38.6 58 Z" fill="#ebb792"/>
      <path d="M39.6 58 C42 72 50 80 60 80 C70 80 78 72 80.4 58 C75 66 68 65 60 65 C52 65 45 66 39.6 58 Z" fill="#4a2f22" opacity=".2"/>
      <path d="M36.5 47 C32.5 30 40 15 56 13 C67 11.5 79 14 85 22.5 C89 28.5 87.5 37 84 45 C82.5 37 78.5 32.5 72 31.5 C64 30.4 54 33.4 46 32.6 C41 32.4 38.2 38.5 38.2 46 Z" fill="url(#mhair-${id})"/>
      <path d="M49 18.5 C59 13.8 72 14.4 80.5 21.8" fill="none" stroke="#7b5a44" stroke-width="2" stroke-linecap="round"/>
      <path d="M44.5 43.2 Q50 39.6 55.4 42" fill="none" stroke="#2c1d15" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M64.6 42 Q70 39.6 75.5 43.2" fill="none" stroke="#2c1d15" stroke-width="2.6" stroke-linecap="round"/>
      <g class="m-eyes"><ellipse cx="50" cy="49.4" rx="2.6" ry="2.9" fill="#1a1310"/><ellipse cx="70" cy="49.4" rx="2.6" ry="2.9" fill="#1a1310"/></g>
      <path d="M44.5 53.5 L42.6 55 M75.5 53.5 L77.4 55" stroke="#b27b5c" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M60.4 50 Q58.4 57.5 56.2 59.8 Q60 61.8 63.4 60" fill="none" stroke="#b27b5c" stroke-width="1.5" stroke-linecap="round"/>
      <path class="m-mouth" d="M49.5 66 Q60 77 70.5 66 Q60 69.5 49.5 66 Z" fill="#fff8f0" stroke="#8a4a3a" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M36.6 49 C35 19 85 19 83.4 49" fill="none" stroke="#0f0d0c" stroke-width="3.4" stroke-linecap="round"/>
      <rect x="32.6" y="45.5" width="8" height="13.5" rx="4" fill="#0f0d0c"/>
      <rect x="34.4" y="48.5" width="4.4" height="7.5" rx="2.2" fill="#d9a35b"/>
      <path d="M36.6 58.5 C38 70 45 73 51.4 71" fill="none" stroke="#0f0d0c" stroke-width="2.4" stroke-linecap="round"/>
      <circle class="m-mic" cx="53" cy="70.6" r="2.8" fill="#f0c98a"/>
    </g>
  </g>
</svg>`;
}
