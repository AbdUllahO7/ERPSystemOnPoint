import axios from "axios";
import Cookies from "js-cookie";

// ✨ إنشاء Axios instance بمواصفات أمان ومهلة زمنية
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://apierp.onpoint-teasting.com/api/",
  timeout: 20000, // 20 ثانية مهلة زمنية للطلب لمنع تعليق المتصفح
  headers: {
    "Accept": "application/json",
  },
});

// ✨ إضافة Interceptor للطلبات وتمرير التوكن
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ✨ إضافة Interceptor للاستجابات ومعالجة انتهاء الجلسة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // في حال انتهاء صلاحية الجلسة (401)
    if (error?.response?.status === 401) {
      console.warn("Session expired or unauthorized request.");
      // يمكن توجيه المستخدم لصفحة تسجيل الدخول إذا لم نكن فيها بالفعل
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
        // window.location.href = "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * دالة عامة للتعامل مع الـ API مع دعم الإلغاء والمهلة
 * @param {Object} options
 * @param {string} options.endPoint - عنوان الـ API
 * @param {string} [options.method="GET"] - نوع الطلب (GET, POST, PUT, DELETE...)
 * @param {Object|FormData} [options.body] - البيانات المرسلة
 * @param {Object} [options.params] - معاملات البحث والترقيم
 * @param {AbortSignal} [options.signal] - إشارة إلغاء الطلب عند مغادرة الصفحة
 * @param {Object} [options.headers] - ترويسات إضافية
 * @returns {Promise<any>} - نتيجة الاستجابة
 */
export const apiHandler = async ({ endPoint, method = "GET", body, params, signal, headers = {} }) => {
  try {
    const config = {
      method,
      url: endPoint,
      params,
      signal,
      headers: { ...headers },
    };

    if (method !== "GET" && body) {
      config.data = body;

      // لو body عبارة عن FormData، دع Axios يضبط الـ Boundary تلقائياً
      if (body instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", endPoint);
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const errorData = error?.response?.data;

      let message = "حدث خطأ غير متوقع في الاتصال بالخادم";

      if (errorData?.errors) {
        message = Object.values(errorData.errors).flat().join("\n");
      } else if (errorData?.msg || errorData?.message || errorData?.Message) {
        message = errorData.msg || errorData.message || errorData.Message;
      } else if (errorData?.title) {
        message = errorData.title;
      } else if (typeof errorData === "string") {
        message = errorData;
      } else if (error.code === "ECONNABORTED") {
        message = "انتهت المهلة الزمنية للاتصال بالخادم، يرجى المحاولة لاحقاً";
      }

      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    throw error;
  }
};

export default api;
