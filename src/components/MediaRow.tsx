// src/components/MediaRow.tsx
import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { RowSkeleton } from "./Skeletons";
import type { SearchMultiResult, MediaType } from "../services/types";

interface MediaRowProps {
  title: string;
  subtitle?: string;
  items?: SearchMultiResult[];
  isLoading?: boolean;
  mediaTypeFallback?: Exclude<MediaType, "person">;
  onPlayTrailer?: (item: SearchMultiResult) => void;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  subtitle,
  items = [],
  isLoading = false,
  mediaTypeFallback = "movie",
  onPlayTrailer,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const offset = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handleScroll("left");
    } else if (e.key === "ArrowRight") {
      handleScroll("right");
    }
  };

  if (isLoading) {
    return <RowSkeleton title={title} />;
  }

  // Filter out items with no poster or title
  const validItems = items.filter(
    (item) => (item.poster_path || item.backdrop_path) && (item.title || item.name)
  );

  if (validItems.length === 0) {
    return null;
  }

  return (
    <div className="relative py-4 group/row px-4 sm:px-8 md:px-12">
      {/* Row Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-1 h-5 bg-cinema-red rounded-full inline-block"></span>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 ml-3">{subtitle}</p>}
        </div>
      </div>

      {/* Outer Row Container */}
      <div className="relative">
        {/* Left Scroll Chevron */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label={`Scroll ${title} left`}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-24 sm:h-32 bg-base-900/90 hover:bg-cinema-red/90 text-white rounded-r-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover/row:opacity-100 shadow-xl border border-white/10"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScrollBounds}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label={title}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 focus:outline-none"
        >
          {validItems.map((item) => (
            <MediaCard
              key={`${item.media_type || mediaTypeFallback}-${item.id}`}
              item={item}
              mediaTypeFallback={mediaTypeFallback}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>

        {/* Right Scroll Chevron */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label={`Scroll ${title} right`}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-24 sm:h-32 bg-base-900/90 hover:bg-cinema-red/90 text-white rounded-l-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover/row:opacity-100 shadow-xl border border-white/10"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>
    </div>
  );
};
