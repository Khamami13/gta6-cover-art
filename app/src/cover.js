// Neon Coast cover engine: multi-panel GTA-style poster art on a 2D canvas.
// Original art only — no Rockstar logo, artwork or font. Lettering is Anton
// and Pacifico, both SIL OFL, vendored under app/fonts/ beside their OFL texts.

export const LAYOUTS = {
  grid4: { name: '4-panel grid', panels: 4 },
  hero3: { name: 'Hero + three', panels: 4 },
  fullbleed: { name: 'Full bleed', panels: 1 },
  grid9: { name: '9-panel grid', panels: 9 },
  tilted: { name: 'Tilted snapshot', panels: 3 },
  story: { name: 'Story', panels: 3 },
};

export const GRADES = {
  sunset: { name: 'Vice sunset' },
  neon: { name: 'Neon night' },
  vice: { name: 'Vice City' },
  heat: { name: 'Heat wave' },
  mono: { name: 'Noir' },
};

export const EXPORT_SIZES = [
  { label: '1080 x 1080', w: 1080, h: 1080 },
  { label: '1080 x 1350', w: 1080, h: 1350 },
  { label: '1920 x 1080', w: 1920, h: 1080 },
];

/** Panel rectangles (px) for a layout on a canvas of w x h. */
export function panelRects(layout, w, h) {
  const g = Math.max(4, Math.round(w * 0.012));
  const R = (x, y, rw, rh, rot = 0) => ({ x, y, w: rw, h: rh, rot });
  switch (layout) {
    case 'hero3': {
      const rx = w * 0.62 + g;
      const rh = (h - 2 * g) / 3;
      return [
        R(0, 0, w * 0.62, h),
        R(rx, 0, w - rx, rh),
        R(rx, rh + g, w - rx, rh),
        R(rx, 2 * (rh + g), w - rx, rh),
      ];
    }
    case 'fullbleed':
      return [R(0, 0, w, h)];
    case 'grid9': {
      const cw = (w - 2 * g) / 3;
      const ch = (h - 2 * g) / 3;
      const out = [];
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) out.push(R(c * (cw + g), r * (ch + g), cw, ch));
      }
      return out;
    }
    case 'tilted': {
      const pw = w * 0.44;
      const ph = h * 0.66;
      return [
        R(w * 0.03, h * 0.06, pw, ph, -0.07),
        R(w * 0.28, h * 0.02, pw, ph, 0.02),
        R(w * 0.53, h * 0.07, pw, ph, 0.08),
      ];
    }
    case 'story': {
      const bw = (w - g) / 2;
      const bh = h * 0.26;
      return [
        R(0, 0, w, h * 0.5 - g),
        R(0, h * 0.5, bw, bh),
        R(bw + g, h * 0.5, bw, bh),
      ];
    }
    case 'grid4':
    default: {
      const cw = (w - g) / 2;
      const ch = (h - g) / 2;
      return [R(0, 0, cw, ch), R(cw + g, 0, cw, ch), R(0, ch + g, cw, ch), R(cw + g, ch + g, cw, ch)];
    }
  }
}

const GRADE_FILTER = {
  sunset: 'saturate(1.45) contrast(1.06)',
  neon: 'saturate(1.65) contrast(1.08) hue-rotate(-8deg)',
  vice: 'saturate(1.35) contrast(1.12)',
  heat: 'sepia(0.35) saturate(1.9) contrast(1.05)',
  mono: 'grayscale(1) contrast(1.15)',
};

