import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Upload, Trash2, Image as ImageIcon, Plus, X, Search, Filter, SlidersHorizontal, QrCode, ScanBarcode, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCategories, getLeafAccounts, searchMaterialsForInvoice, getAllUnitOfMeasurements, createProduct, createSimpleProductWithoutSpecs, updateSimpleProductWithoutSpecs, updateSimpleProductWithSpecs, getProductById } from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function SimpleProductForm({ currentStep, onNext, thereAreUnits, setThereAreUnits }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    shouldUnregister: false,
    defaultValues: {
      name_Product: "",
      product_Number: "",
      has_Expiry_Date: false,
      is_Tracking_Inventory: true,
      category_Id: "",
      item_Origin: "",
      requires_Shipping: false,
      there_Are_Units: thereAreUnits,
      minimum_Alert_Level: 0,
      maximum_Stock_Level: 0,
      revenue_Account_Id: "",
      expense_Account_Id: "",
      inventory_Account_Id: "",
      barcode_Option: "Manual",
      barcode: "",
      qr_Code: "",
      cost_Price: 0,
      consumer_Price: 0,
      wholesale_Price: 0,
      last_Purchase_Price: 0,
      average_Purchase_Price: 0,
      product_Units: [
        {
          unitName: "قطعة",
          relative_factor: 1,
          is_Default_Selling: true,
          is_Default_Purchasing: true,
        }
      ],
    },
  });

  const watchThereAreUnits = watch("there_Are_Units");

  useEffect(() => {
    if (watchThereAreUnits !== thereAreUnits) {
      setThereAreUnits(watchThereAreUnits);
    }
  }, [watchThereAreUnits, thereAreUnits, setThereAreUnits]);

  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "product_Units",
  });

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: unitsRes, isLoading: unitsLoading } = useQuery({
    queryKey: ["unit-measurements"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: productRes, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  const categories = categoriesRes?.data?.items || categoriesRes?.data || [];
  const accounts = accountsRes?.data?.items || accountsRes?.data || [];
  const measurements = unitsRes?.data?.items || unitsRes?.data || [];
  const productUnitsWatch = watch("product_Units");
  const categoryId = watch("category_Id");
  const revenueAccountId = watch("revenue_Account_Id");
  const expenseAccountId = watch("expense_Account_Id");
  const inventoryAccountId = watch("inventory_Account_Id");

  const rawProduct = productRes?.data?.data || productRes?.data || {};
  const productCategoryName = rawProduct.category_Name || rawProduct.category_name || rawProduct.categoryName || "";

  useEffect(() => {
    if (measurements.length > 0 && !isEdit) {
      const pieceUnit = measurements.find(m => m.system_code === "PIECE" || m.unit_name.includes("قطعة"));
      const currentFirstUnitId = watch("product_Units.0.unit_Of_Measurement_Id");
      if (pieceUnit && !currentFirstUnitId) {
        setValue("product_Units.0.unit_Of_Measurement_Id", pieceUnit.unit_Name_Id);
        setValue("product_Units.0.unitName", pieceUnit.unit_name);
      }
    }
  }, [measurements, setValue, watch, isEdit]);

  useEffect(() => {
    if (isEdit && productRes?.data) {
      const bData = productRes.data?.data || productRes.data;
      if (!bData) return;

      const variantList = Array.isArray(bData.variants) ? bData.variants : [];
      const primaryVariant = variantList[0] || {};
      const unitData = (Array.isArray(primaryVariant.productUnitDtos) && primaryVariant.productUnitDtos.length > 0)
        ? primaryVariant.productUnitDtos
        : (Array.isArray(primaryVariant.productUnits) && primaryVariant.productUnits.length > 0)
        ? primaryVariant.productUnits
        : (Array.isArray(bData.productUnitDtos) && bData.productUnitDtos.length > 0)
        ? bData.productUnitDtos
        : (Array.isArray(bData.productUnits) && bData.productUnits.length > 0)
        ? bData.productUnits
        : [];
      const firstUnit = unitData[0] || {};

      const hasUnits = Boolean(bData.has_Multiple_Units ?? bData.hasMultipleUnits);
      setThereAreUnits(hasUnits);

      const units = unitData.map((u, i) => ({
        id: u.id,
        variant_id: primaryVariant.id || "",
        unit_id: u.id || "",
        unitName: u.unitName || u.unit_Name || u.unit_name || `Unit ${i + 1}`,
        unit_Of_Measurement_Id: u.unit_Of_Measurement_Id || u.unitOfMeasurementId || "",
        secondunit_Of_Measurement_Id: u.secondunit_Of_Measurement_Id || "",
        relative_factor: u.conversion_Factor ?? u.conversionFactor ?? u.relative_factor ?? 1,
        is_Default_Selling: u.is_Default_Selling ?? u.isDefaultSelling ?? false,
        is_Default_Purchasing: u.is_Default_Purchasing ?? u.isDefaultPurchasing ?? false,
        barcode: u.barcode || "",
        qr_Code: u.qr_code || u.qrCode || "",
        cost_Price: u.cost_Price ?? u.costPrice ?? 0,
        wholesale_Price: u.wholesale_Price ?? u.wholesalePrice ?? 0,
        consumer_Price: u.consumer_Price ?? u.consumerPrice ?? 0,
        last_Purchase_Price: u.last_Purchase_Price ?? u.lastPurchasePrice ?? 0,
        average_Purchase_Price: u.average_Purchase_Price ?? u.averagePurchasePrice ?? 0
      }));

      reset({
        id: id,
        name_Product: bData.name_Product || bData.nameProduct || bData.name || "",
        product_Number: bData.product_Number || bData.productNumber || bData.code || "",
        has_Expiry_Date: bData.has_Expiry_Date ?? bData.hasExpiryDate ?? false,
        is_Tracking_Inventory: bData.is_Tracking_Inventory ?? bData.isTrackingInventory ?? true,
        category_Id: bData.category_Id || bData.categoryId || "",
        item_Origin: bData.origin_Id || bData.originId || bData.item_Origin || bData.itemOrigin || "",
        requires_Shipping: bData.requires_Shipping ?? bData.requiresShipping ?? false,
        requires_Contract: bData.requires_Contract ?? bData.requiresContract ?? false,
        requires_Scheduling: bData.requires_Scheduling ?? bData.requiresScheduling ?? false,
        there_Are_Units: hasUnits,
        minimum_Alert_Level: primaryVariant.minimum_Alert_Level ?? primaryVariant.minimumAlertLevel ?? bData.minimum_Alert_Level ?? bData.minimumAlertLevel ?? 0,
        maximum_Stock_Level: primaryVariant.maximum_Stock_Level ?? primaryVariant.maximumStockLevel ?? bData.maximum_Stock_Level ?? bData.maximumStockLevel ?? 0,
        revenue_Account_Id: bData.revenue_Account_Id || bData.revenueAccountId || "",
        expense_Account_Id: bData.expense_Account_Id || bData.expenseAccountId || "",
        inventory_Account_Id: bData.inventory_Account_Id || bData.inventoryAccountId || "",
        barcode_Option: firstUnit.barcode_Option || primaryVariant.barcode_Option || "Manual",
        barcode: firstUnit.barcode || primaryVariant.barcode || bData.barcode || "",
        qr_Code: firstUnit.qr_code || firstUnit.qrCode || primaryVariant.qr_code || primaryVariant.qrCode || bData.qr_code || bData.qr_Code || "",
        cost_Price: firstUnit.cost_Price ?? primaryVariant.cost_Price ?? bData.cost_Price ?? 0,
        consumer_Price: firstUnit.consumer_Price ?? primaryVariant.consumer_Price ?? bData.consumer_Price ?? 0,
        wholesale_Price: firstUnit.wholesale_Price ?? primaryVariant.wholesale_Price ?? bData.wholesale_Price ?? 0,
        last_Purchase_Price: firstUnit.last_Purchase_Price ?? primaryVariant.last_Purchase_Price ?? bData.last_Purchase_Price ?? 0,
        average_Purchase_Price: firstUnit.average_Purchase_Price ?? primaryVariant.average_Purchase_Price ?? bData.average_Purchase_Price ?? 0,
        product_Units: units.length > 0 ? units : [
          { unitName: "قطعة", relative_factor: 1, is_Default_Selling: true, is_Default_Purchasing: true }
        ],
      });
    }
  }, [isEdit, productRes, reset, setThereAreUnits]);

  useEffect(() => {
    if (isEdit && productRes?.data) {
      const bData = productRes.data?.data || productRes.data;
      if (bData.category_Id) setValue("category_Id", bData.category_Id, { shouldValidate: true });
      if (bData.revenue_Account_Id) setValue("revenue_Account_Id", bData.revenue_Account_Id);
      if (bData.expense_Account_Id) setValue("expense_Account_Id", bData.expense_Account_Id);
      if (bData.inventory_Account_Id) setValue("inventory_Account_Id", bData.inventory_Account_Id);
    }
  }, [isEdit, productRes, categories, accounts, setValue]);

  // Create Product Mutation using POST /api/Inventory/Product/CreateProduct/Create
  const createMutation = useMutation({
    mutationFn: (data) => {
      const units = (data.there_Are_Units && data.product_Units?.length > 0)
        ? data.product_Units.map((u, idx) => ({
            unit_Of_Measurement_Id: u.unit_Of_Measurement_Id || measurements[0]?.unit_Name_Id,
            secondunit_Of_Measurement_Id: u.secondunit_Of_Measurement_Id || null,
            barcode_Option: u.barcode_Option || data.barcode_Option || "Manual",
            barcode: u.barcode || data.barcode || null,
            qr_Code: u.qr_Code || data.qr_Code || null,
            is_Default_Selling: Boolean(u.is_Default_Selling ?? (idx === 0)),
            is_Default_Purchasing: Boolean(u.is_Default_Purchasing ?? (idx === 0)),
            cost_Price: Number(u.cost_Price ?? data.cost_Price ?? 0),
            wholesale_Price: Number(u.wholesale_Price ?? data.wholesale_Price ?? 0),
            consumer_Price: Number(u.consumer_Price ?? data.consumer_Price ?? 0),
            last_Purchase_Price: Number(u.last_Purchase_Price ?? data.last_Purchase_Price ?? 0),
            average_Purchase_Price: Number(u.average_Purchase_Price ?? data.average_Purchase_Price ?? 0),
            relative_factor: Number(u.relative_factor ?? 1),
          }))
        : [
            {
              unit_Of_Measurement_Id: data.unit_Of_Measurement_Id || measurements[0]?.unit_Name_Id,
              secondunit_Of_Measurement_Id: null,
              barcode_Option: data.barcode_Option || "Manual",
              barcode: data.barcode || null,
              qr_Code: data.qr_Code || null,
              is_Default_Selling: true,
              is_Default_Purchasing: true,
              cost_Price: Number(data.cost_Price ?? 0),
              wholesale_Price: Number(data.wholesale_Price ?? 0),
              consumer_Price: Number(data.consumer_Price ?? 0),
              last_Purchase_Price: Number(data.last_Purchase_Price ?? 0),
              average_Purchase_Price: Number(data.average_Purchase_Price ?? 0),
              relative_factor: 1,
            },
          ];

      const payload = {
        name_Product: data.name_Product,
        product_Number: data.product_Number || String(Math.floor(100000 + Math.random() * 900000)),
        has_Specifications: false,
        is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? true),
        can_Be_Sold: Boolean(data.can_Be_Sold ?? true),
        can_Be_Purchased: Boolean(data.can_Be_Purchased ?? true),
        requires_Shipping: Boolean(data.requires_Shipping ?? false),
        requires_Contract: Boolean(data.requires_Contract ?? false),
        requires_Scheduling: Boolean(data.requires_Scheduling ?? false),
        has_Variants: false,
        is_Fixed_Price: Boolean(data.is_Fixed_Price ?? true),
        revenue_Account_Id: data.revenue_Account_Id || null,
        expense_Account_Id: data.expense_Account_Id || null,
        inventory_Account_Id: data.inventory_Account_Id || null,
        product_Type: "Inventory",
        billing_Method: "FixedPrice",
        has_Expiry_Date: Boolean(data.has_Expiry_Date ?? false),
        origin_Id: data.origin_Id || data.item_Origin || null,
        category_Id: data.category_Id || null,
        productVariantDtos: [
          {
            minimum_Alert_Level: Number(data.minimum_Alert_Level) || 0,
            maximum_Stock_Level: Number(data.maximum_Stock_Level) || 0,
            limit_Unit_Id: data.limit_Unit_Id || null,
            variantValues: [],
            product_Units: units,
            product_Components: null,
          },
        ],
      };

      return createProduct(payload);
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to create product");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateSimpleProductWithSpecs,
    onSuccess: () => {
      toast.success("Product updated successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    }
  });

  const onSubmit = (data) => {
    const isFinalStep = (thereAreUnits && currentStep === 4) || (!thereAreUnits && currentStep === 2);
    if (!isFinalStep) {
      onNext();
    } else {
      const payload = { ...data };
      if (!payload.there_Are_Units) {
        payload.product_Units = [];
      }
      if (isEdit) {
        updateMutation.mutate({
          ...payload,
          id,
          variant_id: productRes?.data?.variants?.[0]?.id,
          unit_id: productRes?.data?.variants?.[0]?.productUnitDtos?.[0]?.id,
          variants: productRes?.data?.variants,
          raw: productRes?.data,
        });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const renderDetails = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
          <div>
            <button type="button" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted mb-2">
              Upload
            </button>
            <p className="text-xs text-muted-foreground">
              Upload image size 4MB, Format JPG, PNG, SVG
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">Requires Shipping</span>
            <Switch checked={watch("requires_Shipping")} onCheckedChange={(val) => setValue("requires_Shipping", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">There Are Units</span>
            <Switch checked={watchThereAreUnits} onCheckedChange={(val) => setValue("there_Are_Units", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">Has Expiry Date</span>
            <Switch checked={watch("has_Expiry_Date")} onCheckedChange={(val) => setValue("has_Expiry_Date", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">Tracking Inventory</span>
            <Switch checked={watch("is_Tracking_Inventory")} onCheckedChange={(val) => setValue("is_Tracking_Inventory", val)} />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Item Name <span className="text-red-500">*</span></label>
            <Input placeholder="Item Name" className="h-11" {...register("name_Product", { required: true })} />
            {errors.name_Product && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Item Code</label>
            <Input placeholder="Item Code" className="h-11" {...register("product_Number")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Item Category <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              value={categoryId || ""}
              onChange={(e) => setValue("category_Id", e.target.value, { shouldValidate: true })}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? "Loading..." : "Item Category"}</option>
              {categoryId && !categories.some((cat) => String(cat.id) === String(categoryId)) && (
                <option value={categoryId}>
                  {productCategoryName || `Category (${String(categoryId).substring(0, 8)}...)`}
                </option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name || cat.name_Category || "Category"}</option>
              ))}
            </select>
            {errors.category_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Item Origin</label>
            <select className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm" {...register("item_Origin")}>
              <option value="">Item Origin</option>
              <option value="local">Local</option>
              <option value="imported">Imported</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Minimum Stock</label>
            <Input type="number" placeholder="0" className="h-11" {...register("minimum_Alert_Level")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Maximum Stock</label>
            <Input type="number" placeholder="0" className="h-11" {...register("maximum_Stock_Level")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Revenue Account</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              value={revenueAccountId || ""}
              onChange={(e) => setValue("revenue_Account_Id", e.target.value)}
              disabled={accountsLoading}
            >
              <option value="">{accountsLoading ? "Loading accounts..." : "Select Revenue Account"}</option>
              {revenueAccountId && !accounts.some((acc) => String(acc.id) === String(revenueAccountId)) && (
                <option value={revenueAccountId}>
                  {productRes?.data?.revenue_Account_Name || `Account (${String(revenueAccountId).substring(0, 8)}...)`}
                </option>
              )}
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name || acc.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Expense Account</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              value={expenseAccountId || ""}
              onChange={(e) => setValue("expense_Account_Id", e.target.value)}
              disabled={accountsLoading}
            >
              <option value="">{accountsLoading ? "Loading accounts..." : "Select Expense Account"}</option>
              {expenseAccountId && !accounts.some((acc) => String(acc.id) === String(expenseAccountId)) && (
                <option value={expenseAccountId}>
                  {productRes?.data?.expense_Account_Name || `Account (${String(expenseAccountId).substring(0, 8)}...)`}
                </option>
              )}
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name || acc.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Inventory Account</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              value={inventoryAccountId || ""}
              onChange={(e) => setValue("inventory_Account_Id", e.target.value)}
              disabled={accountsLoading}
            >
              <option value="">{accountsLoading ? "Loading accounts..." : "Select Inventory Account"}</option>
              {inventoryAccountId && !accounts.some((acc) => String(acc.id) === String(inventoryAccountId)) && (
                <option value={inventoryAccountId}>
                  {productRes?.data?.inventory_Account_Name || `Account (${String(inventoryAccountId).substring(0, 8)}...)`}
                </option>
              )}
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name || acc.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-foreground leading-none">Barcode</label>
            <div className="relative">
              <Input placeholder="Barcode" className="h-11 pr-10" {...register("barcode")} />
              <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-foreground leading-none">QR Code</label>
            <div className="relative">
              <Input placeholder="QR Code" className="h-11 pr-10" {...register("qr_Code")} />
              <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Cost Price</label>
            <Input type="number" placeholder="0" className="h-11" {...register("cost_Price")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Last Purchase</label>
            <Input type="number" placeholder="Last Purchase" className="h-11" {...register("last_Purchase_Price")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Avg Purchase</label>
            <Input type="number" placeholder="Avg Purchase" className="h-11" {...register("average_Purchase_Price")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Wholesale</label>
            <Input type="number" placeholder="Wholesale" className="h-11" {...register("wholesale_Price")} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Consumer Price</label>
            <Input type="number" placeholder="Consumer Price" className="h-11" {...register("consumer_Price")} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnits = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Units</h3>
        <Button type="button" onClick={() => appendUnit({ unitName: "", relative_factor: 1 })} className="bg-[#0070E0] hover:bg-[#0070E0]/90">
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>
      <div className="space-y-4">
        {unitFields.map((field, index) => (
          <div key={field.id} className="bg-card p-6 rounded-xl border shadow-sm flex items-end gap-6 relative">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">Unit Name</label>
              {index === 0 ? (
                <Input readOnly className="h-11 bg-muted/50" {...register(`product_Units.${index}.unitName`)} />
              ) : (
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50"
                  {...register(`product_Units.${index}.unit_Of_Measurement_Id`)}
                  onChange={(e) => {
                    const sel = measurements.find(m => m.unit_Name_Id === e.target.value);
                    if (sel) setValue(`product_Units.${index}.unitName`, sel.unit_name);
                  }}
                  disabled={unitsLoading}
                >
                  <option value="">Select Unit</option>
                  {measurements.map(m => (
                    <option key={m.unit_Name_Id} value={m.unit_Name_Id}>{m.unit_name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">Qty per Unit</label>
              <div className="flex items-center gap-2">
                {index === 0 ? (
                  <Input type="number" readOnly value={1} className="h-11 bg-muted/50" />
                ) : (
                  <>
                    <Input type="number" placeholder="Qty" className="h-11" {...register(`product_Units.${index}.relative_factor`)} />
                    <select
                      className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
                      {...register(`product_Units.${index}.secondunit_Of_Measurement_Id`)}
                    >
                      <option value="">Select unit</option>
                      {productUnitsWatch.slice(0, index).map((pUnit, pIdx) => {
                        if (!pUnit.unit_Of_Measurement_Id) return null;
                        return (
                          <option key={pIdx} value={pUnit.unit_Of_Measurement_Id}>
                            {pUnit.unitName || `Unit ${pIdx + 1}`}
                          </option>
                        );
                      })}
                    </select>
                  </>
                )}
              </div>
            </div>
            {index > 0 && (
              <button type="button" onClick={() => removeUnit(index)} className="flex items-center gap-2 text-red-500 hover:text-red-600 h-11 px-4 font-medium">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVariantProperties = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-6">Variant Properties</h3>
        <div className="space-y-6">
          {unitFields.map((field, index) => (
            <div key={field.id} className="border rounded-xl p-6 space-y-6 bg-card relative">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold text-sm">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-semibold text-foreground">Unit Name</label>
                  <select className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 text-sm disabled:opacity-100" disabled>
                    <option>{watch(`product_Units.${index}.unitName`) || `Unit ${index + 1}`}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground">Barcode</label>
                  <div className="relative">
                    <Input placeholder="Barcode" className="h-11 pr-10" {...register(`product_Units.${index}.barcode`)} />
                    <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground">QR Code</label>
                  <div className="relative">
                    <Input placeholder="QR Code" className="h-11 pr-10" {...register(`product_Units.${index}.qr_Code`)} />
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Cost Price</label>
                  <Input type="number" placeholder="Cost Price" className="h-11" {...register(`product_Units.${index}.cost_Price`)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Last Purchase</label>
                  <Input type="number" placeholder="Last Purchase" className="h-11" {...register(`product_Units.${index}.last_Purchase_Price`)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Avg Purchase</label>
                  <Input type="number" placeholder="Avg Purchase" className="h-11" {...register(`product_Units.${index}.average_Purchase_Price`)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Wholesale</label>
                  <Input type="number" placeholder="Wholesale" className="h-11" {...register(`product_Units.${index}.wholesale_Price`)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Consumer Price</label>
                  <Input type="number" placeholder="Consumer Price" className="h-11" {...register(`product_Units.${index}.consumer_Price`)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <form id="simple-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className={cn("space-y-6", currentStep === 2 ? "block" : "hidden")}>
        {renderDetails()}
      </div>
      {thereAreUnits && (
        <div className={cn("space-y-6", currentStep === 3 ? "block" : "hidden")}>
          {renderUnits()}
        </div>
      )}
      {thereAreUnits && (
        <div className={cn("space-y-6", currentStep === 4 ? "block" : "hidden")}>
          {renderVariantProperties()}
        </div>
      )}
    </form>
  );
}
