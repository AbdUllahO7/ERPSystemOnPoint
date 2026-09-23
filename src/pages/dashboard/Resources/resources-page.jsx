import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
  getResources,
  getResourcesStats,
  deleteResource,
  getResourceLookups,
} from "@/services/resources";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedOwnership, setSelectedOwnership] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || {
    addresses: [],
    ownerships: [],
    fixedAssets: [],
    statuses: [],
  };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["resourcesStats"],
    queryFn: getResourcesStats,
  });
  const stats = statsData?.data || [];

  // Params for Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Ownership: selectedOwnership !== "all" ? selectedOwnership : undefined,
      Status: selectedStatus !== "all" ? selectedStatus : undefined,
    }),
    [page, search, selectedOwnership, selectedStatus]
  );

  // Resources Query
  const {
    data: resourcesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["resources", params],
    queryFn: () => getResources(params),
  });

  const displayRows = resourcesData?.data?.items || [];
  const totalPages = resourcesData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      toast.success("Resource deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete resource!");
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
            onClick: (row) => navigate(`/dashboard/resources/${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Resource",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/resources/edit/${row.id}`),
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
            to={`/dashboard/resources/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.address}
          </span>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.capacity}
          </span>
        ),
      },
      {
        accessorKey: "ownership",
        header: "Ownership",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.ownership}
          </span>
        ),
      },
      {
        accessorKey: "supplierAsset",
        header: "Supplier / Asset",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.supplierAsset}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "Rented";
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
        title="Resources"
        infoTooltip="Manage all physical facilities, training rooms, seminar halls, and clinic resources."
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
        onAdd={() => navigate("/dashboard/resources/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting resources...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Ownership
              </Label>
              <Select
                value={selectedOwnership}
                onValueChange={(val) => {
                  setSelectedOwnership(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ownerships</SelectItem>
                  {lookups.ownerships.map((o) => (
                    <SelectItem key={o.id} value={o.name}>
                      {o.name}
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
                  setSelectedOwnership("all");
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
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
