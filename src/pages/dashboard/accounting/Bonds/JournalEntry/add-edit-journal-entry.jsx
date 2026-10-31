import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Plus, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createJournalVoucher,
  getAllCostCenters,
  getAllCurrencies,
  getLeafAccounts,
} from "../../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditJournalEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // voucher_Type maps: General = Journal_Voucher, Opening = Opening_Entry, Adjustment = Adjustment_Entry
  const [voucherType, setVoucherType] = useState("Journal_Voucher");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      bond_Number: "",
      notes: "",
      currency_Id: "",
      lines: [
        { account_Id: "", description: "", costCenter_Id: "", debit: "", credit: "" },
        { account_Id: "", description: "", costCenter_Id: "", debit: "", credit: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const linesWatched = watch("lines") || [];
  const totalDebit = (linesWatched || []).reduce(
    (sum, line) => sum + (parseFloat(line?.debit) || 0),
    0
  );
  const totalCredit = (linesWatched || []).reduce(
    (sum, line) => sum + (parseFloat(line?.credit) || 0),
    0
  );
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && difference < 0.001;

  // Data Fetching
  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: leafAccountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const currencies = currenciesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const accounts = leafAccountsData?.data?.items || [];

  // Default to first currency if available and not selected
  useEffect(() => {
    if (currencies.length > 0 && !watch("currency_Id")) {
      setValue("currency_Id", String(currencies[0].id));
    }
  }, [currencies, setValue, watch]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? Promise.resolve() : createJournalVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllVouchers"]);
      toast.success(isEdit ? "Journal entry updated successfully!" : "Journal entry added successfully!");
      navigate("/dashboard/accounting/bonds/journal-entry");
    },
    onError: (error) => {
      console.error("Failed to save journal entry", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message;
      toast.error(errMsg && errMsg !== "An unexpected error occurred" ? errMsg : "Failed to save journal entry!");
    },
  });

  const handleAutoBalance = () => {
    const diff = totalDebit - totalCredit;
    const absDiff = parseFloat(Math.abs(diff).toFixed(2));
    if (absDiff <= 0.001) {
      toast("Entry is already balanced!");
      return;
    }

    const currentLines = linesWatched || [];
    const targetField = diff > 0 ? "credit" : "debit";
    const otherField = diff > 0 ? "debit" : "credit";

    // Find the first line where both debit and credit are 0 or empty
    const emptyLineIdx = currentLines.findIndex(
      (line) => (parseFloat(line?.debit) || 0) === 0 && (parseFloat(line?.credit) || 0) === 0
    );

    if (emptyLineIdx !== -1) {
      setValue(`lines.${emptyLineIdx}.${targetField}`, absDiff);
      setValue(`lines.${emptyLineIdx}.${otherField}`, "");
      toast.success(
        `Line ${emptyLineIdx + 1} auto-balanced with ${targetField === "credit" ? "Credit" : "Debit"} $${absDiff.toFixed(2)}`
      );
    } else {
      append({
        account_Id: "",
        description: "",
        costCenter_Id: "",
        debit: targetField === "debit" ? absDiff : "",
        credit: targetField === "credit" ? absDiff : "",
      });
      toast.success(
        `Added new line with ${targetField === "credit" ? "Credit" : "Debit"} $${absDiff.toFixed(2)}`
      );
    }
  };

  const onSubmit = (data) => {
    const lines = data.lines || [];

    // 1. Minimum 2 lines check (Double-entry requirement)
    if (lines.length < 2) {
      toast.error("A journal entry must contain at least 2 lines (double-entry).");
      return;
    }

    // 2. Line-by-line validation
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;

      if (!line.account_Id) {
        toast.error(`Line ${i + 1}: Please select an account.`);
        return;
      }

      if (debit > 0 && credit > 0) {
        toast.error(`Line ${i + 1}: An account cannot be both debited and credited on the same line. One must be zero.`);
        return;
      }

      if (debit === 0 && credit === 0) {
        toast.error(`Line ${i + 1}: Please enter either a debit or credit amount.`);
        return;
      }

      if (debit < 0 || credit < 0) {
        toast.error(`Line ${i + 1}: Debit and credit amounts cannot be negative.`);
        return;
      }
    }

    // 3. Balance verification
    const calculatedTotalDebit = lines.reduce(
      (sum, line) => sum + (parseFloat(line.debit) || 0),
      0
    );
    const calculatedTotalCredit = lines.reduce(
      (sum, line) => sum + (parseFloat(line.credit) || 0),
      0
    );

    if (calculatedTotalDebit === 0 && calculatedTotalCredit === 0) {
      toast.error("Journal entry total amount cannot be zero.");
      return;
    }

    const diff = Math.abs(calculatedTotalDebit - calculatedTotalCredit);
    if (diff > 0.001) {
      toast.error(
        `Unbalanced entry! Total debits ($${calculatedTotalDebit.toFixed(2)}) do not equal total credits ($${calculatedTotalCredit.toFixed(2)}). Difference: $${diff.toFixed(2)}`
      );
      return;
    }

    const payload = {
      bond_Number: data.bond_Number,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      currency_Id: data.currency_Id,
      notes: data.notes || "",
      voucher_Type: voucherType,
      lines: lines.map((line) => ({
        account_Id: line.account_Id,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        notes: line.description || "",
        costCenter_Id: line.costCenter_Id || null,
      })),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add New Journal Entry</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Journal Entries</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add New Journal Entry</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">

          {/* Type Selector */}
          <div className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit">
            <Button
              variant={voucherType === "Journal_Voucher" ? "default" : "ghost"}
              onClick={() => setVoucherType("Journal_Voucher")}
            >
              General
            </Button>
            <Button
              variant={voucherType === "Opening_Entry" ? "default" : "ghost"}
              onClick={() => setVoucherType("Opening_Entry")}
            >
              Opening
            </Button>
            <Button
              variant={voucherType === "Adjustment_Entry" ? "default" : "ghost"}
              onClick={() => setVoucherType("Adjustment_Entry")}
            >
              Adjustment
            </Button>
          </div>

          {/* Form Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm mt-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Date</label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  {...register("date", { required: true })}
                />
                {errors.date && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Reference</label>
                <Input
                  placeholder="Reference"
                  className="h-9 bg-transparent"
                  {...register("bond_Number", { required: true })}
                />
                {errors.bond_Number && <span className="text-red-500 text-xs">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Currency</label>
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

              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-semibold text-foreground">Description</label>
                <textarea
                  placeholder="Description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("notes")}
                />
              </div>

            </form>
          </div>

          {/* Entry Lines Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Entry Lines</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Double-entry: Each row must have either a Debit or a Credit. Total Debits must equal Total Credits.
                </p>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => append({ account_Id: "", description: "", costCenter_Id: "", debit: "", credit: "" })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase border-b">
                  <tr>
                    <th className="px-2 py-3 font-medium">Account</th>
                    <th className="px-2 py-3 font-medium">Description</th>
                    <th className="px-2 py-3 font-medium">Cost Center</th>
                    <th className="px-2 py-3 font-medium w-[130px]">Debit</th>
                    <th className="px-2 py-3 font-medium w-[130px]">Credit</th>
                    <th className="px-2 py-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields?.map((field, index) => {
                    const lineDebit = parseFloat(linesWatched?.[index]?.debit) || 0;
                    const lineCredit = parseFloat(linesWatched?.[index]?.credit) || 0;

                    return (
                      <tr key={field.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-2 align-top">
                          <Controller
                            name={`lines.${index}.account_Id`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select
                                key={field.value}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full min-w-[170px] h-9 bg-transparent">
                                  <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {accounts.map((a) => (
                                    <SelectItem key={a.id} value={String(a.id)}>
                                      {a.account_Number
                                        ? `${a.account_Number} - ${a.account_Name || a.name}`
                                        : a.account_Name || a.name || `Account #${a.id}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </td>
                        <td className="p-2 align-top">
                          <Input
                            placeholder="Description"
                            className="h-9 bg-transparent min-w-[150px]"
                            {...register(`lines.${index}.description`)}
                          />
                        </td>
                        <td className="p-2 align-top">
                          <Controller
                            name={`lines.${index}.costCenter_Id`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                key={field.value}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full min-w-[150px] h-9 bg-transparent">
                                  <SelectValue placeholder="Cost Center (Optional)" />
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
                        </td>
                        <td className="p-2 align-top">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={lineCredit > 0}
                            className="h-9 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted/30"
                            title={lineCredit > 0 ? "Credit is entered for this line. Clear Credit to enter Debit." : ""}
                            {...register(`lines.${index}.debit`, {
                              onChange: (e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (val > 0) {
                                  setValue(`lines.${index}.credit`, "");
                                }
                              },
                            })}
                          />
                        </td>
                        <td className="p-2 align-top">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={lineDebit > 0}
                            className="h-9 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted/30"
                            title={lineDebit > 0 ? "Debit is entered for this line. Clear Debit to enter Credit." : ""}
                            {...register(`lines.${index}.credit`, {
                              onChange: (e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (val > 0) {
                                  setValue(`lines.${index}.debit`, "");
                                }
                              },
                            })}
                          />
                        </td>
                        <td className="p-2 align-middle text-center">
                          <button
                            type="button"
                            disabled={fields.length <= 2}
                            onClick={() => {
                              if (fields.length > 2) {
                                remove(index);
                              }
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              fields.length <= 2
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            }`}
                            title={
                              fields.length <= 2
                                ? "A journal entry requires at least 2 lines"
                                : "Remove line"
                            }
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm sticky top-6 lg:mt-[72px] space-y-4">
            <h3 className="font-semibold text-foreground">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Total Debit</span>
                <span className="text-foreground font-medium">${totalDebit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Total Credit</span>
                <span className="text-foreground font-medium">${totalCredit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b pb-3 items-center">
                <span>Status</span>
                <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${isBalanced ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"}`}>
                  {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                </span>
              </div>
              <div className={`flex justify-between font-bold text-base pt-1 ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                <span>Difference</span>
                <span>${difference.toFixed(2)}</span>
              </div>
            </div>

            {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                onClick={handleAutoBalance}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-balance Difference
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
