import React from "react";
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoriesSection from "@/components/storefront/CategoriesSection";
import ProductCard from "@/components/storefront/ProductCard";
import PromoBanner from "@/components/storefront/PromoBanner";
import {
  useRecentlyAddedProducts,
  useProductsOnSale,
  useBestsellingProducts,
} from "@/features/ecommerce";

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-[28px] p-5 border border-slate-100 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-12 bg-slate-200 rounded-full" />
        <div className="h-8 w-8 bg-slate-200 rounded-full" />
      </div>
      <div className="h-44 w-full bg-slate-200 rounded-2xl" />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-5 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function Home() {
  // جلب البيانات عبر خطافات React Query المرتبطة بالـ API
  const { data: recentProducts = [], isLoading: isRecentLoading } = useRecentlyAddedProducts();
  const { data: saleProducts = [], isLoading: isSaleLoading } = useProductsOnSale();
  const { data: bestsellingProducts = [], isLoading: isBestLoading } = useBestsellingProducts();

  return (
    <div className="w-full bg-[#f8fafc] pb-12">
      {/* 1. Hero Promo Carousel */}
      <HeroBanner />

      {/* 2. Categories Section */}
      <CategoriesSection />

      {/* 3. Recently Added Products */}
      <section className="w-full my-12 px-4 sm:px-8 lg:px-14">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">
          Recently Added Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isRecentLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : recentProducts.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* 4. Products On Sale */}
      <section className="w-full my-12 px-4 sm:px-8 lg:px-14">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">
          Products On Sale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isSaleLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : saleProducts.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* 5. Middle Smart Wearables Promo Banner */}
      <PromoBanner />

      {/* 6. Bestselling products */}
      <section className="w-full my-12 px-4 sm:px-8 lg:px-14">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">
          Bestselling products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isBestLoading
            ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
            : bestsellingProducts.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>
    </div>
  );
}
