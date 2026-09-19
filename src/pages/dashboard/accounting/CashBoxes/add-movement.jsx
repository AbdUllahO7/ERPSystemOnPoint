import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCashBoxTransaction,
  getLeafAccounts,
  getCashBoxById,
  getAllCashBoxes,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddMovement() {
  const { id } = useParams(); // Optional Cash box ID
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
      counter_id: "",
      amount: "",
      cash_Box_ID: id || "",
    },
  });

  const { data: cashBoxResponse } = useQuery({
    queryKey: ["getCashBoxById", id],
    queryFn: () => getCashBoxById(id),
    enabled: !!id,
  });

  const { data: allCashBoxesResponse } = useQuery({
    queryKey: ["getAllCashBoxes"],
    queryFn: () => getAllCashBoxes({ PageNumber: 1, PageSize: 100 }),
    enabled: !id,
  });

  const cashBox = cashBoxResponse?.data || {};
  const cashBoxes = allCashBoxesResponse?.data?.items || [];

  const { data: leafAccountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const accounts = leafAccountsData?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (data) => createCashBoxTransaction(data),
    onSuccess: () => {
      toast.success("Movement added successfully!");
      if (id) {
        queryClient.invalidateQueries(["getCashBoxById", id]);
        navigate(`/dashboard/accounting/cash-boxes/${id}`);
      } else {
        queryClient.invalidateQueries(["getAllCashBoxTransactions"]);
        navigate(`/dashboard/accounting/cash-boxes/transactions`);
      }
    },
    onError: (error) => {
      console.error("Failed to create movement", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to create movement!");
    },
  });

  const onSubmit = (data) => {
    let currencyToUse = cashBox.currencyId || null;
    
    if (!id && data.cash_Box_ID) {
      const selectedBox = cashBoxes.find(b => b.id === data.cash_Box_ID);
      if (selectedBox) {
        currencyToUse = selectedBox.currencyId;
      }
    }

    const payload = {
      cash_Box_ID: id || data.cash_Box_ID,
      date: new Date(data.date).toISOString(),
      counter_id: data.counter_id,
      amount: parseFloat(data.amount),
      description: data.description,
      currency_Id: currencyToUse,
      voucherType: data.voucherType,
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
            <span>Cash Boxes</span>
            <span>/</span>
            {id && (
              <>
                <span>Cash Box Details</span>
                <span>/</span>
              </>
            )}
            <span className="font-medium text-foreground">Add Movement</span>
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
          
          {!id && (
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-semibold text-foreground">Cash Box</label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                {...register("cash_Box_ID", { required: true })}
              >
                <option value="">Select Cash Box</option>
                {cashBoxes.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.cash_Box_ID && <span className="text-red-500 text-xs">Required</span>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Date</label>
            <Input
              type="date"
              className="h-11 bg-transparent"
              {...register("date", { required: true })}
            />
            {errors.date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Type</label>
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
            <label className="text-sm font-semibold text-foreground">Counter Account</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("counter_id", { required: true })}
            >
              <option value="">Counter Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.counter_id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Amount</label>
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
