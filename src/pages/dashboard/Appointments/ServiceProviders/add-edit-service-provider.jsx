import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  DAYS_OF_WEEK,
} from "@/services/appointments";

export default function AddEditServiceProvider() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    phone: "",
    active: true,
    workingDays: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  });

  // Fetch provider data if in edit mode
  const { data: providerData, isLoading } = useQuery({
    queryKey: ["serviceProvider", id],
    queryFn: () => getServiceProviderById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (providerData?.data) {
      const p = providerData.data;
      setFormData({
        employeeId: p.employeeId || "",
        name: p.name || "",
        phone: p.phone || "",
        active: p.status ? p.status.toLowerCase() === "active" : true,
        workingDays: Array.isArray(p.workingDays)
          ? p.workingDays
          : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      });
    }
  }, [providerData]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateServiceProvider(id, data) : createServiceProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceProviders"]);
      queryClient.invalidateQueries(["serviceProvider", id]);
      toast.success(
        isEdit
          ? "Service provider updated successfully!"
          : "Service provider created successfully!"
      );
      navigate("/dashboard/appointments/service-providers");
    },
    onError: () => {
      toast.error(
        isEdit
          ? "Failed to update service provider!"
          : "Failed to create service provider!"
      );
    },
  });

  const handleToggleDay = (dayId) => {
    setFormData((prev) => {
      const current = prev.workingDays || [];
      const exists = current.includes(dayId);
      const updated = exists
        ? current.filter((d) => d !== dayId)
        : [...current, dayId];
      return { ...prev, workingDays: updated };
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Please enter provider name");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumbs & Top Right Save Button */}
      <PageTitle
        title={isEdit ? "Edit Service Provider" : "Add Service Provider"}
        breadcrumbs={[
          { label: "Service Provider", href: "/dashboard/appointments/service-providers" },
          {
            label: isEdit ? "Edit Service Provider" : "Add Service Provider",
          },
        ]}
        infoTooltip="Define provider basic information, working days, and availability."
        actions={
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending || isLoading}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 py-2 rounded-lg font-medium shadow-sm transition-all"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        }
      />

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        {/* Row 1: 3 Columns (Employee ID, Name, Phone) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Employee ID
            </Label>
            <Input
              placeholder="Emp-101"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Phone
            </Label>
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 2: Active toggle card */}
        <div
          className={cn(
            "rounded-xl border p-4 flex items-center justify-between max-w-sm transition-all",
            formData.active
              ? "border-[#0066d1]/40 bg-blue-50/10"
              : "border-slate-200/80 bg-white"
          )}
        >
          <span className="text-sm font-medium text-slate-700">Active</span>
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, active: checked })
            }
          />
        </div>

        {/* Row 3: Working Days */}
        <div className="space-y-3 pt-2">
          <Label className="text-sm font-semibold text-slate-800">
            Working Days
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = formData.workingDays?.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleToggleDay(day.id)}
                  className={`min-w-[80px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all text-center border ${
                    isSelected
                      ? "border-[#0066d1] text-[#0066d1] bg-blue-50/50 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
