import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "@/components/common/dynamic-modal";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getResourceById,
  changeResourceStatus,
  getResourceLookups,
} from "@/services/resources";

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Active");

  // Resource Query
  const { data: resourceData, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
  });
  const resource = resourceData?.data || {};

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || { statuses: [] };

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeResourceStatus({ id, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["resource", id]);
      queryClient.invalidateQueries(["resources"]);
      toast.success(res?.message || "Resource status updated!");
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    },
  });

  const handleStatusSubmit = (e) => {
    e?.preventDefault();
    statusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "active":
        return "bg-emerald-50 text-emerald-600";
      case "rented":
      case "leased":
        return "bg-blue-50 text-[#0066d1]";
      case "undermaintenance":
      case "maintenance":
        return "bg-amber-50 text-amber-600";
      case "outofservice":
      case "inactive":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-emerald-50 text-emerald-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title="Resource Details"
          breadcrumbLinks={[
            { label: "Resources", href: "/dashboard/resources" },
            { label: "Resource Details" },
          ]}
          infoTooltip="Specifications, capacity allocation, ownership model, and asset assignment for this resource."
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setNewStatus(resource.status || "Active");
            setIsStatusModalOpen(true);
          }}
          className="h-10 gap-2 rounded-xl border-[#0066d1]/40 text-[#0066d1] bg-white hover:bg-blue-50/50 text-xs font-semibold px-4 cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-[#0066d1]" />
          Change Status
        </Button>
      </div>

      {/* Details Grid (Left 8 cols, Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">
            Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-800">Code / Ref</p>
              <p className="text-xs text-slate-500 mt-1">
                {resource.code || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Resource Name</p>
              <p className="text-xs text-slate-500 mt-1">
                {resource.name || resource.fullName || "Unnamed Resource"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Total Capacity</p>
              <p className="text-xs text-slate-500 mt-1">
                {resource.capacity || resource.numericCapacity || 20} Seats
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Ownership Model</p>
              <p className="text-xs text-slate-500 mt-1">
                {resource.ownership || resource.fullOwnership || "Owned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Supplier / Fixed Asset</p>
              <p className="text-xs text-slate-500 mt-1">
                {resource.supplierAsset || resource.supplierAssetName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Daily Rental Cost</p>
              <p className="text-xs text-slate-500 mt-1">
                ${resource.dailyRentalCost ?? 0}
              </p>
            </div>
          </div>

          {resource.contractStartDate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Contract Start</p>
                <p className="text-xs text-slate-500 mt-1">
                  {resource.contractStartDate}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Contract End</p>
                <p className="text-xs text-slate-500 mt-1">
                  {resource.contractEndDate || "Ongoing"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Status & Notes (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">
            Status & Info
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1">
                Status
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                  resource.status
                )}`}
              >
                {resource.status || "Active"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1">
                Notes / Specs
              </p>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {resource.notes || "No additional specifications provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Change Resource Status"
        icon={RefreshCcw}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {lookups.statuses.map((st) => {
                  const val = typeof st === "string" ? st : (st.id || st.name);
                  const label = typeof st === "string" ? st : st.name;
                  return (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={statusMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              {statusMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              Save
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}