function gradeOverlay(ctx, rect, grade, tint) {
  const { x, y, w, h } = rect;
  const stops = {
    sunset: [[0, 'rgba(255,190,60,0.55)'], [0.55, 'rgba(255,110,60,0.35)'], [1, 'rgba(255,46,136,0.55)']],
    neon: [[0, 'rgba(255,46,136,0.5)'], [0.5, 'rgba(120,40,200,0.3)'], [1, 'rgba(0,229,255,0.5)']],
    vice: [[0, 'rgba(150,60,255,0.5)'], [1, 'rgba(0,200,180,0.5)']],
    heat: [[0, 'rgba(255,120,0,0.55)'], [1, 'rgba(200,0,40,0.55)']],
    mono: [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.25)']],
  }[grade] ?? [];
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = Math.max(0, Math.min(1, tint));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = Math.max(0, Math.min(1, tint * 0.8));
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** A procedural sunset scene for an empty panel: gradient sky, sun, sea bands. */
function drawSunsetScene(ctx, rect, grade) {
  const { x, y, w, h } = rect;
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  if (grade === 'mono') {
    sky.addColorStop(0, '#d8d8d8');
    sky.addColorStop(0.6, '#8a8a8a');
    sky.addColorStop(1, '#2a2a2a');
  } else if (grade === 'neon' || grade === 'vice') {
    sky.addColorStop(0, '#2b0a4d');
    sky.addColorStop(0.55, '#c2187a');
    sky.addColorStop(1, '#0a2a4d');
  } else {
    sky.addColorStop(0, '#ffcf5c');
    sky.addColorStop(0.5, '#ff7e5f');
    sky.addColorStop(1, '#c2187a');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const sunR = Math.min(w, h) * 0.16;
  ctx.fillStyle = grade === 'mono' ? '#f2f2f2' : '#fff3c4';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.42, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,8,40,0.35)';
  for (let i = 0; i < 4; i += 1) {
    const sy = y + h * (0.62 + i * 0.09);
    ctx.fillRect(x, y + h * 0.6, w, 2);
    ctx.fillRect(x + ((i * 37) % Math.max(1, w * 0.5)), sy, w * 0.3, 3);
  }
  ctx.strokeStyle = 'rgba(20,8,40,0.6)';
  ctx.lineWidth = Math.max(2, w * 0.006);
  for (let i = 0; i < 3; i += 1) {
    const bx = x + w * (0.2 + i * 0.25);
    const by = y + h * (0.16 + i * 0.05);
    ctx.beginPath();
    ctx.moveTo(bx - 12, by);
    ctx.quadraticCurveTo(bx, by - 8, bx + 12, by);
    ctx.stroke();
  }
}

/** Draws one photo into a panel rect, cover-fit with zoom and focus (0..1). */
function drawPhoto(ctx, img, rect, panel, grade, tint) {
  const { x, y, w, h, rot } = rect;
  ctx.save();
  if (rot) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.translate(-(x + w / 2), -(y + h / 2));
  }
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    const zoom = panel.zoom || 1;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const fx = panel.fx ?? 0.5;
    const fy = panel.fy ?? 0.5;
    ctx.filter = GRADE_FILTER[grade] ?? 'none';
    ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
    ctx.filter = 'none';
  } else {
    drawSunsetScene(ctx, rect, grade);
  }
  gradeOverlay(ctx, rect, grade, tint);
  ctx.restore();
}

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function fitFont(ctx, text, family, startSize, maxWidth, weight = '') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

let grainPattern = null;
function getGrain(ctx) {
  if (grainPattern) return grainPattern;
  const n = document.createElement('canvas');
  n.width = 128;
  n.height = 128;
  const nctx = n.getContext('2d');
  const data = nctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  nctx.putImageData(data, 0, 0);
  grainPattern = ctx.createPattern(n, 'repeat');
  return grainPattern;
}

/**
 * Draws the whole cover onto `canvas` at its own size.
 * `photos` is an array of loaded images (or nulls); each panel picks one by
 * index. `state` carries layout, grade, tint, title, subtitle, badge, stars
 * and the effect toggles plus the per-panel crop ({photo, zoom, fx, fy}).
 */
