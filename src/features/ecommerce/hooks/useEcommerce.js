import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecommerceApi } from "../api/ecommerce.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

/**
 * خطاف جلب التصنيفات
 */
export function useEcommerceCategories() {
  return useQuery({
    queryKey: queryKeys.ecommerce.categories(),
    queryFn: () => ecommerceApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * خطاف جلب البانر الترويجي الرئيسي
 */
export function useHeroBanner() {
  return useQuery({
    queryKey: queryKeys.ecommerce.heroBanner(),
    queryFn: () => ecommerceApi.getHeroBanner(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * خطاف جلب المنتجات المضافة حديثاً
 */
export function useRecentlyAddedProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.ecommerce.recentProducts(params),
    queryFn: () => ecommerceApi.getRecentlyAddedProducts(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * خطاف جلب المنتجات المخفضة (العروض)
 */
export function useProductsOnSale(params = {}) {
  return useQuery({
    queryKey: queryKeys.ecommerce.saleProducts(params),
    queryFn: () => ecommerceApi.getProductsOnSale(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * خطاف جلب بانر الساعات الذكية
 */
export function usePromoBanner() {
  return useQuery({
    queryKey: queryKeys.ecommerce.promoBanner(),
    queryFn: () => ecommerceApi.getPromoBanner(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * خطاف جلب المنتجات الأكثر مبيعاً
 */
export function useBestsellingProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.ecommerce.bestsellerProducts(params),
    queryFn: () => ecommerceApi.getBestsellingProducts(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * خطاف جلب منتجات صفحة المتجر والبحث مع الفلاتر
 */
export function useShopProducts(filters = {}) {
  return useQuery({
    queryKey: queryKeys.ecommerce.shopProducts(filters),
    queryFn: () => ecommerceApi.getShopProducts(filters),
    placeholderData: (prev) => prev,
  });
}

/**
 * خطاف جلب خيارات الفلترة (التصنيفات والبراندات)
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.ecommerce.filterOptions(),
    queryFn: () => ecommerceApi.getFilterOptions(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * خطاف جلب تفاصيل منتج محدد
 */
export function useProductDetails(id) {
  return useQuery({
    queryKey: queryKeys.ecommerce.productDetails(id),
    queryFn: () => ecommerceApi.getProductById(id),
    enabled: Boolean(id),
  });
}

/**
 * خطاف جلب المنتجات المشابهة
 */
export function useRelatedProducts(productId, params = {}) {
  return useQuery({
    queryKey: queryKeys.ecommerce.relatedProducts(productId, params),
    queryFn: () => ecommerceApi.getRelatedProducts(productId, params),
    placeholderData: (prev) => prev,
  });
}

/**
 * خطاف إنشاء طلب شراء جديد (Checkout Mutation)
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => ecommerceApi.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ecommerce.all });
      toast.success("تم إرسال الطلب بنجاح!");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إرسال الطلب، يرجى المحاولة لاحقاً");
    },
  });
}
