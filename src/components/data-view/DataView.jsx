import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200/90 bg-white p-1"
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
              "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
              isActive
                ? "bg-[#0066d1] shadow-xs text-white"
                : "bg-transparent hover:bg-slate-100 text-slate-500",
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
        "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer",
        active &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function getCellValue(row, column, index) {
  if (typeof column.cell === "function") {
    return column.cell({
      row: { original: row, index },
      getValue: () => row[column.accessorKey || column.key],
    });
  }
  if (typeof column.render === "function") return column.render(row, index);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessorKey && row[column.accessorKey] !== undefined) return row[column.accessorKey];
  if (column.key && row[column.key] !== undefined) return row[column.key];
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
 * Reusable data layout matching Figma:
 * Unified white card container with toolbar + table/cards + pagination.
 */
export function DataView({
  isLoading = false,
  data = [],
  getRowId = (_, index) => index,

  defaultView = "table",
  view: controlledView,
  onViewChange,
  allowedViews = ["table"],

  search,
  searchPlaceholder,
  searchValue,
  onSearchChange,

  filter,
  onFilter,
  filterContent,
  isFilterOpen,
  onCloseFilter,

  onRefresh,

  addButton,
  onAdd,

  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,

  columns = [],
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
  page,
  totalPages,
  onPageChange,

  tabs,

  emptyMessage = "No data available",
  className,
  toolbarExtra,
}) {
  const [internalView, setInternalView] = useState(defaultView);
  const [internalSelected, setInternalSelected] = useState([]);

  const view = controlledView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  // Normalized toolbar & pagination props
  const activeSearch =
    search ||
    (searchValue !== undefined || onSearchChange
      ? {
          value: searchValue ?? "",
          onChange: (val) => onSearchChange?.(val),
          placeholder: searchPlaceholder ?? "Search by id or employee name...",
        }
      : {
          value: "",
          onChange: () => {},
          placeholder: "Search by id or employee name...",
        });

  const activeFilter =
    filter ||
    (onFilter
      ? {
          onClick: onFilter,
          label: "Filter",
        }
      : null);

  const activeAddButton =
    addButton ||
    (onAdd
      ? {
          onClick: onAdd,
          label: "Add",
        }
      : null);

  const activePagination =
    pagination ||
    (page !== undefined || totalPages !== undefined
      ? {
          page: page || 1,
          totalPages: totalPages || 1,
          onPageChange: onPageChange || (() => {}),
        }
      : null);

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

  const hasRowMenu =
    Boolean(rowActionsMenu?.length) || typeof rowActionsMenu === "function";
  const showActionsColumn = renderRowActions || hasRowMenu;
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
        <article
          key={id}
          className="rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3.5 sm:px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                {CardIcon && (
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#0066d1]">
                    <CardIcon className="size-4" />
                  </div>
                )}
                <h3 className="truncate text-xs sm:text-sm font-semibold text-slate-900">
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
                    className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label="More options"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                )
              )}
            </div>
            <div className="space-y-2 px-3.5 sm:px-4 py-3 text-xs">
              {subtitle && <p className="text-xs text-[#0066d1] font-medium">{subtitle}</p>}
              {card.fields?.map((field, fi) => {
                const value = field.value?.(row, index) ?? row[field.key];
                if (value == null || value === "") return null;
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.key ?? fi}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    {FieldIcon && (
                      <FieldIcon className="size-3.5 shrink-0 text-slate-400" />
                    )}
                    {field.label && (
                      <span className="text-slate-500">{field.label}:</span>
                    )}
                    <span className="truncate font-medium text-slate-800">{value}</span>
                  </div>
                );
              })}
              {card.renderFooter?.(row, index)}
            </div>
          </div>
        </article>
      );
    });

  const tableContent = showTableView && (
    <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0 scrollbar-thin">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-white">
            {selectable && (
              <th className="w-10 px-3 sm:px-4 py-3 sm:py-3.5 text-start shrink-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 rounded border-slate-300 accent-[#0066d1] cursor-pointer"
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((col, idx) => {
              const colKey =
                col.key ??
                col.accessorKey ??
                (typeof col.header === "string" ? col.header : col.label) ??
                idx;
              const colLabel =
                typeof col.header === "function"
                  ? col.header()
                  : col.header ?? col.label ?? "";
              const sortAccessor = col.key ?? col.accessorKey;

              return (
                <th
                  key={colKey}
                  className={cn(
                    "px-3 sm:px-4 py-3 sm:py-3.5 text-start text-xs font-semibold text-slate-800 whitespace-nowrap",
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 select-none"
                      onClick={() =>
                        onSort?.(
                          sortAccessor,
                          sortKey === sortAccessor && sortDirection === "asc"
                            ? "desc"
                            : "asc",
                        )
                      }
                    >
                      <span>{colLabel}</span>
                      <ChevronsUpDown className="size-3 text-slate-300 stroke-[2]" />
                    </button>
                  ) : (
                    <span>{colLabel}</span>
                  )}
                </th>
              );
            })}
            <th className="w-12 sm:w-14 px-3 sm:px-4 py-3 sm:py-3.5 text-end shrink-0 whitespace-nowrap" />
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
                  "border-b border-slate-100 transition-colors hover:bg-slate-50/60",
                  isSelected && "bg-blue-50/30",
                )}
              >
                {selectable && (
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      className="size-4 rounded border-slate-300 accent-[#0066d1] cursor-pointer"
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col, cIdx) => {
                  const content = getCellValue(row, col, index);
                  const cellKey =
                    col.key ??
                    col.accessorKey ??
                    (typeof col.header === "string" ? col.header : col.label) ??
                    cIdx;

                  return (
                    <td
                      key={cellKey}
                      className={cn(
                        "px-3 sm:px-4 py-3 sm:py-3.5 text-xs text-slate-700 font-normal",
                        col.cellClassName,
                      )}
                    >
                      {content}
                    </td>
                  );
                })}
                <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-end shrink-0 whitespace-nowrap">
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
                  ) : renderRowActions ? (
                    renderRowActions(row, index)
                  ) : null}
                </td>
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

      {/* Main Unified White Card Container matching Figma */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 shadow-sm p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
        {/* Status Tabs inside Card Header matching Figma */}
        {tabs && (Array.isArray(tabs) ? tabs : tabs.items)?.length > 0 && (
          <div className="flex items-center gap-4 sm:gap-6 px-1 border-b border-slate-100 overflow-x-auto scrollbar-none -mt-0.5 sm:-mt-1 mb-2">
            {(Array.isArray(tabs) ? tabs : tabs.items).map((tab) => {
              const tabId = typeof tab === "string" ? tab : tab.id;
              const tabLabel = typeof tab === "string" ? tab : tab.label;
              const activeId = tabs.activeTab ?? tabs.value ?? tabs.selectedTab;
              const isActive = activeId === tabId || (activeId?.toLowerCase() === tabId?.toLowerCase());
              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => (tabs.onChange ?? tabs.onTabChange)?.(tabId)}
                  className={cn(
                    "text-xs font-semibold transition-all relative cursor-pointer pb-2.5 sm:pb-3 pt-1 whitespace-nowrap",
                    isActive
                      ? "text-[#0066d1] font-bold"
                      : "text-slate-500 hover:text-slate-800 font-medium"
                  )}
                >
                  {tabLabel}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-[#0066d1] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Top Toolbar matching Figma */}
        <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Search & Filter */}
          <div className="flex w-full lg:w-auto min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            {activeSearch && (
              <div className="relative flex-1 min-w-0 w-full sm:max-w-md">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={activeSearch.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    activeSearch.onChange?.(value, data);
                  }}
                  placeholder={
                    activeSearch.placeholder ?? "Search by id or employee name..."
                  }
                  className="h-9 sm:h-10 w-full rounded-xl border-slate-200/90 bg-white ps-9 pe-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            )}
            {activeFilter && (
              <Button
                type="button"
                variant="ghost"
                onClick={activeFilter.onClick}
                className="h-9 sm:h-10 shrink-0 gap-1.5 rounded-xl bg-[#eaf4ff] text-[#0066d1] hover:bg-[#d8ecff] hover:text-[#0052a8] text-xs font-semibold px-3 sm:px-4 cursor-pointer"
              >
                <Filter className="size-3.5" />
                <span>{activeFilter.label ?? "Filter"}</span>
              </Button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-between sm:justify-end w-full lg:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {showViewToggle && (
                <ViewToggle
                  view={view}
                  onChange={setView}
                  allowedViews={allowedViews}
                />
              )}
              <ToolbarIconButton
                onClick={onRefresh || (() => window.location.reload())}
                aria-label="Refresh"
              >
                <RefreshCw className="size-3.5 sm:size-4 text-slate-600" />
              </ToolbarIconButton>
            </div>

            {activeAddButton && (
              <Button
                type="button"
                onClick={activeAddButton.onClick}
                className="h-9 sm:h-10 gap-1.5 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white px-3.5 sm:px-5 text-xs font-semibold shadow-xs cursor-pointer shrink-0 ms-auto sm:ms-0"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>{activeAddButton.label ?? "Add"}</span>
              </Button>
            )}
          </div>
        </div>

        {toolbarExtra}

        {/* Content Table / Cards */}
        {isLoading ? (
          <div className="overflow-x-auto py-8">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
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
              <div className="grid grid-cols-1 gap-3 sm:gap-4 p-1 sm:p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {cardsContent}
              </div>
            </div>
          </div>
        ) : view === "cards" && showCardsView ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-1 sm:p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {cardsContent}
          </div>
        ) : (
          tableContent
        )}

        {/* Bottom Pagination matching Figma */}
        {activePagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 order-2 sm:order-1 text-center sm:text-start">
              <span>
                Page <strong className="font-semibold text-slate-800">{activePagination.page}</strong> of{" "}
                <strong className="font-semibold text-slate-800">{Math.max(1, activePagination.totalPages)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
              <button
                type="button"
                disabled={activePagination.page <= 1}
                onClick={() =>
                  activePagination.onPageChange?.(activePagination.page - 1)
                }
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {activePagination.prevLabel ?? "Pre"}
              </button>
              <div className="flex items-center gap-1">
                {buildPageItems(
                  activePagination.page,
                  activePagination.totalPages,
                ).map((item, i) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-xs text-slate-400 select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => activePagination.onPageChange?.(item)}
                      className={cn(
                        "flex h-7 min-w-7 sm:h-8 sm:min-w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        item === activePagination.page
                          ? "bg-[#0066d1] text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                disabled={activePagination.page >= activePagination.totalPages}
                onClick={() =>
                  activePagination.onPageChange?.(activePagination.page + 1)
                }
                className="px-2.5 py-1 text-xs font-semibold text-[#0066d1] disabled:opacity-40 hover:text-[#0052a8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                {activePagination.nextLabel ?? "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Drawer / Dialog */}
      {isFilterOpen && filterContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-slate-800">Filters</h3>
              <button
                type="button"
                onClick={onCloseFilter}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-3 overflow-y-auto flex-1 min-h-0 space-y-4">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataView;
