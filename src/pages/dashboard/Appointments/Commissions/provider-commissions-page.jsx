import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Calendar as CalendarIcon, Plus } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { PageTitle } from "@/components/common/page-title";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  getProviderCommissionRules,
  createCommissionRule,
  deleteCommissionRule,
  getCommissionLookups,
} from "@/services/appointments";

export default function ProviderCommissionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterService, setFilterService] = useState("all");

  // Form State for Add Commission Rule card
  const [formData, setFormData] = useState({
    providerId: "",
    provider: "",
    serviceId: "",
    service: "",
    type: "Percentage",
    percentage: "",
    startDate: "2026-01-01",
  });

  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["commissionLookups"],
    queryFn: getCommissionLookups,
  });
  const lookups = lookupsData?.data || { providers: [], services: [], types: [] };

  // Params for Rules Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Provider: filterProvider !== "all" ? filterProvider : undefined,
      Service: filterService !== "all" ? filterService : undefined,
    }),
    [page, search, filterProvider, filterService]
  );

  // Commission Rules Query
  const {
    data: rulesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["providerCommissionRules", params],
    queryFn: () => getProviderCommissionRules(params),
  });

  const displayRows = rulesData?.data?.items || [];
  const totalPages = rulesData?.data?.totalPages || 1;

  // Add Rule Mutation
  const addRuleMutation = useMutation({
    mutationFn: (data) => createCommissionRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["providerCommissionRules"]);
      toast.success("Commission rule added successfully!");
      setFormData({
        providerId: "",
        provider: "",
        serviceId: "",
        service: "",
        type: "Percentage",
        percentage: "",
        startDate: "2026-01-01",
      });
    },
    onError: () => {
      toast.error("Failed to add commission rule!");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCommissionRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["providerCommissionRules"]);
      toast.success("Commission rule deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete commission rule!");
      setDeleteRowId(null);
    },
  });

  const handleAddRule = (e) => {
    e?.preventDefault();
    if (!formData.provider) {
      toast.error("Please select a provider");
      return;
    }
    if (!formData.service) {
      toast.error("Please select a service");
      return;
    }
    addRuleMutation.mutate(formData);
  };

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "delete",
            label: "Delete Rule",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-700">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-800">
            {row.original.value}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-700">
            {row.original.startDate}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Provider Commissions"
        infoTooltip="Configure commission rules per service provider and track rule effective dates."
      />

      {/* 2-Column Grid Layout matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Rules Table */}
        <div className="lg:col-span-8">
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
            onFilter={() => setIsFilterOpen(true)}
            isFilterOpen={isFilterOpen}
            onCloseFilter={() => setIsFilterOpen(false)}
            filterContent={
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">
                    Filter by Provider
                  </Label>
                  <Select
                    value={filterProvider}
                    onValueChange={(val) => {
                      setFilterProvider(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {lookups.providers.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">
                    Filter by Service
                  </Label>
                  <Select
                    value={filterService}
                    onValueChange={(val) => {
                      setFilterService(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {lookups.services.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
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
                      setFilterProvider("all");
                      setFilterService("all");
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
        </div>

        {/* Right Side: Add Commission Rule Form Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800">
            Add Commission Rule
          </h2>

          <div className="space-y-4">
            {/* Provider Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Provider
              </Label>
              <Select
                value={formData.providerId}
                onValueChange={(val) => {
                  const item = lookups.providers.find((p) => p.id === val);
                  setFormData({
                    ...formData,
                    providerId: val,
                    provider: item ? item.name : "",
                  });
                }}
              >
                <SelectTrigger className="w-full h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Service
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(val) => {
                  const item = lookups.services.find((s) => s.id === val);
                  setFormData({
                    ...formData,
                    serviceId: val,
                    service: item ? item.name : "",
                  });
                }}
              >
                <SelectTrigger className="w-full h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger className="w-full h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Percentage / Value Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                {formData.type === "Fixed Amount" ? "Amount ($)" : "Percentage"}
              </Label>
              <Input
                placeholder="0%"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: e.target.value })
                }
                className="h-10 border-slate-200 bg-white"
              />
            </div>

            {/* Start Date Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="h-10 border-slate-200 bg-white pr-9"
                />
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleAddRule}
              disabled={addRuleMutation.isPending}
              className="w-full bg-[#0066d1] hover:bg-[#0052a8] text-white py-2.5 h-11 rounded-xl font-medium mt-2 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Rule
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Rule Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="Delete Commission Rule"
        description="Are you sure you want to delete this commission rule? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
