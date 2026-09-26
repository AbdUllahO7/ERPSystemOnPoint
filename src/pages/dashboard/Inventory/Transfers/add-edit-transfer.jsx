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
import { getWarehouses, addTransfer, getProductsByWarehouse } from "../../../../lib/api";

export default function AddEditTransfer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      source_Warehouse_Id: "",
      destination_Warehouse_Id: "",
      transfer_Date: new Date().toISOString().slice(0, 16),
      notes: "",
      items: [{ product_Variant_Id: "", quantity: 0, weight: 0, product_Unit_Id: "" }]
    }
  });

  const source_Warehouse_Id = watch("source_Warehouse_Id");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['getWarehouses'],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }), // Fetching all warehouses without pagination for dropdown
  });

  const { data: productsByWarehouseData, isLoading: productsLoading } = useQuery({
    queryKey: ["warehouse-products", source_Warehouse_Id],
    queryFn: () => getProductsByWarehouse(source_Warehouse_Id),
    enabled: !!source_Warehouse_Id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addTransfer,
    onSuccess: () => {
      toast.success("Transfer added successfully!");
      queryClient.invalidateQueries(["getAllTransfers"]);
      navigate("/dashboard/inventory/transfers");
    },
    onError: (error) => {
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to add transfer!");
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  const warehouseOptions = warehousesData?.data?.items || [];
  const productOptions = productsByWarehouseData?.data?.items || [];
  console.log(productOptions)

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
             <Button type="button" onClick={() => append({ product_Variant_Id: "", quantity: 0, weight: 0, product_Unit_Id: "" })} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  const selectedProductVariantId = watch(`items.${index}.product_Variant_Id`);
                  const selectedProductData = productOptions?.find(p => p.productVariantId === selectedProductVariantId);
                  const rowUnitOptions = selectedProductData?.availableUnits || [];

                  return (
                    <tr key={field.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <Controller
                          name={`items.${index}.product_Variant_Id`}
                          control={control}
                          rules={{ required: "Material is required" }}
                          render={({ field }) => (
                            <Select
                              key={field.value}
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={!source_Warehouse_Id || productOptions.length === 0}
                            >
                              <SelectTrigger className={`w-full h-9 bg-transparent ${errors.items?.[index]?.product_Variant_Id ? "border-red-500" : "border-input"}`}>
                                <SelectValue placeholder={
                                  !source_Warehouse_Id 
                                    ? "Select Warehouse first" 
                                    : productsLoading 
                                      ? "Loading products..."
                                      : productOptions.length === 0 
                                        ? "No products available" 
                                        : "Select material"
                                } />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {productOptions?.map((p) => (
                                  <SelectItem key={p.productVariantId} value={String(p.productVariantId)}>
                                    {p.productName}
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
                            min: { value: 0.01, message: "> 0" }
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
                          render={({ field }) => (
                            <Select
                              key={field.value}
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={!selectedProductVariantId}
                            >
                              <SelectTrigger className={`w-full h-9 bg-transparent ${errors.items?.[index]?.product_Unit_Id ? "border-red-500" : "border-input"}`}>
                                <SelectValue placeholder="Select Unit" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                {rowUnitOptions.map((u) => (
                                  <SelectItem key={u.productUnitId} value={String(u.productUnitId)}>
                                    {u.unitName}
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
