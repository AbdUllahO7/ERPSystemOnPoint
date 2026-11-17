import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function CollapsibleFilterBar({
  isOpen,
  configs = [],
  filters = {},
  onFilterChange,
  onClear,
  children,
}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const hasActiveFilters =
    Object.values(filters).some(
      (val) => val !== "" && val !== null && val !== undefined
    ) || false;

  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isOpen
          ? "grid-rows-[1fr] opacity-100 mb-6"
          : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
      }`}
    >
      <div className="overflow-hidden">
        <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
          {configs.map((config) => {
            const displayLabel = isAr && typeof config.label === "string" ? translateErp(config.label, locale) : config.label;
            const displayPlaceholder = isAr && typeof config.placeholder === "string" ? translateErp(config.placeholder, locale) : config.placeholder;

            return (
            <div
              key={config.key}
              className={`flex flex-col gap-2 w-full ${config.width || "sm:max-w-[200px]"}`}
            >
              <label className="text-sm font-medium text-foreground">
                {displayLabel}
              </label>
              {config.type === "date" ? (
                <Input
                  type="date"
                  value={filters[config.key] || ""}
                  onChange={(e) => onFilterChange(config.key, e.target.value)}
                  className="h-10 bg-transparent"
                />
              ) : config.type === "number" || config.type === "text" ? (
                <Input
                  type={config.type}
                  placeholder={displayPlaceholder}
                  value={filters[config.key] || ""}
                  onChange={(e) => onFilterChange(config.key, e.target.value)}
                  className="h-10 bg-transparent"
                />
              ) : (
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    onFilterChange(config.key, val === "all" ? "" : val);
                  }}
                >
                  <SelectTrigger className="w-full h-10 bg-transparent">
                    <SelectValue placeholder={displayPlaceholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{displayPlaceholder}</SelectItem>
                    {config.options?.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {isAr && typeof opt.label === "string" ? translateErp(opt.label, locale) : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            );
          })}

          {children}

          {(hasActiveFilters || (children && onClear)) && onClear && (
            <Button
              variant="outline"
              onClick={onClear}
              className="h-10 cursor-pointer"
            >
              {t("common.clearFilters")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleFilterBar;
