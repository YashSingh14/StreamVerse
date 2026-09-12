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
  progressPercentage: number; // e.g. 64
  currentTime: string; // e.g. "1h 12m"
  totalTime: string; // e.g. "2h 46m"
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
      items: [
        {
          id: 693134,
          mediaType: "movie",
          title: "Dune: Part Two",
          posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
          backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg",
          progressPercentage: 68,
          currentTime: "1h 52m",
          totalTime: "2h 46m",
          lastWatched: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
        },
        {
          id: 94605,
          mediaType: "tv",
          title: "Arcane",
          posterPath: "/abf8tZvngEG9fJ0sh9qJ0XsqFvh.jpg",
          backdropPath: "/7cqKGQyRxlwz1Qp9oZ5i02dY65r.jpg",
          progressPercentage: 42,
          currentTime: "18m",
          totalTime: "44m",
          season: 2,
          episode: 3,
          lastWatched: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        },
      ],

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
