// src/services/tmdb.ts
// TMDB API service layer — typed, cache-friendly, single source of truth
// for every network call the app makes to The Movie Database.
//
// Supports both TMDB v3 API Key (?api_key=...) and v4 Read Access Token (Bearer auth).

import type {
  ConfigurationResponse,
  Genre,
  Language,
  MediaType,
  MovieDetails,
  PaginatedResponse,
  SearchMultiResult,
  TimeWindow,
  TvDetails,
  WatchProvidersResponse,
} from "./types";

const BASE_URL = "https://api.themoviedb.org/3";

export function getApiToken(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("streamverse_tmdb_token");
    if (saved && saved.trim()) return saved.trim();
  }
  return (import.meta.env.VITE_TMDB_API_KEY as string) || "";
}

export function setLocalApiToken(token: string) {
  if (typeof window !== "undefined") {
    if (token.trim()) {
      localStorage.setItem("streamverse_tmdb_token", token.trim());
    } else {
      localStorage.removeItem("streamverse_tmdb_token");
    }
    window.location.reload();
  }
}

export function hasApiToken(): boolean {
  const token = getApiToken();
  return Boolean(token && token.length > 5);
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

async function tmdbFetch<T>(
  path: string,
  { params = {}, signal }: RequestOptions = {},
  retries = 2
): Promise<T> {
  const token = getApiToken();
  const url = new URL(`${BASE_URL}${path}`);

  // Determine auth mode: v3 32-char hex key vs v4 Bearer JWT
  const isV3Key = token.length === 32 && !token.includes(".");
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (isV3Key) {
    url.searchParams.set("api_key", token);
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers,
    });

    // TMDB rate limit: handle 429 with a short backoff + retry.
    if (res.status === 429 && retries > 0) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return tmdbFetch<T>(path, { params, signal }, retries - 1);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `TMDB request failed: ${res.status} ${res.statusText} — ${path} ${body}`
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0 && !(err instanceof DOMException)) {
      // Transient network failure — retry once more before giving up.
      return tmdbFetch<T>(path, { params, signal }, retries - 1);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Configuration (image base URLs, sizes) — fetch once, cache in React Query
// ---------------------------------------------------------------------------

export function getConfiguration(signal?: AbortSignal) {
  return tmdbFetch<ConfigurationResponse>("/configuration", { signal });
}

let cachedImageBase: string | null = null;

/**
 * Builds a full image URL from a TMDB path (e.g. "/abc123.jpg").
 * Falls back to the standard CDN base if configuration hasn't loaded yet.
 */
export function buildImageUrl(
  path: string | null | undefined,
  size: "w200" | "w300" | "w342" | "w500" | "w780" | "original" = "w500"
): string | null {
  if (!path) return null;
  const base = cachedImageBase ?? "https://image.tmdb.org/t/p/";
  return `${base}${size}${path}`;
}

export function setCachedImageBase(base: string) {
  cachedImageBase = base;
}

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export function getLanguages(signal?: AbortSignal) {
  return tmdbFetch<Language[]>("/configuration/languages", { signal });
}

// ---------------------------------------------------------------------------
// Genres
// ---------------------------------------------------------------------------

export function getMovieGenres(signal?: AbortSignal) {
  return tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", { signal });
}

export function getTvGenres(signal?: AbortSignal) {
  return tmdbFetch<{ genres: Genre[] }>("/genre/tv/list", { signal });
}

// ---------------------------------------------------------------------------
// Trending / curated rows
// ---------------------------------------------------------------------------

export function getTrending(
  mediaType: MediaType | "all",
  timeWindow: TimeWindow = "day",
  page = 1,
  signal?: AbortSignal
) {
  return tmdbFetch<PaginatedResponse<SearchMultiResult>>(
    `/trending/${mediaType}/${timeWindow}`,
    { params: { page }, signal }
  );
}

export function getMovieList(
  list: "popular" | "top_rated" | "upcoming" | "now_playing",
  page = 1,
  signal?: AbortSignal
) {
  return tmdbFetch<PaginatedResponse<SearchMultiResult>>(`/movie/${list}`, {
    params: { page },
    signal,
  });
}

export function getTvList(
  list: "popular" | "top_rated" | "on_the_air" | "airing_today",
  page = 1,
  signal?: AbortSignal
) {
  return tmdbFetch<PaginatedResponse<SearchMultiResult>>(`/tv/${list}`, {
    params: { page },
    signal,
  });
}

// ---------------------------------------------------------------------------
// Discover — powers the Browse page filters
// ---------------------------------------------------------------------------

export interface DiscoverParams {
  mediaType: "movie" | "tv";
  page?: number;
  withGenres?: number[];
  withOriginalLanguage?: string;
  releaseYearGte?: number;
  releaseYearLte?: number;
  voteAverageGte?: number;
  sortBy?:
    | "popularity.desc"
    | "vote_average.desc"
    | "primary_release_date.desc"
    | "revenue.desc";
}

export function discover(
  {
    mediaType,
    page = 1,
    withGenres,
    withOriginalLanguage,
    releaseYearGte,
    releaseYearLte,
    voteAverageGte,
    sortBy = "popularity.desc",
  }: DiscoverParams,
  signal?: AbortSignal
) {
  const dateField =
    mediaType === "movie" ? "primary_release_date" : "first_air_date";

  return tmdbFetch<PaginatedResponse<SearchMultiResult>>(
    `/discover/${mediaType}`,
    {
      params: {
        page,
        sort_by: sortBy,
        with_genres: withGenres && withGenres.length > 0 ? withGenres.join(",") : undefined,
        with_original_language: withOriginalLanguage || undefined,
        "vote_average.gte": voteAverageGte,
        [`${dateField}.gte`]: releaseYearGte
          ? `${releaseYearGte}-01-01`
          : undefined,
        [`${dateField}.lte`]: releaseYearLte
          ? `${releaseYearLte}-12-31`
          : undefined,
        "vote_count.gte": 15,
      },
      signal,
    }
  );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function searchMulti(query: string, page = 1, signal?: AbortSignal) {
  return tmdbFetch<PaginatedResponse<SearchMultiResult>>("/search/multi", {
    params: { query, page, include_adult: false },
    signal,
  });
}

// ---------------------------------------------------------------------------
// Details
// ---------------------------------------------------------------------------

export function getMovieDetails(id: number, signal?: AbortSignal) {
  return tmdbFetch<MovieDetails>(`/movie/${id}`, {
    params: { append_to_response: "videos,credits,similar,recommendations,images" },
    signal,
  });
}

export function getTvDetails(id: number, signal?: AbortSignal) {
  return tmdbFetch<TvDetails>(`/tv/${id}`, {
    params: { append_to_response: "videos,credits,similar,recommendations,images" },
    signal,
  });
}

export function getTvSeason(
  tvId: number,
  seasonNumber: number,
  signal?: AbortSignal
) {
  return tmdbFetch<{
    episodes: Array<{
      id: number;
      episode_number: number;
      name: string;
      overview: string;
      still_path: string | null;
      air_date: string;
      vote_average: number;
    }>;
  }>(`/tv/${tvId}/season/${seasonNumber}`, { signal });
}

export function getRecommendations(
  mediaType: "movie" | "tv",
  id: number,
  signal?: AbortSignal
) {
  return tmdbFetch<PaginatedResponse<SearchMultiResult>>(
    `/${mediaType}/${id}/recommendations`,
    { signal }
  );
}

export function getWatchProviders(
  mediaType: "movie" | "tv",
  id: number,
  signal?: AbortSignal
) {
  return tmdbFetch<WatchProvidersResponse>(
    `/${mediaType}/${id}/watch/providers`,
    { signal }
  );
}

// ---------------------------------------------------------------------------
// Curated "language row" presets — used on the Home page.
// ---------------------------------------------------------------------------

export const LANGUAGE_ROW_PRESETS: Array<{
  title: string;
  language: string;
  mediaType: "movie" | "tv";
}> = [
  { title: "Korean Dramas", language: "ko", mediaType: "tv" },
  { title: "Bollywood Hits", language: "hi", mediaType: "movie" },
  { title: "Anime", language: "ja", mediaType: "tv" },
  { title: "Spanish Cinema", language: "es", mediaType: "movie" },
  { title: "French Films", language: "fr", mediaType: "movie" },
];
