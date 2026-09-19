import { User, FileText, ClipboardList, Activity } from "lucide-react";

const getIconForAction = (title) => {
  if (!title) return Activity;
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("contact")) return User;
  if (lowerTitle.includes("project")) return ClipboardList;
  if (lowerTitle.includes("note")) return FileText;
  return Activity;
};

export function TimelineTab({ customer }) {
  const timeline = customer?.timeline || [];

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white border rounded-xl shadow-sm">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">No activity found</h3>
        <p className="text-muted-foreground text-sm mt-1">There are no recent activities for this customer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 px-4">
      {timeline.map((event, index) => {
        const Icon = getIconForAction(event.actionTitle);
        
        return (
          <div key={event.id} className="relative flex items-start gap-6 pb-12 last:pb-0">
            {/* Vertical Line */}
            {index !== timeline.length - 1 && (
              <div className="absolute left-6 top-14 bottom-0 w-px bg-gray-200" />
            )}
            
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0 z-10">
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="pt-2">
              <h4 className="text-base font-semibold text-foreground">{event.actionTitle}</h4>
              {event.description && event.description !== "string" && (
                <p className="text-sm text-foreground/80 mt-1">{event.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {event.date ? new Date(event.date).toLocaleString('en-US') : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
