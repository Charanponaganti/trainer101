# PLACEMENT OS

Personal DSA and competitive programming preparation trainer for software engineering placements and coding interviews.

A fully static React app — no backend, no auth server, no paid APIs. Progress persists in **LocalStorage** and survives refresh.

## Features

- **Dashboard** — progress overview, GitHub-style heatmap, streaks, targets, charts, continue-practicing lists
- **DSA Sheets** — Blind 75, Grind 75, NeetCode 150/250, Striver A2Z & SDE, Top Interview 150, Love Babbar, Sean Prashad, TUF, SQL 50, company collections, CSES
- **Central problem database** — shared across sheets; status is global
- **Topic roadmap** — beginner → advanced with concepts, prerequisites, and E/M/H problems
- **Codeforces Arena** — rating buckets, curated ladders (800→1800+), EDU / CSES / CP-Algorithms resources
- **Company prep** — pattern checklists with clear community-reported disclaimers
- **Personal workspace** — approach notes, complexities, revision notes, local C++ (or other) code storage
- **Revision center** — 1 / 3 / 7 / 14 / 30 day intervals, overdue prioritization
- **Study planner** — daily/weekly targets, notes, session minutes, upcoming revisions
- **Analytics, bookmarks, settings** — theme, targets, JSON/CSV import-export, reset

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- LocalStorage
- HashRouter (GitHub Pages compatible)

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # typecheck + production build
npm run preview  # preview the dist/ folder
```

## GitHub Pages deployment

### 1. Set the Vite base path

In `vite.config.ts`, `base` is set to `/trainer101/` for production (matches this repo name).

### 2. Push

```bash
git add .
git commit -m "Update PLACEMENT OS"
git push -u origin main
```

### 3. Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Source**: GitHub Actions
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually)

The site will be available at:

`https://Charanponaganti.github.io/trainer101/`


Hash routing means deep links like `/#/sheets/blind-75` work after deploy.

## Data & privacy

- Progress key: `placement-os-v1` in LocalStorage
- Export JSON / CSV from **Settings** before clearing browser data
- Company tags and some sheet memberships are **community-reported prep recommendations**, not verified interview logs
- Problem links point to original platforms (LeetCode, Codeforces, CSES, etc.)

## Project structure

```
src/
  components/   UI building blocks
  pages/        Route screens
  layouts/      App shell + sidebar
  hooks/        (shared hooks if added)
  context/      Progress + drawer state
  data/         Problems, sheets, topics, CF, companies
  utils/        Storage, stats, export
  types/        Shared TypeScript interfaces
```

## License

Personal use. Problem titles and links belong to their respective platforms. Sheet names and original resource URLs are attributed to their authors.
