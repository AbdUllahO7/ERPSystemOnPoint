import axios from "axios";
import Cookies from "js-cookie";

// ✨ إنشاء Axios instance
const api = axios.create({
  baseURL: "https://apierp.onpoint-teasting.com/api/",

});

// ✨ إضافة Interceptor للطلبات
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
  }

  return config;
});

/**
 * دالة عامة للتعامل مع الـ API
 * @param {Object} options
 * @param {string} options.endPoint - عنوان الـ API
 * @param {string} [options.method="GET"] - نوع الطلب (GET, POST, PUT, DELETE...)
 * @param {Object|FormData} [options.body] - البيانات المرسلة
 * @param {Object} [options.params] - البراميترز
 * @returns {Promise<any>} - نتيجة الاستجابة
 */
export const apiHandler = async ({ endPoint, method = "GET", body, params }) => {
  try {
    const config = {
      method,
      url: endPoint,
      params,
    };

    // لو الطلب مش GET وفيه body
    if (method !== "GET" && body) {
      config.data = body;

      // لو body عبارة عن FormData، احذف Content-Type
      if (body instanceof FormData) {
        config.headers = config.headers || {};
        delete config.headers["Content-Type"];
      }
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
  console.error("API Error:", error);

  if (axios.isAxiosError(error)) {
    const errorData = error?.response?.data;

    // طباعة البيانات اللي جاية من الباك لمراجعتها
    console.log("Backend Error Response:", errorData);

    // استخراج الرسالة من الباك إند
    let message = "An unexpected error occurred";

    if (errorData?.errors) {
      message = Object.values(errorData.errors).flat().join("\n");
    } else if (errorData?.msg || errorData?.message || errorData?.Message) {
      message = errorData.msg || errorData.message || errorData.Message;
    } else if (errorData?.title) {
      message = errorData.title;
    } else if (typeof errorData === 'string') {
      message = errorData;
    }

    // نرمي الرسالة زي ما جاية من الباك
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  // لو مش Axios Error
  throw error;
}
};
