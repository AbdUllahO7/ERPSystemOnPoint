import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Trash2, Image as ImageIcon, Plus, X, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllCategories,
  getLeafAccounts,
  searchMaterialsForInvoice,
  getInventoryPricingLookup,
  getAllUnitOfMeasurements,
  createBundleWithoutSpecs,
  updateBundleWithoutSpecs,
  getProductById,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function BundleForm({ currentStep, onNext }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      name_Product: "",
      product_Number: "",
      category_Id: "",
      requires_Shipping: false,
      requires_Contract: false,
      has_Expiry_Date: false,
      revenue_Account_Id: "",
      expense_Account_Id: "",
      cost_Price: 0,
      consumer_Price: 0,
      product_Components: [
        { component_Variant_Id: "", unit_Of_Measurement_Id: "", quantity: 1, notes: "" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "product_Components",
  });

  const componentsCount = watch("product_Components")?.length || 0;

  // Categories Lookup
  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  // Accounts Lookup
  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 1000 }),
  });

  // Primary Materials Lookup: GetInventoryPricing
  const { data: pricingRes } = useQuery({
    queryKey: ["getInventoryPricingLookup"],
    queryFn: () => getInventoryPricingLookup(),
  });

  // Fallback Materials Lookup: searchMaterialsForInvoice
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ["materials-for-invoice"],
    queryFn: () => searchMaterialsForInvoice({ PageNumber: 1, PageSize: 1000 }),
  });

  // Bundle Details Query on Edit
  const { data: bundleRes } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  // Global Units Lookup
  const { data: unitsRes } = useQuery({
    queryKey: ["unit-measurements"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
  });

  const categories = categoriesRes?.data?.items || categoriesRes?.data || [];
  const accounts = accountsRes?.data?.items || accountsRes?.data || [];
  const measurements = unitsRes?.data?.items || unitsRes?.data || [];

  // Unified available components/materials list
  const products = useMemo(() => {
    const pricingList = pricingRes?.data?.items || pricingRes?.data || (Array.isArray(pricingRes) ? pricingRes : []);
    if (Array.isArray(pricingList) && pricingList.length > 0) {
      return pricingList.map((p) => ({
        productVariantId: p.productVariantId || p.variantId || p.id,
        productName: p.productName || p.name_Product || p.name,
        availableUnits: p.unitOfMeasurementId
          ? [
              {
                productUnitId: p.unitOfMeasurementId,
                unitOfMesuranse_Id: p.unitOfMeasurementId,
                unitName: p.unitName || "Unit",
              },
            ]
          : [],
        availableQuantity: p.availableQuantity || 0,
        price: p.consumerPrice || p.price || 0,
      }));
    }

    const fallbackList = productsRes?.data?.items || productsRes?.data || (Array.isArray(productsRes) ? productsRes : []);
    return Array.isArray(fallbackList) ? fallbackList : [];
  }, [pricingRes, productsRes]);

  const productComponentsWatch = watch("product_Components") || [];
  const revenueAccountId = watch("revenue_Account_Id");
  const expenseAccountId = watch("expense_Account_Id");
  const categoryId = watch("category_Id");

  // Calculated cost based on selected components
  const calculatedCost = useMemo(() => {
    return productComponentsWatch.reduce((acc, comp) => {
      const prod = products.find(
        (p) =>
          String(p.productVariantId || p.variantId || p.id) ===
          String(comp.component_Variant_Id)
      );
      const price = Number(prod?.price || prod?.consumerPrice || prod?.costPrice || 0);
      const qty = Number(comp.quantity || 0);
      return acc + price * qty;
    }, 0);
  }, [productComponentsWatch, products]);

  // Sync loaded bundle data on edit
  useEffect(() => {
    if (isEdit && bundleRes?.data) {
      const bData = bundleRes.data?.data || bundleRes.data;
      const unitData = bData.variants?.[0]?.productUnitDtos?.[0] || {};
      const recipes =
        bData.product_Components ||
        bData.variants?.[0]?.recipes ||
        bData.variants?.[0]?.product_Components ||
        [];

      const components = recipes.map((r) => ({
        id: r.id || undefined,
        component_Variant_Id:
          r.component_Variant_Id || r.raw_Material_Variant_Id || r.componentVariantId || "",
        unit_Of_Measurement_Id:
          r.unit_Of_Measurement_Id || r.unitOfMeasurementId || "",
        quantity: Number(r.quantity) || 1,
        notes: r.notes || "",
      }));

      reset({
        name_Product: bData.name_Product || "",
        product_Number: bData.product_Number || "",
        category_Id: bData.category_Id || "",
        requires_Shipping: Boolean(bData.requires_Shipping ?? false),
        requires_Contract: Boolean(bData.requires_Contract ?? false),
        has_Expiry_Date: Boolean(bData.has_Expiry_Date ?? false),
        revenue_Account_Id: bData.revenue_Account_Id || "",
        expense_Account_Id: bData.expense_Account_Id || "",
        cost_Price: Number(unitData.cost_Price ?? bData.cost_Price ?? 0),
        consumer_Price: Number(unitData.consumer_Price ?? bData.consumer_Price ?? 0),
        product_Components:
          components.length > 0
            ? components
            : [{ component_Variant_Id: "", unit_Of_Measurement_Id: "", quantity: 1, notes: "" }],
      });
    }
  }, [isEdit, bundleRes, reset]);

  // Fallback sync for accounts
  useEffect(() => {
    if (isEdit && bundleRes?.data) {
      const bData = bundleRes.data?.data || bundleRes.data;
      if (bData.revenue_Account_Id && !revenueAccountId) {
        setValue("revenue_Account_Id", bData.revenue_Account_Id);
      }
      if (bData.expense_Account_Id && !expenseAccountId) {
        setValue("expense_Account_Id", bData.expense_Account_Id);
      }
      if (bData.category_Id && !categoryId) {
        setValue("category_Id", bData.category_Id);
      }
    }
  }, [isEdit, bundleRes, accounts, revenueAccountId, expenseAccountId, categoryId, setValue]);

  // Create Bundle Mutation (POST /api/Inventory/Product/CreateBundleWithoutSpecs)
  const createMutation = useMutation({
    mutationFn: (data) => createBundleWithoutSpecs(data),
    onSuccess: () => {
      toast.success("Bundle created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to create bundle"
      );
    },
  });

  // Update Bundle Mutation (POST /api/Inventory/Product/UpdateProductBundle/bundle)
  const updateMutation = useMutation({
    mutationFn: (data) => updateBundleWithoutSpecs({ ...data, id }),
    onSuccess: () => {
      toast.success("Bundle updated successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to update bundle"
      );
    },
  });

  const onSubmit = (data) => {
    if (currentStep === 2) {
      onNext();
    } else {
      if (isEdit) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    }
  };

  return (
    <form id="bundle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 2: Basic Bundle Details */}
      <div
        className={cn(
          "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
          currentStep === 2 ? "block" : "hidden"
        )}
      >
        {/* Upload Section Placeholder */}
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
              <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <button
                type="button"
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted mb-2 cursor-pointer"
              >
                Upload
              </button>
              <p className="text-xs text-muted-foreground">
                Upload image size 4MB, Format JPG, PNG, SVG
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Toggles Section */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <span className="text-sm font-medium text-muted-foreground">
                Requires Shipping
              </span>
              <Switch
                checked={watch("requires_Shipping")}
                onCheckedChange={(val) => setValue("requires_Shipping", val)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <span className="text-sm font-medium text-muted-foreground">
                Needs Contract
              </span>
              <Switch
                checked={watch("requires_Contract")}
                onCheckedChange={(val) => setValue("requires_Contract", val)}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <span className="text-sm font-medium text-muted-foreground">
                Has Expiry Date
              </span>
              <Switch
                checked={watch("has_Expiry_Date")}
                onCheckedChange={(val) => setValue("has_Expiry_Date", val)}
              />
            </div>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name_Product"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name_Product"
                placeholder="Bundle Name"
                className="h-11 bg-transparent"
                {...register("name_Product", { required: true })}
              />
              {errors.name_Product && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product_Number"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Item Code
              </label>
              <Input
                id="product_Number"
                placeholder="Item Code"
                className="h-11 bg-transparent"
                {...register("product_Number")}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Item Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category_Id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                {...register("category_Id", { required: true })}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading..." : "Item Category"}
                </option>
                {categoryId &&
                  !categories.some((cat) => String(cat.id) === String(categoryId)) && (
                    <option value={categoryId}>
                      {bundleRes?.data?.category_Name || "Selected Category"}
                    </option>
                  )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name || cat.name_Category || "Category"}
                  </option>
                ))}
              </select>
              {errors.category_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="cost_Price"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Cost Price ($)
              </label>
              <Input
                id="cost_Price"
                type="number"
                step="any"
                placeholder={calculatedCost > 0 ? String(calculatedCost) : "0"}
                className="h-11 bg-transparent"
                {...register("cost_Price")}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="consumer_Price"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Consumer Price ($) <span className="text-red-500">*</span>
              </label>
              <Input
                id="consumer_Price"
                type="number"
                step="any"
                placeholder="0"
                className="h-11 bg-transparent"
                {...register("consumer_Price", { required: true })}
              />
              {errors.consumer_Price && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="revenue_Account_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Revenue Account
              </label>
              <select
                id="revenue_Account_Id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                value={revenueAccountId || ""}
                onChange={(e) => setValue("revenue_Account_Id", e.target.value)}
                disabled={accountsLoading}
              >
                <option value="">
                  {accountsLoading ? "Loading accounts..." : "Select Revenue Account"}
                </option>
                {revenueAccountId &&
                  !accounts.some((acc) => String(acc.id) === String(revenueAccountId)) && (
                    <option value={revenueAccountId}>
                      {bundleRes?.data?.revenue_Account_Name ||
                        `Account (${String(revenueAccountId).substring(0, 8)}...)`}
                    </option>
                  )}
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_Name || acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="expense_Account_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Expense Account
              </label>
              <select
                id="expense_Account_Id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                value={expenseAccountId || ""}
                onChange={(e) => setValue("expense_Account_Id", e.target.value)}
                disabled={accountsLoading}
              >
                <option value="">
                  {accountsLoading ? "Loading accounts..." : "Select Expense Account"}
                </option>
                {expenseAccountId &&
                  !accounts.some((acc) => String(acc.id) === String(expenseAccountId)) && (
                    <option value={expenseAccountId}>
                      {bundleRes?.data?.expense_Account_Name ||
                        `Account (${String(expenseAccountId).substring(0, 8)}...)`}
                    </option>
                  )}
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_Name || acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Bundle Components */}
      <div
        className={cn(
          "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
          currentStep === 3 ? "block" : "hidden"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Components
            </h3>
            <p className="text-3xl font-bold">{componentsCount}</p>
          </div>
          <div className="bg-[#EBF5FF] p-6 rounded-xl border border-[#0070E0]/20 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0070E0] mb-2">
              Calculated Cost
            </h3>
            <p className="text-3xl font-bold text-[#0070E0]">
              ${Number(calculatedCost).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-4 flex items-center justify-between gap-4 border-b">
            <h4 className="font-semibold text-slate-800">Bundle Components Items</h4>
            <Button
              type="button"
              onClick={() =>
                append({
                  component_Variant_Id: "",
                  unit_Of_Measurement_Id: "",
                  quantity: 1,
                  notes: "",
                })
              }
              className="h-10 bg-[#0070E0] hover:bg-[#0070E0]/90 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Component Item</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-center">
                    <SlidersHorizontal className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const currentVariantId =
                    productComponentsWatch[index]?.component_Variant_Id;
                  const currentProduct = products.find(
                    (p) =>
                      String(p.productVariantId || p.variantId || p.id) ===
                      String(currentVariantId)
                  );
                  const availableUnits = currentProduct ? currentProduct.availableUnits : [];
                  const unitOptions =
                    availableUnits.length > 0
                      ? availableUnits.map((u) => ({
                          id: u.unitOfMesuranse_Id || u.unit_Of_Measurement_Id || u.productUnitId || u.id,
                          name: u.unitName || u.name,
                        }))
                      : measurements.map((m) => ({
                          id: m.unit_Name_Id || m.id,
                          name: m.unit_name || m.name,
                        }));

                  return (
                    <tr
                      key={field.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-4 min-w-[200px]">
                        <select
                          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          {...register(
                            `product_Components.${index}.component_Variant_Id`,
                            {
                              onChange: (e) => {
                                const prod = products.find(
                                  (p) =>
                                    String(p.productVariantId || p.variantId || p.id) ===
                                    String(e.target.value)
                                );
                                if (prod?.availableUnits?.[0]?.unitOfMesuranse_Id) {
                                  setValue(
                                    `product_Components.${index}.unit_Of_Measurement_Id`,
                                    prod.availableUnits[0].unitOfMesuranse_Id
                                  );
                                } else if (prod?.unitOfMeasurementId) {
                                  setValue(
                                    `product_Components.${index}.unit_Of_Measurement_Id`,
                                    prod.unitOfMeasurementId
                                  );
                                }
                              },
                            }
                          )}
                          disabled={productsLoading}
                        >
                          <option value="">
                            {productsLoading ? "Loading..." : "Select Component Item"}
                          </option>
                          {products.map((prod) => {
                            const pId = prod.productVariantId || prod.variantId || prod.id;
                            return (
                              <option key={pId} value={pId}>
                                {prod.productName || prod.name_Product || prod.name}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-4 py-4 min-w-[150px]">
                        <select
                          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          {...register(
                            `product_Components.${index}.unit_Of_Measurement_Id`
                          )}
                        >
                          <option value="">Select Unit</option>
                          {unitOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 min-w-[120px]">
                        <Input
                          type="number"
                          step="any"
                          min="1"
                          placeholder="Quantity"
                          className="h-11 bg-transparent"
                          {...register(`product_Components.${index}.quantity`)}
                        />
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <Input
                          placeholder="Notes"
                          className="h-11 bg-transparent"
                          {...register(`product_Components.${index}.notes`)}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {fields.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No components added yet. Click &quot;Add Component&quot; to add materials.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </form>
  );
}
