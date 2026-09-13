// src/hooks/useTmdb.ts
// Thin React Query wrappers around services/tmdb.ts. Keeping these separate
// from the raw fetch functions means components never touch fetch/caching
// details directly — they just call a hook and get data/isLoading/error.

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as tmdb from "../services/tmdb";
import type { DiscoverParams } from "../services/tmdb";

// Genres change essentially never — cache for a long time.
const GENRE_STALE_TIME = 1000 * 60 * 60 * 24; // 24h
const LIST_STALE_TIME = 1000 * 60 * 5; // 5m

export function useConfiguration() {
  return useQuery({
    queryKey: ["configuration"],
    queryFn: ({ signal }) => tmdb.getConfiguration(signal),
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: ({ signal }) => tmdb.getLanguages(signal),
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}

export function useMovieGenres() {
  return useQuery({
    queryKey: ["genres", "movie"],
    queryFn: ({ signal }) => tmdb.getMovieGenres(signal),
    staleTime: GENRE_STALE_TIME,
  });
}

export function useTvGenres() {
  return useQuery({
    queryKey: ["genres", "tv"],
    queryFn: ({ signal }) => tmdb.getTvGenres(signal),
    staleTime: GENRE_STALE_TIME,
  });
}

export function useTrending(mediaType: "all" | "movie" | "tv" = "all", timeWindow: "day" | "week" = "day") {
  return useQuery({
    queryKey: ["trending", mediaType, timeWindow],
    queryFn: ({ signal }) => tmdb.getTrending(mediaType, timeWindow, 1, signal),
    staleTime: LIST_STALE_TIME,
  });
}

export function useMovieList(
  list: "popular" | "top_rated" | "upcoming" | "now_playing"
) {
  return useQuery({
    queryKey: ["movies", list],
    queryFn: ({ signal }) => tmdb.getMovieList(list, 1, signal),
    staleTime: LIST_STALE_TIME,
  });
}

export function useTvList(
  list: "popular" | "top_rated" | "on_the_air" | "airing_today"
) {
  return useQuery({
    queryKey: ["tv", list],
    queryFn: ({ signal }) => tmdb.getTvList(list, 1, signal),
    staleTime: LIST_STALE_TIME,
  });
}

// Infinite scroll for the Browse/Discover page.
export function useDiscover(params: Omit<DiscoverParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["discover", params],
    queryFn: ({ pageParam = 1, signal }) =>
      tmdb.discover({ ...params, page: pageParam as number }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: LIST_STALE_TIME,
  });
}

export function useSearchMulti(query: string) {
  return useInfiniteQuery({
    queryKey: ["search", query],
    queryFn: ({ pageParam = 1, signal }) =>
      tmdb.searchMulti(query, pageParam as number, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: query.trim().length > 0,
    staleTime: LIST_STALE_TIME,
  });
}

export function useMovieDetails(id: number | undefined) {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: ({ signal }) => tmdb.getMovieDetails(id as number, signal),
    enabled: id !== undefined && !isNaN(id),
  });
}

export function useTvDetails(id: number | undefined) {
  return useQuery({
    queryKey: ["tv", "details", id],
    queryFn: ({ signal }) => tmdb.getTvDetails(id as number, signal),
    enabled: id !== undefined && !isNaN(id),
  });
}

export function useTvSeason(tvId: number | undefined, seasonNumber: number) {
  return useQuery({
    queryKey: ["tv", tvId, "season", seasonNumber],
    queryFn: ({ signal }) =>
      tmdb.getTvSeason(tvId as number, seasonNumber, signal),
    enabled: tvId !== undefined && !isNaN(tvId),
  });
}

export function useRecommendations(mediaType: "movie" | "tv", id: number | undefined) {
  return useQuery({
    queryKey: ["recommendations", mediaType, id],
    queryFn: ({ signal }) =>
      tmdb.getRecommendations(mediaType, id as number, signal),
    enabled: id !== undefined && !isNaN(id),
    staleTime: LIST_STALE_TIME,
  });
}

// One hook per curated language row preset, used to build Home page rows.
export function useLanguageRow(language: string, mediaType: "movie" | "tv") {
  return useQuery({
    queryKey: ["language-row", language, mediaType],
    queryFn: ({ signal }) =>
      tmdb.discover(
        { mediaType, withOriginalLanguage: language, sortBy: "popularity.desc" },
        signal
      ),
    staleTime: LIST_STALE_TIME,
  });
}

export function useWatchProviders(
  mediaType: "movie" | "tv",
  id: number | undefined
) {
  return useQuery({
    queryKey: ["watch-providers", mediaType, id],
    queryFn: ({ signal }) =>
      tmdb.getWatchProviders(mediaType, id as number, signal),
    enabled: id !== undefined && !isNaN(id),
    staleTime: 1000 * 60 * 60 * 12, // 12h
  });
}
