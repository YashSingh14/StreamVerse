// src/pages/HomePage.tsx
import React, { useState } from "react";
import { HeroCarousel } from "../components/HeroCarousel";
import { MediaRow } from "../components/MediaRow";
import { ContinueWatchingRow } from "../components/ContinueWatchingRow";
import { VideoModal } from "../components/VideoModal";
import {
  useTrending,
  useMovieList,
  useTvList,
  useLanguageRow,
  useRecommendations,
} from "../hooks/useTmdb";
import { LANGUAGE_ROW_PRESETS } from "../services/tmdb";
import { useWatchlistStore } from "../store/watchlistStore";
import type { SearchMultiResult, Video } from "../services/types";

// Dynamic recommendation row component
const BecauseYouWatchedRow: React.FC<{
  mediaType: "movie" | "tv";
  id: number;
  sourceTitle: string;
  onPlayTrailer: (item: SearchMultiResult) => void;
}> = ({ mediaType, id, sourceTitle, onPlayTrailer }) => {
  const { data, isLoading } = useRecommendations(mediaType, id);
  const items = data?.results || [];

  if (!isLoading && items.length === 0) return null;

  return (
    <MediaRow
      title={`Because you watched ${sourceTitle}`}
      subtitle="Personalized recommendations based on your list"
      items={items}
      isLoading={isLoading}
      mediaTypeFallback={mediaType}
      onPlayTrailer={onPlayTrailer}
    />
  );
};

// Preset Language Row Wrapper
const LanguagePresetRow: React.FC<{
  preset: (typeof LANGUAGE_ROW_PRESETS)[number];
  onPlayTrailer: (item: SearchMultiResult) => void;
}> = ({ preset, onPlayTrailer }) => {
  const { data, isLoading } = useLanguageRow(preset.language, preset.mediaType);
  const items = data?.results || [];

  return (
    <MediaRow
      title={preset.title}
      items={items}
      isLoading={isLoading}
      mediaTypeFallback={preset.mediaType}
      onPlayTrailer={onPlayTrailer}
    />
  );
};

export const HomePage: React.FC = () => {
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    title: string;
    videos?: Video[];
    activeKey?: string;
  }>({
    isOpen: false,
    title: "",
  });

  // Queries
  const { data: trendingData, isLoading: trendingLoading } = useTrending("all", "day");
  const { data: popularMovies, isLoading: popMoviesLoading } = useMovieList("popular");
  const { data: popularTv, isLoading: popTvLoading } = useTvList("popular");
  const { data: topRated, isLoading: topRatedLoading } = useMovieList("top_rated");
  const { data: upcoming, isLoading: upcomingLoading } = useMovieList("upcoming");

  // Watchlist items for dynamic "Because you watched"
  const { watchlist, favorites } = useWatchlistStore();
  const recentSaved = [...favorites, ...watchlist].slice(0, 2);

  const handlePlayTrailer = (item: SearchMultiResult) => {
    // If videos are appended
    const videos = (item as unknown as { videos?: { results: Video[] } })?.videos?.results || [];
    setModalVideo({
      isOpen: true,
      title: item.title || item.name || "Trailer",
      videos,
    });
  };

  const handlePlayContinueItem = (title: string, _id: number, _mediaType: "movie" | "tv") => {
    setModalVideo({
      isOpen: true,
      title,
      videos: [],
    });
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* 1. Hero Carousel */}
      <HeroCarousel
        items={trendingData?.results}
        isLoading={trendingLoading}
        onPlayTrailer={handlePlayTrailer}
      />

      {/* Main Content Rows Container */}
      <div className="relative z-20 -mt-10 sm:-mt-14 space-y-4 sm:space-y-6">
        {/* 2. Continue Watching (if items exist) */}
        <ContinueWatchingRow onPlayItem={handlePlayContinueItem} />

        {/* 3. Trending Today */}
        <MediaRow
          title="Trending Today"
          subtitle="Top movies and shows capturing global attention"
          items={trendingData?.results}
          isLoading={trendingLoading}
          onPlayTrailer={handlePlayTrailer}
        />

        {/* 4. Popular Movies */}
        <MediaRow
          title="Popular Movies"
          items={popularMovies?.results}
          isLoading={popMoviesLoading}
          mediaTypeFallback="movie"
          onPlayTrailer={handlePlayTrailer}
        />

        {/* 5. Dynamically Generated "Because you watched" rows */}
        {recentSaved.map((item) => (
          <BecauseYouWatchedRow
            key={`because-${item.mediaType}-${item.id}`}
            id={item.id}
            mediaType={item.mediaType}
            sourceTitle={item.title}
            onPlayTrailer={handlePlayTrailer}
          />
        ))}

        {/* 6. Popular TV Shows */}
        <MediaRow
          title="Popular TV Shows"
          items={popularTv?.results}
          isLoading={popTvLoading}
          mediaTypeFallback="tv"
          onPlayTrailer={handlePlayTrailer}
        />

        {/* 7. Curated Language Rows */}
        {LANGUAGE_ROW_PRESETS.map((preset) => (
          <LanguagePresetRow
            key={preset.title}
            preset={preset}
            onPlayTrailer={handlePlayTrailer}
          />
        ))}

        {/* 8. Top Rated Cinema */}
        <MediaRow
          title="All-Time Critically Acclaimed"
          items={topRated?.results}
          isLoading={topRatedLoading}
          mediaTypeFallback="movie"
          onPlayTrailer={handlePlayTrailer}
        />

        {/* 9. Upcoming Titles */}
        <MediaRow
          title="Upcoming In Theaters"
          items={upcoming?.results}
          isLoading={upcomingLoading}
          mediaTypeFallback="movie"
          onPlayTrailer={handlePlayTrailer}
        />
      </div>

      {/* Video Modal Player */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={() => setModalVideo((prev) => ({ ...prev, isOpen: false }))}
        title={modalVideo.title}
        videos={modalVideo.videos}
        activeVideoKey={modalVideo.activeKey}
      />
    </div>
  );
};
