import { Box } from "lucide-react";
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

export default function InventoryWarehousesTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Inventory & Warehouses</h3>
            <p className="text-sm text-muted-foreground mt-1">Evaluation methods, minimum, inventory</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground">Inventory and warehouse settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Virtual Warehouse</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Virtual Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Warehouse</SelectItem>
                <SelectItem value="virtual1">Virtual Warehouse 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Cost calculation method</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Cost calculation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">FIFO</SelectItem>
                <SelectItem value="lifo">LIFO</SelectItem>
                <SelectItem value="average">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Reorder limit (default)</Label>
            <Input type="number" defaultValue="0" className="h-11 bg-transparent" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">barcode system</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="barcode system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system1">System 1</SelectItem>
                <SelectItem value="system2">System 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Setting 1 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Sale prohibited when stocks are depleted</Label>
            </div>
            <Switch />
          </div>

          {/* Setting 2 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Automatic periodic inventory</Label>
              <p className="text-sm text-muted-foreground">Alert when the periodic inventory date is approaching</p>
            </div>
            <Switch />
          </div>

          {/* Setting 3 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Tracking batch numbers (Batch/Serial)</Label>
            </div>
            <Switch />
          </div>

          {/* Setting 4 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Expiration Date Management</Label>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
