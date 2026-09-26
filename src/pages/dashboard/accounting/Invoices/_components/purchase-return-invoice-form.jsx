import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Trash2, Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPurchaseReturnInvoice,
  getWarehouses,
  getAllCostCenters,
  getWarehouseItems,
  getAllInvoicePatterns,
  getAllCurrencies,
  getAllSuppliers,
} from "../../../../../lib/api";

export default function PurchaseReturnInvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoice_Number: "",
      invoice_Date: new Date().toISOString().split("T")[0],
      note: "",
      original_invoice_number: "",
      invoicePattern_Id: "",
      suppler_id: "",
      warehouse_Id: "",
      currency_Id: "",
      costCenter_Id: "",
      payment_Method: "Cash",
      paid_Amount: 0,
      createInvoiceDetailsDto: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "createInvoiceDetailsDto",
  });

  const watchWarehouse = watch("warehouse_Id");
  const watchDetails = watch("createInvoiceDetailsDto");
  const watchInvoicePatternId = watch("invoicePattern_Id");
  const paymentMethod = watch("payment_Method");

  const { data: warehousesData } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
  });
  
  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["getWarehouseItems", watchWarehouse],
    queryFn: () => getWarehouseItems(watchWarehouse, { pageNumber: 1, pageSize: 100 }),
    enabled: !!watchWarehouse,
  });

  const { data: invoicePatternsData } = useQuery({
    queryKey: ["getAllInvoicePatterns", "Purchases_Returns"],
    queryFn: () => getAllInvoicePatterns({ Type: "Purchases_Returns", pageNumber: 1, pageSize: 100 }),
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["getAllSuppliers"],
    queryFn: () => getAllSuppliers({ pageNumber: 1, pageSize: 100 }),
  });

  const warehouses = warehousesData?.data?.items || [];
  const costCenters = costCentersData?.data?.items || [];
  const products = productsData?.data?.items || [];
  const invoicePatterns = invoicePatternsData?.data?.items || [];
  const currencies = currenciesData?.data?.items || [];
  const suppliers = suppliersData?.data?.items || [];

  const selectedPattern = useMemo(() => {
    return invoicePatterns.find(p => p.id === watchInvoicePatternId) || null;
  }, [watchInvoicePatternId, invoicePatterns]);

  React.useEffect(() => {
    if (selectedPattern) {
      if (selectedPattern.wareHouse_Id) {
        setValue("warehouse_Id", selectedPattern.wareHouse_Id, { shouldValidate: true });
      }
      if (selectedPattern.costCenter_id) {
        setValue("costCenter_Id", selectedPattern.costCenter_id, { shouldValidate: true });
      }
      if (selectedPattern.paymentPay) {
        setValue("payment_Method", selectedPattern.paymentPay, { shouldValidate: true });
      }
    }
  }, [selectedPattern, setValue]);
