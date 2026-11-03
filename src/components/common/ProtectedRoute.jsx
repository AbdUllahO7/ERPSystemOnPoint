import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isLoggedIn } from "@/services/auth"

/**
 * ProtectedRoute — يحمي الصفحات التي تتطلب تسجيل دخول
 *
 * - إذا كان المستخدم مسجل الدخول → يعرض الصفحة المطلوبة
 * - إذا لم يكن مسجل → يعيد التوجيه لـ /login مع حفظ المسار الأصلي
 */
export default function ProtectedRoute() {
  const location = useLocation()

  if (!isLoggedIn()) {
    // نحفظ المسار الأصلي حتى نرجع له بعد تسجيل الدخول
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

