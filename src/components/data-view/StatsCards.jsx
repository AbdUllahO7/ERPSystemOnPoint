import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const iconColorMap = {
  blue: "bg-primary/10 text-primary",
  green: "bg-emerald-100 text-emerald-600",
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
  violet: "bg-violet-100 text-violet-600",
};

/**
 * @param {{ cards?: Array<{
 *   id?: string|number,
 *   title: string,
 *   value: string|number,
 *   trend?: string,
 *   trendUp?: boolean,
 *   icon?: import('react').ComponentType<{ className?: string }>,
 *   color?: keyof typeof iconColorMap,
 * }> }} props
 */
export function StatsCards({ cards = [] }) {
  if (!cards.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const iconClass = iconColorMap[card.color ?? "blue"] ?? iconColorMap.blue;

        return (
          <article
            key={card.id ?? card.title}
            className="flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-slate-100/90 bg-white px-3.5 sm:px-4 py-3 sm:py-4 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {Icon && (
                <div
                  className={cn(
                    "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl",
                    iconClass,
                  )}
                >
                  <Icon className="size-4 sm:size-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm text-slate-500">{card.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{card.value}</p>
              </div>
            </div>
            {card.trend != null && card.trend !== "" && (
              <div
                className={cn(
                  "flex shrink-0 items-center gap-0.5 text-xs sm:text-sm font-medium",
                  card.trendUp ? "text-emerald-600" : "text-destructive",
                )}
              >
                {card.trendUp ? (
                  <TrendingUp className="size-3.5 sm:size-4" />
                ) : (
                  <TrendingDown className="size-3.5 sm:size-4" />
                )}
                <span>{card.trend}</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default StatsCards;
