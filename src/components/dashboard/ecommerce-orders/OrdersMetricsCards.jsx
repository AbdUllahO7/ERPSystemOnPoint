import React from "react";
import { Building2, Users, ArrowUp, ArrowDown } from "lucide-react";

export function OrdersMetricsCards({ metrics = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric, idx) => {
        const isEmerald = metric.color === "emerald" || idx === 1;
        const isOrange = metric.color === "orange" || idx === 3;

        let iconBg = "bg-[#0066d1] text-white";
        let Icon = Building2;

        if (isEmerald) {
          iconBg = "bg-emerald-500 text-white";
          Icon = Users;
        } else if (isOrange) {
          iconBg = "bg-amber-500 text-white";
          Icon = Users;
        }

        return (
          <div
            key={metric.id || idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-4"
          >
            {/* Left: Icon */}
            <div
              className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-xs`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Middle: Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate">
                {metric.title}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {metric.value}
                </span>
                <span
                  className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                    metric.isPositive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {metric.isPositive ? (
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 stroke-[3]" />
                  )}
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(OrdersMetricsCards);
