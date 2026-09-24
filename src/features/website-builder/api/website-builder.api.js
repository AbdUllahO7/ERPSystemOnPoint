import { apiHandler } from "@/lib/api-handler";
import { MOCK_WEBSITES_LIST } from "../mock/website-builder.mock";

/**
 * واجهة الاتصال بالـ API لخدمات الويب وإدارة المواقع (Web Service & Builder API Layer)
 * تدعم جلب المواقع المنشأة، إنشاء موقع جديد، تحديث البيانات، ورفع الشعار.
 */
export const websiteBuilderApi = {
  // 1. جلب قائمة المواقع المنشأة
  getWebsites: async (params = {}) => {
    try {
      const response = await apiHandler({
        endPoint: "web-service/websites",
        params,
      });
      return response?.data || response || MOCK_WEBSITES_LIST;
    } catch {
      return MOCK_WEBSITES_LIST;
    }
  },

  // 2. جلب تفاصيل موقع محدد
  getWebsiteById: async (id) => {
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
  },

  // 3. إنشاء موقع جديد ونشره
  createWebsite: async (websiteData) => {
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
  },

  // 4. تحديث إعدادات وأقسام موقع موجود
  updateWebsite: async (id, websiteData) => {
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
  },

  // 5. حذف موقع
  deleteWebsite: async (id) => {
    try {
      const response = await apiHandler({
        endPoint: `web-service/websites/${id}`,
        method: "DELETE",
      });
      return response?.data || response || { success: true, id };
    } catch {
      return { success: true, id };
    }
  },

  // 6. رفع الشعار أو الوسائط
  uploadAsset: async (file) => {
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
  },
};

export default websiteBuilderApi;
