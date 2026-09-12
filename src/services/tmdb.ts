// src/services/tmdb.ts
// TMDB API v3 service layer — typed, cached-friendly, single source of truth
// for every network call the app makes to The Movie Database.
//
// Requires: VITE_TMDB_API_KEY set in .env (use the v4 "Read Access Token", 
// sent as a Bearer token — NOT the v3 API key query param).
// Also supports in-browser token override for zero-rebuild setup.

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
} from "./types";
import {
  MOCK_GENRES,
  MOCK_TRENDING,
  MOCK_MOVIE_DETAILS,
  MOCK_TV_DETAILS
} from "./mockData";

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
    // Reload or notify queries
    window.location.reload();
  }
}

export function hasApiToken(): boolean {
  const token = getApiToken();
  return Boolean(token && token.length > 10 && token !== "your_tmdb_v4_read_access_token_here");
}

if (!hasApiToken()) {
  console.warn(
    "[tmdb.ts] No valid VITE_TMDB_API_KEY found. Running in high-fidelity preview mode. " +
    "Add your v4 token to .env or in the StreamVerse Settings UI once received from TMDB."
  );
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

  // If no token is configured, return realistic mock preview data rather than failing
  if (!hasApiToken()) {
    return handleMockFallback<T>(path, params);
  }

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
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
    // Fallback to mock data on error so UI never crashes
    console.warn(`[tmdb.ts] Request failed for ${path}, falling back to preview data.`, err);
    return handleMockFallback<T>(path, params);
  }
}

// Fallback provider for preview mode
function handleMockFallback<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): T {
  if (path.includes("/configuration/languages")) {
    return [
      { iso_639_1: "en", english_name: "English", name: "English" },
      { iso_639_1: "ko", english_name: "Korean", name: "한국어/조선말" },
      { iso_639_1: "ja", english_name: "Japanese", name: "日本語" },
      { iso_639_1: "hi", english_name: "Hindi", name: "हिन्दी" },
      { iso_639_1: "es", english_name: "Spanish", name: "Español" },
      { iso_639_1: "fr", english_name: "French", name: "Français" },
      { iso_639_1: "de", english_name: "German", name: "Deutsch" },
    ] as unknown as T;
  }

  if (path === "/configuration") {
    return {
      images: {
        base_url: "https://image.tmdb.org/t/p/",
        secure_base_url: "https://image.tmdb.org/t/p/",
        poster_sizes: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
        backdrop_sizes: ["w300", "w780", "w1280", "original"],
        profile_sizes: ["w45", "w185", "h632", "original"]
      }
    } as unknown as T;
  }

  if (path.includes("/genre/")) {
    return { genres: MOCK_GENRES } as unknown as T;
  }

  if (path.startsWith("/movie/")) {
    const id = Number(path.split("/")[2]);
    const found = MOCK_MOVIE_DETAILS[id] || {
      ...MOCK_MOVIE_DETAILS[693134],
      id,
      title: MOCK_TRENDING.find(m => m.id === id)?.title || "Cinematic Feature",
      overview: MOCK_TRENDING.find(m => m.id === id)?.overview || MOCK_MOVIE_DETAILS[693134].overview,
      poster_path: MOCK_TRENDING.find(m => m.id === id)?.poster_path || MOCK_MOVIE_DETAILS[693134].poster_path,
      backdrop_path: MOCK_TRENDING.find(m => m.id === id)?.backdrop_path || MOCK_MOVIE_DETAILS[693134].backdrop_path,
    };
    return found as unknown as T;
  }

  if (path.startsWith("/tv/")) {
    if (path.includes("/season/")) {
      return {
        episodes: [
          {
            id: 101,
            episode_number: 1,
            name: "Welcome to the Playground",
            overview: "Orphaned sisters Vi and Powder bring trouble to Zaun's underground streets following a heist in posh Piltover.",
            still_path: "/7cqKGQyRxlwz1Qp9oZ5i02dY65r.jpg",
            air_date: "2021-11-06",
            vote_average: 8.8
          },
          {
            id: 102,
            episode_number: 2,
            name: "Some Mysteries Are Better Left Unsolved",
            overview: "Idealistic inventor Jayce attempts to harness hextech magic despite warnings from his mentor.",
            still_path: "/2meov49Y2g14w7k65W2sNq3u9l5.jpg",
            air_date: "2021-11-06",
            vote_average: 8.7
          },
          {
            id: 103,
            episode_number: 3,
            name: "The Base Violence Necessary for Change",
            overview: "An epic showdown between old rivals leads to a fateful turning point for Zaun.",
            still_path: "/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg",
            air_date: "2021-11-06",
            vote_average: 9.6
          }
        ]
      } as unknown as T;
    }
    const id = Number(path.split("/")[2]);
    const found = MOCK_TV_DETAILS[id] || {
      ...MOCK_TV_DETAILS[94605],
      id,
      name: MOCK_TRENDING.find(m => m.id === id)?.name || "Original Series",
      overview: MOCK_TRENDING.find(m => m.id === id)?.overview || MOCK_TV_DETAILS[94605].overview,
      poster_path: MOCK_TRENDING.find(m => m.id === id)?.poster_path || MOCK_TV_DETAILS[94605].poster_path,
      backdrop_path: MOCK_TRENDING.find(m => m.id === id)?.backdrop_path || MOCK_TV_DETAILS[94605].backdrop_path,
    };
    return found as unknown as T;
  }

  // Filter or search mock
  let results = [...MOCK_TRENDING];
  if (params.query) {
    const q = String(params.query).toLowerCase();
    results = results.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.name && item.name.toLowerCase().includes(q))
    );
  }

  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length
  } as unknown as T;
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
  withOriginalLanguage?: string; // ISO 639-1, e.g. "ko", "hi", "ja"
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

// ---------------------------------------------------------------------------
// Curated "language row" presets — used on the Home page.
// Add/remove entries here to change which language rows appear.
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
