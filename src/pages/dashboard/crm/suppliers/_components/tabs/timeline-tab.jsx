import { User, FileText, ClipboardList, History, Plus, PhoneCall } from "lucide-react";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function TimelineTab({ timeline = [] }) {
  const { t, locale } = useI18n();

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
        {t('crmSuppliers.timeline.noEvents')}
      </div>
    );
  }

  const getIcon = (title) => {
    const t = title?.toLowerCase() || "";
    if (t.includes("note")) return FileText;
    if (t.includes("call") || t.includes("phone") || t.includes("contact")) return PhoneCall;
    if (t.includes("project")) return ClipboardList;
    if (t.includes("document") || t.includes("file") || t.includes("upload")) return Plus;
    return History;
  };

  const getIconColor = (title) => {
    const t = title?.toLowerCase() || "";
    if (t.includes("note")) return "bg-orange-50 text-orange-500";
    if (t.includes("call") || t.includes("phone") || t.includes("contact")) return "bg-emerald-50 text-emerald-500";
    if (t.includes("document") || t.includes("file") || t.includes("upload")) return "bg-blue-50 text-blue-500";
    return "bg-blue-50 text-blue-500";
  };

  return (
    <div className="space-y-0 px-4">
      {timeline.map((event, index) => {
        const Icon = getIcon(event.actionTitle);
        const displayTitle = isAr && typeof event.actionTitle === "string" ? translateErp(event.actionTitle, locale) : event.actionTitle;
        const displayDesc = isAr && typeof event.description === "string" ? translateErp(event.description, locale) : event.description;
        return (
          <div key={event.id || index} className="relative flex items-start gap-6 pb-12 last:pb-0">
            {/* Vertical Line */}
            {index !== timeline.length - 1 && (
              <div className="absolute left-6 top-14 bottom-0 w-px bg-gray-200" />
            )}
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${getIconColor(event.actionTitle)}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="pt-2">
              <h4 className="text-base font-semibold text-foreground">{displayTitle}</h4>
              {displayDesc && <p className="text-sm text-foreground mt-1">{displayDesc}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {event.date ? new Date(event.date).toLocaleString(isAr ? "ar-EG" : "en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "-"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
