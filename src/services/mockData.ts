// src/services/mockData.ts
// Beautiful preview mock data used when VITE_TMDB_API_KEY is not yet supplied.
// This allows immediate deployment to Vercel so the user can register their domain with TMDB.

import type { MovieDetails, TvDetails, SearchMultiResult, Genre } from "./types";

export const MOCK_GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export const MOCK_TRENDING: SearchMultiResult[] = [
  {
    id: 693134,
    media_type: "movie",
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg",
    release_date: "2024-02-27",
    vote_average: 8.3,
    vote_count: 5120,
    genre_ids: [878, 12],
    original_language: "en"
  },
  {
    id: 872585,
    media_type: "movie",
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    release_date: "2023-07-19",
    vote_average: 8.1,
    vote_count: 8200,
    genre_ids: [18, 36],
    original_language: "en"
  },
  {
    id: 94605,
    media_type: "tv",
    name: "Arcane",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    poster_path: "/abf8tZvngEG9fJ0sh9qJ0XsqFvh.jpg",
    backdrop_path: "/7cqKGQyRxlwz1Qp9oZ5i02dY65r.jpg",
    first_air_date: "2021-11-06",
    vote_average: 8.7,
    vote_count: 3800,
    genre_ids: [16, 878, 14, 28],
    original_language: "en"
  },
  {
    id: 93405,
    media_type: "tv",
    name: "Squid Game",
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    poster_path: "/dDlGFl5UaH1b292H8hFqPq1W2eO.jpg",
    backdrop_path: "/2meov49Y2g14w7k65W2sNq3u9l5.jpg",
    first_air_date: "2021-09-17",
    vote_average: 8.4,
    vote_count: 14000,
    genre_ids: [18, 9648, 10759],
    original_language: "ko"
  },
  {
    id: 157336,
    media_type: "movie",
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [12, 18, 878],
    original_language: "en"
  },
  {
    id: 100088,
    media_type: "tv",
    name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
    poster_path: "/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
    backdrop_path: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    first_air_date: "2023-01-15",
    vote_average: 8.6,
    vote_count: 4900,
    genre_ids: [18, 10759],
    original_language: "en"
  },
  {
    id: 299536,
    media_type: "movie",
    title: "Avengers: Infinity War",
    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
    poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdrop_path: "/lmZFxVIz3ujsbUpogHG33snMsTI.jpg",
    release_date: "2018-04-25",
    vote_average: 8.3,
    vote_count: 29000,
    genre_ids: [12, 28, 878],
    original_language: "en"
  },
  {
    id: 572802,
    media_type: "movie",
    title: "Aquaman and the Lost Kingdom",
    overview: "Black Manta seeks revenge on Aquaman for his father's death. Wielding the Black Trident's power, he becomes a formidable foe. To defend Atlantis, Aquaman must forge an alliance with his imprisoned brother Orm.",
    poster_path: "/7lTnIBcQvdYUM9uk0WJgnW29AwD.jpg",
    backdrop_path: "/cnqwv5W7OI9R2LefRBwip9KN4Zp.jpg",
    release_date: "2023-12-20",
    vote_average: 6.8,
    vote_count: 2400,
    genre_ids: [28, 12, 14],
    original_language: "en"
  }
];

export const MOCK_MOVIE_DETAILS: Record<number, MovieDetails> = {
  693134: {
    id: 693134,
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5200SV.jpg",
    release_date: "2024-02-27",
    runtime: 166,
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    vote_average: 8.3,
    vote_count: 5120,
    original_language: "en",
    videos: {
      results: [
        {
          id: "v1",
          key: "Way9Dexny3w",
          site: "YouTube",
          type: "Trailer",
          official: true,
          name: "Official Trailer 3"
        }
      ]
    },
    credits: {
      cast: [
        { id: 1, name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", order: 0 },
        { id: 2, name: "Zendaya", character: "Chani", profile_path: "/r3A7ev7QkjVSrmthLihYIGP2ad9.jpg", order: 1 },
        { id: 3, name: "Rebecca Ferguson", character: "Lady Jessica", profile_path: "/6NR2VpB59kGgW7mI7rR3pA2Wv4a.jpg", order: 2 },
        { id: 4, name: "Javier Bardem", character: "Stilgar", profile_path: "/6G8nUe6KqH0v2GZ9qF2yY5Vz9bL.jpg", order: 3 },
        { id: 5, name: "Austin Butler", character: "Feyd-Rautha Harkonnen", profile_path: "/2qO99z8Q01gL9o04jZ70uV66g6y.jpg", order: 4 }
      ]
    },
    similar: {
      page: 1,
      results: MOCK_TRENDING.slice(1, 6),
      total_pages: 1,
      total_results: 5
    }
  }
};

export const MOCK_TV_DETAILS: Record<number, TvDetails> = {
  94605: {
    id: 94605,
    name: "Arcane",
    tagline: "Every legend has a beginning.",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    poster_path: "/abf8tZvngEG9fJ0sh9qJ0XsqFvh.jpg",
    backdrop_path: "/7cqKGQyRxlwz1Qp9oZ5i02dY65r.jpg",
    first_air_date: "2021-11-06",
    number_of_seasons: 2,
    number_of_episodes: 18,
    seasons: [
      { id: 133246, season_number: 1, name: "Season 1", episode_count: 9, poster_path: "/abf8tZvngEG9fJ0sh9qJ0XsqFvh.jpg" },
      { id: 367290, season_number: 2, name: "Season 2", episode_count: 9, poster_path: "/abf8tZvngEG9fJ0sh9qJ0XsqFvh.jpg" }
    ],
    genres: [
      { id: 16, name: "Animation" },
      { id: 878, name: "Sci-Fi & Fantasy" },
      { id: 28, name: "Action & Adventure" }
    ],
    vote_average: 8.7,
    vote_count: 3800,
    original_language: "en",
    videos: {
      results: [
        {
          id: "v2",
          key: "fXmAurh012s",
          site: "YouTube",
          type: "Trailer",
          official: true,
          name: "Official Trailer"
        }
      ]
    },
    credits: {
      cast: [
        { id: 10, name: "Hailee Steinfeld", character: "Vi (voice)", profile_path: "/dxsdXQk1925695.jpg", order: 0 },
        { id: 11, name: "Ella Purnell", character: "Jinx (voice)", profile_path: "/xM4596d654.jpg", order: 1 }
      ]
    },
    similar: {
      page: 1,
      results: MOCK_TRENDING.slice(2, 7),
      total_pages: 1,
      total_results: 5
    }
  }
};
