import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageTitle } from "@/components/common/page-title";
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
  getServiceById,
  createService,
  updateService,
  getServiceLookups,
} from "@/services/appointments";

export default function AddEditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    billingMethod: "",
    defaultDuration: 0,
    defaultInsuranceQty: 0,
    costPrice: 0,
    consumerPrice: 0,
    revenueAccount: "",
    expenseAccount: "",
    canBeSold: true,
    requiresContract: true,
    isActive: true,
  });

  // Fetch Lookups
  const { data: lookupsData } = useQuery({
    queryKey: ["serviceLookups"],
    queryFn: getServiceLookups,
  });
  const lookups = lookupsData?.data || {
    categories: [],
    billingMethods: [],
    revenueAccounts: [],
    expenseAccounts: [],
  };

  // Fetch existing service if in edit mode
  const { data: existingData } = useQuery({
    queryKey: ["serviceDetail", id],
    queryFn: () => getServiceById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && existingData?.data) {
      setFormData((prev) => ({
        ...prev,
        ...existingData.data,
      }));
    }
  }, [isEdit, existingData]);

  // Dynamically ensure Select options have the current value
  const categoryOptions = useMemo(() => {
    const list = [...(lookups.categories || [])];
    if (formData.category && !list.some((c) => c.value === formData.category || c.id === formData.category || c.label === formData.category)) {
      list.unshift({
        id: formData.category,
        label: formData.category,
        value: formData.category,
      });
    }
    return list;
  }, [lookups.categories, formData.category]);

  const billingMethodOptions = useMemo(() => {
    const list = [...(lookups.billingMethods || [])];
    if (formData.billingMethod && !list.some((bm) => bm.value === formData.billingMethod || bm.label === formData.billingMethod)) {
      list.unshift({
        label: formData.billingMethod,
        value: formData.billingMethod,
      });
    }
    return list;
  }, [lookups.billingMethods, formData.billingMethod]);

  const revenueAccountOptions = useMemo(() => {
    const list = [...(lookups.revenueAccounts || [])];
    if (formData.revenueAccount && !list.some((ra) => ra.value === formData.revenueAccount || ra.id === formData.revenueAccount || ra.label === formData.revenueAccount)) {
      list.unshift({
        id: formData.revenueAccount,
        label: formData.revenueAccount,
        value: formData.revenueAccount,
      });
    }
    return list;
  }, [lookups.revenueAccounts, formData.revenueAccount]);

  const expenseAccountOptions = useMemo(() => {
    const list = [...(lookups.expenseAccounts || [])];
    if (formData.expenseAccount && !list.some((ea) => ea.value === formData.expenseAccount || ea.id === formData.expenseAccount || ea.label === formData.expenseAccount)) {
      list.unshift({
        id: formData.expenseAccount,
        label: formData.expenseAccount,
        value: formData.expenseAccount,
      });
    }
    return list;
  }, [lookups.expenseAccounts, formData.expenseAccount]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success("Service created successfully!");
      navigate("/dashboard/appointments/services");
    },
    onError: () => toast.error("Failed to create service"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      queryClient.invalidateQueries(["serviceDetail", id]);
      toast.success("Service updated successfully!");
      navigate("/dashboard/appointments/services");
    },
    onError: () => toast.error("Failed to update service"),
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Page Header */}
      <PageTitle
        title={isEdit ? "Edit Service" : "Add Service"}
        infoText="Configure service details, duration, pricing, and accounting rules"
        breadcrumbs={[
          { label: "Services", href: "/dashboard/appointments/services" },
          { label: isEdit ? "Edit Service" : "Add Service" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/appointments/services")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {/* Main Form Card (3x3 Grid) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        {/* Row 1: Name, Category, Billing Method */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(val) => handleChange("category", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id || c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Billing Method
            </Label>
            <Select
              value={formData.billingMethod}
              onValueChange={(val) => handleChange("billingMethod", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Billing Method" />
              </SelectTrigger>
              <SelectContent>
                {billingMethodOptions.map((bm) => (
                  <SelectItem key={bm.value} value={bm.value}>
                    {bm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Default Duration, Default Insurance Qty, Cost Price */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Default Duration (min)
            </Label>
            <Input
              type="number"
              value={formData.defaultDuration}
              onChange={(e) =>
                handleChange("defaultDuration", Number(e.target.value))
              }
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Default Insurance Qty
            </Label>
            <Input
              type="number"
              value={formData.defaultInsuranceQty}
              onChange={(e) =>
                handleChange("defaultInsuranceQty", Number(e.target.value))
              }
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Cost Price
            </Label>
            <Input
              type="number"
              value={formData.costPrice}
              onChange={(e) =>
                handleChange("costPrice", Number(e.target.value))
              }
              placeholder="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Row 3: Consumer Price, Revenue Account, Expense Account */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Consumer Price
            </Label>
            <Input
              type="number"
              value={formData.consumerPrice}
              onChange={(e) =>
                handleChange("consumerPrice", Number(e.target.value))
              }
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Revenue Account
            </Label>
            <Select
              value={formData.revenueAccount}
              onValueChange={(val) => handleChange("revenueAccount", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Revenue Account" />
              </SelectTrigger>
              <SelectContent>
                {revenueAccountOptions.map((ra) => (
                  <SelectItem key={ra.id || ra.value} value={ra.value}>
                    {ra.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Expense Account
            </Label>
            <Select
              value={formData.expenseAccount}
              onValueChange={(val) => handleChange("expenseAccount", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Expense Account" />
              </SelectTrigger>
              <SelectContent>
                {expenseAccountOptions.map((ea) => (
                  <SelectItem key={ea.id || ea.value} value={ea.value}>
                    {ea.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bottom Toggles / Switches Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Toggle 1: Can Be Sold */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all",
              formData.canBeSold
                ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                : "border-border bg-card"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                formData.canBeSold ? "text-primary" : "text-foreground"
              )}
            >
              Can Be Sold
            </span>
            <Switch
              checked={formData.canBeSold}
              onCheckedChange={(val) => handleChange("canBeSold", val)}
            />
          </div>

          {/* Toggle 2: Requires contract */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all",
              formData.requiresContract
                ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                formData.requiresContract ? "text-primary font-semibold" : "text-foreground"
              )}
            >
              Requires contract
            </span>
            <Switch
              checked={formData.requiresContract}
              onCheckedChange={(val) => handleChange("requiresContract", val)}
            />
          </div>

          {/* Toggle 3: Active */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all",
              formData.isActive
                ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                : "border-border bg-card"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                formData.isActive ? "text-primary" : "text-foreground"
              )}
            >
              Active
            </span>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(val) => handleChange("isActive", val)}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
