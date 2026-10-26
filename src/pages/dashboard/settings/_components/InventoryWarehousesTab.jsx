import { useState, useEffect } from "react";
import { Box, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventorySettings, updateInventorySettings, getWarehouses } from "@/lib/api";
import toast from "react-hot-toast";

export default function InventoryWarehousesTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    virtual_Warehouse_Id: "",
    default_Reorder_Limit: 10,
    barcode_Type: "Code128",
    prevent_Sales_When_Stock_Depleted: false,
    enable_Automatic_Periodic_Inventory: true,
    enable_Batch_Tracking: false,
    enable_Expiry_Tracking: false,
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["getInventorySettings"],
    queryFn: getInventorySettings,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["getWarehousesListSettings"],
    queryFn: () => getWarehouses({ pageSize: 100 }),
  });

  const warehouses = warehousesData?.data?.items || warehousesData?.items || [];

  useEffect(() => {
    const raw = settingsData?.data || settingsData;
    if (raw && typeof raw === "object") {
      setFormData({
        virtual_Warehouse_Id: raw.virtual_Warehouse_Id || "",
        default_Reorder_Limit: raw.default_Reorder_Limit ?? 10,
        barcode_Type: raw.barcode_Type || "Code128",
        prevent_Sales_When_Stock_Depleted: Boolean(raw.prevent_Sales_When_Stock_Depleted),
        enable_Automatic_Periodic_Inventory: Boolean(raw.enable_Automatic_Periodic_Inventory),
        enable_Batch_Tracking: Boolean(raw.enable_Batch_Tracking),
        enable_Expiry_Tracking: Boolean(raw.enable_Expiry_Tracking),
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateInventorySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getInventorySettings"]);
      toast.success("Inventory settings saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save inventory settings:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save inventory settings!"
      );
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      default_Reorder_Limit: Number(formData.default_Reorder_Limit) || 0,
      virtual_Warehouse_Id: formData.virtual_Warehouse_Id || null,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-primary bg-primary/10">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Inventory & Warehouses</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Virtual warehouses, barcode types, and reorder limits
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || saveMutation.isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {saveMutation.isPending || saveMutation.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground">
            Inventory & Warehouse Policies
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Virtual / Default Warehouse
            </Label>
            <Select
              value={formData.virtual_Warehouse_Id}
              onValueChange={(val) => handleChange("virtual_Warehouse_Id", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name_Warehouse || w.name} ({w.warehouse_Code || w.code || "WH"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Default Reorder Limit (الحد الأدنى للطلب)
            </Label>
            <Input
              type="number"
              value={formData.default_Reorder_Limit}
              onChange={(e) => handleChange("default_Reorder_Limit", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Default Barcode Type
            </Label>
            <Select
              value={formData.barcode_Type}
              onValueChange={(val) => handleChange("barcode_Type", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Barcode Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Code128">Code 128 (Standard)</SelectItem>
                <SelectItem value="EAN13">EAN-13 (Retail)</SelectItem>
                <SelectItem value="QR">QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Prevent sales when stock is depleted
              </p>
              <p className="text-xs text-muted-foreground">
                Disallows negative inventory levels on sales invoices
              </p>
            </div>
            <Switch
              checked={formData.prevent_Sales_When_Stock_Depleted}
              onCheckedChange={(val) => handleChange("prevent_Sales_When_Stock_Depleted", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Enable automatic periodic inventory
              </p>
              <p className="text-xs text-muted-foreground">
                Generates scheduled inventory count sheets periodically
              </p>
            </div>
            <Switch
              checked={formData.enable_Automatic_Periodic_Inventory}
              onCheckedChange={(val) => handleChange("enable_Automatic_Periodic_Inventory", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Enable batch tracking
              </p>
              <p className="text-xs text-muted-foreground">
                Tracks materials and products by production batch numbers
              </p>
            </div>
            <Switch
              checked={formData.enable_Batch_Tracking}
              onCheckedChange={(val) => handleChange("enable_Batch_Tracking", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Enable expiry date tracking
              </p>
              <p className="text-xs text-muted-foreground">
                Requires specifying expiry dates on items receipt and sale
              </p>
            </div>
            <Switch
              checked={formData.enable_Expiry_Tracking}
              onCheckedChange={(val) => handleChange("enable_Expiry_Tracking", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
