// src/components/HeroCarousel.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { buildImageUrl } from "../services/tmdb";
import { formatRating, formatYear, truncateText } from "../utils/formatters";
import { useWatchlistStore } from "../store/watchlistStore";
import { HeroSkeleton } from "./Skeletons";
import type { SearchMultiResult } from "../services/types";

interface HeroCarouselProps {
  items?: SearchMultiResult[];
  isLoading?: boolean;
  onPlayTrailer?: (item: SearchMultiResult) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  items = [],
  isLoading = false,
  onPlayTrailer,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  // Take top 6 trending items with backdrops
  const heroItems = items.filter((item) => item.backdrop_path).slice(0, 6);

  useEffect(() => {
    if (heroItems.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroItems.length, isPaused]);

  if (isLoading || heroItems.length === 0) {
    return <HeroSkeleton />;
  }

  const currentItem = heroItems[currentIndex];
  const mediaType: "movie" | "tv" =
    currentItem.media_type === "tv" || (!currentItem.media_type && currentItem.first_air_date)
      ? "tv"
      : "movie";

  const title = currentItem.title || currentItem.name || "Featured Title";
  const releaseDate = currentItem.release_date || currentItem.first_air_date;
  const rating = currentItem.vote_average;
  const inWatchlist = isInWatchlist(currentItem.id, mediaType);

  const backdropUrl = buildImageUrl(currentItem.backdrop_path, "original");

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
  };

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(currentItem.id, mediaType);
    } else {
      addToWatchlist({
        id: currentItem.id,
        mediaType,
        title,
        posterPath: currentItem.poster_path,
        backdropPath: currentItem.backdrop_path,
        voteAverage: rating,
        releaseDate,
        overview: currentItem.overview,
      });
    }
  };

  return (
    <div
      className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Layer with Crossfade */}
      <div className="absolute inset-0">
        {backdropUrl && (
          <img
            key={currentItem.id}
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center animate-fade-in scale-105 duration-1000 transform"
          />
        )}
        {/* Cinematic Multi-layer Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-base via-base/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero Content Information */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Meta */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-medium">
            <span className="px-2.5 py-1 rounded-md bg-cinema-red text-white uppercase tracking-wider text-[11px] font-bold">
              Trending #{currentIndex + 1}
            </span>
            <span className="text-gray-300 font-semibold">{formatYear(releaseDate)}</span>
            {rating !== undefined && rating > 0 && (
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{formatRating(rating)}</span>
              </div>
            )}
            <span className="text-gray-400 capitalize">• {mediaType}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none drop-shadow-md">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 max-w-xl leading-relaxed drop-shadow">
            {truncateText(currentItem.overview, 220)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onPlayTrailer) onPlayTrailer(currentItem);
                else navigate(`/${mediaType}/${currentItem.id}`);
              }}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-cinema-red hover:text-white transition-all shadow-xl hover:shadow-cinema-red/30 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Trailer</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/${mediaType}/${currentItem.id}`)}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/15 backdrop-blur-md text-white font-medium hover:bg-white/25 border border-white/20 transition-all active:scale-95"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>

            <button
              type="button"
              onClick={handleWatchlistToggle}
              className={`p-3 rounded-xl border transition-all active:scale-95 ${
                inWatchlist
                  ? "bg-cinema-red border-cinema-red text-white shadow-lg shadow-cinema-red/30"
                  : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              }`}
              title={inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              aria-label="Toggle Watchlist"
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Chevrons */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center space-x-2">
        {heroItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "w-8 bg-cinema-red" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
