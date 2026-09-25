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
    control,
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
              className="h-9 bg-transparent"
              {...register("bank_Name", { required: true })}
            />
            {errors.bank_Name && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Account Number <span className="text-red-500">*</span></label>
            <Input
              placeholder="Account Number"
              className="h-9 bg-transparent"
              {...register("account_Number", { required: true })}
            />
            {errors.account_Number && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">IBAN</label>
            <Input
              placeholder="IBAN"
              className="h-9 bg-transparent"
              {...register("iban")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Swift Code</label>
            <Input
              placeholder="Swift Code"
              className="h-9 bg-transparent"
              {...register("swift_Code")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Currency <span className="text-red-500">*</span></label>
            <Controller
              name="currency_Id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {currencies.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name || c.currencyCode || c.currency_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.currency_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Branch</label>
            <Controller
              name="branch_Id"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
