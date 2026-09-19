import { Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FiscalYearTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Fiscal Year</h3>
            <p className="text-sm text-muted-foreground mt-1">Preparing accounting periods and closing</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground">Fiscal year and periods</h4>
          <p className="text-sm text-muted-foreground mt-1">Preparing the beginning and end of the fiscal year and closings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Beginning of the fiscal year</Label>
            <div className="relative">
              <Input type="text" defaultValue="13 May 2024" className="pr-10 h-11" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">End of fiscal year</Label>
            <div className="relative">
              <Input type="text" defaultValue="13 May 2024" className="pr-10 h-11" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Type of periods</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Type of periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Last closing date</Label>
            <div className="relative">
              <Input type="text" defaultValue="13 May 2024" className="pr-10 h-11" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Setting 1 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Prevent modification of closed periods</Label>
              <p className="text-sm text-muted-foreground">Adding restrictions is not allowed during periods that have been closed</p>
            </div>
            <Switch />
          </div>

          {/* Setting 2 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Monthly automatic shutdown</Label>
              <p className="text-sm text-muted-foreground">The month closes automatically on the 10th day of the following month</p>
            </div>
            <Switch />
          </div>

          {/* Setting 3 */}
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Allowing retroactive restrictions</Label>
              <p className="text-sm text-muted-foreground">Ability to add restrictions with previous dates</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
