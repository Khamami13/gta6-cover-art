// Neon Coast Cover Studio: wires the editor — layouts, grades, per-panel
// photos with crop and position, title lettering, effects, undo/redo and
// one-click PNG exports. A `?shot=` query sets up a fixed scene instead
// (./shots.js), so screenshots are reproducible from the app itself.
import { drawCover, LAYOUTS, GRADES, EXPORT_SIZES, panelRects } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const $ = (id) => document.getElementById(id);

const SAMPLES = ['pier', 'boulevard'];
let photos = []; // { img, name } — sample photos and the user's own uploads
let selectedPanel = 0;

export function defaultState() {
  return {
    layout: 'grid4',
    grade: 'sunset',
    tint: 0.7,
    title: 'Neon Shore',
    subtitle: 'Vice nights, your story',
    badge: 'Est. 2026',
    stars: 4,
    grain: true,
    vignette: true,
    halftone: true,
    ink: true,
    panels: [],
  };
}

let state = defaultState();

/** Keeps the panel list the layout's size, carrying assignments across. */
function fitPanels() {
  const count = LAYOUTS[state.layout].panels;
  const next = [];
  for (let i = 0; i < count; i += 1) {
    next.push(state.panels[i] ?? { photo: null, zoom: 1, fx: 0.5, fy: 0.5 });
  }
  state.panels = next;
  if (selectedPanel >= count) selectedPanel = 0;
}

function samplePanels() {
  // Alternate the two sample photos across the panels.
  state.panels = state.panels.map((p, i) => ({ ...p, photo: i % photos.length }));
}

let undoStack = [];
let redoStack = [];
function snapshot() {
  return JSON.stringify(state);
}
function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}
function applySnapshot(json) {
  state = JSON.parse(json);
  fitPanels();
  syncControls();
  redraw();
}
function updateUndoButtons() {
  $('undo').disabled = undoStack.length === 0;
  $('redo').disabled = redoStack.length === 0;
}

function redraw() {
  drawCover(canvas, photos.map((p) => p.img), state);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  photos = [];
  for (const name of SAMPLES) {
    const img = await loadImage(`samples/${name}.jpg`);
    photos.push({ img, name });
  }
  renderPhotoTray();
}

function renderPhotoTray() {
  const tray = $('photoTray');
  tray.innerHTML = '';
  photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.textContent = p.name;
    b.title = `Put "${p.name}" in the selected panel`;
    b.addEventListener('click', () => {
      pushHistory();
      state.panels[selectedPanel].photo = i;
      state.panels[selectedPanel].zoom = 1;
      state.panels[selectedPanel].fx = 0.5;
      state.panels[selectedPanel].fy = 0.5;
      redraw();
      status.textContent = `"${p.name}" is in panel ${selectedPanel + 1}.`;
    });
    tray.appendChild(b);
  });
}

function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('badge').value = state.badge;
  $('tint').value = state.tint;
  $('tintVal').textContent = `${Math.round(state.tint * 100)}%`;
  $('stars').value = String(state.stars);
  for (const key of ['grain', 'vignette', 'halftone', 'ink']) $(key).checked = state[key];
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const p = state.panels[selectedPanel];
  if (!p) return;
  $('panelLabel').textContent = `Panel ${selectedPanel + 1} of ${state.panels.length}`;
  $('zoom').value = p.zoom;
  $('zoomVal').textContent = `${p.zoom.toFixed(2)}x`;
  $('posX').value = p.fx;
  $('posY').value = p.fy;
}

