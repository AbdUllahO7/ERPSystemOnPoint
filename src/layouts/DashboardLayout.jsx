import { Outlet } from "react-router-dom";
import { DashboardProviders } from "../context/dashboard-providers";
import { DashboardClientWrapper } from "../context/dashboard-client-wrapper";
import { useI18n } from "../context/translate-api";

export default function DashboardLayout() {
    const { changeLanguage, locale } = useI18n();

  return (
    <div className=" w-full" dir={locale === "en" ? "ltr" : "rtl"}>
    <DashboardProviders>
      <DashboardClientWrapper>
        <Outlet />
      </DashboardClientWrapper>
    </DashboardProviders>
    </div>
  );
}
