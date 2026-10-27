import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  getServiceProviderLookups,
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
    startTime: "09:00",
    endTime: "17:00",
    active: true,
    workingDays: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
  });

  // Lookups Query for HR Employees
  const { data: lookupsData } = useQuery({
    queryKey: ["serviceProviderLookups"],
    queryFn: getServiceProviderLookups,
  });
  const employees = lookupsData?.data?.employees || [];

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
        employeeId: p.hrEmployeeId || p.employeeId || "",
        name: p.name || "",
        phone: p.phone || "",
        startTime: "09:00",
        endTime: "17:00",
        active: p.status ? p.status.toLowerCase() === "active" : true,
        workingDays: Array.isArray(p.workingDays) && p.workingDays.length > 0
          ? p.workingDays
          : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
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

  const handleSelectEmployee = (empId) => {
    if (!empId || empId === "none") {
      setFormData((prev) => ({
        ...prev,
        employeeId: "",
      }));
      return;
    }
    const selected = employees.find((e) => e.id === empId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        employeeId: selected.id,
        name: selected.fullName || selected.label || prev.name,
        phone: selected.phone || prev.phone,
      }));
    } else {
      setFormData((prev) => ({ ...prev, employeeId: empId }));
    }
  };

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
      toast.error("Please enter provider name or select an employee");
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
        infoTooltip="Define provider basic information, weekly schedule, and working hours."
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
        {/* Row 1: Select Employee, Name, Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Select HR Employee
            </Label>
            {employees.length > 0 ? (
              <Select
                value={formData.employeeId || "none"}
                onValueChange={handleSelectEmployee}
              >
                <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]">
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Independent Provider)</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.label} {emp.code ? `(#${emp.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Employee UUID / ID"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Provider Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Dr. Ahmed"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Phone Number
            </Label>
            <Input
              placeholder="e.g. +966 50 123 4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 2: Working Hours & Active Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Work Start Time
            </Label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              Work End Time
            </Label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div
            className={cn(
              "rounded-xl border p-3 flex items-center justify-between h-11 transition-all",
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
        </div>

        {/* Row 3: Working Days */}
        <div className="space-y-3 pt-2">
          <Label className="text-sm font-semibold text-slate-800">
            Working Days (أيام العمل)
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
                      ? "border-[#0066d1] text-[#0066d1] bg-blue-50/50 shadow-xs font-semibold"
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
