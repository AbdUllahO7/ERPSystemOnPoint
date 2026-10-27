import axios from "axios";
import Cookies from "js-cookie";

// ✨ إنشاء Axios instance بمواصفات أمان ومهلة زمنية
// في بيئة التطوير (DEV) يتم استخدام الـ Proxy (/api/) لتجنب منع المتصفح للطلبات بسبب CORS
const defaultBaseURL = import.meta.env.DEV
  ? "/api/"
  : "https://apierp.onpoint-teasting.com/api/";

const api = axios.create({
  baseURL:"https://apierp.onpoint-teasting.com/api/"
  //  import.meta.env.VITE_API_URL || defaultBaseURL
  ,
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
    let normalizedEndpoint = endPoint || "";
    if (normalizedEndpoint.startsWith("/api/")) {
      normalizedEndpoint = normalizedEndpoint.slice(5);
    } else if (normalizedEndpoint.startsWith("api/")) {
      normalizedEndpoint = normalizedEndpoint.slice(4);
    } else if (normalizedEndpoint.startsWith("/")) {
      normalizedEndpoint = normalizedEndpoint.slice(1);
    }

    const config = {
      method,
      url: normalizedEndpoint,
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

    // ✨ التحقق مما إذا كان الخادم أعاد استجابة خطأ منطقي مغلفة حتى لو كان كود الحالة 200
    if (
      response.data &&
      typeof response.data === "object" &&
      (response.data.success === false || response.data.status >= 400)
    ) {
      let errMsg =
        response.data.message ||
        response.data.msg ||
        response.data.Message;

      if (!errMsg && response.data.errors) {
        if (Array.isArray(response.data.errors)) {
          errMsg = response.data.errors.join("\n");
        } else if (typeof response.data.errors === "object") {
          errMsg = Object.values(response.data.errors).flat().join("\n");
        }
      }

      if (!errMsg) {
        errMsg = "حدث خطأ أثناء تنفيذ العملية";
      }

      const err = new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
      err.response = response;
      err.data = response.data;
      throw err;
    }

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
        if (Array.isArray(errorData.errors)) {
          message = errorData.errors.join("\n");
        } else if (typeof errorData.errors === "object") {
          message = Object.values(errorData.errors).flat().join("\n");
        }
      } else if (errorData?.message || errorData?.msg || errorData?.Message) {
        message = errorData.message || errorData.msg || errorData.Message;
      } else if (errorData?.title) {
        message = errorData.title;
      } else if (typeof errorData === "string") {
        message = errorData;
      } else if (error.code === "ECONNABORTED") {
        message = "انتهت المهلة الزمنية للاتصال بالخادم، يرجى المحاولة لاحقاً";
      }

      const customErr = new Error(typeof message === "string" ? message : JSON.stringify(message));
      customErr.response = error.response;
      customErr.data = errorData;
      throw customErr;
    }

    throw error;
  }
};

export default api;
