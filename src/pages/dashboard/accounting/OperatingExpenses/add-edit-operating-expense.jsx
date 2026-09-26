import React, { useEffect, useState } from "react";
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
import { Info, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createOperationExpense,
  getOperationExpenseLookUp,
  getCashLookUp,
  getCardLookUp,
  getAllSuppliers,
  getBranches,
  getAllCostCenters,
  getAllCurrencies,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditOperatingExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [paymentMethodType, setPaymentMethodType] = useState("cash");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      taxAmount: 0,
      categoryAccountId: "",
      paymentAccountId: "",
      vendorId: "",
      projectId: "",
      costCenterId: "",
      branchId: "",
      currencyId: "",
    },
  });

  const amount = useWatch({ control, name: "amount", defaultValue: 0 });
  const taxAmount = useWatch({ control, name: "taxAmount", defaultValue: 0 });
  const totalAmount = parseFloat(amount || 0) + parseFloat(taxAmount || 0);

  // Data Fetching
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

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? Promise.resolve() /* update api here */ : createOperationExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllOperationExpenses"]);
      toast.success(isEdit ? "Operating expense updated successfully!" : "Operating expense added successfully!");
      navigate("/dashboard/accounting/operating-expenses");
    },
    onError: (error) => {
      console.error("Failed to save expense", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save operating expense!");
    },
  });

  const onSubmit = (data) => {
    // format date as ISO
    const payload = {
      ...data,
      expenseDate: new Date(data.expenseDate).toISOString(),
      amount: parseFloat(data.amount),
      taxAmount: parseFloat(data.taxAmount),
      projectId: null,
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
  // Fake projects
  // const projects = [{ id: "proj-1", name: "Project Alpha" }, { id: "proj-2", name: "Project Beta" }];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add New Operating Expense</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Operating Expenses</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add New Operating Expense</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Form Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Date <span className="text-red-500">*</span></label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  {...register("expenseDate", { required: true })}
                />
                {errors.expenseDate && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category <span className="text-red-500">*</span></label>
                <Controller
                  name="categoryAccountId"
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
                {errors.categoryAccountId && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Vendor <span className="text-red-500">*</span></label>
                <Controller
                  name="vendorId"
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
                {errors.vendorId && <span className="text-red-500 text-xs">Required</span>}
              </div>

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
                    name="paymentAccountId"
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
                {errors.paymentAccountId && <span className="text-red-500 text-xs">Required</span>}
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
                  {...register("taxAmount", { required: true })}
                />
                {errors.taxAmount && <span className="text-red-500 text-xs">Required</span>}
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project</label>
                <select
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  {...register("projectId")}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Cost Center <span className="text-red-500">*</span></label>
                <Controller
                  name="costCenterId"
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
                {errors.costCenterId && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Branch <span className="text-red-500">*</span></label>
                <Controller
                  name="branchId"
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
                {errors.branchId && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Currency <span className="text-red-500">*</span></label>
                <Controller
                  name="currencyId"
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
                {errors.currencyId && <span className="text-red-500 text-xs">Required</span>}
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

          {/* Attachments Card */}
          {/* <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground">Attachments</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="font-medium text-foreground">Choose a file or drag & drop it here</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
              <Button variant="outline" type="button">Browse File</Button>
            </div>
          </div> */}
        </div>

        {/* Summary Card */}
        <div>
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Amount</span>
                <span className="text-foreground">${parseFloat(amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Tax</span>
                <span className="text-foreground">${parseFloat(taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
