import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getWarehouses,
  addTransfer,
  getProductsByWarehouse,
  getAllUnitOfMeasurements,
  getTransferDetails,
  getAllProductUnits,
  getProductUnitsLookup,
} from "../../../../lib/api";

export default function AddEditTransfer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      source_Warehouse_Id: "",
      destination_Warehouse_Id: "",
      transfer_Date: new Date().toISOString().slice(0, 16),
      notes: "",
      items: [{ product_Variant_Id: "", quantity: "", weight: "", product_Unit_Id: "" }],
    },
  });

  const source_Warehouse_Id = watch("source_Warehouse_Id");
  const watchedItems = watch("items") || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // 1. Warehouses lookup
  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['getWarehouses'],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
  });

  // 2. Warehouse products lookup for the selected warehouse
  const { data: warehouseProductsData, isLoading: warehouseProductsLoading } = useQuery({
    queryKey: ["warehouse-products", source_Warehouse_Id],
    queryFn: () => getProductsByWarehouse(source_Warehouse_Id, { PageNumber: 1, PageSize: 1000 }),
    enabled: !!source_Warehouse_Id,
  });

  // 3. Product units lookup (the actual ProductUnit entities with IDs and variant associations)
  const { data: productUnitsData, isLoading: productUnitsLoading } = useQuery({
    queryKey: ["getAllProductUnits"],
    queryFn: () => getAllProductUnits({ PageNumber: 1, PageSize: 1000 }),
  });

  // 4. Product units names lookup
  const { data: productUnitsLookupData } = useQuery({
    queryKey: ["getProductUnitsLookup"],
    queryFn: () => getProductUnitsLookup({ PageNumber: 1, PageSize: 1000 }),
  });

  // 5. Units of measurement lookup (dictionary of units: Piece, Box, etc.)
  const { data: unitsData } = useQuery({
    queryKey: ["all-units-of-measurement"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
  });

  // 6. Transfer details in edit mode
  const { data: transferDetailsData, isLoading: transferLoading } = useQuery({
    queryKey: ["getTransferDetails", id],
    queryFn: () => getTransferDetails(id),
    enabled: isEdit,
  });

  // Populate form if in edit mode
  useEffect(() => {
    if (isEdit && transferDetailsData?.data) {
      const transfer = transferDetailsData.data;
      reset({
        source_Warehouse_Id: transfer.source_Warehouse_Id || "",
        destination_Warehouse_Id: transfer.destination_Warehouse_Id || "",
        transfer_Date: transfer.transfer_Date ? transfer.transfer_Date.slice(0, 16) : new Date().toISOString().slice(0, 16),
        notes: transfer.notes || "",
        items: transfer.details?.length > 0
          ? transfer.details.map((d) => ({
              product_Variant_Id: d.product_Variant_Id || "",
              quantity: d.quantity ?? "",
              weight: d.weight ?? "",
              product_Unit_Id: d.product_Unit_Id || "",
            }))
          : [{ product_Variant_Id: "", quantity: "", weight: "", product_Unit_Id: "" }],
      });
    }
  }, [isEdit, transferDetailsData, reset]);

  // Unified materials / product options with exact ProductUnit IDs required by backend
  const productOptions = useMemo(() => {
    const unitsList = productUnitsData?.data?.items || productUnitsData?.data || (Array.isArray(productUnitsData) ? productUnitsData : []);
    const lookupList = productUnitsLookupData?.data?.items || productUnitsLookupData?.data || (Array.isArray(productUnitsLookupData) ? productUnitsLookupData : []);
    const dictList = unitsData?.data?.items || unitsData?.data || (Array.isArray(unitsData) ? unitsData : []);
    const whList = warehouseProductsData?.data?.items || warehouseProductsData?.data || (Array.isArray(warehouseProductsData) ? warehouseProductsData : []);

    // 1. Build lookup maps for unit names
    const lookupMap = new Map();
    if (Array.isArray(lookupList)) {
      lookupList.forEach((u) => {
        if (u.id) lookupMap.set(String(u.id).toLowerCase(), u.name || u.unit_name || u.unitName);
      });
    }

    const dictMap = new Map();
    if (Array.isArray(dictList)) {
      dictList.forEach((u) => {
        const uId = u.unit_Name_Id || u.id;
        if (uId) dictMap.set(String(uId).toLowerCase(), u.unit_name || u.name);
      });
    }

    // 2. Build stock map for warehouse products
    const stockMap = new Map();
    if (Array.isArray(whList)) {
      whList.forEach((w) => {
        const vId = w.productVariantId || w.variantId || w.id;
        if (vId) stockMap.set(String(vId).toLowerCase(), w.availableQuantity);
      });
    }

    // 3. Group ProductUnits by product_Variant_Id
    const variantMap = new Map();

    if (Array.isArray(unitsList)) {
      unitsList.forEach((u) => {
        const variantId = String(u.product_Variant_Id || u.variantId || u.productVariantId || "");
        if (!variantId) return;
        const key = variantId.toLowerCase();

        // The unit name resolved accurately
        const unitName =
          lookupMap.get(String(u.id).toLowerCase()) ||
          dictMap.get(String(u.unit_Of_Measurement_Id || "").toLowerCase()) ||
          u.unit_name ||
          u.unitName ||
          u.name ||
          "Unit";

        const unitObj = {
          id: String(u.id), // The real ProductUnit.id required by backend
          name: unitName,
          unitOfMeasurementId: u.unit_Of_Measurement_Id,
        };

        if (variantMap.has(key)) {
          const existing = variantMap.get(key);
          if (!existing.availableUnits.some((unit) => unit.id.toLowerCase() === unitObj.id.toLowerCase())) {
            existing.availableUnits.push(unitObj);
          }
        } else {
          variantMap.set(key, {
            productVariantId: variantId,
            productName: u.product_Name || u.name || "Product",
            availableQuantity: stockMap.get(key),
            availableUnits: [unitObj],
          });
        }
      });
    }

    return Array.from(variantMap.values());
  }, [productUnitsData, productUnitsLookupData, unitsData, warehouseProductsData]);

  const { mutate, isPending } = useMutation({
    mutationFn: addTransfer,
    onSuccess: () => {
      toast.success(isEdit ? "Transfer saved successfully!" : "Transfer added successfully!");
      queryClient.invalidateQueries(["getAllTransfers"]);
      navigate("/dashboard/inventory/transfers");
    },
    onError: (error) => {
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save transfer!");
    },
  });

  const onSubmit = (data) => {
    if (data.source_Warehouse_Id === data.destination_Warehouse_Id) {
      toast.error("Destination must be different from source warehouse");
      return;
    }

    if (!data.items || data.items.length === 0) {
      toast.error("Please add at least one material to transfer");
      return;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.product_Variant_Id) {
        toast.error(`Please select a material for line #${i + 1}`);
        return;
      }
      if (!item.product_Unit_Id) {
        toast.error(`Please select a unit for line #${i + 1}`);
        return;
      }
      if (item.quantity === "" || item.quantity === null || Number(item.quantity) <= 0) {
        toast.error(`Please enter a valid quantity (> 0) for line #${i + 1}`);
        return;
      }
    }

    const payload = {
      source_Warehouse_Id: data.source_Warehouse_Id,
      destination_Warehouse_Id: data.destination_Warehouse_Id,
      transfer_Date: data.transfer_Date ? new Date(data.transfer_Date).toISOString() : new Date().toISOString(),
      notes: data.notes || "",
      items: data.items.map((item) => ({
        product_Variant_Id: item.product_Variant_Id,
        product_Unit_Id: item.product_Unit_Id,
        quantity: Number(item.quantity) || 0,
        weight: Number(item.weight) || 0,
      })),
    };

    mutate(payload);
  };

  const handleMaterialSelect = (index, variantId) => {
    setValue(`items.${index}.product_Variant_Id`, variantId, { shouldValidate: true });

    // Auto-select first available ProductUnit for this product
    const prod = productOptions.find(
      (p) => String(p.productVariantId).toLowerCase() === String(variantId).toLowerCase()
    );
    if (prod?.availableUnits?.length > 0) {
      setValue(`items.${index}.product_Unit_Id`, prod.availableUnits[0].id, { shouldValidate: true });
    }
  };

  const warehouseOptions = warehousesData?.data?.items || [];
  const isProductsLoading = productUnitsLoading || (source_Warehouse_Id && warehouseProductsLoading);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-[1200px] mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isEdit ? "Edit Transfer" : "Transfer Details"}
              </h2>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Transfers</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {isEdit ? "Edit Transfer" : "Add Transfer"}
              </span>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          {isEdit ? "Save Changes" : "Add Transfer"}
        </Button>
      </div>

      {/* Main Info Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Source Warehouse</label>
            <Controller
              name="source_Warehouse_Id"
              control={control}
              rules={{ required: "Source Warehouse is required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent ${errors.source_Warehouse_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder={warehousesLoading ? "Loading..." : "Select Source Warehouse"} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {warehouseOptions.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name_Warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.source_Warehouse_Id && <p className="text-red-500 text-xs">{errors.source_Warehouse_Id.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Destination Warehouse</label>
            <Controller
              name="destination_Warehouse_Id"
              control={control}
              rules={{ 
                required: "Destination Warehouse is required",
                validate: (value, formValues) => value !== formValues.source_Warehouse_Id || "Destination must be different from source"
              }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent ${errors.destination_Warehouse_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder={warehousesLoading ? "Loading..." : "Select Destination Warehouse"} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {warehouseOptions.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name_Warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.destination_Warehouse_Id && <p className="text-red-500 text-xs">{errors.destination_Warehouse_Id.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Transfer Date</label>
            <input
              type="datetime-local"
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.transfer_Date ? "border-red-500" : "border-input"}`}
              {...register("transfer_Date", { required: "Date is required" })}
            />
            {errors.transfer_Date && <p className="text-red-500 text-xs">{errors.transfer_Date.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Notes</label>
            <input
              type="text"
              placeholder="Internal notes..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("notes")}
            />
          </div>
        </div>
      </div>

      {/* Add Materials Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Add Materials</h3>
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
          
          {/* Header Actions */}
          <div className="p-4 border-b flex justify-end">
             <Button
               type="button"
               onClick={() => append({ product_Variant_Id: "", quantity: "", weight: "", product_Unit_Id: "" })}
               className="bg-blue-600 hover:bg-blue-700 text-white"
             >
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Material Name</th>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Weight</th>
                  <th className="px-6 py-4 font-medium">Unity</th>
                  <th className="px-6 py-4 font-medium text-center w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {fields?.map((field, index) => {
                  const currentItem = watchedItems?.[index] || {};
                  const selectedProductVariantId = currentItem.product_Variant_Id;
                  const selectedProductData = productOptions.find(
                    (p) => String(p.productVariantId).toLowerCase() === String(selectedProductVariantId || "").toLowerCase()
                  );
                  const rowUnitOptions = selectedProductData?.availableUnits || [];

                  return (
                    <tr key={field.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <Controller
                          name={`items.${index}.product_Variant_Id`}
                          control={control}
                          rules={{ required: "Material is required" }}
                          render={({ field: matField }) => (
                            <Select
                              value={matField.value || ""}
                              onValueChange={(val) => handleMaterialSelect(index, val)}
                              disabled={productOptions.length === 0}
                            >
                              <SelectTrigger className={`w-full h-9 bg-transparent ${errors.items?.[index]?.product_Variant_Id ? "border-red-500" : "border-input"}`}>
                                <SelectValue placeholder={
                                  isProductsLoading 
                                    ? "Loading products..."
                                    : productOptions.length === 0 
                                      ? "No products available" 
                                      : "Select material"
                                } />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {productOptions?.map((p) => (
                                  <SelectItem key={p.productVariantId} value={String(p.productVariantId)}>
                                    {p.productName} {p.availableQuantity !== undefined ? `(Available: ${p.availableQuantity})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.items?.[index]?.product_Variant_Id && <p className="text-red-500 text-[10px] mt-1">{errors.items[index].product_Variant_Id.message}</p>}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          disabled={!selectedProductVariantId}
                          className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground ${errors.items?.[index]?.quantity ? "border-red-500" : "border-input"}`}
                          {...register(`items.${index}.quantity`, { 
                            required: "Required",
                            min: { value: 0.0001, message: "> 0" }
                          })}
                        />
                        {errors.items?.[index]?.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.items[index].quantity.message}</p>}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <input
                          type="number"
                          step="any"
                          placeholder="Weight"
                          disabled={!selectedProductVariantId}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground"
                          {...register(`items.${index}.weight`)}
                        />
                      </td>

                      <td className="px-6 py-4 align-top">
                        <Controller
                          name={`items.${index}.product_Unit_Id`}
                          control={control}
                          rules={{ required: "Unit required" }}
                          render={({ field: unitField }) => (
                            <Select
                              value={unitField.value || ""}
                              onValueChange={unitField.onChange}
                              disabled={!selectedProductVariantId || rowUnitOptions.length === 0}
                            >
                              <SelectTrigger className={`w-full h-9 bg-transparent ${errors.items?.[index]?.product_Unit_Id ? "border-red-500" : "border-input"}`}>
                                <SelectValue placeholder="Select Unit" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {rowUnitOptions.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {u.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.items?.[index]?.product_Unit_Id && <p className="text-red-500 text-[10px] mt-1">{errors.items[index].product_Unit_Id.message}</p>}
                      </td>

                      <td className="px-6 py-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </form>
  );
}
