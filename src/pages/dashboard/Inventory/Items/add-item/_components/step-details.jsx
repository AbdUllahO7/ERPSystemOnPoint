import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function StepDetails() {
  const { register, control } = useFormContext();
  const itemType = useWatch({ control, name: "itemType" });

  const renderProductFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="itemName" className="text-sm font-semibold text-foreground leading-none">Item Name</label>
          <Input id="itemName" placeholder="Item Name" className="h-11 bg-transparent" {...register("itemName")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="itemCode" className="text-sm font-semibold text-foreground leading-none">Item Code</label>
          <Input id="itemCode" placeholder="Item Code" className="h-11 bg-transparent" {...register("itemCode")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="itemCategory" className="text-sm font-semibold text-foreground leading-none">Item Category</label>
          <select id="itemCategory" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("itemCategory")}>
            <option value="">Item Category</option>
            <option value="cat1">Category 1</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="basePrice" className="text-sm font-semibold text-foreground leading-none">Base Price</label>
          <Input id="basePrice" type="number" placeholder="0" className="h-11 bg-transparent" {...register("basePrice")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="cost" className="text-sm font-semibold text-foreground leading-none">Cost</label>
          <Input id="cost" type="number" placeholder="0" className="h-11 bg-transparent" {...register("cost")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="itemOrigin" className="text-sm font-semibold text-foreground leading-none">Item Origin</label>
          <select id="itemOrigin" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("itemOrigin")}>
            <option value="">Item Origin</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="minStock" className="text-sm font-semibold text-foreground leading-none">Minimum Stock</label>
          <Input id="minStock" type="number" placeholder="Minimum Stock" className="h-11 bg-transparent" {...register("minStock")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="maxStock" className="text-sm font-semibold text-foreground leading-none">Maximum Stock</label>
          <Input id="maxStock" type="number" placeholder="Maximum Stock" className="h-11 bg-transparent" {...register("maxStock")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="revenueAccount" className="text-sm font-semibold text-foreground leading-none">Revenue Account</label>
          <select id="revenueAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("revenueAccount")}>
            <option value="">Revenue Account</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="expenseAccount" className="text-sm font-semibold text-foreground leading-none">Expense Account</label>
          <select id="expenseAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("expenseAccount")}>
            <option value="">Expense Account</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="inventoryAccount" className="text-sm font-semibold text-foreground leading-none">Inventory Account</label>
          <select id="inventoryAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("inventoryAccount")}>
            <option value="">Inventory Account</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderServiceOrBundleFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="itemName" className="text-sm font-semibold text-foreground leading-none">Item Name</label>
          <Input id="itemName" placeholder="Item Name" className="h-11 bg-transparent" {...register("itemName")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="itemCode" className="text-sm font-semibold text-foreground leading-none">Item Code</label>
          <Input id="itemCode" placeholder="Item Code" className="h-11 bg-transparent" {...register("itemCode")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="itemCategory" className="text-sm font-semibold text-foreground leading-none">Item Category</label>
          <select id="itemCategory" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("itemCategory")}>
            <option value="">Item Category</option>
            <option value="cat1">Category 1</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="billingMethod" className="text-sm font-semibold text-foreground leading-none">Billing Method</label>
          <select id="billingMethod" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("billingMethod")}>
            <option value="">Billing Method</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="cost" className="text-sm font-semibold text-foreground leading-none">Cost</label>
          <Input id="cost" type="number" placeholder="0" className="h-11 bg-transparent" {...register("cost")} />
        </div>
        <div className="space-y-2">
          <label htmlFor="consumerPrice" className="text-sm font-semibold text-foreground leading-none">Consumer Price</label>
          <Input id="consumerPrice" type="number" placeholder="0" className="h-11 bg-transparent" {...register("consumerPrice")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="revenueAccount" className="text-sm font-semibold text-foreground leading-none">Revenue Account</label>
          <select id="revenueAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("revenueAccount")}>
            <option value="">Revenue Account</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="expenseAccount" className="text-sm font-semibold text-foreground leading-none">Expense Account</label>
          <select id="expenseAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("expenseAccount")}>
            <option value="">Expense Account</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="inventoryAccount" className="text-sm font-semibold text-foreground leading-none">Inventory Account</label>
          <select id="inventoryAccount" className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("inventoryAccount")}>
            <option value="">Inventory Account</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderProductToggles = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Requires Shipping</span>
        <Switch {...register("requiresShipping")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">There Are Units</span>
        <Switch {...register("thereAreUnits")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Needs Contract</span>
        <Switch {...register("needsContract")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Needs Appointment</span>
        <Switch {...register("needsAppointment")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Has Expiry Date</span>
        <Switch {...register("hasExpiryDate")} />
      </div>
    </div>
  );

  const renderServiceOrBundleToggles = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Can Be Sold</span>
        <Switch {...register("canBeSold")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Can be Purchased</span>
        <Switch {...register("canBePurchased")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Requires Shipping</span>
        <Switch {...register("requiresShipping")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Needs Contract</span>
        <Switch {...register("needsContract")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Needs Appointment</span>
        <Switch {...register("needsAppointment")} />
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <span className="text-sm font-medium text-muted-foreground">Has Expiry Date</span>
        <Switch {...register("hasExpiryDate")} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
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

        <div className="flex gap-4 ml-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-20 h-20 rounded-xl bg-muted/50 border relative group flex items-center justify-center">
              <button type="button" className="absolute top-1 right-1 w-6 h-6 bg-white rounded flex items-center justify-center text-red-500 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Fields Section */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        {itemType === "product" ? renderProductFields() : renderServiceOrBundleFields()}
      </div>

      {/* Dynamic Toggles Section */}
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        {itemType === "product" ? renderProductToggles() : renderServiceOrBundleToggles()}
      </div>
    </div>
  );
}
