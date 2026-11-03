import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, isLoggedIn } from "@/services/auth";

/**
 * useCurrentUser
 * ---------------------------------------------------------------
 * Hook يُعيد بيانات المستخدم المسجّل حالياً.
 *
 * المصدر: localStorage("erp_current_user") + JWT Claims
 * لا يستدعي أي API — المعلومات مستخلصة من التوكن واستجابة Login.
 *
 * @returns {{
 *   user: {
 *     userId: string|null,
 *     userName: string|null,
 *     email: string|null,
 *     tenantId: string|null,
 *     roles: string[],
 *     isAuthenticated: boolean,
 *     accessTokenExpiresAt: string|null,
 *     refreshTokenExpiresAt: string|null,
 *   }|null,
 *   isLoggedIn: boolean,
 *   initials: string,
 *   displayName: string,
 *   refetch: () => void,
 * }}
 */
export function useCurrentUser() {
  const [user, setUser] = useState(() => getCurrentUser());

  const refetch = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  // إعادة الجلب عند تغيير localStorage من أي نافذة أخرى
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "erp_current_user") {
        setUser(getCurrentUser());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const displayName =
    user?.userName?.replace(/^Admin_[a-f0-9]+$/i, "Admin") ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return {
    user,
    isLoggedIn: isLoggedIn(),
    displayName,
    initials,
    refetch,
  };
}

export default useCurrentUser;

