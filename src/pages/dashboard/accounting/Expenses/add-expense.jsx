import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createExpense,
  getLeafAccounts,
  getAllCostCenters,
  getAllCurrencies,
  getCashLookUp,
  getCardLookUp,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddExpense() {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState("Cash");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      expense_Date: new Date().toISOString().split("T")[0],
      expense_No: "",
      expense_Account_Id: "",
      costCenter_Id: "",
      paid_To_Account_Id: "",
      amount: "",
      tax_Amount: "0",
      currency_Id: "",
      payment_Account_Id: "",
      status: "Draft",
      note: "",
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

  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: cashData } = useQuery({
    queryKey: ["getCashLookUp"],
    queryFn: () => getCashLookUp({ pageNumber: 1, pageSize: 100 }),
    enabled: paymentType === "Cash",
  });

  const { data: cardData } = useQuery({
    queryKey: ["getCardLookUp"],
    queryFn: () => getCardLookUp({ pageNumber: 1, pageSize: 100 }),
    enabled: paymentType === "Card",
  });

  const accounts = leafAccountsData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];
  
  const cashAccounts = cashData?.data?.items || (Array.isArray(cashData?.data) ? cashData.data : []);
  const cardAccounts = cardData?.data?.items || (Array.isArray(cardData?.data) ? cardData.data : []);
  
  const paymentAccounts = paymentType === "Cash" ? cashAccounts : cardAccounts;

  const mutation = useMutation({
    mutationFn: (data) => createExpense(data),
    onSuccess: () => {
      toast.success("Expense created successfully!");
      navigate(-1);
    },
    onError: (error) => {
      console.error("Failed to add expense", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to add expense!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      expense_Date: new Date(data.expense_Date).toISOString(),
      expense_No: data.expense_No,
      expense_Account_Id: data.expense_Account_Id,
      costCenter_Id: data.costCenter_Id || null,
      paid_To_Account_Id: data.paid_To_Account_Id,
      amount: parseFloat(data.amount) || 0,
      tax_Amount: parseFloat(data.tax_Amount) || 0,
      currency_Id: data.currency_Id,
      payment_Account_Id: data.payment_Account_Id,
      status: data.status,
      note: data.note,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Expense</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Expenses</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add Expense</span>
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
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="space-y-2 lg:col-span-3">
            <label className="text-sm font-semibold text-foreground">Expense Number <span className="text-red-500">*</span></label>
            <Input
              placeholder="e.g. EXP-1002"
              className="h-11 bg-transparent max-w-sm"
              {...register("expense_No", { required: true })}
            />
            {errors.expense_No && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Expense Account <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("expense_Account_Id", { required: true })}
            >
              <option value="">Select Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.expense_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Paid To Account <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("paid_To_Account_Id", { required: true })}
            >
              <option value="">Select Paid To Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_Name}</option>
              ))}
            </select>
            {errors.paid_To_Account_Id && <span className="text-red-500 text-xs">Required</span>}
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

          <div className="space-y-2 lg:col-span-3 border-t pt-4 mt-2">
            <label className="text-sm font-semibold text-foreground mb-4 block">Payment Method</label>
            <div className="flex flex-col md:flex-row gap-6">
              
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cash"
                    name="paymentType"
                    value="Cash"
                    checked={paymentType === "Cash"}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input bg-transparent"
                  />
                  <label htmlFor="cash" className="text-sm font-medium leading-none cursor-pointer">
                    Cash
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="card"
                    name="paymentType"
                    value="Card"
                    checked={paymentType === "Card"}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input bg-transparent"
                  />
                  <label htmlFor="card" className="text-sm font-medium leading-none cursor-pointer">
                    Card
                  </label>
                </div>
              </div>

              <div className="w-full max-w-sm">
                <select
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  {...register("payment_Account_Id", { required: true })}
                >
                  <option value="">Select {paymentType} Account</option>
                  {paymentAccounts.map((pa) => (
                    <option key={pa.id} value={pa.id}>{pa.name}</option>
                  ))}
                </select>
                {errors.payment_Account_Id && <span className="text-red-500 text-xs mt-1 block">Payment Account is required</span>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Date <span className="text-red-500">*</span></label>
            <Input
              type="datetime-local"
              className="h-11 bg-transparent"
              {...register("expense_Date", { required: true })}
            />
            {errors.expense_Date && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              {...register("status")}
            >
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
            </select>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <label className="text-sm font-semibold text-foreground">Note</label>
            <textarea
              placeholder="Note..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              {...register("note")}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
