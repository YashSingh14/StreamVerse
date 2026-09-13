// src/store/continueWatchingStore.ts
// Persists user playback progress locally for the Continue Watching row.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaType } from "../services/types";

export interface ContinueWatchingItem {
  id: number;
  mediaType: Exclude<MediaType, "person">;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progressPercentage: number;
  currentTime: string;
  totalTime: string;
  season?: number;
  episode?: number;
  lastWatched: number;
}

interface ContinueWatchingState {
  items: ContinueWatchingItem[];
  updateProgress: (item: Omit<ContinueWatchingItem, "lastWatched">) => void;
  removeItem: (id: number, mediaType: MediaType) => void;
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
  persist(
    (set, get) => ({
      items: [],

      updateProgress: (item) => {
        set((state) => {
          const filtered = state.items.filter(
            (i) => !(i.id === item.id && i.mediaType === item.mediaType)
          );
          return {
            items: [{ ...item, lastWatched: Date.now() }, ...filtered],
          };
        });
      },

      removeItem: (id, mediaType) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.mediaType === mediaType)
          ),
        }));
      },
    }),
    { name: "streamverse-continue-watching" }
  )
);
