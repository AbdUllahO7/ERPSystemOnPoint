import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Reusable PageTitle component matching ERP system design.
 *
 * @param {Object} props
 * @param {string|React.ReactNode} props.title - Title text
 * @param {string} [props.infoText] - Tooltip description for the info icon
 * @param {boolean} [props.showInfo=true] - Whether to show the (i) icon
 * @param {React.ReactNode} [props.breadcrumb] - Breadcrumb component or links
 * @param {string|React.ReactNode} [props.subtitle] - Optional subtitle
 * @param {React.ReactNode} [props.actions] - Right-side action buttons
 * @param {string} [props.className] - Additional classes
 */
export function PageTitle({
  title,
  infoText,
  showInfo = true,
  breadcrumb,
  subtitle,
  actions,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {showInfo && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                    aria-label="Info"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {infoText || `Overview and management for ${title}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {breadcrumb && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {breadcrumb}
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export default PageTitle;