function buildButtons() {
  const layoutBox = $('layouts');
  for (const [key, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = key;
    b.textContent = def.name;
    b.addEventListener('click', () => {
      if (state.layout === key) return;
      pushHistory();
      state.layout = key;
      fitPanels();
      syncControls();
      redraw();
    });
    layoutBox.appendChild(b);
  }
  const gradeBox = $('grades');
  for (const [key, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = key;
    b.textContent = def.name;
    b.addEventListener('click', () => {
      if (state.grade === key) return;
      pushHistory();
      state.grade = key;
      syncControls();
      redraw();
    });
    gradeBox.appendChild(b);
  }
  const exportBox = $('exports');
  for (const size of EXPORT_SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `PNG ${size.label}`;
    b.addEventListener('click', () => exportPNG(size.w, size.h));
    exportBox.appendChild(b);
  }
}

function renderOffscreen(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCover(c, photos.map((p) => p.img), state);
  return c;
}

function exportPNG(w, h) {
  const c = renderOffscreen(w, h);
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved neon-coast-cover-${w}x${h}.png`;
  }, 'image/png');
}

function wireEvents() {
  $('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
  $('title').addEventListener('change', pushHistory);
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  $('subtitle').addEventListener('change', pushHistory);
  $('badge').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
  $('badge').addEventListener('change', pushHistory);
  $('tint').addEventListener('input', (e) => {
    state.tint = Number(e.target.value);
    $('tintVal').textContent = `${Math.round(state.tint * 100)}%`;
    redraw();
  });
  $('tint').addEventListener('change', pushHistory);
  $('stars').addEventListener('change', (e) => {
    pushHistory();
    state.stars = Number(e.target.value);
    redraw();
  });
  for (const key of ['grain', 'vignette', 'halftone', 'ink']) {
    $(key).addEventListener('change', (e) => {
      pushHistory();
      state[key] = e.target.checked;
      redraw();
    });
  }
  document.querySelectorAll('[data-title]').forEach((b) => {
    b.addEventListener('click', () => {
      pushHistory();
      const [title, subtitle] = b.dataset.title.split('|');
      state.title = title;
      state.subtitle = subtitle;
      syncControls();
      redraw();
    });
  });

  $('zoom').addEventListener('input', (e) => {
    state.panels[selectedPanel].zoom = Number(e.target.value);
    syncPanelControls();
    redraw();
  });
  $('zoom').addEventListener('change', pushHistory);
  $('posX').addEventListener('input', (e) => {
    state.panels[selectedPanel].fx = Number(e.target.value);
    redraw();
  });
  $('posX').addEventListener('change', pushHistory);
  $('posY').addEventListener('input', (e) => {
    state.panels[selectedPanel].fy = Number(e.target.value);
    redraw();
  });
  $('posY').addEventListener('change', pushHistory);
  $('clearPanel').addEventListener('click', () => {
    pushHistory();
    state.panels[selectedPanel] = { photo: null, zoom: 1, fx: 0.5, fy: 0.5 };
    redraw();
  });
  $('fillAll').addEventListener('click', () => {
    const p = state.panels[selectedPanel];
    if (p.photo == null) {
      status.textContent = 'Put a photo in the selected panel first.';
      return;
    }
    pushHistory();
    state.panels = state.panels.map((q) => ({ ...q, photo: p.photo }));
    redraw();
    status.textContent = 'One photo now fills every panel.';
  });

  $('addPhoto').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    for (const file of files) {
      const img = await loadImage(URL.createObjectURL(file));
      photos.push({ img, name: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'photo' });
    }
    renderPhotoTray();
    status.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} added — click one, then a panel.`;
    e.target.value = '';
  });
  $('useSamples').addEventListener('click', () => {
    pushHistory();
    samplePanels();
    redraw();
    status.textContent = 'Sample photos fill the panels.';
  });

  $('undo').addEventListener('click', () => {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    applySnapshot(undoStack.pop());
    updateUndoButtons();
  });
  $('redo').addEventListener('click', () => {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    applySnapshot(redoStack.pop());
    updateUndoButtons();
  });
  $('exportAll').addEventListener('click', () => {
    for (const size of EXPORT_SIZES) exportPNG(size.w, size.h);
  });

  // Click a panel to select it; drag inside it to move the photo; wheel zooms.
  let dragging = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const rects = panelRects(state.layout, canvas.width, canvas.height);
    for (let i = rects.length - 1; i >= 0; i -= 1) {
      const r = rects[i];
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
        selectedPanel = i;
        syncPanelControls();
        dragging = { x: px, y: py, fx: state.panels[i].fx, fy: state.panels[i].fy, rw: r.w, rh: r.h };
        canvas.setPointerCapture(e.pointerId);
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const p = state.panels[selectedPanel];
    p.fx = Math.max(0, Math.min(1, dragging.fx + (px - dragging.x) / dragging.rw));
    p.fy = Math.max(0, Math.min(1, dragging.fy + (py - dragging.y) / dragging.rh));
    redraw();
  });
  canvas.addEventListener('pointerup', () => {
    if (dragging) pushHistory();
    dragging = null;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = state.panels[selectedPanel];
    p.zoom = Math.max(1, Math.min(3, p.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    syncPanelControls();
    redraw();
  }, { passive: false });
}

/** The shot scenes use: load the samples, set state, draw, flag ready. */
const shotApi = {
  async loadSamples() {
    await loadSamples();
  },
  applyScene(scene) {
    state = { ...defaultState(), ...scene.state };
    fitPanels();
    if (scene.photos) {
      state.panels = state.panels.map((p, i) => ({ ...p, photo: scene.photos[i % scene.photos.length] }));
    }
    if (scene.size) {
      canvas.width = scene.size[0];
      canvas.height = scene.size[1];
      document.body.classList.add('shot-cover');
    }
    syncControls();
    redraw();
  },
  markReady() {
    window.__shotReady = true;
  },
};

const shot = new URLSearchParams(location.search).get('shot');
buildButtons();
wireEvents();
fitPanels();
updateUndoButtons();

(async () => {
  await document.fonts.load('16px Anton');
  await document.fonts.load('16px Pacifico');
  await document.fonts.ready;
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), shotApi);
  } else {
    await loadSamples();
    samplePanels();
    syncControls();
    redraw();
  }
})();
