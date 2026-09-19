import { useState } from "react";
import {
  Building,
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Layers,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, toggleProductStatus } from "@/lib/api";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

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

export default function ItemsPage() {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All Items");
  const [deleteRowId, setDeleteRowId] = useState(null);
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleProductStatus(id),
    onSuccess: () => {
      toast.success("Item status updated successfully.");
      queryClient.invalidateQueries(["products"]);
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update item status.");
    },
  });

  const tabs = ["All Items", "Inventory", "Service", "Bundle", "Assembly"];

  const { data: productsRes, isLoading, refetch } = useQuery({
    queryKey: ["products", page, search, categoryId, activeTab],
    queryFn: () => getAllProducts({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Category_Id: categoryId || undefined,
      ProductType: activeTab === "All Items" ? undefined : activeTab,
    }),
  });

  const productsData = productsRes?.data?.items || [];
  const totalPages = productsRes?.data?.totalPages || 1;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const columns = [
    {
      key: "product_Number",
      label: "Code",
      render: (row) => <span className="text-blue-500 font-medium">{row.product_Number}</span>,
    },
    {
      key: "name_Product",
      label: "Item Name",
      render: (row) => <span className="text-blue-500 font-medium">{row.name_Product}</span>,
      sortable: true,
    },
    {
      key: "category_name",
      label: "Category",
    },
    {
      key: "product_Type",
      label: "Type",
      render: (row) => {
        let colorClass = "bg-blue-100 text-blue-600";
        if (row.product_Type === "Service") colorClass = "bg-orange-100 text-orange-600";
        if (row.product_Type === "Bundle") colorClass = "bg-purple-100 text-purple-600";
        if (row.product_Type === "Assembly") colorClass = "bg-teal-100 text-teal-600";
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {row.product_Type}
          </span>
        );
      },
    },
    {
      key: "units",
      label: "Unit",
      render: (row) => <span>{row.units?.join(", ") || "-"}</span>,
    },
    {
      key: "prices",
      label: "Sales Price",
      render: (row) => <span className="text-blue-500">{row.prices?.map(p => `$${p}`).join(", ") || "-"}</span>,
    },
    {
      key: "is_Active",
      label: "Status",
      render: (row) => (
        <span className={`${row.is_Active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"} px-3 py-1 rounded-full text-xs font-medium`}>
          {row.is_Active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: "View",
          icon: Eye,
          onClick: (row) => console.log("View", row),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/inventory/items-management/items/edit/${row.id}`),
        },
      ],
    },
    {
      items: [
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          destructive: true,
          onClick: (row) => setDeleteRowId(row.id),
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span
                  className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataView
        data={productsData}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by item code or name...",
          value: search,
          onChange: handleSearch,
        }}
        // filter={{
        //   label: "Filter",
        //   onClick: () => console.log("filter"),
        // }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/inventory/items-management/items/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Layers,
          title: (row) => row.name_Product,
          subtitle: (row) => row.category_name,
        }}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage={`No ${activeTab.toLowerCase()} found`}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => toggleStatusMutation.mutate(deleteRowId)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action will toggle the item's status."
      />
    </div>
  );
}
