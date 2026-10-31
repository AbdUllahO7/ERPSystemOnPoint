import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, Eye, CheckCircle2 } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { PageTitle } from "@/components/common/page-title";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import toast from "react-hot-toast";
import {
  getCommissionLedger,
  getCommissionLedgerStats,
  getCommissionLookups,
} from "@/services/appointments";

export default function CommissionLedgerPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["commissionLookups"],
    queryFn: getCommissionLookups,
  });
  const lookups = lookupsData?.data || { providers: [] };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["commissionLedgerStats"],
    queryFn: getCommissionLedgerStats,
  });
  const stats = statsData?.data || [];

  // Params for Ledger Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: selectedStatus !== "all" ? selectedStatus : undefined,
      Provider: selectedProvider !== "all" ? selectedProvider : undefined,
    }),
    [page, search, selectedStatus, selectedProvider]
  );

  // Ledger Query
  const {
    data: ledgerData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["commissionLedger", params],
    queryFn: () => getCommissionLedger(params),
  });

  const displayRows = ledgerData?.data?.items || [];
  const totalPages = ledgerData?.data?.totalPages || 1;

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "view",
            label: "View Details",
            icon: Eye,
            onClick: (row) => toast.info(`Viewing commission for ${row.customer}`),
          },
          {
            key: "mark_paid",
            label: "Mark as Paid",
            icon: CheckCircle2,
            onClick: (row) => toast.success(`Marked commission ${row.id} as Paid`),
          },
        ],
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-800">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-800">
            {row.original.provider}
          </span>
        ),
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-700">
            {row.original.service}
          </span>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-700">
            {row.original.customer}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-[#0066d1]">
            {row.original.amount}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "Pending";
          const isPending = status.toLowerCase() === "pending";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-normal ${
                isPending
                  ? "bg-[#fef9ee] text-[#f59e0b]"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Commission Ledger"
        infoTooltip="Review accrued and paid commissions across all providers and completed services."
      />

      {/* Top 4 Stats Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
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

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: "Filter by Status",
            placeholder: "All Statuses",
            options: [
              { value: "Pending", label: "Pending" },
              { value: "Paid", label: "Paid" },
            ],
          },
          {
            key: "provider",
            label: "Filter by Provider",
            placeholder: "All Providers",
            options: (lookups.providers || []).map((p) => ({
              value: p.id,
              label: p.name,
            })),
          },
        ]}
        filters={{
          status: selectedStatus !== "all" ? selectedStatus : "",
          provider: selectedProvider !== "all" ? selectedProvider : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "status") setSelectedStatus(val || "all");
          if (key === "provider") setSelectedProvider(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setSelectedStatus("all");
          setSelectedProvider("all");
          setPage(1);
        }}
      />

      {/* Main Table with DataView */}
      <DataView
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        rowActionsMenu={rowActionsMenu}
        searchPlaceholder="Search by id or employee name..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
