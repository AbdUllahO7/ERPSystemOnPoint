import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDirectRevenue,
  getLeafAccounts,
  getAllCostCenters,
  getAllCustomers,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddRevenue() {
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      revenue_Account_Id: "",
      customer_Id: "",
      costCenter_Id: "",
      amount: "",
      tax_Amount: "0",
      status: "Pending",
      collection_Account_Id: "",
      due_Date: new Date().toISOString().split("T")[0],
      collected_Date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const { data: leafAccountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: customersData } = useQuery({
    queryKey: ["getAllCustomers"],
    queryFn: () => getAllCustomers({ pageNumber: 1, pageSize: 100 }),
  });

  const accounts = leafAccountsData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const customers = customersData?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (data) => createDirectRevenue(data),
    onSuccess: () => {
      toast.success("Revenue created successfully!");
      navigate("/dashboard/accounting/revenues");
    },
    onError: (error) => {
      console.error("Failed to add revenue", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to add revenue!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      revenue_Account_Id: data.revenue_Account_Id,
      customer_Id: data.customer_Id,
      costCenter_Id: data.costCenter_Id,
      project_Id: null, // As requested, set to null for now
      amount: parseFloat(data.amount) || 0,
      tax_Amount: parseFloat(data.tax_Amount) || 0,
      status: data.status,
      collection_Account_Id: data.collection_Account_Id,
      due_Date: new Date(data.due_Date).toISOString(),
      collected_Date: new Date(data.collected_Date).toISOString(),
      description: data.description,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Direct Revenue</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Revenues</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add Revenue</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={mutation.isPending}
            className="px-8"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Revenue Account <span className="text-red-500">*</span></label>
            <Controller
              name="revenue_Account_Id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.account_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.revenue_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Collection Account <span className="text-red-500">*</span></label>
            <Controller
              name="collection_Account_Id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Collection Account" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.account_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.collection_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Customer <span className="text-red-500">*</span></label>
            <Controller
              name="customer_Id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name || c.customerName || `Customer #${c.id.substring(0,4)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cost Center <span className="text-red-500">*</span></label>
            <Controller
              name="costCenter_Id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Cost Center" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {costCenters.map((cc) => (
                      <SelectItem key={cc.id} value={String(cc.id)}>
                        {cc.cost_Center_Name || cc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.costCenter_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Amount <span className="text-red-500">*</span></label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-9 bg-transparent"
              {...register("amount", { required: true })}
            />
            {errors.amount && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Tax Amount <span className="text-red-500">*</span></label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-9 bg-transparent"
              {...register("tax_Amount", { required: true })}
            />
            {errors.tax_Amount && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Collected">Collected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Due Date <span className="text-red-500">*</span></label>
            <Input
              type="datetime-local"
              className="h-9 bg-transparent"
              {...register("due_Date", { required: true })}
            />
            {errors.due_Date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Collected Date <span className="text-red-500">*</span></label>
            <Input
              type="datetime-local"
              className="h-9 bg-transparent"
              {...register("collected_Date", { required: true })}
            />
            {errors.collected_Date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              placeholder="Description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              {...register("description")}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
