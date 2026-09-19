import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Layers,
  Building,
  Users as UsersIcon,
  Info
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCategories, deleteCategory } from "@/lib/api";
import toast from "react-hot-toast";

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

export default function ItemCategoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ Type: "" });

  const navigate = useNavigate();

  const filterConfigs = [
    {
      key: "Type",
      label: "Filter by Category Type",
      placeholder: "All Types",
      options: [
        { value: "main", label: "Main Category" },
        { value: "sub", label: "Subcategory" },
      ],
    },
  ];

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const { data: categoriesRes, isLoading, refetch } = useQuery({
    queryKey: ["categories", page, search, filters.Type],
    queryFn: () => getAllCategories({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
    }),
  });

  const categoriesData = categoriesRes?.data?.items?.map(cat => ({
    id: cat.id,
    serialNumber: cat.code_Numbers,
    categoryName: cat.name,
    type: cat.mainOrSub
  })) || [];

  const totalPages = categoriesRes?.data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete category!");
    }
  });

  const handleDelete = () => {
    if (deleteRowId) {
      deleteMutation.mutate(deleteRowId);
      setDeleteRowId(null);
    }
  };

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "subcategories",
            label: "Subcategories",
            icon: Eye,
            show: (row) => row.type === "Main Category" || row.type === "MainCategory",
            onClick: (row) => navigate(`/dashboard/inventory/items-management/categories/${row.id}/subcategories`),
          },
          {
            key: "related",
            label: "Related Items",
            icon: Layers,
            onClick: (row) => navigate(`/dashboard/inventory/items-management/categories/${row.id}/related-items`),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/inventory/items-management/categories/edit/${row.id}`),
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
    ],
    [navigate],
  );

  const columns = [
    {
      key: "serialNumber",
      label: "Serial Number",
      render: (row) => <span className="text-blue-500 font-medium">{row.serialNumber}</span>,
    },
    {
      key: "categoryName",
      label: "Category Name",
      sortable: true,
    },
    {
      key: "type",
      label: "Main Category / Subcategory",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.type === "Main Category" || row.type === "MainCategory"
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {row.type === "MainCategory" ? "Main Category" : row.type}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-foreground">Item Categories</h2>
        <Info className="w-5 h-5 text-muted-foreground" />
      </div>

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

      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            {filterConfigs.map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                         {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ Type: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataView
        data={categoriesData}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or category name...",
          value: search,
          onChange: handleSearch,
        }}
        // filter={{
        //   label: "Filter",
        //   onClick: () => setIsFilterOpen(!isFilterOpen),
        // }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/inventory/items-management/categories/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Layers,
          title: (row) => row.categoryName,
          subtitle: (row) => row.type,
          fields: [
            {
              icon: Layers,
              label: "Serial:",
              value: (row) => row.serialNumber,
            },
          ],
        }}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No categories found"
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
}
