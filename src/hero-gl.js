import { WebGLRenderer, Scene, OrthographicCamera, Vector2, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader, SRGBColorSpace, LinearFilter, Clock } from 'three';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

// "Blurred lines": an RGB-split liquid lens that follows the cursor,
// plus horizontal scan-slices that resolve on intro and return on scroll.
const frag = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uTime;
uniform float uReveal;
uniform float uScroll;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // zoom: settles in on reveal, pushes in on scroll
  float zoom = 1.0 + (1.0 - uReveal) * 0.25 + uScroll * 0.15;
  uv = (uv - 0.5) / zoom + 0.5;
  uv.y += uScroll * 0.08;

  // horizontal slices
  float rows = 24.0;
  float row = floor(vUv.y * rows);
  float slice = hash(row) - 0.5;
  float sliceAmt = (1.0 - uReveal) * 0.35 + uScroll * 0.05;
  uv.x += slice * sliceAmt;

  // cursor lens
  vec2 m = uMouse;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 mp = vec2(m.x * aspect, m.y);
  float d = distance(p, mp);
  float infl = smoothstep(0.38, 0.0, d);
  uv -= (p - mp) * infl * 0.035;

  // fine "lines"
  float lines = sin(vUv.y * 340.0 + uTime * 3.0) * (0.0004 + infl * 0.0016 + uScroll * 0.004);
  uv.x += lines;

  vec2 shift = uVel * (0.4 * infl + 0.08) + vec2(0.004 * (1.0 - uReveal) + uScroll * 0.012, 0.0);

  vec2 c = cover(uv);
  float r = texture2D(uTex, cover(uv + shift)).r;
  float g = texture2D(uTex, c).g;
  float b = texture2D(uTex, cover(uv - shift)).b;
  vec3 col = vec3(r, g, b);

  // warm grade + vignette
  col = mix(col, col * vec3(1.06, 0.98, 0.9), 0.6);
  float vig = smoothstep(1.15, 0.35, distance(vUv, vec2(0.5)));
  col *= mix(0.55, 1.0, vig);
  col *= uReveal * 0.8 + 0.2;
  col *= 1.0 - uScroll * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initHeroGL(canvas, src) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTex: { value: null },
    uRes: { value: new Vector2(1, 1) },
    uImg: { value: new Vector2(3, 2) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uVel: { value: new Vector2(0, 0) },
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uScroll: { value: 0 },
  };
  const mesh = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms })
  );
  scene.add(mesh);

  const state = { ready: false, visible: true };
  new TextureLoader().load(src, (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    uniforms.uTex.value = tex;
    uniforms.uImg.value.set(tex.image.width, tex.image.height);
    state.ready = true;
    canvas.parentElement.classList.add('gl-ready');
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const target = new Vector2(0.5, 0.5);
  const last = new Vector2(0.5, 0.5);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  });

  const io = new IntersectionObserver(([en]) => (state.visible = en.isIntersecting));
  io.observe(canvas);

  const clock = new Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!state.ready || !state.visible) return;
    uniforms.uTime.value = clock.getElapsedTime();
    const m = uniforms.uMouse.value;
    m.lerp(target, 0.08);
    const v = uniforms.uVel.value;
    v.lerp(new Vector2(m.x - last.x, m.y - last.y).multiplyScalar(4), 0.15);
    last.copy(m);
    renderer.render(scene, camera);
  };
  tick();

  return uniforms;
}
