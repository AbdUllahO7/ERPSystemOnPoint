import { StatTitle } from "@/components/common/stat-title";
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
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/translate-api";
import { translateErp, translateTabLabel } from "@/lib/erp-i18n";

const TYPE_STYLES = {
  Inventory: "bg-blue-50 text-blue-700 border-blue-200",
  Rental: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Service: "bg-amber-50 text-amber-700 border-amber-200",
  Appointment: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reservation: "bg-rose-50 text-rose-700 border-rose-200",
  Bundle: "bg-purple-50 text-purple-700 border-purple-200",
  Assembly: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function ItemsPage() {
  const { locale, t } = useI18n();
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
    "Rental",
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
      toast.success(t('inventory.items.statusUpdated'));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('inventory.items.statusUpdated')
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
    staleTime: 0,
    refetchOnMount: "always",
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
      title: t('inventory.items.totalItems'),
      value: String(totalCount),
      trend: `${totalPages} ${t('pages', 'Pages')}`,
      isUp: true,
      color: "bg-[#0066d1]",
      icon: Package,
    },
    {
      title: t('inventory.items.activeOnPage'),
      value: String(activeCount),
      trend: `${productsData.length} ${t('loaded', 'Loaded')}`,
      isUp: true,
      color: "bg-[#5ebc93]",
      icon: CheckCircle2,
    },
    {
      title: t('inventory.items.currentSection'),
      value: activeTab === "All Items" ? t('inventory.items.allItems') : (locale === "ar" ? translateErp(activeTab, locale) : activeTab),
      trend: `${productsData.length} ${t('items', 'items')}`,
      isUp: true,
      color: "bg-[#0d3963]",
      icon: Layers,
    },
    {
      title: t('inventory.items.categoriesInView'),
      value: String(categoriesCount),
      trend: t('inventory.categories.title'),
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
      label: t('inventory.items.cols.itemCode'),
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.product_Number || "-"}
        </span>
      ),
    },
    {
      key: "name_Product",
      label: t('inventory.items.cols.itemName'),
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
      label: t('inventory.items.cols.category'),
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
      label: t('type', 'Type'),
      render: (row) => (
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            TYPE_STYLES[row.product_Type] ||
              "bg-slate-50 text-slate-700 border-slate-200"
          )}
        >
          {locale === "ar" ? translateErp(row.product_Type, locale) : (row.product_Type || "-")}
        </span>
      ),
    },
    {
      key: "units",
      label: t('inventory.items.cols.unit'),
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
      label: t('salesPrice', 'Sales Price'),
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
      label: t('inventory.items.cols.status'),
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
          {row.is_Active ? t('inventory.items.statusActive') : t('inventory.items.statusInactive')}
        </span>
      ),
    },
    {
      key: "created_At",
      label: t('createdAt', 'Created Date'),
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
            label: t('common.viewDetails'),
            icon: Eye,
            onClick: (row) =>
              navigate(
                `/dashboard/inventory/items-management/items/edit/${row.id}`
              ),
          },
          {
            key: "edit",
            label: t('common.edit'),
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
            label: t('inventory.items.toggleStatus'),
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate, t]
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title={t('inventory.items.title')}
        infoTooltip={t('inventory.items.tooltip')}
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
              <p className="text-sm text-muted-foreground"><StatTitle>{stat.title}</StatTitle></p>
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
            {locale === "ar" ? translateTabLabel(tab, locale) : tab}
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
            key: "category",
            label: t('inventory.items.filterCategory'),
            placeholder: t('inventory.items.allCategories'),
            options: (categoriesList || []).map((cat) => ({
              value: cat.id,
              label: cat.name || cat.name_Category || t('category', 'Category'),
            })),
          },
          {
            key: "status",
            label: t('inventory.items.filterStatus'),
            placeholder: t('inventory.items.allStatuses'),
            options: [
              { value: "active", label: t('inventory.items.activeOnly') },
              { value: "inactive", label: t('inventory.items.inactiveOnly') },
            ],
          },
          {
            key: "tracking",
            label: t('inventory.items.tracking'),
            placeholder: t('common.all'),
            options: [
              { value: "tracked", label: t('inventory.items.tracked') },
              { value: "untracked", label: t('inventory.items.untracked') },
            ],
          },
          {
            key: "specs",
            label: t('inventory.items.specifications'),
            placeholder: t('common.all'),
            options: [
              { value: "yes", label: t('inventory.items.withSpecs') },
              { value: "no", label: t('inventory.items.withoutSpecs') },
            ],
          },
        ]}
        filters={{
          category: filterCategory !== "all" ? filterCategory : "",
          status: filterStatus !== "all" ? filterStatus : "",
          tracking: filterTracking !== "all" ? filterTracking : "",
          specs: filterSpecs !== "all" ? filterSpecs : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "category") setFilterCategory(val || "all");
          if (key === "status") setFilterStatus(val || "all");
          if (key === "tracking") setFilterTracking(val || "all");
          if (key === "specs") setFilterSpecs(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterCategory("all");
          setFilterStatus("all");
          setFilterTracking("all");
          setFilterSpecs("all");
          setPage(1);
        }}
      />

      {/* Data Table */}
      <DataView
        data={productsData}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        allowedViews={["table", "cards"]}
        defaultView="table"
        search={{
          placeholder: t('inventory.items.searchPlaceholder'),
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: t('common.filter'),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {
          refetch();
          toast.success(t('inventory.items.refreshed'));
        }}
        addButton={{
          label: t('inventory.items.addItem'),
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
              label: t('inventory.items.cols.itemCode'),
              value: (row) => row.product_Number || "-",
            },
            {
              key: "product_Type",
              label: t('type', 'Type'),
              value: (row) => locale === "ar" ? translateErp(row.product_Type, locale) : (row.product_Type || "-"),
            },
            {
              key: "units",
              label: t('inventory.items.cols.unit'),
              value: (row) =>
                Array.isArray(row.units) && row.units.length > 0
                  ? row.units.join(", ")
                  : row.unit || "-",
            },
            {
              key: "prices",
              label: t('price', 'Price'),
              value: (row) =>
                Array.isArray(row.prices) && row.prices.length > 0
                  ? row.prices.map((p) => `$${p}`).join(", ")
                  : "-",
            },
            {
              key: "is_Active",
              label: t('inventory.items.cols.status'),
              value: (row) => (row.is_Active ? t('inventory.items.statusActive') : t('inventory.items.statusInactive')),
            },
          ],
        }}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t('common.prev'),
          nextLabel: t('common.next'),
        }}
        emptyMessage={t('inventory.items.empty')}
      />

      {/* Toggle Status Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => toggleStatusMutation.mutate(deleteRowId)}
        title={t('inventory.items.toggleStatusTitle')}
        description={t('inventory.items.toggleStatusDesc')}
      />
    </div>
  );
}
