import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartOff, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { MOCK_ALL_PRODUCTS } from "@/features/ecommerce/mock/ecommerce.mock";
import toast from "react-hot-toast";

export function Wishlist() {
  // 12 saved items from mock data
  const [savedItems, setSavedItems] = useState(MOCK_ALL_PRODUCTS.slice(0, 12));

  const handleToggleWishlist = (productId, isWishlisted) => {
    if (!isWishlisted) {
      setSavedItems((prev) => prev.filter((item) => item.id !== productId));
      toast.success("تمت إزالة المنتج من العناصر المحفوظة");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-10 px-4 sm:px-8 lg:px-14">
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Saved Items ({savedItems.length})
        </h1>
        
        {savedItems.length > 0 && (
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-[#0066d1] hover:underline flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        )}
      </div>

      {/* Grid of Saved Items matching screenshot */}
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {savedItems.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              image={product.image}
              originalPrice={product.originalPrice}
              price={product.price}
              badge="New"
              badgeType="new"
              rating={product.rating || 5}
              reviewsCount={product.reviewsCount || 4}
              initialWishlisted={true}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      ) : (
        /* Empty Saved Items State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <HeartOff className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved items yet</h3>
          <p className="text-sm text-slate-500">
            Browse our shop and click the heart icon on any product to save it here for later!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Explore Products
          </Link>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
