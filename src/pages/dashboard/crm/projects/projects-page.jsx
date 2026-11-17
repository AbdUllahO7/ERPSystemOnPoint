import { StatTitle } from "@/components/common/stat-title";
import { useState, useMemo } from "react";
import {
  FolderKanban,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerProjects, deleteCustomerProject } from "@/lib/api";
import { toast } from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/translate-api";

export default function ProjectsPage() {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tabs = ["All", "Planning", "InProgress", "Pending", "Completed", "Cancelled"];

  const tabLabels = {
    All: t("crmProjects.all"),
    Planning: t("crmProjects.planning"),
    InProgress: t("crmProjects.inProgress"),
    Pending: t("crmProjects.pending"),
    Completed: t("crmProjects.completed"),
    Cancelled: t("crmProjects.cancelled"),
  };

  const statusLabels = {
    Planning: t("crmProjects.planning"),
    InProgress: t("crmProjects.inProgress"),
    "In Progress": t("crmProjects.inProgress"),
    Pending: t("crmProjects.pending"),
    Completed: t("crmProjects.completed"),
    Cancelled: t("crmProjects.cancelled"),
  };

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["allCustomerProjects", page, search],
    queryFn: () =>
      getCustomerProjects({
        PageNumber: page,
        PageSize: 10,
        Search: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCustomerProject(id),
    onSuccess: () => {
      toast.success(t("crmProjects.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["allCustomerProjects"] });
      setDeleteId(null);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        t("crmProjects.deleteError");
      toast.error(msg, { duration: 6000 });
      setDeleteId(null);
    },
  });

  const raw = projectsData?.data || projectsData || {};
  const items = raw?.items || (Array.isArray(raw) ? raw : []);
  const totalPages = raw?.totalPages || 1;

  // Filter based on active tab and search
  const filteredProjects = useMemo(() => {
    let list = items;
    if (filterStatus !== "all") {
      list = list.filter((p) => {
        const s = (p.status || "").toLowerCase().replace(/[^a-z]/g, "");
        const target = filterStatus.toLowerCase().replace(/[^a-z]/g, "");
        return s === target;
      });
    } else if (activeTab !== "All") {
      list = list.filter((p) => {
        const s = (p.status || "").toLowerCase().replace(/[^a-z]/g, "");
        const target = activeTab.toLowerCase().replace(/[^a-z]/g, "");
        return s === target;
      });
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
          p.id?.toLowerCase().includes(search.toLowerCase()) ||
          p.customerName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [items, activeTab, search, filterStatus]);

  // Aggregate stats
  const totalValue = items.reduce((acc, p) => acc + Number(p.projectValue || p.value || 0), 0);
  const inProgressCount = items.filter((p) => (p.status || "").toLowerCase().includes("progress")).length;
  const completedCount = items.filter((p) => (p.status || "").toLowerCase().includes("completed")).length;

  const stats = [
    {
      title: "Total Customer Projects",
      value: items.length.toString(),
      sub: t("crmProjects.activeTrackedProjects"),
      color: "bg-blue-600",
      icon: FolderKanban,
    },
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      sub: t("crmProjects.currentlyExecuting"),
      color: "bg-amber-500",
      icon: Clock,
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      sub: t("crmProjects.handedOverSuccessfully"),
      color: "bg-emerald-500",
      icon: CheckCircle2,
    },
    {
      title: "Total Contractual Value",
      value: `$${totalValue.toLocaleString()}`,
      sub: t("crmProjects.portfolioValue"),
      color: "bg-purple-600",
      icon: AlertCircle,
    },
  ];

  const columns = [
    {
      key: "projectName",
      label: t("crmProjects.project"),
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block">{row.projectName}</span>
          <span className="text-[11px] text-muted-foreground">{t("crmProjects.idPrefix")} #{row.id?.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      key: "customerName",
      label: t("crmProjects.customer"),
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.customerName || (row.customerId ? `${t("crmProjects.customerPrefix")}${row.customerId.substring(0, 8)}` : "-")}
        </span>
      ),
    },
    {
      key: "status",
      label: t("crmProjects.status"),
      render: (row) => {
        const colorClasses = {
          Planning: "bg-blue-100 text-blue-700 border-blue-200",
          InProgress: "bg-amber-100 text-amber-700 border-amber-200",
          "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
          Pending: "bg-purple-100 text-purple-700 border-purple-200",
          Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
          Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
        };
        const colorClass = colorClasses[row.status] || "bg-gray-100 text-gray-700 border-gray-200";
        return (
          <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold ${colorClass}`}>
            {statusLabels[row.status] || row.status || t("crmProjects.planning")}
          </span>
        );
      },
    },
    {
      key: "completionPercentage",
      label: t("crmProjects.progress"),
      render: (row) => {
        const perc = Number(row.completionPercentage || 0);
        return (
          <div className="min-w-[130px]">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-foreground">{perc}%</span>
              <span className="text-[10px] text-muted-foreground">{t("crmProjects.operational")}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  perc >= 100 ? "bg-emerald-500" : perc >= 50 ? "bg-blue-600" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, perc)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "projectValue",
      label: t("crmProjects.value"),
      render: (row) => (
        <span className="font-bold text-blue-600">
          ${Number(row.projectValue || row.value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dates",
      label: t("crmProjects.period"),
      render: (row) => {
        const start = row.startDate ? new Date(row.startDate).toLocaleDateString() : "-";
        const end = row.endDate ? new Date(row.endDate).toLocaleDateString() : "-";
        return (
          <span className="text-xs text-muted-foreground">
            {start} → {end}
          </span>
        );
      },
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: t("crmProjects.viewDetails"),
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/crm/projects/${row.id}`),
        },
        {
          key: "edit",
          label: t("crmProjects.editProject"),
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/projects/edit/${row.id}`),
        },
        {
          key: "delete",
          label: t("crmProjects.deleteProject"),
          icon: Trash2,
          destructive: true,
          onClick: (row) => setDeleteId(row.id),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("crmProjects.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("crmProjects.subtitle")}
          </p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/dashboard/crm/projects/add")}
        >
          <Plus className="w-4 h-4" />
          {t("crmProjects.addProject")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shrink-0`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate"><StatTitle>{stat.title}</StatTitle></p>
              <div className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-6 border-b border-border overflow-x-auto bg-white px-2 pt-2 rounded-t-xl">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? "text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabLabels[tab] || tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: t("crmProjects.projectStatus"),
            placeholder: t("crmProjects.allStatuses"),
            options: [
              { value: "Planning", label: t("crmProjects.planning") },
              { value: "InProgress", label: t("crmProjects.inProgress") },
              { value: "Pending", label: t("crmProjects.pending") },
              { value: "Completed", label: t("crmProjects.completed") },
              { value: "Cancelled", label: t("crmProjects.cancelled") },
            ],
          },
        ]}
        filters={{
          status: filterStatus !== "all" ? filterStatus : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "status") setFilterStatus(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterStatus("all");
          setPage(1);
        }}
      />

      {/* DataView */}
      <DataView
        data={filteredProjects}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder={t("crmProjects.searchPlaceholder")}
        emptyMessage={t("crmProjects.empty")}
        search={{
          placeholder: t("crmProjects.searchPlaceholder"),
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t("common.prev"),
          nextLabel: t("common.next"),
        }}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title={t("crmProjects.deleteTitle")}
        description={t("crmProjects.deleteDesc")}
      />
    </div>
  );
}
