import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Upload, Trash2, Image as ImageIcon, Plus, X, Search, Filter, SlidersHorizontal, QrCode, ScanBarcode, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCategories, getLeafAccounts, searchMaterialsForInvoice, getAllUnitOfMeasurements, createSimpleProductWithoutSpecs, updateSimpleProductWithoutSpecs, getProductById } from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function SimpleProductForm({ currentStep, onNext, thereAreUnits, setThereAreUnits }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
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
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 100 }),
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

  const categories = categoriesRes?.data?.items || [];
  const accounts = accountsRes?.data?.items || [];
  const measurements = unitsRes?.data?.items || [];
  const productUnitsWatch = watch("product_Units");

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
      const bData = productRes.data;
      const unitData = bData.variants?.[0]?.productUnitDtos || [];

      if (bData.has_Multiple_Units) {
        setThereAreUnits(true);
      } else {
        setThereAreUnits(false);
      }

      const units = unitData.map((u, i) => ({
        id: u.id,
        unitName: u.unitName || `Unit ${i + 1}`,
        unit_Of_Measurement_Id: u.unit_Of_Measurement_Id || "",
        secondunit_Of_Measurement_Id: "",
        relative_factor: u.conversion_Factor || 1,
        is_Default_Selling: u.is_Default_Selling || false,
        is_Default_Purchasing: u.is_Default_Purchasing || false,
        barcode: u.barcode || "",
        qr_Code: u.qr_code || "",
        cost_Price: u.cost_Price || 0,
        wholesale_Price: u.wholesale_Price || 0,
        consumer_Price: u.consumer_Price || 0,
        last_Purchase_Price: u.last_Purchase_Price || 0,
        average_Purchase_Price: u.average_Purchase_Price || 0
      }));

      reset({
        id: id,
        name_Product: bData.name_Product || "",
        product_Number: bData.product_Number || "",
        has_Expiry_Date: bData.has_Expiry_Date ?? false,
        is_Tracking_Inventory: bData.is_Tracking_Inventory ?? true,
        category_Id: bData.category_Id || "",
        item_Origin: bData.item_Origin || "",
        requires_Shipping: bData.requires_Shipping ?? false,
        there_Are_Units: bData.has_Multiple_Units ?? false,
        minimum_Alert_Level: bData.variants?.[0]?.minimum_Alert_Level || 0,
        maximum_Stock_Level: bData.variants?.[0]?.maximum_Stock_Level || 0,
        revenue_Account_Id: bData.revenue_Account_Id || "",
        expense_Account_Id: bData.expense_Account_Id || "",
        inventory_Account_Id: bData.inventory_Account_Id || "",
        barcode_Option: "Manual",
        barcode: units[0]?.barcode || "",
        qr_Code: units[0]?.qr_Code || "",
        cost_Price: units[0]?.cost_Price || 0,
        consumer_Price: units[0]?.consumer_Price || 0,
        wholesale_Price: units[0]?.wholesale_Price || 0,
        last_Purchase_Price: units[0]?.last_Purchase_Price || 0,
        average_Purchase_Price: units[0]?.average_Purchase_Price || 0,
        product_Units: units.length > 0 ? units : [
          { unitName: "قطعة", relative_factor: 1, is_Default_Selling: true, is_Default_Purchasing: true }
        ],
      });
    }
  }, [isEdit, productRes, reset, setThereAreUnits]);
  console.log(isEdit)

  const createMutation = useMutation({
    mutationFn: createSimpleProductWithoutSpecs,
    onSuccess: () => {
      toast.success("Product created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateSimpleProductWithoutSpecs,
    onSuccess: () => {
      toast.success("Product updated successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    }
  });
  console.log(id)

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
        updateMutation.mutate({ ...payload, id });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const renderDetails = () => (
    <div className="space-y-6 border border-red-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">Requires Shipping</span>
            <Switch checked={watch("requires_Shipping")} onCheckedChange={(val) => setValue("requires_Shipping", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">There Are Units</span>
            <Switch checked={watchThereAreUnits} onCheckedChange={(val) => setValue("there_Are_Units", val)} />
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
            <select className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50" {...register("revenue_Account_Id")} disabled={accountsLoading}>
              <option value="">{accountsLoading ? "Loading..." : "Revenue Account"}</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Expense Account</label>
            <select className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50" {...register("expense_Account_Id")} disabled={accountsLoading}>
              <option value="">{accountsLoading ? "Loading..." : "Expense Account"}</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Inventory Account</label>
            <select className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50" {...register("inventory_Account_Id")} disabled={accountsLoading}>
              <option value="">{accountsLoading ? "Loading..." : "Inventory Account"}</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_Name}</option>)}
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
      {currentStep === 2 && renderDetails()}
      {thereAreUnits && currentStep === 3 && renderUnits()}
      {thereAreUnits && currentStep === 4 && renderVariantProperties()}
    </form>
  );
}
