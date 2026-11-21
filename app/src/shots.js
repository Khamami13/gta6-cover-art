// Fixed scenes for screenshots: ?shot=cover shows a landscape exported cover,
// ?shot=cover-portrait a 1080x1350 cover, ?shot=cover-square a square cover,
// ?shot=editor the editor with sample photos loaded. `photo` picks the sample
// set, `title` and `subtitle` the words. window.__shotReady is set once painted.
export const SCENES = {
  cover: {
    size: [1920, 1080],
    photos: [0, 1, 0, 1],
    state: { layout: 'hero3', grade: 'sunset', tint: 0.75, title: 'Neon Shore', subtitle: 'Vice nights, your story', badge: 'Est. 2026', stars: 4, grain: true, vignette: true, halftone: true, ink: true },
  },
  'cover-portrait': {
    size: [1080, 1350],
    photos: [1, 0, 1, 0],
    state: { layout: 'grid4', grade: 'neon', tint: 0.7, title: 'Pier Pressure', subtitle: 'Neon tides, midnight rides', badge: 'Est. 2026', stars: 5, grain: true, vignette: true, halftone: true, ink: true },
  },
  'cover-square': {
    size: [1080, 1080],
    photos: [0, 1, 0, 1, 0, 1, 0, 1, 0],
    state: { layout: 'grid9', grade: 'vice', tint: 0.65, title: 'Night Shift', subtitle: 'The city never clocks out', badge: 'Est. 2026', stars: 4, grain: true, vignette: true, halftone: true, ink: true },
  },
  editor: {
    photos: [0, 1, 0, 1],
    state: { layout: 'grid4', grade: 'sunset', tint: 0.7, title: 'Neon Shore', subtitle: 'Vice nights, your story', badge: 'Est. 2026', stars: 4, grain: true, vignette: true, halftone: true, ink: true },
  },
};

export async function runShot(shot, query, api) {
  const scene = SCENES[shot] ?? SCENES.editor;
  const state = { ...scene.state };
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  await api.loadSamples();
  api.applyScene({ ...scene, state });
  requestAnimationFrame(() => requestAnimationFrame(() => api.markReady()));
}
