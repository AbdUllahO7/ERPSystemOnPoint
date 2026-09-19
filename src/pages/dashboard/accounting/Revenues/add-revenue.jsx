import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("revenue_Account_Id", { required: true })}
            >
              <option value="">Select Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.revenue_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Collection Account <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("collection_Account_Id", { required: true })}
            >
              <option value="">Select Collection Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.collection_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Customer <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("customer_Id", { required: true })}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.customerName || `Customer #${c.id.substring(0,4)}`}</option>
              ))}
            </select>
            {errors.customer_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cost Center <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("costCenter_Id", { required: true })}
            >
              <option value="">Select Cost Center</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>{cc.cost_Center_Name || cc.name}</option>
              ))}
            </select>
            {errors.costCenter_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Amount <span className="text-red-500">*</span></label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-11 bg-transparent"
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
              className="h-11 bg-transparent"
              {...register("tax_Amount", { required: true })}
            />
            {errors.tax_Amount && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("status")}
            >
              <option value="Pending">Pending</option>
              <option value="Collected">Collected</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Due Date <span className="text-red-500">*</span></label>
            <Input
              type="datetime-local"
              className="h-11 bg-transparent"
              {...register("due_Date", { required: true })}
            />
            {errors.due_Date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Collected Date <span className="text-red-500">*</span></label>
            <Input
              type="datetime-local"
              className="h-11 bg-transparent"
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
