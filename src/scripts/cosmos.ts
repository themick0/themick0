export function initCosmos(): void {
  const intro = document.querySelector<HTMLElement>('[data-cosmos]');
  const scene = document.querySelector<HTMLElement>('.cosmos-scene');
  const canvas = document.querySelector<HTMLCanvasElement>('.starfield');
  const meteorCanvas =
    document.querySelector<HTMLCanvasElement>('.meteorfield');
  if (!intro || !scene || !canvas || !meteorCanvas) return;

  const background = canvas.getContext('2d', { alpha: true });
  const foreground = meteorCanvas.getContext('2d', { alpha: true });
  if (!background || !foreground) return;
  startScene(intro, scene, canvas, meteorCanvas, background, foreground);
}

function startScene(
  intro: HTMLElement,
  scene: HTMLElement,
  canvas: HTMLCanvasElement,
  meteorCanvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  meteorContext: CanvasRenderingContext2D,
): void {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const forced = matchMedia('(forced-colors: active)');
  const title = document.querySelector<HTMLElement>('.hero-line.iridescent');
  const clamp = (value: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));
  const smooth = (value: number) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const TAU = Math.PI * 2;
  let seed = 19261015;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stars = Array.from(
    { length: coarse.matches ? 280 : 620 },
    (_, index) => ({
      x: (random() - 0.5) * 2.9,
      y: (random() - 0.5) * 2,
      z: 0.18 + random() * 2,
      size: 0.25 + random() * 1.1,
      light: 0.3 + random() * 0.7,
      phase: random() * TAU,
      blue: random() > 0.36,
      foreground: index % 13 === 0,
    }),
  );
  const dust = Array.from({ length: 90 }, () => ({
    along: random(),
    spread: random() - 0.5,
    size: 0.2 + random() * 1.2,
    light: random(),
  }));
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    titleX: 50,
    titleY: 50,
    targetTitleX: 50,
    targetTitleY: 50,
    lastSample: null as { x: number; y: number; time: number } | null,
    activity: 0,
    edge: 0,
  };
  const flight = { energy: 0, clock: 0, bank: 0, previousX: 0, previousY: 0 };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let animation = 0;
  let previous = 0;
  let elapsed = 0;
  let visible = true;
  let introFinished = false;
  let isStatic = false;

  // A cached glow sprite keeps hundreds of lights inexpensive to draw.
  const glow = document.createElement('canvas');
  glow.width = glow.height = 128;
  const glowContext = glow.getContext('2d');
  if (glowContext) {
    const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, '#f3fcff');
    gradient.addColorStop(0.035, '#e5f6ffe6');
    gradient.addColorStop(0.13, '#a2d3ff80');
    gradient.addColorStop(0.35, '#739bff24');
    gradient.addColorStop(1, '#647edb00');
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 128, 128);
  }

  function sizeScene() {
    width = intro.clientWidth;
    height = intro.clientHeight;
    // Cap the backing store on large displays and use a lighter mobile renderer.
    ratio = Math.min(
      devicePixelRatio || 1,
      coarse.matches ? 1.2 : 1.5,
      2400 / width,
      1600 / height,
    );
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    meteorCanvas.width = canvas.width;
    meteorCanvas.height = canvas.height;
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (meteorContext) meteorContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (reduced.matches || forced.matches) renderStill();
  }

  function starField(
    time: number,
    delta: number,
    entering: boolean,
    still: boolean,
  ) {
    const backgroundContext = context;
    const originX = width < 768 ? 0.77 : 0.73;
    const cx = width * (originX + pointer.x * 0.07);
    const cy = height * (0.38 + pointer.y * 0.075);
    const previousCX = width * (originX + flight.previousX * 0.07);
    const previousCY = height * (0.38 + flight.previousY * 0.075);
    const focal = Math.max(width, height) * 0.65;
    const arrival = entering ? 1 - smooth((time - 0.35) / 2.6) : 0;
    const speed =
      (coarse.matches ? 0.045 : 0.065) + flight.energy * 0.19 + arrival * 0.64;
    const exposure = 0.085 + flight.energy * 0.095;
    const trailScale = Math.min(exposure / (delta || 0.033), 3);

    for (const star of stars) {
      const context = star.foreground ? meteorContext : backgroundContext;
      const depthSpeed = speed * (star.foreground ? 1.35 : 1);
      star.z -= delta * depthSpeed;
      if (star.z < 0.08) star.z += 2.1;
      // Translation before perspective creates real depth-dependent parallax.
      const x = cx + ((star.x - pointer.x * 0.085) * focal) / star.z;
      const y = cy + ((star.y - pointer.y * 0.065) * focal) / star.z;
      if (x < -100 || x > width + 100 || y < -100 || y > height + 100) continue;
      const radius = clamp(star.size / star.z, 0.25, 1.65);
      const twinkle = 0.8 + 0.2 * Math.sin(time * 0.6 + star.phase);
      const textShade = x < width * 0.58 ? 0.62 : 1;
      const light =
        star.light *
        twinkle *
        textShade *
        clamp(star.z * 1.7) *
        (star.foreground ? 0.42 : 1);
      context.globalAlpha = light;
      context.fillStyle = star.blue ? '#c2dcff' : '#f5e8ec';

      if (!still) {
        const tailZ = star.z + depthSpeed * (delta || 0.033);
        const previousStarX =
          previousCX + ((star.x - flight.previousX * 0.085) * focal) / tailZ;
        const previousStarY =
          previousCY + ((star.y - flight.previousY * 0.065) * focal) / tailZ;
        const tx = x + (previousStarX - x) * trailScale;
        const ty = y + (previousStarY - y) * trailScale;
        const trail = Math.hypot(tx - x, ty - y);
        const limit = 30 + flight.energy * 42 + arrival * 40;
        const lengthScale = trail > limit ? limit / trail : 1;
        context.globalAlpha = light * (0.4 + arrival * 0.3);
        context.strokeStyle = star.blue ? '#a9cfff' : '#ece4ff';
        context.lineWidth = radius * 0.72;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (tx - x) * lengthScale, y + (ty - y) * lengthScale);
        context.stroke();
      }
      context.globalAlpha = light;
      context.beginPath();
      context.arc(x, y, radius * 0.65, 0, TAU);
      context.fill();
      if (star.light > 0.91 && radius > 0.6 && glowContext) {
        const size = radius * 22;
        context.globalAlpha = light * 0.65;
        context.drawImage(glow, x - size / 2, y - size / 2, size, size);
      }
    }
    context.globalAlpha = 1;
    meteorContext.globalAlpha = 1;
  }

  function comet(
    x: number,
    y: number,
    length: number,
    brightness: number,
    time: number,
    scale = 1,
    angle = -0.58,
  ) {
    const context = meteorContext;
    if (brightness <= 0.001) return;
    context.save();
    context.translate(x, y);
    context.rotate(angle + flight.bank * 0.025);
    context.globalCompositeOperation = 'screen';
    const tail = context.createLinearGradient(0, 0, length, 0);
    tail.addColorStop(0, `rgba(231,248,255,${0.94 * brightness})`);
    tail.addColorStop(0.04, `rgba(173,219,255,${0.52 * brightness})`);
    tail.addColorStop(0.25, `rgba(113,161,237,${0.13 * brightness})`);
    tail.addColorStop(0.62, `rgba(183,146,214,${0.065 * brightness})`);
    tail.addColorStop(1, 'rgba(131,150,222,0)');

    // Several fine strands and a wider diffuse trail form one curved comet.
    for (let strand = 0; strand < 18; strand++) {
      const spread = (strand - 8.5) * 1.4 * scale;
      const bend = pointer.y * 16 * scale + flight.bank * 5;
      context.globalAlpha = strand % 3 === 0 ? 0.2 : 0.12;
      context.strokeStyle = tail;
      context.lineWidth = (strand % 3 === 0 ? 4.5 : 1.3) * scale;
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(
        length * 0.2,
        spread * 0.25,
        length * 0.61,
        spread + 7 * scale + bend,
        length,
        spread * 2 + 25 * scale + bend * 2,
      );
      context.stroke();
    }
    context.globalAlpha = 0.8;
    context.strokeStyle = tail;
    context.lineWidth = 1.3 * scale;
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(length * 0.42, 1, length, 22 * scale);
    context.stroke();

    for (const particle of dust) {
      const along = (particle.along + time * 0.065) % 1;
      const px = along * length;
      const py =
        particle.spread * (3 + along * 34) * scale + along * along * 22 * scale;
      context.globalAlpha =
        (1 - along) ** 2 * particle.light * brightness * 0.6;
      context.fillStyle = '#b8d6ff';
      context.fillRect(px, py, particle.size * scale, particle.size * scale);
    }
    context.globalAlpha = brightness;
    if (glowContext) {
      const size = 200 * scale;
      context.drawImage(glow, -size / 2, -size / 2, size, size);
    }
    const core = context.createRadialGradient(0, 0, 0, 0, 0, 6 * scale);
    core.addColorStop(0, '#fff');
    core.addColorStop(0.2, '#f3fbff');
    core.addColorStop(1, '#bde7ff00');
    context.fillStyle = core;
    context.beginPath();
    context.ellipse(0, 0, 13 * scale, 4 * scale, 0, 0, TAU);
    context.fill();
    context.restore();
  }

  function render(time: number, delta: number, still = false) {
    if (!context || !meteorContext || !width || !height) return;
    context.clearRect(0, 0, width, height);
    meteorContext.clearRect(0, 0, width, height);
    starField(time, delta, !still && !introFinished, still);

    if (!still && time < 4.6 && !introFinished) {
      const progress = clamp((time - 0.28) / 4.1);
      const ease = 1 - (1 - progress) ** 1.15;
      const brightness =
        smooth(progress * 5) * (1 - smooth((progress - 0.77) / 0.23));
      comet(
        width * (1.2 - ease * 0.75),
        height * (-0.17 + ease * 1.03),
        width * 0.58,
        brightness * 1.3,
        time,
        width < 768 ? 0.85 : 1.35,
      );
      const second = clamp((time - 1.1) / 2.8);
      comet(
        width * (1.05 - second * 0.35),
        height * (0.07 + second * 0.45),
        width * 0.2,
        Math.sin(second * Math.PI) * 0.38,
        time,
        0.45,
      );
    }

    // A distant slow comet establishes the composition even between flybys.
    const drift = still ? 0 : Math.sin(flight.clock * 0.15);
    const heroX =
      width * (width < 768 ? 0.78 : 0.81) +
      drift * width * 0.035 -
      pointer.x * 40;
    const heroY =
      height * 0.23 +
      (still ? 0 : Math.cos(flight.clock * 0.12) * height * 0.025) -
      pointer.y * 30;
    comet(
      heroX,
      heroY,
      width * (0.34 + flight.energy * 0.07),
      0.72,
      time,
      width < 768 ? 0.6 : 0.9,
    );

    if (!still && time > 4.6) {
      const settle = smooth((time - 4.6) / 0.8);
      const cycle = (flight.clock - 4.6) % 8.8;
      const progress = clamp(cycle / 5.2);
      const brightness =
        smooth(progress * 5) * (1 - smooth((progress - 0.7) / 0.3)) * settle;
      if (cycle < 5.2) {
        const x = width * (1.18 - progress * 0.79) - pointer.x * 56;
        const y = height * (-0.14 + progress * 1.24) - pointer.y * 38;
        const direction = Math.atan2(-height * 1.24, width * 0.79);
        comet(
          x,
          y,
          width * (0.45 + flight.energy * 0.08),
          brightness * 0.95,
          flight.clock,
          0.75 + progress * 0.4,
          direction,
        );
      }
      const distant = (flight.clock + 2) % 12;
      if (distant < 6) {
        const p = distant / 6;
        comet(
          width * (1.12 - p * 0.47) - pointer.x * 18,
          height * (-0.07 + p * 0.64) - pointer.y * 12,
          width * 0.22,
          Math.sin(p * Math.PI) * 0.38 * settle,
          flight.clock,
          0.4,
          Math.atan2(-height * 0.64, width * 0.47),
        );
      }
    }
  }

  function updateScene(delta: number) {
    const easing = 1 - Math.exp(-delta / 0.28);
    flight.previousX = pointer.x;
    flight.previousY = pointer.y;
    pointer.x += (pointer.targetX - pointer.x) * easing;
    pointer.y += (pointer.targetY - pointer.y) * easing;
    pointer.titleX += (pointer.targetTitleX - pointer.titleX) * easing;
    pointer.titleY += (pointer.targetTitleY - pointer.titleY) * easing;
    pointer.activity *= Math.exp(-delta / 0.45);
    flight.energy +=
      (pointer.activity * pointer.edge - flight.energy) *
      (1 - Math.exp(-delta / 0.32));
    flight.clock += delta * (1 + flight.energy * 0.55);
    flight.bank +=
      (-pointer.x * 1.25 - flight.bank) * (1 - Math.exp(-delta / 0.45));
    intro.style.setProperty('--space-x', pointer.x.toFixed(4));
    intro.style.setProperty('--space-y', pointer.y.toFixed(4));
    intro.style.setProperty('--space-bank', flight.bank.toFixed(3) + 'deg');
    if (title) {
      title.style.setProperty('--title-x', pointer.titleX.toFixed(2) + '%');
      title.style.setProperty('--title-y', pointer.titleY.toFixed(2) + '%');
      title.style.setProperty(
        '--sheen',
        (35 + pointer.x * 24 + Math.sin(elapsed * 0.35) * 12).toFixed(2) + '%',
      );
    }
  }

  function canAnimate() {
    return (
      context &&
      meteorContext &&
      visible &&
      !document.hidden &&
      !reduced.matches &&
      !forced.matches
    );
  }

  function frame(now: number) {
    animation = 0;
    if (!canAnimate()) {
      reconcile();
      return;
    }
    const interval = coarse.matches ? 1000 / 24 : 1000 / 40;
    if (previous && now - previous < interval - 1) {
      animation = requestAnimationFrame(frame);
      return;
    }
    const delta = previous ? Math.min((now - previous) / 1000, 0.06) : 0;
    previous = now;
    elapsed += delta;
    updateScene(delta);
    render(elapsed, delta);
    if (!introFinished && elapsed > 4.6) {
      introFinished = true;
      intro.classList.remove('is-entering');
    }
    animation = requestAnimationFrame(frame);
  }

  function renderStill() {
    intro.classList.remove('is-entering');
    releasePointer();
    flight.energy = flight.bank = flight.previousX = flight.previousY = 0;
    pointer.targetX = pointer.targetY = pointer.x = pointer.y = 0;
    intro.style.removeProperty('--space-x');
    intro.style.removeProperty('--space-y');
    intro.style.removeProperty('--space-bank');
    title?.style.removeProperty('--sheen');
    title?.style.removeProperty('--title-x');
    title?.style.removeProperty('--title-y');
    render(8, 0, true);
  }

  function reconcile() {
    cancelAnimationFrame(animation);
    animation = 0;
    previous = 0;
    if (!visible || document.hidden || coarse.matches) {
      releasePointer();
    }
    if (reduced.matches || forced.matches) {
      introFinished = true;
      if (!isStatic) renderStill();
      isStatic = true;
    } else {
      isStatic = false;
      if (canAnimate()) animation = requestAnimationFrame(frame);
    }
  }

  sizeScene();
  render(8, 0, true);
  scene.classList.add('scene-ready');
  if (!reduced.matches && !forced.matches && !location.hash)
    intro.classList.add('is-entering');
  else introFinished = true;

  intro.addEventListener(
    'pointermove',
    (event) => {
      if (
        coarse.matches ||
        reduced.matches ||
        forced.matches ||
        event.pointerType === 'touch'
      )
        return;
      const bounds = intro.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      // Feather the force at every edge, then ease toward it; entering never jumps.
      const influence = smooth(Math.min(x, width - x, y, height - y) / 100);
      const now = performance.now();
      const sample = pointer.lastSample;
      const distance = sample ? Math.hypot(x - sample.x, y - sample.y) : 0;
      const continuous =
        sample && now - sample.time < 140 && distance < width * 0.35;
      if (continuous) {
        const speed = (distance / Math.max(16, now - sample.time)) * 1000;
        pointer.activity = Math.max(pointer.activity, clamp(speed / 1200));
      }
      pointer.edge = influence;
      pointer.lastSample = { x, y, time: now };
      pointer.targetX = ((x / width) * 2 - 1) * influence;
      pointer.targetY = ((y / height) * 2 - 1) * influence;
    },
    { passive: true },
  );
  function releasePointer() {
    pointer.targetX = pointer.targetY = pointer.activity = pointer.edge = 0;
    pointer.targetTitleX = pointer.targetTitleY = 50;
    pointer.lastSample = null;
  }
  intro.addEventListener('pointerleave', releasePointer);
  window.addEventListener('blur', releasePointer);
  title?.addEventListener(
    'pointermove',
    (event) => {
      if (reduced.matches || coarse.matches) return;
      const box = title.getBoundingClientRect();
      pointer.targetTitleX =
        clamp((event.clientX - box.left) / box.width) * 100;
      pointer.targetTitleY =
        clamp((event.clientY - box.top) / box.height) * 100;
    },
    { passive: true },
  );
  title?.addEventListener('pointerleave', () => {
    pointer.targetTitleX = pointer.targetTitleY = 50;
  });

  if (typeof ResizeObserver !== 'undefined')
    new ResizeObserver(sizeScene).observe(intro);
  else window.addEventListener('resize', sizeScene, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        reconcile();
      },
      { threshold: 0 },
    ).observe(intro);
  }
  document.addEventListener('visibilitychange', reconcile);
  [reduced, coarse, forced].forEach((media) =>
    media.addEventListener('change', () => {
      sizeScene();
      reconcile();
    }),
  );
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(animation);
    animation = 0;
  });
  window.addEventListener('pageshow', reconcile);
  reconcile();
}
