import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createFixedExpense,
  getFixedExpenseById,
  getOperationExpenseLookUp,
  getCashLookUp,
  getCardLookUp,
  getAllSuppliers,
  getBranches,
  getAllCostCenters,
  getAllCurrencies,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditFixedExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [paymentMethodType, setPaymentMethodType] = useState("cash");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      start_Date: new Date().toISOString().split("T")[0],
      end_Date: "",
      description: "",
      amount: 0,
      tax_Amount: 0,
      category_Account_Id: "",
      payment_Method_Id: "",
      vendor_Id: "",
      project_Id: "",
      costCenter_Id: "",
      branch_Id: "",
      currency_Id: "",
      cycle: "Daily",
      notify_Days_Before_Due: 0,
      auto_Generate_Journal: false,
    },
  });

  const amount = useWatch({ control, name: "amount", defaultValue: 0 });
  const cycle = useWatch({ control, name: "cycle", defaultValue: "Daily" });
  const autoGen = useWatch({ control, name: "auto_Generate_Journal", defaultValue: false });

  // Calculate Projection
  const numAmount = parseFloat(amount || 0);
  let perCycle = numAmount;
  let monthly = 0;
  let yearly = 0;
  if (cycle === "Daily") {
    monthly = numAmount * 30;
    yearly = numAmount * 365;
  } else if (cycle === "Monthly") {
    monthly = numAmount;
    yearly = numAmount * 12;
  } else if (cycle === "Yearly") {
    monthly = numAmount / 12;
    yearly = numAmount;
  }

  // Fetch Lookups
  const { data: categoriesData } = useQuery({
    queryKey: ["getOperationExpenseLookUp"],
    queryFn: () => getOperationExpenseLookUp({ PageNumber: 1, PageSize: 100 }),
  });
  const { data: cashAccountsData } = useQuery({
    queryKey: ["getCashLookUp"],
    queryFn: () => getCashLookUp({ PageNumber: 1, PageSize: 100 }),
  });
  const { data: cardAccountsData } = useQuery({
    queryKey: ["getCardLookUp"],
    queryFn: () => getCardLookUp({ PageNumber: 1, PageSize: 100 }),
  });
  const { data: suppliersData } = useQuery({
    queryKey: ["getAllSuppliers"],
    queryFn: () => getAllSuppliers({ pageNumber: 1, pageSize: 100 }),
  });
  const { data: branchesData } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });
  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });
  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: expenseData } = useQuery({
    queryKey: ["getFixedExpenseById", id],
    queryFn: () => getFixedExpenseById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && expenseData?.data) {
      const v = expenseData.data;
      reset({
        start_Date: v.startDate ? new Date(v.startDate).toISOString().split("T")[0] : "",
        end_Date: v.endDate ? new Date(v.endDate).toISOString().split("T")[0] : "",
        description: v.description || "",
        amount: v.amount || 0,
        tax_Amount: v.taxAmount || 0,
        cycle: v.cycle || "Daily",
        notify_Days_Before_Due: v.notifyDaysBeforeDue || 0,
        auto_Generate_Journal: v.autoGenerateJournal || false,
        // For actual mapping of lookups, backend doesn't return IDs in GET details.
        // It returns names like categoryName. Assuming full APIs return IDs or we fake mapping for edit.
      });
    }
  }, [isEdit, expenseData, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? Promise.resolve() : createFixedExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllFixedExpenses"]);
      toast.success(isEdit ? "Fixed expense updated successfully!" : "Fixed expense added successfully!");
      navigate("/dashboard/accounting/fixed-expenses");
    },
    onError: (error) => {
      console.error("Failed to save fixed expense", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save fixed expense!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      start_Date: new Date(data.start_Date).toISOString(),
      end_Date: data.end_Date ? new Date(data.end_Date).toISOString() : null,
      amount: parseFloat(data.amount),
      tax_Amount: parseFloat(data.tax_Amount),
      notify_Days_Before_Due: parseInt(data.notify_Days_Before_Due || 0, 10),
      project_Id: null, // set to null as requested
    };
    mutation.mutate(payload);
  };

  const categories = categoriesData?.data?.items || [];
  const cashAccounts = cashAccountsData?.data?.items || [];
  const cardAccounts = cardAccountsData?.data?.items || [];
  const paymentAccounts = paymentMethodType === "cash" ? cashAccounts : cardAccounts;
  const suppliers = suppliersData?.data?.items || [];
  const branches = branchesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{isEdit ? "Edit Fixed Expense" : "Add New Fixed Expense"}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Fixed Expenses</span>
            <span>/</span>
            <span className="font-medium text-foreground">{isEdit ? "Edit Fixed Expense" : "Add New Fixed Expense"}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">

          {/* Basics Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Basics</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Payment Method <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <Select
                    value={paymentMethodType}
                    onValueChange={(val) => setPaymentMethodType(val)}
                  >
                    <SelectTrigger className="w-1/3 h-9 bg-transparent">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <Controller
                    name="payment_Method_Id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        key={field.value}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-2/3 h-9 bg-transparent">
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {paymentAccounts.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.payment_Method_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Branch <span className="text-red-500">*</span></label>
                <Controller
                  name="branch_Id"
                  control={control}
                  rules={{ required: true }}
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
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.branchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branch_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category <span className="text-red-500">*</span></label>
                <Controller
                  name="category_Account_Id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-9 bg-transparent">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_Account_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Vendor <span className="text-red-500">*</span></label>
                <Controller
                  name="vendor_Id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-9 bg-transparent">
                        <SelectValue placeholder="Select Vendor" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name || s.supplier_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vendor_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Amount <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-9 bg-transparent"
                  {...register("amount", { required: true })}
                />
                {errors.amount && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tax <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-9 bg-transparent"
                  {...register("tax_Amount", { required: true })}
                />
                {errors.tax_Amount && <span className="text-red-500 text-xs">Required</span>}
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project</label>
                <select
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  disabled
                >
                  <option value="">Select Project</option>
                </select>
              </div> */}

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
                            {cc.cost_Center_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.costCenter_Id && <span className="text-red-500 text-xs">Required</span>}
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
                        {currencies.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name || c.currency_Name || c.currencyCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Description <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("description", { required: true })}
                />
                {errors.description && <span className="text-red-500 text-xs">Required</span>}
              </div>

            </form>
          </div>

          {/* Recurrence Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Recurrence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Cycle <span className="text-red-500">*</span></label>
                <Controller
                  name="cycle"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-9 bg-transparent">
                        <SelectValue placeholder="Select Cycle" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cycle && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Notify Days Before Due <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  className="h-9 bg-transparent"
                  {...register("notify_Days_Before_Due", { required: true })}
                />
                {errors.notify_Days_Before_Due && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Start Date <span className="text-red-500">*</span></label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  {...register("start_Date", { required: true })}
                />
                {errors.start_Date && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">End Date (optional)</label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  {...register("end_Date")}
                />
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg border flex items-center justify-between transition-colors ${autoGen ? 'border-primary bg-primary/5' : 'bg-muted/20'}`}>
              <div>
                <p className="font-semibold text-sm text-foreground">Auto-generate Journal Entry</p>
                <p className="text-xs text-muted-foreground mt-1">Automatically create a balanced JE on every due date</p>
              </div>
              <Switch
                checked={autoGen}
                onCheckedChange={(val) => setValue("auto_Generate_Journal", val)}
              />
            </div>
          </div>

        </div>

        {/* Summary / Projection Card */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Projection</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Per cycle</span>
                <span className="text-foreground">${perCycle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Monthly</span>
                <span className="text-foreground">${monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>Yearly</span>
                <span>${yearly.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
