// src/pages/DetailPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Plus,
  Check,
  Heart,
  Star,
  Clock,
  Calendar,
  Layers,
  Film,
  ChevronLeft,
} from "lucide-react";
import { useMovieDetails, useTvDetails, useTvSeason } from "../hooks/useTmdb";
import { buildImageUrl } from "../services/tmdb";
import { BlurImage } from "../components/BlurImage";
import { MediaRow } from "../components/MediaRow";
import { DetailSkeleton } from "../components/Skeletons";
import { VideoModal } from "../components/VideoModal";
import { formatRating, formatRuntime, formatYear, formatDate } from "../utils/formatters";
import { useWatchlistStore } from "../store/watchlistStore";
import type { Video, SearchMultiResult } from "../services/types";

interface DetailPageProps {
  type: "movie" | "tv";
}

export const DetailPage: React.FC<DetailPageProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    title: string;
    videos?: Video[];
  }>({ isOpen: false, title: "" });

  // Movie and TV queries
  const movieQuery = useMovieDetails(type === "movie" ? numericId : undefined);
  const tvQuery = useTvDetails(type === "tv" ? numericId : undefined);

  // TV Season query (only runs if type is "tv")
  const seasonQuery = useTvSeason(
    type === "tv" ? numericId : undefined,
    selectedSeason
  );

  const isLoading = type === "movie" ? movieQuery.isLoading : tvQuery.isLoading;
  const isError = type === "movie" ? movieQuery.isError : tvQuery.isError;
  const details = type === "movie" ? movieQuery.data : tvQuery.data;

  // Watchlist store
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isFavorite, toggleFavorite } =
    useWatchlistStore();

  if (isLoading) return <DetailSkeleton />;
  if (isError || !details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 pt-24">
        <Film className="w-16 h-16 text-cinema-red mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white mb-2">Title Not Found</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          The movie or TV show you are looking for could not be found or loaded.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl bg-cinema-red text-white text-sm font-semibold hover:bg-cinema-hover transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const title = "title" in details ? details.title : details.name;
  const releaseDate = "release_date" in details ? details.release_date : details.first_air_date;
  const inWatchlist = isInWatchlist(details.id, type);
  const favorite = isFavorite(details.id, type);

  const backdropUrl = buildImageUrl(details.backdrop_path, "original");
  const videos = details.videos?.results || [];
  const cast = details.credits?.cast || [];
  const similarItems = details.similar?.results || details.recommendations?.results || [];

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(details.id, type);
    } else {
      addToWatchlist({
        id: details.id,
        mediaType: type,
        title,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        voteAverage: details.vote_average,
        releaseDate,
        overview: details.overview,
      });
    }
  };

  const handleFavoriteToggle = () => {
    toggleFavorite({
      id: details.id,
      mediaType: type,
      title,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      voteAverage: details.vote_average,
      releaseDate,
      overview: details.overview,
    });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* 1. Backdrop Hero Section */}
      <div className="relative w-full h-[55vh] sm:h-[65vh] min-h-[420px] max-h-[700px] overflow-hidden">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center scale-105 filter brightness-90"
          />
        )}
        {/* Gradient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-base via-base/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 sm:left-8 z-30 flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* 2. Main Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-36 sm:-mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="w-48 sm:w-60 md:w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 self-center md:self-start bg-base-800">
            <BlurImage
              path={details.poster_path}
              alt={title}
              size="w500"
              className="w-full"
            />
          </div>

          {/* Info Details Header */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            {/* Tagline */}
            {details.tagline && (
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-cinema-red uppercase">
                {details.tagline}
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {title}
            </h1>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-300">
              {/* Release Year */}
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatYear(releaseDate)}</span>
              </div>

              {/* Runtime / Seasons */}
              {"runtime" in details && details.runtime ? (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatRuntime(details.runtime)}</span>
                </div>
              ) : "number_of_seasons" in details ? (
                <div className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {details.number_of_seasons} Season
                    {details.number_of_seasons > 1 ? "s" : ""} (
                    {details.number_of_episodes} eps)
                  </span>
                </div>
              ) : null}

              {/* Rating */}
              {details.vote_average > 0 && (
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{formatRating(details.vote_average)}</span>
                  <span className="text-[10px] text-amber-400/80">
                    ({details.vote_count?.toLocaleString()} votes)
                  </span>
                </div>
              )}

              {/* Match Percentage */}
              <span className="text-emerald-400 font-semibold">
                {Math.min(99, Math.round(details.vote_average * 10))}% Match
              </span>
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
              {details.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-base-800 text-gray-200 border border-white/10"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl pt-2">
              {details.overview || "No overview available for this title."}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <button
                type="button"
                onClick={() =>
                  setModalVideo({
                    isOpen: true,
                    title: `${title} Trailer`,
                    videos,
                  })
                }
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-cinema-red text-white font-semibold hover:bg-cinema-hover transition-all shadow-xl shadow-cinema-red/30 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Trailer</span>
              </button>

              <button
                type="button"
                onClick={handleWatchlistToggle}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl border transition-all active:scale-95 ${
                  inWatchlist
                    ? "bg-white/20 border-white text-white"
                    : "bg-base-800/80 border-white/15 text-white hover:border-white/40"
                }`}
              >
                {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
              </button>

              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`p-3 rounded-xl border transition-all active:scale-95 ${
                  favorite
                    ? "bg-rose-600/20 border-rose-500 text-rose-500"
                    : "bg-base-800/80 border-white/15 text-gray-300 hover:text-rose-400 hover:border-rose-400"
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${favorite ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Cast Carousel */}
        {cast.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-cinema-red rounded-full inline-block"></span>
              Top Billed Cast
            </h2>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
              {cast.slice(0, 15).map((person) => (
                <div
                  key={person.id}
                  className="flex-shrink-0 w-28 sm:w-32 text-center group"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden bg-base-800 border border-white/10 group-hover:border-cinema-red transition-all shadow-md mb-2">
                    <BlurImage
                      path={person.profile_path}
                      alt={person.name}
                      size="w200"
                      aspectRatio="aspect-square"
                      className="rounded-full"
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-cinema-red transition-colors">
                    {person.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. For TV: Interactive Season & Episode Browser */}
        {type === "tv" && "seasons" in details && details.seasons?.length > 0 && (
          <div className="mt-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <span className="w-1 h-5 bg-cinema-red rounded-full inline-block"></span>
                Episodes
              </h2>

              {/* Season Selector */}
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                {details.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedSeason === season.season_number
                          ? "bg-cinema-red text-white shadow-lg shadow-cinema-red/30"
                          : "bg-base-800 text-gray-300 hover:bg-base-700 hover:text-white border border-white/5"
                      }`}
                    >
                      {season.name || `Season ${season.season_number}`}
                    </button>
                  ))}
              </div>
            </div>

            {/* Episode List */}
            {seasonQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-base-800 rounded-2xl animate-pulse border border-white/5"
                  />
                ))}
              </div>
            ) : seasonQuery.data?.episodes && seasonQuery.data.episodes.length > 0 ? (
              <div className="space-y-4">
                {seasonQuery.data.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-base-850 border border-white/5 hover:border-white/15 transition-all shadow-md group"
                  >
                    <div className="w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-base-900 flex-shrink-0 relative">
                      <BlurImage
                        path={ep.still_path || details.backdrop_path}
                        alt={ep.name}
                        size="w300"
                        aspectRatio="aspect-video"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[11px] font-bold text-white">
                        Ep {ep.episode_number}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-base font-bold text-white group-hover:text-cinema-red transition-colors">
                          {ep.episode_number}. {ep.name}
                        </h4>
                        {ep.vote_average > 0 && (
                          <span className="flex items-center text-xs font-semibold text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 mr-1" />
                            {formatRating(ep.vote_average)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {ep.air_date ? formatDate(ep.air_date) : "Air date unknown"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed">
                        {ep.overview || "No episode synopsis provided."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-base-800 rounded-2xl text-gray-400 text-xs">
                No episode details currently listed for this season.
              </div>
            )}
          </div>
        )}

        {/* 5. More Like This / Recommendations Row */}
        {similarItems.length > 0 && (
          <div className="mt-14">
            <MediaRow
              title="More Like This"
              items={similarItems}
              mediaTypeFallback={type}
              onPlayTrailer={(i: SearchMultiResult) =>
                setModalVideo({
                  isOpen: true,
                  title: i.title || i.name || "Trailer",
                })
              }
            />
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={() => setModalVideo((prev) => ({ ...prev, isOpen: false }))}
        title={modalVideo.title}
        videos={modalVideo.videos}
      />
    </div>
  );
};
