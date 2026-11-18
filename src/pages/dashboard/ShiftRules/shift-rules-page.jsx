import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  ShieldAlert,
  Sun,
  Timer,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import {
  getShiftRules,
  deleteShiftRule,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  ticksToTimeString,
  parseWeekendDays,
} from "./_utils/shift-rule-helpers";

export default function ShiftRulesPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Delete dialog state
  const [deleteRowId, setDeleteRowId] = useState(null);

  // Query parameters
  const queryParams = useMemo(() => {
    const params = {
      PageNumber: page,
      pageNumber: page,
      PageSize: pageSize,
      pageSize: pageSize,
    };

    if (search && search.trim() !== "") {
      params.Search = search.trim();
      params.search = search.trim();
    }

    if (isActiveFilter !== "all") {
      const boolVal = isActiveFilter === "true";
      params.IsActive = boolVal;
      params.isActive = boolVal;
    }

    if (sortBy) {
      params.SortBy = sortBy;
      params.SortDirection = sortDirection;
    }

    return params;
  }, [page, pageSize, search, isActiveFilter, sortBy, sortDirection]);

  // Fetch ShiftRules
  const {
    data: responseData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["getShiftRules", queryParams],
    queryFn: () => getShiftRules(queryParams),
  });

  const items = useMemo(() => {
    const list = responseData?.data?.items || responseData?.items || responseData?.data || [];
    return Array.isArray(list) ? list : [];
  }, [responseData]);

  const totalPages =
    responseData?.data?.totalPages ||
    responseData?.totalPages ||
    Math.ceil((responseData?.data?.totalCount || items.length) / pageSize) ||
    1;

  const totalCount =
    responseData?.data?.totalCount ??
    responseData?.totalCount ??
    items.length;

  const currentPage =
    responseData?.data?.pageNumber ||
    responseData?.pageNumber ||
    page;

  // Delete Mutation (POST /api/HR/ShiftRule/Delete/{id})
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteShiftRule(id),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isAr ? "فشل حذف قاعدة الوردية" : "Failed to delete shift rule"));
        setDeleteRowId(null);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getShiftRules"] });
      toast.success(res?.message || (isAr ? "تم حذف قاعدة الوردية بنجاح" : "Shift rule deleted successfully"));
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Delete shift rule failed:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr ? "فشل حذف قاعدة الوردية" : "Failed to delete shift rule");
      toast.error(errMsg);
      setDeleteRowId(null);
    },
  });

  // Dynamic Statistics
  const stats = useMemo(() => {
    const overtimeCount = items.filter((item) => item.allow_Overtime || item.allowOvertime).length;
    const deductionCount = items.filter((item) => item.apply_Late_Deduction || item.applyLateDeduction).length;
    const activeCount = items.filter((item) => item.isActive !== false).length;

    return [
      {
        title: isAr ? "إجمالي قواعد الورديات" : "Total Shift Rules",
        value: totalCount,
        color: "bg-blue-600",
        icon: Clock,
      },
      {
        title: isAr ? "وردية بإضافي مفعّل" : "Overtime Enabled",
        value: overtimeCount,
        color: "bg-emerald-600",
        icon: Timer,
      },
      {
        title: isAr ? "خصم التأخير مفعّل" : "Late Deduction Enabled",
        value: deductionCount,
        color: "bg-amber-500",
        icon: ShieldAlert,
      },
      {
        title: isAr ? "القواعد النشطة" : "Active Rules",
        value: activeCount,
        color: "bg-indigo-600",
        icon: CheckCircle2,
      },
    ];
  }, [items, totalCount, isAr]);

  // Open Edit
  const handleEdit = (row) => {
    navigate(`/dashboard/hr/shift-rules/edit/${row.shift_Rule_id || row.id}`);
  };

  // Open Create
  const handleAddNew = () => {
    navigate("/dashboard/hr/shift-rules/add");
  };

  // Sort handler
  const handleSort = (columnKey, direction) => {
    setSortBy(columnKey);
    setSortDirection(direction || "asc");
  };

  // Clear filters
  const handleClearFilters = () => {
    setIsActiveFilter("all");
    setSortBy("");
    setSortDirection("asc");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    isActiveFilter !== "all" || sortBy !== "" || Boolean(search);

  // Table Columns
  const columns = [
    {
      key: "id",
      label: isAr ? "المعرّف" : "ID",
      render: (row) => {
        const idVal = row.shift_Rule_id || row.id || "";
        return (
          <span className="font-mono text-xs text-muted-foreground">
            #{idVal ? String(idVal).substring(0, 8) : "—"}
          </span>
        );
      },
    },
    {
      key: "rule_Name",
      label: isAr ? "اسم قاعدة الوردية" : "Rule Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-foreground block">
              {row.rule_Name || row.ruleName || "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.absence_Policy_Type || row.absencePolicyType || "Standard"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "timings",
      label: isAr ? "مواعيد الدوام" : "Shift Hours",
      render: (row) => {
        const start = ticksToTimeString(row.start_Attendance || row.startAttendance);
        const end = ticksToTimeString(row.end_Attendance || row.endAttendance);
        return (
          <Badge variant="outline" className="font-medium bg-muted/40 gap-1.5 py-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{start} - {end}</span>
          </Badge>
        );
      },
    },
    {
      key: "tolerances",
      label: isAr ? "فترات السماح" : "Tolerances",
      render: (row) => {
        const late = row.late_To_lerance_Minutes ?? row.lateToleranceMinutes ?? 0;
        const early = row.early_Leave_Tolerance_Minutes ?? row.earlyLeaveToleranceMinutes ?? 0;
        return (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div>
              <span className="font-medium text-foreground">{isAr ? "تأخير:" : "Late:"}</span> {late} {isAr ? "د" : "m"}
            </div>
            <div>
              <span className="font-medium text-foreground">{isAr ? "مبكر:" : "Early:"}</span> {early} {isAr ? "د" : "m"}
            </div>
          </div>
        );
      },
    },
    {
      key: "overtime",
      label: isAr ? "العمل الإضافي" : "Overtime",
      render: (row) => {
        const allowed = row.allow_Overtime ?? row.allowOvertime;
        const multiplier = row.overtime_Rate_Multiplier ?? row.overtimeRateMultiplier ?? 1.5;
        return allowed ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 inline" />
            {multiplier}x
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {isAr ? "معطل" : "Disabled"}
          </Badge>
        );
      },
    },
    {
      key: "deduction",
      label: isAr ? "خصم التأخير" : "Late Deduction",
      render: (row) => {
        const applied = row.apply_Late_Deduction ?? row.applyLateDeduction;
        const mult = row.late_Deduction_Multiplier ?? row.lateDeductionMultiplier ?? 1.0;
        return applied ? (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-medium">
            <ShieldAlert className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 inline" />
            {mult}x
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {isAr ? "معطل" : "Disabled"}
          </Badge>
        );
      },
    },
    {
      key: "weekend_Days",
      label: isAr ? "العطلة الأسبوعية" : "Weekend Days",
      render: (row) => {
        const days = parseWeekendDays(row.weekend_Days || row.weekendDays);
        if (days.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {days.slice(0, 2).map((d, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                {d}
              </Badge>
            ))}
            {days.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{days.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  // Row Actions Menu
  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            label: isAr ? "تعديل" : "Edit",
            icon: Pencil,
            onClick: (row) => handleEdit(row),
          },
        ],
      },
      {
        items: [
          {
            label: isAr ? "حذف" : "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.shift_Rule_id || row.id),
          },
        ],
      },
    ],
    [isAr]
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" />
            {isAr ? "قواعد الورديات" : "Shift Rules"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "إدارة مواعيد الحضور والانصراف، فترات السماحية، وسياسات العمل الإضافي والعطلات"
              : "Manage shift timings, grace periods, overtime compensation, and attendance policies."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          <Button onClick={handleAddNew} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            {isAr ? "إضافة قاعدة وردية" : "Add Shift Rule"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-xs"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${stat.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stat.title}
                </p>
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Filter Bar */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-xs flex flex-wrap items-end gap-4">
            {/* IsActive Filter */}
            <div className="flex flex-col gap-1.5 w-full sm:w-48">
              <label className="text-xs font-medium text-muted-foreground">
                {isAr ? "الحالة" : "Active Status"}
              </label>
              <Select
                value={isActiveFilter}
                onValueChange={(val) => {
                  setIsActiveFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isAr ? "جميع الحالات" : "All Statuses"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? "جميع الحالات" : "All Statuses"}</SelectItem>
                  <SelectItem value="true">{isAr ? "نشط فقط" : "Active Only"}</SelectItem>
                  <SelectItem value="false">{isAr ? "غير نشط فقط" : "Inactive Only"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SortBy Filter */}
            <div className="flex flex-col gap-1.5 w-full sm:w-48">
              <label className="text-xs font-medium text-muted-foreground">
                {isAr ? "الترتيب حسب" : "Sort By"}
              </label>
              <Select
                value={sortBy || "none"}
                onValueChange={(val) => {
                  setSortBy(val === "none" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isAr ? "افتراضي" : "Default"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isAr ? "افتراضي" : "Default"}</SelectItem>
                  <SelectItem value="rule_Name">{isAr ? "اسم القاعدة" : "Rule Name"}</SelectItem>
                  <SelectItem value="required_Logs_Per_Day">{isAr ? "البصمات المطلوبة" : "Required Logs"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Direction */}
            {sortBy && (
              <div className="flex flex-col gap-1.5 w-full sm:w-40">
                <label className="text-xs font-medium text-muted-foreground">
                  {isAr ? "الاتجاه" : "Direction"}
                </label>
                <Select
                  value={sortDirection}
                  onValueChange={(val) => setSortDirection(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{isAr ? "تصاعدي (A-Z)" : "Ascending (A-Z)"}</SelectItem>
                    <SelectItem value="desc">{isAr ? "تنازلي (Z-A)" : "Descending (Z-A)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-auto"
              >
                {isAr ? "مسح الفلاتر" : "Clear Filters"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main DataView */}
      <DataView
        data={items}
        isLoading={isLoading}
        getRowId={(row) => row.shift_Rule_id || row.id}
        search={{
          placeholder: isAr
            ? "البحث في قواعد الورديات..."
            : "Search shift rules...",
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
        }}
        filter={{
          label: isAr ? "تصفية" : "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => refetch()}
        addButton={{
          label: isAr ? "إضافة قاعدة وردية" : "Add Shift Rule",
          onClick: handleAddNew,
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        onSort={handleSort}
        card={{
          icon: Clock,
          title: (row) => row.rule_Name || row.ruleName,
          subtitle: (row) => {
            const start = ticksToTimeString(row.start_Attendance || row.startAttendance);
            const end = ticksToTimeString(row.end_Attendance || row.endAttendance);
            return `${start} - ${end}`;
          },
          fields: [
            {
              label: isAr ? "السياسة:" : "Policy:",
              value: (row) => row.absence_Policy_Type || row.absencePolicyType || "Standard",
            },
            {
              label: isAr ? "العمل الإضافي:" : "Overtime:",
              value: (row) =>
                row.allow_Overtime || row.allowOvertime
                  ? `${row.overtime_Rate_Multiplier ?? 1.5}x`
                  : isAr
                  ? "معطل"
                  : "Disabled",
            },
            {
              label: isAr ? "خصم التأخير:" : "Late Deduction:",
              value: (row) =>
                row.apply_Late_Deduction || row.applyLateDeduction
                  ? `${row.late_Deduction_Multiplier ?? 1.0}x`
                  : isAr
                  ? "معطل"
                  : "Disabled",
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: (p) => setPage(p),
          prevLabel: isAr ? "السابق" : "Pre",
          nextLabel: isAr ? "التالي" : "Next",
        }}
        emptyMessage={
          isAr ? "لم يتم العثور على قواعد ورديات" : "No shift rules found"
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteRowId)}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          if (deleteRowId) {
            deleteMutation.mutate(deleteRowId);
          }
        }}
        isLoading={deleteMutation.isPending}
        title={isAr ? "حذف قاعدة الوردية" : "Delete Shift Rule"}
        description={
          isAr
            ? "هل أنت متأكد من رغبتك في حذف قاعدة الوردية هذه؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this shift rule? This action cannot be undone."
        }
      />
    </div>
  );
}
