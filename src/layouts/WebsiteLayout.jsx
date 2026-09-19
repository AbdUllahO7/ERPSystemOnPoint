import { Outlet, NavLink } from "react-router-dom"
import { LanguageSwitcher } from "../components/common/LanguageSwitcher"
import { useI18n } from "../context/translate-api";

export default function WebsiteLayout() {
  const { t  } = useI18n();
 
  return (
    <div className="border-2 border-red-500" dir={t?.direction}>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <LanguageSwitcher />
        <NavLink className="border-b-2 border-blue-500" to="/">{t.Ai}</NavLink>
        <NavLink className={({ isActive }) => isActive ? "active" : ""} to="/about">About</NavLink>
        <NavLink className={({ isActive }) => isActive ? "active" : ""} to="/dashboard">Dashboard</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
