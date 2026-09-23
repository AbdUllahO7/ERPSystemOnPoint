import React from "react";
import { Link } from "react-router-dom";
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
 * @param {string} [props.infoTooltip] - Alternative prop for tooltip description
 * @param {boolean} [props.showInfo=true] - Whether to show the (i) icon
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbLinks] - Array of breadcrumbs
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbs] - Alternative prop for breadcrumbs
 * @param {React.ReactNode} [props.breadcrumb] - Single ReactNode breadcrumb
 * @param {string|React.ReactNode} [props.subtitle] - Optional subtitle
 * @param {React.ReactNode} [props.actions] - Right-side action buttons
 * @param {string} [props.className] - Additional classes
 */
export function PageTitle({
  title,
  infoText,
  infoTooltip,
  showInfo = true,
  breadcrumb,
  breadcrumbs,
  breadcrumbLinks,
  subtitle,
  actions,
  className = "",
}) {
  const tooltipText = infoTooltip || infoText || "";
  const crumbs = breadcrumbLinks || breadcrumbs || (Array.isArray(breadcrumb) ? breadcrumb : null);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1e293b]">
            {title}
          </h1>
          {showInfo && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-slate-600 text-[10px] font-bold cursor-pointer hover:bg-slate-400 hover:text-white transition-colors"
                    aria-label="Info"
                  >
                    i
                  </span>
                </TooltipTrigger>
                {tooltipText && (
                  <TooltipContent side="top" className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md">
                    <p>{tooltipText}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {crumbs && Array.isArray(crumbs) && crumbs.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
            {crumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-400">/</span>}
                {b.href ? (
                  <Link to={b.href} className="text-slate-500 hover:text-[#0066d1] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : breadcrumb && typeof breadcrumb !== "string" ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {breadcrumb}
          </div>
        ) : null}

        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export default PageTitle;
