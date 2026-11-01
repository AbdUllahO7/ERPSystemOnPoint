import { apiHandler } from "@/lib/api-handler";
import Cookies from "js-cookie";

/**
 * ============================================================
 * Auth & Tenant Registration Service
 * مربوط 100% بالـ Swagger الفعلي على السيرفر
 * ============================================================
 *
 * الـ Endpoints المستخدمة:
 *   POST /api/saas/Tenants/RegisterTenant  → registerTenant()
 *   POST /api/Hr/Auth/VerifyOtp            → verifyOtp()
 *   POST /api/Hr/Auth/ResendOtp            → resendOtp()
 *   POST /api/Hr/Auth/ForgotPassword       → forgotPassword()
 *   POST /api/Hr/Auth/ResetPassword        → resetPassword()
 *   POST /api/Hr/Auth/Login/Login          → login()
 *   POST /api/Hr/Auth/RefreshToken         → refreshToken()
 *   POST /api/Hr/Auth/Logout               → logout()
 */

// ----------------------------------------------------------------
// 1. registerTenant — RegisterTenantDto
//    Required: companyName, businessType, initializeSettings,
//              mainBranchName, adminEmail, adminPassword
//    Optional: country (nullable), taxType (nullable)
// ----------------------------------------------------------------
export async function registerTenant(data) {
  return apiHandler({
    endPoint: "saas/Tenants/RegisterTenant",
    method: "POST",
    body: {
      companyName: data.companyName,
      businessType: data.businessType,
      country: data.country ?? null,
      initializeSettings: {
        baseCurrencyCode: data.initializeSettings.baseCurrencyCode,
        selectedCurrencyCodes: data.initializeSettings.selectedCurrencyCodes,
      },
      taxType: data.taxType ?? null,
      mainBranchName: data.mainBranchName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
    },
  });
}

// ----------------------------------------------------------------
// 2. verifyOtp — VerifyOtpDto
//    Required: email, otp, purpose (enum: "EmailConfirmation" | "PasswordReset")
// ----------------------------------------------------------------
export async function verifyOtp({ email, otp, purpose = "EmailConfirmation" }) {
  return apiHandler({
    endPoint: "Hr/Auth/VerifyOtp",
    method: "POST",
    body: { email, otp, purpose },
  });
}

// ----------------------------------------------------------------
// 3. resendOtp — EmailRequestDto
//    Required: email
// ----------------------------------------------------------------
export async function resendOtp({ email }) {
  return apiHandler({
    endPoint: "Hr/Auth/ResendOtp",
    method: "POST",
    body: { email },
  });
}

// ----------------------------------------------------------------
// 4. forgotPassword — EmailRequestDto
//    Required: email
// ----------------------------------------------------------------
export async function forgotPassword({ email }) {
  return apiHandler({
    endPoint: "Hr/Auth/ForgotPassword",
    method: "POST",
    body: { email },
  });
}

// ----------------------------------------------------------------
// 5. resetPassword — ResetPasswordDto
//    Required: email, resetToken, newPassword
// ----------------------------------------------------------------
export async function resetPassword({ email, resetToken, newPassword }) {
  return apiHandler({
    endPoint: "Hr/Auth/ResetPassword",
    method: "POST",
    body: { email, resetToken, newPassword },
  });
}

// ----------------------------------------------------------------
// 6. login — LoginDto
//    Required: email, password
//    يحفظ التوكن في الكوكيز تلقائياً
// ----------------------------------------------------------------
export async function login({ email, password }) {
  const response = await apiHandler({
    endPoint: "Hr/Auth/Login/Login",
    method: "POST",
    body: { email, password },
  });

  // استخراج التوكن من أي شكل محتمل للـ Response
  const token =
    response?.token ||
    response?.accessToken ||
    response?.data?.token ||
    response?.data?.accessToken;

  const refreshTokenValue =
    response?.refreshToken ||
    response?.data?.refreshToken;

  if (token) {
    Cookies.set("token", token, { expires: 7 });
  }
  if (refreshTokenValue) {
    Cookies.set("refreshToken", refreshTokenValue, { expires: 30 });
  }

  // حفظ بيانات المستخدم
  const user = response?.user || response?.data?.user || response?.data;
  if (user) {
    localStorage.setItem("erp_user", JSON.stringify(user));
  }

  return response;
}

// ----------------------------------------------------------------
// 7. refreshToken — RefreshTokenDto
//    Required: refreshToken
// ----------------------------------------------------------------
export async function refreshToken() {
  const currentRefreshToken = Cookies.get("refreshToken");
  if (!currentRefreshToken) throw new Error("No refresh token available");

  const response = await apiHandler({
    endPoint: "Hr/Auth/RefreshToken",
    method: "POST",
    body: { refreshToken: currentRefreshToken },
  });

  const newToken = response?.token || response?.accessToken || response?.data?.token;
  if (newToken) {
    Cookies.set("token", newToken, { expires: 7 });
  }

  return response;
}

// ----------------------------------------------------------------
// 8. logout — RefreshTokenDto
//    Required: refreshToken (يُرسَل في الـ Body حسب الـ Swagger)
// ----------------------------------------------------------------
export async function logout() {
  const currentRefreshToken = Cookies.get("refreshToken");
  try {
    await apiHandler({
      endPoint: "Hr/Auth/Logout",
      method: "POST",
      body: { refreshToken: currentRefreshToken ?? "" },
    });
  } catch (err) {
    console.warn("Logout API error (ignored):", err?.message);
  } finally {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    localStorage.removeItem("erp_user");
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
export function getStoredToken() {
  return Cookies.get("token") || null;
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("erp_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(Cookies.get("token"));
}
