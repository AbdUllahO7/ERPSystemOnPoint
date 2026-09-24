import { apiHandler } from "@/lib/api-handler";
import {
  MOCK_HERO_BANNER,
  MOCK_CATEGORIES,
  MOCK_RECENT_PRODUCTS,
  MOCK_SALE_PRODUCTS,
  MOCK_PROMO_WATCH,
  MOCK_BESTSELLER_PRODUCTS,
  MOCK_ALL_PRODUCTS,
  MOCK_BRANDS,
  MOCK_FILTER_CATEGORIES,
  MOCK_PRODUCT_DETAILS,
  MOCK_RELATED_PRODUCTS,
} from "../mock/ecommerce.mock";

/**
 * واجهة الاتصال بالـ API لقطاع المتجر الإلكتروني (E-Commerce API Layer)
 * تقوم بجلب البيانات من الخادم الحقيقي، وفي حال عدم توفر نقطة اتصال ترجع البيانات من ecommerce.mock.js
 */

export const ecommerceApi = {
  // 1. جلب التصنيفات
  getCategories: async () => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/categories" });
      return response?.data || response || MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  // 2. جلب البانر الترويجي الرئيسي
  getHeroBanner: async () => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/banners/hero" });
      return response?.data || response || MOCK_HERO_BANNER;
    } catch {
      return MOCK_HERO_BANNER;
    }
  },

  // 3. جلب المنتجات المضافة حديثاً
  getRecentlyAddedProducts: async (params = {}) => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/products/recent", params });
      return response?.data?.items || response?.data || response || MOCK_RECENT_PRODUCTS;
    } catch {
      return MOCK_RECENT_PRODUCTS;
    }
  },

  // 4. جلب المنتجات الخاضعة للخصومات
  getProductsOnSale: async (params = {}) => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/products/on-sale", params });
      return response?.data?.items || response?.data || response || MOCK_SALE_PRODUCTS;
    } catch {
      return MOCK_SALE_PRODUCTS;
    }
  },

  // 5. جلب بانر الساعات الذكية
  getPromoBanner: async () => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/banners/promo-watch" });
      return response?.data || response || MOCK_PROMO_WATCH;
    } catch {
      return MOCK_PROMO_WATCH;
    }
  },

  // 6. جلب المنتجات الأكثر مبيعاً
  getBestsellingProducts: async (params = {}) => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/products/bestsellers", params });
      return response?.data?.items || response?.data || response || MOCK_BESTSELLER_PRODUCTS;
    } catch {
      return MOCK_BESTSELLER_PRODUCTS;
    }
  },

  // 7. جلب منتجات صفحة المتجر مع الفلاتر والبحث (Catalog & Search API)
  getShopProducts: async (filters = {}) => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/products", params: filters });
      return response?.data || { items: MOCK_ALL_PRODUCTS, total: MOCK_ALL_PRODUCTS.length };
    } catch {
      let filtered = [...MOCK_ALL_PRODUCTS];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(query));
      }

      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filters.brand && filters.brand.length > 0) {
        filtered = filtered.filter((p) => filters.brand.includes(p.brand));
      }

      if (filters.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.rawPrice >= Number(filters.minPrice));
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.rawPrice <= Number(filters.maxPrice));
      }

      if (filters.inStock) {
        filtered = filtered.filter((p) => p.inStock);
      }

      if (filters.onSale) {
        filtered = filtered.filter((p) => p.onSale);
      }

      return {
        items: filtered,
        total: 5200, // Matching the UI demonstration total in screenshot or filtered length
        count: filtered.length,
      };
    }
  },

  // 8. جلب بيانات الفلاتر (العلامات التجارية والتصنيفات)
  getFilterOptions: async () => {
    try {
      const response = await apiHandler({ endPoint: "ecommerce/filters" });
      return response?.data || { categories: MOCK_FILTER_CATEGORIES, brands: MOCK_BRANDS };
    } catch {
      return { categories: MOCK_FILTER_CATEGORIES, brands: MOCK_BRANDS };
    }
  },

  // 9. جلب تفاصيل منتج محدد
  getProductById: async (id) => {
    try {
      const response = await apiHandler({ endPoint: `ecommerce/products/${id}` });
      return response?.data || response || MOCK_PRODUCT_DETAILS;
    } catch {
      return MOCK_PRODUCT_DETAILS;
    }
  },

  // 10. جلب المنتجات المشابهة (Related Products)
  getRelatedProducts: async (productId, params = {}) => {
    try {
      const response = await apiHandler({ endPoint: `ecommerce/products/${productId}/related`, params });
      return response?.data?.items || response?.data || response || MOCK_RELATED_PRODUCTS;
    } catch {
      return MOCK_RELATED_PRODUCTS;
    }
  },

  // 11. إنشاء طلب شراء جديد (Checkout)
  createOrder: async (orderData) => {
    return apiHandler({
      endPoint: "ecommerce/orders",
      method: "POST",
      body: orderData,
    });
  },
};

export default ecommerceApi;
