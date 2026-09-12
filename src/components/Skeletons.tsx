// src/components/Skeletons.tsx
import React from "react";

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-40 sm:w-48 md:w-56 rounded-xl overflow-hidden bg-base-800 border border-white/5 animate-pulse">
      <div className="aspect-[2/3] w-full bg-base-700 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-base-700 rounded w-3/4" />
        <div className="h-3 bg-base-700 rounded w-1/2" />
      </div>
    </div>
  );
};

export const RowSkeleton: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="py-4 px-4 sm:px-8 space-y-3">
      {title && <div className="h-6 w-48 bg-base-800 rounded animate-pulse" />}
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] bg-base-800 animate-pulse flex items-end p-6 sm:p-12">
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent" />
      <div className="relative z-10 max-w-2xl space-y-4 w-full">
        <div className="h-10 sm:h-14 bg-base-700 rounded-lg w-3/4" />
        <div className="h-4 bg-base-700 rounded w-1/3" />
        <div className="h-16 bg-base-700 rounded w-full" />
        <div className="flex space-x-3 pt-2">
          <div className="h-11 w-32 bg-base-700 rounded-lg" />
          <div className="h-11 w-32 bg-base-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-[50vh] bg-base-800 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-base to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-56 sm:w-64 aspect-[2/3] bg-base-700 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 pt-12">
          <div className="h-10 bg-base-700 rounded w-2/3" />
          <div className="h-5 bg-base-700 rounded w-1/3" />
          <div className="h-24 bg-base-700 rounded w-full" />
          <div className="flex gap-4">
            <div className="h-12 w-36 bg-base-700 rounded-xl" />
            <div className="h-12 w-36 bg-base-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
