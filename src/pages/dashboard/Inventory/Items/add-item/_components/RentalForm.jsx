import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Trash2, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  getLeafAccounts,
  getAllUnitOfMeasurements,
  createRentalProduct,
  updateRentalProduct,
  getProductById,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function RentalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const [units, setUnits] = useState([
    { unitOfMeasurmentId: "", cost_Price: 0, consumer_Price: 0 },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name_Product: "",
      product_Number: "",
      has_Expiry_Date: false,
      category_Id: "",
      can_Be_Sold: true,
      requires_Contract: true,
      default_Deposit_Amount: 0,
      revenue_Account_Id: "",
      expense_Account_Id: "",
      billing_Method: "FixedPrice",
      cost_Price: 0,
      consumer_Price: 0,
    },
  });

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 500 }),
  });

  const { data: uomRes, isLoading: uomLoading } = useQuery({
    queryKey: ["getAllUnitOfMeasurements"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: productRes, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  const categories = categoriesRes?.data?.items || [];
  const accounts = accountsRes?.data?.items || [];
  const uomList = uomRes?.data?.items || [];

  const categoryId = watch("category_Id");
  const costPrice = watch("cost_Price");
  const consumerPrice = watch("consumer_Price");

  // Load existing rental product when in edit mode
  useEffect(() => {
    if (isEdit && productRes?.data) {
      const p = productRes.data?.data || productRes.data;
      reset({
        name_Product: p.name_Product || p.name || "",
        product_Number: p.product_Number || p.productNumber || "",
        has_Expiry_Date: Boolean(p.has_Expiry_Date ?? p.hasExpiryDate ?? false),
        category_Id: p.category_Id || p.categoryId || "",
        can_Be_Sold: Boolean(p.can_Be_Sold ?? p.canBeSold ?? true),
        requires_Contract: Boolean(p.requires_Contract ?? p.requiresContract ?? true),
        default_Deposit_Amount: p.default_Deposit_Amount ?? p.defaultDepositAmount ?? 0,
        revenue_Account_Id: p.revenue_Account_Id || p.revenueAccountId || "",
        expense_Account_Id: p.expense_Account_Id || p.expenseAccountId || "",
        billing_Method: p.billing_Method || p.billingMethod || "FixedPrice",
        cost_Price: p.cost_Price ?? p.variants?.[0]?.productUnitDtos?.[0]?.cost_Price ?? 0,
        consumer_Price: p.consumer_Price ?? p.variants?.[0]?.productUnitDtos?.[0]?.consumer_Price ?? 0,
      });

      // Parse rental units
      const existingUnits =
        p.productUnitrental ||
        p.product_Unit_Rental ||
        (Array.isArray(p.variants) && p.variants[0]?.productUnitDtos
          ? p.variants[0].productUnitDtos.map((u) => ({
              unitOfMeasurmentId: u.unit_Of_Measurement_Id || u.unitOfMeasurementId,
              cost_Price: u.cost_Price || 0,
              consumer_Price: u.consumer_Price || 0,
            }))
          : []);

      if (existingUnits.length > 0) {
        setUnits(
          existingUnits.map((u) => ({
            unitOfMeasurmentId: u.unitOfMeasurmentId || u.unit_Of_Measurement_Id || "",
            cost_Price: Number(u.cost_Price) || 0,
            consumer_Price: Number(u.consumer_Price) || 0,
          }))
        );
      }
    }
  }, [isEdit, productRes, reset]);

  // Set default unit when uomList loads if none selected
  useEffect(() => {
    if (!isEdit && uomList.length > 0 && units.length === 1 && !units[0].unitOfMeasurmentId) {
      setUnits([
        {
          unitOfMeasurmentId: String(uomList[0].unit_Name_Id || uomList[0].id || ""),
          cost_Price: Number(costPrice) || 0,
          consumer_Price: Number(consumerPrice) || 0,
        },
      ]);
    }
  }, [uomList, isEdit, costPrice, consumerPrice]);

  const handleAddUnit = () => {
    const firstUomId = uomList[0]?.unit_Name_Id || uomList[0]?.id || "";
    setUnits((prev) => [
      ...prev,
      {
        unitOfMeasurmentId: firstUomId ? String(firstUomId) : "",
        cost_Price: Number(costPrice) || 0,
        consumer_Price: Number(consumerPrice) || 0,
      },
    ]);
  };

  const handleRemoveUnit = (index) => {
    if (units.length <= 1) {
      toast.error("At least one rental unit is required");
      return;
    }
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUnitChange = (index, field, value) => {
    setUnits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateRentalProduct(id, data) : createRentalProduct(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["items"]);
      if (id) {
        queryClient.invalidateQueries(["product", id]);
      }
      toast.success(
        res?.message ||
          (isEdit
            ? "Rental item updated successfully"
            : "Rental item created successfully")
      );
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        (isEdit ? "Failed to update rental item" : "Failed to create rental item");
      toast.error(msg);
    },
  });

  const onSubmit = (data) => {
    const validUnits = units
      .filter((u) => Boolean(u.unitOfMeasurmentId))
      .map((u) => ({
        unitOfMeasurmentId: u.unitOfMeasurmentId,
        cost_Price: Number(u.cost_Price) || 0,
        consumer_Price: Number(u.consumer_Price) || 0,
      }));

    if (validUnits.length === 0 && uomList.length > 0) {
      validUnits.push({
        unitOfMeasurmentId: String(uomList[0].id),
        cost_Price: Number(data.cost_Price) || 0,
        consumer_Price: Number(data.consumer_Price) || 0,
      });
    }

    const payload = {
      name_Product: (data.name_Product || "").trim(),
      product_Number: (data.product_Number || "").trim(),
      has_Expiry_Date: Boolean(data.has_Expiry_Date),
      category_Id: data.category_Id,
      can_Be_Sold: Boolean(data.can_Be_Sold),
      requires_Contract: Boolean(data.requires_Contract),
      default_Deposit_Amount: Number(data.default_Deposit_Amount) || 0,
      revenue_Account_Id: data.revenue_Account_Id,
      expense_Account_Id: data.expense_Account_Id,
      billing_Method: data.billing_Method || "FixedPrice",
      cost_Price: Number(data.cost_Price) || 0,
      consumer_Price: Number(data.consumer_Price) || 0,
      productUnitrental: validUnits,
    };

    if (isEdit) {
      payload.id = id;
    }

    mutation.mutate(payload);
  };

  if (isEdit && productLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      id="rental-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Upload Placeholder Section */}
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

      {/* Toggles Section: Can Be Sold, Needs Contract, Has Expiry Date */}
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <span className="text-sm font-semibold text-foreground block">
                Can Be Sold
              </span>
              <span className="text-xs text-muted-foreground">
                Item can be purchased directly as inventory
              </span>
            </div>
            <Switch
              checked={watch("can_Be_Sold")}
              onCheckedChange={(val) => setValue("can_Be_Sold", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <span className="text-sm font-semibold text-foreground block">
                Requires Rental Contract
              </span>
              <span className="text-xs text-muted-foreground">
                Must bind to rental agreement and terms
              </span>
            </div>
            <Switch
              checked={watch("requires_Contract")}
              onCheckedChange={(val) => setValue("requires_Contract", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <span className="text-sm font-semibold text-foreground block">
                Has Expiry Date
              </span>
              <span className="text-xs text-muted-foreground">
                Track inspection or lease expiry dates
              </span>
            </div>
            <Switch
              checked={watch("has_Expiry_Date")}
              onCheckedChange={(val) => setValue("has_Expiry_Date", val)}
            />
          </div>
        </div>
      </div>

      {/* Basic Item Info */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <h3 className="text-base font-bold text-foreground">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name_Product" className="text-sm font-semibold text-foreground">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_Product"
              placeholder="e.g. Generator 50kVA, Excavator, Meeting Hall"
              className="h-11 bg-transparent"
              {...register("name_Product", { required: true })}
            />
            {errors.name_Product && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_Number" className="text-sm font-semibold text-foreground">
              Item Code / SKU
            </Label>
            <Input
              id="product_Number"
              placeholder="e.g. RENT-1001"
              className="h-11 bg-transparent"
              {...register("product_Number")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_Id" className="text-sm font-semibold text-foreground">
              Item Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="category_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryId || ""}
              onChange={(e) =>
                setValue("category_Id", e.target.value, { shouldValidate: true })
              }
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select Category"}
              </option>
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

        {/* Pricing, Billing Method & Security Deposit */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="billing_Method" className="text-sm font-semibold text-foreground">
              Billing Method <span className="text-red-500">*</span>
            </Label>
            <select
              id="billing_Method"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              {...register("billing_Method", { required: true })}
            >
              <option value="FixedPrice">Fixed Price</option>
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="QuantityBased">Quantity Based</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_Price" className="text-sm font-semibold text-foreground">
              Cost Price ($)
            </Label>
            <Input
              id="cost_Price"
              type="number"
              step="0.01"
              placeholder="0"
              className="h-11 bg-transparent"
              {...register("cost_Price")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer_Price" className="text-sm font-semibold text-foreground">
              Rental / Consumer Price ($)
            </Label>
            <Input
              id="consumer_Price"
              type="number"
              step="0.01"
              placeholder="0"
              className="h-11 bg-transparent"
              {...register("consumer_Price")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_Deposit_Amount" className="text-sm font-semibold text-foreground">
              Default Security Deposit ($)
            </Label>
            <Input
              id="default_Deposit_Amount"
              type="number"
              step="0.01"
              placeholder="0"
              className="h-11 bg-transparent"
              {...register("default_Deposit_Amount")}
            />
          </div>
        </div>

        {/* Accounting Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="revenue_Account_Id" className="text-sm font-semibold text-foreground">
              Revenue Account <span className="text-red-500">*</span>
            </Label>
            <select
              id="revenue_Account_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("revenue_Account_Id", { required: true })}
              disabled={accountsLoading}
            >
              <option value="">
                {accountsLoading ? "Loading..." : "Select Revenue Account"}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_Name || acc.name} {acc.account_Number ? `(${acc.account_Number})` : ""}
                </option>
              ))}
            </select>
            {errors.revenue_Account_Id && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_Account_Id" className="text-sm font-semibold text-foreground">
              Expense Account <span className="text-red-500">*</span>
            </Label>
            <select
              id="expense_Account_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("expense_Account_Id", { required: true })}
              disabled={accountsLoading}
            >
              <option value="">
                {accountsLoading ? "Loading..." : "Select Expense Account"}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_Name || acc.name} {acc.account_Number ? `(${acc.account_Number})` : ""}
                </option>
              ))}
            </select>
            {errors.expense_Account_Id && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>
        </div>
      </div>

      {/* Rental Units & Pricing Section (productUnitrental) */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Rental Measurement Units & Pricing
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specify rate units (e.g. Hour, Day, Month, Piece) with dedicated cost and consumer rental prices.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddUnit}
            className="h-9 gap-1.5 text-xs text-[#0066d1] border-[#0066d1]/30 hover:bg-[#0066d1]/10"
          >
            <Plus className="w-4 h-4" />
            Add Rental Unit
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3.5 rounded-xl border bg-muted/20"
            >
              <div className="sm:col-span-5 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Measurement Unit <span className="text-red-500">*</span>
                </Label>
                <select
                  value={unit.unitOfMeasurmentId}
                  onChange={(e) =>
                    handleUnitChange(idx, "unitOfMeasurmentId", e.target.value)
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-xs"
                >
                  <option value="">Select Unit</option>
                  {uomList.map((uom, uIdx) => {
                    const uomVal = uom.unit_Name_Id || uom.id || "";
                    return (
                      <option key={uomVal || uIdx} value={String(uomVal)}>
                        {uom.unit_name || uom.unit_Name || uom.name || "Unit"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Cost Price ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={unit.cost_Price}
                  onChange={(e) =>
                    handleUnitChange(idx, "cost_Price", e.target.value)
                  }
                  className="h-10 text-xs bg-card"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Rental Price ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={unit.consumer_Price}
                  onChange={(e) =>
                    handleUnitChange(idx, "consumer_Price", e.target.value)
                  }
                  className="h-10 text-xs bg-card"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUnit(idx)}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-red-600 rounded-lg"
                  disabled={units.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

