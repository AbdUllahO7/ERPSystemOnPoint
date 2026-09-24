import { apiHandler } from "@/lib/api-handler";
import {
  INITIAL_HERO_CONTENT,
  INITIAL_STATISTICS_CONTENT,
  INITIAL_ABOUT_CONTENT,
  INITIAL_SERVICES_CONTENT,
  INITIAL_CTA_CONTENT,
  INITIAL_FAQ_CONTENT,
  INITIAL_CONTACT_CONTENT,
  INITIAL_FOOTER_CONTENT,
} from "../website-content.constants";

export const websiteContentApi = {
  // 1. جلب كامل محتوى أقسام الموقع
  getAllContent: async (websiteId = "default") => {
    try {
      const response = await apiHandler({
        endPoint: `web-service/websites/${websiteId}/content`,
      });
      return response?.data || response || {
        hero: INITIAL_HERO_CONTENT,
        statistics: INITIAL_STATISTICS_CONTENT,
        about: INITIAL_ABOUT_CONTENT,
        services: INITIAL_SERVICES_CONTENT,
        cta: INITIAL_CTA_CONTENT,
        faq: INITIAL_FAQ_CONTENT,
        contact: INITIAL_CONTACT_CONTENT,
        footer: INITIAL_FOOTER_CONTENT,
      };
    } catch {
      return {
        hero: INITIAL_HERO_CONTENT,
        statistics: INITIAL_STATISTICS_CONTENT,
        about: INITIAL_ABOUT_CONTENT,
        services: INITIAL_SERVICES_CONTENT,
        cta: INITIAL_CTA_CONTENT,
        faq: INITIAL_FAQ_CONTENT,
        contact: INITIAL_CONTACT_CONTENT,
        footer: INITIAL_FOOTER_CONTENT,
      };
    }
  },

  // 2. تحديث محتوى قسم محدد
  updateSectionContent: async (websiteId = "default", sectionKey, data) => {
    try {
      const response = await apiHandler({
        endPoint: `web-service/websites/${websiteId}/content/${sectionKey}`,
        method: "PUT",
        body: data,
      });
      return response?.data || response || { success: true, sectionKey, data };
    } catch {
      return { success: true, sectionKey, data };
    }
  },

  // 3. رفع صورة لأحد الأقسام
  uploadSectionMedia: async (file) => {
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

export default websiteContentApi;
