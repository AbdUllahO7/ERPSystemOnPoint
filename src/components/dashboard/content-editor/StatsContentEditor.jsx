import React from "react";

export function StatsContentEditor({ data, onChange }) {
  const statKeys = [
    { key: "stat1", labelNumber: "Static1" },
    { key: "stat2", labelNumber: "Static2" },
    { key: "stat3", labelNumber: "Static3" },
    { key: "stat4", labelNumber: "Static4" },
  ];

  const handleFieldChange = (key, field, value) => {
    onChange(key, {
      ...data[key],
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Statistics Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter the title of the statistic and the number next to it
        </p>
      </div>

      {/* 4 Rows Grid (Title on left, Number on right) */}
      <div className="space-y-5 pt-2">
        {statKeys.map((item) => (
          <div
            key={item.key}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                {item.labelNumber} Title
              </label>
              <input
                type="text"
                placeholder="static title"
                value={data[item.key]?.title || ""}
                onChange={(e) => handleFieldChange(item.key, "title", e.target.value)}
                className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
              />
            </div>

            {/* Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                {item.labelNumber} Number
              </label>
              <input
                type="text"
                placeholder="static number"
                value={data[item.key]?.number || ""}
                onChange={(e) => handleFieldChange(item.key, "number", e.target.value)}
                className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all font-bold text-[#0066d1]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsContentEditor;
