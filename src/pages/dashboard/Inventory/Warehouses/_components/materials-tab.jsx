import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { getWarehouseItems, getAllCategories } from "@/lib/api";
import { Package } from "lucide-react";

export default function MaterialsTab({ id }) {
  const { id: paramId } = useParams();
  const actualId = id || paramId;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ CategoryId: "", IsActive: "" });

  const { data: categoriesData } = useQuery({
    queryKey: ["getAllCategories"],
    queryFn: () => getAllCategories({ pageNumber: 1, pageSize: 100 }),
  });
  const categories = categoriesData?.data?.items || [];

  const filterConfigs = [
    {
      key: "CategoryId",
      label: "Filter by Category",
      placeholder: "All Categories",
      options: categories.map((cat) => ({
        value: cat.id,
        label: cat.category_Name || cat.name || `Category ${cat.id.substring(0,4)}`,
      })),
    },
    // {
    //   key: "IsActive",
    //   label: "Filter by Status",
    //   placeholder: "All Statuses",
    //   options: [
    //     { value: "true", label: "Active" },
    //     { value: "false", label: "Inactive" },
    //   ],
    // },
  ];

  const params = useMemo(
    () => ({
      Search: search,
      PageNumber: page,
      PageSize: 10,
      ...(filters.CategoryId && { categoryId: filters.CategoryId }),
      ...(filters.IsActive !== "" && { IsActive: filters.IsActive === "true" }),
    }),
    [page, search, filters]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getWarehouseItems", actualId, params],
    queryFn: () => getWarehouseItems(actualId, params),
    enabled: !!actualId,
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
  }

  const columns = [
    {
      key: "productNumber",
      label: "Code",
      render: (row) => <span className="text-blue-600 font-medium">{row.productNumber}</span>,
    },
    {
      key: "productName",
      label: "Item Name",
      render: (row) => <span className="text-blue-600 font-medium">{row.productName}</span>,
    },
    {
      key: "availableQuantity",
      label: "Available quantity",
      render: (row) => <span className="text-blue-600 font-medium">{row.availableQuantity || "0"}</span>,
    },
    {
      key: "unit",
      label: "Main Unit",
      render: (row) => row.availableUnits?.[0]?.unitName || "-",
    },
    {
      key: "price",
      label: "Sales Price",
      render: (row) => <span className="text-blue-600 font-medium">${row.availableUnits?.[0]?.consumerPrice || 0}</span>,
    },
  ];

  return (
    <div>
      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap mt-4">
            {filterConfigs.map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters[config.key] || "all"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                    setPage(1);
                  }}
                >
                  <option value="all">{config.placeholder}</option>
                  {config.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => {
                  setFilters({ CategoryId: "", IsActive: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        view={viewMode}
        onViewChange={setViewMode}
        columns={columns}
        onSearch={handleSearch}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search items...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        card={{
          icon: Package,
          title: (row) => row.productName,
          subtitle: (row) => `Code: ${row.productNumber}`,
          fields: [
            {
              label: "Available:",
              value: (row) => `${row.availableQuantity || "0"} ${row.availableUnits?.[0]?.unitName || ""}`,
            },
            {
              label: "Price:",
              value: (row) => `$${row.availableUnits?.[0]?.consumerPrice || 0}`,
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
