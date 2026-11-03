import * as authService from "./auth.service";

export * from "./auth.service";

export const authApi = {
  registerTenant: authService.registerTenant,
  verifyOtp: authService.verifyOtp,
  resendOtp: authService.resendOtp,
  forgotPassword: authService.forgotPassword,
  resetPassword: authService.resetPassword,
  login: authService.login,
  refreshToken: authService.refreshToken,
  logout: authService.logout,
  getStoredToken: authService.getStoredToken,
  getStoredUser: authService.getStoredUser,
  getCurrentUser: authService.getCurrentUser,
  decodeJwt: authService.decodeJwt,
  isLoggedIn: authService.isLoggedIn,
};

export default authApi;
