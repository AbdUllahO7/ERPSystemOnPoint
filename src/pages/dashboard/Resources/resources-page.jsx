import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Power,
  PowerOff,
  Info,
  Calendar,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { PageTitle } from "@/components/common/page-title";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  getResources,
  getResourcesStats,
  deleteResource,
  toggleResourceActive,
  getResourceLookups,
} from "@/services/resources";

export default function ResourcesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedOwnership, setSelectedOwnership] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedActive, setSelectedActive] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || {
    addresses: [],
    ownerships: [],
    fixedAssets: [],
    statuses: [],
  };

  // Params for Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Ownership: selectedOwnership !== "all" ? selectedOwnership : undefined,
      Status: selectedStatus !== "all" ? selectedStatus : undefined,
      IsActive: selectedActive === "all" ? undefined : selectedActive,
    }),
    [page, search, selectedOwnership, selectedStatus, selectedActive]
  );

  // Resources Query
  const {
    data: resourcesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["resources", params],
    queryFn: () => getResources(params),
  });

  const displayRows = resourcesData?.data?.items || [];
  const totalPages = resourcesData?.data?.totalPages || 1;

  // Dynamic live stats cards derived from actual resources data
  const stats = useMemo(() => {
    const total = resourcesData?.data?.totalCount || displayRows.length;
    const owned = displayRows.filter((r) => r.ownership === "Owned").length;
    const leased = displayRows.filter((r) => r.ownership === "Leased").length;
    const active = displayRows.filter((r) => r.isActive).length;

    return [
      {
        title: "إجمالي الموارد (Total Resources)",
        value: String(total),
        trend: "Total",
        isUp: true,
        color: "bg-[#0066d1]",
        icon: Building2,
      },
      {
        title: "الموارد المملوكة (Owned Assets)",
        value: String(owned),
        trend: "Owned",
        isUp: true,
        color: "bg-[#5ebc93]",
        icon: ShieldCheck,
      },
      {
        title: "الموارد المستأجرة (Leased Venues)",
        value: String(leased),
        trend: "Leased",
        isUp: true,
        color: "bg-[#8b5cf6]",
        icon: Calendar,
      },
      {
        title: "الموارد المفعلة (Active Records)",
        value: String(active),
        trend: "Active",
        isUp: true,
        color: "bg-[#f39223]",
        icon: Power,
      },
    ];
  }, [resourcesData, displayRows]);

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id) => toggleResourceActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      toast.success("تم تحديث حالة تفعيل المورد في النظام (Resource activation updated)");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.data?.message || err?.message || "فشل تحديث حالة تفعيل المورد";
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      toast.success("Resource updated successfully!");
      setDeleteRowId(null);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.data?.message || err?.message || "Failed to update resource!";
      toast.error(msg);
      setDeleteRowId(null);
    },
  });

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "view",
            label: t?.resourcesModule?.viewDetails || "View Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/resources/${row.id}`),
          },
          {
            key: "edit",
            label: t?.resourcesModule?.editResource || "Edit Resource",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/resources/edit/${row.id}`),
          },
          {
            key: "toggleActive",
            label: (row) =>
              row.isActive
                ? t?.resourcesModule?.deactivate || "Deactivate"
                : t?.resourcesModule?.reactivate || "Reactivate",
            icon: (row) => (row.isActive ? PowerOff : Power),
            onClick: (row) => toggleActiveMutation.mutate(row.id),
          },
          {
            key: "delete",
            label: t?.resourcesModule?.archive || "Archive",
            icon: Trash2,
            variant: "destructive",
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate, toggleActiveMutation]
  );

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("active") || s === "متاح") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("maintenance") || s.includes("صيانة")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s.includes("out") || s.includes("inactive") || s.includes("خارج")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("rented") || s.includes("مؤجر")) {
      return "bg-blue-50 text-[#0066d1] border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "referenceNumber",
        header: "Ref / Code",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/resources/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {row.original.referenceNumber || row.original.code || `#${row.original.id}`}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Resource Name",
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              {row.original.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {row.original.address || "Main Facility"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "maxCapacity",
        header: "Max Capacity",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-700">
              {row.original.maxCapacity ?? row.original.capacity ?? 0}
            </span>
            <span className="text-[11px] text-slate-400">مقعد / سعة</span>
          </div>
        ),
      },
      {
        accessorKey: "ownership",
        header: "Ownership Model",
        cell: ({ row }) => {
          const isLeased = row.original.ownership === "Leased";
          return (
            <div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  isLeased
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }`}
              >
                {isLeased
                  ? t?.resourcesModule?.leased || "Leased"
                  : t?.resourcesModule?.owned || "Owned"}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                {isLeased
                  ? (row.original.supplierName || row.original.supplierAsset || "External Lessor")
                  : (row.original.fixedAssetName || row.original.supplierAsset || "Company Asset")}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "dailyRentalCost",
        header: t?.resourcesModule?.dailyRentalCost || "Daily Cost",
        cell: ({ row }) => {
          const cost = Number(row.original.dailyRentalCost) || 0;
          return (
            <div>
              <span className="text-xs font-semibold text-slate-800">
                ${cost.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {row.original.ownership === "Leased" ? "تكلفة استئجار يومي" : "أصل تشغيلي"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Operational Status",
        cell: ({ row }) => {
          const status = row.original.status || "Active";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                status
              )}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "is_Active",
        cell: ({ row }) => {
          const active = row.original.isActive ?? true;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleActiveMutation.mutate(row.original.id);
              }}
              disabled={toggleActiveMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer ${
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
              }`}
              title="انقر لتفعيل أو إيقاف المورد في النظام (Click to toggle active status)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {active ? "مفعل (Active)" : "معطل (Inactive)"}
            </button>
          );
        },
      },
    ],
    [toggleActiveMutation]
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Resources & Physical Assets"
      />

    

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${card.color}`}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-normal leading-snug">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold text-slate-800">
                      {card.value}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        card.isUp ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {card.trend}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {card.isUp ? (
                  <ArrowUp className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table with DataView */}
      <DataView
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        rowActionsMenu={rowActionsMenu}
        searchPlaceholder="ابحث باسم المورد، الرقم المرجعي، أو العنوان..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => navigate("/dashboard/resources/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting resources list...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            {/* Ownership Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                {t?.resourcesModule?.ownershipModel || "Ownership Model"}
              </Label>
              <Select
                value={selectedOwnership}
                onValueChange={(val) => {
                  setSelectedOwnership(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Ownerships" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.resourcesModule?.allOwnerships || "All Ownerships"}</SelectItem>
                  <SelectItem value="Owned">{t?.resourcesModule?.owned || "Owned"}</SelectItem>
                  <SelectItem value="Leased">{t?.resourcesModule?.leased || "Leased"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Operational Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                {t?.resourcesModule?.operationalStatus || "Operational Status"}
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.resourcesModule?.allStatuses || "All Statuses"}</SelectItem>
                  <SelectItem value="Active">{t?.resourcesModule?.statuses?.active || "Active"}</SelectItem>
                  <SelectItem value="UnderMaintenance">{t?.resourcesModule?.statuses?.underMaintenance || "Under Maintenance"}</SelectItem>
                  <SelectItem value="OutOfService">{t?.resourcesModule?.statuses?.outOfService || "Out of Service"}</SelectItem>
                  <SelectItem value="Rented">{t?.resourcesModule?.statuses?.rented || "Rented"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* System Active Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                System Status
              </Label>
              <Select
                value={selectedActive}
                onValueChange={(val) => {
                  setSelectedActive(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Records" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.resourcesModule?.allRecords || "All Records"}</SelectItem>
                  <SelectItem value="active">{t?.resourcesModule?.activeOnly || "Active Only"}</SelectItem>
                  <SelectItem value="inactive">{t?.resourcesModule?.inactiveOnly || "Inactive Only"}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 leading-tight">
                استخدم خيار «غير المفعلة» لإظهار السجلات المعطلة وإعادة تفعيلها مباشرة بنقرة زر.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOwnership("all");
                  setSelectedStatus("all");
                  setSelectedActive("all");
                  setPage(1);
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-[#0066d1] hover:bg-[#0052a8]"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Delete / Archive Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="Toggle Resource Active State"
        description="Are you sure you want to deactivate or archive this resource? You can reactivate it anytime using the Inactive filter."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
