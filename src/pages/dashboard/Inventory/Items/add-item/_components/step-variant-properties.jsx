import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2, Link, ScanLine, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StepVariantProperties() {
  const { register, control } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantProperties",
  });

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
          {/* Block Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold">
              {String(index + 1).padStart(2, '0')}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => remove(index)}
                className="w-10 h-10 flex items-center justify-center text-red-500 border border-red-100 rounded-md hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="w-10 h-10 flex items-center justify-center text-muted-foreground border rounded-md hover:bg-muted"
              >
                <Link className="w-4 h-4" />
              </button>
              <Button type="button" className="px-6 h-10">
                Save
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-1">
              <label htmlFor={`variantProperties.${index}.unitName`} className="text-sm font-semibold text-foreground leading-none">
                Unit Name
              </label>
              <select 
                id={`variantProperties.${index}.unitName`} 
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                {...register(`variantProperties.${index}.unitName`)}
              >
                <option value="">Unit Name</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="carton">Carton</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.barcode`} className="text-sm font-semibold text-foreground leading-none">
                Barcode
              </label>
              <div className="relative">
                <Input 
                  id={`variantProperties.${index}.barcode`} 
                  placeholder="Barcode" 
                  className="h-11 bg-transparent pr-10" 
                  {...register(`variantProperties.${index}.barcode`)} 
                />
                <ScanLine className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#0070E0]" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.qrCode`} className="text-sm font-semibold text-foreground leading-none">
                QR Code
              </label>
              <div className="relative">
                <Input 
                  id={`variantProperties.${index}.qrCode`} 
                  placeholder="QR Code" 
                  className="h-11 bg-transparent pr-10" 
                  {...register(`variantProperties.${index}.qrCode`)} 
                />
                <ScanLine className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#0070E0]" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.costPrice`} className="text-sm font-semibold text-foreground leading-none">
                Cost Price
              </label>
              <Input 
                id={`variantProperties.${index}.costPrice`} 
                type="number" 
                placeholder="Cost Price" 
                className="h-11 bg-transparent" 
                {...register(`variantProperties.${index}.costPrice`)} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.lastPurchase`} className="text-sm font-semibold text-foreground leading-none">
                Last Purchase
              </label>
              <Input 
                id={`variantProperties.${index}.lastPurchase`} 
                type="number" 
                placeholder="Last Purchase" 
                className="h-11 bg-transparent" 
                {...register(`variantProperties.${index}.lastPurchase`)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.avgPurchase`} className="text-sm font-semibold text-foreground leading-none">
                Avg Purchase
              </label>
              <Input 
                id={`variantProperties.${index}.avgPurchase`} 
                type="number" 
                placeholder="Avg Purchase" 
                className="h-11 bg-transparent" 
                {...register(`variantProperties.${index}.avgPurchase`)} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.wholesale`} className="text-sm font-semibold text-foreground leading-none">
                Wholesale
              </label>
              <Input 
                id={`variantProperties.${index}.wholesale`} 
                type="number" 
                placeholder="Wholesale" 
                className="h-11 bg-transparent" 
                {...register(`variantProperties.${index}.wholesale`)} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`variantProperties.${index}.consumerPrice`} className="text-sm font-semibold text-foreground leading-none">
                Consumer Price
              </label>
              <Input 
                id={`variantProperties.${index}.consumerPrice`} 
                type="number" 
                placeholder="Consumer Price" 
                className="h-11 bg-transparent" 
                {...register(`variantProperties.${index}.consumerPrice`)} 
              />
            </div>
          </div>
        </div>
      ))}

      <Button 
        type="button" 
        onClick={() => append({ unitName: "", barcode: "", qrCode: "", costPrice: "", lastPurchase: "", avgPurchase: "", wholesale: "", consumerPrice: "" })} 
        variant="outline" 
        className="w-full h-12 border-dashed border-2 text-primary hover:bg-primary/5"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Variant Property
      </Button>
    </div>
  );
}
