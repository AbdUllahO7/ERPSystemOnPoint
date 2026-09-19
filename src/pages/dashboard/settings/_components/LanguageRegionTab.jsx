import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageRegionTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Language & Region</h3>
            <p className="text-sm text-muted-foreground mt-1">Language, date, calendar, time</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-6">Language and region</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Default Language</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select default language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">System direction</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select System direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Calendar</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Gregorian/Hijri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gregorian">Gregorian</SelectItem>
                <SelectItem value="hijri">Hijri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Time zone</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmt">GMT</SelectItem>
                <SelectItem value="ast">Arabia Standard Time (AST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Date format</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Number Formula</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="1234,5.6" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comma">1234,5.6</SelectItem>
                <SelectItem value="dot">1234.56</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
