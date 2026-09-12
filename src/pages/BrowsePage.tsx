// src/pages/BrowsePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Sparkles, Film, ArrowUp } from "lucide-react";
import { FilterSidebar, FilterState } from "../components/FilterSidebar";
import { MediaCard } from "../components/MediaCard";
import { GridSkeleton } from "../components/Skeletons";
import { VideoModal } from "../components/VideoModal";
import {
  useDiscover,
  useMovieGenres,
  useTvGenres,
  useLanguages,
} from "../hooks/useTmdb";
import type { SearchMultiResult, Video } from "../services/types";

const INITIAL_FILTERS: FilterState = {
  mediaType: "movie",
  selectedGenres: [],
  language: "",
  yearMin: 1990,
  yearMax: new Date().getFullYear(),
  minRating: 0,
  sortBy: "popularity.desc",
};

export const BrowsePage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    title: string;
    videos?: Video[];
  }>({ isOpen: false, title: "" });

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce filter updates to prevent rapid re-fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  // Load genres & languages
  const { data: movieGenresData } = useMovieGenres();
  const { data: tvGenresData } = useTvGenres();
  const { data: languagesData } = useLanguages();

  const currentGenres =
    debouncedFilters.mediaType === "movie"
      ? movieGenresData?.genres || []
      : tvGenresData?.genres || [];

  const languages = languagesData || [];

  // TanStack Query Discover hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useDiscover({
    mediaType: debouncedFilters.mediaType,
    withGenres:
      debouncedFilters.selectedGenres.length > 0
        ? debouncedFilters.selectedGenres
        : undefined,
    withOriginalLanguage: debouncedFilters.language || undefined,
    releaseYearGte: debouncedFilters.yearMin,
    releaseYearLte: debouncedFilters.yearMax,
    voteAverageGte:
      debouncedFilters.minRating > 0 ? debouncedFilters.minRating : undefined,
    sortBy: debouncedFilters.sortBy,
  });

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages
  const items =
    data?.pages.flatMap((page) => page.results).filter(
      (item) => item.poster_path || item.backdrop_path
    ) || [];

  const totalResults = data?.pages[0]?.total_results ?? 0;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cinema-red/10 text-cinema-red border border-cinema-red/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore & Discover
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-11">
            Filter through tens of thousands of movies and television series
          </p>
        </div>

        {/* Mobile Filter Toggle & Stats */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-gray-400 bg-base-800 px-3 py-1.5 rounded-lg border border-white/5">
            {totalResults > 0 ? `${totalResults.toLocaleString()} titles` : "Searching"}
          </span>

          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 rounded-xl bg-cinema-red text-white text-xs font-semibold shadow-lg shadow-cinema-red/30 active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({filters.selectedGenres.length + (filters.language ? 1 : 0)})</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex gap-8 items-start">
        {/* Persistent Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(INITIAL_FILTERS)}
          genres={currentGenres}
          languages={languages}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Media Grid Content Area */}
        <main className="flex-1 min-w-0">
          {isLoading ? (
            <GridSkeleton count={12} />
          ) : isError ? (
            <div className="text-center py-20 bg-base-900/60 rounded-2xl border border-white/5 p-8">
              <Film className="w-12 h-12 text-cinema-red mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-white mb-1">Could Not Load Titles</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Unable to reach TMDB API servers. Check your connection or API key configuration.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 bg-base-900/40 rounded-2xl border border-white/5 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-base-800 flex items-center justify-center mx-auto text-gray-400">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Matching Titles</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Try broadening your search criteria by removing some genres, expanding the release years, or lowering the minimum rating.
                </p>
              </div>
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="px-5 py-2 rounded-xl bg-cinema-red text-white text-xs font-semibold hover:bg-cinema-hover transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                {items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-center">
                    <MediaCard
                      item={item}
                      mediaTypeFallback={debouncedFilters.mediaType}
                      onPlayTrailer={(i) =>
                        setModalVideo({
                          isOpen: true,
                          title: i.title || i.name || "Trailer",
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger Sentinel */}
              <div
                ref={sentinelRef}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-4 h-4 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
                    <span>Loading more titles...</span>
                  </div>
                ) : hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    className="px-6 py-2.5 rounded-xl bg-base-800 hover:bg-base-700 text-gray-200 border border-white/10 text-xs font-medium transition-colors"
                  >
                    Load More Titles
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    You've reached the end of the curated universe.
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Floating Scroll To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className="fixed bottom-20 right-6 z-30 p-3 rounded-full bg-base-800/90 hover:bg-cinema-red text-white border border-white/15 shadow-2xl backdrop-blur-md transition-all active:scale-95"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

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
