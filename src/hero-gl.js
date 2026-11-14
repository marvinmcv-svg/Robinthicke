import { WebGLRenderer, Scene, OrthographicCamera, Vector2, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader, SRGBColorSpace, LinearFilter, Clock } from 'three';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

// Two-texture liquid transition + "blurred lines" RGB-split lens following the cursor.
const frag = /* glsl */ `
precision highp float;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec3 uImgA; // w, h, focusY
uniform vec3 uImgB;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uTime;
uniform float uMix;
uniform float uReveal;
uniform float uScroll;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), u.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }

vec2 cover(vec2 uv, vec3 img) {
  float rs = uRes.x / uRes.y;
  float ri = img.x / img.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 c = (uv - 0.5) * s + 0.5;
  // vertical focus for portrait crops
  float slack = (1.0 - s.y) * 0.5;
  c.y += (img.z - 0.5) * 2.0 * slack;
  return c;
}

vec3 sampleRGB(sampler2D t, vec3 img, vec2 uv, vec2 shift) {
  float r = texture2D(t, cover(uv + shift, img)).r;
  float g = texture2D(t, cover(uv, img)).g;
  float b = texture2D(t, cover(uv - shift, img)).b;
  return vec3(r, g, b);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  float zoom = 1.0 + (1.0 - uReveal) * 0.25 + uScroll * 0.15;
  uv = (uv - 0.5) / zoom + 0.5;
  uv.y += uScroll * 0.08;

  float row = floor(vUv.y * 24.0);
  uv.x += (hash(row) - 0.5) * ((1.0 - uReveal) * 0.35 + uScroll * 0.05);

  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
  float infl = smoothstep(0.38, 0.0, distance(p, mp));
  uv -= (p - mp) * infl * 0.035;
  uv.x += sin(vUv.y * 340.0 + uTime * 3.0) * (0.0004 + infl * 0.0016 + uScroll * 0.004);

  // liquid transition
  float n = fbm(vUv * 3.0 + uTime * 0.05);
  float mm = uMix * 1.3 - 0.15;
  float edge = smoothstep(mm - 0.12, mm + 0.12, n * 0.8 + vUv.x * 0.2);
  float t = 1.0 - edge; // 0 -> A, 1 -> B
  float wave = sin(uMix * 3.14159);
  vec2 disp = vec2(n - 0.5, n - 0.5) * 0.25 * wave;

  vec2 shift = uVel * (0.4 * infl + 0.08) + vec2(0.004 * (1.0 - uReveal) + uScroll * 0.012 + wave * 0.008, 0.0);

  vec3 a = sampleRGB(uTexA, uImgA, uv + disp * t, shift);
  vec3 b = sampleRGB(uTexB, uImgB, uv - disp * (1.0 - t), shift);
  vec3 col = mix(a, b, t);

  col = mix(col, col * vec3(1.06, 0.98, 0.9), 0.6);
  float vig = smoothstep(1.15, 0.35, distance(vUv, vec2(0.5)));
  col *= mix(0.55, 1.0, vig);
  col *= uReveal * 0.8 + 0.2;
  col *= 1.0 - uScroll * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * slides: [{ src, focus }]
 * state: plain object animated by GSAP — { reveal, scroll, mix }
 */
export function initHeroGL(canvas, slides, state) {
  let renderer;
  try {
    // Software-rendered WebGL (no GPU) would burn the CPU — keep the static photo instead.
    const probe = document.createElement('canvas').getContext('webgl');
    const dbg = probe && probe.getExtension('WEBGL_debug_renderer_info');
    const name = dbg ? String(probe.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    if (!probe || /swiftshader|llvmpipe|software/i.test(name)) return null;
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTexA: { value: null },
    uTexB: { value: null },
    uImgA: { value: [3, 2, 0.5] },
    uImgB: { value: [3, 2, 0.5] },
    uRes: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uVel: { value: new Vector2(0, 0) },
    uTime: { value: 0 },
    uMix: { value: 0 },
    uReveal: { value: 0 },
    uScroll: { value: 0 },
  };
  scene.add(new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms })));

  const textures = [];
  const loader = new TextureLoader();
  let loadedCount = 0;
  const ready = { v: false, visible: true };
  slides.forEach((s, i) => {
    loader.load(s.src, (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearFilter;
      textures[i] = { tex, img: [tex.image.width, tex.image.height, s.focus ?? 0.5] };
      loadedCount++;
      if (i === 0) {
        setPair(0, 0);
        ready.v = true;
        canvas.parentElement.classList.add('gl-ready');
      }
    });
  });

  function setPair(a, b) {
    const A = textures[a], B = textures[b] || A;
    uniforms.uTexA.value = A.tex; uniforms.uImgA.value = A.img;
    uniforms.uTexB.value = B.tex; uniforms.uImgB.value = B.img;
  }

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const target = new Vector2(0.5, 0.5);
  const last = new Vector2(0.5, 0.5);
  const tmp = new Vector2();
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  });
  new IntersectionObserver(([en]) => (ready.visible = en.isIntersecting)).observe(canvas);

  const clock = new Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!ready.v || !ready.visible) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uReveal.value = state.reveal;
    uniforms.uScroll.value = state.scroll;
    uniforms.uMix.value = state.mix;
    const m = uniforms.uMouse.value;
    m.lerp(target, 0.08);
    uniforms.uVel.value.lerp(tmp.set(m.x - last.x, m.y - last.y).multiplyScalar(4), 0.15);
    last.copy(m);
    renderer.render(scene, camera);
  };
  tick();

  return {
    canShow: (i) => !!textures[i],
    setPair,
  };
}
