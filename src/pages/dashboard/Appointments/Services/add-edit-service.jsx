import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageTitle } from "@/components/common/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  getServiceById,
  createService,
  getServiceLookups,
} from "@/services/appointments";
import {
  toGuidOrNull,
  updateSimpleProductWithoutSpecs,
  updateAssemblyWithoutSpecs,
  updateBundleWithoutSpecs,
  updateSimpleProductWithSpecs,
} from "@/services/inventory/inventory.service";

export default function AddEditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    productNumber: "",
    productType: "Service", // "Service" | "Inventory" | "InventoryWithSpecs" | "Assembly" | "Bundle"
    hasSpecifications: false,
    category: "",
    billingMethod: "FixedPrice",
    defaultDuration: 30,
    defaultInsuranceQty: 0,
    costPrice: 0,
    consumerPrice: 0,
    revenueAccount: "",
    expenseAccount: "",
    canBeSold: true,
    requiresContract: false,
    hasExpiryDate: false,
    hasVariants: false,
    isActive: true,
  });

  // Fetch Lookups
  const { data: lookupsData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["serviceLookups"],
    queryFn: getServiceLookups,
  });
  const lookups = lookupsData?.data || {
    categories: [],
    billingMethods: [],
    revenueAccounts: [],
    expenseAccounts: [],
  };

  // Fetch existing service if in edit mode
  const { data: existingData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["serviceDetail", id],
    queryFn: () => getServiceById(id),
    enabled: isEdit,
  });

  const isPageLoading = isLoadingLookups || (isEdit && isLoadingDetails);

  useEffect(() => {
    if (isEdit && existingData?.data) {
      const raw = existingData.data.raw || {};
      const hasSpecs = Boolean(raw.has_Specifications ?? existingData.data.hasVariants ?? false);

      setFormData((prev) => ({
        ...prev,
        ...existingData.data,
        name: existingData.data.name || existingData.data.name_Product || "",
        productNumber: existingData.data.productNumber || existingData.data.product_Number || "",
        productType: prev.productType && prev.productType !== "Service" ? prev.productType : "Service",
        hasSpecifications: hasSpecs,
        billingMethod: existingData.data.billingMethod || "FixedPrice",
        defaultDuration: existingData.data.defaultDuration ?? existingData.data.default_Duration_Minutes ?? 30,
        defaultInsuranceQty: existingData.data.defaultInsuranceQty ?? existingData.data.default_Deposit_Amount ?? 0,
        hasExpiryDate: Boolean(existingData.data.hasExpiryDate ?? existingData.data.has_Expiry_Date ?? false),
        hasVariants: hasSpecs,
        canBeSold: Boolean(existingData.data.canBeSold ?? existingData.data.can_Be_Sold ?? true),
        requiresContract: Boolean(existingData.data.requiresContract ?? existingData.data.requires_Contract ?? false),
      }));
    }
  }, [isEdit, existingData]);

  // Dynamically ensure Select options have the current value
  const categoryOptions = useMemo(() => {
    const list = [...(lookups.categories || [])];
    if (formData.category) {
      const exists = list.some((c) => c.value === formData.category || c.id === formData.category);
      if (!exists) {
        list.unshift({
          id: formData.category,
          label: formData.categoryName || formData.category,
          value: formData.category,
        });
      }
    }
    return list;
  }, [lookups.categories, formData.category, formData.categoryName]);

  const billingMethodOptions = useMemo(() => {
    const list = (lookups.billingMethods || []).map((bm) => ({
      value: bm.value,
      label: locale === "ar" ? (bm.labelAr || bm.label) : (bm.label || bm.value),
    }));
    if (formData.billingMethod) {
      const exists = list.some(
        (bm) => bm.value?.toLowerCase() === formData.billingMethod?.toLowerCase() ||
                bm.label?.toLowerCase() === formData.billingMethod?.toLowerCase()
      );
      if (!exists) {
        list.unshift({
          label: formData.billingMethod,
          value: formData.billingMethod,
        });
      }
    }
    return list;
  }, [lookups.billingMethods, formData.billingMethod, locale]);

  const revenueAccountOptions = useMemo(() => {
    const list = [...(lookups.revenueAccounts || [])];
    if (formData.revenueAccount) {
      const exists = list.some((ra) => ra.value === formData.revenueAccount || ra.id === formData.revenueAccount);
      if (!exists) {
        list.unshift({
          id: formData.revenueAccount,
          label: formData.revenueAccountName || formData.revenueAccount,
          value: formData.revenueAccount,
        });
      }
    }
    return list;
  }, [lookups.revenueAccounts, formData.revenueAccount, formData.revenueAccountName]);

  const expenseAccountOptions = useMemo(() => {
    const list = [...(lookups.expenseAccounts || [])];
    if (formData.expenseAccount) {
      const exists = list.some((ea) => ea.value === formData.expenseAccount || ea.id === formData.expenseAccount);
      if (!exists) {
        list.unshift({
          id: formData.expenseAccount,
          label: formData.expenseAccountName || formData.expenseAccount,
          value: formData.expenseAccount,
        });
      }
    }
    return list;
  }, [lookups.expenseAccounts, formData.expenseAccount, formData.expenseAccountName]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success(t("services.createdSuccess") || "Service created successfully!");
      navigate("/dashboard/appointments/services");
    },
    onError: () => toast.error(t("services.createError") || "Failed to create service"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const raw = existingData?.data?.raw || {};

      const rawVariants =
        Array.isArray(raw.variants) && raw.variants.length > 0
          ? raw.variants
          : Array.isArray(raw.productVariantDtos) && raw.productVariantDtos.length > 0
          ? raw.productVariantDtos
          : [];

      const fallbackUomId =
        toGuidOrNull(
          raw.unit_Of_Measurement_Id ||
          raw.variants?.[0]?.productUnitDtos?.[0]?.unit_Of_Measurement_Id ||
          raw.productVariantDtos?.[0]?.productUnitDtos?.[0]?.unit_Of_Measurement_Id ||
          raw.product_Units?.[0]?.unit_Of_Measurement_Id
        ) || "33333333-3333-3333-3333-333333333333";

      let updateProductvariants = [];

      if (rawVariants.length > 0) {
        updateProductvariants = rawVariants.map((v, idx) => {
          const uDto = Array.isArray(v.productUnitDtos) && v.productUnitDtos.length > 0 ? v.productUnitDtos[0] : {};
          const attrs = Array.isArray(v.variantValues)
            ? v.variantValues
            : Array.isArray(v.variant_Values)
            ? v.variant_Values
            : [];

          return {
            variant_id: toGuidOrNull(v.id || v.variant_id || v.variantId),
            unit_id: toGuidOrNull(uDto.id || v.unit_id || v.unitId || raw.product_Units?.[0]?.id),
            minimum_Alert_Level: Number(v.minimum_Alert_Level ?? 0) || 0,
            maximum_Stock_Level: Number(v.maximum_Stock_Level ?? 0) || 0,
            barcode_Option: v.barcode_Option || uDto.barcode_Option || "Manual",
            barcode: v.barcode || uDto.barcode || null,
            qr_Code: v.qr_Code || v.qrCode || uDto.qr_Code || uDto.qr_code || null,
            cost_Price: idx === 0 ? Number(data.costPrice ?? uDto.cost_Price ?? v.cost_Price ?? 0) : Number(uDto.cost_Price ?? v.cost_Price ?? 0),
            consumer_Price: idx === 0 ? Number(data.consumerPrice ?? uDto.consumer_Price ?? v.consumer_Price ?? 0) : Number(uDto.consumer_Price ?? v.consumer_Price ?? 0),
            wholesale_Price: Number(v.wholesale_Price ?? uDto.wholesale_Price ?? 0) || 0,
            last_Purchase_Price: Number(v.last_Purchase_Price ?? uDto.last_Purchase_Price ?? 0) || 0,
            average_Purchase_Price: Number(v.average_Purchase_Price ?? uDto.average_Purchase_Price ?? 0) || 0,
            unit_Of_Measurement_Id: toGuidOrNull(uDto.unit_Of_Measurement_Id || v.unit_Of_Measurement_Id || fallbackUomId),
            secondunit_Of_Measurement_Id: toGuidOrNull(uDto.secondunit_Of_Measurement_Id || v.secondunit_Of_Measurement_Id),
            relative_factor: Number(v.relative_factor ?? uDto.relative_factor ?? uDto.conversion_Factor ?? 0) || 0,
            variant_Values: attrs
              .map((val) => ({
                productAttributeValueId: toGuidOrNull(
                  val.productAttributeValueId || val.product_Attribute_Value_Id || val.id || val.attribute_Value_Id
                ),
              }))
              .filter((vv) => Boolean(vv.productAttributeValueId)),
          };
        });
      } else {
        updateProductvariants = [
          {
            variant_id: toGuidOrNull(raw.variant_id || raw.variantId),
            unit_id: toGuidOrNull(raw.product_Units?.[0]?.id || raw.unit_id || raw.unitId),
            minimum_Alert_Level: 0,
            maximum_Stock_Level: 0,
            barcode_Option: "Manual",
            barcode: null,
            qr_Code: null,
            cost_Price: Number(data.costPrice ?? 0),
            consumer_Price: Number(data.consumerPrice ?? 0),
            wholesale_Price: 0,
            last_Purchase_Price: 0,
            average_Purchase_Price: 0,
            unit_Of_Measurement_Id: toGuidOrNull(fallbackUomId),
            secondunit_Of_Measurement_Id: null,
            relative_factor: 0,
            variant_Values: [],
          },
        ];
      }

      const payload = {
        id: toGuidOrNull(id || data.id),
        name_Product: (data.name || data.name_Product || "").trim(),
        product_Number: (data.productNumber || data.product_Number || raw.product_Number || "").trim(),
        has_Expiry_Date: Boolean(data.hasExpiryDate ?? data.has_Expiry_Date ?? raw.has_Expiry_Date ?? false),
        is_Tracking_Inventory: Boolean(raw.is_Tracking_Inventory ?? false),
        category_Id: toGuidOrNull(data.category || data.category_Id || raw.category_Id),
        requires_Shipping: Boolean(raw.requires_Shipping ?? false),
        there_Are_Units: Boolean(raw.there_Are_Units ?? true),
        revenue_Account_Id: toGuidOrNull(data.revenueAccount || data.revenue_Account_Id || raw.revenue_Account_Id),
        expense_Account_Id: toGuidOrNull(data.expenseAccount || data.expense_Account_Id || raw.expense_Account_Id),
        inventory_Account_Id: toGuidOrNull(raw.inventory_Account_Id),
        updateProductvariants,
      };

      if (data.productType === "Assembly") {
        return updateAssemblyWithoutSpecs({ ...raw, ...data, id });
      }
      if (data.productType === "Bundle") {
        return updateBundleWithoutSpecs({ ...raw, ...data, id });
      }

      // Default (Service / Inventory with specifications):
      // POST /api/Inventory/Product/UpdateProductInventoryWithSpecifications/inventory-with-specifications
      return updateSimpleProductWithSpecs(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      queryClient.invalidateQueries(["serviceDetail", id]);
      toast.success(t("services.updatedSuccess") || "Updated successfully!");
      navigate("/dashboard/appointments/services");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || (t("services.updateError") || "Failed to update");
      toast.error(msg);
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error(t("services.enterName") || "Please enter a service name");
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Page Header */}
      <PageTitle
        title={isEdit ? (t("services.titleEdit") || "Edit Service") : (t("services.titleAdd") || "Add Service")}
        infoText={t("services.infoText") || "Configure service details, duration, pricing, and accounting rules"}
        breadcrumbs={[
          { label: t("services.breadcrumbList") || "Services", href: "/dashboard/appointments/services" },
          { label: isEdit ? (t("services.titleEdit") || "Edit Service") : (t("services.titleAdd") || "Add Service") },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/appointments/services")}
            >
              {t("services.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isSaving || isPageLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? (t("services.saving") || "Saving...") : (t("services.save") || "Save")}
            </Button>
          </div>
        }
      />

      {isPageLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-muted-foreground rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">
            {isEdit
              ? (t("services.loadingDetails") || "Loading service details & lookups...")
              : (t("services.loadingForm") || "Loading form data...")}
          </p>
        </div>
      ) : (
        <>
          {/* Main Form Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            {/* Row 1: Item Type, Name, Product Number, Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.itemType") || "Item Type"}
                </Label>
                <Select
                  value={formData.productType}
                  onValueChange={(val) => {
                    handleChange("productType", val);
                    if (val === "InventoryWithSpecs") {
                      handleChange("hasSpecifications", true);
                      handleChange("hasVariants", true);
                    } else {
                      handleChange("hasSpecifications", false);
                      handleChange("hasVariants", false);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("services.itemType") || "Select Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">{t("services.types.service") || "Service"}</SelectItem>
                    <SelectItem value="Inventory">{t("services.types.inventory") || "Inventory without specs"}</SelectItem>
                    <SelectItem value="InventoryWithSpecs">{t("services.types.inventoryWithSpecs") || "Inventory with specs"}</SelectItem>
                    <SelectItem value="Assembly">{t("services.types.assembly") || "Assembly"}</SelectItem>
                    <SelectItem value="Bundle">{t("services.types.bundle") || "Bundle"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.serviceName") || "Service Name"} *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={locale === "ar" ? "مثال: استشارة طبية" : "e.g. Dental Consultation"}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.productNumber") || "Product Number"}
                </Label>
                <Input
                  value={formData.productNumber}
                  onChange={(e) => handleChange("productNumber", e.target.value)}
                  placeholder={t("services.productNumberPlaceholder") || "e.g. SRV-1001 (auto if empty)"}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.category") || "Category"}
                </Label>
                <Select
                  key={formData.category || "cat-select"}
                  value={formData.category}
                  onValueChange={(val) => handleChange("category", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("services.selectCategory") || "Select Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.id || c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Billing Method, Default Duration, Default Deposit Amount */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.billingMethod") || "Billing Method"}
                </Label>
                <Select
                  key={formData.billingMethod || "bm-select"}
                  value={formData.billingMethod}
                  onValueChange={(val) => handleChange("billingMethod", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("services.selectBillingMethod") || "Select Billing Method"} />
                  </SelectTrigger>
                  <SelectContent>
                    {billingMethodOptions.map((bm) => (
                      <SelectItem key={bm.value} value={bm.value}>
                        {bm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.defaultDuration") || "Default Duration (min)"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.defaultDuration}
                  onChange={(e) =>
                    handleChange("defaultDuration", Number(e.target.value))
                  }
                  placeholder="30"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.defaultDepositAmount") || "Default Deposit Amount"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.defaultInsuranceQty}
                  onChange={(e) =>
                    handleChange("defaultInsuranceQty", Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>

            {/* Row 3: Cost Price, Consumer Price, Revenue Account */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.costPrice") || "Cost Price"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.costPrice}
                  onChange={(e) =>
                    handleChange("costPrice", Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.consumerPrice") || "Consumer Price"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.consumerPrice}
                  onChange={(e) =>
                    handleChange("consumerPrice", Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.revenueAccount") || "Revenue Account"}
                </Label>
                <Select
                  key={formData.revenueAccount || "rev-select"}
                  value={formData.revenueAccount}
                  onValueChange={(val) => handleChange("revenueAccount", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("services.selectRevenueAccount") || "Select Revenue Account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueAccountOptions.map((ra) => (
                      <SelectItem key={ra.id || ra.value} value={ra.value}>
                        {ra.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Expense Account */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("services.expenseAccount") || "Expense Account"}
                </Label>
                <Select
                  key={formData.expenseAccount || "exp-select"}
                  value={formData.expenseAccount}
                  onValueChange={(val) => handleChange("expenseAccount", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("services.selectExpenseAccount") || "Select Expense Account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseAccountOptions.map((ea) => (
                      <SelectItem key={ea.id || ea.value} value={ea.value}>
                        {ea.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bottom Toggles / Switches Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Toggle 1: Can Be Sold */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-all",
                  formData.canBeSold
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    formData.canBeSold ? "text-primary" : "text-foreground"
                  )}
                >
                  {t("services.canBeSold") || "Can Be Sold"}
                </span>
                <Switch
                  checked={formData.canBeSold}
                  onCheckedChange={(val) => handleChange("canBeSold", val)}
                />
              </div>

              {/* Toggle 2: Requires contract */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-all",
                  formData.requiresContract
                    ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    formData.requiresContract ? "text-primary font-semibold" : "text-foreground"
                  )}
                >
                  {t("services.requiresContract") || "Requires contract"}
                </span>
                <Switch
                  checked={formData.requiresContract}
                  onCheckedChange={(val) => handleChange("requiresContract", val)}
                />
              </div>

              {/* Toggle 3: Has Expiry Date */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-all",
                  formData.hasExpiryDate
                    ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    formData.hasExpiryDate ? "text-primary font-semibold" : "text-foreground"
                  )}
                >
                  {t("services.hasExpiryDate") || "Has Expiry Date"}
                </span>
                <Switch
                  checked={formData.hasExpiryDate}
                  onCheckedChange={(val) => handleChange("hasExpiryDate", val)}
                />
              </div>

              {/* Toggle 4: Active */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-all",
                  formData.isActive
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    formData.isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {t("services.active") || "Active"}
                </span>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => handleChange("isActive", val)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
