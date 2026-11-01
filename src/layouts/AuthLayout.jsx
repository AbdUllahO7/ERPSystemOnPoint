import { Outlet } from "react-router-dom"

/**
 * AuthLayout — صفحة مستقلة للمصادقة بدون header أو footer
 * تُستخدم لصفحات: تسجيل الدخول، إنشاء الحساب، نسيت كلمة المرور
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#222226] flex flex-col items-center justify-center">
      <Outlet />
    </div>
  )
}

