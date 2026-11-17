import { StatTitle } from "@/components/common/stat-title";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown, ShieldCheck } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import SettleRentalContractDialog from "./_components/settle-rental-contract-dialog";
import { PageTitle } from "@/components/common/page-title";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import toast from "react-hot-toast";
import {
  RENTAL_STATUS_TABS,
  useRentals,
  useRentalLookups,
  useRentalStats,
  useRentalMutations,
} from "@/features/rentals";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function RentalsPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedResource, setSelectedResource] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [settleContractRow, setSettleContractRow] = useState(null);

  const navigate = useNavigate();

  // Lookups Query via Feature Hook
  const { data: lookupsData } = useRentalLookups();
  const lookups = lookupsData?.data || {
    customers: [],
    resources: [],
    services: [],
    costCenters: [],
    currencies: [],
    paymentMethods: [],
    statuses: [],
  };

  // Stats Query via Feature Hook
  const { data: statsData } = useRentalStats();
  const stats = statsData?.data || [];

  // Params for Rentals Query (/api/Inventory/RentalContract/GetAll)
  const params = useMemo(
    () => {
      const p = {
        PageNumber: page,
        PageSize: 10,
      };

      const q = search.trim();
      if (q) {
        p.SearchTerm = q;
        p.Search = q;
      }

      if (["Paid", "PartiallyPaid", "Unpaid"].includes(activeTab)) {
        p.Status = activeTab;
      }
      if (activeTab === "active") {
        p.IsActive = true;
      } else if (activeTab === "closed") {
        p.IsActive = false;
      }

      if (selectedCustomer !== "all") {
        p.CustomerId = selectedCustomer;
      }
      if (selectedResource !== "all") {
        p.ResourceId = selectedResource;
      }
      if (fromDate) {
        p.FromDate = fromDate;
      }
      if (toDate) {
        p.ToDate = toDate;
      }

      return p;
    },
    [page, search, activeTab, selectedCustomer, selectedResource, fromDate, toDate]
  );

  // Rentals Query via Feature Hook
  const {
    data: rentalsData,
    isLoading,
    refetch,
  } = useRentals(params);

  const displayRows = rentalsData?.data?.items || [];
  const totalPages = rentalsData?.data?.totalPages || 1;

  // Mutations via Feature Hook
  const { deleteRental: deleteMutation } = useRentalMutations();

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "active":
      case "paid":
        return "bg-emerald-50 text-emerald-600";
      case "partiallypaid":
        return "bg-amber-50 text-amber-600";
      case "unpaid":
        return "bg-rose-50 text-rose-600";
      case "draft":
        return "bg-slate-100 text-slate-700";
      case "closed":
      case "settled":
        return "bg-blue-50 text-[#0066d1]";
      case "canceled":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-emerald-50 text-emerald-600";
    }
  };

  const statusTabs = useMemo(
    () => [
      { id: "all", label: t("rentalsModule.statuses.all") },
      { id: "active", label: t("rentalsModule.statuses.active") },
      { id: "Paid", label: t("rentalsModule.statuses.paid") },
      { id: "PartiallyPaid", label: t("rentalsModule.statuses.partiallyPaid") },
      { id: "Unpaid", label: t("rentalsModule.statuses.unpaid") },
      { id: "closed", label: t("rentalsModule.statuses.closed") },
    ],
    [t]
  );

  const rowActionsMenu = useMemo(
    () => [
      {
        label: t("common.actions"),
        items: [
          {
            key: "view",
            label: t("common.viewDetails"),
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/rentals/${row.id}`),
          },
          {
            key: "settle",
            label: t("rentalsModule.settleContract"),
            icon: ShieldCheck,
            onClick: (row) => setSettleContractRow(row),
          },
          {
            key: "edit",
            label: t("rentalsModule.editContract"),
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/rentals/edit/${row.id}`),
          },
          {
            key: "delete",
            label: t("common.delete"),
            icon: Trash2,
            variant: "destructive",
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate, t]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("rentalsModule.id"),
        cell: ({ row }) => (
          <Link
            to={`/dashboard/rentals/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs"
          >
            {row.original.contractNumber || row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: t("rentalsModule.customer"),
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.customer}
          </span>
        ),
      },
      {
        accessorKey: "resourceService",
        header: `${t("rentalsModule.resource")} / ${t("rentalsModule.service")}`,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="text-xs font-normal text-slate-800">
              {row.original.resource}
            </p>
            <p className="text-[11px] text-slate-400">
              {row.original.service}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "period",
        header: `${t("rentalsModule.contractStart")} - ${t("rentalsModule.contractEnd")}`,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="text-xs font-normal text-slate-800">
              {row.original.startDate || "2026-07-01"}
            </p>
            <p className="text-[11px] text-slate-400">
              {row.original.endDate || "2027-07-01"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "rate",
        header: t("rentalsModule.rentalRate"),
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.rate}
          </span>
        ),
      },
      {
        accessorKey: "deposit",
        header: t("rentalsModule.depositHeld"),
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.deposit}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: t("rentalsModule.total"),
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.total}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("rentalsModule.status"),
        cell: ({ row }) => {
          const status = row.original.status || "Active";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                status
              )}`}
            >
              {translateErp(status, locale)}
            </span>
          );
        },
      },
    ],
    [t, locale]
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title={t("rentalsModule.rentals")}
        infoTooltip={t("rentalsModule.contractTooltip")}
      />

      {/* Top 4 Stats Cards matching mockup */}
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
                    <StatTitle>{card.title}</StatTitle>
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
            key: "customer",
            label: "Customer",
            placeholder: "All Customers",
            options: (lookups.customers || []).map((c) => ({
              value: c.id,
              label: c.name,
            })),
          },
          {
            key: "resource",
            label: "Resource",
            placeholder: "All Resources",
            options: (lookups.resources || []).map((r) => ({
              value: r.id,
              label: r.name,
            })),
          },
          {
            key: "fromDate",
            label: "From Date",
            type: "date",
          },
          {
            key: "toDate",
            label: "To Date",
            type: "date",
          },
        ]}
        filters={{
          customer: selectedCustomer !== "all" ? selectedCustomer : "",
          resource: selectedResource !== "all" ? selectedResource : "",
          fromDate,
          toDate,
        }}
        onFilterChange={(key, val) => {
          if (key === "customer") setSelectedCustomer(val || "all");
          if (key === "resource") setSelectedResource(val || "all");
          if (key === "fromDate") setFromDate(val);
          if (key === "toDate") setToDate(val);
          setPage(1);
        }}
        onClear={() => {
          setSelectedCustomer("all");
          setSelectedResource("all");
          setFromDate("");
          setToDate("");
          setPage(1);
        }}
      />

      {/* Main Table with DataView & Tabs inside table container */}
      <DataView
        tabs={{
          items: statusTabs,
          activeTab: activeTab,
          onChange: (tabId) => {
            setActiveTab(tabId);
            setPage(1);
          },
        }}
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        rowActionsMenu={rowActionsMenu}
        searchPlaceholder={t("rentalsModule.searchPlaceholder")}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => navigate("/dashboard/rentals/add")}
        onRefresh={() => refetch()}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        emptyMessage={t("rentalsModule.noContractsFound")}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title={t("rentalsModule.deleteContractTitle")}
        description={t("rentalsModule.deleteContractDesc")}
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />

      {/* Settle Contract Dialog */}
      <SettleRentalContractDialog
        isOpen={Boolean(settleContractRow)}
        onClose={() => setSettleContractRow(null)}
        contract={settleContractRow}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
