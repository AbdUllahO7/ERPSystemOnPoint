import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
import {
  createAccount,
  updateAccount,
  getAccountById,
  getAllAccountsFlat,
  getAllCurrencies,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      account_Number: "",
      account_Name: "",
      parent_Account_Id: "",
      final_Account: "",
      account_Nature: "",
      financial_Statement: "",
      currency_Id: "",
    },
  });

  // Fetch accounts to use as parents
  const { data: accountsData } = useQuery({
    queryKey: ["getAllAccountsFlat"],
    queryFn: () => getAllAccountsFlat({ pageNumber: 1, pageSize: 100 }),
  });

  // Fetch currencies (if implemented in API, using dummy query structure for now if not available)
  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: accountData, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["getAccountById", id],
    queryFn: () => getAccountById(id),
    enabled: isEdit,
  });
 
  useEffect(() => {
    if (isEdit && accountData?.data) {
      const data = accountData.data;
      setValue("account_Number", data.accountNumber || "");
      setValue("account_Name", data.accountName || "");
      setValue("parent_Account_Id", data.accountParent_ID || "");
      setValue("final_Account", data.finalAccount || "");
      setValue("account_Nature", data.accountNature || "");
      setValue("financial_Statement", data.financialStatement || "");
      setValue("currency_Id", data.currency_Id || "");
    }
  }, [isEdit, accountData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateAccount({ ...data, account_Id: id })
        : createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllAccountsFlat"]);
      toast.success(isEdit ? "Account updated successfully!" : "Account added successfully!");
      navigate("/dashboard/accounting/accounts");
    },
    onError: (error) => {
      console.error("Failed to save account", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save account!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      account_Number: data.account_Number,
      account_Name: data.account_Name,
      parent_Account_Id: data.parent_Account_Id === "none" ? null : (data.parent_Account_Id || null),
      final_Account: data.final_Account,
      account_Nature: data.account_Nature,
      financial_Statement: data.financial_Statement,
      currency_Id: data.currency_Id,
    };
    mutation.mutate(payload);
  };

  const parentAccounts = accountsData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];
  
  const pageTitle = isEdit ? "Edit Account" : "Add Account";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Accounting</span>
            <span>/</span>
            <span>Accounts</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isPending || isLoadingAccount}
          className="px-8"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingAccount && isEdit ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="account_Number"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Account Number
              </label>
              <Input
                id="account_Number"
                placeholder="Number"
                className="h-9 bg-transparent"
                {...register("account_Number", { required: true })}
              />
              {errors.account_Number && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account_Name"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Account Name
              </label>
              <Input
                id="account_Name"
                placeholder="Name"
                className="h-9 bg-transparent"
                {...register("account_Name", { required: true })}
              />
              {errors.account_Name && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="parent_Account_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Parent Account
              </label>
              <Controller
                name="parent_Account_Id"
                control={control}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="No Parent (Main Account)" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="none">No Parent (Main Account)</SelectItem>
                      {parentAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="currency_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Currency
              </label>
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
                      {currencies.map((currency) => (
                        <SelectItem key={currency?.id} value={String(currency?.id)}>
                          {currency?.currency_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account_Nature"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Account Nature
              </label>
              <Controller
                name="account_Nature"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Nature" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Debit">Debit</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.account_Nature && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="final_Account"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Final Account
              </label>
              <Controller
                name="final_Account"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Final Account" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="BalanceSheet">Balance Sheet</SelectItem>
                      <SelectItem value="IncomeStatement">Income Statement</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.final_Account && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="financial_Statement"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Financial Statement
              </label>
              <Controller
                name="financial_Statement"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Financial Statement" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="FinancialPosition">Financial Position</SelectItem>
                      <SelectItem value="IncomeStatement">Income Statement</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.financial_Statement && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
