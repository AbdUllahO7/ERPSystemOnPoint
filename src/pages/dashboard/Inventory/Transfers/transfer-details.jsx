import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, Package } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { getTransferDetails } from "../../../../lib/api";

export default function TransferDetails() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ Category: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["getTransferDetails", id],
    queryFn: () => getTransferDetails(id),
    enabled: !!id,
  });

  const transfer = data?.data || {};
  const materials = transfer.details || [];

  function handleSearch(value) {
    setSearch(value);
  }

  const columns = [
    {
      key: "material_Name",
      label: "Material",
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (row) => <span className="text-blue-500 font-medium">{row.quantity}</span>,
    },
    {
      key: "weight",
      label: "Weight",
      render: (row) => <span className="text-blue-500 font-medium">{row.weight} kg</span>,
    },
    {
      key: "unit_Name",
      label: "Unity",
    },
  ];

  const filterConfigs = [
    {
      key: "Category",
      label: "Filter by Category",
      placeholder: "All Categories",
      options: [
        { value: "cat1", label: "Category 1" },
        { value: "cat2", label: "Category 2" },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Transfer Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Transfers</span>
          <span>/</span>
          <span className="font-medium text-foreground">Transfer Details</span>
        </div>
      </div>

      {/* Top Details Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-2">Loading details...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-semibold text-foreground">Transfer Number</p>
              <p className="text-sm text-blue-500 font-medium mt-1">{transfer.transfer_Id ? transfer.transfer_Id.substring(0, 8) : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Source</p>
              <p className="text-sm text-muted-foreground mt-1">{transfer.source_Warehouse_Name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Destination</p>
              <p className="text-sm text-muted-foreground mt-1">{transfer.destination_Warehouse_Name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Date</p>
              <p className="text-sm text-muted-foreground mt-1">
                {transfer.transfer_Date ? new Date(transfer.transfer_Date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Materials</h3>
        
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
                    setFilters({ Category: "" });
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
          data={materials}
          isLoading={isLoading}
          getRowId={(row) => row.detail_Id}
          // search={{
          //   placeholder: "Search by id or employee name...",
          //   value: search,
          //   onChange: handleSearch,
          // }}
          // filter={{
          //   label: "Filter",
          //   onClick: () => setIsFilterOpen(!isFilterOpen),
          // }}
          onRefresh={() => console.log("refresh")}
          onPrint={() => window.print()}
          export={{
            label: "Export",
            onClick: () => console.log("export"),
          }}
          columns={columns}
          allowedViews={["table", "cards"]}
          card={{
            icon: Package,
            title: (row) => row.material_Name,
            fields: [
              {
                key: "quantity",
                label: "Quantity",
                value: (row) => <span className="text-blue-500 font-medium">{row.quantity}</span>,
              },
              {
                key: "weight",
                label: "Weight",
                value: (row) => <span className="text-blue-500 font-medium">{row.weight} kg</span>,
              },
              {
                key: "unit_Name",
                label: "Unity",
              },
            ],
          }}
          pagination={{
            page: page,
            totalPages: 1, // API response didn't include pagination for details
            onPageChange: setPage,
            prevLabel: "Pre",
            nextLabel: "Next",
          }}
          emptyMessage="No materials found"
        />
      </div>
    </div>
  );
}
