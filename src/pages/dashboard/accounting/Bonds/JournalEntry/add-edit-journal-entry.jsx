import React, { useState } from "react";
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
import { Info, Plus, X } from "lucide-react";
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      bond_Number: "",
      notes: "",
      currency_Id: "",
      lines: [
        { account_Id: "", description: "", costCenter_Id: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const linesWatched = watch("lines");
  const totalDebit = linesWatched.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = linesWatched.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);

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
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save journal entry!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      bond_Number: data.bond_Number,
      date: new Date(data.date).toISOString(),
      currency_Id: data.currency_Id,
      notes: data.notes,
      voucher_Type: voucherType,
      lines: data.lines.map((line) => ({
        account_Id: line.account_Id,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        notes: line.description,
        costCenter_Id: line.costCenter_Id || null,
      })),
    };
    mutation.mutate(payload);
  };

  const currencies = currenciesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const accounts = leafAccountsData?.data?.items || [];

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
              <h3 className="font-semibold text-foreground">Entry Lines</h3>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => append({ account_Id: "", description: "", costCenter_Id: "", debit: 0, credit: 0 })}
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
                    <th className="px-2 py-3 font-medium w-[120px]">Debit</th>
                    <th className="px-2 py-3 font-medium w-[120px]">Credit</th>
                    <th className="px-2 py-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields?.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0">
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
                              <SelectTrigger className="w-full min-w-[150px] h-9 bg-transparent">
                                <SelectValue placeholder="Account" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {accounts.map((a) => (
                                  <SelectItem key={a.id} value={String(a.id)}>
                                    {a.account_Name}
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
                                <SelectValue placeholder="Cost Center" />
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
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-9 bg-transparent"
                          {...register(`lines.${index}.debit`)}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-9 bg-transparent"
                          {...register(`lines.${index}.credit`)}
                        />
                      </td>
                      <td className="p-2 align-middle text-center">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-md"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm sticky top-6 lg:mt-[72px]">
            <h3 className="font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Total Debit</span>
                <span className="text-foreground">${totalDebit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-b pb-3">
                <span>Total Credit</span>
                <span className="text-foreground">${totalCredit.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold text-lg pt-1 ${totalDebit !== totalCredit ? 'text-red-500' : 'text-green-600'}`}>
                <span>Difference</span>
                <span>${Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
