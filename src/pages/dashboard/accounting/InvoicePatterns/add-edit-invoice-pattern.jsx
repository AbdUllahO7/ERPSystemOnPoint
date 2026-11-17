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
import { Info, Loader2 } from "lucide-react";
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
import { useI18n } from "@/context/translate-api";

export default function AddEditInvoicePattern() {
  const { t } = useI18n();
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
      service_Account_Id: "",
      paymentPay: "Cash",
      tax_Percentage: 0,
      note: "",
    },
  });

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: warehousesData, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: costCentersData, isLoading: isLoadingCostCenters } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: patternData, isLoading: isLoadingPattern } = useQuery({
    queryKey: ["getInvoicePatternById", id],
    queryFn: () => getInvoicePatternById(id),
    enabled: isEdit,
  });

  const isLoadingLookups =
    isLoadingAccounts ||
    isLoadingWarehouses ||
    isLoadingCostCenters;
  const isPageLoading = (isEdit && isLoadingPattern) || isLoadingLookups;

  useEffect(() => {
    if (isEdit && patternData) {
      const data = patternData?.data?.data || patternData?.data || patternData;
      if (!data) return;
      setValue("pattern_Name", data.pattern_Name || data.patternName || data.name || "");
      setValue("invoiceType", data.invoiceType || data.invoice_Type || "Sales");
      setValue("material_Account_Id", String(data.material_Account_Id || data.materialAccountId || ""));
      setValue("cash_Account_Id", String(data.cash_Account_Id || data.cashAccountId || ""));
      setValue("discount_Account_Id", String(data.discount_Account_Id || data.discountAccountId || ""));
      setValue(
        "start_Date",
        data.start_Date ? data.start_Date.split("T")[0] : "",
      );
      setValue("end_Date", data.end_Date ? data.end_Date.split("T")[0] : "");
      setValue("wareHouse_Id", String(data.wareHouse_Id || data.warehouse_Id || data.warehouseId || ""));
      setValue("costCenter_id", String(data.costCenter_id || data.costCenter_Id || data.costCenterId || ""));
      setValue("service_Account_Id", String(data.service_Accoount_Id || data.service_Account_Id || data.serviceAccountId || ""));
      setValue("paymentPay", data.paymentPay || data.payment_Pay || "Cash");
      setValue("tax_Percentage", data.tax_Percentage ?? data.taxPercentage ?? 0);
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
          ? t("invoicePatterns.updateSuccess")
          : t("invoicePatterns.addSuccess"),
      );
      navigate("/dashboard/accounting/basics/invoicing-patterns");
    },
    onError: (error) => {
      console.error("Failed to save invoice pattern", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : t("invoicePatterns.saveError"),
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

    delete payload.currency_id;

    // Clear out empty uuids to prevent backend errors if they aren't required, or leave them.
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    mutation.mutate(payload);
  };

  const accounts = accountsData?.data?.items || [];
  const warehouses = warehousesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const pageTitle = isEdit
    ? t("invoicePatterns.editPattern")
    : t("invoicePatterns.addPattern");

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
            <span>{t("invoicePatterns.accounting")}</span>
            <span>/</span>
            <span>{t("invoicePatterns.basics")}</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading || isPageLoading}
          className="px-8"
        >
          {mutation.isLoading ? t("common.saving") : t("common.save")}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm min-h-[300px]">
        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {isEdit
                ? t("invoicePatterns.loadingDetails")
                : t("invoicePatterns.loadingForm")}
            </p>
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.patternName")} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t("invoicePatterns.patternName")}
                className="h-9 bg-transparent"
                {...register("pattern_Name", { required: true })}
              />
              {errors.pattern_Name && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.invoiceType")} <span className="text-red-500">*</span>
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
                      <SelectValue placeholder={t("invoicePatterns.selectInvoiceType")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Sales">{t("invoicePatterns.types.sales")}</SelectItem>
                      <SelectItem value="Purchases">{t("invoicePatterns.types.purchases")}</SelectItem>
                      <SelectItem value="Sales_Returns">{t("invoicePatterns.types.salesReturns")}</SelectItem>
                      <SelectItem value="Purchases_Returns">{t("invoicePatterns.types.purchasesReturns")}</SelectItem>
                      <SelectItem value="Opening_Balance">{t("invoicePatterns.types.openingBalance")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.invoiceType && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.materialAccount")} <span className="text-red-500">*</span>
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
                      <SelectValue placeholder={t("invoicePatterns.selectAccount")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {field.value && !accounts.some((acc) => String(acc.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.account")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name || acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.material_Account_Id && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.cashAccount")} <span className="text-red-500">*</span>
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
                      <SelectValue placeholder={t("invoicePatterns.selectAccount")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {field.value && !accounts.some((acc) => String(acc.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.account")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name || acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cash_Account_Id && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.discountAccount")} <span className="text-red-500">*</span>
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
                      <SelectValue placeholder={t("invoicePatterns.selectAccount")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {field.value && !accounts.some((acc) => String(acc.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.account")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name || acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discount_Account_Id && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.warehouse")}
              </label>
              <Controller
                name="wareHouse_Id"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || undefined}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder={t("invoicePatterns.optionalWarehouse")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="none">{t("invoicePatterns.none")}</SelectItem>
                      {field.value && !warehouses.some((w) => String(w.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.warehouseFallback")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w?.name_Warehouse || w?.name || t("invoicePatterns.warehouseFallback")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.costCenter")}
              </label>
              <Controller
                name="costCenter_id"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || undefined}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder={t("invoicePatterns.optionalCostCenter")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="none">{t("invoicePatterns.none")}</SelectItem>
                      {field.value && !costCenters.some((cc) => String(cc.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.costCenterFallback")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {costCenters.map((cc) => (
                        <SelectItem key={cc.id} value={String(cc.id)}>
                          {cc.cost_Center_Name || cc.costCenter_Name || cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.paymentMethod")} <span className="text-red-500">*</span>
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
                      <SelectValue placeholder={t("invoicePatterns.selectPaymentMethod")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Cash">{t("invoicePatterns.payments.cash")}</SelectItem>
                      <SelectItem value="Credit">{t("invoicePatterns.payments.credit")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentPay && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.serviceAccount")}
              </label>
              <Controller
                name="service_Account_Id"
                control={control}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder={t("invoicePatterns.selectServiceAccount")} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {field.value && !accounts.some((acc) => String(acc.id) === String(field.value)) && (
                        <SelectItem value={String(field.value)}>
                          {`${t("invoicePatterns.account")} (${String(field.value).slice(0, 8)}...)`}
                        </SelectItem>
                      )}
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name || acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.taxPercentage")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                className="h-9 bg-transparent"
                {...register("tax_Percentage", { required: true })}
              />
              {errors.tax_Percentage && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                {t("invoicePatterns.note")} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t("invoicePatterns.notesPlaceholder")}
                className="h-9 bg-transparent"
                {...register("note", { required: true })}
              />
              {errors.note && (
                <span className="text-red-500 text-xs">{t("invoicePatterns.required")}</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