console.log(invoicePatterns)
  const createMutation = useMutation({
    mutationFn: (data) => createPurchaseReturnInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllInvoices"]);
      navigate("/dashboard/accounting/invoices");
    },
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    payload.invoice_Date = new Date(payload.invoice_Date).toISOString();
    
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    createMutation.mutate(payload);
  };

  const handleProductSelect = (index, productVariantId) => {
    const product = products.find(p => p.productVariantId === productVariantId);
    if (product) {
      const unit = product.availableUnits?.[0];
      if (unit) {
        setValue(`createInvoiceDetailsDto.${index}.unitOfMeasurement_Id`, unit.unitOfMesuranse_Id);
        setValue(`createInvoiceDetailsDto.${index}.unit_Price`, unit.consumerPrice);
      }
    }
  };

  const summary = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;
    
    watchDetails.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_Price) || 0;
      const discPerc = parseFloat(item.discount_Percentage) || 0;
      const taxPerc = parseFloat(item.tax_Percentage) || 0;

      const lineTotal = qty * price;
      const lineDisc = lineTotal * (discPerc / 100);
      const lineAfterDisc = lineTotal - lineDisc;
      const lineTax = lineAfterDisc * (taxPerc / 100);

      subtotal += lineTotal;
      discount += lineDisc;
      tax += lineTax;
    });

    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }, [watchDetails]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-card p-6 rounded-xl border shadow-sm grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Return Invoice Number <span className="text-red-500">*</span></label>
            <Input placeholder="Invoice Number" className={`h-9 bg-transparent ${errors.invoice_Number ? "border-red-500" : ""}`} {...register("invoice_Number", { required: "Required" })} />
            {errors.invoice_Number && <span className="text-xs text-red-500">{errors.invoice_Number.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Date <span className="text-red-500">*</span></label>
            <Input type="date" className={`h-9 bg-transparent ${errors.invoice_Date ? "border-red-500" : ""}`} {...register("invoice_Date", { required: "Required" })} />
            {errors.invoice_Date && <span className="text-xs text-red-500">{errors.invoice_Date.message}</span>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">Invoice Pattern <span className="text-red-500">*</span></label>
            <Controller
              name="invoicePattern_Id"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent ${errors.invoicePattern_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder="Select Invoice Pattern" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {invoicePatterns.map((ip) => (
                      <SelectItem key={ip.id} value={String(ip.id)}>
                        {ip.pattern_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.invoicePattern_Id && <span className="text-xs text-red-500">{errors.invoicePattern_Id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Supplier Name <span className="text-red-500">*</span></label>
            <Controller
              name="suppler_id"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent ${errors.suppler_id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder="Supplier Name" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.supplier_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.suppler_id && <span className="text-xs text-red-500">{errors.suppler_id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Warehouse <span className="text-red-500">*</span></label>
            <Controller
              name="warehouse_Id"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                  disabled={!!selectedPattern?.wareHouse_Id}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent disabled:bg-slate-100 ${errors.warehouse_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name_Warehouse || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.warehouse_Id && <span className="text-xs text-red-500">{errors.warehouse_Id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Currency <span className="text-red-500">*</span></label>
            <Controller
              name="currency_Id"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent ${errors.currency_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {currencies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.currency_Name} ({c.currency_Symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.currency_Id && <span className="text-xs text-red-500">{errors.currency_Id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Cost Center <span className="text-red-500">*</span></label>
            <Controller
              name="costCenter_Id"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                  disabled={!!selectedPattern?.costCenter_id}
                >
                  <SelectTrigger className={`w-full h-9 bg-transparent disabled:bg-slate-100 ${errors.costCenter_Id ? "border-red-500" : "border-input"}`}>
                    <SelectValue placeholder="Cost Center" />
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
            {errors.costCenter_Id && <span className="text-xs text-red-500">{errors.costCenter_Id.message}</span>}
          </div>

          {/* <div className="space-y-2">
            <label className="text-sm font-semibold">Original Invoice Number</label>
            <Input placeholder="Original Invoice Number" {...register("original_invoice_number")} />
          </div> */}
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Select Item To Return</h3>
            <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => append({ productVariant_Id: "", quantity: 1, unit_Price: 0, discount_Percentage: 0, tax_Percentage: 0, is_Service_Item: false })}>
              Select
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-xl p-4 space-y-3 relative bg-card">
                <button type="button" onClick={() => remove(index)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="space-y-1 pr-6">
                  <label className="text-xs text-muted-foreground">Item Name</label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    {...register(`createInvoiceDetailsDto.${index}.productVariant_Id`)}
                    onChange={(e) => {
                      setValue(`createInvoiceDetailsDto.${index}.productVariant_Id`, e.target.value);
                      handleProductSelect(index, e.target.value);
                    }}
                  >
                    <option value="">Select Item</option>
                    {products.map(p => (
                      <option key={p.productVariantId} value={p.productVariantId}>{p.productName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unit</label>
                    <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" {...register(`createInvoiceDetailsDto.${index}.unitOfMeasurement_Id`)}>
                      <option value="">Unit</option>
                      {products.find(p => p.productVariantId === watch(`createInvoiceDetailsDto.${index}.productVariant_Id`))?.availableUnits?.map(u => (
                        <option key={u.unitOfMesuranse_Id} value={u.unitOfMesuranse_Id}>{u.unitName}</option>
                      )) || (
                        <>
                          <option value="a3419b47-923a-4ca5-aacd-61a216d2bf6b">Piece</option>
                          <option value="56d99347-0fde-4ee5-9e70-e7a8df510eb3">Box</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Price</label>
                    <Input type="number" step="0.01" className="h-8 text-sm" {...register(`createInvoiceDetailsDto.${index}.unit_Price`)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Disc %</label>
                    <Input type="number" className="h-8 text-sm" {...register(`createInvoiceDetailsDto.${index}.discount_Percentage`)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Tax %</label>
                    <Input type="number" className="h-8 text-sm" {...register(`createInvoiceDetailsDto.${index}.tax_Percentage`)} />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Quantity to be returned</label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                      onClick={() => {
                        const current = parseFloat(watch(`createInvoiceDetailsDto.${index}.quantity`) || 0);
                        if (current > 1) setValue(`createInvoiceDetailsDto.${index}.quantity`, current - 1);
                      }}
                    >-</button>
                    <Input type="number" className="h-8 text-sm w-20 text-center" {...register(`createInvoiceDetailsDto.${index}.quantity`)} />
                    <button 
                      type="button" 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => {
                        const current = parseFloat(watch(`createInvoiceDetailsDto.${index}.quantity`) || 0);
                        setValue(`createInvoiceDetailsDto.${index}.quantity`, current + 1);
                      }}
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {fields.length === 0 && <p className="text-center text-muted-foreground py-8">No items selected.</p>}
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-2">
          <label className="text-sm font-semibold">Notes</label>
          <textarea
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm min-h-[100px]"
            placeholder="Notes"
            {...register("note")}
          ></textarea>
        </div>
      </div>

      <div className="space-y-6">
        <div className="w-full flex justify-end">
          <Button type="submit" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? "Saving..." : "+ Add"}
          </Button>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-semibold text-sm">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "Cash", icon: Banknote },
              { id: "Card", icon: CreditCard },
              { id: "Bank", icon: Landmark },
              { id: "Wallet", icon: Wallet }
            ].map(method => {
              const isPatternDisabled = !!selectedPattern?.paymentPay;
              const isSelected = paymentMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setValue("payment_Method", method.id)}
                  disabled={isPatternDisabled}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-input hover:bg-muted/50'
                  } ${isPatternDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''} ${isPatternDisabled ? 'cursor-not-allowed' : ''}`}
                >
                  <method.icon className="w-4 h-4" />
                  {method.id}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Returns are refunded in full — no installments allowed.</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-semibold text-sm">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-${summary.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
