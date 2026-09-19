import { Fragment, useState } from "react";
import { MoreVertical, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   row: object,
 *   rowIndex?: number,
 *   groups?: Array<{
 *     label?: string,
 *     items: Array<{
 *       key?: string,
 *       label: string,
 *       icon?: import('react').ComponentType<{ className?: string }>,
 *       destructive?: boolean,
 *       hidden?: boolean | ((row: object, index?: number) => boolean),
 *       onClick?: (row: object, index?: number) => void,
 *     }>,
 *   }>,
 *   align?: 'start' | 'end' | 'center',
 * }} props
 */
export function RowActionsMenu({ row, rowIndex, groups = [], align = "end" }) {
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    groups.forEach((g, i) => {
      initial[g.label || i] = true;
    });
    return initial;
  });

  const toggleGroup = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (typeof item.hidden === "function") return !item.hidden(row, rowIndex);
        return !item.hidden;
      }),
    }))
    .filter((group) => group.items.length > 0);

  if (!visibleGroups.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Actions"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52 max-h-[350px] overflow-y-auto rounded-xl p-1">
        {visibleGroups.map((group, gi) => (
          <Fragment key={group.label ?? gi}>
            {gi > 0 && <DropdownMenuSeparator />}
            {group.label && (
              <div
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-base font-semibold cursor-pointer hover:bg-muted/50 rounded-md",
                  group.label === "View" ? "text-primary" : "text-foreground"
                )}
                onClick={(e) => toggleGroup(e, group.label || gi)}
              >
                <span>{group.label}</span>
                {expandedGroups[group.label || gi] ? (
                  <ArrowUpCircle className="size-4 opacity-70" />
                ) : (
                  <ArrowDownCircle className="size-4 opacity-70" />
                )}
              </div>
            )}
            {(!group.label || expandedGroups[group.label || gi]) &&
              group.items.map((item) => {
                const Icon = item.icon;
                const isPrimaryGroup = group.label === "View";
                return (
                  <DropdownMenuItem
                    key={item.key ?? item.label}
                    onClick={() => item.onClick?.(row, rowIndex)}
                    className={cn(
                      "cursor-pointer gap-2 rounded-lg px-2 py-2",
                      item.destructive 
                        ? "text-destructive focus:bg-destructive/10 focus:text-destructive" 
                        : isPrimaryGroup
                          ? "text-primary focus:text-primary focus:bg-primary/10"
                          : "text-foreground focus:text-foreground focus:bg-muted"
                    )}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RowActionsMenu;

