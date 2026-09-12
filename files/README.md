# StreamVerse — Starter Kit

These files are a head start for the Antigravity prompt: the TMDB service
layer, shared types, a watchlist store, and React Query hooks. Hand these
to Antigravity alongside the prompt so it scaffolds *around* this code
instead of reinventing it.

## Setup

1. Get a TMDB API key:
   - Create a free account at https://www.themoviedb.org
   - Go to Settings → API → request an API key (choose "Developer")
   - Copy the **API Read Access Token** (long JWT-style string), not the
     shorter v3 key
2. Copy `.env.example` to `.env` and paste your token in as
   `VITE_TMDB_API_KEY`
3. Place these files into a fresh Vite + React + TypeScript project:
   ```
   src/
     services/
       tmdb.ts       <- from this kit
       types.ts      <- from this kit
     store/
       watchlistStore.ts   <- from this kit
     hooks/
       useTmdb.ts    <- from this kit
   ```
4. Install dependencies:
   ```bash
   npm create vite@latest streamverse -- --template react-ts
   cd streamverse
   npm install zustand @tanstack/react-query react-router-dom \
     framer-motion lucide-react react-player
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
5. Wrap your app root in a `QueryClientProvider` (React Query) and a
   `BrowserRouter` (React Router).
6. Feed this kit + the Antigravity prompt to the agent and let it build
   out components/pages on top of this foundation.

## Notes

- `tmdb.ts` handles auth, retries on 429/network errors, and image URL
  building — components should never call `fetch` directly.
- `LANGUAGE_ROW_PRESETS` in `tmdb.ts` is the single place to add/remove
  the curated language rows shown on the Home page.
- `watchlistStore.ts` persists to `localStorage` under the key
  `streamverse-watchlist` — no backend required.
- All data hooks live in `useTmdb.ts`; add new ones there rather than
  calling `services/tmdb.ts` functions directly inside components.
