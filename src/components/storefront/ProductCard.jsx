import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function ProductCard({
  id = "1",
  title = "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
  image = "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=700&auto=format&fit=crop&q=80",
  originalPrice = "$499.00",
  price = "$499.00",
  badge = "",
  badgeType = "new", // 'new' | 'discount'
  rating = 5,
  reviewsCount = 4,
  showAddToCart = false,
  onAddToCart,
  initialWishlisted = false,
  onToggleWishlist,
}) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

  React.useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart({ id, title, price, image });
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (onToggleWishlist) {
      onToggleWishlist(id, nextState);
    }
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between group relative">
      
      {/* 1. Image Header Section (Flush to top, left, right with Overlay Badges) */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-50">
        
        {/* Badges & Wishlist Positioned Over Image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {badge ? (
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs pointer-events-auto ${
                badgeType === "discount" ? "bg-[#ef4444]" : "bg-[#10b981]"
              }`}
            >
              {badge}
            </span>
          ) : <div />}

          <button
            onClick={handleWishlistClick}
            className="w-8 h-8 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-2xs pointer-events-auto ml-auto"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-rose-400 stroke-[1.75]"
              }`}
            />
          </button>
        </div>

        {/* Product Image */}
        <Link to={`/product/${id}`} className="block w-full h-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* 2. Product Info Section */}
      <div className="p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Rating Stars */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Reviews ({reviewsCount})
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${id}`}>
            <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 hover:text-[#0066d1] transition-colors leading-snug min-h-[34px]">
              {title}
            </h3>
          </Link>

          {/* Price Row */}
          <div className="pt-0.5 flex items-baseline gap-2">
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {originalPrice}
              </span>
            )}
            <span className="text-base sm:text-lg font-extrabold text-[#0066d1]">
              {price}
            </span>
          </div>
        </div>

        {/* Optional Add To Cart Button */}
        {showAddToCart && (
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-2 px-3 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              Add To Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
