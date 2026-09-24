import React, { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * OptimizedImage component with native lazy loading, async decoding,
 * skeleton placeholder while loading, and graceful error fallback.
 */
export function OptimizedImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  fallbackSrc = null,
  width,
  height,
  loading = "lazy",
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
    >
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-[inherit]" />
      )}

      {/* Error Fallback */}
      {hasError ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
            loading={loading}
            decoding="async"
            {...props}
          />
        ) : (
          <div className="w-full h-full min-h-[80px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 p-2 text-xs text-center rounded-[inherit]">
            <ImageOff className="w-5 h-5 mb-1 opacity-60" />
            <span className="line-clamp-1">{alt || "Image unavailable"}</span>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}

export default React.memo(OptimizedImage);
