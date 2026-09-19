import React from "react";
import { ArrowRightLeft } from "lucide-react";

export function AccountMovementTab() {
  return (
    <div className="bg-card border rounded-xl p-12 text-center shadow-sm">
      <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-foreground mb-2">Account Movement</h3>
      <p className="text-muted-foreground">This feature is coming soon.</p>
    </div>
  );
}
