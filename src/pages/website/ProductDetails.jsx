import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Minus, Plus, Star, Check } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { useProductDetails, useRelatedProducts } from "@/features/ecommerce";
import toast from "react-hot-toast";

export function ProductDetails() {
  const { id = "prod-detail-1" } = useParams();

  const { data: product, isLoading } = useProductDetails(id);
  const { data: relatedProducts = [], isLoading: isRelatedLoading } = useRelatedProducts(id);

  // Interaction States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.id || "coral");
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "XS");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Set default selected values when product loads
  React.useEffect(() => {
    if (product) {
      if (product.colors?.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0].id);
      }
      if (product.sizes?.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  const handleDecreaseQty = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 0));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (quantity <= 0) {
      toast.error("يرجى اختيار كمية 1 على الأقل");
      return;
    }
    toast.success(`تمت إضافة ${quantity} من "${product?.title}" إلى السلة!`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 animate-pulse space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="w-full h-80 sm:h-96 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const activeImage =
    product?.images?.[selectedImageIndex] ||
    product?.image ||
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&auto=format&fit=crop&q=80";

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-6 md:py-10 px-4 sm:px-8 lg:px-14">
      {/* 1. Main Product Container Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-4 sm:p-8 lg:p-10 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Big Main Image */}
            <div className="w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
              <img
                src={activeImage}
                alt={product?.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {(product?.images || [activeImage, activeImage, activeImage, activeImage]).map((img, idx) => {
                const isActive = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden h-16 sm:h-20 md:h-24 border-2 transition-all bg-slate-50 ${
                      isActive
                        ? "border-[#0066d1] ring-2 ring-[#0066d1]/20 scale-102"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="space-y-6">
            {/* Title & Wishlist Row */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product?.title || "MSI Pro 16 Flex-036AU 15.6"}
              </h1>
              
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-2xs shrink-0"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : "text-rose-400 stroke-[1.75]"
                  }`}
                />
              </button>
            </div>

            {/* Price & Discount Row */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0066d1]">
                {product?.price || "$250.0"}
              </span>
              {product?.originalPrice && (
                <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                  {product.originalPrice}
                </span>
              )}
              {product?.discountBadge && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                  {product.discountBadge}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {product?.description ||
                "Apple Watch Ultra 2 is Apple's most powerful smartwatch, built for adventure and extreme performance. Crafted from lightweight titanium, it features the brightest Retina display yet, reaching up to 3,000 nits for unmatched visibility in any environment With the customizable Action Button, advanced compass, depth tracking, and precise GPS, it's designed for athletes, explorers, and outdoor enthusiasts. Powered by the new S9 SiP chip, it delivers faster performance and introduces the intuitive Double Tap gesture for effortless control."}
            </p>

            {/* Available Colors */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Available colors
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {(
                  product?.colors || [
                    { id: "coral", colorHex: "#f97316" },
                    { id: "maroon", colorHex: "#7f1d1d" },
                    { id: "olive", colorHex: "#65a30d" },
                    { id: "dark", colorHex: "#1e293b" },
                    { id: "beige", colorHex: "#f5ebe0" },
                    { id: "mint", colorHex: "#d1fae5" },
                    { id: "lavender", colorHex: "#e9d5ff" },
                    { id: "softblue", colorHex: "#cbd5e1" },
                  ]
                ).map((c) => {
                  const isSelected = selectedColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all border border-black/10 flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-[#0066d1] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.name || c.id}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Sizes */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Available sizes
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {(product?.sizes || ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                        isSelected
                          ? "border-[#0066d1] bg-blue-50/60 text-[#0066d1] shadow-2xs"
                          : "border-slate-200/90 text-slate-700 bg-white hover:border-slate-300"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Add To Cart Row */}
            <div className="pt-4 flex items-center gap-3 sm:gap-4">
              {/* Stepper */}
              <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 sm:w-8 text-center font-extrabold text-slate-900 text-sm sm:text-base select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0066d1] hover:bg-[#0052a8] text-white flex items-center justify-center font-bold text-sm transition-colors active:scale-95 shadow-xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] text-center"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Related Products Section */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Related Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isRelatedLoading
            ? [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] border border-slate-100 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
              ))
            : relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  id={relProduct.id}
                  title={relProduct.title}
                  image={relProduct.image}
                  originalPrice={relProduct.originalPrice}
                  price={relProduct.price}
                  badge={relProduct.badge || "New"}
                  badgeType={relProduct.badgeType || "new"}
                  rating={relProduct.rating || 5}
                  reviewsCount={relProduct.reviewsCount || 4}
                />
              ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
