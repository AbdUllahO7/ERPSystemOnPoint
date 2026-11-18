import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import {
  getLeaveTypes,
  toggleLeaveTypeStatus,
  deleteLeaveType,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function LeaveTypesPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("all"); // 'all' | 'true' | 'false'
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Delete dialog state
  const [deleteRowId, setDeleteRowId] = useState(null);

  // Query parameters according to backend spec
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

  // Fetch Leave Types list
  const {
    data: responseData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["getLeaveTypes", queryParams],
    queryFn: () => getLeaveTypes(queryParams),
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

  // Toggle Status Mutation (POST /api/LeaveTypes/{id})
  const toggleMutation = useMutation({
    mutationFn: (id) => toggleLeaveTypeStatus(id),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isAr ? "فشل تغيير حالة نوع الإجازة" : "Failed to toggle status"));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getLeaveTypes"] });
      toast.success(res?.message || (isAr ? "تم تحديث الحالة بنجاح" : "Status updated successfully"));
    },
    onError: (error) => {
      console.error("Toggle leave type status failed:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr ? "فشل تغيير حالة نوع الإجازة" : "Failed to toggle status");
      toast.error(errMsg);
    },
  });

  // Delete Mutation (POST /api/LeaveTypes/{id})
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLeaveType(id),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isAr ? "فشل حذف نوع الإجازة" : "Failed to delete leave type"));
        setDeleteRowId(null);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getLeaveTypes"] });
      toast.success(res?.message || (isAr ? "تم حذف نوع الإجازة بنجاح" : "Leave type deleted successfully"));
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Delete leave type failed:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr ? "فشل حذف نوع الإجازة" : "Failed to delete leave type");
      toast.error(errMsg);
      setDeleteRowId(null);
    },
  });

  // Dynamic statistics
  const stats = useMemo(() => {
    const paidCount = items.filter((item) => item.isPaid).length;
    const unpaidCount = items.filter((item) => item.isPaid === false).length;
    const activeCount = items.filter((item) => item.isActive !== false).length;

    return [
      {
        title: isAr ? "إجمالي أنواع الإجازات" : "Total Leave Types",
        value: totalCount,
        color: "bg-blue-600",
        icon: CalendarClock,
      },
      {
        title: isAr ? "إجازات مدفوعة الأجر" : "Paid Leave Types",
        value: paidCount,
        color: "bg-emerald-600",
        icon: CalendarCheck,
      },
      {
        title: isAr ? "إجازات غير مدفوعة" : "Unpaid Leave Types",
        value: unpaidCount,
        color: "bg-amber-500",
        icon: CalendarX,
      },
      {
        title: isAr ? "الأنواع النشطة" : "Active Leave Types",
        value: activeCount,
        color: "bg-indigo-600",
        icon: CheckCircle2,
      },
    ];
  }, [items, totalCount, isAr]);

  // Open Edit
  const handleEdit = (row) => {
    navigate(`/dashboard/hr/leave-types/edit/${row.id}`);
  };

  // Open Create
  const handleAddNew = () => {
    navigate("/dashboard/hr/leave-types/add");
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
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.id ? String(row.id).substring(0, 8) : "—"}
        </span>
      ),
    },
    {
      key: "leaveTypeName",
      label: isAr ? "اسم نوع الإجازة" : "Leave Type Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {(row.leaveTypeName || row.name || "L").charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-foreground">
              {row.leaveTypeName || row.name || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "daysLimit",
      label: isAr ? "الحد الأقصى للأيام" : "Days Limit",
      sortable: true,
      render: (row) => (
        <Badge variant="outline" className="font-medium bg-muted/40">
          {row.daysLimit !== undefined && row.daysLimit !== null
            ? `${row.daysLimit} ${isAr ? "أيام" : "Days"}`
            : "—"}
        </Badge>
      ),
    },
    {
      key: "isPaid",
      label: isAr ? "نوع الراتب" : "Compensation",
      sortable: true,
      render: (row) =>
        row.isPaid ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 inline" />
            {isAr ? "مدفوعة الأجر" : "Paid"}
          </Badge>
        ) : (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-medium">
            <CalendarX className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 inline" />
            {isAr ? "غير مدفوعة" : "Unpaid"}
          </Badge>
        ),
    },
    {
      key: "isActive",
      label: isAr ? "الحالة" : "Status",
      render: (row) => {
        const active = row.isActive !== false;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={active}
              disabled={toggleMutation.isPending}
              onCheckedChange={() => toggleMutation.mutate(row.id)}
            />
            <span className={`text-xs font-medium ${active ? "text-emerald-600" : "text-muted-foreground"}`}>
              {active ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
            </span>
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
          {
            label: isAr ? "تغيير الحالة" : "Toggle Status",
            icon: RefreshCw,
            onClick: (row) => toggleMutation.mutate(row.id),
          },
        ],
      },
      {
        items: [
          {
            label: isAr ? "حذف" : "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [isAr, toggleMutation]
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarClock className="w-7 h-7 text-primary" />
            {isAr ? "أنواع الإجازات" : "Leave Types"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "إدارة أنواع الإجازات وأيام الاستحقاق والسياسات الخاصة برواتب الموظفين"
              : "Manage employee leave categories, limits, and salary compensation policies."}
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
            {isAr ? "إضافة نوع إجازة" : "Add Leave Type"}
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
                  <SelectValue
                    placeholder={isAr ? "جميع الحالات" : "All Statuses"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isAr ? "جميع الحالات" : "All Statuses"}
                  </SelectItem>
                  <SelectItem value="true">
                    {isAr ? "نشط فقط" : "Active Only"}
                  </SelectItem>
                  <SelectItem value="false">
                    {isAr ? "غير نشط فقط" : "Inactive Only"}
                  </SelectItem>
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
                  <SelectItem value="none">
                    {isAr ? "افتراضي" : "Default"}
                  </SelectItem>
                  <SelectItem value="leaveTypeName">
                    {isAr ? "اسم نوع الإجازة" : "Leave Type Name"}
                  </SelectItem>
                  <SelectItem value="daysLimit">
                    {isAr ? "الحد الأقصى للأيام" : "Days Limit"}
                  </SelectItem>
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
                    <SelectItem value="asc">
                      {isAr ? "تصاعدي (A-Z)" : "Ascending (A-Z)"}
                    </SelectItem>
                    <SelectItem value="desc">
                      {isAr ? "تنازلي (Z-A)" : "Descending (Z-A)"}
                    </SelectItem>
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

      {/* Main DataView (Table & Cards) */}
      <DataView
        data={items}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: isAr
            ? "البحث في أنواع الإجازات..."
            : "Search leave types...",
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
          label: isAr ? "إضافة نوع إجازة" : "Add Leave Type",
          onClick: handleAddNew,
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        onSort={handleSort}
        card={{
          icon: CalendarClock,
          title: (row) => row.leaveTypeName || row.name,
          subtitle: (row) =>
            row.isPaid
              ? isAr
                ? "إجازة مدفوعة"
                : "Paid Leave"
              : isAr
              ? "إجازة غير مدفوعة"
              : "Unpaid Leave",
          fields: [
            {
              label: isAr ? "الحد الأقصى:" : "Days Limit:",
              value: (row) => `${row.daysLimit ?? 0} ${isAr ? "أيام" : "Days"}`,
            },
            {
              label: isAr ? "الحالة:" : "Status:",
              value: (row) => (
                <span
                  className={`font-semibold text-xs ${
                    row.isActive !== false ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {row.isActive !== false
                    ? isAr
                      ? "نشط"
                      : "Active"
                    : isAr
                    ? "معطل"
                    : "Inactive"}
                </span>
              ),
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
          isAr ? "لم يتم العثور على أنواع إجازات" : "No leave types found"
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
        title={isAr ? "حذف نوع الإجازة" : "Delete Leave Type"}
        description={
          isAr
            ? "هل أنت متأكد من رغبتك في حذف نوع الإجازة هذا؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this leave type? This action cannot be undone."
        }
      />
    </div>
  );
}
