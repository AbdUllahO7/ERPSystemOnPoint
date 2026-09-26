import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  createResource,
  updateResource,
  getResourceById,
  getResourceLookups,
} from "@/services/resources";

export default function AddEditResourcePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    referenceNumber: "",
    capacity: "20",
    ownership: "Owned",
    fixedAssetId: "",
    supplierId: "",
    contractStartDate: "",
    contractEndDate: "",
    dailyRentalCost: "0",
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || {
    suppliers: [],
    fixedAssets: [],
    statuses: [],
    ownerships: [
      { id: "Owned", name: "Owned" },
      { id: "Leased", name: "Leased / Rented" },
    ],
  };

  // Fetch resource if in edit mode
  const { data: resourceData, isLoading: isFetching } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && resourceData?.data) {
      const r = resourceData.data;
      setFormData({
        name: r.name || r.fullName || "",
        referenceNumber: r.code || r.referenceNumber || "",
        capacity: String(r.numericCapacity || r.capacity || 20),
        ownership: r.rawOwnership || (r.ownership === "Rented" ? "Leased" : "Owned"),
        fixedAssetId: r.fixedAssetId || "",
        supplierId: r.supplierId || "",
        contractStartDate: r.contractStartDate || "",
        contractEndDate: r.contractEndDate || "",
        dailyRentalCost: String(r.dailyRentalCost || 0),
        notes: r.notes || "",
      });
    }
  }, [isEdit, resourceData]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateResource(id, data) : createResource(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["resources"]);
      toast.success(res?.message || (isEdit ? "Resource updated!" : "Resource created!"));
      navigate("/dashboard/resources");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? "Failed to update resource" : "Failed to create resource");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name) {
      toast.error("Please enter resource name");
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const isLeased = formData.ownership === "Leased";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={isEdit ? "Edit Resource" : "Add Resource"}
          breadcrumbLinks={[
            { label: "Resources", href: "/dashboard/resources" },
            { label: isEdit ? "Edit Resource" : "Add Resource" },
          ]}
          infoTooltip="Add facility or equipment resource, define capacity, address location, and ownership."
        />

        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
        >
          {saveMutation.isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Resource Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800">
          Resource Information
        </h2>

        {/* Row 1: Name, Reference Number, Total Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Conference Hall A"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Reference / Code
            </Label>
            <Input
              placeholder="e.g. RES-001"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Total Capacity
            </Label>
            <Input
              type="number"
              placeholder="20"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 2: Ownership, Fixed Asset (if owned) OR Supplier (if leased) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Ownership Model
            </Label>
            <Select
              value={formData.ownership}
              onValueChange={(val) => handleInputChange("ownership", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned (مملوك)</SelectItem>
                <SelectItem value="Leased">Leased / Rented (مستأجر)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLeased ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Linked Fixed Asset (Optional)
              </Label>
              <Select
                value={formData.fixedAssetId || "none"}
                onValueChange={(val) => handleInputChange("fixedAssetId", val === "none" ? "" : val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="Select Fixed Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {lookups.fixedAssets.map((fa) => (
                    <SelectItem key={fa.id} value={String(fa.id)}>
                      {fa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Supplier / Landlord
              </Label>
              <Select
                value={formData.supplierId || "none"}
                onValueChange={(val) => handleInputChange("supplierId", val === "none" ? "" : val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Supplier --</SelectItem>
                  {lookups.suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isLeased && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Daily Rental Cost
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.dailyRentalCost}
                onChange={(e) => handleInputChange("dailyRentalCost", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>
          )}
        </div>

        {/* Row 3 (Conditional for Leased): Contract Start & End Date */}
        {isLeased && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Contract Start Date
              </Label>
              <Input
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => handleInputChange("contractStartDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Contract End Date
              </Label>
              <Input
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => handleInputChange("contractEndDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>
        )}

        {/* Row 4: Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Notes
          </Label>
          <Textarea
            rows={4}
            placeholder="Specifications, location guidelines, or notes..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
          />
        </div>
      </div>
    </form>
  );
}
