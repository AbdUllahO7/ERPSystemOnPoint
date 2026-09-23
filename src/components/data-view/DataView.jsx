import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Printer,
  Download,
  Plus,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatsCards } from "./StatsCards";
import { RowActionsMenu } from "./RowActionsMenu";
import iconTable from "@/assets/show-tabel.svg";
import iconCards from "@/assets/cards-sho.svg";

function ViewToggleIcon({ src, active, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={!alt}
      className={cn("h-4 w-4 shrink-0", active && "brightness-0 invert")}
    />
  );
}

function ViewToggle({ view, onChange, allowedViews }) {
  const options = [
    { id: "table", icon: iconTable, label: "Table view" },
    { id: "cards", icon: iconCards, label: "Card view" },
  ].filter((opt) => allowedViews.includes(opt.id));

  if (options.length < 2) return null;

  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
    >
      {options.map((opt) => {
        const isActive = view === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-label={opt.label}
            aria-pressed={isActive}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-primary shadow-sm"
                : "bg-transparent hover:bg-muted",
            )}
          >
            <ViewToggleIcon src={opt.icon} active={isActive} alt="" />
          </button>
        );
      })}
    </div>
  );
}

function ToolbarIconButton({ active, children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function getCellValue(row, column) {
  if (column.render) return column.render(row);
  if (column.accessor) return column.accessor(row);
  if (column.key) return row[column.key];
  return null;
}

function buildPageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...items]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

/**
 * Reusable data layout: toolbar + table/cards + pagination.
 * Pass only the props you need — omitted sections stay hidden.
 */
export function DataView({
  isLoading = false,
  data = [],
  getRowId = (_, index) => index,

  defaultView = "table",
  view: controlledView,
  onViewChange,
  allowedViews = ["table", "cards"],

  search,
  filter,
  onRefresh,
  onPrint,
  export: exportAction,
  addButton,

  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,

  columns = [],
  onColumnSettings,
  onSort,
  sortKey,
  sortDirection,

  stats,

  card,
  renderRowActions,
  rowActionsMenu,
  actionsColumnLabel = "Actions",
  renderCardMenu,

  pagination,
  emptyMessage = "No data",
  className,
  toolbarExtra,
}) {
  const [internalView, setInternalView] = useState(defaultView);
  const [internalSelected, setInternalSelected] = useState([]);

  const view = controlledView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  const selectedIds = controlledSelectedIds ?? internalSelected;
  const setSelectedIds = (next) => {
    const value = typeof next === "function" ? next(selectedIds) : next;
    if (onSelectionChange) onSelectionChange(value);
    else setInternalSelected(value);
  };

  const showViewToggle = allowedViews.length > 1;
  const allIds = useMemo(
    () => data.map((row, index) => getRowId(row, index)),
    [data, getRowId],
  );
  const allSelected =
    selectable &&
    data.length > 0 &&
    allIds.every((id) => selectedIds.includes(id));

  function toggleAll() {
    setSelectedIds(allSelected ? [] : allIds);
  }

  function toggleRow(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const toolbarVisible =
    search ||
    filter ||
    true || // Refresh button is always visible
    onPrint ||
    exportAction ||
    addButton ||
    showViewToggle;

  const hasRowMenu =
    Boolean(rowActionsMenu?.length) || typeof rowActionsMenu === "function";
  const showActionsColumn = renderRowActions || hasRowMenu || onColumnSettings;
  const showCardsView = Boolean(card) && allowedViews.includes("cards");
  const showTableView = allowedViews.includes("table");
  const useViewTransition = showCardsView && showTableView;

  const cardsContent =
    showCardsView &&
    data.map((row, index) => {
      const id = getRowId(row, index);
      const CardIcon = card.icon;
      const title = card.title?.(row, index) ?? "";
      const subtitle = card.subtitle?.(row, index);

      return (
        <article key={id} className="rounded-xl border border-border bg-card">
          <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {CardIcon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CardIcon className="size-4" />
                </div>
              )}
              <h3 className="truncate text-sm font-semibold text-foreground">
                {title}
              </h3>
            </div>
            {hasRowMenu ? (
              <RowActionsMenu
                row={row}
                rowIndex={index}
                groups={
                  typeof rowActionsMenu === "function"
                    ? rowActionsMenu(row, index)
                    : rowActionsMenu
                }
              />
            ) : (
              renderCardMenu && (
                <button
                  type="button"
                  onClick={() => renderCardMenu(row, index)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  aria-label="More options"
                >
                  <MoreVertical className="size-4" />
                </button>
              )
            )}
          </div>
          <div className="space-y-2 px-4 py-3">
            {subtitle && <p className="text-xs text-primary/80">{subtitle}</p>}
            {card.fields?.map((field, fi) => {
              const value = field.value?.(row, index) ?? row[field.key];
              if (value == null || value === "") return null;
              const FieldIcon = field.icon;
              return (
                <div
                  key={field.key ?? fi}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  {FieldIcon && (
                    <FieldIcon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  {field.label && (
                    <span className="text-muted-foreground">{field.label}</span>
                  )}
                  <span className="truncate">{value}</span>
                </div>
              );
            })}
            {card.renderFooter?.(row, index)}
          </div>
        </article>
      );
    });

  const tableContent = showTableView && (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/80">
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 rounded border-input accent-primary"
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key ?? col.label}
                className={cn(
                  "px-4 py-3 text-start font-medium text-muted-foreground",
                  col.className,
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1",
                    col.sortable && "cursor-pointer hover:text-foreground",
                  )}
                  disabled={!col.sortable}
                  onClick={() =>
                    col.sortable &&
                    onSort?.(
                      col.key,
                      sortKey === col.key && sortDirection === "asc"
                        ? "desc"
                        : "asc",
                    )
                  }
                >
                  {col.label}
                  {col.sortable && (
                    <span className="text-muted-foreground">
                      {sortKey === col.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5" />
                      )}
                    </span>
                  )}
                </button>
              </th>
            ))}
            {showActionsColumn && (
              <th className="w-14 px-4 py-3 text-end">
                <div className="flex items-center justify-end gap-2">
                  {onColumnSettings && (
                    <button
                      type="button"
                      onClick={onColumnSettings}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                      aria-label="Column settings"
                    >
                      <SlidersHorizontal className="size-4" />
                    </button>
                  )}
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const id = getRowId(row, index);
            const isSelected = selectedIds.includes(id);

            return (
              <tr
                key={id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50",
                  index % 2 === 1 && "bg-primary/5",
                  isSelected && "bg-primary/10",
                )}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      className="size-4 rounded border-input accent-primary"
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col) => {
                  const content = getCellValue(row, col);
                  return (
                    <td
                      key={col.key ?? col.label}
                      className={cn("px-4 py-3", col.cellClassName)}
                    >
                      {col.link ? (
                        <button
                          type="button"
                          onClick={() => col.onLinkClick?.(row, index)}
                          className="font-medium text-primary hover:text-primary/90 hover:underline"
                        >
                          {content}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            col.emphasize && "font-medium text-primary",
                          )}
                        >
                          {content}
                        </span>
                      )}
                    </td>
                  );
                })}
                {showActionsColumn && (
                  <td className="px-4 py-3 text-end">
                    {hasRowMenu ? (
                      <RowActionsMenu
                        row={row}
                        rowIndex={index}
                        groups={
                          typeof rowActionsMenu === "function"
                            ? rowActionsMenu(row, index)
                            : rowActionsMenu
                        }
                      />
                    ) : (
                      renderRowActions?.(row, index)
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {stats?.length > 0 && <StatsCards cards={stats} />}

      {toolbarVisible && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {search && (
              <div className="relative min-w-[200px] flex-1 max-w-xl">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    search.onChange?.(value, data);
                  }}
                  placeholder={search.placeholder ?? "Search..."}
                  className="h-10 w-full rounded-lg border-border bg-card ps-9 pe-3"
                />
              </div>
            )}
            {filter && (
              <Button
                type="button"
                variant="outline"
                onClick={filter.onClick}
                className="h-10 gap-2 rounded-lg border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary/90"
              >
                <Filter className="size-4" />
                {filter.label ?? "Filter"}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showViewToggle && (
              <ViewToggle
                view={view}
                onChange={setView}
                allowedViews={allowedViews}
              />
            )}
            <ToolbarIconButton onClick={() => window.location.reload()} aria-label="Refresh">
              <RefreshCw className="size-4" />
            </ToolbarIconButton>
            {onPrint && (
              <ToolbarIconButton onClick={onPrint} aria-label="Print">
                <Printer className="size-4" />
              </ToolbarIconButton>
            )}
            {/* exportAction && (
              <Button
                type="button"
                variant="outline"
                onClick={exportAction.onClick}
                className="h-10 gap-2 rounded-lg border-border"
              >
                <Download className="size-4" />
                {exportAction.label ?? "Export"}
              </Button>
            ) */}
            {addButton && (
              <Button
                type="button"
                onClick={addButton.onClick}
                className="h-10 gap-2 rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" />
                {addButton.label ?? "Add"}
              </Button>
            )}
          </div>
        </div>
      )}

      {toolbarExtra}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          view === "cards" && showCardsView ? (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <article
                  key={i}
                  className="rounded-xl border border-border bg-card animate-pulse"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-muted"></div>
                      <div className="h-4 w-24 rounded bg-muted"></div>
                    </div>
                  </div>
                  <div className="space-y-4 px-4 py-4">
                    <div className="h-3 w-full rounded bg-muted"></div>
                    <div className="h-3 w-4/5 rounded bg-muted"></div>
                    <div className="h-3 w-3/4 rounded bg-muted"></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/80">
                    {selectable && <th className="w-12 px-4 py-3"></th>}
                    {columns.map((col) => (
                      <th key={col.key ?? col.label} className="px-4 py-3">
                        <div className="h-4 w-24 rounded bg-muted/50 animate-pulse"></div>
                      </th>
                    ))}
                    {showActionsColumn && <th className="w-14 px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {selectable && <td className="px-4 py-3"></td>}
                      {columns.map((col) => (
                        <td key={col.key ?? col.label} className="px-4 py-3">
                          <div className="h-4 w-full rounded bg-muted animate-pulse max-w-[80%]"></div>
                        </td>
                      ))}
                      {showActionsColumn && <td className="px-4 py-3"></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : data.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : useViewTransition ? (
          <div className="data-view-panels">
            <div
              className="data-view-panel"
              data-active={view === "table" ? "true" : "false"}
              aria-hidden={view !== "table"}
            >
              {tableContent}
            </div>
            <div
              className="data-view-panel"
              data-active={view === "cards" ? "true" : "false"}
              aria-hidden={view !== "cards"}
            >
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
                {cardsContent}
              </div>
            </div>
          </div>
        ) : view === "cards" && showCardsView ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {cardsContent}
          </div>
        ) : (
          tableContent
        )}

        {pagination && (
          <div className="flex items-center justify-end gap-1 border-t border-border px-4 py-3">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange?.(pagination.page - 1)}
              className="px-2 py-1 text-sm text-muted-foreground disabled:opacity-40 hover:text-foreground"
            >
              {pagination.prevLabel ?? "Pre"}
            </button>
            {buildPageItems(pagination.page, pagination.totalPages).map(
              (item, i) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pagination.onPageChange?.(item)}
                    className={cn(
                      "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm",
                      item === pagination.page
                        ? "bg-primary font-medium text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {item}
                  </button>
                ),
            )}
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              className="px-2 py-1 text-sm text-muted-foreground disabled:opacity-40 hover:text-foreground"
            >
              {pagination.nextLabel ?? "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataView;
