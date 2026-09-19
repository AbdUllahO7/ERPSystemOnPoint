import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCashBox,
  getBranches,
  getAllCurrencies,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddCashBox() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cash_Box_Name: "",
      cash_Box_Code: "",
      branch_id: "",
      currancy_id: "",
    },
  });

  const { data: branchesData } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });
  
  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const branches = branchesData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (data) => createCashBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllCashBoxes"]);
      toast.success("Cash box created successfully!");
      navigate("/dashboard/accounting/cash-boxes");
    },
    onError: (error) => {
      console.error("Failed to create cash box", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to create cash box!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      cash_Box_Name: data.cash_Box_Name,
      cash_Box_Code: data.cash_Box_Code,
      branch_id: data.branch_id || null,
      currancy_id: data.currancy_id || null,
      responseable_Person: null, // As requested, set to null for now
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Cash Box</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Cash Boxes</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add Cash Box</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isPending}
          className="px-8"
        >
          {mutation.isPending ? "Saving..." : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cash Box Name <span className="text-red-500">*</span></label>
            <Input
              placeholder="Cash Box Name"
              className="h-11 bg-transparent"
              {...register("cash_Box_Name", { required: true })}
            />
            {errors.cash_Box_Name && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Code <span className="text-red-500">*</span></label>
            <Input
              placeholder="Code"
              className="h-11 bg-transparent"
              {...register("cash_Box_Code", { required: true })}
            />
            {errors.cash_Box_Code && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Branch <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("branch_id", { required: true })}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
            {errors.branch_id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Currency <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("currancy_id", { required: true })}
            >
              <option value="">Select Currency</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.currency_Name || c.currencyCode}</option>
              ))}
            </select>
            {errors.currancy_id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          {/* <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Responsible Person</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              disabled
            >
              <option value="">Responsible Person</option>
            </select>
          </div> */}

        </form>
      </div>
    </div>
  );
}
