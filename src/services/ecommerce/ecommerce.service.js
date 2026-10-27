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
} from "@/features/ecommerce/mock/ecommerce.mock";

/**
 * خدمة المتجر الإلكتروني (E-Commerce Service)
 */
export async function getCategories() {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/categories" });
    return response?.data || response || MOCK_CATEGORIES;
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getHeroBanner() {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/banners/hero" });
    return response?.data || response || MOCK_HERO_BANNER;
  } catch {
    return MOCK_HERO_BANNER;
  }
}

export async function getRecentlyAddedProducts(params = {}) {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/products/recent", params });
    return response?.data?.items || response?.data || response || MOCK_RECENT_PRODUCTS;
  } catch {
    return MOCK_RECENT_PRODUCTS;
  }
}

export async function getProductsOnSale(params = {}) {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/products/on-sale", params });
    return response?.data?.items || response?.data || response || MOCK_SALE_PRODUCTS;
  } catch {
    return MOCK_SALE_PRODUCTS;
  }
}

export async function getPromoBanner() {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/banners/promo-watch" });
    return response?.data || response || MOCK_PROMO_WATCH;
  } catch {
    return MOCK_PROMO_WATCH;
  }
}

export async function getBestsellingProducts(params = {}) {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/products/bestsellers", params });
    return response?.data?.items || response?.data || response || MOCK_BESTSELLER_PRODUCTS;
  } catch {
    return MOCK_BESTSELLER_PRODUCTS;
  }
}

export async function getShopProducts(filters = {}) {
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
      total: 5200,
      count: filtered.length,
    };
  }
}

export async function getFilterOptions() {
  try {
    const response = await apiHandler({ endPoint: "ecommerce/filters" });
    return response?.data || { categories: MOCK_FILTER_CATEGORIES, brands: MOCK_BRANDS };
  } catch {
    return { categories: MOCK_FILTER_CATEGORIES, brands: MOCK_BRANDS };
  }
}

export async function getProductById(id) {
  try {
    const response = await apiHandler({ endPoint: `ecommerce/products/${id}` });
    return response?.data || response || MOCK_PRODUCT_DETAILS;
  } catch {
    return MOCK_PRODUCT_DETAILS;
  }
}

export async function getRelatedProducts(productId, params = {}) {
  try {
    const response = await apiHandler({ endPoint: `ecommerce/products/${productId}/related`, params });
    return response?.data?.items || response?.data || response || MOCK_RELATED_PRODUCTS;
  } catch {
    return MOCK_RELATED_PRODUCTS;
  }
}

export async function createOrder(orderData) {
  return apiHandler({
    endPoint: "ecommerce/orders",
    method: "POST",
    body: orderData,
  });
}

export const ecommerceApi = {
  getCategories,
  getHeroBanner,
  getRecentlyAddedProducts,
  getProductsOnSale,
  getPromoBanner,
  getBestsellingProducts,
  getShopProducts,
  getFilterOptions,
  getProductById,
  getRelatedProducts,
  createOrder,
};

export default ecommerceApi;
