// src/services/types.ts
// Shared TMDB response types. Only fields the app actually uses are typed —
// extend as needed rather than trying to mirror TMDB's full schema.

export type MediaType = "movie" | "tv" | "person";
export type TimeWindow = "day" | "week";

export interface Genre {
  id: number;
  name: string;
}

export interface ConfigurationResponse {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
    profile_sizes: string[];
  };
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Loosely covers movie, tv, and person shapes returned by /search/multi,
// /trending, /discover, and the various list endpoints.
export interface SearchMultiResult {
  id: number;
  media_type?: MediaType;
  title?: string; // movies
  name?: string; // tv shows / people
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  profile_path?: string | null; // people
  release_date?: string; // movies
  first_air_date?: string; // tv
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  original_language?: string;
}

export interface Video {
  id: string;
  key: string; // YouTube video key
  site: "YouTube" | string;
  type: "Trailer" | "Teaser" | "Clip" | string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface AppendedResponse {
  videos?: { results: Video[] };
  credits?: { cast: CastMember[] };
  similar?: PaginatedResponse<SearchMultiResult>;
  recommendations?: PaginatedResponse<SearchMultiResult>;
}

export interface MovieDetails extends AppendedResponse {
  id: number;
  title: string;
  tagline: string | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: Genre[];
  vote_average: number;
  vote_count: number;
  original_language: string;
}

export interface TvSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface TvDetails extends AppendedResponse {
  id: number;
  name: string;
  tagline: string | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TvSeasonSummary[];
  genres: Genre[];
  vote_average: number;
  vote_count: number;
  original_language: string;
}
