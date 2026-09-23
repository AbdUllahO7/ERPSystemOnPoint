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

  // Form state matching Image 2
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "0",
    status: "",
    ownership: "",
    fixedAsset: "",
    notes: "",
  });

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
        address: r.address || r.fullAddress || "",
        capacity: String(r.numericCapacity || r.capacity || 0),
        status: r.status || "",
        ownership: r.ownership || r.fullOwnership || "",
        fixedAsset: r.fixedAsset || "",
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
    onError: () => {
      toast.error(isEdit ? "Failed to update resource" : "Failed to create resource");
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

      {/* Reservation Info / Resource Info Card matching Image 2 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800">
          Reservation Info
        </h2>

        {/* Row 1: Name, Address, Total Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Name
            </Label>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Address
            </Label>
            <Select
              value={formData.address}
              onValueChange={(val) => handleInputChange("address", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Address" />
              </SelectTrigger>
              <SelectContent>
                {lookups.addresses.map((addr) => (
                  <SelectItem key={addr.id} value={addr.name}>
                    {addr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Total Capacity
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 2: Status, Ownership, Fixed Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleInputChange("status", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {lookups.statuses.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Ownership
            </Label>
            <Select
              value={formData.ownership}
              onValueChange={(val) => handleInputChange("ownership", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Ownership" />
              </SelectTrigger>
              <SelectContent>
                {lookups.ownerships.map((o) => (
                  <SelectItem key={o.id} value={o.name}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Fixed Asset
            </Label>
            <Select
              value={formData.fixedAsset}
              onValueChange={(val) => handleInputChange("fixedAsset", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Fixed Asset" />
              </SelectTrigger>
              <SelectContent>
                {lookups.fixedAssets.map((fa) => (
                  <SelectItem key={fa.id} value={fa.name}>
                    {fa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Notes
          </Label>
          <Textarea
            rows={4}
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
          />
        </div>
      </div>
    </form>
  );
}
