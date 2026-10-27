import { apiHandler } from "@/lib/api-handler";
import { MOCK_WEBSITES_LIST } from "@/features/website-builder/mock/website-builder.mock";

/**
 * خدمة بناء وإدارة المواقع (Website Builder & Web Service)
 */

// 1. جلب قائمة المواقع المنشأة
export async function getWebsites(params = {}) {
  try {
    const response = await apiHandler({
      endPoint: "web-service/websites",
      params,
    });
    return response?.data || response || MOCK_WEBSITES_LIST;
  } catch {
    return MOCK_WEBSITES_LIST;
  }
}

// 2. جلب تفاصيل موقع محدد
export async function getWebsiteById(id) {
  try {
    const response = await apiHandler({
      endPoint: `web-service/websites/${id}`,
    });
    return (
      response?.data ||
      response ||
      MOCK_WEBSITES_LIST.find((site) => site.id === id) ||
      MOCK_WEBSITES_LIST[0]
    );
  } catch {
    return (
      MOCK_WEBSITES_LIST.find((site) => site.id === id) ||
      MOCK_WEBSITES_LIST[0]
    );
  }
}

// 3. إنشاء موقع جديد ونشره
export async function createWebsite(websiteData) {
  try {
    const response = await apiHandler({
      endPoint: "web-service/websites",
      method: "POST",
      body: websiteData,
    });
    return response?.data || response || { success: true, ...websiteData, id: `site-${Date.now()}` };
  } catch {
    return { success: true, ...websiteData, id: `site-${Date.now()}` };
  }
}

// 4. تحديث إعدادات وأقسام موقع موجود
export async function updateWebsite(id, websiteData) {
  try {
    const response = await apiHandler({
      endPoint: `web-service/websites/${id}`,
      method: "PUT",
      body: websiteData,
    });
    return response?.data || response || { success: true, id, ...websiteData };
  } catch {
    return { success: true, id, ...websiteData };
  }
}

// 5. حذف موقع
export async function deleteWebsite(id) {
  try {
    const response = await apiHandler({
      endPoint: `web-service/websites/${id}`,
      method: "DELETE",
    });
    return response?.data || response || { success: true, id };
  } catch {
    return { success: true, id };
  }
}

// 6. رفع الشعار أو الوسائط
export async function uploadAsset(file) {
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

export const websiteBuilderApi = {
  getWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  uploadAsset,
};

export default websiteBuilderApi;
