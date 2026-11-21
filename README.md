# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Khamami13/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Khamami13/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Coast Cover Studio** — a fully offline browser app that turns your photos into a multi-panel GTA-style cover: six poster layouts, five Vice City sunset / neon grades, bold Anton title lettering with a sunset gradient, a neon Pacifico subtitle, a badge ribbon and a heat meter of stars, then one-click PNG exports in 1080×1080, 1080×1350 and 1920×1080. Your photos never leave your machine, and the app makes no network request at all.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Add photos (or use the built-in samples), click a panel to place a photo in it, drag to move it, scroll to zoom, pick a layout and grade, write your title, and export a PNG.

## What it does

- **6 layouts** — 4-panel grid, hero-and-three, full bleed, 9-panel grid, tilted snapshot, story.
- **Per-panel photos** — upload your own photos, or fill several panels with one photo; crop and position each panel by dragging and scrolling, or with the zoom / position sliders. Undo and redo included.
- **5 grades** — Vice sunset, neon night, Vice City, heat wave and noir, with a tint-strength slider.
- **Lettering** — invented titles only ("Neon Shore", "Night Shift", "Pier Pressure"), big Anton capitals with a sunset-gradient fill and white outline, a glowing Pacifico subtitle, a badge ribbon and a 0–5 star heat meter.
- **Effects** — film grain, vignette, halftone title block, panel ink and bands.
- **Exports** — 1080×1080, 1080×1350 and 1920×1080 PNGs, one click each or all three at once.
- **Offline** — static files only; every script, font and image is a file under `app/`. Fonts are Anton and Pacifico (SIL Open Font License, texts in `app/fonts/`). No Rockstar logo, artwork or font anywhere — all art is original.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
