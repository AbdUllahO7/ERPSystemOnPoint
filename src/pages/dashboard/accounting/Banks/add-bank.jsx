import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBank, getBranches, getAllCurrencies } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddBank() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bank_Name: "",
      account_Number: "",
      iban: "",
      swift_Code: "",
      currency_Id: "",
      branch_Id: "",
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
    mutationFn: (data) => createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllBanks"]);
      toast.success("Bank created successfully!");
      navigate("/dashboard/accounting/banks");
    },
    onError: (error) => {
      console.error("Failed to create bank", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to create bank!");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add New Bank</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Banks</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add New Bank</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={mutation.isLoading}
            className="px-8"
          >
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Bank Name <span className="text-red-500">*</span></label>
            <Input
              placeholder="Bank Name"
              className="h-11 bg-transparent"
              {...register("bank_Name", { required: true })}
            />
            {errors.bank_Name && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Account Number <span className="text-red-500">*</span></label>
            <Input
              placeholder="Account Number"
              className="h-11 bg-transparent"
              {...register("account_Number", { required: true })}
            />
            {errors.account_Number && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">IBAN</label>
            <Input
              placeholder="IBAN"
              className="h-11 bg-transparent"
              {...register("iban")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Swift Code</label>
            <Input
              placeholder="Swift Code"
              className="h-11 bg-transparent"
              {...register("swift_Code")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Currency <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("currency_Id", { required: true })}
            >
              <option value="">Select Currency</option>
              {currencies.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.currencyCode || c.currency_Name}</option>
              ))}
            </select>
            {errors.currency_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Branch</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("branch_Id")}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}
