import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
  getServices,
  getServicesStats,
  deleteService,
  getServiceLookups,
} from "@/services/appointments";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["serviceLookups"],
    queryFn: getServiceLookups,
  });
  const lookups = lookupsData?.data || { categories: [] };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["servicesStats"],
    queryFn: getServicesStats,
  });
  const stats = statsData?.data || [];

  // Params for Services Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Category: selectedCategory !== "all" ? selectedCategory : undefined,
    }),
    [page, search, selectedCategory]
  );

  // Services Query
  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ["services", params],
    queryFn: () => getServices(params),
  });

  const displayRows = servicesData?.data?.items || [];
  const totalPages = servicesData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success("Service deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete service!");
      setDeleteRowId(null);
    },
  });

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "edit",
            label: "Edit Service",
            icon: Pencil,
            onClick: (row) =>
              navigate(`/dashboard/appointments/services/edit/${row.id}`),
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
    [navigate]
  );

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortable: true,
        render: (row) => (
          <Link
            to={`/dashboard/appointments/services/edit/${row.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.id}
          </Link>
        ),
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-foreground">{row.name}</span>
        ),
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (row) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800">
            {row.category}
          </span>
        ),
      },
      {
        key: "billingMethod",
        label: "Billing",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.billingMethod}</span>
        ),
      },
      {
        key: "duration",
        label: "Duration",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.duration}</span>
        ),
      },
      {
        key: "cost",
        label: "Cost",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.cost}</span>
        ),
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        render: (row) => (
          <span className="font-semibold text-primary">{row.price}</span>
        ),
      },
      {
        key: "contract",
        label: "Contract",
        sortable: true,
        render: (row) => (
          <span
            className={
              row.contract === "Required"
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }
          >
            {row.contract}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title with info tooltip */}
      <PageTitle
        title="Services"
        infoText="Manage clinic & hospital appointment services, duration, and pricing"
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${stat.color}`}
              >
                {Icon && <Icon className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      stat.isUp ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {stat.trend} {stat.isUp ? "↑" : "↓"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-4">
        {/* Collapsible Filter Panel */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isFilterOpen
              ? "grid-rows-[1fr] opacity-100 mb-4"
              : "grid-rows-[0fr] opacity-0 mb-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="w-full flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs font-medium text-foreground">
                  Filter by Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {lookups.categories.map((c) => (
                      <SelectItem key={c.id} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setPage(1);
                  }}
                  className="h-10"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* DataView Table with Toolbar */}
        <DataView
          data={displayRows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          selectable
          search={{
            placeholder: "Search by id or employee name...",
            value: search,
            onChange: (val) => {
              setSearch(val);
              setPage(1);
            },
          }}
          filter={{
            label: "Filter",
            onClick: () => setIsFilterOpen((prev) => !prev),
          }}
          onRefresh={() => {
            refetch();
            toast.success("Services refreshed!");
          }}
          onPrint={() => window.print()}
          export={{
            label: "Export",
            onClick: () => toast.success("Exporting services..."),
          }}
          addButton={{
            label: "Add",
            onClick: () => navigate("/dashboard/appointments/services/add"),
          }}
          columns={columns}
          rowActionsMenu={rowActionsMenu}
          pagination={{
            page: page,
            totalPages: totalPages,
            onPageChange: setPage,
            prevLabel: "Pre",
            nextLabel: "Next",
          }}
          emptyMessage="No services found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          if (deleteRowId) {
            deleteMutation.mutate(deleteRowId);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
      />
    </div>
  );
}
