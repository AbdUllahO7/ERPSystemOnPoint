import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function VariantBlock({ variantIndex }) {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.values`,
  });

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-foreground">Variant {variantIndex + 1}</h3>
        <Button 
          type="button" 
          onClick={() => append({ value: "" })}
          className="h-9 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-4 p-4 border rounded-xl bg-card">
            <div className="flex-1 space-y-2">
              <label htmlFor={`variants.${variantIndex}.values.${index}.value`} className="text-sm font-semibold text-foreground leading-none">
                Value
              </label>
              <Input 
                id={`variants.${variantIndex}.values.${index}.value`} 
                placeholder="Value" 
                className="h-11 bg-transparent" 
                {...register(`variants.${variantIndex}.values.${index}.value`)} 
              />
            </div>
            <button 
              type="button" 
              onClick={() => remove(index)}
              className="flex items-center gap-2 text-red-500 font-semibold px-4 hover:bg-red-50 h-11 rounded-md transition-colors shrink-0"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-2">
            No values added.
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepUnitsPrices() {
  const { register, control } = useFormContext();
  const productType = useWatch({ control, name: "productType" });
  
  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "units",
  });

  const { fields: variantFields, append: appendVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const renderUnitsSection = () => (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Units</h3>
        <Button 
          type="button" 
          onClick={() => appendUnit({ unitName: "", qtyPerUnit: "", baseUnit: "" })}
          className="h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      
      <div className="p-6 space-y-4">
        {unitFields.map((field, index) => (
          <div key={field.id} className="p-4 rounded-xl border flex flex-col md:flex-row md:items-end gap-6 bg-card">
            <div className="space-y-2 flex-1">
              <label htmlFor={`units.${index}.unitName`} className="text-sm font-semibold text-foreground leading-none">
                Unit Name
              </label>
              <Input 
                id={`units.${index}.unitName`} 
                placeholder="Unit Name" 
                className="h-11 bg-transparent" 
                {...register(`units.${index}.unitName`)} 
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <label htmlFor={`units.${index}.qtyPerUnit`} className="text-sm font-semibold text-foreground leading-none">
                Qty per Unit
              </label>
              <div className="flex rounded-md border border-input h-11 bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <input 
                  id={`units.${index}.qtyPerUnit`} 
                  placeholder="Qty per Unit" 
                  className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none"
                  {...register(`units.${index}.qtyPerUnit`)} 
                />
                <div className="w-[1px] bg-border my-2"></div>
                <select 
                  className="bg-transparent px-3 py-2 text-sm text-muted-foreground outline-none border-none focus:ring-0"
                  {...register(`units.${index}.baseUnit`)}
                >
                  <option value="">Select unit</option>
                  <option value="piece">Piece</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end h-11">
              <button 
                type="button" 
                onClick={() => removeUnit(index)}
                className="flex items-center gap-2 text-red-500 font-semibold px-4 hover:bg-red-50 h-10 rounded-md transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {unitFields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No units added yet. Click "+ Add" to start.
          </div>
        )}
      </div>
    </div>
  );

  if (productType === "assembled") {
    return (
      <div className="space-y-6">
        {renderUnitsSection()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variants Section */}
      <div className="space-y-6">
        {variantFields.map((field, index) => (
          <VariantBlock key={field.id} variantIndex={index} />
        ))}
        
        {variantFields.length < 3 && (
          <Button 
            type="button" 
            variant="outline"
            onClick={() => appendVariant({ values: [{ value: "" }] })}
            className="w-full h-12 border-dashed border-2 text-primary hover:bg-primary/5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Variant
          </Button>
        )}
      </div>

      {/* Units Section */}
      {renderUnitsSection()}
    </div>
  );
}
