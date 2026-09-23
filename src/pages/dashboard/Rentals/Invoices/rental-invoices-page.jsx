import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
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
import toast from "react-hot-toast";
import {
  getRentalInvoices,
  getRentalInvoicesStats,
  deleteRentalInvoice,
  getRentalInvoiceLookups,
} from "@/services/rentals";

export default function RentalInvoicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedContract, setSelectedContract] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["rentalInvoiceLookups"],
    queryFn: getRentalInvoiceLookups,
  });
  const lookups = lookupsData?.data || {
    contracts: [],
    statuses: [],
  };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["rentalInvoicesStats"],
    queryFn: getRentalInvoicesStats,
  });
  const stats = statsData?.data || [];

  // Query Params
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: selectedStatus !== "all" ? selectedStatus : undefined,
      Contract: selectedContract !== "all" ? selectedContract : undefined,
    }),
    [page, search, selectedStatus, selectedContract]
  );

  // Invoices Query
  const {
    data: invoicesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["rentalInvoices", params],
    queryFn: () => getRentalInvoices(params),
  });

  const displayRows = invoicesData?.data?.items || [];
  const totalPages = invoicesData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRentalInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["rentalInvoices"]);
      toast.success("Rental invoice deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete invoice!");
      setDeleteRowId(null);
    },
  });

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "view",
            label: "View Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/rentals/invoices/${row.id}`),
          },
          {
            key: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/rentals/invoices/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "contract",
        header: "Contract",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/rentals/${row.original.contractId || row.original.contractNumber}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs"
          >
            {row.original.contractNumber || row.original.contractId}
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.customer}
          </span>
        ),
      },
      {
        accessorKey: "returnDate",
        header: "Return Date",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.returnDate}
          </span>
        ),
      },
      {
        accessorKey: "damage",
        header: "Damage",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.damage}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.total}
          </span>
        ),
      },
      {
        accessorKey: "due",
        header: "Due",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.due}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "Partial";
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#0066d1]">
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
        title="Rental Invoices"
        infoTooltip="Review final return statements, assess equipment/vehicle damage surcharges, and reconcile open invoice dues."
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
        onAdd={() => navigate("/dashboard/rentals/invoices/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting rental invoices...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Contract
              </Label>
              <Select
                value={selectedContract}
                onValueChange={(val) => {
                  setSelectedContract(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  {lookups.contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Status
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {lookups.statuses.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedContract("all");
                  setSelectedStatus("all");
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
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="Delete Rental Invoice"
        description="Are you sure you want to delete this rental invoice? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
