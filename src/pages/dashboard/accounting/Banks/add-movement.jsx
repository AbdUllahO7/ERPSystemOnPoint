import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createBankTransaction,
  getLeafAccounts,
  getBankById,
  getAllBanks,
  getAllCurrencies,
  getAllCostCenters,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddMovement() {
  const { id } = useParams(); // Optional Bank ID
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      voucherType: "",
      counter_Account_Id: "",
      costCenter_id: "",
      currency_Id: "",
      amount: "",
      description: "",
      bank_Id: id || "",
    },
  });

  const { data: bankResponse } = useQuery({
    queryKey: ["getBankById", id],
    queryFn: () => getBankById(id),
    enabled: !!id,
  });

  const { data: allBanksResponse } = useQuery({
    queryKey: ["getAllBanks"],
    queryFn: () => getAllBanks({ PageNumber: 1, PageSize: 100 }),
    enabled: !id,
  });

  const bank = bankResponse?.data || {};
  const banks = allBanksResponse?.data?.items || [];

  const { data: leafAccountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });

  const accounts = leafAccountsData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (data) => createBankTransaction(data),
    onSuccess: () => {
      toast.success("Movement added successfully!");
      if (id) {
        queryClient.invalidateQueries(["getBankById", id]);
        navigate(`/dashboard/accounting/banks/${id}`);
      } else {
        queryClient.invalidateQueries(["getAllBankTransactions"]);
        navigate(`/dashboard/accounting/banks/transactions`);
      }
    },
    onError: (error) => {
      console.error("Failed to create movement", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to create movement!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      bank_Id: id || data.bank_Id,
      counter_Account_Id: data.counter_Account_Id,
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount),
      description: data.description,
      voucherType: data.voucherType,
      currency_Id: data.currency_Id,
      costCenter_id: data.costCenter_id || null,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Movement</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Banks</span>
            <span>/</span>
            {id && (
              <>
                <span>Bank Details</span>
                <span>/</span>
              </>
            )}
            <span className="font-medium text-foreground">Add Movement</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isLoading}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {!id && (
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-semibold text-foreground">Bank <span className="text-red-500">*</span></label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                {...register("bank_Id", { required: true })}
              >
                <option value="">Select Bank</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>{b.bankName}</option>
                ))}
              </select>
              {errors.bank_Id && <span className="text-red-500 text-xs">Required</span>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Date <span className="text-red-500">*</span></label>
            <Input
              type="date"
              className="h-11 bg-transparent"
              {...register("date", { required: true })}
            />
            {errors.date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Type <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("voucherType", { required: true })}
            >
              <option value="">Select Type</option>
              <option value="Receipt_Voucher">Receipt</option>
              <option value="Payment_Voucher">Exchange</option>
              <option value="Transfer_Voucher">Transfer</option>
            </select>
            {errors.voucherType && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Counter Account <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("counter_Account_Id", { required: true })}
            >
              <option value="">Select Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.counter_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Currency <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("currency_Id", { required: true })}
            >
              <option value="">Select Currency</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.currencyCode || c.currency_Name}</option>
              ))}
            </select>
            {errors.currency_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cost Center</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("costCenter_id")}
            >
              <option value="">Select Cost Center</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>{cc.cost_Center_Name || cc.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Amount <span className="text-red-500">*</span></label>
            <Input
              type="number"
              min="0"
              step="0.01"
              className="h-11 bg-transparent"
              {...register("amount", { required: true })}
            />
            {errors.amount && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2 md:col-span-3">
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
