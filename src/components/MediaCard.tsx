// src/components/MediaCard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Plus, Check, Heart, Play, Info } from "lucide-react";
import { BlurImage } from "./BlurImage";
import { formatRating, formatYear } from "../utils/formatters";
import { useWatchlistStore } from "../store/watchlistStore";
import type { SearchMultiResult, MediaType } from "../services/types";

interface MediaCardProps {
  item: SearchMultiResult;
  mediaTypeFallback?: Exclude<MediaType, "person">;
  onPlayTrailer?: (item: SearchMultiResult) => void;
  priority?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  mediaTypeFallback = "movie",
  onPlayTrailer,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Resolved media type
  const mediaType: "movie" | "tv" =
    item.media_type === "tv" || (!item.media_type && item.first_air_date)
      ? "tv"
      : (item.media_type as "movie" | "tv") || mediaTypeFallback;

  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const rating = item.vote_average;

  // Watchlist store
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isFavorite, toggleFavorite } =
    useWatchlistStore();

  const inWatchlist = isInWatchlist(item.id, mediaType);
  const favorite = isFavorite(item.id, mediaType);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id, mediaType);
    } else {
      addToWatchlist({
        id: item.id,
        mediaType,
        title,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: rating,
        releaseDate,
        overview: item.overview,
      });
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: item.id,
      mediaType,
      title,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      voteAverage: rating,
      releaseDate,
      overview: item.overview,
    });
  };

  const handleCardClick = () => {
    navigate(`/${mediaType}/${item.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${title} (${formatYear(releaseDate)})`}
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cinema-red transition-all duration-300"
    >
      {/* Outer Card Body */}
      <div className="relative rounded-xl overflow-hidden bg-base-800 border border-white/5 shadow-lg group-hover:border-white/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-black/70 group-hover:-translate-y-2">
        {/* Poster Image with Blur-Up */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <BlurImage
            path={item.poster_path}
            alt={title}
            size="w500"
            className="transition-transform duration-500 group-hover:scale-105"
          />

          {/* Rating Badge Top Left */}
          {rating !== undefined && rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{formatRating(rating)}</span>
            </div>
          )}

          {/* Media Type Badge Top Right */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-300">
            {mediaType}
          </div>

          {/* Hover Overlay with Quick Actions & Details */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/80 to-transparent p-3 flex flex-col justify-end transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlayTrailer) onPlayTrailer(item);
                  else navigate(`/${mediaType}/${item.id}`);
                }}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-cinema-red hover:text-white transition-colors shadow-md"
                title="Play Trailer"
                aria-label="Play Trailer"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>

              <button
                type="button"
                onClick={handleWatchlistToggle}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  inWatchlist
                    ? "bg-cinema-red border-cinema-red text-white"
                    : "bg-base-800/80 border-white/20 text-white hover:border-white"
                }`}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                aria-label={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  favorite
                    ? "bg-rose-600/30 border-rose-500 text-rose-500"
                    : "bg-base-800/80 border-white/20 text-white hover:text-rose-400 hover:border-rose-400"
                }`}
                title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                aria-label={favorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-3.5 h-3.5 ${favorite ? "fill-rose-500" : ""}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${mediaType}/${item.id}`);
                }}
                className="w-8 h-8 rounded-full border border-white/20 bg-base-800/80 text-white flex items-center justify-center hover:border-white transition-colors ml-auto"
                title="More Info"
                aria-label="More Info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Meta */}
            <h4 className="text-sm font-semibold text-white truncate leading-tight">{title}</h4>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-1">
              <span>{formatYear(releaseDate)}</span>
              {rating !== undefined && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    {Math.round(rating * 10)}% Match
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer for standard view */}
        <div className="p-2.5">
          <h4 className="text-xs sm:text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
            {title}
          </h4>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
            <span>{formatYear(releaseDate)}</span>
            <span className="capitalize">{mediaType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
