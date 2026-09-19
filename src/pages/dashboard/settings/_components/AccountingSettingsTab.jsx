import { FileCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountingSettingsTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <FileCog className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Accounting Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Chart of accounts, costing methods, posting</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground">Accounting Settings</h4>
          <p className="text-sm text-muted-foreground mt-1">Accounting policies adopted in the system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Inventory Valuation Method</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Inventory valuation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                <SelectItem value="average">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Entitlement Basis</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Entitlement Basis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accrual">Accrual Basis</SelectItem>
                <SelectItem value="cash">Cash Basis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Default Sales Account</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select default sales account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Revenue</SelectItem>
                <SelectItem value="other">Other Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Default Purchase Account</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select default purchase account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchases">Purchases</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Accounts Receivable Account</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Accounts Receivable Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">Accounts Receivable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Accounts Payable Account</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Accounts Payable Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ap">Accounts Payable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Setting 1 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Automatic posting of restrictions</Label>
              <p className="text-sm text-muted-foreground">Transfer restrictions immediately upon saving</p>
            </div>
            <Switch />
          </div>

          {/* Setting 2 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Cost center requirement for each constraint</Label>
            </div>
            <Switch />
          </div>

          {/* Setting 3 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Restrictions approved before deportation</Label>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
