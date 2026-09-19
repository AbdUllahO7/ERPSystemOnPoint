import { Phone, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FollowUpsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Follow-Up Log</h3>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {/* Scheduled Follow-Up */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">A phone call to agree on the project</div>
              <div className="text-sm text-muted-foreground mt-1">Call • 23/7/2025 • 23:07 PM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border border-emerald-200 text-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors">
              <Check className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-blue-50 text-blue-500 text-sm font-semibold rounded-lg ml-2">
              Scheduled
            </span>
          </div>
        </div>

        {/* Completed Follow-Up */}
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground">A phone call to agree on the project</div>
                <div className="text-sm text-muted-foreground mt-1">Call • 23/7/2025 • 23:07 PM</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-sm font-semibold rounded-lg">
              Completed
            </span>
          </div>
          <div className="pl-16">
            <h4 className="text-sm font-bold text-foreground">Notes</h4>
            <p className="text-sm text-muted-foreground mt-1">Here we write all notes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
