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
import {
  getResources,
  getResourcesStats,
  deleteResource,
  toggleResourceActive,
  getResourceLookups,
} from "@/services/resources";

export default function ResourcesPage() {
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

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["resourcesStats"],
    queryFn: getResourcesStats,
  });
  const stats = statsData?.data || [];

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

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id) => toggleResourceActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      toast.success("تم تحديث حالة تفعيل المورد في النظام (Resource activation updated)");
    },
    onError: () => {
      toast.error("فشل تحديث حالة تفعيل المورد");
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
    onError: () => {
      toast.error("Failed to update resource!");
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
            label: "View Details (عرض التفاصيل)",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/resources/${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Resource (تعديل المورد)",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/resources/edit/${row.id}`),
          },
          {
            key: "toggleActive",
            label: (row) => (row.isActive ? "Deactivate (إيقاف)" : "Reactivate (إعادة تفعيل)"),
            icon: (row) => (row.isActive ? PowerOff : Power),
            onClick: (row) => toggleActiveMutation.mutate(row.id),
          },
          {
            key: "delete",
            label: "Archive (أرشفة)",
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
        accessorKey: "code",
        header: "Ref / Code",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/resources/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {row.original.code || row.original.referenceNumber || `#${row.original.id}`}
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
        accessorKey: "capacity",
        header: "Max Capacity",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-700">
              {row.original.capacity || row.original.numericCapacity || 0}
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
                {isLeased ? "Leased (مستأجر)" : "Owned (مملوك)"}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                {row.original.supplierAsset || (isLeased ? "External Lessor" : "Company Asset")}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "dailyRentalCost",
        header: "Daily Cost (تكلفة)",
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
        infoTooltip="إدارة الموارد المادية كالقاعات، السيارات، والأجهزة وتتبع ملكيتها وتكلفتها وحالتها التشغيلية وجدول الحجوزات المرتبطة بها."
      />

      {/* Page 6 System Guidance Banner */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-indigo-50/30 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066d1] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                06 / فهم النظام: الموارد (المكان أو الأصل)
              </span>
              <span className="text-xs text-slate-500">قاعة، سيارة، جهاز أو مساحة تُستخدم عند تقديم خدمة أو حدث</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>الفرق الجوهري بين الملكية والحالة:</strong> الملكية <code>Leased</code> تعني أن شركتك تستأجر المورد من مالكه الخارجي، بينما <code>Rented</code> هو وصف تشغيلي لتأجير المورد إلى عميل في حدث معين. كما أن <code>DailyRentalCost</code> يمثل تكلفة استئجار المورد على شركتك، بينما <code>BookingEvent.Price</code> يمثل سعر الحدث المحجوز.
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>مملوك: يرتبط بأصل ثابت <code>FixedAssetId</code></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>مستأجر: يتطلب <code>SupplierId</code> وتواريخ عقد</span>
            </div>
          </div>
        </div>
      </div>

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
                Ownership Model (نموذج الملكية)
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
                  <SelectItem value="all">All Ownerships (الكل)</SelectItem>
                  <SelectItem value="Owned">Owned (مملوك للشركة)</SelectItem>
                  <SelectItem value="Leased">Leased (مستأجر من جهة خارجية)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Operational Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Operational Status (الحالة التشغيلية)
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
                  <SelectItem value="all">All Statuses (جميع الحالات)</SelectItem>
                  <SelectItem value="Active">Active (متاح)</SelectItem>
                  <SelectItem value="UnderMaintenance">Under Maintenance (تحت الصيانة)</SelectItem>
                  <SelectItem value="OutOfService">Out of Service (خارج الخدمة)</SelectItem>
                  <SelectItem value="Rented">Rented (مؤجر لعميل)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* System Active Filter (Page 6 requirement: إتاحة إعادة التفعيل عند استخدام فلاتر تخفي السجلات غير المفعلة) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                System Status (حالة التفعيل بالنظام is_Active)
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
                  <SelectItem value="all">All Records (جميع السجلات)</SelectItem>
                  <SelectItem value="active">Active Only (المفعلة فقط)</SelectItem>
                  <SelectItem value="inactive">Inactive Only (غير المفعلة / لإعادة التفعيل)</SelectItem>
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
