import React, { useEffect } from "react";
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
  createInvoicePattern,
  updateInvoicePattern,
  getInvoicePatternById,
  getLeafAccounts,
  getWarehouses,
  getAllCostCenters,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditInvoicePattern() {
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
      pattern_Name: "",
      invoiceType: "Sales",
      material_Account_Id: "",
      cash_Account_Id: "",
      discount_Account_Id: "",
      start_Date: "",
      end_Date: "",
      wareHouse_Id: "",
      costCenter_id: "",
      currency_id: "",
      service_Account_Id: "",
      paymentPay: "Cash",
      tax_Percentage: 0,
      note: "",
    },
  });

  const { data: accountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: patternData, isLoading: isLoadingPattern } = useQuery({
    queryKey: ["getInvoicePatternById", id],
    queryFn: () => getInvoicePatternById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && patternData?.data) {
      const data = patternData.data;
      setValue("pattern_Name", data.pattern_Name || "");
      setValue("invoiceType", data.invoiceType || "Sales");
      setValue("material_Account_Id", data.material_Account_Id || "");
      setValue("cash_Account_Id", data.cash_Account_Id || "");
      setValue("discount_Account_Id", data.discount_Account_Id || "");
      setValue(
        "start_Date",
        data.start_Date ? data.start_Date.split("T")[0] : "",
      );
      setValue("end_Date", data.end_Date ? data.end_Date.split("T")[0] : "");
      setValue("wareHouse_Id", data.wareHouse_Id || "");
      setValue("costCenter_id", data.costCenter_id || "");
      setValue("currency_id", data.currency_id || "");
      setValue("service_Account_Id", data.service_Account_Id || "");
      setValue("paymentPay", data.paymentPay || "Cash");
      setValue("tax_Percentage", data.tax_Percentage || 0);
      setValue("note", data.note || "");
    }
  }, [isEdit, patternData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateInvoicePattern({ ...data, id })
        : createInvoicePattern(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllInvoicePatterns"]);
      toast.success(
        isEdit
          ? "Invoice pattern updated successfully!"
          : "Invoice pattern added successfully!",
      );
      navigate("/dashboard/accounting/basics/invoicing-patterns");
    },
    onError: (error) => {
      console.error("Failed to save invoice pattern", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save invoice pattern!",
      );
    },
  });

  const onSubmit = (data) => {
    // Formatting payload
    const payload = {
      ...data,
      tax_Percentage: Number(data.tax_Percentage),
      start_Date: data.start_Date
        ? new Date(data.start_Date).toISOString()
        : null,
      end_Date: data.end_Date ? new Date(data.end_Date).toISOString() : null,
    };

    // Clear out empty uuids to prevent backend errors if they aren't required, or leave them.
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    mutation.mutate(payload);
  };

  const accounts = accountsData?.data?.items || [];
  const warehouses = warehousesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const pageTitle = isEdit ? "Edit Invoice Pattern" : "Add Invoice Pattern";

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
            <span>Basics</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading || isLoadingPattern}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingPattern && isEdit ? (
          <div className="text-sm text-muted-foreground">
            Loading details...
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Pattern Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Name"
                className="h-9 bg-transparent"
                {...register("pattern_Name", { required: true })}
              />
              {errors.pattern_Name && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Invoice Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="invoiceType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Invoice Type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Purchases">Purchases</SelectItem>
                      <SelectItem value="Sales_Returns">Sales_Returns</SelectItem>
                      <SelectItem value="Purchases_Returns">Purchases_Returns</SelectItem>
                      <SelectItem value="Opening_Balance">Opening_Balance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.invoiceType && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Material Account <span className="text-red-500">*</span>
              </label>
              <Controller
                name="material_Account_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.material_Account_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Cash Account <span className="text-red-500">*</span>
              </label>
              <Controller
                name="cash_Account_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cash_Account_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Discount Account <span className="text-red-500">*</span>
              </label>
              <Controller
                name="discount_Account_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discount_Account_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <Controller
                name="wareHouse_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w?.name_Warehouse || " "}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.wareHouse_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Cost Center <span className="text-red-500">*</span>
              </label>
              <Controller
                name="costCenter_id"
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
              {errors.costCenter_id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <Controller
                name="paymentPay"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentPay && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Tax Percentage <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                className="h-9 bg-transparent"
                {...register("tax_Percentage", { required: true })}
              />
              {errors.tax_Percentage && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Note <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Notes..."
                className="h-9 bg-transparent"
                {...register("note", { required: true })}
              />
              {errors.note && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
