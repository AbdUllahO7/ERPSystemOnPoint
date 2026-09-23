import React from "react";

export function PageSkeleton() {
  return (
    <div className="w-full h-full p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted/60 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card/50 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="rounded-xl border bg-card/50 p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-24 bg-muted rounded-lg" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 pt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted/40 rounded-lg flex items-center px-4 justify-between">
              <div className="h-4 w-1/4 bg-muted rounded" />
              <div className="h-4 w-1/6 bg-muted rounded" />
              <div className="h-4 w-1/6 bg-muted rounded" />
              <div className="h-4 w-1/12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;
