// src/components/BlurImage.tsx
import React, { useState } from "react";
import { buildImageUrl } from "../services/tmdb";
import { Film } from "lucide-react";

interface BlurImageProps {
  path: string | null | undefined;
  alt: string;
  size?: "w200" | "w300" | "w342" | "w500" | "w780" | "original";
  className?: string;
  aspectRatio?: string;
}

export const BlurImage: React.FC<BlurImageProps> = ({
  path,
  alt,
  size = "w500",
  className = "",
  aspectRatio = "aspect-[2/3]",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!path || hasError) {
    return (
      <div
        className={`w-full ${aspectRatio} bg-base-800 border border-white/5 flex flex-col items-center justify-center text-gray-500 rounded-lg p-3 text-center ${className}`}
      >
        <Film className="w-8 h-8 mb-2 opacity-40" />
        <span className="text-xs text-gray-400 line-clamp-2">{alt}</span>
      </div>
    );
  }

  const lowResUrl = buildImageUrl(path, "w200");
  const highResUrl = buildImageUrl(path, size);

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatio} ${className}`}>
      {/* Low-res blurred preview layer */}
      {lowResUrl && (
        <img
          src={lowResUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 filter blur-md scale-105 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* High-res image */}
      {highResUrl && (
        <img
          src={highResUrl}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`relative w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      )}
    </div>
  );
};
