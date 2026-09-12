// src/services/tmdb.ts
// TMDB API v3 service layer — typed, cached-friendly, single source of truth
// for every network call the app makes to The Movie Database.
//
// Requires: VITE_TMDB_API_KEY set in .env (use the v4 "Read Access Token", 
// sent as a Bearer token — NOT the v3 API key query param).

import type {
  ConfigurationResponse,
  Genre,
  MediaType,
  MovieDetails,
  PaginatedResponse,
  SearchMultiResult,
  TimeWindow,
  TvDetails,
} from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
const API_TOKEN = import.meta.env.VITE_TMDB_API_KEY as string;

if (!API_TOKEN) {
  // Fail loudly in dev rather than silently returning empty data everywhere.
  console.error(
    "[tmdb.ts] Missing VITE_TMDB_API_KEY. Add it to your .env file. " +
      "See .env.example for the expected format."
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
        Authorization: `Bearer ${API_TOKEN}`,
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
 * Falls back to the standard CDN base if configuration hasn't loaded yet —
 * this base has been stable for years but calling getConfiguration() once
 * at app startup is still the "correct" way per TMDB docs.
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
  withGenres?: number[]; // AND/OR handled by caller via comma/pipe join
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
        with_genres: withGenres?.join(","),
        with_original_language: withOriginalLanguage,
        "vote_average.gte": voteAverageGte,
        [`${dateField}.gte`]: releaseYearGte
          ? `${releaseYearGte}-01-01`
          : undefined,
        [`${dateField}.lte`]: releaseYearLte
          ? `${releaseYearLte}-12-31`
          : undefined,
        // Filters out obscure zero-vote entries from flooding results.
        "vote_count.gte": 20,
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
