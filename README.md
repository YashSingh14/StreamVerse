# StreamVerse — Personal Streaming Platform

A premium personal streaming platform web application powered by The Movie Database (TMDB) API, built with React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query, and Zustand.

---

## Features

- **Hero Carousel**: Auto-rotating featured trending content with backdrop images, rating, release year, genre tags, "Play Trailer" modal, and "More Info" navigation.
- **Curated Rows & Carousels**:
  - Trending Today
  - Continue Watching (with progress bar, remaining time, and resume playback)
  - Popular Movies & Popular TV Shows
  - Curated Language Rows (*Korean Dramas*, *Bollywood Hits*, *Anime*, *Spanish Cinema*, *French Films*) powered by `LANGUAGE_ROW_PRESETS`
  - All-Time Critically Acclaimed & Upcoming Releases
  - Dynamic "Because you watched" recommendation rows based on saved items
- **Browse & Filter Universe**:
  - Multi-select genre filter chips
  - Searchable original language selector
  - Dual release year range selector (1990 – present)
  - Minimum rating slider (0 – 10)
  - Sort by Popularity, Rating, Release Date, Box Office Revenue
  - Infinite scroll with IntersectionObserver sentinel
- **Universal Instant Search**:
  - Debounced search-as-you-type using `useSearchMulti`
  - Filter tabs: *All Results*, *Movies*, *TV Shows*, and *People & Cast*
- **Detail Pages (`/movie/:id` & `/tv/:id`)**:
  - Backdrop hero with gradient vignettes and poster
  - Title, tagline, overview, runtime/seasons, ratings, match score
  - Cast carousel with character names and headshots
  - **TV Season & Episode Browser**: Episode still images, titles, numbers, runtimes, ratings, and synopses
  - "More Like This" recommendations carousel
- **My Library & Watchlist (`/watchlist`)**:
  - Watchlist & Favorites persisted to `localStorage`
  - "In Progress" playback tracking
- **Command Palette (`Ctrl+K`)**: Instant modal navigation and quick search from anywhere in the app.
- **Trailer & Video Player**: YouTube video modal for trailers and clips.
- **Zero-Friction Setup**: Supports high-fidelity preview mode, and allows instant TMDB API token entry via `.env` or the in-app configuration modal.

---

## Deploying to Vercel

1. Push this repository to GitHub or import the project directory in the [Vercel Dashboard](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy! Once deployed, copy your Vercel URL (e.g. `https://streamverse.vercel.app`).
6. Register this URL with TMDB to receive your v4 API Read Access Token.

---

## Setting Up Your TMDB API Token

Once you have received your TMDB API token:
1. Copy the **API Read Access Token (v4 auth)** from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
2. Add it to your `.env` file:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_v4_read_access_token_here
   ```
   *(Or add `VITE_TMDB_API_KEY` to your Vercel Project Environment Variables).*
3. Alternatively, click the **"API Setup"** button in the StreamVerse navbar and paste your token directly into the browser.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
