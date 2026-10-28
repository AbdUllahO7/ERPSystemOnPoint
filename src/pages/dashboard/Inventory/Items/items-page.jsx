import { useState, useMemo } from "react";
import {
  Package,
  CheckCircle2,
  Layers,
  Tag,
  Pencil,
  Trash2,
  Eye,
  Boxes,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  toggleProductStatus,
  getAllCategories,
} from "@/lib/api";
import toast from "react-hot-toast";
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
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  Inventory: "bg-blue-50 text-blue-700 border-blue-200",
  Service: "bg-amber-50 text-amber-700 border-amber-200",
  Appointment: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reservation: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Bundle: "bg-purple-50 text-purple-700 border-purple-200",
  Assembly: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function ItemsPage() {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All Items");
  const [deleteRowId, setDeleteRowId] = useState(null);

  // Sorting State
  const [sortBy, setSortBy] = useState(undefined);
  const [sortDirection, setSortDirection] = useState(undefined);

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTracking, setFilterTracking] = useState("all");
  const [filterSpecs, setFilterSpecs] = useState("all");

  // Tabs matching all product_Type values in the system
  const tabs = [
    "All Items",
    "Inventory",
    "Service",
    "Appointment",
    "Reservation",
    "Bundle",
    "Assembly",
  ];

  // Load Categories for Filter Dropdown
  const { data: categoriesRes } = useQuery({
    queryKey: ["allCategoriesForFilter"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });
  const categoriesList = categoriesRes?.data?.items || [];

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleProductStatus(id),
    onSuccess: () => {
      toast.success("Item status updated successfully.");
      queryClient.invalidateQueries(["products"]);
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update item status."
      );
    },
  });

  // Query Parameters
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      Search: search || undefined,
      SearchTerm: search || undefined,
      Category_Id:
        filterCategory !== "all"
          ? filterCategory
          : categoryId || undefined,
      ProductType: activeTab === "All Items" ? undefined : activeTab,
      IsActive:
        filterStatus === "all"
          ? undefined
          : filterStatus === "active",
      IsTrackingInventory:
        filterTracking === "all"
          ? undefined
          : filterTracking === "tracked",
      HasSpecifications:
        filterSpecs === "all"
          ? undefined
          : filterSpecs === "yes",
      SortBy: sortBy || undefined,
      SortDirection: sortDirection || undefined,
      IsDescending:
        sortDirection === "desc"
          ? true
          : sortDirection === "asc"
          ? false
          : undefined,
    }),
    [
      page,
      search,
      filterCategory,
      categoryId,
      activeTab,
      filterStatus,
      filterTracking,
      filterSpecs,
      sortBy,
      sortDirection,
    ]
  );

  // Products Query
  const {
    data: productsRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", params],
    queryFn: () => getAllProducts(params),
  });

  const productsData =
    productsRes?.data?.items ||
    (Array.isArray(productsRes?.data) ? productsRes?.data : []);
  const totalCount = productsRes?.data?.totalCount ?? productsData.length;
  const totalPages =
    productsRes?.data?.totalPages || Math.ceil(totalCount / 10) || 1;

  // Active items count on current page
  const activeCount = useMemo(
    () => productsData.filter((i) => i.is_Active).length,
    [productsData]
  );

  // Distinct categories in current view
  const categoriesCount = useMemo(
    () =>
      new Set(
        productsData
          .map((i) => i.category_name)
          .filter((c) => c && c !== "N/A")
      ).size,
    [productsData]
  );

  const stats = [
    {
      title: "Total Items",
      value: String(totalCount),
      trend: `${totalPages} Pages`,
      isUp: true,
      color: "bg-[#0066d1]",
      icon: Package,
    },
    {
      title: "Active on Page",
      value: String(activeCount),
      trend: `${productsData.length} Loaded`,
      isUp: true,
      color: "bg-[#5ebc93]",
      icon: CheckCircle2,
    },
    {
      title: "Current Section",
      value: activeTab === "All Items" ? "All Types" : activeTab,
      trend: `${productsData.length} items`,
      isUp: true,
      color: "bg-[#0d3963]",
      icon: Layers,
    },
    {
      title: "Categories in View",
      value: String(categoriesCount),
      trend: "Categories",
      isUp: true,
      color: "bg-[#f39223]",
      icon: Tag,
    },
  ];

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const columns = [
    {
      key: "product_Number",
      label: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.product_Number || "-"}
        </span>
      ),
    },
    {
      key: "name_Product",
      label: "Item Name",
      sortable: true,
      render: (row) => (
        <span
          className="font-medium text-[#0066d1] hover:underline cursor-pointer"
          onClick={() =>
            navigate(
              `/dashboard/inventory/items-management/items/edit/${row.id}`
            )
          }
        >
          {row.name_Product || "-"}
        </span>
      ),
    },
    {
      key: "category_name",
      label: "Category",
      render: (row) => (
        <span className="text-slate-700">
          {row.category_name && row.category_name !== "N/A"
            ? row.category_name
            : "-"}
        </span>
      ),
    },
    {
      key: "product_Type",
      label: "Type",
      render: (row) => (
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            TYPE_STYLES[row.product_Type] ||
              "bg-slate-50 text-slate-700 border-slate-200"
          )}
        >
          {row.product_Type || "-"}
        </span>
      ),
    },
    {
      key: "units",
      label: "Unit",
      render: (row) => (
        <span className="text-slate-700">
          {Array.isArray(row.units) && row.units.length > 0
            ? row.units.join(", ")
            : row.unit || "-"}
        </span>
      ),
    },
    {
      key: "prices",
      label: "Sales Price",
      render: (row) => (
        <span className="font-semibold text-[#0066d1]">
          {Array.isArray(row.prices) && row.prices.length > 0
            ? row.prices
                .map((p) => `$${Number(p).toLocaleString()}`)
                .join(", ")
            : row.price
            ? `$${Number(row.price).toLocaleString()}`
            : "-"}
        </span>
      ),
    },
    {
      key: "is_Active",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            row.is_Active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          )}
        >
          {row.is_Active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_At",
      label: "Created Date",
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 text-xs">
          {row.created_At ? row.created_At.split("T")[0] : "-"}
        </span>
      ),
    },
  ];

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "view",
            label: "View Details",
            icon: Eye,
            onClick: (row) =>
              navigate(
                `/dashboard/inventory/items-management/items/edit/${row.id}`
              ),
          },
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) =>
              navigate(
                `/dashboard/inventory/items-management/items/edit/${row.id}`
              ),
          },
        ],
      },
      {
        items: [
          {
            key: "toggle_status",
            label: "Toggle Status",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Items Management"
        infoTooltip="Manage products, materials, services, appointments, bundles, and assemblies."
      />

      {/* Dynamic Inventory Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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
                <span className="text-xs font-semibold text-emerald-600">
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Type Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "text-primary font-bold"
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
        allowedViews={["table", "cards"]}
        defaultView="table"
        search={{
          placeholder: "Search by item code or name...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(true),
        }}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            {/* Category Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Filter by Category
              </Label>
              <Select
                value={filterCategory}
                onValueChange={(val) => {
                  setFilterCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name || cat.name_Category || "Category"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Filter by Status
              </Label>
              <Select
                value={filterStatus}
                onValueChange={(val) => {
                  setFilterStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Inventory Tracking
              </Label>
              <Select
                value={filterTracking}
                onValueChange={(val) => {
                  setFilterTracking(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="tracked">Tracked Inventory</SelectItem>
                  <SelectItem value="untracked">Not Tracked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specifications Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Has Specifications
              </Label>
              <Select
                value={filterSpecs}
                onValueChange={(val) => {
                  setFilterSpecs(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">With Specifications</SelectItem>
                  <SelectItem value="no">Without Specifications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterCategory("all");
                  setFilterStatus("all");
                  setFilterTracking("all");
                  setFilterSpecs("all");
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
                Apply
              </Button>
            </div>
          </div>
        }
        onRefresh={() => {
          refetch();
          toast.success("Items refreshed!");
        }}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => toast.success("Exporting items..."),
        }}
        addButton={{
          label: "Add Item",
          onClick: () =>
            navigate("/dashboard/inventory/items-management/items/add"),
        }}
        columns={columns}
        onSort={(key, dir) => {
          setSortBy(key);
          setSortDirection(dir);
          setPage(1);
        }}
        sortKey={sortBy}
        sortDirection={sortDirection}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Package,
          title: (row) => row.name_Product || "-",
          subtitle: (row) =>
            row.category_name && row.category_name !== "N/A"
              ? row.category_name
              : undefined,
          fields: [
            {
              key: "product_Number",
              label: "Code",
              value: (row) => row.product_Number || "-",
            },
            {
              key: "product_Type",
              label: "Type",
              value: (row) => row.product_Type || "-",
            },
            {
              key: "units",
              label: "Unit",
              value: (row) =>
                Array.isArray(row.units) && row.units.length > 0
                  ? row.units.join(", ")
                  : row.unit || "-",
            },
            {
              key: "prices",
              label: "Price",
              value: (row) =>
                Array.isArray(row.prices) && row.prices.length > 0
                  ? row.prices.map((p) => `$${p}`).join(", ")
                  : "-",
            },
            {
              key: "is_Active",
              label: "Status",
              value: (row) => (row.is_Active ? "Active" : "Inactive"),
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
        emptyMessage={`No ${activeTab.toLowerCase()} found`}
      />

      {/* Toggle Status Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => toggleStatusMutation.mutate(deleteRowId)}
        title="Change Item Status"
        description="Are you sure you want to change the status of this item? This action will toggle between Active and Inactive."
      />
    </div>
  );
}
