import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, X, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StepBundleComponents() {
  const { register, control, watch } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bundleComponents",
  });

  // Calculate total cost conceptually (for demo purposes)
  const calculateCost = () => {
    return 500; // In a real app, this would sum up (component cost * quantity)
  };

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Components</h3>
          <span className="text-2xl font-bold text-foreground">{fields.length}</span>
        </div>
        <div className="bg-[#EBF5FF] p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-[#0070E0] mb-1">Calculated Cost</h3>
          <span className="text-2xl font-bold text-[#0070E0]">$ {calculateCost()}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by id or employee name..." className="pl-9 h-10 bg-transparent" />
            </div>
            <Button type="button" variant="secondary" className="h-10 bg-[#EBF5FF] text-[#0070E0] hover:bg-blue-100">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button type="button" onClick={() => append({ item: "", unit: "", quantity: "", notes: "" })} className="h-10">
            <Plus className="w-4 h-4 mr-2" />
            Add Component
          </Button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/20 items-center text-sm font-semibold text-muted-foreground">
          <div className="col-span-3 flex items-center gap-1">Component Item</div>
          <div className="col-span-3 flex items-center gap-1">Unit</div>
          <div className="col-span-2 flex items-center gap-1">Quantity</div>
          <div className="col-span-3 flex items-center gap-1">Notes</div>
          <div className="col-span-1 flex justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Table Body (Rows) */}
        <div className="p-4 space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No components added yet. Click "Add Component" to start.
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <Input
                    placeholder="Component Item"
                    className="h-10 bg-transparent"
                    {...register(`bundleComponents.${index}.item`)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="Unit"
                    className="h-10 bg-transparent"
                    {...register(`bundleComponents.${index}.unit`)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Quantity"
                    type="number"
                    className="h-10 bg-transparent"
                    {...register(`bundleComponents.${index}.quantity`)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="Notes"
                    className="h-10 bg-transparent"
                    {...register(`bundleComponents.${index}.notes`)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dummy Pagination */}
        {fields.length > 0 && (
          <div className="p-4 border-t flex items-center justify-end gap-2 text-sm">
            <button type="button" className="text-muted-foreground hover:text-foreground">Pre</button>
            <button type="button" className="w-8 h-8 flex items-center justify-center bg-[#0070E0] text-white rounded-md">1</button>
            <button type="button" className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md">2</button>
            <span className="text-muted-foreground">...</span>
            <button type="button" className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md">20</button>
            <button type="button" className="text-[#0070E0] font-medium hover:text-blue-700">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
