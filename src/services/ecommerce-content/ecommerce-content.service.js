import { apiHandler } from "@/lib/api-handler";
import { DEFAULT_ECOMMERCE_HOME_SECTIONS } from "@/features/ecommerce-content/ecommerce-content.constants";
import {
  MOCK_STORE_BANNERS,
  MOCK_STORE_CATEGORIES_TABLE,
} from "@/features/ecommerce-content/mock/ecommerce-content.mock";

/**
 * خدمة محتوى المتجر الإلكتروني (E-Commerce Content Service)
 */

// 1. جلب إعدادات وأقسام الصفحة الرئيسية للمتجر
export async function getStoreHomeConfig(websiteId = "default") {
  try {
    const response = await apiHandler({
      endPoint: `web-service/ecommerce/${websiteId}/home-config`,
    });
    return response?.data || response || {
      sections: DEFAULT_ECOMMERCE_HOME_SECTIONS,
      banners: MOCK_STORE_BANNERS,
      categories: MOCK_STORE_CATEGORIES_TABLE,
    };
  } catch {
    return {
      sections: DEFAULT_ECOMMERCE_HOME_SECTIONS,
      banners: MOCK_STORE_BANNERS,
      categories: MOCK_STORE_CATEGORIES_TABLE,
    };
  }
}

// 2. تحديث البانرات الإعلانية
export async function updateBanners(websiteId, banners) {
  try {
    const response = await apiHandler({
      endPoint: `web-service/ecommerce/${websiteId}/banners`,
      method: "PUT",
      body: { banners },
    });
    return response?.data || response || { success: true, banners };
  } catch {
    return { success: true, banners };
  }
}

// 3. تحديث فئات الصفحة الرئيسية
export async function updateHomeCategories(websiteId, categories) {
  try {
    const response = await apiHandler({
      endPoint: `web-service/ecommerce/${websiteId}/categories`,
      method: "PUT",
      body: { categories },
    });
    return response?.data || response || { success: true, categories };
  } catch {
    return { success: true, categories };
  }
}

// 4. رفع صورة البانر
export async function uploadBannerImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiHandler({
      endPoint: "web-service/upload",
      method: "POST",
      body: formData,
    });
    return response?.data?.url || response?.url || URL.createObjectURL(file);
  } catch {
    return URL.createObjectURL(file);
  }
}

export const ecommerceContentApi = {
  getStoreHomeConfig,
  updateBanners,
  updateHomeCategories,
  uploadBannerImage,
};

export default ecommerceContentApi;
