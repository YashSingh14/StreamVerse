// src/store/watchlistStore.ts
// Persisted watchlist + favorites store. No backend needed — this is a
// personal single-user app, so localStorage persistence is sufficient.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaType } from "../services/types";

export interface SavedItem {
  id: number;
  mediaType: Exclude<MediaType, "person">;
  title: string;
  posterPath: string | null;
  addedAt: number;
}

interface WatchlistState {
  watchlist: SavedItem[];
  favorites: SavedItem[];
  addToWatchlist: (item: Omit<SavedItem, "addedAt">) => void;
  removeFromWatchlist: (id: number, mediaType: MediaType) => void;
  toggleFavorite: (item: Omit<SavedItem, "addedAt">) => void;
  isInWatchlist: (id: number, mediaType: MediaType) => boolean;
  isFavorite: (id: number, mediaType: MediaType) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      favorites: [],

      addToWatchlist: (item) => {
        if (get().isInWatchlist(item.id, item.mediaType)) return;
        set((state) => ({
          watchlist: [...state.watchlist, { ...item, addedAt: Date.now() }],
        }));
      },

      removeFromWatchlist: (id, mediaType) => {
        set((state) => ({
          watchlist: state.watchlist.filter(
            (i) => !(i.id === id && i.mediaType === mediaType)
          ),
        }));
      },

      toggleFavorite: (item) => {
        const exists = get().isFavorite(item.id, item.mediaType);
        set((state) => ({
          favorites: exists
            ? state.favorites.filter(
                (i) => !(i.id === item.id && i.mediaType === item.mediaType)
              )
            : [...state.favorites, { ...item, addedAt: Date.now() }],
        }));
      },

      isInWatchlist: (id, mediaType) =>
        get().watchlist.some(
          (i) => i.id === id && i.mediaType === mediaType
        ),

      isFavorite: (id, mediaType) =>
        get().favorites.some(
          (i) => i.id === id && i.mediaType === mediaType
        ),
    }),
    { name: "streamverse-watchlist" }
  )
);
