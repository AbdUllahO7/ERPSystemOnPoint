import { StatTitle } from "@/components/common/stat-title";
import { useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCustomers, deleteCustomer } from "@/lib/api";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { useI18n } from "@/context/translate-api";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

export default function CustomersPage() {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tabs = ["All", "Active", "Distinct", "Old", "Unacceptable", "Unreliable"];
  const tabLabels = {
    All: t("crmCustomers.all"),
    Active: t("crmCustomers.active"),
    Distinct: t("crmCustomers.distinct"),
    Old: t("crmCustomers.old"),
    Unacceptable: t("crmCustomers.unacceptable"),
    Unreliable: t("crmCustomers.unreliable"),
  };

  const statusLabels = {
    Active: t("crmCustomers.active"),
    Distinct: t("crmCustomers.distinct"),
    Old: t("crmCustomers.old"),
    Unacceptable: t("crmCustomers.unacceptable"),
    Unreliable: t("crmCustomers.unreliable"),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { page, search, activeTab }],
    queryFn: () => getAllCustomers({ PageNumber: page, PageSize: 10, SearchQuery: search })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success(t("crmCustomers.deleteSuccess"));
      queryClient.invalidateQueries(["customers"]);
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(error?.message || t("crmCustomers.deleteError"));
      setDeleteRowId(null);
    },
  });

  const customers = (data?.data?.items || [])
    .filter((c) => {
      if (activeTab !== "All" && c.status !== activeTab) return false;
      if (filterType !== "all" && c.type !== filterType) return false;
      if (filterSector !== "all" && c.sector !== filterSector) return false;
      return true;
    })
    .map((item, index) => ({
      ...item,
      idx: (page - 1) * 10 + index + 1
    }));
  const totalPages = data?.data?.totalPages || 1;

  const columns = [
    { key: "idx", label: t("crmCustomers.id"), render: (row) => <span className="text-blue-500 font-medium">{row.idx}</span> },
    { 
      key: "name", 
      label: t("crmCustomers.name"),
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    { key: "type", label: t("crmCustomers.type") },
    { key: "sector", label: t("crmCustomers.sector") },
    { key: "contactsCount", label: t("crmCustomers.contacts"), render: (row) => row.contactsCount || 0 },
    { key: "phone", label: t("crmCustomers.phone") },
    { 
      key: "status", 
      label: t("crmCustomers.status"),
      render: (row) => {
        let colorClass = "bg-gray-100 text-gray-600";
        switch(row.status) {
          case "Active": colorClass = "bg-green-100 text-green-600"; break;
          case "Distinct": colorClass = "bg-blue-100 text-blue-600"; break;
          case "Old": colorClass = "bg-gray-200 text-gray-700"; break;
          case "Unacceptable": colorClass = "bg-yellow-100 text-yellow-600"; break;
          case "Unreliable": colorClass = "bg-red-100 text-red-600"; break;
        }
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{statusLabels[row.status] || row.status || t("crmCustomers.notSpecified")}</span>;
      }
    },
    { key: "createdAt", label: t("crmCustomers.createdAt"), render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: t("crmCustomers.view"),
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/crm/customers/${row.id}`),
        },
        {
          key: "edit",
          label: t("crmCustomers.edit"),
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/customers/edit/${row.id}`),
        },
      ]
    },
    {
      items: [
        {
          key: "delete",
          label: t("crmCustomers.delete"),
          icon: Trash2,
          destructive: true,
          onClick: (row) => setDeleteRowId(row.id),
        },
      ]
    }
  ];

  return (
    <div className="space-y-4 ">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm font-semibold">
        <span>{t("crmCustomers.title")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground"><StatTitle>{stat.title}</StatTitle></p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}>
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabLabels[tab] || tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "type",
            label: t("crmCustomers.customerType"),
            placeholder: t("crmCustomers.allTypes"),
            options: [
              { value: "Company", label: t("crmCustomers.company") },
              { value: "Individual", label: t("crmCustomers.individual") },
            ],
          },
          {
            key: "sector",
            label: t("crmCustomers.sector"),
            placeholder: t("crmCustomers.allSectors"),
            options: [
              { value: "Commercial", label: t("crmCustomers.commercial") },
              { value: "Industrial", label: t("crmCustomers.industrial") },
              { value: "Services", label: t("crmCustomers.services") },
              { value: "Government", label: t("crmCustomers.government") },
            ],
          },
        ]}
        filters={{
          type: filterType !== "all" ? filterType : "",
          sector: filterSector !== "all" ? filterSector : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "type") setFilterType(val || "all");
          if (key === "sector") setFilterSector(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterType("all");
          setFilterSector("all");
          setPage(1);
        }}
      />

      <DataView
        data={customers}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        searchPlaceholder={t("crmCustomers.searchPlaceholder")}
        emptyMessage={t("crmCustomers.empty")}
        card={{
          icon: UsersIcon,
          title: (row) => row.name,
          subtitle: (row) => row.email,
          fields: [
            { label: t("crmCustomers.type"), value: (row) => row.type },
            { label: t("crmCustomers.sector"), value: (row) => row.sector },
            { label: t("crmCustomers.phone"), value: (row) => row.phone },
            { label: t("crmCustomers.status"), value: (row) => statusLabels[row.status] || row.status || t("crmCustomers.notSpecified") },
          ]
        }}
        search={{
          placeholder: t("crmCustomers.searchPlaceholder"),
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        addButton={{
          label: t("common.add"),
          onClick: () => navigate("/dashboard/crm/customers/add"),
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
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        title={t("crmCustomers.deleteTitle")}
        description={t("crmCustomers.deleteDesc")}
      />
    </div>
  );
}