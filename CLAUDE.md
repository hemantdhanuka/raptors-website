# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server
npm run dev          # http://localhost:3000

# Build (runs next build — all routes must be static)
npm run build

# Lint
npm run lint

# Scraper — fetches fresh data from CricHeroes API → public/data.json
cd scraper && pip install -r requirements.txt && python scrape.py
```

After running the scraper, restart the dev server to pick up the new `public/data.json`.

## Architecture

**Data flow:** Python scraper → `public/data.json` → imported at build time by `src/lib/data.ts` → passed to all pages as static props. There is no database, no API routes, and no server-side rendering. All routes are statically generated.

**`public/data.json`** is the single source of truth for all content. It is committed to the repo and auto-refreshed every 6 hours by GitHub Actions (`.github/workflows/refresh-data.yml`), which commits the updated file and triggers a Vercel redeploy.

**`src/lib/data.ts`** imports `data.json` directly (typed via `TeamData` in `src/lib/types.ts`) and exports helper functions (`getTeamData`, `getMatchResult`, `getWinStreak`, etc.) used by all pages.

**Scraper (`scraper/scrape.py`)** calls the CricHeroes internal REST API directly using `cloudscraper`. No browser or Selenium needed. Paginates all endpoints including the leaderboard (10 entries/page). Key: `cr!CkH3r0s`, required headers: `api-key`, `device-type: web`, `udid: <uuid4>`. Team ID: `5686590`.

**Fielding leaderboard** uses `total_dismissal` (not `catches`) as the stat — wicket keepers accumulate dismissals via `caught_behind` + stumpings which aren't reflected in the `catches` field alone.

## Tailwind v4 Dark Mode

This project uses **Tailwind CSS v4**. Dark mode does NOT work with the standard `darkMode: 'class'` config. Instead, `globals.css` declares:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This is required for `next-themes` (which sets a `.dark` class on `<html>`) to work with Tailwind v4. Do not remove this line. Dark background is `#0a0a0a` (true black), not slate — use `dark:bg-[#0a0a0a]`, `dark:bg-[#111]`, `dark:bg-[#1a1a1a]` for layered surfaces.

## Theme

Emerald (`emerald-500`) is the primary accent colour throughout. Wins are emerald, losses are red, draws are zinc/gray.