export function drawCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#14091f';
  ctx.fillRect(0, 0, w, h);

  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] ?? { photo: null, zoom: 1, fx: 0.5, fy: 0.5 };
    if (state.layout === 'tilted') {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.rot);
      ctx.fillStyle = '#f8f2e8';
      ctx.fillRect(-rect.w / 2 - 10, -rect.h / 2 - 10, rect.w + 20, rect.h + 20);
      ctx.restore();
    }
    const img = panel.photo != null ? photos[panel.photo] ?? null : null;
    drawPhoto(ctx, img, rect, panel, state.grade, state.tint);
  });

  if (state.ink) {
    ctx.save();
    ctx.strokeStyle = 'rgba(10,4,20,0.9)';
    ctx.lineWidth = Math.max(3, w * 0.005);
    for (const r of rects) {
      ctx.save();
      if (r.rot) {
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate(r.rot);
        ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
      }
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = Math.max(1, w * 0.0015);
    ctx.strokeRect(w * 0.008, h * 0.008, w * 0.984, h * 0.984);
    ctx.restore();
  }

  // Title band: dark gradient rising from the foot, halftone dots, big lettering.
  const bandH = h * 0.26;
  const band = ctx.createLinearGradient(0, h - bandH * 1.6, 0, h);
  band.addColorStop(0, 'rgba(12,4,24,0)');
  band.addColorStop(0.55, 'rgba(12,4,24,0.55)');
  band.addColorStop(1, 'rgba(12,4,24,0.92)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h - bandH * 1.6, w, bandH * 1.6);

  if (state.halftone) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    const step = Math.max(10, w * 0.014);
    const r = Math.max(1.5, w * 0.0022);
    for (let yy = h - bandH + step / 2; yy < h - 6; yy += step) {
      for (let xx = step / 2; xx < w; xx += step) {
        ctx.beginPath();
        ctx.arc(xx, yy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitFont(ctx, title, 'Anton, sans-serif', h * 0.13, w * 0.92);
    const grad = ctx.createLinearGradient(0, h - bandH * 0.9, 0, h - h * 0.02);
    grad.addColorStop(0, '#ffe259');
    grad.addColorStop(0.5, '#ff7e5f');
    grad.addColorStop(1, '#ff2e88');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.07;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.03;
    ctx.strokeText(title, w / 2, h - h * 0.085);
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, h - h * 0.085);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const subtitle = (state.subtitle || '').trim();
  if (subtitle) {
    const size = fitFont(ctx, subtitle, 'Pacifico, cursive', h * 0.045, w * 0.8);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8ef6ff';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = size * 0.7;
    ctx.fillText(subtitle, w / 2, h - h * 0.015);
    ctx.shadowBlur = 0;
  }

  // Badge ribbon, top-left corner.
  const badge = (state.badge || '').trim();
  if (badge) {
    ctx.save();
    ctx.translate(w * 0.02, h * 0.055);
    ctx.rotate(-0.06);
    ctx.font = `${Math.round(h * 0.026)}px Anton, sans-serif`;
    const bw = Math.min(w * 0.34, ctx.measureText(badge.toUpperCase()).width + 40);
    ctx.fillStyle = '#f5c542';
    ctx.fillRect(0, 0, bw, h * 0.045);
    ctx.fillStyle = '#1c0b2e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge.toUpperCase(), 18, h * 0.023);
    ctx.restore();
  }

  // Heat meter: a row of stars, top-right.
  const stars = Math.max(0, Math.min(5, state.stars ?? 0));
  if (stars > 0) {
    const sr = Math.max(8, h * 0.022);
    const gap = sr * 2.4;
    const total = gap * 5;
    for (let i = 0; i < 5; i += 1) {
      const cx = w - total + i * gap + sr;
      const cy = h * 0.055;
      starPath(ctx, cx, cy, sr);
      if (i < stars) {
        ctx.fillStyle = '#ffd23d';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  if (state.vignette) {
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = getGrain(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
