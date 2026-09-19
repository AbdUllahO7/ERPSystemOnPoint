import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Upload, Trash2, Image as ImageIcon, Plus, X, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCategories, getLeafAccounts, searchMaterialsForInvoice, createBundleWithoutSpecs, updateBundleWithoutSpecs, getProductById } from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function BundleForm({ currentStep, onNext }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
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
        { component_Variant_Id: "", unit_Of_Measurement_Id: "", quantity: 0, notes: "" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "product_Components",
  });

  const componentsCount = watch("product_Components").length;

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ["materials-for-invoice"],
    queryFn: () => searchMaterialsForInvoice({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: bundleRes, isLoading: bundleLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  const categories = categoriesRes?.data?.items || [];
  const accounts = accountsRes?.data?.items || [];
  const products = productsRes?.data?.items || [];
  const productComponentsWatch = watch("product_Components");

  useEffect(() => { 
    if (isEdit && bundleRes?.data) {
      const bData = bundleRes.data;
      const unitData = bData.variants?.[0]?.productUnitDtos?.[0] || {};
      const recipes = bData.variants?.[0]?.recipes || [];

      const components = recipes.map((r) => ({
        component_Variant_Id: r.raw_Material_Variant_Id || "",
        unit_Of_Measurement_Id: r.unit_Of_Measurement_Id || "",
        quantity: r.quantity || 0,
        notes: r.notes || "",
      }));

      reset({
        name_Product: bData.name_Product || "",
        product_Number: bData.product_Number || "",
        category_Id: bData.category_Id || "",
        requires_Shipping: bData.requires_Shipping ?? false,
        requires_Contract: bData.requires_Contract ?? false,
        has_Expiry_Date: bData.has_Expiry_Date ?? false,
        revenue_Account_Id: bData.revenue_Account_Id || "",
        expense_Account_Id: bData.expense_Account_Id || "",
        cost_Price: unitData.cost_Price || 0,
        consumer_Price: unitData.consumer_Price || 0,
        product_Components: components.length > 0 ? components : [
          { component_Variant_Id: "", unit_Of_Measurement_Id: "", quantity: 0, notes: "" }
        ],
      });
    }
  }, [isEdit, bundleRes, reset]);

  const createMutation = useMutation({
    mutationFn: createBundleWithoutSpecs,
    onSuccess: () => {
      toast.success("Bundle created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create bundle");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateBundleWithoutSpecs,
    onSuccess: () => {
      toast.success("Bundle updated successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update bundle");
    }
  });

  const onSubmit = (data) => {
    if (currentStep === 2) {
      onNext();
    } else {
      if (isEdit) {
        updateMutation.mutate({ ...data, id });
      } else {
        createMutation.mutate(data);
      }
    }
  };

  return (
    <form id="bundle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Upload Section */}
          <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted mb-2"
                >
                  Upload
                </button>
                <p className="text-xs text-muted-foreground">
                  Upload image size 4MB, Format JPG, PNG, SVG
                </p>
              </div>
            </div>

            <div className="flex gap-4 ml-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl bg-muted/50 border relative group flex items-center justify-center"
                >
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 bg-white rounded flex items-center justify-center text-red-500 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Toggles Section */}
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <span className="text-sm font-medium text-muted-foreground">
                  Requires Shipping
                </span>
                <Switch checked={watch("requires_Shipping")} onCheckedChange={(val) => setValue("requires_Shipping", val)} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <span className="text-sm font-medium text-muted-foreground">
                  Needs Contract
                </span>
                <Switch checked={watch("requires_Contract")} onCheckedChange={(val) => setValue("requires_Contract", val)} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <span className="text-sm font-medium text-muted-foreground">
                  Has Expiry Date
                </span>
                <Switch checked={watch("has_Expiry_Date")} onCheckedChange={(val) => setValue("has_Expiry_Date", val)} />
              </div>
            </div>
          </div>

          {/* Dynamic Fields Section */}
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
                  placeholder="Item Name"
                  className="h-11 bg-transparent"
                  {...register("name_Product", { required: true })}
                />
                {errors.name_Product && <span className="text-red-500 text-xs">Required</span>}
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
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("category_Id", { required: true })}
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? "Loading..." : "Item Category"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_Id && <span className="text-red-500 text-xs">Required</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="billing_Method"
                  className="text-sm font-semibold text-foreground leading-none"
                >
                  Billing Method
                </label>
                <select
                  id="billing_Method"
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("billing_Method")}
                >
                  <option value="">Billing Method</option>
                  <option value="FixedPrice">Fixed Price</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="QuantityBased">Quantity Based</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cost_Price"
                  className="text-sm font-semibold text-foreground leading-none"
                >
                  Cost
                </label>
                <Input
                  id="cost_Price"
                  type="number"
                  placeholder="0"
                  className="h-11 bg-transparent"
                  {...register("cost_Price")}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="consumer_Price"
                  className="text-sm font-semibold text-foreground leading-none"
                >
                  Consumer Price
                </label>
                <Input
                  id="consumer_Price"
                  type="number"
                  placeholder="0"
                  className="h-11 bg-transparent"
                  {...register("consumer_Price")}
                />
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
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("revenue_Account_Id")}
                  disabled={accountsLoading}
                >
                  <option value="">{accountsLoading ? "Loading..." : "Revenue Account"}</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.account_Name}</option>
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
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("expense_Account_Id")}
                  disabled={accountsLoading}
                >
                  <option value="">{accountsLoading ? "Loading..." : "Expense Account"}</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.account_Name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Components</h3>
              <p className="text-3xl font-bold">{componentsCount}</p>
            </div>
            <div className="bg-[#EBF5FF] p-6 rounded-xl border border-[#0070E0]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0070E0] mb-2">Calculated Cost</h3>
              <p className="text-3xl font-bold text-[#0070E0]">$ 500</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-4 flex items-center justify-between gap-4 border-b">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by id or employee name..."
                  className="pl-9 h-10 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-10 text-[#0070E0] border-[#0070E0]/20 bg-[#EBF5FF] hover:bg-[#EBF5FF]/80">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  type="button" 
                  onClick={() => append({ component_Variant_Id: "", unit_Of_Measurement_Id: "", quantity: 0, notes: "" })} 
                  className="h-10 bg-[#0070E0] hover:bg-[#0070E0]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </Button>
              </div>
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
                    const currentVariantId = productComponentsWatch[index]?.component_Variant_Id;
                    const currentProduct = products.find(p => p.productVariantId === currentVariantId);
                    const availableUnits = currentProduct ? currentProduct.availableUnits : [];

                    return (
                      <tr key={field.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-4 min-w-[200px]">
                          <select
                            className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            {...register(`product_Components.${index}.component_Variant_Id`)}
                            disabled={productsLoading}
                          >
                            <option value="">{productsLoading ? "Loading..." : "Component Item"}</option>
                            {products.map((prod) => (
                              <option key={prod.productVariantId} value={prod.productVariantId}>
                                {prod.productName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 min-w-[150px]">
                          <select
                            className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            {...register(`product_Components.${index}.unit_Of_Measurement_Id`)}
                            disabled={!currentVariantId || availableUnits.length === 0}
                          >
                            <option value="">Unit</option>
                            {availableUnits.map((u) => (
                              <option key={u.productUnitId} value={u.unitOfMesuranse_Id}>
                                {u.unitName}
                              </option>
                            ))}
                          </select>
                        </td>
                      <td className="px-4 py-4 min-w-[120px]">
                        <Input
                          type="number"
                          placeholder={currentProduct ? `Available: ${currentProduct.availableQuantity}` : "Quantity"}
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
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                      </tr>
                    );
                  })}
                  {fields.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No components added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Placeholder (from image) */}
            <div className="p-4 border-t flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <span>Pre</span>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded bg-[#0070E0] text-white">1</button>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">2</button>
              <span>...</span>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">20</button>
              <span className="text-[#0070E0] font-medium ml-2 cursor-pointer">Next</span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
