import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

/**
 * Reusable component to render translated stat card titles/labels.
 * Automatically switches between Arabic and English based on the current locale.
 */
export function StatTitle({ title, children }) {
  const { locale } = useI18n();
  const raw = title !== undefined ? title : children;
  if (!raw || typeof raw !== "string") return raw ?? null;
  return locale === "ar" ? translateErp(raw, locale) : raw;
}

export default StatTitle;
